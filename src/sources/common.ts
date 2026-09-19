/** Pomoćne funkcije zajedničke za parsere sajtova. */
import type { EmploymentKind } from "../types.ts";

/** "Full Time" | "full_time" | "Contractor" | "Part-Time" | "Internship" -> vrsta zaposlenja (samo iz polja sajta). */
export function employmentOf(s: string | undefined | null): EmploymentKind[] {
  const t = (s ?? "").toLowerCase().replace(/[_-]/g, " ");
  if (!t) return [];
  if (t.includes("part")) return ["part-time"];
  if (t.includes("intern") || t.includes("trainee")) return ["internship"];
  if (t.includes("full")) return ["full-time"];
  if (t.includes("freelance")) return ["freelance"];
  if (t.includes("contract")) return ["contract"];
  if (t.includes("temp") || t.includes("seasonal")) return ["temporary"];
  return [];
}

/** "USA, Canada; Europe" -> ["USA", "Canada", "Europe"]. */
export function splitLocations(s: string | undefined | null): string[] {
  return (s ?? "").split(/[,;|/]| and /).map((x) => x.trim()).filter((x) => x && !/^remote$/i.test(x));
}

/** Link poslodavca (ATS) ima prednost nad stranicom agregatora; vraća [url, sourceUrl?]. */
export function preferEmployer(listingUrl: string, applyUrl: string | undefined | null, aggregatorHost: string): { url: string; sourceUrl?: string } {
  if (!applyUrl || !/^https?:\/\//i.test(applyUrl)) return { url: listingUrl };
  try {
    const host = new URL(applyUrl).host.replace(/^www\./, "");
    if (host.endsWith(aggregatorHost) || applyUrl === listingUrl) return { url: listingUrl };
    return { url: applyUrl, sourceUrl: listingUrl };
  } catch { return { url: listingUrl }; }
}
