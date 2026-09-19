import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Config, Rules } from "./types.ts";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/** DETE_JOBS_DATA_DIR: privremena baza za probu bez diranja prave data/. */
export const DATA_DIR = process.env.DETE_JOBS_DATA_DIR || join(ROOT, "data");
export const DB_FILE = join(DATA_DIR, "db.json");
export const SEEN_FILE = join(DATA_DIR, "seen.json");
export const LOCK_FILE = join(DATA_DIR, "scrape.lock");
export const RUN_LOG = join(DATA_DIR, "scraper.log");
export const NEW_LOG = join(DATA_DIR, "new_jobs.log");
export const FILTERED_LOG = join(DATA_DIR, "filtered.log");
export const PUBLIC_DIR = join(ROOT, "public");
export const CONFIG_FILE = join(ROOT, "config.json");
export const RULES_FILE = join(ROOT, "rules.json");

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const DEFAULTS: Config = {
  port: 3009,
  lookbackDays: 5,
  intervalMin: 15,
  minScore: 75,
  ntfyTopic: "",
  sources: {
    himalayas: { enabled: true, everyMin: 15 },
    wwr: { enabled: true, everyMin: 30 },
    remoteok: { enabled: true, everyMin: 60 },
    workingnomads: { enabled: true, everyMin: 60 },
    jobrack: { enabled: true, everyMin: 30 },
    linkedin: { enabled: true, everyMin: 60 },
    wellfound: { enabled: true, everyMin: 360 },
    jobicy: { enabled: true, everyMin: 60 },
    remotive: { enabled: true, everyMin: 360 },
  },
  himalayas: { country: "RS", maxPages: 2, queries: ["marketing coordinator", "sales development representative"] },
  wwr: { feeds: ["remote-sales-and-marketing-jobs", "remote-customer-support-jobs"] },
  remoteok: { tags: ["marketing", "sales"] },
  workingnomads: { categories: ["Marketing", "Sales", "Customer Success"] },
  jobrack: { categories: ["sales-marketing", "support"], maxPages: 1, listPages: 2, maxDetails: 20 },
  linkedin: { serbia: { location: "Serbia", maxPages: 1, queries: ["marketing"] }, europe: { location: "European Union", maxPages: 1, queries: [] }, maxDetails: 30 },
  wellfound: { maxPages: 2, paths: ["/role/r/social-media-manager"] },
  jobicy: { industries: ["marketing", "business"], count: 50 },
  blockedCompanies: [],
  fx: { EUR: 1, USD: 0.88, GBP: 1.16, RSD: 0.0085 },
};

function loadConfig(): Config {
  let user: Partial<Config> = {};
  try { user = JSON.parse(readFileSync(CONFIG_FILE, "utf8")); } catch { /* koristi default */ }
  const merge = <K extends keyof Config>(k: K): Config[K] => ({ ...(DEFAULTS[k] as object), ...((user[k] ?? {}) as object) }) as Config[K];
  return {
    ...DEFAULTS, ...user,
    port: Number(process.env.DETE_JOBS_PORT) || user.port || DEFAULTS.port,
    sources: merge("sources"), himalayas: merge("himalayas"), wwr: merge("wwr"), remoteok: merge("remoteok"), workingnomads: merge("workingnomads"),
    jobrack: merge("jobrack"), linkedin: merge("linkedin"), wellfound: merge("wellfound"), jobicy: merge("jobicy"),
    fx: merge("fx"),
  };
}

function loadRules(): Rules {
  try { return JSON.parse(readFileSync(RULES_FILE, "utf8")) as Rules; } catch (e) { throw new Error(`rules.json: ${(e as Error).message}`); }
}

export const CONFIG: Config = loadConfig();
export const RULES: Rules = loadRules();
export const NTFY_TOPIC: string = process.env.NTFY_TOPIC || CONFIG.ntfyTopic || "";
