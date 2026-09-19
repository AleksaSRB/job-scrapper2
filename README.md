# Marketing & Business poslovi — scraper remote oglasa za kandidata iz Srbije

Prati **full-time, potpuno remote Marketing / Business oglase stranih firmi** na koje može da se konkuriše iz Srbije
(junior / associate / coordinator nivo). Isti model kao ostali scraperi u ovoj porodici (stanovi, QA poslovi, poslovi od kuće):
TypeScript, Node ≥ 22.6 (type-stripping), **0 npm zavisnosti**, lokalni UI, JSON baza. Pun brief: [docs/brief.md](docs/brief.md).

- **UI:** http://localhost:3009 — tabovi Novi / Favoriti / Aplicirano / Odbačeno, filteri po sajtu, kategoriji, „samo Srbija / Worldwide“, „samo junior“, „samo full-time“, „samo sa platom“
- **Kartica:** firma + logo, naslov, lokacija + čip dostupnosti (Srbija OK / Worldwide / Evropa (proveri) / Lokacija?), nivo poklapanja + skor, čipovi (plata, full-time, junior, kategorije, alati), sažetak, „Zašto ova ocena“, „Isti oglas i na …“
- **Dugmad:** ★ Favorit · ✔ Aplicirano · ✕ Odbaci · Otvori ↗ (ide direktno kod poslodavca kad je link poznat) · „sakrij firmu“
- **Task-ovi (Windows):** `MarketingPosloviScraper` (svakih 15 min) i `MarketingPosloviServer` (pri logovanju) — `setup.cmd` / `uninstall.cmd`

## Instalacija na drugom računaru (npr. mamin laptop)

Potrebno: **Windows 10/11** i **Node.js 22.6+** (LTS sa https://nodejs.org — `setup.cmd` ga instalira sam preko winget-a ako nedostaje).
Git nije obavezan (samo za `update.cmd`).

1. Prekopiraj ceo folder (ili `git clone https://github.com/AleksaSRB/job-scrapper2.git`) bilo gde, npr. `C:\Users\<ime>\Desktop\job-scrapper2`
2. Dupli klik na **`setup.cmd`** → proveri/instalira Node, registruje oba task-a, odmah uradi **prvi prolaz (poslednjih 5 dana sa svih sajtova, 3–8 min)** i otvori http://localhost:3009
3. Od tada scraper sam proverava sajtove **svakih 15 min** (svaki izvor u svom ritmu), server se diže pri svakom logovanju.

Posle restarta računara ništa ne treba raditi: server se sam diže pri logovanju, scraper nastavlja svakih 15 min — samo otvori http://localhost:3009. Ako se UI ipak ne otvara: dupli klik na **** (pokrene server i otvori browser).

Ažuriranje na novu verziju: `update.cmd` (git pull + restart servera; `data/` ostaje). Uklanjanje: `uninstall.cmd` (podaci ostaju).

Napomena za prvi prolaz: `lookbackDays` u `config.json` (5) — oglasi stariji od toga se ne uzimaju; datum se pamti u `data/db.json` (`baselineAt`).

## Izvori (provereno 19.09.2026, IP iz Srbije, bez browsera)

| Izvor | Kako | Ritam | Napomena |
|-------|------|------:|----------|
| Himalayas | JSON search API, `country=RS` (sajt već filtrira: dostupno iz Srbije), ~30 upita × 2 strane | 15 min | glavni izvor; `applicationLink` = direktan link poslodavca |
| We Work Remotely | RSS: sales-and-marketing, customer-support, management-and-finance, product, all-other | 30 min | `<region>` = Anywhere in the World / Europe Only / USA Only |
| Remote OK | JSON API `/api` + `?tags=marketing,sales,customer support,seo,social media…` | 60 min | lokacija često prazna → „Lokacija?“ |
| Working Nomads | JSON `exposed_jobs` (~50 najnovijih), kategorije Marketing/Sales/Customer Success/Administration/Management/Writing | 60 min | plata iz internog `/jobsapi/_search` |
| JobRack | SSR HTML lista + detalj (kategorije sales-marketing, seo, content-writer, support, executive-assistant, project-manager) | 30 min | Istočna Evropa → Srbija ulazi |
| LinkedIn | javni guest API: `location=Serbia` + remote (dostupno iz Srbije) i `location=European Union` + remote + entry/associate | 60 min | rizik 429 → mali broj upita, pauze; EU oglas sa konkretnim gradom = remote samo u toj zemlji → odbijen |
| Wellfound | SSR `__NEXT_DATA__` na `/role/r/marketing`, `digital-marketing`, `social-media-manager`, `sales`, `account-executive`, `/role/l/marketing/europe` | 6 h | sortirano po relevantnosti, dosta senior; `yearsExperienceMin` ide u ocenu |
| Jobicy | JSON API `industry=marketing,business,management` | 60 min | dosta US-only → ocena odbija |
| Remotive | JSON API (besplatno samo uzorak ~16 oglasa) | 6 h | slab prinos, jeftino |

Nisu podržani: **Jobgether** (Astro SPA bez javnog API-ja), **EU Remote Jobs** (feed vraća HTML), **Indeed / Glassdoor / FlexJobs / Otta** (anti-bot / login).
Jedan pokvaren izvor ne ruši prolaz — greška se vidi u UI-ju (klik na „poslednja provera“) i u `data/scraper.log`.

## Kako se ocenjuje oglas (rules.json)

Skor se sabira iz naslova i opisa; nivo: **150+ odličan**, **115+ dobar**, **75+ moguć**, ispod `minScore` (75) se ne prikazuje (ide u `data/filtered.log`).

- **Kategorija** (naslov = puna težina 20–30, samo opis = 40 %): marketing koordinator, digitalni marketing, društvene mreže, CRM/email, content, business development, SDR, customer success, sales ops, business ops, market research, partnerships, SEO, growth, e-commerce, account, project, product marketing, paid media, brend/PR, business analyst; „srodno“ (HR koordinator, eventi, podrška) samo iz naslova
- **Seniornost:** junior/associate/coordinator/assistant/specialist/representative u naslovu +30; `manager` −10 (proveri opis); **senior/lead/head/director/VP/chief/principal → odbijen**; godine iskustva iz opisa: 0–2 +25, 3–4 −30, **5+ → odbijen**
- **Remote:** polje sajta +35; **hibrid / onsite → odbijen** (rečenice sa „no on-site“, „fully remote“ se ignorišu); remote sajt + opis pominje kancelariju −50
- **Dostupnost iz Srbije:** Srbija/Balkan/Istočna Evropa/CEE +40, Worldwide/Anywhere/Global +40, Europe/EMEA/EU +15 („proveri“), samo druge zemlje/regioni (USA, UK, LATAM, Nemačka…) → **odbijen**; „US only“, „must be based in the EU“, „US work authorization required“ u opisu → **odbijen**; ništa navedeno −25
- **Zaposlenje:** full-time +25, ugovor +10, freelance −20, praksa −25, part-time −40, **neplaćeno / samo provizija → odbijen**
- **Jezik:** engleski je normalan (+10 ako je jedini); **drugi jezik obavezan → odbijen** („German is a plus“ prolazi; jezik u naslovu = obavezan)
- **Vremenska zona:** CET/EMEA/fleksibilno +15, PST/EST/US hours/night shift −40
- **Negativi:** developer/inženjer/QA/dizajner/računovođa/pravnik/medicina/rater/video editor/„open application“ u naslovu → odbijen; enterprise/strategic/regional −30; cold calling, SQL-heavy, veliki budžeti, „manage a team“ −15…−25; oglas na nemačkom/španskom (m/w/d, Vertrieb, ventas…) −60
- **Pozitivi:** obuka/onboarding +15, graduate/early career +15, poslovna diploma +10, alati (HubSpot, GA4, Canva, Klaviyo, Google/Meta Ads, Shopify, Notion…) +2 po alatu (max +10) — alati se vide kao sivi čipovi

Sve reči, regexi i težine su u **`rules.json`**; upiti, feed-ovi, kategorije, ritam i prag u **`config.json`**. Tunovanje:

```
npm run score -- --all              # tabela svih oglasa iz baze po trenutnim pravilima
npm run score -- <deo naslova>      # pun razlog ocene za jedan oglas
npm run score -- --rescore          # ponovo oceni sve u bazi (statusi ostaju; novi ispod praga -> odbačeni)
```

Oglasi koje je ocena odbila nisu u bazi (samo u `data/filtered.log`); da se ponovo procene posle izmene pravila, obriši `data/seen.json`.

## Dedup, statusi, „novo“

- Isti oglas sa više sajtova (ista firma + isti/sličan naslov, Jaccard ≥ 0,6) = jedna kartica + „Isti oglas i na: …“; ako duplikat ima direktan link poslodavca ili platu, kartica ih preuzima. Odbačen oglas ostaje odbačen i kad ga drugi sajt ponovo nađe.
- Favorit / Aplicirano / Odbačeno žive u `data/db.json` i preživljavaju rescan i restart.
- Traka „novo“ na kartici = pronađen posle tvoje poslednje posete UI-ja (localStorage).
- Notifikacije: `ntfyTopic` u `config.json` (prazno = bez); šalje se samo kad ima novih, prvi prolaz se preskače.

## Komande

```
npm run scrape          # jedan prolaz, poštuje everyMin po izvoru
npm run scrape:force    # svi izvori odmah (isto što i „Skeniraj sad“)
npm run scrape -- --only himalayas,linkedin
npm run serve           # UI na :3009
```

Env: `DETE_JOBS_PORT` (port), `DETE_JOBS_DATA_DIR` (druga baza za probu), `NTFY_TOPIC`.
Logovi: `data/scraper.log`, `data/new_jobs.log`, `data/filtered.log`, `data/server.out`.
