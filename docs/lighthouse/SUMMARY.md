# Lighthouse summary (2026-10-03, after the gold re-theme, the scroll motion layer and the interactive sections)

Measured on commit `33bd696` with Lighthouse 12.8 against a local production build (`next start`), one run per page,
13 page types, desktop and mobile. `node scripts/lh-summary.mjs <reports folder>` builds these tables from the JSON
reports.

**Against the budgets**

| Budget | Result |
|---|---|
| Desktop performance ≥ 90 | 95–98 on all 13 pages |
| Mobile performance ≥ 90 (≥ 80 on 3D-heavy pages) | 92–95 on 12 pages; `/work/` (the portfolio index, the heaviest page at 649 KB) scored 89 |
| Accessibility ≥ 95 | 100 on every page, desktop and mobile |
| Best practices ≥ 95 | 100 on every page |
| SEO 100 | 100 on every page |
| CLS < 0.05 | 0–0.007 |
| LCP < 2.0 s | Desktop 0.6–1.1 s. Mobile 2.9–3.8 s under Lighthouse's *simulated* slow 4G (see the note below) |

**How to read these numbers**

- The run was taken on the owner's Mac with the app's preview pane open (another copy of the site animating WebGL),
  so the performance scores are, if anything, on the low side. Accessibility, best practices and SEO do not depend
  on machine load.
- Mobile uses Lighthouse's simulated slow-4G throttling. On localhost that inflates LCP: the page's own scripts are
  modelled as finishing before first paint. With real, applied throttling three pages were measured at an LCP of
  1.8–1.9 s (table at the end). That measurement is from the build before the re-theme and has not been repeated on
  this one.
- One run per page: a single score can move by a few points between runs. Earlier passes in this session, taken
  while other work was running on the machine, came out 5–30 points lower on individual pages; the tables below are
  from one pass with nothing else running.

### Desktop

| Page | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | JS transferred | Page weight |
|---|---|---|---|---|---|---|---|---|---|---|
| `/about/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 499 KB | 710 KB |
| `/ai-app-development/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 508 KB | 726 KB |
| `/blog/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 504 KB | 743 KB |
| `/app-cost-calculator/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 524 KB | 732 KB |
| `/work/hr-payroll/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 494 KB | 812 KB |
| `/contact/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 493 KB | 703 KB |
| `/devops-cloud-engineering/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 502 KB | 721 KB |
| `/hire/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 506 KB | 719 KB |
| `/` | 95 | 100 | 100 | 100 | 0.3 s | 0.8 s | 120 ms | 0 | 495 KB | 907 KB |
| `/blog/react-native-app-development-cost` | 98 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 493 KB | 712 KB |
| `/privacy/` | 95 | 100 | 100 | 100 | 0.3 s | 1.1 s | 0 ms | 0 | 502 KB | 709 KB |
| `/services/` | 96 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 524 KB | 738 KB |
| `/work/` | 96 | 100 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 495 KB | 1083 KB |

### Mobile (Moto G Power emulation, slow 4G, 4× CPU slowdown)

| Page | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | JS transferred | Page weight |
|---|---|---|---|---|---|---|---|---|---|---|
| `/about/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 30 ms | 0 | 236 KB | 390 KB |
| `/ai-app-development/` | 94 | 100 | 100 | 100 | 1.2 s | 3.0 s | 30 ms | 0 | 244 KB | 414 KB |
| `/blog/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 20 ms | 0 | 238 KB | 421 KB |
| `/app-cost-calculator/` | 95 | 100 | 100 | 100 | 1.2 s | 2.9 s | 20 ms | 0 | 253 KB | 404 KB |
| `/work/hr-payroll/` | 92 | 100 | 100 | 100 | 1.2 s | 3.4 s | 20 ms | 0.001 | 228 KB | 500 KB |
| `/contact/` | 95 | 100 | 100 | 100 | 1.2 s | 3.0 s | 30 ms | 0 | 237 KB | 390 KB |
| `/devops-cloud-engineering/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 20 ms | 0 | 239 KB | 412 KB |
| `/hire/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 30 ms | 0 | 243 KB | 404 KB |
| `/` | 94 | 100 | 100 | 100 | 1.2 s | 3.0 s | 30 ms | 0.007 | 216 KB | 388 KB |
| `/blog/react-native-app-development-cost` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 20 ms | 0 | 223 KB | 400 KB |
| `/privacy/` | 95 | 100 | 100 | 100 | 1.2 s | 3.0 s | 20 ms | 0 | 219 KB | 369 KB |
| `/services/` | 93 | 100 | 100 | 100 | 1.2 s | 3.1 s | 100 ms | 0 | 240 KB | 398 KB |
| `/work/` | 89 | 100 | 100 | 100 | 1.2 s | 3.8 s | 30 ms | 0 | 241 KB | 649 KB |

### Mobile with applied (real) throttling — earlier build, before the re-theme

| Page | Perf | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| `/` | 80 | 1.8 s | 1.8 s | 730 ms | 0.007 |
| `/services/` | 84 | 1.8 s | 1.8 s | 550 ms | 0 |
| `/work/` | 82 | 1.9 s | 1.9 s | 630 ms | 0 |

### What changed since the previous summary

- Accessibility stayed at 100 only after two fixes found by this run: text that was still fading in at the edge of
  the viewport failed contrast (the fade is now a one-time transition, not tied to the scroll position), and a card in
  its entrance pose covered the blog filter chips (every scroll pose now stays inside the element's own layout box;
  `tests/smoke.spec.ts` and `scripts/reveal-bounds.mjs` guard this).
- Two new pages are measured: `/hire/` and `/about/`.
