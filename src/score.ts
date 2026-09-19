/**
 * Ocena oglasa po pravilima iz rules.json (docs/brief.md §3–§14). Rezultat: skor, nivo, razlozi, čipovi, alati, tvrdo odbijanje.
 * Sve se radi nad tekstom u malim slovima bez dijakritika (text.ts fold). Naslov nosi punu težinu, opis manju.
 *
 * Tvrdo odbijanje (oglas se ne prikazuje bez obzira na skor): Srbija isključena lokacijom, hibrid/onsite, senior/lead/head/director,
 * 5+ godina obavezno, strani jezik obavezan, neplaćeno, samo provizija, IT/dizajn/finansije/medicina u naslovu, MLM.
 */
import { CONFIG, RULES } from "./config.ts";
import { compile, fold, latinize, sentenceAround } from "./text.ts";
import type { Eligibility, Job, MatchLevel, RemoteType, Scoring } from "./types.ts";

const S = RULES.seniority, R = RULES.remote, EL = RULES.eligibility, E = RULES.employment, L = RULES.language, TZ = RULES.timezone;

const CATS = RULES.categories.map((c) => ({ ...c, re: compile(c.patterns, `categories.${c.id}`) }));
const JUNIOR_TITLE = compile(S.juniorTitle, "seniority.juniorTitle");
const JUNIOR_TEXT = compile(S.juniorText, "seniority.juniorText");
const MANAGER_TITLE = compile(S.managerTitle, "seniority.managerTitle");
const SENIOR_TITLE = compile(S.seniorTitle, "seniority.seniorTitle");
const REMOTE_TXT = compile(R.remoteText, "remote.remoteText");
const HYBRID_TXT = compile(R.hybridText, "remote.hybridText");
const ONSITE_TXT = compile(R.onsiteText, "remote.onsiteText");
const EL_SERBIA = compile(EL.serbia, "eligibility.serbia");
const EL_WORLD = compile(EL.worldwide, "eligibility.worldwide");
const EL_EUROPE = compile(EL.europe, "eligibility.europe");
const EL_OTHER = compile(EL.otherRegion, "eligibility.otherRegion");
const EL_EXCLUDE = EL.excludeText.map((p) => new RegExp(p, "gi"));
const FULL_TXT = compile(E.fullTimeText, "employment.fullTimeText");
const PART_TXT = compile(E.partTimeText, "employment.partTimeText");
const UNPAID = compile(E.unpaid, "employment.unpaid");
const COMMISSION = compile(E.commissionOnly, "employment.commissionOnly");
const LANG_REQ = L.requiredPatterns.map((p) => new RegExp(p.replace(/LANG/g, L.foreignLanguages), "gi"));
const LANG_EXC = compile(L.exceptions, "language.exceptions");
/** Jezik u naslovu ("Marketing Coordinator (German)", "QA Rater - Spanish") = obavezan, osim kad je naslov samo na engleskom sa "english". */
const LANG_TITLE = new RegExp(`\\b(${L.foreignLanguages})\\b`, "i");
const TZ_POS = compile(TZ.positive, "timezone.positive");
const TZ_NEG = compile(TZ.negative, "timezone.negative");
const NEG_TITLE = RULES.negatives.title.map((g) => ({ ...g, re: compile(g.patterns, `negatives.title.${g.label}`) }));
const NEG_TEXT = RULES.negatives.text.map((g) => ({ ...g, re: compile(g.patterns, `negatives.text.${g.label}`) }));
const POS = RULES.positives.map((g) => ({ ...g, re: compile(g.patterns, `positives.${g.id}`) }));
const TOOLS = RULES.tools.map((t) => ({ ...t, re: compile(t.patterns, `tools.${t.label}`) }));

const firstMatch = (res: RegExp[], text: string): RegExpMatchArray | null => { for (const r of res) { const m = text.match(r); if (m) return m; } return null; };
const quote = (s: string) => `«${s.trim().replace(/\s+/g, " ").slice(0, 60)}»`;
const sign = (n: number) => (n >= 0 ? `+${n}` : String(n));

export function levelOf(score: number): MatchLevel {
  const t = RULES.thresholds;
  return score >= t.excellent ? "excellent" : score >= t.good ? "good" : score >= t.possible ? "possible" : "low";
}

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(RULES.categories.map((c) => [c.id, c.label]));

/** Naslov pogađa bar jednu kategoriju i nijedan tvrdi negativ – parseri po tome biraju za koje (neviđene) oglase vredi skidati detalj. */
export function worthDetail(title: string): boolean {
  const t = fold(latinize(title));
  if (NEG_TITLE.some((g) => g.score <= -100 && g.re.some((r) => r.test(t)))) return false;
  if (SENIOR_TITLE.some((r) => r.test(t))) return false;
  return CATS.some((c) => c.re.some((r) => r.test(t)));
}

// ---------------------------------------------------------------- godine iskustva

const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10 };
const NUM = String.raw`(\d{1,2}|one|two|three|four|five|six|seven|eight|ten)`;
const YEARS_RE = [
  // "3+ years of experience", "2-4 years' experience in marketing", "minimum of 5 years experience"
  new RegExp(String.raw`\b${NUM}\s*(?:\+|plus)?\s*(?:-|–|to)?\s*(?:${NUM})?\s*\+?\s*(?:years?|yrs?)(?:'|’)?\s*(?:of\s+)?(?:\w+[- ]){0,4}?(?:experience|exp\b|background|track record)`, "gi"),
  // "experience: 3+ years", "experienced (2+ years)"
  new RegExp(String.raw`\b(?:experience|experienced)\b[^.\n:]{0,30}?[:(]?\s*${NUM}\s*(?:\+|plus)?\s*(?:-|–|to)?\s*(?:${NUM})?\s*\+?\s*(?:years?|yrs?)`, "gi"),
];
const YEARS_SKIP_BEFORE = /\b(we|our|company|team|clients?|founded|business|industry|market|agency|brand|history|over the (last|past)|for the (last|past)|in the (last|past)|with (over|more than))\b[^.\n]{0,25}$/;
const YEARS_SKIP_AFTER = /^[^.\n]{0,20}\b(in business|in the (market|industry)|of history|of operation|of success|of growth|old)\b/;
const toNum = (s: string | undefined): number | null => (s === undefined ? null : /^\d+$/.test(s) ? Number(s) : WORD_NUM[s] ?? null);

/** Traženi minimum godina iskustva iz teksta (najstroži zahtev), ili null ako se ne pominje. */
export function yearsRequired(text: string): number | null {
  let best: number | null = null;
  for (const re of YEARS_RE) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const lo = toNum(m[1]);
      if (lo === null || lo > 15) continue;
      const idx = m.index ?? 0;
      if (YEARS_SKIP_BEFORE.test(text.slice(Math.max(0, idx - 40), idx))) continue;
      if (YEARS_SKIP_AFTER.test(text.slice(idx + m[0].length, idx + m[0].length + 40))) continue;
      if (best === null || lo > best) best = lo;
    }
  }
  return best;
}

// ---------------------------------------------------------------- lokacija

type LocClass = "serbia" | "worldwide" | "europe" | "other" | "generic";

function classifyLocation(loc: string): LocClass {
  const l = fold(loc);
  if (EL_SERBIA.some((r) => r.test(l))) return "serbia";
  if (EL_WORLD.some((r) => r.test(l))) return "worldwide";
  if (EL_EUROPE.some((r) => r.test(l))) return "europe";
  if (EL_OTHER.some((r) => r.test(l))) return "other";
  return "generic"; // "Remote", "" i slično
}

// ---------------------------------------------------------------- ocena

export function scoreJob(job: Job): Scoring {
  const title = fold(latinize(job.title));
  const body = fold(latinize(`${job.description ?? ""}\n${job.summary ?? ""}\n${job.tags.join(" ")}`));
  const text = `${title}\n${body}`;
  const reasons: string[] = [];
  const badges: string[] = [];
  let score = 0;
  let reject: string | null = null;
  const add = (n: number, why: string) => { score += n; reasons.push(`${sign(n)} ${why}`); };
  const hardReject = (why: string) => { if (!reject) reject = why; reasons.push(`✕ ${why}`); };

  // ---- kategorije (naslov = puna težina, samo opis = categoryDescriptionFactor)
  const cats: Array<{ id: string; label: string; pts: number; inTitle: boolean }> = [];
  for (const c of CATS) {
    if (c.re.some((r) => r.test(title))) cats.push({ id: c.id, label: c.label, pts: c.weight, inTitle: true });
    else if (!c.titleOnly && c.re.some((r) => r.test(body))) cats.push({ id: c.id, label: c.label, pts: Math.round(c.weight * RULES.categoryDescriptionFactor), inTitle: false });
  }
  cats.sort((a, b) => b.pts - a.pts || Number(b.inTitle) - Number(a.inTitle));
  if (cats.length === 0) hardReject("nijedna ciljana kategorija (marketing / prodaja / customer success / operacije …)");
  else {
    add(cats[0].pts, `${cats[0].label}${cats[0].inTitle ? " (naslov)" : " (samo opis)"}`);
    const more = cats.slice(1).filter((c) => c.inTitle);
    if (more.length) add(Math.min(10, 5 * more.length), `još u naslovu: ${more.slice(0, 3).map((c) => c.label).join(", ")}`);
    if (!cats[0].inTitle) add(-10, "kategorija nije u naslovu");
  }

  // ---- negativi u naslovu (developer, dizajner, računovođa, MLM …)
  for (const g of NEG_TITLE) {
    const m = firstMatch(g.re, title);
    if (!m) continue;
    add(g.score, `${g.label} ${quote(m[0])}`);
    if (g.score <= -100) hardReject(`${g.label}: ${quote(m[0])}`);
  }

  // ---- seniornost
  let junior = false;
  const sen = firstMatch(SENIOR_TITLE, title);
  if (sen) { add(S.seniorTitleScore, `senior naslov ${quote(sen[0])}`); hardReject(`senior/lead/head: ${quote(sen[0])}`); }
  else {
    const jr = firstMatch(JUNIOR_TITLE, title);
    if (jr) { add(S.juniorTitleScore, `junior/associate naslov ${quote(jr[0])}`); junior = true; }
    const mg = firstMatch(MANAGER_TITLE, title);
    if (mg && !jr) { add(S.managerTitleScore, `manager u naslovu ${quote(mg[0])} – proveri opis`); badges.push("Manager?"); }
  }
  const siteSen = fold(job.seniority ?? "");
  if (siteSen) {
    if (/entry|junior|associate|intern/.test(siteSen)) { add(S.siteEntryScore, `sajt: ${job.seniority}`); junior = true; }
    else if (/senior|lead|director|executive|vp|head|principal/.test(siteSen)) { add(S.siteSeniorScore, `sajt: ${job.seniority}`); badges.push("Senior (sajt)"); }
  }
  let years = yearsRequired(body);
  if (job.yearsMin != null && (years === null || job.yearsMin > years)) years = job.yearsMin;
  if (years !== null) {
    if (years <= 2) { add(S.years.zeroToTwoScore, `traži se ${years}${years === 0 ? "" : "+"} god iskustva`); junior = true; badges.push(`${years}+ god`); }
    else if (years <= 4) { add(S.years.threeToFourScore, `traži se ${years}+ god iskustva`); badges.push(`${years}+ god`); }
    else { add(S.years.fivePlusScore, `traži se ${years}+ god iskustva`); hardReject(`${years}+ godina iskustva obavezno`); }
  } else {
    const jt = firstMatch(JUNIOR_TEXT, body);
    if (jt) { add(S.juniorTextScore, `junior u opisu ${quote(jt[0])}`); junior = true; }
  }
  if (junior) badges.push("Junior/Associate");

  // ---- remote / hibrid / onsite
  let remoteFinal: RemoteType = job.remote;
  const hybridHit = (res: RegExp[]) => {
    for (const r of res) {
      for (const m of body.matchAll(new RegExp(r.source, "gi"))) {
        const sentence = sentenceAround(body, m.index ?? 0);
        if (/\b(no|not|never|without|fully remote|100% remote|remote[- ]first|optional|not required|no need|instead of|rather than|is not|isn't)\b/.test(sentence)) continue;
        return m;
      }
    }
    return null;
  };
  if (job.remote === "hybrid") { add(R.hybridScore, "hibrid (polje sajta)"); hardReject("hibrid"); }
  else if (job.remote === "onsite") { add(R.onsiteScore, "rad iz kancelarije (polje sajta)"); hardReject("onsite"); }
  else {
    const h = hybridHit(HYBRID_TXT) ?? hybridHit(ONSITE_TXT);
    if (job.remote === "remote") {
      add(R.remoteScore, "remote (polje/filter sajta)"); badges.push("Remote");
      if (h) { add(-50, `ali opis pominje kancelariju ${quote(h[0])}`); badges.push("Hibrid?"); }
    } else if (h) { add(R.hybridScore, `hibrid/onsite u opisu ${quote(h[0])}`); hardReject(`hibrid/onsite: ${quote(h[0])}`); remoteFinal = "hybrid"; }
    else {
      const r = firstMatch(REMOTE_TXT, text);
      if (r) { add(R.remoteScore, `remote ${quote(r[0])}`); badges.push("Remote"); remoteFinal = "remote"; }
      else add(R.unknownScore, "nejasno da li je remote");
    }
  }

  // ---- dostupnost iz Srbije
  let eligibility: Eligibility = "unclear";
  const locText = job.locations.join(" | ");
  const classes = job.locations.map(classifyLocation);
  let exclHit: RegExpMatchArray | null = null;
  outer: for (const re of EL_EXCLUDE) {
    re.lastIndex = 0;
    for (const m of body.matchAll(re)) {
      const sentence = sentenceAround(body, m.index ?? 0);
      if (/\b(serbia|balkan|worldwide|anywhere|globally|europe|emea|or (other|any) countr|international)\b/.test(sentence)) continue;
      exclHit = m; break outer;
    }
  }
  if (exclHit) { eligibility = "excluded"; add(EL.excludeScore, `opis isključuje Srbiju ${quote(exclHit[0])}`); hardReject(`Srbija nije dostupna: ${quote(exclHit[0])}`); }
  else if (job.locationVerified) { eligibility = "serbia"; add(EL.serbiaScore, "sajt već filtrira: dostupno iz Srbije"); }
  else if (classes.includes("serbia")) { eligibility = "serbia"; add(EL.serbiaScore, `lokacija ${quote(job.locations[classes.indexOf("serbia")])}`); }
  else if (classes.includes("worldwide")) { eligibility = "worldwide"; add(EL.worldwideScore, `lokacija ${quote(job.locations[classes.indexOf("worldwide")])}`); }
  else if (classes.includes("europe")) { eligibility = "europe"; add(EL.europeScore, `lokacija ${quote(job.locations[classes.indexOf("europe")])} – proveri da li Srbija ulazi`); }
  else if (classes.includes("other")) { eligibility = "excluded"; add(EL.excludeScore, `lokacija ${quote(locText)}`); hardReject(`lokacija ne uključuje Srbiju: ${quote(locText)}`); }
  else {
    const s = firstMatch(EL_SERBIA, body), w = firstMatch(EL_WORLD, body), e = firstMatch(EL_EUROPE, body);
    if (s) { eligibility = "serbia"; add(EL.serbiaScore, `opis: ${quote(s[0])}`); }
    else if (w) { eligibility = "worldwide"; add(EL.worldwideScore, `opis: ${quote(w[0])}`); }
    else if (e) { eligibility = "europe"; add(EL.europeScore, `opis: ${quote(e[0])} – proveri da li Srbija ulazi`); }
    else add(EL.unclearScore, "lokacija/dostupnost nije navedena");
  }

  // ---- vrsta zaposlenja
  let fullTime = false;
  const emp = job.employment;
  const ptTitle = firstMatch(PART_TXT, title);
  if (emp.includes("part-time") || ptTitle) { add(E.partTimeScore, ptTitle ? `part-time u naslovu ${quote(ptTitle[0])}` : "part-time (polje sajta)"); badges.push("Part-time"); }
  else if (emp.includes("internship")) { add(E.internshipScore, "praksa (polje sajta)"); badges.push("Praksa"); }
  else if (emp.includes("full-time")) { add(E.fullTimeScore, "full-time (polje sajta)"); badges.push("Full-time"); fullTime = true; }
  else if (emp.includes("contract")) { add(E.contractScore, "ugovor (polje sajta)"); badges.push("Ugovor"); fullTime = !firstMatch(PART_TXT, text); }
  else if (emp.includes("freelance")) { add(E.freelanceScore, "freelance (polje sajta)"); badges.push("Freelance"); }
  else if (emp.includes("temporary")) { add(-20, "privremeno (polje sajta)"); badges.push("Privremeno"); }
  else {
    const pt = firstMatch(PART_TXT, text);
    const ft = firstMatch(FULL_TXT, text);
    if (/\bintern(ship)?\b|\btrainee\b/.test(title)) { add(E.internshipScore, "praksa (naslov)"); badges.push("Praksa"); }
    else if (pt && !ft) { add(E.partTimeScore, `part-time ${quote(pt[0])}`); badges.push("Part-time"); }
    else if (ft) { add(E.fullTimeScore, `full-time ${quote(ft[0])}`); badges.push("Full-time"); fullTime = true; }
    else add(0, "vrsta zaposlenja nije navedena");
  }
  const unpaid = firstMatch(UNPAID, text);
  if (unpaid) { add(E.unpaidScore, `neplaćeno ${quote(unpaid[0])}`); hardReject(`neplaćeno: ${quote(unpaid[0])}`); }
  const comm = firstMatch(COMMISSION, text);
  if (comm) { add(E.commissionOnlyScore, `samo provizija ${quote(comm[0])}`); hardReject(`samo provizija: ${quote(comm[0])}`); }

  // ---- jezik (engleski je normalan; drugi jezik obavezan -> odbijen)
  let langHit: string | null = title.match(LANG_TITLE)?.[0] ?? null;
  if (langHit) langHit = `${langHit} (naslov)`;
  outer2: for (const re of langHit ? [] : LANG_REQ) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const sentence = sentenceAround(text, m.index ?? 0);
      if (LANG_EXC.some((r) => r.test(sentence))) continue;
      langHit = m[0]; break outer2;
    }
  }
  if (langHit) { add(L.score, `strani jezik obavezan ${quote(langHit)}`); hardReject(`traži se strani jezik: ${quote(langHit)}`); }

  // ---- vremenska zona
  const tzp = firstMatch(TZ_POS, text);
  if (tzp) { add(TZ.positiveScore, `evropsko radno vreme ${quote(tzp[0])}`); badges.push("EU sati"); }
  const tzn = firstMatch(TZ_NEG, text);
  if (tzn) { add(TZ.negativeScore, `američko radno vreme ${quote(tzn[0])}`); badges.push("US sati"); }
  if (job.timezones) badges.push(job.timezones);

  // ---- ostali negativi u tekstu
  for (const g of NEG_TEXT) {
    const m = firstMatch(g.re, body);
    if (!m) continue;
    add(g.score, `${g.label} ${quote(m[0])}`);
    if (g.score <= -100) hardReject(`${g.label}: ${quote(m[0])}`);
  }

  // ---- pozitivi
  for (const g of POS) {
    if (g.id === "serbia-named" && (job.locationVerified || eligibility === "serbia")) continue;
    if (g.id === "english-only" && langHit) continue;
    const m = firstMatch(g.re, text);
    if (!m) continue;
    const pts = g.id === "english-only" ? L.englishOnlyScore : g.score;
    if (pts) add(pts, `${g.label} ${quote(m[0])}`);
    if (g.badge) badges.push(g.badge);
    if (g.id === "serbia-named" && eligibility === "unclear") eligibility = "serbia";
  }

  // ---- alati
  const tools = TOOLS.filter((t) => t.re.some((r) => r.test(text))).map((t) => t.label);
  if (tools.length) add(Math.min(RULES.toolScoreMax, RULES.toolScore * tools.length), `alati: ${tools.slice(0, 6).join(", ")}${tools.length > 6 ? "…" : ""}`);

  for (const c of cats.slice(0, 2)) badges.push(c.label);
  reasons.push(`= ${score}`);
  return { score, level: levelOf(score), reasons, categories: cats.map((c) => c.id), badges: [...new Set(badges)], tools, reject, eligibility, junior, fullTime, remoteFinal };
}

/** Razlog zbog kog se oglas ne prikazuje (tvrdo odbijanje ili skor ispod praga), ili null. */
export function hideReason(s: Scoring): string | null {
  if (s.reject) return s.reject;
  if (s.score < CONFIG.minScore) return `skor ${s.score} < ${CONFIG.minScore}`;
  return null;
}
