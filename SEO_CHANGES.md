# SEO changes, November 2026 (branch `seo-fixes-nov-2026`)

Nothing here has been deployed or merged. Review the PR, then deploy with `npm run deploy:aws` (see "After you merge").

## What the repo is

| Item | Finding |
|---|---|
| Framework / router | Next.js 16.3.8, **App Router** (`app/`), React 19, Tailwind 4, TypeScript |
| Hosting | **Static export to S3 + CloudFront** (`STATIC_EXPORT=1 next build`, `scripts/prepare-static.mjs`, `scripts/deploy-aws.sh`). No `vercel.json` / `netlify.toml`. Vercel Analytics only renders when built on Vercel. |
| Redirects | `next.config.ts` `redirects()` **does not run in the static export**. Production redirects live in the CloudFront Function `scs-url-rewrite`; the source of truth for what it must contain is `docs/SEO-REDIRECTS.md`. |
| Sitemap / robots | `app/sitemap.ts`, `app/robots.ts` (generated from page JSON, blog posts and `content/work.ts`) |
| Schema (JSON-LD) | `lib/schema.tsx` (Organization, WebSite, Person, FAQ helpers), emitted by `app/layout.tsx` and `app/page.tsx`; page-level JSON-LD in `content/pages/*.json`; per-post JSON-LD in `content/blog-embeds/*.jsonld.json` |
| GA4 / GTM | `components/ui/ChromeExtras.tsx` (GA4, after consent), `app/layout.tsx` (GTM + Consent Mode), `lib/analytics.ts` (`track()`), measurement ID from `NEXT_PUBLIC_GA_ID` (one ID) |
| Calculator | `app/app-cost-calculator/page.tsx`, copy in `content/pages/app-cost-calculator.json`, logic in `content/tools.ts`, UI in `components/tools/Calculators.tsx` |

Checked against the live site on 2026-11-01: it is already this Next.js build (77 sitemap URLs).

## Files changed and why

| File | Why |
|---|---|
| `next.config.ts` | Task 1: specific `/portfolio/*` destinations, `/hire/fullstack-developer`, trailing-slash variants, explicit `statusCode: 301` (Next's `permanent: true` sends 308) |
| `docs/SEO-REDIRECTS.md` | Task 1: the updated CloudFront Function mapping to deploy (this is what production actually uses) |
| `tests/urls.spec.ts` | Task 1: asserts every old URL answers 301 to the right place, with and without a trailing slash |
| `content/pages/app-cost-calculator.json` | Task 3: title, description, H1, lead, byline + "Last updated", 5-question FAQ (visible and FAQPage JSON-LD, same strings), internal links, `author`/`dateModified` on the WebApplication schema |
| `tests/fixtures/live-pages.json` | Task 3: the parity fixture for the calculator's new title / description / H1 / FAQ count |
| `content/blog/*.mdx` (17 posts) | Task 4: one contextual sentence linking the closest service page, the calculator, or a free tool; `related:` additions so low-inbound posts get a "Keep reading" card |
| `content/pages/{about,services,hr-payroll-app-development,ride-hailing-app-development,retail-app-development,fintech-app-development}.json` | Task 4: contextual links to case studies, industry pages and the UK / Dubai / USA pages |
| `app/blog/page.tsx` | Task 5: newest first by `datePublished` (ties keep the old `indexOrder`); the first card is the featured one |
| `app/blog/[slug]/page.tsx`, `lib/content.ts` | Task 5: visible "Published … · Updated …" dates, byline linking the author to LinkedIn, author box links to `/about/` and LinkedIn |
| `content/home.ts`, `components/sections/Hero.tsx`, `content/pages/index.json` | Task 5: "4+ apps" → "10+ apps delivered" (see "Could not verify") |
| `content/site.ts`, `lib/schema.tsx`, `content/pages/about.json` | Task 5: GoodFirms added to Organization `sameAs`; About-page Person gets the same `@id` as the home-page Person so they merge. TODOs for Clutch and GitHub |
| `lib/analytics.ts`, `app/layout.tsx`, `components/ui/ChromeExtras.tsx` | Task 6: GA4 and GTM only run on `soniconsultancyservices.com` / `www.` |
| `components/ui/LeadForm.tsx`, `components/providers/AppProviders.tsx`, `components/tools/Calculators.tsx` | Task 6: `generate_lead`, `book_call`, `calculator_complete` |
| `tests/ga-events.spec.ts` | Task 6: Playwright test (maps the production hostname to the local server) proving the three events fire once with `page_path` and no email, and that localhost sends nothing |
| `app/sitemap.ts` | Task 7: `lastmod` for the calculator and the blog index |

## Redirects (Task 1)

| Old path (with and without trailing slash) | 301 to | Live today (2026-11-01) |
|---|---|---|
| `/portfolio` | `/work/` | 301 to `/work/` already |
| `/case-study` | `/work/` | 301 already |
| `/portfolio/station-driver-chauffeurs` | `/work/ride-hailing/` | 301 to `/work/` (**needs the new mapping**) |
| `/portfolio/attendance-salary-ledger` | `/work/hr-payroll/` | 301 to `/work/` (**needs the new mapping**) |
| `/portfolio/retail-supply-chain` | `/work/retail-ops/` | 301 to `/work/` (**needs the new mapping**) |
| `/hire/fullstack-developer` | `/hire/` | **404** (needs the new mapping) |
| `/estimate` | `/app-cost-calculator/` | 301 already |
| `/services/enterprise-software-development` | `/services/` | 301 already |
| other `/portfolio/*` | `/work/` | 301 already |

**Not redirected: `/work/healthcare-staffing/`.** It is a real, live case-study page (HTTP 200 today, in the sitemap, in `content/work.ts`, covered by `tests/smoke.spec.ts`). Redirecting it to `/work/` would delete a published case study. It is probably in the Search Console 404 list from an earlier crawl. Tell me if you want it redirected anyway: it is a two-line change.

Old URLs in the sitemap or internal links: none. The sitemap is generated from current pages, and a scan of all content, templates and components found no link to any old path (the only `/portfolio` strings are `/assets/portfolio/` image paths).

## Task 2: broken `/search?q={search_term_string}`

Nothing to remove. There is no `SearchAction` / `potentialAction` anywhere in the source (`websiteSchema()` in `lib/schema.tsx` has none), none in any of the 77 live pages (scanned), and no `/search` page exists. `docs/SEO-REDIRECTS.md` already notes the URL came from the old site's markup. Expect it to drop out of Search Console on its own; "Validate fix" speeds it up.

## Task 3: calculator page

Done as specified except for one number, which is a decision for you.

- **The $14k–$26k range is stale and I did not use it.** It exists only in the old extracted markup in `app-cost-calculator.json` (that section is replaced by the live component, so it is never rendered). The real calculator defaults to **~6 weeks, $2k–$3.5k** (rates changed 2026-10-04; `tests/smoke.spec.ts` asserts this). Putting $14k–$26k in the title/lead would contradict what the visitor sees one scroll later. The description and lead use the figures already on the contact page instead: **MVPs from $2,500, features from $1,000, websites from $500**, and "in our model a lean MVP takes about 7 weeks" (the FAQ's existing figure). If you want a different headline range, tell me which.
- Title is 56 characters, description 149.
- The FAQ went from 6 to 5 questions. The dropped one ("Is the calculator free, and do I need to sign up?") is now answered in the lead. Visible FAQ text and FAQPage JSON-LD are the same strings (tags stripped).
- "Last updated: 1 November 2026" is a hard-coded date; update it when the page changes.
- Pre-existing inconsistency, left alone: the FAQ says a lean MVP is about 7 weeks and market-ready about 25 weeks, while the calculator's default shows 6 weeks.

## Task 4: internal linking

- Every cost / pricing / estimator post already linked `/app-cost-calculator/` except `wordpress-website-cost-india`, which now does.
- Homepage body (Calculator card in `content/home.ts`) and footer ("App cost estimate") already linked it; no change.
- Closest-service link added to the 13 posts that lacked one: android-app-development-cost, app-cost-estimator, app-development-cost-india, can-ai-build-my-app, dpdp-act-app-compliance-india, how-to-scope-an-app, kotlin-multiplatform-vs-react-native, mobile-app-cost-examples, shopify-leaving-react-native, super-app-development, and `/mvp-development/` on mvp-to-product-market-fit, mvp-tech-stack-2026, validate-app-idea-before-building.
- **The 23 "not indexed" pages are my estimate, not Search Console's.** I do not have the GSC export, so I took the 23 sitemap URLs with the fewest contextual inbound links (nav, footer and index grids excluded): the 8 `/work/<slug>/` case studies, the UK / Dubai / USA pages, `/devops-maturity-assessment/`, `/cloud-cost-calculator/`, `/about/`, `/ride-hailing-app-development/`, `/hr-payroll-app-development/`, and the posts app-monetization-models, hire-react-native-developers-india, super-app-development, core-elements-of-an-ai-agent, mvp-app-development-guide, react-native-push-notifications, android-app-development-cost. Each now has at least two contextual inbound links from stronger pages. Send me the real list and I will redo this against it.
- What I added: a "Recent work" paragraph (all 8 case studies, the two concepts labelled as design concepts) and a market sentence on About and Services; case-study links from the HR & Payroll, Ride-Hailing and Retail industry pages; the Fan Investment concept from FinTech; `related:` additions between topically close posts; `/about/` now gets a link from every post's author box.
- Note: the footer already linked the UK / Dubai / USA pages and both free tools sitewide, so for those pages "not indexed" is not an internal-link problem.

## Task 5: blog and trust signals

- Blog index is newest first. Most posts share the date 2026-10-04, so inside that date the previous manual order is kept.
- Every post shows "By Het Soni" (linked to LinkedIn), the published date and, when different, the updated date, all visible.
- Homepage: "4+ products shipped" (hero line) and the "4+ apps live" stat are now "10+ apps delivered". Counters already render the real value in server HTML (`Counter` outputs `{value}` and only animates after hydration); verified in the served HTML.
- Organization + Person JSON-LD were already emitted on the home page and About (Organization sitewide from the layout). Changes: GoodFirms added to Organization `sameAs`; About's Person now carries `@id: …/#het-soni`.
- **Clutch: TODO** in `content/site.ts` (`profiles`). **GitHub: also a TODO.** You listed GitHub, but no GitHub profile URL exists anywhere in the codebase and you asked for existing URLs only. Give me the URL and it is one line. Person `sameAs` stays LinkedIn + Medium (Instagram and Facebook are the company's accounts, not Het's).

## Task 6: GA4 and bot noise

- One measurement ID only (`NEXT_PUBLIC_GA_ID`), loaded only after the visitor accepts analytics cookies. New: GA4, the GTM container and every `track()` call are skipped unless the hostname is `soniconsultancyservices.com` or `www.` (exact match; look-alike hosts are rejected). The GTM boot logic was checked for six hostnames. `<noscript>` GTM iframe cannot check the hostname; it only exists when `NEXT_PUBLIC_GTM_ID` is set at build, so do not set it for preview builds.
- New events (all carry `page_path`, none carry personal data):
  - `generate_lead`: when a lead form is delivered successfully (`res.ok`), for **every** lead form (contact, calculator gate, scoping guide, WordPress, etc.) with `form: <kind>`. Not sent when delivery fails.
  - `book_call`: whenever the Calendly modal opens, sent **alongside** the existing `book_call_click` and `calendly_open` so GA4 history is unbroken.
  - `calculator_complete`: once per visit, when the visitor first changes the app calculator and its result updates (the result is visible from page load, so "first changed scope" is the meaningful moment). The existing `calc_complete` (email gate submitted) is unchanged.
- **UTM tagging for you.** `lib/attribution.ts` keeps `utm_source`, `utm_medium`, `utm_campaign` (first touch per session) and attaches them to every lead. Suggested links:
  - LinkedIn post: `https://soniconsultancyservices.com/app-cost-calculator/?utm_source=linkedin&utm_medium=social&utm_campaign=<topic>`
  - LinkedIn profile / Featured: `?utm_source=linkedin&utm_medium=profile&utm_campaign=bio`
  - Instagram bio: `?utm_source=instagram&utm_medium=social&utm_campaign=bio`; for a post use the post topic as `utm_campaign`.
  - Lowercase, no spaces, one campaign name per post. Do not tag internal links.
- **Bot traffic (proposal only, nothing applied).** This site is on CloudFront, not Vercel, so there is no Vercel Firewall. The consent gate plus the hostname guard already stop most junk from reaching GA4 (bots rarely click "Accept"). Steps for the dashboard:
  1. GA4 → Admin → Data collection → confirm "Enable Google signals" is off if you do not need it; Reports → add a comparison excluding Country = Singapore to read clean numbers (GA4 cannot delete past data).
  2. AWS console → WAF & Shield → Web ACLs → region **Global (CloudFront)** → create a Web ACL and attach it to the `soniconsultancyservices.com` distribution.
  3. Add managed rule groups **AWSManagedRulesAmazonIpReputationList** and **AWSManagedRulesBotControlRuleSet** (Common level), each set to **Count** first.
  4. Add a **rate-based rule** (start at 300 requests / 5 min per IP) set to Count.
  5. After a week, open the Sampled requests / CloudWatch metrics for each rule; switch to Block only the ones that matched bots and none of your real visitors. Do not geo-block Singapore without checking that no real lead came from there.
  6. WAF Bot Control and logging add cost; check the pricing page before enabling the targeted level.

## Task 7: sitemap, robots, canonicals

- Crawled the sitemap against the running site: **77 URLs, all HTTP 200, each page's canonical equals its `<loc>`, none `noindex`, no duplicates**. No redirected or 404 URL is in it.
- `lastmod`: posts already had it (45 URLs). Added for `/app-cost-calculator/` and `/blog/`. Pages carry no dates in their content, so the rest are intentionally left without `lastmod` rather than guessed.
- `robots.txt`: `Allow: /`, `Disallow: /lab/`, `Sitemap: https://soniconsultancyservices.com/sitemap.xml`. Crawling is allowed.
- **"Alternate page with proper canonical tag" (your 4 pages):** I cannot see which four. The mechanism is by design (`docs/URL-MAP.md`): `skipTrailingSlashRedirect` makes both `/about` and `/about/` answer 200, and each canonical names the slash form. Every one of the 76 non-home URLs has such an alternate. No internal link in the source uses the non-canonical form, so Google found those four from somewhere else (old backlinks, the previous site, a sitemap in the past). This is the intended behaviour; Google folds them into the canonical. Paste the four URLs and I will confirm each.
- **"Page with redirect" (your 6):** the old-site paths above (`/portfolio…`, `/case-study`, `/estimate`, `/services/enterprise-software-development`, `/usa`, `/hire-developers`). Intended.
- Existing `/usa` and `/hire-developers` redirects in `next.config.ts` still use `permanent: true` (308 on a Node server). I left them (out of scope); production sends 301 from CloudFront.

## Verification

- `npm run lint`: clean. `npx tsc --noEmit`: clean. `npm run build` (production, all routes): passes.
- `playwright test tests/urls.spec.ts`: 63 passed (URL parity incl. the new calculator fixture, new redirect test, sitemap, broken-link crawl).
- `playwright test tests/smoke.spec.ts` (desktop): 51 passed, 17 skipped (mobile-only), including axe on `/app-cost-calculator/`, `/about/`, blog pages.
- `playwright test tests/ga-events.spec.ts`: 3 passed.

## Could not verify

- CloudFront behaviour for the new redirects: the function change is documented but I did not deploy or edit it. `tests/urls.spec.ts` with `STATIC_HOST` will fail on the new redirect test until the function is updated.
- Search Console and GA4 data (no access): the 23 / 4 / 6 page lists, indexing status, GA4 key-event setup.
- **"10+ apps delivered"** is your figure; nothing in the repo supports it. About still says "4+ apps live across 8 store listings", and the React Native pages say "Four React Native apps". Pick one number and I will align the rest.
- Lighthouse / Core Web Vitals not re-run.
- GA4 events were verified with a stubbed `gtag` on a mapped hostname, not against a live GA4 property.

## After you merge

1. Deploy: `npm run deploy:aws` (add `-- --dry-run` first). Then update the CloudFront Function `scs-url-rewrite` from `docs/SEO-REDIRECTS.md` and publish it.
2. Search Console: open each 404 group (`/portfolio/...`, `/hire/fullstack-developer`, `/search?q=…`) and click **Validate fix**; submit `https://soniconsultancyservices.com/sitemap.xml`; use URL Inspection → **Request indexing** for `/app-cost-calculator/`, `/mvp-development/`, `/react-native-app-development/`, `/services/`, `/hire/`, `/work/`, `/contact/`.
3. GA4 → Admin → Events: mark `generate_lead`, `book_call` and `calculator_complete` as **key events** (they appear after the first hit; `book_call_click` can stay).
4. Bot blocking: the WAF steps under Task 6.
5. Send me: the real "not indexed" and "alternate canonical" URL lists, the GitHub / Clutch URLs, a decision on `/work/healthcare-staffing/`, the headline price range, and the 10+ apps source.
