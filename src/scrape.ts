/**
 * Scraper: jedan prolaz kroz izvore.
 *   node --experimental-strip-types src/scrape.ts           (jedan prolaz; Scheduled Task – svaki izvor se čita kad mu istekne `everyMin`)
 *   node --experimental-strip-types src/scrape.ts --force   (svi izvori odmah; dugme „Skeniraj sad“ i prvi prolaz posle instalacije)
 *   node --experimental-strip-types src/scrape.ts --only himalayas,linkedin
 *   node --experimental-strip-types src/scrape.ts --loop    (petlja svakih CONFIG.intervalMin)
 *
 * Baseline: prvi prolaz uzima oglase objavljene u poslednjih `lookbackDays` (config.json) i pamti taj datum u db.json (baselineAt);
 * posle toga se pokazuje samo ono što je novo od tada. Oglasi bez datuma prolaze (računa se kad smo ih prvi put videli).
 *
 * Novi oglas = nije viđen ranije + nije blokirana firma + ocena (rules.json) nije tvrdo odbila + skor ≥ minScore
 *              + nije duplikat (ista firma + sličan naslov) oglasa koji je već u bazi (duplikat postaje link „Isti oglas i na“).
 * Jedan pokvaren izvor ne ruši prolaz: greška se upiše u db.sources.<izvor> i ide se dalje.
 */
import { appendFileSync, existsSync, rmSync, statSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { CONFIG, LOCK_FILE, NEW_LOG, NTFY_TOPIC } from "./config.ts";
import { companyBlocked, DedupIndex } from "./dedup.ts";
import { sleep } from "./http.ts";
import { fmtSalary, salaryEurMonth } from "./salary.ts";
import { hideReason, scoreJob } from "./score.ts";
import * as himalayas from "./sources/himalayas.ts";
import * as jobicy from "./sources/jobicy.ts";
import * as jobrack from "./sources/jobrack.ts";
import * as linkedin from "./sources/linkedin.ts";
import * as remoteok from "./sources/remoteok.ts";
import * as remotive from "./sources/remotive.ts";
import * as wellfound from "./sources/wellfound.ts";
import * as workingnomads from "./sources/workingnomads.ts";
import * as wwr from "./sources/wwr.ts";
import { loadDb, loadSeen, log, logFiltered, saveDb, saveSeen, toStored, ts } from "./store.ts";
import type { Job, SearchCtx, Source, SourceState, StoredJob } from "./types.ts";

const { values: args } = parseArgs({
  options: { force: { type: "boolean", default: false }, loop: { type: "boolean", default: false }, only: { type: "string" } },
});

const SOURCES: Array<{ name: Source; search: (ctx: SearchCtx) => Promise<Job[]> }> = [
  { name: "himalayas", search: himalayas.search },
  { name: "wwr", search: wwr.search },
  { name: "remoteok", search: remoteok.search },
  { name: "workingnomads", search: workingnomads.search },
  { name: "jobrack", search: jobrack.search },
  { name: "jobicy", search: jobicy.search },
  { name: "remotive", search: remotive.search },
  { name: "linkedin", search: linkedin.search },
  { name: "wellfound", search: wellfound.search },
];

const ONLY = args.only ? new Set(args.only.split(",").map((s) => s.trim()).filter(Boolean)) : null;

/** Task se pali na svakih intervalMin, pa 2 min tolerancije da izvor sa istim periodom ne preskoči svaki drugi put. */
function isDue(lastFetched: string | undefined, everyMin: number): boolean {
  if (!lastFetched) return true;
  return Date.now() - new Date(lastFetched).getTime() >= (everyMin - 2) * 60_000;
}

/** Kartica bez plate dobija platu iz `from` (isti oglas ponovo pročitan ili duplikat sa drugog sajta). */
function adoptSalary(card: StoredJob, from: Job): boolean {
  const text = fmtSalary(from.salary);
  if (card.salaryText || !text) return false;
  card.salary = from.salary; card.salaryText = text; card.salaryEurMonth = salaryEurMonth(from.salary);
  return true;
}

/** Link ka sajtu poslodavca ima prednost nad agregatorom: ako duplikat ima „bolji“ url, kartica ga preuzima. */
function adoptEmployerUrl(card: StoredJob, from: Job): boolean {
  if (!from.sourceUrl || card.sourceUrl || card.url === from.url) return false; // from.sourceUrl postoji samo kad je from.url direktan link poslodavca
  card.sourceUrl = card.url; card.url = from.url;
  return true;
}

export function fmt(j: StoredJob): string {
  return `[${j.source}] ${j.score} ${j.title} — ${j.company || "?"}${j.salaryText ? ` | ${j.salaryText}` : ""} | ${j.locations.slice(0, 3).join(", ") || "remote"}`;
}

async function notify(fresh: StoredJob[]): Promise<void> {
  if (!NTFY_TOPIC) return;
  const shown = fresh.slice(0, 10);
  let body = shown.map((j) => `${fmt(j)}\n${j.url}`).join("\n\n");
  if (fresh.length > shown.length) body += `\n\n... i još ${fresh.length - shown.length}`;
  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: "POST", headers: { "Title": `Novi poslovi: ${fresh.length}`, "Tags": "briefcase", "Priority": "default" }, body, signal: AbortSignal.timeout(15_000),
    });
    log(`ntfy (${NTFY_TOPIC}): HTTP ${res.status}`);
  } catch (e) { log(`ntfy greška: ${(e as Error).message}`); }
}

function lockActive(): boolean {
  try { return existsSync(LOCK_FILE) && Date.now() - statSync(LOCK_FILE).mtimeMs < 15 * 60_000; } catch { return false; }
}

export async function runOnce(force: boolean): Promise<void> {
  if (lockActive()) { log("Preskačem: drugi scrape je u toku (data/scrape.lock)"); return; }
  writeFileSync(LOCK_FILE, String(process.pid));
  try {
    const seen = loadSeen();
    const start = loadDb();
    const firstRun = start.lastRun === null;
    if (!start.baselineAt) {
      start.baselineAt = new Date(Date.now() - CONFIG.lookbackDays * 86_400_000).toISOString();
      saveDb(start);
      log(`Prvi prolaz: baseline = poslednjih ${CONFIG.lookbackDays} dana (od ${start.baselineAt})`);
    }
    const since = new Date(start.baselineAt);
    const known = start.jobs;
    const index = new DedupIndex(Object.values(known));
    const fresh: StoredJob[] = [];
    const summary: string[] = [];

    for (const src of SOURCES) {
      const sc = CONFIG.sources[src.name];
      if (ONLY ? !ONLY.has(src.name) : !sc?.enabled) continue;
      if (!ONLY && !force && !isDue(start.sources[src.name]?.lastFetched, sc.everyMin)) continue;

      const batch: StoredJob[] = [];
      const touched = new Map<string, StoredJob>(); // kartice iz baze kojima je promenjen lastSeen / alsoOn / plata / url
      const t0 = Date.now();
      const state: SourceState = { lastFetched: "", summary: "", ok: true, parsed: 0, accepted: 0, rejected: 0, durationSec: 0 };
      try {
        const items = await src.search({ since, isSeen: (id) => seen.has(id) || id in known, log });
        let old = 0, filtered = 0, dupes = 0, blocked = 0;
        const now = new Date().toISOString();
        for (const j of items) {
          const inDb = known[j.id];
          if (inDb) {
            inDb.lastSeen = now; touched.set(inDb.id, inDb);
            if (inDb.status !== "rejected") {
              if (inDb.source !== j.source && inDb.url !== j.url && !(inDb.alsoOn ?? []).some((a) => a.source === j.source)) inDb.alsoOn = [...(inDb.alsoOn ?? []), { id: j.id, source: j.source, url: j.url }];
              if (adoptSalary(inDb, j)) log(`plata dopunjena: ${inDb.id} -> ${inDb.salaryText}`);
            }
            continue;
          }
          if (seen.has(j.id)) continue;
          seen.set(j.id, j.postedAt);
          if (j.postedAt !== null && new Date(j.postedAt) < since) { old++; continue; }
          if (companyBlocked(j.company, [CONFIG.blockedCompanies, start.blockedCompanies])) { blocked++; logFiltered(j, "firma sakrivena"); continue; }
          const scoring = scoreJob(j);
          const why = hideReason(scoring);
          if (why) { filtered++; logFiltered(j, why, scoring); continue; }
          const match = index.find(j);
          if (match) {
            dupes++;
            if (match.status !== "rejected") {
              if (match.source !== j.source && !(match.alsoOn ?? []).some((a) => a.id === j.id)) match.alsoOn = [...(match.alsoOn ?? []), { id: j.id, source: j.source, url: j.url }];
              if (adoptSalary(match, j)) log(`plata preuzeta sa duplikata: ${match.id} -> ${match.salaryText}`);
              if (adoptEmployerUrl(match, j)) log(`link poslodavca preuzet sa duplikata: ${match.id} -> ${match.url}`);
              touched.set(match.id, match);
            }
            log(`duplikat: ${j.id} ≈ ${match.id} (${match.status})`);
            continue;
          }
          const stored = toStored(j, scoring);
          batch.push(stored);
          known[stored.id] = stored;
          index.add(stored);
        }
        state.parsed = items.length; state.accepted = batch.length; state.rejected = filtered + blocked;
        state.summary = `${src.name}: ${items.length} oglasa, ${batch.length} novih${dupes ? `, ${dupes} duplikata` : ""}${filtered ? `, ${filtered} ispod kriterijuma` : ""}${old ? `, ${old} pre baseline-a` : ""}${blocked ? `, ${blocked} sakrivena firma` : ""}`;
      } catch (e) {
        state.ok = false; state.error = (e as Error).message;
        state.summary = `${src.name}: GREŠKA (${state.error.slice(0, 80)})`;
        log(`GREŠKA ${src.name}: ${state.error}`);
      }
      state.durationSec = Math.round((Date.now() - t0) / 1000);
      state.lastFetched = new Date().toISOString();
      state.summary += ` (${state.durationSec}s)`;
      summary.push(state.summary);
      log(state.summary);

      // upis posle svakog izvora: ponovo učitaj bazu (server je možda menjao statuse) i dodaj samo promene
      const db = loadDb();
      db.baselineAt ??= start.baselineAt;
      for (const s of batch) if (!db.jobs[s.id]) db.jobs[s.id] = s;
      for (const m of touched.values()) {
        const j = db.jobs[m.id];
        if (!j) continue;
        j.lastSeen = m.lastSeen;
        if (m.alsoOn) j.alsoOn = m.alsoOn;
        if (!j.salaryText && m.salaryText) { j.salary = m.salary; j.salaryText = m.salaryText; j.salaryEurMonth = m.salaryEurMonth; }
        if (m.url !== j.url && m.sourceUrl) { j.sourceUrl = m.sourceUrl; j.url = m.url; }
      }
      db.sources[src.name] = state;
      db.lastRun = new Date().toISOString();
      db.lastRunSummary = SOURCES.map((s) => db.sources[s.name]?.summary).filter(Boolean).join(" | ");
      saveDb(db);
      saveSeen(seen);
      fresh.push(...batch);
    }

    if (summary.length === 0) { log("Nijednom izvoru još nije vreme."); return; }
    if (fresh.length > 0) {
      fresh.sort((a, b) => b.score - a.score);
      log(`NOVI OGLASI: ${fresh.length}`);
      const lines = fresh.map((j) => `${fmt(j)} | ${j.url}`);
      for (const l of lines) console.log("  " + l);
      try { appendFileSync(NEW_LOG, `\n[${ts()}] NOVI OGLASI: ${fresh.length}\n${lines.join("\n")}\n`); } catch { /* ignore */ }
      if (firstRun) log("Prvi prolaz (početno punjenje) – ntfy preskočen.");
      else await notify(fresh);
    } else log("Nema novih oglasa.");
  } finally {
    rmSync(LOCK_FILE, { force: true });
  }
}

async function main(): Promise<void> {
  log(`Start | prag ${CONFIG.minScore} | ${args.loop ? `petlja ${CONFIG.intervalMin} min` : ONLY ? `samo ${[...ONLY].join(", ")}` : args.force ? "svi izvori (--force)" : "jedan prolaz"}`);
  for (;;) {
    try { await runOnce(args.force === true); } catch (e) { log(`GREŠKA run: ${(e as Error).message}`); }
    if (!args.loop) break;
    await sleep(CONFIG.intervalMin * 60_000);
  }
}

main();
