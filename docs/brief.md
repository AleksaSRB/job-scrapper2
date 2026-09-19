# Remote Full-Time Marketing & Business Job Scraper — Claude Implementation Brief

## 1. Goal

Build a **new local scraper app** for **full-time, fully remote Marketing / Business roles at foreign companies**, intended for a candidate based in Serbia.

The app should run on:

```text
http://localhost:3009
```

This should be a **sibling app** to my existing local scraper projects:

- QA jobs scraper
- apartment scraper
- remote part-time jobs scraper

Before implementing anything, inspect the existing scraper projects and **reuse their architecture, UI patterns, persistence, deduplication, card layout, filters, scan logic, and styling wherever practical**.

Do not invent a completely different architecture if the existing apps already solve the same problems.

---

# 2. Candidate / Target Profile

This scraper is for a **young candidate in Serbia with a recent Business / Business-related master's degree**, looking for a **full-time remote job at an international / foreign company**.

Primary focus:

- Marketing
- Digital Marketing
- Business / Commercial roles
- Business Development
- Sales / Sales Support
- Customer Success
- Account Management
- Operations
- Market Research
- CRM / Email Marketing
- Content / Social Media
- Partnerships
- E-commerce
- Junior / Associate / Coordinator roles

The candidate should be treated as **early-career / junior-to-mid junior**, not as senior management.

The app should be optimized to discover jobs that are realistic for someone based in **Serbia**, including companies hiring:

- Worldwide
- Europe
- EMEA
- Eastern Europe
- Balkans
- Serbia
- anywhere remotely where Serbia is explicitly eligible

The most important rule is:

> **"Remote" does not automatically mean "remote from Serbia".**

The scraper must inspect location / eligibility restrictions carefully.

---

# 3. Core Job Categories to Target

The scraper should search broadly across marketing and business roles, not only titles containing the word `marketing`.

---

## A. Marketing Coordinator / Marketing Assistant — VERY HIGH PRIORITY

Keywords / titles:

- marketing coordinator
- marketing assistant
- marketing associate
- marketing specialist
- junior marketing specialist
- marketing executive
- junior marketing executive
- marketing operations coordinator
- marketing operations associate
- marketing project coordinator
- campaign coordinator
- campaign assistant
- campaign specialist
- brand coordinator
- brand assistant
- brand marketing coordinator
- marketing administrator

These are some of the best general entry points for a recent Business graduate.

---

## B. Digital Marketing — VERY HIGH PRIORITY

Keywords:

- digital marketing specialist
- digital marketing coordinator
- digital marketing associate
- junior digital marketer
- digital marketing assistant
- online marketing specialist
- online marketing coordinator
- digital campaign specialist
- digital campaign coordinator
- digital marketing executive
- performance marketing assistant
- performance marketing associate

Avoid automatically assuming `performance marketing` is senior; evaluate actual requirements.

---

## C. Social Media Marketing — VERY HIGH PRIORITY

Keywords:

- social media coordinator
- social media specialist
- social media assistant
- social media associate
- social media manager
- junior social media manager
- community manager
- community coordinator
- social media executive
- content and social media coordinator
- social media marketing specialist

`Social Media Manager` is allowed if requirements are junior/reasonable; reject only if clearly senior/lead-level.

---

## D. Content Marketing / Copy / Content Operations — HIGH PRIORITY

Keywords:

- content marketing specialist
- content marketing coordinator
- content marketer
- content coordinator
- content assistant
- content associate
- content operations specialist
- content operations coordinator
- junior content specialist
- content manager
- content marketing manager
- copywriter
- junior copywriter
- marketing copywriter
- content writer
- SEO content writer

For copy/content roles, rank based on writing requirements and portfolio expectations.

---

## E. Email Marketing / CRM / Lifecycle — VERY HIGH PRIORITY

Keywords:

- email marketing specialist
- email marketing coordinator
- email marketing assistant
- CRM specialist
- CRM coordinator
- CRM marketing specialist
- lifecycle marketing associate
- lifecycle marketing coordinator
- retention marketing associate
- customer lifecycle specialist
- marketing automation specialist
- marketing automation coordinator
- campaign operations specialist

Relevant tools / badges:

- HubSpot
- Mailchimp
- Klaviyo
- Salesforce
- Braze
- Iterable
- Marketo
- ActiveCampaign

Do not reject because a tool is unfamiliar unless the listing requires extensive years of experience.

---

## F. SEO / Organic Growth — HIGH PRIORITY

Keywords:

- SEO specialist
- junior SEO specialist
- SEO coordinator
- SEO assistant
- SEO associate
- organic growth specialist
- organic marketing specialist
- SEO content specialist
- search marketing specialist
- digital acquisition assistant

Strongly distinguish junior SEO roles from technical SEO leadership roles.

---

## G. Paid Media / Performance / Acquisition — MEDIUM-HIGH PRIORITY

Keywords:

- paid media specialist
- paid media coordinator
- PPC specialist
- junior PPC specialist
- performance marketing specialist
- performance marketing coordinator
- acquisition specialist
- user acquisition associate
- growth marketing associate
- growth marketing coordinator
- paid social specialist
- Google Ads specialist
- Meta Ads specialist

Positive tools / tags:

- Google Ads
- Meta Ads
- GA4
- Google Analytics
- Looker Studio

Down-rank roles requiring large managed budgets or 4+ years of specialized paid media experience.

---

## H. Growth Marketing — HIGH PRIORITY

Keywords:

- growth marketing associate
- growth marketing specialist
- growth marketing coordinator
- junior growth marketer
- growth associate
- growth specialist
- growth coordinator
- marketing growth associate
- acquisition associate

Be careful with:

- Head of Growth
- VP Growth
- Growth Lead

These should normally be hard rejects.

---

## I. Product Marketing — MEDIUM-HIGH PRIORITY

Keywords:

- product marketing associate
- product marketing coordinator
- junior product marketing specialist
- product marketing specialist
- product marketing assistant
- go-to-market coordinator
- GTM coordinator
- GTM associate
- go-to-market associate

Down-rank / reject if role clearly requires 4-5+ years in B2B SaaS product marketing.

---

## J. Brand / Communications / PR — HIGH PRIORITY

Keywords:

- brand coordinator
- brand associate
- brand specialist
- communications coordinator
- communications associate
- communications specialist
- PR coordinator
- public relations coordinator
- corporate communications assistant
- marketing communications coordinator
- marcom coordinator
- communications assistant

Useful for a Business graduate if requirements are not journalism/PR-specialist heavy.

---

# 4. Business / Commercial Roles

---

## K. Business Development — VERY HIGH PRIORITY

Keywords:

- business development representative
- BDR
- business development associate
- business development specialist
- business development coordinator
- junior business development manager
- business development executive
- commercial associate
- commercial coordinator
- commercial specialist
- growth business development

Be cautious with `Business Development Manager`:

- keep if junior and individual-contributor
- reject if clearly senior / team management / 5+ years required

---

## L. Sales Development / SDR — VERY HIGH PRIORITY

Keywords:

- sales development representative
- SDR
- sales development associate
- sales development specialist
- junior SDR
- inbound sales representative
- outbound sales representative
- sales representative
- sales associate
- sales executive
- junior sales executive
- inside sales representative

These are valid business roles, but score appropriately based on quality.

Negative signals:

- commission only
- no base salary
- extreme cold calling
- 100+ calls/day
- door-to-door
- US night shift from Serbia

---

## M. Sales Support / Commercial Operations — VERY HIGH PRIORITY

Keywords:

- sales support specialist
- sales support coordinator
- sales operations associate
- sales operations coordinator
- sales operations specialist
- commercial operations associate
- commercial operations coordinator
- revenue operations associate
- revenue operations coordinator
- RevOps associate
- RevOps coordinator
- sales administrator
- account coordinator
- commercial assistant

This category should rank strongly because it combines business knowledge with structured operational work.

---

## N. Account Management — HIGH PRIORITY

Keywords:

- account coordinator
- account executive
- junior account executive
- account associate
- account specialist
- junior account manager
- client account coordinator
- client services coordinator
- client success associate

Be careful with `Account Executive` because in SaaS it may be a quota-heavy sales closer role.

Do not reject by title alone; inspect description.

---

## O. Customer Success — VERY HIGH PRIORITY

Keywords:

- customer success associate
- customer success specialist
- customer success coordinator
- junior customer success manager
- customer onboarding specialist
- onboarding specialist
- customer onboarding coordinator
- client success associate
- client success specialist
- customer experience specialist
- implementation coordinator

Reject senior CSM roles requiring a large enterprise portfolio / 5+ years.

---

## P. Partnerships / Affiliate / Influencer Marketing — HIGH PRIORITY

Keywords:

- partnerships associate
- partnerships coordinator
- partnership specialist
- business partnerships associate
- affiliate marketing specialist
- affiliate coordinator
- influencer marketing coordinator
- influencer marketing specialist
- creator partnerships associate
- creator partnerships coordinator
- partner operations associate
- partner success specialist

These can be excellent marketing/business crossover roles.

---

## Q. Market Research / Consumer Insights — VERY HIGH PRIORITY

Keywords:

- market research analyst
- junior market research analyst
- market research associate
- market research specialist
- research associate
- consumer insights associate
- consumer insights analyst
- marketing analyst
- junior marketing analyst
- competitive intelligence analyst
- business research analyst
- research coordinator

Avoid highly quantitative roles requiring advanced statistics / econometrics unless requirements are clearly junior.

---

## R. Business Analyst / Strategy — MEDIUM-HIGH PRIORITY

Keywords:

- junior business analyst
- business analyst
- business operations analyst
- strategy analyst
- junior strategy analyst
- business strategy associate
- strategy associate
- commercial analyst
- business insights analyst
- operations analyst

Do not confuse generic Business Analyst with heavily technical IT Business Analyst roles.

Down-rank roles requiring:

- SQL-heavy analytics
- system architecture
- BPMN expertise
- software requirements engineering

unless role remains appropriate for the candidate.

---

## S. Business Operations / Operations — VERY HIGH PRIORITY

Keywords:

- business operations associate
- business operations coordinator
- operations associate
- operations coordinator
- operations specialist
- junior operations specialist
- commercial operations associate
- program coordinator
- project coordinator
- business support specialist
- operations assistant

This is an important category and should not be missed just because `marketing` is absent from the title.

---

## T. Project / Program Coordination — HIGH PRIORITY

Keywords:

- project coordinator
- junior project coordinator
- project assistant
- program coordinator
- program assistant
- project operations coordinator
- marketing project coordinator
- campaign project coordinator

Reject senior Project Manager / Program Manager roles unless clearly junior-friendly.

---

## U. E-commerce / Marketplace — HIGH PRIORITY

Keywords:

- ecommerce specialist
- e-commerce specialist
- ecommerce coordinator
- e-commerce coordinator
- ecommerce associate
- marketplace specialist
- marketplace coordinator
- Amazon marketplace specialist
- Shopify specialist
- ecommerce operations specialist
- ecommerce marketing specialist
- merchandising coordinator
- digital merchandising specialist

Useful tags:

- Shopify
- Amazon
- WooCommerce
- Magento
- Klaviyo
- Google Analytics

---

# 5. Optional Adjacent Categories

These should be allowed but ranked below the primary marketing/business groups unless they are a particularly good match.

Keywords:

- recruiter coordinator
- talent acquisition coordinator
- employer branding coordinator
- community manager
- event marketing coordinator
- webinar coordinator
- lead generation specialist
- lead generation associate
- marketing research assistant
- client services associate
- customer experience associate

---

# 6. Seniority Rules

## Strong Positive

Boost titles / descriptions containing:

- junior
- entry level
- entry-level
- associate
- coordinator
- assistant
- specialist
- representative
- graduate
- early career
- 0-1 years
- 1+ year
- 1-2 years
- 1-3 years

## Accept with caution

- manager
- account manager
- social media manager
- marketing manager
- business development manager
- customer success manager

These titles can sometimes be individual-contributor roles.

Inspect actual requirements before rejecting.

## Hard Reject / Strong Suppression

Normally reject:

- senior
- senior manager
- lead
- team lead
- head of
- director
- VP
- vice president
- chief
- CMO
- CRO
- partner
- principal

Also reject listings that clearly require:

- 5+ years
- 6+ years
- 7+ years
- 8+ years
- 10+ years

For 3-4 years:

- do not necessarily hard-reject
- down-rank unless the rest of the job is an unusually strong match

---

# 7. Remote Eligibility — CRITICAL

This is one of the most important pieces of the scraper.

A listing saying `Remote` is not enough.

The scraper must determine whether a candidate physically located in **Serbia** can realistically apply.

## Strong Positive Locations

- Serbia
- Remote - Serbia
- Worldwide
- Anywhere in the World
- Global Remote
- Europe, when Serbia is explicitly included
- EMEA, when Serbia is accepted
- Eastern Europe
- Balkans
- Central and Eastern Europe
- CEE, if Serbia is included

## Potentially Valid — Inspect Description

- Europe
- European timezone
- CET
- EMEA
- Remote Europe

These do **not** automatically guarantee Serbia eligibility.

## Hard Reject Locations / Eligibility

Reject when listing explicitly says:

- US only
- United States only
- must be based in the US
- US work authorization required
- must have US work authorization
- Canada only
- UK only
- must reside in UK
- Australia only
- EU residents only
- EU citizenship required
- European Union only
- must reside in the EU
- Schengen only
- Germany only
- France only
- Netherlands only
- Spain only
- Portugal only
- specific-country remote where Serbia is not eligible

`Europe` is valid only after checking actual eligibility language.

---

# 8. Remote Work Rules

## Required

The primary result set should be **fully remote**.

Positive keywords:

- fully remote
- 100% remote
- remote
- remote-first
- work from anywhere
- work from home
- distributed team
- location independent

## Hard Reject / Hide by Default

- onsite
- on-site
- office-based
- in-office
- hybrid
- 2 days in office
- 3 days in office
- regular office attendance
- relocation required

If a role is `remote within Serbia` it is fine.

If a role is hybrid in Belgrade, keep it out of the default result set because this scraper is specifically for full remote roles.

---

# 9. Employment Type Rules

Primary focus:

- Full-Time
- Full Time
- Permanent
- Employee
- Regular employment

Positive:

- full-time contractor if long-term and stable
- long-term remote contract

Down-rank / hide by default:

- part-time
- temporary
- seasonal
- freelance gig
- hourly microtask

Hard reject unless explicitly desired later:

- unpaid internship
- volunteer
- commission-only

Paid internships / graduate programs may be kept in a separate lower-priority category if they are full-time and remote.

---

# 10. English / Language Rules

Unlike the part-time scraper for the older candidate, **English should NOT be treated as a negative signal here**.

Foreign companies will commonly require English.

Positive / normal signals:

- English
- fluent English
- professional English
- business English
- excellent written English
- English B2
- English C1

Do not boost purely because of English; simply treat it as expected.

Hard reject only if another mandatory language is required and English alone is not sufficient, for example:

- Native German required
- French C1 required
- Dutch required
- Swedish required
- Italian native speaker required

Exception:

If the listing says:

```text
English required; German is a plus
```

then it remains valid.

If it says:

```text
German required; English required
```

then reject unless candidate language support is changed later.

---

# 11. Positive Marketing Skills / Tool Keywords

Use these as tags and relevance signals, not hard requirements.

## General Marketing

- digital marketing
- campaign management
- marketing strategy
- brand marketing
- content marketing
- social media
- market research
- customer acquisition
- lead generation
- demand generation
- growth marketing

## Analytics

- Google Analytics
- GA4
- Looker Studio
- Excel
- Google Sheets
- dashboards
- reporting
- marketing analytics
- conversion rate
- KPI
- ROI
- attribution

## CRM / Email

- HubSpot
- Salesforce
- Mailchimp
- Klaviyo
- Braze
- Marketo
- ActiveCampaign
- CRM
- email marketing
- marketing automation

## Paid Advertising

- Google Ads
- Meta Ads
- Facebook Ads
- Instagram Ads
- LinkedIn Ads
- PPC
- paid search
- paid social

## Content / Design

- Canva
- WordPress
- CMS
- copywriting
- content creation
- content calendar
- Adobe
- Figma

## SEO

- SEO
- SEM
- Ahrefs
- SEMrush
- keyword research
- Search Console
- on-page SEO

## Business / Sales

- CRM
- prospecting
- lead generation
- pipeline
- account management
- client relations
- customer success
- business development
- sales operations
- revenue operations

## AI / Productivity

- ChatGPT
- AI tools
- generative AI
- Notion
- Slack
- Asana
- Monday.com
- Trello

These can be displayed as small badges on cards if present.

---

# 12. Hard Reject / Strong Negative Rules

Hard reject or suppress roles that are clearly unrelated to the target profile.

Examples:

- software engineer
- frontend developer
- backend developer
- QA engineer
- DevOps
- data engineer
- senior data scientist
- accountant requiring CPA/ACCA
- legal counsel
- medical roles
- engineering roles
- graphic designer roles requiring a professional design portfolio as the core job

Also reject:

- senior leadership
- director
- VP
- head of department
- C-level
- 5+ years mandatory unless role is extremely broad and requirements appear inflated
- onsite
- hybrid
- relocation required
- location restrictions excluding Serbia
- unpaid
- commission-only

Strong negative but not always automatic reject:

- US working hours only
- PST working hours
- EST full overlap
- overnight Serbia schedule
- 100+ cold calls/day
- aggressive commission plan
- role described mainly as telephone prospecting
- no base salary

---

# 13. Time Zone Rules

Candidate is in Serbia / CET-CEST.

Strong positive:

- CET
- CEST
- GMT+1
- GMT+2
- Europe hours
- EMEA hours
- flexible hours
- async

Acceptable:

- GMT
- UTC
- UK overlap
- up to roughly UTC+4 depending on company schedule

Potential negative:

- mandatory EST overlap for full working day
- PST hours
- US West Coast business hours
- 9-5 San Francisco time

Do not hard reject only because a company is American.

Reject / down-rank based on the **actual required working hours**, not company HQ.

---

# 14. Suggested Match Scoring

Do not use only keyword matching.

Score the complete job listing.

Suggested philosophy:

```text
+40 explicitly allows Serbia / Worldwide / Balkans / Eastern Europe
+35 fully remote / 100% remote
+30 junior / associate / coordinator / assistant
+30 marketing / business category match
+25 full-time permanent
+25 0-2 years experience
+20 1-3 years experience
+20 marketing coordinator / digital marketing / business development / customer success / operations
+15 CET / EMEA friendly hours
+15 graduate / recent graduate / early career
+15 training / onboarding provided
+10 common marketing tools (HubSpot, GA4, Canva, etc.)
+10 business degree relevant
+10 English only language requirement

-100 Serbia clearly not eligible
-100 onsite / hybrid only
-90 US-only / UK-only / EU-only with Serbia excluded
-80 senior / lead / head / director / VP
-70 5+ years mandatory
-60 commission-only
-50 unpaid internship
-40 mandatory PST / US night shift
-30 3-4 years specialized experience
-25 unclear remote eligibility
-20 excessive cold calling
```

Suggested result labels:

```text
90+  Excellent Match
70+  Good Match
50+  Possible Match
<50  Hide by default
```

Tune values based on real results.

---

# 15. Foreign / International Job Sources to Test

The emphasis should be on **foreign companies and international remote-first job boards**.

Claude should test actual scraping feasibility before implementing each one.

| # | Site | Priority | Why |
|---|---|---:|---|
| 1 | LinkedIn Jobs | ⭐⭐⭐⭐⭐ | Largest volume; strong international company coverage |
| 2 | Wellfound | ⭐⭐⭐⭐⭐ | Startups, SaaS, remote marketing/business roles |
| 3 | We Work Remotely | ⭐⭐⭐⭐⭐ | Established global remote job board |
| 4 | Remote OK | ⭐⭐⭐⭐⭐ | Strong global remote/startup listings |
| 5 | Himalayas | ⭐⭐⭐⭐⭐ | Excellent remote-only job discovery and location info |
| 6 | Working Nomads | ⭐⭐⭐⭐ | Strong remote marketing/business category coverage |
| 7 | Remotive | ⭐⭐⭐⭐ | Curated remote roles; marketing, sales, customer success |
| 8 | JobRack | ⭐⭐⭐⭐ | Especially relevant to Eastern Europe / Balkans |
| 9 | Jobgether | ⭐⭐⭐⭐ | Remote-first international jobs and location filters |
| 10 | Wellfound / startup company career pages | ⭐⭐⭐⭐ | Direct startup hiring opportunities |
| 11 | Otta / Welcome to the Jungle | ⭐⭐⭐⭐ | Startup/tech business and marketing roles where accessible |
| 12 | Indeed | ⭐⭐⭐⭐ | Huge volume, but requires careful location filtering |
| 13 | Glassdoor Jobs | ⭐⭐⭐ | Useful additional source, may be harder to scrape reliably |
| 14 | FlexJobs | ⭐⭐⭐ | Quality remote listings but subscription/login may limit scraping |
| 15 | EU Remote Jobs / Europe-focused remote boards | ⭐⭐⭐⭐ | Useful if Serbia eligibility is clearly handled |

Avoid depending on only one aggregator.

The scanner should ideally combine:

- remote-specific job boards
- major job platforms
- startup-focused platforms
- direct employer career pages where possible

---

# 16. Source Investigation Requirements

For every source, first determine:

1. Are search results publicly accessible?
2. Does it require authentication?
3. Is data server-rendered or JavaScript-rendered?
4. Is there a public API / JSON endpoint used by the frontend?
5. Does pagination work through query parameters?
6. Is infinite scroll used?
7. Is Cloudflare / CAPTCHA / strong anti-bot protection present?
8. Can location eligibility be extracted?
9. Is salary available?
10. Is employment type available?
11. Is description available without login?
12. Is company name available?
13. Is there a stable job ID?
14. Can the canonical employer URL be discovered?
15. Can posted date be extracted?

For each adapter, document something like:

```text
Himalayas
- Public search: yes/no
- Login required: yes/no
- Reliable fields:
- Salary available:
- Location restrictions:
- Detail fetch required:
- Anti-bot risk:
- Recommended approach:
```

Prefer:

1. public JSON/API endpoints
2. stable server-rendered HTML
3. browser automation only when necessary

Do not build brittle CAPTCHA bypasses.

If a source is unreliable, isolate it behind an adapter and disable it without breaking the rest of the app.

---

# 17. Search Strategy

Do not run one giant query.

Use multiple targeted searches per source.

## Marketing searches

```text
marketing coordinator
marketing associate
marketing assistant
digital marketing specialist
digital marketing coordinator
social media coordinator
content marketing specialist
content coordinator
email marketing specialist
CRM coordinator
SEO specialist
junior SEO
performance marketing coordinator
growth marketing associate
product marketing associate
brand coordinator
communications coordinator
```

## Business searches

```text
business development representative
business development associate
sales development representative
SDR
sales support coordinator
sales operations associate
commercial coordinator
account coordinator
customer success associate
customer success specialist
partnerships coordinator
market research analyst
business operations associate
operations coordinator
project coordinator
ecommerce coordinator
```

## Location modifiers

Where useful:

```text
remote Europe
remote EMEA
remote Serbia
remote Eastern Europe
remote worldwide
Europe remote
EMEA remote
```

Avoid queries that are so narrow they miss valid global listings.

---

# 18. Result Normalization

Normalize every source into approximately:

```text
id
source
sourceJobId
url
canonicalUrl

company
companyLogo
title
location
eligibleCountries
remoteRegion

remoteType
employmentType
seniority
experienceMin
experienceMax

salaryText
salaryMin
salaryMax
salaryCurrency
salaryPeriod

postedAt
discoveredAt
lastSeenAt

description
shortDescription
requirements

category
subcategories
skills
tools
languageRequirements

timezoneRequirements

matchScore
matchReasons
negativeReasons
eligibilityStatus

status:
  new
  favorite
  applied
  rejected

dedupKey
duplicateSources
```

Adapt names to the existing scraper codebase rather than forcing this exact schema.

---

# 19. Job Card UI

The app should visually follow the existing QA scraper as closely as practical.

Each card should show:

## Header

- company logo if available
- company name
- source badge

## Title

- job title

## Location

Examples:

```text
Worldwide
Europe
EMEA
Remote - Serbia
Eastern Europe
```

If eligibility is known, show a useful badge such as:

```text
Serbia Eligible
Worldwide
EMEA
```

## Primary badges

Examples:

```text
Full-Time
Remote
Junior
Associate
Europe
CET
€35k-€45k
```

## Category badges

Examples:

```text
Digital Marketing
CRM
Social Media
Business Development
Customer Success
Operations
SEO
HubSpot
GA4
Canva
```

Do not display dozens of badges.

Show only the most useful signals.

## Short Summary

2-4 concise lines containing:

- what the role actually does
- key experience requirement
- location eligibility
- important tools / domain

## Match Explanation

Useful compact example:

```text
Excellent Match
✓ Fully remote
✓ Serbia eligible
✓ Full-time
✓ 1-2 years experience
✓ Marketing Coordinator
```

This can be expandable rather than always visible.

## Footer

Same pattern as existing scraper:

```text
pre 8 h · pronađen 19.09. 11:18
```

## Actions

- ⭐ Favorite
- ✓ Applied
- ✕ Reject
- Open ↗

Open should go directly to the best available job URL.

Prefer employer career page over an aggregator when both exist.

---

# 20. Top Navigation / Filters

Reuse the QA scraper experience.

## Status

- New
- Favorites
- Applied
- Rejected

Example:

```text
Novi 24
Favoriti 3
Aplicirao 5
```

## Source

- All sites
- LinkedIn
- Wellfound
- We Work Remotely
- Remote OK
- Himalayas
- Working Nomads
- Remotive
- JobRack
- etc.

## Sort

- Newest first
- Highest match
- Highest salary
- Recently discovered

## Useful filters

- Marketing
- Business Development
- Customer Success
- Operations
- Sales
- Full-Time only
- Serbia eligible
- Worldwide
- Europe / EMEA
- Junior / Associate
- Salary provided

Do not overcomplicate version 1.

---

# 21. Salary Handling

Salary is very useful for international jobs and should be prominent when available.

Store:

```text
salaryText
salaryMin
salaryMax
currency
period
```

Periods:

- hour
- month
- year

Currencies may include:

- EUR
- USD
- GBP
- RSD

Examples:

```text
€30,000-€40,000 yearly
$40k-$55k USD annually
€2,000/month
```

Do not estimate salary unless the source itself marks it as estimated.

If salary is missing, do not invent one.

---

# 22. Deduplication — VERY IMPORTANT

The same job can appear on:

- company careers page
- LinkedIn
- Wellfound
- Remote OK
- Himalayas
- Working Nomads
- Jobgether
- aggregators

Do not show duplicates as separate cards.

Use:

1. canonical employer URL
2. source job ID
3. normalized company name
4. normalized title
5. location / remote region
6. description similarity
7. salary
8. posted date

Example titles that may represent the same job:

```text
Marketing Coordinator
Remote Marketing Coordinator
Marketing Coordinator - EMEA
```

If:

- company matches
- description strongly matches
- location/eligibility matches

then merge.

When duplicates exist:

- use one primary card
- prefer direct employer link
- otherwise use the richest source
- retain alternate sources internally

Optional UI:

```text
Also found on: LinkedIn, Himalayas
```

---

# 23. Company Career Page Preference

If an aggregator or job board exposes the original employer posting URL, prefer the direct employer URL for the `Open` button.

Priority:

```text
Employer career page
> trusted original job board
> aggregator
```

The user should ideally apply at the employer source when possible.

---

# 24. Persistence

Favorite / Applied / Rejected states must survive:

- refresh
- rescan
- restart

Reuse the same storage method as the existing apps.

Do not reset state if a listing is discovered through a different source after deduplication.

Example:

If user rejected a LinkedIn copy of a role and the same role later appears from Himalayas, it should remain rejected after merge.

---

# 25. New Job Detection

Each scan should identify genuinely new jobs.

Do not mark a deduplicated existing role as new simply because a new source found it.

Display a count in the UI:

```text
Novi 13
```

Preserve the existing app behavior if it already solves this correctly.

---

# 26. Rejected Jobs / Hidden Companies

Reuse existing behavior where available.

User should be able to:

- reject a single job
- optionally hide a company

Do not automatically hide an entire company when one role is rejected.

Company hiding is useful for:

- spammy recruiters
- irrelevant staffing firms
- repeated commission-only sales companies

---

# 27. Scan Behavior

Provide manual:

```text
Skeniraj sad
```

Show:

```text
poslednja provera HH:MM
```

A scan should:

1. run source adapters independently
2. continue if one source fails
3. normalize listings
4. verify Serbia eligibility
5. apply hard reject rules
6. calculate match score
7. deduplicate
8. persist
9. update UI

One broken source must never break the entire scan.

---

# 28. Source Health / Diagnostics

Because foreign job sites change frequently, provide simple adapter diagnostics.

Track:

- last successful scan
- last error
- response status
- number of jobs parsed
- number accepted
- number rejected
- scan duration

Example:

```text
[Himalayas] query="marketing coordinator" results=42 accepted=18 rejected=24 duration=2.1s
```

If practical, expose source health in a small diagnostics section.

---

# 29. Match Reasons / Reject Reasons

Store transparent reasons for ranking.

Example accepted job:

```text
+40 Worldwide / Serbia eligible
+35 fully remote
+30 Marketing Coordinator
+30 Associate-level
+25 full-time
+20 requires 1-2 years
Score: 180
```

Rejected example:

```text
Rejected: US residents only
```

or:

```text
Rejected: Hybrid role - London office 3x/week
```

or:

```text
Rejected: Senior role requiring 7+ years
```

These reasons are important for tuning the scraper.

---

# 30. Keyword Configuration

Do not scatter keywords throughout scraper implementations.

Centralize:

- categories
- title keywords
- seniority rules
- positive signals
- location eligibility rules
- hard rejects
- time-zone rules
- scoring weights
- source configs

Conceptually:

```text
config/
  jobCategories
  seniorityRules
  remoteRules
  eligibilityRules
  languageRules
  timezoneRules
  scoringRules
  sources
```

Use whatever structure fits the current projects.

---

# 31. Priority Ranking of Role Families

Conceptual priority:

1. **Marketing Coordinator / Associate / Assistant**
2. **Digital Marketing**
3. **Social Media / Content Marketing**
4. **CRM / Email / Lifecycle Marketing**
5. **Business Development / SDR**
6. **Customer Success / Onboarding**
7. **Sales Support / Sales Operations / RevOps**
8. **Business Operations / Operations Coordinator**
9. **Market Research / Marketing Analyst**
10. **Partnerships / Affiliate / Influencer Marketing**
11. **SEO / Organic Marketing**
12. **Growth Marketing**
13. **E-commerce / Marketplace**
14. **Account Coordination / Client Services**
15. **Project / Program Coordination**
16. **Product Marketing**
17. **Paid Media / Performance Marketing**
18. **Brand / Communications / PR**

This should guide ranking, not act as an absolute restriction.

---

# 32. Searches Should Include Adjacent Titles

Do not require exact title matches.

For example:

```text
Business degree
→ marketing operations
→ sales operations
→ commercial operations
→ customer success
→ business development
→ partnerships
→ research
→ project coordination
→ account coordination
```

A good junior role may not contain `marketing` or `business` in its title.

---

# 33. Avoid False Positives

Examples of titles that look relevant but may not be:

### `Business Analyst`
Could mean:
- business strategy / operations → valid
- technical IT requirements analyst → probably not valid

### `Account Executive`
Could mean:
- junior client/account role → valid
- quota-carrying SaaS closer requiring 5 years → not valid

### `Marketing Manager`
Could mean:
- hands-on junior role in a small company → potentially valid
- senior people manager → reject

### `Operations Manager`
Usually more senior; inspect experience carefully.

### `Growth Manager`
Often mid/senior; inspect requirements.

Use the description, not only the title.

---

# 34. Phase 1 — MVP

First implement the easiest / most reliable international sources after testing them.

Likely candidates to investigate early:

- Himalayas
- We Work Remotely
- Remote OK
- Working Nomads
- Remotive
- JobRack

Then add harder / higher-volume sources:

- LinkedIn
- Wellfound
- Indeed
- Jobgether
- Glassdoor
- Otta / Welcome to the Jungle

**Do not assume this exact order.**

Choose based on actual scraping feasibility.

---

# 35. Phase 2

After MVP works:

- add more international sources
- improve company career page detection
- improve location eligibility detection
- improve salary parsing
- improve fuzzy dedup
- improve timezone extraction
- tune scoring from real search results
- add source health diagnostics
- optionally support automatic scans
- optionally add alerts for Excellent Match jobs

---

# 36. PORT / Runtime Requirement

This application should run on:

```text
PORT=3009
```

Expected local URL:

```text
http://localhost:3009
```

Do not conflict with the ports used by the existing scraper apps.

Follow the existing project's port configuration approach, for example environment variable / config file / package script depending on how the sibling projects are structured.

---

# 37. Acceptance Criteria

The project is complete when:

- app runs successfully on port `3009`
- visual style is consistent with the existing QA scraper
- multiple foreign/remote sources work
- one failed source does not break scanning
- all results are fully remote by default
- Serbia / geographic eligibility is evaluated
- full-time roles are prioritized
- junior / associate / coordinator roles are prioritized
- clearly senior roles are filtered
- marketing and business families are both represented
- salary is displayed when provided
- job cards include useful category/tool badges
- direct job URL exists
- direct employer URL is preferred where available
- Favorite works
- Applied works
- Reject works
- states persist across rescans/restarts
- duplicate listings across sites are merged
- `New` state works correctly
- source filtering works
- relevance scoring can be tuned centrally
- hard reject rules are centrally configurable
- scraper source adapters are isolated and maintainable

---

# 38. Important Final Instruction for Claude

Before writing significant code:

1. Inspect the existing QA scraper.
2. Inspect the apartment scraper.
3. Inspect the remote part-time job scraper if already present.
4. Identify reusable patterns:
   - framework
   - project structure
   - backend
   - frontend
   - scraping adapters
   - storage
   - deduplication
   - status persistence
   - card component
   - source filters
   - scan button behavior
   - new-job detection
5. Test the listed foreign job sources for real scraping feasibility.
6. Briefly report which sources are feasible and why.
7. Then implement the new app on port `3009` using the existing conventions.

Do not build an unrelated prototype.

The final product should feel like another app in the **same scraper suite**, specifically optimized for:

> **Full-time + fully remote + foreign company + Marketing / Business + Serbia eligible + early-career roles.**
