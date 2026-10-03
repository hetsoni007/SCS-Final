# Content questions for the owner

Everything on the new site comes from the live site (crawled 2026-10-01) or from the brief.
Nothing was invented. Where the live site disagrees with itself or with the brief, the live
wording was kept **as-is on each page** and the conflict is listed here for you to decide.

Each item says where to change it once you have decided.

## 1. Inconsistencies carried over from the live site

| # | What | Where it appears | Where to change |
|---|------|------------------|-----------------|
| 1 | **HR metric wording.** "40% Less payroll admin" (home stats) vs "40% less payroll processing time" / "Faster payroll" (work page, case study). | Home stats; `/work/`; `/work/hr-payroll/` | `content/site.ts` (`stats`), `content/work.ts` |
| 2 | **MVP timeline.** "8 weeks" (home H1 and the LocalBusiness schema), "6–10 weeks" (home "why us" tile and the regional pages), "10–16 weeks" (MVP page title, H1 area and services page). | `/`, `/mvp-development/`, `/services/`, regional pages | `content/site.ts`, `content/pages/*.json` |
| 3 | **How many services.** The services FAQ says "Five core services", the services page lists seven, the home page shows three. | `/services/` FAQ | `content/pages/services.json` |
| 4 | **Countries.** "30+ Countries served" (home, about stats) next to "Six countries. One standard." (about, contact). Both may be true (clients vs markets) but they read as a contradiction. | `/`, `/about/`, `/contact/` | `content/site.ts`, `content/pages/about.json` |
| 5 | **Years of experience.** "5+ years" everywhere, but the DevOps page credential bar says "15+ yrs · fintech · healthcare · enterprise". | `/devops-cloud-engineering/` | `content/pages/devops-cloud-engineering.json` |
| 6 | **Cost calculator default.** The live page's static HTML shows "$14k – $26k · ~8 weeks", but its own script computes "$11k – $19k · ~6 weeks" for the default selection as soon as it runs. The new calculator uses the script's formula, so it shows $11k – $19k. The script also carries the note "indicative blended $/week — adjust to your real pricing" ($1,800–$3,200). | `/app-cost-calculator/` | `content/tools.ts` (`rateLo`, `rateHi`, weeks) |
| 7 | **B2B Wholesale Platform** is tagged "Live on the App Store & Google Play" on the live work page, but its stack is listed as React.js + Node.js + ERP integration (a web stack), and the brief lists it under "other shipped products" with no store claim. Kept as the live site has it. | `/work/`, `/work/b2b-wholesale/` | `content/work.ts` (`status`) |
| 8 | **Privacy policy vs trackers.** The policy says "no advertising or cross-site tracking" cookies, while the live site loads the Meta Pixel and the LinkedIn Insight tag. The new site does **not** load either (see §3), which makes the policy accurate. If you want them back, the policy text needs updating first. | `/privacy/` | `content/pages/privacy.json` |

## 2. Differences between the brief and the live site

| # | Brief said | Live site has | What the new site does |
|---|-----------|---------------|------------------------|
| 1 | `/usa` is a US landing page. | `/usa` 301-redirects to the home page. The real regional pages are `/react-native-app-development-usa/`, `-uk/` and `-dubai/`. | All three regional pages are migrated on one template. `/usa` now redirects to the USA page instead of home. |
| 2 | Blog posts live at `/blog/<slug>/`. | Canonical post URLs have **no** trailing slash (`/blog/<slug>`); other pages do end in `/`. | Both forms answer 200 with no redirect; canonicals match the live site exactly. |
| 3 | The URL table omits six URLs. | The sitemap also lists `/cloud-cost-calculator/`, `/devops-maturity-assessment/`, `/hire/` and the three regional pages. | All migrated (58 of 58 sitemap URLs). See `docs/URL-MAP.md`. |
| 4 | "Hire a Developer — keep the existing slug." | The slug is `/hire/`. | Kept. `/hire-developers/` redirects to it. |
| 5 | Testimonial name "Satyam Rathuur". | "Satyam Rathaur". | Live spelling used. Please confirm. |
| 6 | AI page H1 "Build React Native apps with Claude & GPT inside, …". | H1 is "Build an app that thinks."; the sentence in the brief is the lead paragraph. | Live H1 and lead kept (SEO parity). |
| 7 | Brand colour `#7C5CFF` violet with cyan. | The live brand is gold (`#C9A24B`). | **Resolved (owner, 2026-10-03): gold.** The site uses the logo's gold on near-black, matched to the live stylesheet (`#C9A24B`, `#E8CD7E`, `#F2DA8C`, `#9A7B2E`). Tokens: `app/globals.css`; 3D colours: `lib/brand.ts` and `components/three/kit.tsx`. |
| 8 | Screens show "a looping video texture of real app UI". | No app videos exist on the live site. | Devices cross-fade the real app screenshots from `/assets/portfolio/`. Send screen recordings and they can be swapped in. |
| 9 | Founder "portrait with depth parallax". | No portrait exists; the live site shows an "HS" monogram. | A monogram tile with parallax stands in. **Placeholder** until a photo (and ideally a depth map) is supplied. |
| 10 | `AggregateRating` only if the GoodFirms review can be legitimately cited. | One GoodFirms review (5.0). | Not added. A single review is not an aggregate, and review markup for your own business is not eligible for rich results. |
| 11 | Case-study detail pages `/work/[slug]/`. | These do not exist; the work page uses anchors (`/work/#hr-payroll`). | Eight detail pages were created from the live work-page copy only. Anchors still work. These are **new URLs**. |
| 12 | 34 posts "with identical dates". | Five posts (`ai-agent-development-services`, `ai-chatbot-app-react-native`, `ai-react-native-app-development`, `on-device-ai-react-native`, `react-native-chatgpt-integration`) show no visible date or read time. | Their dates come from the live Article schema (`datePublished`). |

## 3. Things on the live site that were deliberately not ported

| What | Why | To restore |
|------|-----|-----------|
| Tawk.to live chat | Not in the brief's stack; adds ~300 KB and third-party cookies. | Add the embed in `components/ui/Chrome.tsx`, gated on consent. |
| Meta Pixel (`4314120685517416`) and LinkedIn Insight tag | Advertising trackers; conflict with the privacy policy (§1.8). | Add consent-gated scripts next to GA4 in `components/ui/Chrome.tsx` and update the policy. |
| GoodFirms embedded widget (home) | Third-party script; replaced by a static "Reviewed on GoodFirms · 5.0" line. The link currently points at goodfirms.co — **please send the exact profile URL**. | `components/sections/HomeStatic.tsx` |
| Rotating words in the work page H1 ("live on the stores. / used every day. / built to scale.") | The H1 is kept static for SEO parity. | — |
| The live lead endpoint (AWS API Gateway) | Not called by default. Set `LEAD_WEBHOOK_URL` to it and every form posts the same `{ kind, name, email, … }` payload it receives today. | `.env` |

## 4. Please confirm

1. **Phone number** `+91-8160-682185` is published in the live schema and the WhatsApp link on the WordPress page. It is kept in the `Organization` schema and that link. OK to keep public?
2. **Regional page for Dubai vs "UAE"**: the brief says UAE; the live slug and copy say Dubai. Kept as Dubai.
3. **WordPress pricing in INR**: the service page has no price list, so none was added. The INR figures inside two blog posts (cost guide and the comparison table) are ported unchanged.
4. **"4.x App Store"** rating on the Creator–Venue Marketplace is shown exactly as on the live site. A real number would be stronger.
5. **Healthcare Staffing Platform** keeps its hedged wording: "Designed to cut average shift-fill time … based on research across 18 hospitals", status "Delivered — not yet public on the stores". Its two percentages (78%, 65%) are research findings, and are labelled as such.
6. **Design concepts** (Web3 Creator, Fan Investment) are labelled "Product & UI/UX design concept" on the index, the detail page and in the page title.
7. **MVP scoper** on `/mvp-development/` (new interactive) reuses the cost calculator's ten features and week weights as an example. It is labelled as an illustration, not a quote.
8. **AI assistant demo** on `/ai-app-development/` is **off** by default (`ASSISTANT_ENABLED`). When on, it uses Claude Opus 5.5 through your own API key; see the README for cost and rate-limit notes.
9. **Cookie banner copy** is new (the live site has none). Please have it reviewed alongside the privacy policy, which was ported verbatim and still says "Last updated: June 2026".
10. **Contact page scheduler.** The Calendly calendar on `/contact/` now loads when the visitor clicks "Show available times" (new button and two short lines of copy: "Pick a time that suits you" / "The calendar is provided by Calendly and loads here when you ask for it."). Calendly sets third-party cookies as soon as it loads, so it is not loaded unasked. If you would rather it load automatically, say so: it is a one-line change in `components/sections/ContactPanel.tsx`, and the privacy policy should then mention Calendly's cookies.
11. **First-visit intro** plays on screens 768 px and wider only (not on phones), once per browser session. OK?
12. **Home hero buttons** (owner request, 2026-10-03): exactly two — "View our portfolio →" (`/work/`) and "Connect with me" (your LinkedIn profile, new tab). The live site's hero buttons ("Get Free App Scoping (15 min)" → Calendly, "Free Guide →") are gone from the hero; the Calendly call is still one click away in the header ("Book a Call"), and the guide is linked from the tools section and the footer. On phones the sticky bar on the home page shows the same two actions.
13. **Newsletter** (owner request): the email sign-up form under blog posts is replaced by a card linking to your LinkedIn newsletter, *Lead Gen Lab*, with its own LinkedIn description ("Daily lead generation experiments with real data, real outreach, and real results." · published daily). The previous line "One build lesson a week" was removed because it described a different newsletter. Text lives in `content/site.ts` (`newsletter`).
14. **New interactive sections reuse existing content; please read the few new labels.** No client, metric, price or testimonial was added. The new words are interface labels only:
    - Screen tours: headings "Inside the product." (case studies), "Tour the retail operations app.", "Tour the ride-hailing app.", "Tour the HR & payroll app." (industry pages), eyebrow "Inside the product", "Screen 1 of 4", and the screenshot descriptions already in `content/work.ts` shown as captions.
    - Embedded tools (FinTech, USA / UK / Dubai, WordPress, AI pages): eyebrow "Try it yourself", the related post's own title as the heading, and "An interactive tool from our guide. Read the full guide →".
    - Services explorer: "Full details →" links to each service's own page.
    - Home proof tiles now link to their evidence: "See the apps" (`/work/`), "Read the case study" (the creator marketplace and HR case studies), "Where we work" (`/about/`). The four numbers and labels are unchanged.
    - Home "What we value" section: the three values and their one-line descriptions are the ones already on the site, set large. Eyebrow "What we value" is new.
    - Blog posts: "Was this guide useful?" with "Yes" / "Not really", then "Thanks — glad it helped." / "Thanks — that helps us improve it." and "Ask Het a question →" (`/contact/`). The answer is sent as an analytics event only.
    - 404 page: a "Search the site" button.
15. **Privacy page: analytics switch (new).** A card under the policy heading — "Your choice / Analytics cookies / Google Analytics, which sets cookies, loads only if you accept. You can change your choice here at any time." — with an on/off switch bound to the same choice as the cookie banner. The policy text itself is unchanged. Please have the card's wording reviewed with the banner copy (item 9).
16. **Home page work list** is now a large numbered index (app name, tagline, first metric) under the 3D carousel, and the footer ends with an oversized "SONI" wordmark. Both are layout only; no copy was added.
