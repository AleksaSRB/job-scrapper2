export type Source = "himalayas" | "wwr" | "remoteok" | "workingnomads" | "jobrack" | "linkedin" | "wellfound" | "jobicy" | "remotive";
export type Status = "new" | "favorite" | "applied" | "rejected";
export type SalaryPeriod = "year" | "month" | "week" | "day" | "hour";
export type RemoteType = "remote" | "hybrid" | "onsite" | "unknown";
export type EmploymentKind = "full-time" | "part-time" | "contract" | "freelance" | "temporary" | "internship";
export type MatchLevel = "excellent" | "good" | "possible" | "low";
/** Da li kandidat iz Srbije sme da konkuriše (po lokaciji/tekstu oglasa). */
export type Eligibility = "serbia" | "worldwide" | "europe" | "unclear" | "excluded";

export interface Salary {
  min: number | null;
  max: number | null;
  currency: string | null;      // ISO kod ("EUR", "USD"); null = nepoznato
  period: SalaryPeriod | null;  // null = nepoznato
  text?: string;                // sirovi tekst sa sajta
}

/** Oglas kako ga vrati parser sajta (normalizovan, još neocenjen). */
export interface Job {
  source: Source;
  id: string;                   // "<source>:<id sajta>"
  url: string;                  // najbolji link za „Otvori“ (sajt poslodavca ako je poznat, inače oglas na izvoru)
  sourceUrl?: string;           // oglas na sajtu-izvoru kad se razlikuje od url (Himalayas applicationLink, Remote OK apply_url…)
  title: string;
  company: string;              // "" = nepoznato
  companyLogo?: string;
  locations: string[];          // dozvoljene zemlje/regioni kako ih sajt navodi ("Worldwide", "Europe Only", "USA"); [] = nije navedeno
  locationVerified?: boolean;   // sajt je već filtrirao po zemlji (Himalayas country=RS, LinkedIn location=Serbia) -> dostupno iz Srbije
  remote: RemoteType;           // šta sajt kaže (flag/filter); "unknown" -> odlučuje tekst opisa
  employment: EmploymentKind[]; // samo iz polja sajta (ne iz teksta)
  seniority?: string;           // polje sajta ("Entry-level", "Senior", "Associate"…)
  yearsMin?: number | null;     // polje sajta (Wellfound yearsExperienceMin)
  timezones?: string;           // "UTC-5…+3" (Himalayas)
  salary?: Salary;
  postedAt: string | null;      // ISO (UTC); null = sajt ne daje datum
  description?: string;         // čist tekst (skraćen na DESCRIPTION_MAX)
  summary?: string;             // kratak sažetak sa sajta – inače se pravi iz opisa
  tags: string[];
}

export interface Scoring {
  score: number;
  level: MatchLevel;
  reasons: string[];            // "+40 Worldwide", "-80 senior" … (za tunovanje i <details> na kartici)
  categories: string[];         // id-jevi kategorija iz rules.json
  badges: string[];             // čipovi za karticu
  tools: string[];              // alati iz rules.json pronađeni u oglasu (HubSpot, GA4…)
  reject: string | null;        // tvrdo odbijanje (US only, hybrid, senior, 5+ godina, strani jezik…)
  eligibility: Eligibility;
  junior: boolean;              // junior / associate / coordinator / 0-2 god
  fullTime: boolean;
  remoteFinal: RemoteType;      // posle teksta opisa
}

export interface AlsoOn { id: string; source: Source; url: string }

/** Oglas u lokalnoj bazi. */
export interface StoredJob extends Job {
  status: Status;
  firstSeen: string;            // ISO – kad ga je scraper prvi put video
  lastSeen: string;             // ISO – poslednji put viđen na sajtu
  salaryText: string;           // "" = nije navedena
  salaryEurMonth: number | null;
  score: number;
  level: MatchLevel;
  reasons: string[];
  categories: string[];
  badges: string[];
  tools: string[];
  eligibility: Eligibility;
  junior: boolean;
  fullTime: boolean;
  remoteFinal: RemoteType;
  alsoOn?: AlsoOn[];            // isti oglas na drugim sajtovima
}

/** Dijagnostika izvora (poslednji prolaz). */
export interface SourceState {
  lastFetched: string;          // ISO
  summary: string;
  ok: boolean;
  error?: string;
  parsed: number;
  accepted: number;
  rejected: number;
  durationSec: number;
}

export interface Db {
  baselineAt: string | null;    // od kog datuma se oglasi uzimaju (prvi run: sada − lookbackDays)
  lastRun: string | null;
  lastRunSummary: string;
  sources: Record<string, SourceState>;
  blockedCompanies: string[];
  jobs: Record<string, StoredJob>;
}

export interface SourceConfig { enabled: boolean; everyMin: number }

export interface Config {
  port: number;
  lookbackDays: number;
  intervalMin: number;
  minScore: number;
  ntfyTopic: string;
  sources: Record<Source, SourceConfig>;
  himalayas: { country: string; maxPages: number; queries: string[] };
  wwr: { feeds: string[] };
  remoteok: { tags: string[] };
  workingnomads: { categories: string[] };
  jobrack: { categories: string[]; maxPages: number; listPages: number; maxDetails: number };
  linkedin: { serbia: { location: string; maxPages: number; queries: string[] }; europe: { location: string; maxPages: number; queries: string[] }; maxDetails: number };
  wellfound: { maxPages: number; paths: string[] };
  jobicy: { industries: string[]; count: number };
  blockedCompanies: string[];
  fx: Record<string, number>;
}

/** Pravila ocenjivanja (rules.json). */
export interface RuleGroup { label: string; score: number; patterns: string[] }
export interface Rules {
  thresholds: { excellent: number; good: number; possible: number };
  categories: Array<{ id: string; label: string; weight: number; patterns: string[]; titleOnly?: boolean }>;
  categoryDescriptionFactor: number;
  seniority: {
    juniorTitle: string[]; juniorTitleScore: number;
    juniorText: string[]; juniorTextScore: number;
    managerTitle: string[]; managerTitleScore: number;
    seniorTitle: string[]; seniorTitleScore: number;
    siteEntryScore: number; siteSeniorScore: number;
    years: { zeroToTwoScore: number; threeToFourScore: number; fivePlusScore: number };
  };
  remote: { remoteText: string[]; hybridText: string[]; onsiteText: string[]; remoteScore: number; hybridScore: number; onsiteScore: number; unknownScore: number };
  eligibility: {
    serbia: string[]; serbiaScore: number;
    worldwide: string[]; worldwideScore: number;
    europe: string[]; europeScore: number;
    otherRegion: string[];
    excludeText: string[]; excludeScore: number;
    unclearScore: number;
  };
  employment: {
    fullTimeText: string[]; fullTimeScore: number;
    partTimeText: string[]; partTimeScore: number;
    contractScore: number; freelanceScore: number; internshipScore: number;
    unpaid: string[]; unpaidScore: number;
    commissionOnly: string[]; commissionOnlyScore: number;
  };
  language: { foreignLanguages: string; requiredPatterns: string[]; exceptions: string[]; score: number; englishOnlyScore: number };
  timezone: { positive: string[]; positiveScore: number; negative: string[]; negativeScore: number };
  negatives: { title: RuleGroup[]; text: RuleGroup[] };
  positives: Array<{ id: string; label: string; score: number; patterns: string[]; badge?: string }>;
  tools: Array<{ label: string; patterns: string[] }>;
  toolScore: number;
  toolScoreMax: number;
}

/** Šta scrape.ts prosleđuje parseru. */
export interface SearchCtx {
  since: Date;
  isSeen: (id: string) => boolean;
  log: (msg: string) => void;
}
