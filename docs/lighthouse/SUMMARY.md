# Lighthouse summary (2026-10-03, before the gold re-theme and scroll-3D layer)

Measured on a local production build (`next start`) with Lighthouse 12.8. Mobile uses Lighthouse's simulated slow-4G throttling; on localhost that inflates LCP (the page's own scripts finish before first paint), so three pages were also measured with real, applied throttling. A fresh run is due after the current round of design changes.


### Desktop

| Page | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | JS transferred | Page weight |
|---|---|---|---|---|---|---|---|---|---|---|
| `/ai-app-development/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 501 KB | 713 KB |
| `/blog/` | 94 | 100 | 100 | 100 | 0.3 s | 1.2 s | 0 ms | 0 | 502 KB | 738 KB |
| `/app-cost-calculator/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 523 KB | 728 KB |
| `/work/hr-payroll/` | 64 | 100 | 100 | 100 | 0.4 s | 0.8 s | 950 ms | 0 | 491 KB | 806 KB |
| `/contact/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 492 KB | 698 KB |
| `/devops-cloud-engineering/` | 97 | 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 500 KB | 717 KB |
| `/` | 97 | 100 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 500 KB | 912 KB |
| `/blog/react-native-app-development-cost` | 97 | 100 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 494 KB | 708 KB |
| `/privacy/` | 95 | 100 | 100 | 100 | 0.3 s | 1.2 s | 10 ms | 0 | 490 KB | 694 KB |
| `/services/` | 97 | 100 | 100 | 100 | 0.3 s | 0.6 s | 0 ms | 0 | 505 KB | 724 KB |
| `/work/` | 96 | 100 | 100 | 100 | 0.4 s | 0.7 s | 0 ms | 0 | 494 KB | 1078 KB |

### Mobile (Moto G Power emulation, slow 4G, 4× CPU slowdown)

| Page | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | JS transferred | Page weight |
|---|---|---|---|---|---|---|---|---|---|---|
| `/ai-app-development/` | 94 | 100 | 100 | 100 | 1.2 s | 3.0 s | 30 ms | 0 | 235 KB | 400 KB |
| `/blog/` | 94 | 100 | 100 | 100 | 1.2 s | 3.0 s | 20 ms | 0 | 238 KB | 418 KB |
| `/app-cost-calculator/` | 95 | 100 | 100 | 100 | 1.2 s | 2.9 s | 20 ms | 0 | 252 KB | 401 KB |
| `/work/hr-payroll/` | 36 | 100 | 100 | 100 | 1.7 s | 7.9 s | 15,300 ms | 0 | 224 KB | 493 KB |
| `/contact/` | 95 | 100 | 100 | 100 | 1.2 s | 3.0 s | 20 ms | 0 | 236 KB | 386 KB |
| `/devops-cloud-engineering/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 50 ms | 0 | 238 KB | 409 KB |
| `/` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 20 ms | 0.007 | 236 KB | 404 KB |
| `/blog/react-native-app-development-cost` | 94 | 100 | 100 | 100 | 1.2 s | 3.1 s | 30 ms | 0 | 238 KB | 412 KB |
| `/privacy/` | 89 | 100 | 100 | 100 | 1.2 s | 3.8 s | 40 ms | 0 | 217 KB | 365 KB |
| `/services/` | 94 | 100 | 100 | 100 | 1.2 s | 3.0 s | 30 ms | 0 | 236 KB | 391 KB |
| `/work/` | 92 | 100 | 100 | 100 | 1.2 s | 3.3 s | 30 ms | 0 | 241 KB | 645 KB |

### Mobile with applied (real) throttling

| Page | Perf | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| `/` | 80 | 1.8 s | 1.8 s | 730 ms | 0.007 |
| `/services/` | 84 | 1.8 s | 1.8 s | 550 ms | 0 |
| `/work/` | 82 | 1.9 s | 1.9 s | 630 ms | 0 |

The case-study page (`/work/hr-payroll/`) scored 36–64 in the batch above while the machine was under load; clean re-runs gave 97 (desktop) and 93 (mobile, 30 ms blocking time).
