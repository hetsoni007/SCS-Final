# URL map

Source: the live `sitemap.xml`, crawled 2026-10-01 (58 URLs), compared with the table in section 5 of the brief.
Every URL below answers **200** on the new site with the same title, meta description, canonical and H1 as the
live page. `tests/urls.spec.ts` enforces this on every run.

## Trailing slashes

The live site mixes forms: pages end in `/`, blog posts do not, and the home canonical has no slash.
`next.config.ts` sets `skipTrailingSlashRedirect`, so **both forms of every URL answer 200 without a redirect**
and each page's canonical tag names the same form the live site uses.

## Pages (24)

| URL | Live title | In the brief's table | Rendered by |
|---|---|---|---|
| `/` | React Native & AI App Development Company \| Soni Consultancy | yes | `app/page.tsx` |
| `/about/` | About \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/ai-app-development/` | AI App Development \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/app-cost-calculator/` | App Development Cost Calculator \| Soni Consultancy Services | yes | `app/app-cost-calculator/page.tsx` |
| `/app-scoping-guide/` | Free App Scoping Guide for Founders \| Soni Consultancy | yes | `app/app-scoping-guide/page.tsx` |
| `/blog/` | Blog — App Development Insights \| Soni Consultancy Services | yes | `app/blog/page.tsx` |
| `/cloud-cost-calculator/` | Cloud Cost Calculator \| Soni Consultancy Services | **no — added from sitemap** | `app/cloud-cost-calculator/page.tsx` |
| `/contact/` | Contact \| Soni Consultancy Services | yes | `app/contact/page.tsx` |
| `/devops-cloud-engineering/` | DevOps & Cloud Engineering \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/devops-maturity-assessment/` | DevOps Maturity Assessment \| Soni Consultancy Services | **no — added from sitemap** | `app/devops-maturity-assessment/page.tsx` |
| `/fintech-app-development/` | FinTech App Development \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/hire/` | Hire React Native Developers \| Soni Consultancy Services | **no — added from sitemap** | `app/[slug]/page.tsx (shared template)` |
| `/hr-payroll-app-development/` | HR & Payroll App Development \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/mvp-development/` | MVP Development Company \| Build Your MVP in 10–16 Weeks | yes | `app/[slug]/page.tsx (shared template)` |
| `/react-native-app-development-dubai/` | React Native App Development Dubai & UAE | **no — added from sitemap** | `app/[slug]/page.tsx (shared template)` |
| `/react-native-app-development-uk/` | React Native App Development UK \| Soni Consultancy Services | **no — added from sitemap** | `app/[slug]/page.tsx (shared template)` |
| `/react-native-app-development-usa/` | React Native App Development USA \| Soni Consultancy Services | **no — added from sitemap** | `app/[slug]/page.tsx (shared template)` |
| `/react-native-app-development/` | Hire React Native Developers \| Development Company | yes | `app/[slug]/page.tsx (shared template)` |
| `/retail-app-development/` | Retail App Development \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/ride-hailing-app-development/` | Ride-Hailing App Development \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/services/` | App Development Services \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/wordpress-website-development-india/` | WordPress Development India \| Soni Consultancy Services | yes | `app/[slug]/page.tsx (shared template)` |
| `/work/` | Case Studies: React Native Apps & Enterprise Platforms | yes | `app/work/page.tsx` |
| `/privacy/` | Privacy Policy \| Soni Consultancy Services | yes | `app/privacy/page.tsx` |

## Blog posts (34)

All rendered by `app/blog/[slug]/page.tsx` from `content/blog/<slug>.mdx`. Canonical form: `/blog/<slug>` (no trailing slash).

- `/blog/ai-agent-development-services` — AI Agent Development Services in 2026
- `/blog/ai-app-development-cost-2026` — How Much Does It Cost to Build an AI App in 2026?
- `/blog/ai-chatbot-app-react-native` — AI Chatbot App with React Native: Cost & Timeline
- `/blog/ai-react-native-app-development` — How to Build an AI-Powered React Native App (2026)
- `/blog/app-maintenance-cost` — What App Maintenance Really Costs After Launch (2026)
- `/blog/app-monetization-models` — App Monetization Models 2026 — Interactive Revenue Explorer
- `/blog/app-store-launch-checklist` — App Store & Google Play Launch: A 2026 Submission Checklist
- `/blog/aws-cloud-migration-guide` — AWS Cloud Migration: A Practical Guide for 2026
- `/blog/bsa-aml-software-build-vs-buy` — BSA/AML Software: Build vs Buy in 2026
- `/blog/build-vs-buy-ai-cto-framework` — Build vs Buy AI: A CTO's Decision Framework
- `/blog/can-ai-build-my-app` — Can AI Build My App? An Honest 2026 Answer for Founders
- `/blog/ci-cd-react-native` — CI/CD for React Native Apps: A 2026 Setup Guide
- `/blog/dpdp-act-app-compliance-india` — DPDP Act for Apps: 2026 Deadlines & Readiness Check
- `/blog/hire-react-native-developers` — How to Hire React Native Developers in 2026
- `/blog/how-long-to-build-an-app` — How Long Does It Take to Build a Mobile App in 2026?
- `/blog/kotlin-multiplatform-vs-react-native` — Kotlin Multiplatform vs React Native (2026)
- `/blog/mobile-app-security-checklist` — Mobile App Security Checklist for 2026
- `/blog/mvp-tech-stack-2026` — How to Choose Your MVP Tech Stack in 2026
- `/blog/mvp-to-product-market-fit` — From MVP to Product-Market Fit: What Changes After Launch
- `/blog/native-vs-cross-platform-2026` — Native vs Cross-Platform in 2026: Decision Tool
- `/blog/nextjs-saas-architecture` — Next.js SaaS Architecture Patterns
- `/blog/on-device-ai-react-native` — On-Device AI in React Native (Offline & Private)
- `/blog/rbi-fintech-app-compliance-india` — RBI Compliance for Fintech Apps in India (2026)
- `/blog/react-native-app-development-cost` — React Native App Development Cost in 2026
- `/blog/react-native-chatgpt-integration` — Integrate ChatGPT & LLMs into a React Native App
- `/blog/react-native-new-architecture-2026` — React Native New Architecture: 2026 Migration Guide
- `/blog/react-native-push-notifications` — React Native Push Notifications: 2026 Setup Guide
- `/blog/react-native-vs-flutter-2026` — React Native vs Flutter in 2026
- `/blog/super-app-development` — Super Apps & Mini Apps in 2026: Worth Building?
- `/blog/validate-app-idea-before-building` — How to Validate Your App Idea Before You Build It (2026)
- `/blog/woocommerce-payment-gateway-india` — Razorpay vs PayU vs Cashfree | Soni Consultancy Services
- `/blog/wordpress-seo-speed-checklist` — WordPress SEO & Speed Checklist | Soni Consultancy Services
- `/blog/wordpress-vs-custom-website` — WordPress vs Custom Website 2026 | Soni Consultancy Services
- `/blog/wordpress-website-cost-india` — WordPress Cost India 2026 | Soni Consultancy Services

## Diff against the brief (section 5)

| Brief | Live site | Result |
|---|---|---|
| `/usa` — a US landing page |  | 301 → `/` | 308 → `/react-native-app-development-usa/` (the real US page) |
| "Hire a Developer — keep the existing slug" | `/hire/` | `/hire/` kept; `/hire-developers/` 308 → `/hire/` |
| not listed | `/cloud-cost-calculator/` | migrated, with its calculator logic |
| not listed | `/devops-maturity-assessment/` | migrated, with its scoring logic |
| not listed | `/react-native-app-development-usa/`, `-uk/`, `-dubai/` | migrated on the regional template |
| `/blog/<slug>/` |  | `/blog/<slug>` | both answer 200; canonical without the slash, as live |
| `/work/[slug]/` detail pages |  | do not exist (anchors on `/work/`) | **new**: 8 pages; `/work/#<slug>` anchors still work |

## New URLs (not on the live site)

- `/work/hr-payroll/`, `/work/creator-marketplace/`, `/work/retail-ops/`, `/work/ride-hailing/`, `/work/b2b-wholesale/`, `/work/healthcare-staffing/`, `/work/web3-creator/`, `/work/fan-investing/`
- `/lab/` — component and 3D scene showcase (`noindex`, disallowed in robots.txt)
- `/sitemap.xml`, `/robots.txt`, `/search-index.json`, per-page `/…/opengraph-image`
