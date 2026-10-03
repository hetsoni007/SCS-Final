# Soni Consultancy Services — website

The 3D redesign of [soniconsultancyservices.com](https://soniconsultancyservices.com): Next.js (App Router, static),
Tailwind, React Three Fiber, GSAP, Motion and Lenis. Every page, URL, title, description and canonical from the live
site (crawled 2026-10-01) is carried over; the layout, motion and 3D are new.

- **Open questions for the owner:** [`CONTENT-QUESTIONS.md`](CONTENT-QUESTIONS.md)
- **URL map and diff against the brief:** [`docs/URL-MAP.md`](docs/URL-MAP.md)
- **What differs from the brief, and why:** [Deviations](#deviations-from-the-brief)

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build of all 139 routes (what the tests run against)
npm run start        # serve the production build
npm run build:static # static export for S3 + CloudFront: out/ then dist/ (see "Deploying to S3 + CloudFront")
npm run serve:dist   # serve dist/ locally with the CloudFront URL rewrite, http://127.0.0.1:3200
npm run deploy:aws   # build, upload to S3, invalidate CloudFront (add -- --dry-run to preview)
npm run lint         # ESLint (must be clean)
npm run typecheck    # tsc --noEmit
npm run test:e2e     # Playwright: URL parity, smoke, mobile, accessibility, WebGL (needs a build first)
npm run budget       # initial JavaScript per route against the 180 KB budget (needs `npm run start -- -p 3100`)
```

Node 20.9+ is required. Copy `.env.example` to `.env.local` when you want forms, analytics or the AI demo to do
something; the site runs without any environment variables.

## How the site is put together

```
app/
  page.tsx                    Home (bespoke sections)
  [slug]/page.tsx             15 marketing pages on one template (+ per-page interactive sections)
  work/, work/[slug]/         Portfolio index and case-study template
  blog/, blog/[slug]/         Blog index and MDX post template
  contact/, app-cost-calculator/, cloud-cost-calculator/, devops-maturity-assessment/,
  app-scoping-guide/, privacy/, lab/, not-found.tsx
  sitemap.ts, robots.ts, */opengraph-image.tsx
components/
  providers/AppProviders.tsx  Motion preference, GPU tier, Lenis, Calendly modal, ⌘K palette
  lazy.tsx                    Code-split entry points (forms, widgets, per-page interactive sections)
  three/                      GLRoot (the one shared <Canvas>), ViewSlot, kit, shaders/, scenes/
  sections/                   Home sections, shared page template, blocks renderer, work, blog, extras/
  mdx/                        Blog components: Widgets (5 families), Demos, Callout, Faq, Embed
  tools/Calculators.tsx       App cost, cloud cost and DevOps maturity tools
  ui/                         Nav, Footer, MobileBar, LeadForm, Chrome (+ ChromeExtras: cursor, consent,
                              exit intent, analytics), Rich, Bits …
content/                      ← all copy lives here
lib/                          content loader, schema (JSON-LD), motion presets, GPU tier, analytics, prefs
tests/                        Playwright suites + the live-site fixture they compare against
scripts/                      Content extractors, screenshot helper, JS budget check, CPU profiler
```

### The 3D layer in one paragraph

There is exactly **one** WebGL canvas (`components/three/GLRoot.tsx`), fixed behind the page. A page places a scene by
rendering `<ViewSlot scene="…">` (or `<SceneBox>` from a server component): an ordinary DOM box with a static poster
inside. Once WebGL is available the canvas draws the scene into that box's rectangle. Scenes are lazy chunks, mount
only when their slot nears the viewport, and the render loop stops when no slot is visible or the tab is hidden.
The hero's H1 and CTAs are server-rendered HTML and never wait for 3D.

**When the canvas mounts** (`components/providers/AppProviders.tsx`): with a mouse or trackpad, after the page has
loaded and the browser is idle. On touch devices, at the visitor's first touch, scroll or key press, or 6 seconds
after load, whichever comes first, so a phone is interactive before it starts compiling shaders. Layout never
depends on that moment: pages size themselves for 3D as soon as a capable GPU is detected (`expectGl`) and show the
poster in the same box until the scene takes over.

**Start-up is built not to block the page.** The GPU check runs in a Web Worker and is remembered for the tab session
(`lib/gpu-tier.ts`). Each scene stays hidden behind its poster until its shaders have compiled in parallel
(`Warm` in `GLRoot.tsx`, `Compiled` in `kit.tsx` for content that loads later), and every scene shares one
reflection environment that is built once per page in the same non-blocking way (`components/three/studio-env.ts`). The
poster fades out when the slot gets `data-ready="1"`. Measured on the home page (M1 MacBook, no CPU throttling): no
main-thread task over 150 ms and 55–85 ms of total blocking time, down from a single 300–900 ms task. Slower devices
will see longer tasks; `node scripts/profile.mjs <url> 4 10 gpu desktop` measures with 4× CPU throttling.

**First-visit intro** (`components/ui/Preloader.tsx`): on screens 768 px and wider, once per browser session, never with reduced
motion or data saver. The cover is server-rendered and switched on by the inline boot script in `app/layout.tsx`,
so it is the first thing painted; the particle animation takes it over when JavaScript is ready within 0.9 s and
ends by 2.2 s. If JavaScript is slower, the cover fades out on its own after 1.2 s, so the intro can never hold the
page back. The hero entrance (CSS) starts when the intro hands over.

### Motion on scroll

Every `data-reveal` element inside a page section is tied to its own position in the viewport with CSS scroll-driven
animations (`animation-timeline: view()` in `app/globals.css`): it rises out of depth as it enters, sits flat while
it is read and tilts back as it leaves. Headings flip up, cards fan in from alternate sides, media drifts. The
movement runs on the compositor and reverses with the scroll. Browsers without scroll-driven animations (Firefox
today) get a one-time fade-and-rise from an IntersectionObserver; reduced motion switches both off.
Five details worth knowing before changing it:

- **Opacity is never tied to the scroll position.** The fade-in is a one-time transition that plays when the reveal
  observer adds `.in`; only the movement is scroll-linked. Text on screen is therefore either not shown yet or at
  full strength, never half-faded at the edge of the viewport (which fails contrast checks and is hard to read).

- **Every pose stays inside the element's own layout box.** Each element has its own perspective (the vanishing
  point is the element, not a shared parent: a parent's perspective shears and pushes anything far from the middle of
  a tall container), it turns about the edge away from its direction of travel, and it is never moved up or down.
  Nothing can drift over its neighbours, which also keeps touch targets from being covered.
- A card's pointer tilt (class `spot`; `--px` / `--py` from the pointer handler) is part of the same transform,
  through the typed properties `--tx` / `--ty`, so it eases and composes with the scroll pose.
- A block taller than the screen (a form, a long tool) is marked `data-tall` by the reveal observer in
  `AppProviders.tsx` and does not move at all; it only fades in and stays put while it is in use.
- A gold hairline at the top of every page shows scroll progress (`.scroll-progress`; blog posts use the article's
  own `ReadingProgress` instead) and the home page's values fill in as they scroll into view (`.manifesto-line`).

### Interactive sections

Each page type has a section the visitor can operate, built from that page's own content:

| Page | What the visitor can do | Component | Content comes from |
|---|---|---|---|
| Home | Follow each proof tile to its evidence; point at a row of the app index to turn the 3D carousel | `Stats`, `WorkShowcase` | `stats` in `content/home.ts`, `content/work.ts` |
| `/services/` | Pick a service: its 3D scene and details come forward | `extras/ServiceExplorer` | the services grid in `content/pages/services.json` |
| `/hire/` | Compare the three engagement models; the matching 3D figure steps forward | `extras/EngagementModels` | the models grid in `content/pages/hire.json` |
| `/about/` | Pick a country and the globe turns to it | `extras/RegionsGlobe` | the regions grid in `content/pages/about.json`, `markets` in `content/site.ts` |
| Case studies; retail, ride-hailing and HR pages | Tour the real app screens | `extras/ScreenTour` | `shots` in `content/work.ts` |
| FinTech, USA / UK / Dubai, WordPress and AI pages | Use the tool from the related blog post, in place | `ToolSection` | `content/widgets/<post>.json` |
| MVP, React Native, DevOps and AI pages | Scope sorter, platform toggle, live-ops dashboard and architecture explorer, idea constellation | `extras/MvpScoper`, `PlatformToggle`, `OpsDashboard`, `ArchExplorer`, `IdeaConstellation` | the page's own JSON, `content/tools.ts` |
| Blog posts | The post's tool, one-tap feedback | `mdx/Widgets`, `extras/PostFeedback` | the post and its widget file |
| `/privacy/` | Turn analytics cookies on or off | `extras/ConsentControls` | the consent store in `lib/prefs.ts` |
| 404 | Search the site | `ui/PaletteButton` | the search index |

Which section goes on which page is decided in `extras()` in `app/[slug]/page.tsx`. Sections that select on hover use
`lib/use-hover-pick.ts`: only real pointer movement counts, so content sliding under a resting pointer while the page
scrolls does not change the selection. Everything selectable by hover is also a button, so it works by keyboard and
touch, and inactive panels stay in the HTML (hidden), so all copy remains crawlable.

## Editing content

All copy is in `content/`. Components never hard-code it.

| To change… | Edit |
|---|---|
| Brand facts, navigation, footer | `content/site.ts` |
| Home page stats, process, services, testimonials, guarantees, tools | `content/home.ts` |
| The "Start here" form's fields, consent line and success message | `content/forms.ts` |
| A marketing page's copy, meta title/description, FAQ | `content/pages/<slug>.json` |
| Case studies and enterprise projects | `content/work.ts` |
| A blog post | `content/blog/<slug>.mdx` |
| Calculator inputs, weights, rates, score bands | `content/tools.ts` |
| A blog widget's questions, weights and verdicts | `content/widgets/<post-slug>.json` |
| Which 3D scene a page hero uses | `content/page-config.ts` |
| Colours, type scale, radii | the tokens at the top of `app/globals.css` (brand gold on near-black; light theme values right below) |
| 3D scene colours (dark and light palettes) | `DARK` / `LIGHT` in `components/three/kit.tsx`, brand values in `lib/brand.ts` |
| LinkedIn profile and newsletter links | `founder.linkedin` and `newsletter` in `content/site.ts` |
| Which interactive section a page gets, and the tour / tool headings | `extras()` in `app/[slug]/page.tsx` |
| Where each home proof tile links, and its link label | `stats` in `content/home.ts` (`href`, `more`) |
| Easing, durations, springs, particle budgets | `lib/motion.ts` |

`content/pages/*.json` is a typed block tree (`Block` in `lib/content.ts`): sections contain blocks such as
`h`, `p`, `list`, `grid`, `faq`, `buttons`, `form`. Inline text may use `<a>`, `<strong>`, `<em>`, `<br>`, `<code>`;
it is parsed to React nodes, never injected as raw HTML. `meta` holds the title, description and canonical;
`jsonLd` holds the page's structured data, emitted as-is.

`content/legacy-scripts/` and `content/blog-embeds/*.widget.html` are reference copies of the live site's scripts and
markup that the widgets were ported from. They are not part of the build.

### Add a blog post

1. Create `content/blog/my-post-slug.mdx`:

   ```mdx
   ---
   slug: "my-post-slug"
   title: "The post title (also the H1)"
   metaTitle: "The <title> tag"
   description: "Meta description."
   canonical: "https://soniconsultancyservices.com/blog/my-post-slug"
   categories: ["Mobile", "Cost"]
   lead: "The standfirst under the title."
   author: "Het Soni"
   readTime: "8 min read"
   dateLabel: "October 2026"
   datePublished: "2026-10-12"
   related: ["react-native-app-development-cost", "how-long-to-build-an-app"]
   hasWidget: false
   ---

   ## First heading

   Body in Markdown. Tables, code fences and these components work:

   <Callout>

   **A callout.** Leave a blank line inside so the Markdown is parsed.

   </Callout>

   <FaqList>
   <Faq q="A question?">

   The answer.

   </Faq>
   </FaqList>
   ```

2. Optional thumbnail: `content/blog-embeds/my-post-slug.thumb.svg` (use `var(--gold)`, `var(--line2)`,
   `var(--glass3)` for colours so it follows the theme).
3. Optional Article/FAQ schema: `content/blog-embeds/my-post-slug.jsonld.json` (an array of JSON-LD objects).
4. It appears on `/blog/`, in the sitemap, in ⌘K search and gets an OG image automatically.

To add an interactive widget, write `content/widgets/my-post-slug.json` with a `type` of `quiz`, `wizard`,
`checklist` or `audit` (copy an existing file of that type) and put `<Widget post="my-post-slug" />` in the post.

### Add a case study

Add an object to `cases` in `content/work.ts`. `slug` becomes `/work/<slug>/` and the `/work/#<slug>` anchor.
`kind` is `live`, `shipped` or `concept` and decides the group and the labelling. Put screenshots in
`public/assets/portfolio/` and list them in `shots`; the first is the card image and the 3D device cycles through them.
Do not upgrade claims: concepts stay labelled as concepts, and anything not yet measured is written as "designed to".

### Add a regional landing page (UK, UAE, AU, CA …)

1. Copy `content/pages/react-native-app-development-usa.json` to `content/pages/react-native-app-development-<region>.json`.
2. Change `slug`, `path`, `meta` (title, description, canonical), `h1`, `breadcrumb` and the copy.
3. Add the slug to `templatePages` in `content/page-config.ts`, and a `pageScene` entry for its hero.
4. Link it from `footer.regions` in `content/site.ts`. If you add several, add `hreflang` alternates in `lib/content.ts`.

### Add any other page

Create `content/pages/<slug>.json`, add the slug to `templatePages`. For bespoke interactive sections, return a
`replace` / `insertAfter` map for that slug from `extras()` in `app/[slug]/page.tsx`.

## Tuning the 3D

| What | Where |
|---|---|
| Particle counts per GPU tier (high 40k / mid 15k / low 4k / none) | `particleBudget` in `lib/motion.ts` |
| How a device is tiered | `lib/gpu-tier.ts` (renderer string + memory + cores; no network benchmark) |
| Stepping down at runtime when frames drop | `PerformanceMonitor` in `components/three/GLRoot.tsx` |
| Device pixel ratio per tier, antialiasing | the `<Canvas>` props in `GLRoot.tsx` |
| A scene's size inside its box | the `useView()` / `useFit()` divisor at the top of that scene |
| How far ahead scenes mount | `rootMargin` in `Slot` (`GLRoot.tsx`) |
| Glow strength (the bloom stand-in) | `Glow` in `components/three/kit.tsx` |
| Studio reflections (the four light panels every scene reflects) | `PANELS` in `components/three/studio-env.ts` |
| Intro length and timings | `preloader` in `lib/motion.ts` (keep `fallbackMs` in step with `intro-auto-out` in `app/globals.css`) |

Every scene is listed on **`/lab/`** (noindex) next to the tokens, type scale and motion presets.
Each one receives a `tier` prop and has a static poster; with "Reduce motion" on (OS setting or the footer toggle)
no canvas is created at all and pages show posters and static layouts with opacity-only reveals.

**Three rules every scene follows.** (1) Colours come from `const HEX = usePalette()` inside the component, never from
a hard-coded hex: the light theme swaps champagne, cream and white for deep gold, bronze and charcoal so the scene
stays visible on white. (2) A `<shaderMaterial>` gets its uniforms through `args={useShaderArgs(uniforms, vert, frag)}`,
not a `uniforms` prop: React Three Fiber copies that prop, so per-frame writes would never reach the shader
(`tests/webgl.spec.ts` guards this). (3) Lines, wireframes and points take their opacity through
`const A = useLineAlpha()` (`opacity={A(0.28)}`): the values are tuned for gold glowing on black, and a hairline at
25% disappears on a white page, so the light theme draws thin geometry about 2.5× stronger. The globe goes further
on light (tinted body, bronze grid, solid routes) and its static poster follows the theme through the
`.poster-*` classes in `app/globals.css`. Cards that contain a scene have no fill on the light theme, because the canvas
sits behind the page and a translucent white card would wash the scene out.

To add a scene: create `components/three/scenes/MyScene.tsx` (default export taking `SceneProps`), add its key to
`SceneKey` in `lib/gl-store.ts` and to the `scenes` map in `GLRoot.tsx`, then use `<SceneBox scene="myScene" />`.
A DOM component can drive a scene by passing a `useRef` object in `props` and mutating it (see the calculator).

## Forms, analytics, integrations

- **Forms** use React Hook Form in the browser (`components/ui/LeadForm.tsx`). `submitLead` (`lib/lead.ts`) checks
  the honeypot and the email, trims the fields and POSTs one JSON object `{ kind, name, email, …fields, page, utm_* }`
  from the browser to the lead API (API Gateway → the `scs-lead-mailer` Lambda, which emails the owner and stores the
  lead; the old site posted the same shape to the same URL). The URL is `NEXT_PUBLIC_LEAD_ENDPOINT`, read at build
  time; when it is empty (dev, tests, previews) nothing is sent and the form still shows its success state, so a test
  can never create a real lead. Rate limiting and spam handling live in the Lambda. Success replaces the form in place.
- **Calendly** opens in a modal from any Calendly link (the plain link is the no-JS fallback). On `/contact/` the
  inline scheduler loads in place when the visitor clicks "Show available times": Calendly sets its own cookies as
  soon as its frame loads, so it is never loaded unasked (see `CONTENT-QUESTIONS.md` to change this).
- **Analytics**: Vercel Analytics (cookieless) on Vercel deployments — its script only exists there, so other hosts
  skip it unless `ANALYTICS=vercel` is set at build time; GA4 only after the visitor accepts the banner.
  Events: `cta_click {location,label}`, `calc_complete {config}`, `form_submit {form}`, `guide_download`,
  `calendly_open`, `calendly_booked`, `calculator_estimate`, `post_feedback {slug,useful}` (the "Was this guide
  useful?" buttons under a post; nothing else is stored). UTM and blog attribution are attached to every lead.
- **AI assistant demo** (`/ai-app-development/`): off by default and **not part of the S3 deployment**, because it
  needs a server. Its route handler is kept in `docs/optional/assistant-route.ts`; to use it, host the site on a
  Node platform (for example Vercel), move that file back to `app/api/assistant/route.ts` and set `ASSISTANT_ENABLED=true`,
  `NEXT_PUBLIC_ASSISTANT_ENABLED=true` and `ANTHROPIC_API_KEY`. It calls Claude Opus 5.5 (`claude-opus-5-5`) through the
  official SDK with streaming, low effort, a 10-requests-per-10-minutes courtesy limit per IP and a 6-question cap
  per visit. Server-side fallback is switched on (`fallbacks: "default"`), so a request the model declines is retried
  on Anthropic's recommended model inside the same call. The in-memory limiter is per server instance: put a durable
  rate limit (Vercel WAF or Upstash) in front and set a spend limit on the key before enabling it publicly.

## Tests

`npm run test:e2e` runs against the production build (`npm run build` first).

| Suite | Checks |
|---|---|
| `tests/urls.spec.ts` | All 58 live sitemap URLs return 200 with the live title, description, canonical, robots and H1; both slash forms; redirects; sitemap and robots; a crawl of every internal link |
| `tests/smoke.spec.ts` | Navigation, Calendly modal and focus return, ⌘K search, the calculator formula, every form (validation and success), the PDF download, blog widgets scoring, work filters, every interactive section (service explorer, engagement models, region picker, screen tour, embedded tools, consent switch, post feedback, 404 search), scroll poses staying inside their own box, reduced motion, consent gating, phone-width overflow on 16 pages and the mobile menu, and axe (WCAG 2.2 AA) on 15 pages in the dark theme and 10 in the light theme |
| `tests/webgl.spec.ts` | One shared canvas, scenes attach, no console errors, and at phone width the 3D layout never widens the page (before and after the canvas mounts). Needs a hardware GPU and skips itself without one |

Functional tests launch Chrome with `--disable-gpu`, so the site takes its no-WebGL path: fast, deterministic and
the same as CI machines. Useful switches: `PW_CHANNEL=chrome` (use the installed Chrome), `PW_ALL=1` (adds Firefox,
WebKit, iPhone and a small Android profile; run `npx playwright install` first — CI does this on every push),
`PW_WORKERS=2`, `BASE_URL=https://…` (test a deployed preview).

Lighthouse budgets are in `lighthouserc.json` (desktop: performance ≥ 90, accessibility ≥ 95, best practices ≥ 95,
SEO 100, CLS < 0.05) and `lighthouserc.mobile.json` (performance ≥ 80). Run `npm run lhci` / `npm run lhci:mobile`;
reports are written to `lhci-reports/` and are not uploaded anywhere. The summary from the build session (desktop and
mobile, 13 page types) is in `docs/lighthouse/SUMMARY.md`; `node scripts/lh-summary.mjs <folder> --write` builds
that table from a folder of Lighthouse JSON reports.
`.github/workflows/ci.yml` runs lint, type-check, build, Playwright, both Lighthouse configs and the JS budget.

## Performance budget

The brief's limit is **180 KB of gzipped JavaScript per route on first load, excluding the lazy 3D chunk**.
`npm run budget` measures what each page's HTML asks for (scripts plus script preloads). React and the Next.js
runtime are about 130 KB of that, so the site's own first-load code has roughly 50 KB to work with:

| Loaded with the page | Loaded later, only when needed |
|---|---|
| Nav, footer, providers, the section a page renders | three.js / R3F / drei and every scene (after first paint; see above) |
| React Hook Form, only on pages that show a form | GSAP and Lenis (after hydration) |
| A page's own interactive section (`components/sections/extras/*`) | Cursor, consent banner, exit intent, analytics (`ChromeExtras`) |
| A post's widget family, only on posts that use one | Calendly modal, ⌘K palette, preloader, Motion (calculator number morph), Rapier (MVP page) |

Rules that keep it there:

- A Server Component that needs a heavy Client Component imports it from **`components/lazy.tsx`**. Next.js only
  splits a lazily imported client component when the `dynamic()` call is itself in a client file.
- Client components get **props from the server** instead of importing big content files (`content/work.ts` is
  18 KB; the home carousel and the work index receive just the fields they render).
- No class-merging or validation library ships to the browser: `submitLead` uses plain checks and the Lambda is the authority.

`node scripts/profile.mjs <url>` records a CPU profile under 4× throttling and prints the hottest functions, for
when Total Blocking Time moves.

`node scripts/overflow.mjs <url> [width]` lists the elements that stick out of a phone-width viewport, for when the
overflow test fails.

`node scripts/reveal-bounds.mjs <baseUrl> <path>…` scrolls each page at desktop and phone width and reports any
revealed element whose scroll pose leaves its own layout box (run it after changing the motion keyframes).

`scripts/shots.mjs` takes full-resolution screenshots through headless Chrome with the GPU on, for reviewing 3D work:

```bash
node scripts/shots.mjs http://localhost:3000 ./shots 1440x900 "/#home" "/@[data-loc=work]#work"
```

## Deploying to S3 + CloudFront

The live site is a static site: bucket `scs-site-prod-043174661808` behind CloudFront distribution `E3HVJHFD5CQPVI`
(aliases `soniconsultancyservices.com`, `www.` and `portfolio.`). `npm run deploy:aws` (`scripts/deploy-aws.sh`) does
the whole job with the AWS CLI profile `prod`:

1. `STATIC_EXPORT=1 next build` writes the plain-files site to `out/` (`NEXT_PUBLIC_LEAD_ENDPOINT` and `NEXT_PUBLIC_GA_ID`
   are baked in; the script refuses to upload a build without the endpoint).
2. `scripts/prepare-static.mjs` produces `dist/`: every `x.html` becomes `x/index.html` (the CloudFront function
   `scs-url-rewrite` maps `/x` and `/x/` to that key), every `opengraph-image` becomes `opengraph-image.png` (the
   function would otherwise treat the extensionless name as a page), and the hidden `/lab` page is left out.
3. Upload in four passes with `aws s3 sync`, **never with `--delete`**: hashed `_next/` files (immutable cache), assets,
   payloads/sitemap/robots/OG images, then the HTML last, all with `max-age=0, must-revalidate`.
4. `aws cloudfront create-invalidation --paths "/*"`.

Things that behave differently from `next start`, on purpose:

- Redirects are the CloudFront function's, not Next's: `/usa`, `/uk`, `/uae`, `/australia`, `/canada` still 301 to the
  home page as on the old site. The two redirects in `next.config.ts` (`/usa` → the US landing page, `/hire-developers`
  → `/hire/`) only apply on a Node host; add them to the function if you want them on S3.
- Unknown URLs get `404.html` with status 404 (the distribution's custom error response).
- **Security headers**: the distribution's response headers policy `scs-security-headers` sends a Content-Security-Policy
  written for the old site. It allows Tawk.to, Meta, LinkedIn, GoodFirms and Google Analytics, and the lead API
  (`connect-src`), but **not Calendly** (`frame-src`) and it sets no `worker-src` (blob workers fall back to
  `script-src`). The site copes: the Calendly embeds detect the blocked frame (`components/ui/CalendlyBlocked.tsx`) and
  offer the booking page in a new tab, and the GPU probe (`lib/gpu-tier.ts`) falls back to the main thread (one harmless
  console error on the home page). To restore the in-page calendar and silence the error, edit that policy in the
  CloudFront console (Policies → Response headers) and add `https://calendly.com` to `frame-src` and
  `worker-src 'self' blob:`. A change to this policy was deliberately left to the owner.
- The bucket also holds `_3d/` (the content of `portfolio.soniconsultancyservices.com`), the Google Search Console
  verification file, `llms.txt` and older assets. They are left alone.
- To test the deploy artefact locally: `npm run build:static && npm run serve:dist`, then
  `STATIC_HOST=1 BASE_URL=http://127.0.0.1:3200 npm run test:e2e`.
- Roll back by syncing a previous backup of the bucket (or the previous git commit's build) the same way and invalidating again.

## Launch checklist

1. **Decide the open items** in `CONTENT-QUESTIONS.md`.
2. **Host**: S3 + CloudFront as above (`npm run deploy:aws`). On Vercel instead, import the repo and set the
   variables from `.env.example`; there the redirects in `next.config.ts` and the assistant route apply.
3. **Environment variables** (build time): `NEXT_PUBLIC_LEAD_ENDPOINT`, `NEXT_PUBLIC_GA_ID` (both default in the deploy script).
4. **Send a test submission from every form** on the live site and confirm it arrives.
5. **Vercel Analytics** is only on Vercel deployments; on S3 the site relies on GA4 (after consent).
6. **Run the URL suite against the deployed site**: `STATIC_HOST=1 BASE_URL=https://soniconsultancyservices.com npm run test:e2e -- tests/urls.spec.ts`.
7. **Run Lighthouse** on the preview (the budgets above) and keep the reports.
8. **Real-device pass**: iOS Safari, Samsung Internet and a low-end Android. Check the hero, the pinned sections,
   the calculator and the mobile menu, then again with Reduce Motion on.
9. **Switch DNS**, then in **Search Console**: confirm the property, submit `/sitemap.xml`, inspect the home page and
   two blog posts, and watch Coverage for a week.
10. **OG images**: paste the home page, a post and a case study into the LinkedIn and Facebook debuggers.
11. Keep the old site's files for a month in case a URL was missed (none are known: 58 of 58 pass).

## Deviations from the brief

Each of these was a deliberate trade, not an omission.

| Brief | Built | Why |
|---|---|---|
| `@react-three/postprocessing` bloom, depth of field | Additive glow sprites, shader grain as a CSS layer | Post-processing does not compose with one canvas shared by many scissored views, and a full-screen composer costs most on the phones the budget protects. The package is not installed. |
| GSAP ScrollTrigger for scroll choreography | CSS `position: sticky` plus a small `useProgress` hook for the pinned sections; CSS scroll-driven animations (`animation-timeline: view()`) for the reveals; GSAP only runs the Lenis ticker | Native sticky pinning cannot fight Lenis or cause layout jumps, the reveals run on the compositor without JavaScript, and ScrollTrigger stays out of the first-load bundle. All scroll effects are still scroll-linked and reversible. |
| `detect-gpu` | A local heuristic in `lib/gpu-tier.ts` | `detect-gpu` downloads its benchmark tables from a CDN at runtime. |
| `next-sitemap` | Next's built-in `app/sitemap.ts` and `app/robots.ts` | Same output, one less dependency, URLs come from the content files. |
| GLSL noise-dissolve route transition, 3D objects morphing between pages | React `<ViewTransition>` cross-fade with blur; shared-element morph from a work card to its case-study device | A full-screen shader wipe needs a second render pass on every navigation. The View Transitions API gives the continuity without it. |
| Extruded `Text3D` stat numbers | Real text with a layered CSS extrusion that tilts with the cursor | `Text3D` needs a ~100 KB font JSON and would put the numbers on a canvas, where they are neither selectable nor indexable. |
| Cursor attraction "forms code glyphs" | Particles gather into an orbit around the cursor and brighten | Glyph targets per cursor position need a second target buffer per particle; the orbit reads well at 4k–40k particles. |
| Video textures on device screens | Cross-fading real screenshots | No screen recordings exist yet (see `CONTENT-QUESTIONS.md`). |
| Founder portrait with a depth map | Monogram tile with parallax | No portrait exists yet. Marked as a placeholder. |
| Preloader on every first visit | First visit on screens ≥ 768 px; never on phones | On a phone the intro would cover a page that is already readable while three.js is still downloading; it costs the mobile performance budget the brief calls non-negotiable. |
| Calendly inline embed on Contact | The inline scheduler loads in place on request | Calendly sets third-party cookies the moment it loads; loading it unasked conflicts with the consent approach (and drops Lighthouse Best Practices below the 95 budget). One click shows it. |
| Sound toggle (optional), Rive/Lottie (optional) | Not built | Optional in the brief; CSS and SVG micro-animations are used instead. |
| AVIF posters pre-rendered from each scene | CSS/SVG poster compositions | They weigh nothing, follow the theme and never go stale when a scene changes. |
| Storybook or `/lab` | `/lab` | One of the two was asked for. |
| Motion (Framer Motion) for UI micro-interactions | CSS transitions for the menu, accordion and testimonial deck; Motion's `animate` only for the calculators' number morph, loaded after hydration | Motion's React layer is ~40 KB gzipped; with React and Next.js at ~130 KB it does not fit the 180 KB first-load budget. The motion language (expo ease, durations) is unchanged and lives in `lib/motion.ts` and `app/globals.css`. |
| React Hook Form + Zod | React Hook Form in the browser; plain checks in `submitLead`; the Lambda validates | Zod adds ~17 KB gzipped to every page with a form, so it is not shipped. The browser rules are generated from the same field definitions. |
| Lenis velocity → skew and chromatic aberration | Scroll velocity drives particle size, marquee speed and globe spin | Whole-page skew and aberration hurt legibility of long text pages; the velocity uniform (`shared.scrollVel`) is available to any shader that wants it. |

Rapier physics is used where the brief specifies it (the MVP scope sorter). It loads only on that page.
