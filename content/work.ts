/**
 * Portfolio — copy ported verbatim from the live /work/ page (2026-10-01).
 * Slugs match the live page's anchor ids so /work/#slug links keep working
 * and /work/[slug]/ detail pages share the same identifiers.
 * Do not upgrade any claim: concepts stay labelled as concepts; the healthcare
 * staffing result stays "Designed to …" and research-based.
 */
export type CaseKind = "live" | "shipped" | "concept";
export type Shot = { src: string; alt: string; cap?: string };
export type CaseStudy = {
  slug: string;
  kind: CaseKind;
  title: string;
  short: string; // card title on home
  tagline: string; // card tagline on home
  eyebrow: string;
  industry: string;
  duration?: string;
  status: string;
  summary: string;
  problem?: string;
  solution?: string;
  result?: string;
  /** concept cases use feature notes instead of problem/solution/result */
  notes?: { k: string; html: string }[];
  research?: string;
  metrics: { num: string; lbl: string; count?: number; prefix?: string; suffix?: string }[];
  stack: string[];
  shots: Shot[];
  flows?: { label: string; steps: string[] }[];
  industryPage?: string;
};

const P = "/assets/portfolio/";

export const cases: CaseStudy[] = [
  {
    slug: "hr-payroll",
    kind: "live",
    title: "HR & Payroll Platform",
    short: "HR & Payroll",
    tagline: "Attendance & payroll · MERN + RN",
    eyebrow: "HR & Payroll · 16 weeks · Name withheld (NDA)",
    industry: "HR & Payroll",
    duration: "16 weeks",
    status: "Live on the App Store & Google Play",
    summary: "Attendance & salary ledger system — real-time attendance, automated payroll and centralised records across Company, Branch and Staff roles.",
    problem: "Manual spreadsheets caused <strong>15–20% payroll errors</strong>, delayed slips and zero branch-level visibility.",
    solution: "Biometric & GPS attendance, customizable payroll rules per branch, real-time irregularity alerts, detailed salary breakdowns.",
    result: "<strong>40% less</strong> payroll processing time and accurate, transparent pay every cycle.",
    metrics: [
      { num: "40%", lbl: "Faster payroll", count: 40, suffix: "%" },
      { num: "3", lbl: "User roles", count: 3 },
      { num: "2", lbl: "Stores live", count: 2 },
    ],
    stack: ["React Native", "React", "Node.js", "MongoDB"],
    shots: [
      { src: P + "hr-payroll-sim-register.webp", alt: "HR platform business registration screen" },
      { src: P + "hr-payroll-sim-punch.webp", alt: "HR platform punch in and out with live hour tracker" },
      { src: P + "hr-payroll-sim-ledger.webp", alt: "HR platform salary ledger with income breakdown" },
      { src: P + "hr-payroll-sim-profile.webp", alt: "HR platform staff profile update screen" },
    ],
    industryPage: "/hr-payroll-app-development/",
  },
  {
    slug: "creator-marketplace",
    kind: "live",
    title: "Creator–Venue Marketplace",
    short: "Creator Marketplace",
    tagline: "Influencer × venues · +35% installs",
    eyebrow: "Creator Marketplace · 24 weeks · Name withheld (NDA)",
    industry: "Influencer marketing / creator economy",
    duration: "24 weeks",
    status: "Live on the App Store",
    summary: "An influencer-to-venue collaboration platform — slot booking, in-app content sharing, chat and a points & rewards engine that keeps both sides engaged.",
    problem: "Influencer–venue deals were fragmented: no clean way to book slots, communicate, or reward engagement.",
    solution: "Dynamic real-time slot booking, content upload with status sharing, automated chat templates and a loyalty points system.",
    result: "A <strong>35% lift in downloads</strong> and a <strong>20% rise in venue bookings</strong> driven by authentic creator content.",
    metrics: [
      { num: "+35%", lbl: "Downloads", count: 35, prefix: "+", suffix: "%" },
      { num: "+20%", lbl: "Bookings", count: 20, prefix: "+", suffix: "%" },
      { num: "4.x", lbl: "App Store" },
    ],
    stack: ["React Native", "Chat", "Rewards", "Maps"],
    shots: [
      { src: P + "creator-marketplace-1.webp", alt: "Creator marketplace app home" },
      { src: P + "creator-marketplace-3.webp", alt: "Creator marketplace venue discovery" },
      { src: P + "creator-marketplace-g1.webp", alt: "Creator marketplace venue detail and service selection", cap: "Service & combos" },
      { src: P + "creator-marketplace-g2.webp", alt: "Creator marketplace deals and content brief", cap: "Deals & content briefs" },
      { src: P + "creator-marketplace-g3.webp", alt: "Creator marketplace date and slot picker", cap: "Slot booking" },
      { src: P + "creator-marketplace-g4.webp", alt: "Creator marketplace bookings and content schedule", cap: "Bookings & content" },
    ],
  },
  {
    slug: "retail-ops",
    kind: "live",
    title: "Retail Operations Platform",
    short: "Retail Operations",
    tagline: "Retail chain ops · LMS + analytics",
    eyebrow: "Retail SaaS · 32 weeks · Name withheld (NDA)",
    industry: "Retail SaaS",
    duration: "32 weeks",
    status: "Live on the App Store & Google Play",
    summary: "A retail chain management platform unifying operational checklists, a gamified LMS, issue logs and customer logs — standardising operations across every store.",
    problem: "Inconsistent store operations, unrecorded issues and outdated, inaccessible staff training.",
    solution: "Customizable checklists, gamified bite-sized LMS, structured issue logging and an analytics dashboard for head office.",
    result: "<strong>Standardised multi-store operations</strong> with real-time visibility and measurably faster staff onboarding.",
    metrics: [
      { num: "4", lbl: "Modules unified", count: 4 },
      { num: "2", lbl: "Stores live", count: 2 },
      { num: "LMS", lbl: "Gamified" },
    ],
    stack: ["React Native", "React", "Node.js", "MongoDB"],
    shots: [
      { src: P + "retail-ops-1.webp", alt: "Retail operations app screen" },
      { src: P + "retail-ops-sim-menu.webp", alt: "Retail platform store menu with checklists, trainings, logs and reports" },
      { src: P + "retail-ops-sim-checklist.webp", alt: "Retail platform checklist module" },
      { src: P + "retail-ops-sim-training.webp", alt: "Retail platform LMS training module" },
      { src: P + "retail-ops-sim-submission.webp", alt: "Retail platform checklist submission report" },
    ],
    industryPage: "/retail-app-development/",
  },
  {
    slug: "ride-hailing",
    kind: "live",
    title: "Ride-Hailing Platform",
    short: "Ride-Hailing",
    tagline: "Ride-hailing · AI fare prediction",
    eyebrow: "Ride-Hailing · AI · 25 weeks · Name withheld (NDA)",
    industry: "Mobility",
    duration: "25 weeks",
    status: "Live on the App Store & Google Play",
    summary: "A cab-booking platform built around rider trust — transparent pricing, real-time tracking, safety features and AI-based fare prediction.",
    problem: "Driver cancellations, opaque surge pricing and clunky interfaces eroded rider trust.",
    solution: "<strong>AI fare prediction</strong> for transparent pricing, driver-rating assurance, ride scheduling, an SOS feature and an eco-friendly vehicle option.",
    result: "Average booking time down to <strong>~3 minutes</strong> with safety-first UX riders actually trust.",
    metrics: [
      { num: "3min", lbl: "Avg. booking", count: 3, suffix: "min" },
      { num: "AI", lbl: "Fare prediction" },
      { num: "SOS", lbl: "Safety built-in" },
    ],
    stack: ["React Native", "Next.js", "PostgreSQL", "AWS"],
    shots: [
      { src: P + "ride-hailing-sim-map.webp", alt: "Ride-hailing live ride tracking with fare" },
      { src: P + "ride-hailing-sim-bookings.webp", alt: "Ride-hailing driver app bookings list" },
      { src: P + "ride-hailing-sim-driver.webp", alt: "Ride-hailing driver profile details form" },
      { src: P + "ride-hailing-sim-nav.webp", alt: "Ride-hailing turn by turn navigation screen" },
    ],
    industryPage: "/ride-hailing-app-development/",
  },
  {
    slug: "b2b-wholesale",
    kind: "shipped",
    title: "B2B Wholesale Platform",
    short: "B2B Wholesale",
    tagline: "Wholesale ordering & loyalty rewards for retailers",
    eyebrow: "B2B Retail · Loyalty Platform · Name withheld (NDA)",
    industry: "B2B retail / loyalty",
    status: "Live on the App Store & Google Play",
    summary: "A B2B wholesale ordering platform for retailers, with a points-based loyalty engine, tiered pricing catalogue and real-time inventory tracking.",
    problem: "Retailers had no streamlined way to bulk-order, track inventory or earn loyalty rewards — existing systems were outdated and manual.",
    solution: "Dynamic points tied to purchasing volume, tiered wholesale pricing, predictive inventory analytics and ERP-synced ordering.",
    result: "Order placement time cut by <strong>30%</strong> and customer retention up <strong>20%</strong> post-launch.",
    metrics: [
      { num: "-30%", lbl: "Order time", count: 30, prefix: "-", suffix: "%" },
      { num: "+20%", lbl: "Retention", count: 20, prefix: "+", suffix: "%" },
      { num: "60%", lbl: "Redeemed in mo. 1", count: 60, suffix: "%" },
    ],
    stack: ["React.js", "Node.js", "ERP Integration"],
    shots: [],
    industryPage: "/retail-app-development/",
  },
  {
    slug: "healthcare-staffing",
    kind: "shipped",
    title: "Healthcare Staffing Platform",
    short: "Healthcare Staffing",
    tagline: "Shift-based hiring platform connecting hospitals with nurses",
    eyebrow: "HealthTech · Platform · 26 weeks · Name withheld (NDA)",
    industry: "HealthTech",
    duration: "26 weeks",
    status: "Delivered (mobile app + web dashboard) — not yet public on the stores",
    summary: "A digital hiring platform connecting hospitals with nurses for shift-based work — a mobile app for nurses and a web dashboard for hospital staffing teams.",
    problem: "Hospitals fill shifts by phone calls and spreadsheets; nurses struggle to find flexible, transparent-pay shifts that fit their schedule.",
    solution: "Real-time shift posting, AI-based nurse matching, a credential vault with auto-verification, and geo-filtered shift search.",
    result: "Designed to cut average shift-fill time from <strong>4–8 hours to under 30 minutes</strong>, based on research across 18 hospitals.",
    metrics: [
      { num: "78%", lbl: "Want short-term shifts", count: 78, suffix: "%" },
      { num: "65%", lbl: "Still use manual calls", count: 65, suffix: "%" },
      { num: "<30min", lbl: "Target fill time" },
    ],
    stack: ["React Native", "Next.js", "Express.js", "PostgreSQL"],
    shots: [],
    flows: [
      { label: "Nurse mobile app", steps: ["Login & verification", "View recommended shifts", "Search & filter by distance, pay, facility", "Review shift details", "Apply → in-progress → confirmation", "Credential vault", "Payments & earnings", "Profile & reliability score"] },
      { label: "Hospital web dashboard", steps: ["Login", "Post a shift", "View applicants", "Review credentials", "Confirm nurse", "Track live shift status", "Rate nurse", "Analytics dashboard"] },
    ],
  },
  {
    slug: "web3-creator",
    kind: "concept",
    title: "Web3 Creator Platform",
    short: "Web3 Creator",
    tagline: "Social network + multi-chain wallet + NFT marketplace",
    eyebrow: "Web3 · Social + Wallet + NFT · Name withheld (NDA)",
    industry: "Web3 / creator economy",
    status: "✦ Product & UI/UX design concept",
    summary: "A Web3 creator-economy concept — a social network, a multi-chain crypto wallet and an NFT marketplace in one premium dark experience, so creators can publish, mint and get paid inside a single app.",
    notes: [
      { k: "Wallet", html: "A built-in <strong>multi-chain wallet</strong> with a native token, deposit/withdraw and balances across BTC, ETH, XRP and more." },
      { k: "Market", html: "An <strong>NFT & SNFT marketplace</strong> with floor price, volume and offers — collect, buy and sell digital art." },
      { k: "Social", html: "Creator profiles, a fan-following model and a <strong>\"Social Art\" feed</strong> where posts can be minted and earned from." },
    ],
    metrics: [],
    stack: ["UI/UX Design", "Web3", "Crypto Wallet", "NFT Marketplace", "Mobile-first"],
    shots: [],
    industryPage: "/fintech-app-development/",
  },
  {
    slug: "fan-investing",
    kind: "concept",
    title: "Fan Investment Platform",
    short: "Fan Investing",
    tagline: "Social-investing concept — discover artists, back offerings, track a portfolio",
    eyebrow: "Music FinTech · Social investing · Name withheld (NDA)",
    industry: "Music FinTech / social investing",
    status: "✦ Product & UI/UX design concept",
    summary: "A concept for a fan-investing app — discover emerging music artists, back them with fractional \"shares\" tied to their career milestones, and watch a personal portfolio grow inside a social feed of the artists you follow.",
    notes: [
      { k: "Discover", html: "A home feed of <strong>hot new artists</strong> and people to follow, each with a live offering open to back." },
      { k: "Growth Score", html: "A dynamic metric blending social reach, engagement and revenue — so backers can evaluate an artist before investing." },
      { k: "Portfolio", html: "A wallet that tracks <strong>performance over time</strong> — total invested, milestone-based returns and each artist's share of the portfolio." },
      { k: "Artist", html: "Rich artist profiles with bio, genre, monthly streams and the <strong>percentage offering</strong> available." },
    ],
    research: "Concept research (82 respondents): 74% wanted a low-barrier way to invest in creative talent; 71% said they'd trust the platform more with verifiable growth metrics — which shaped the Growth Score above.",
    metrics: [],
    stack: ["UI/UX Design", "FinTech", "Social Investing", "Mobile-first", "Dark UI"],
    shots: [
      { src: P + "fan-investing-1.webp", alt: "Fan investment platform home feed of new artists" },
      { src: P + "fan-investing-3.webp", alt: "Fan investment platform wallet and portfolio performance screen" },
      { src: P + "fan-investing-2.webp", alt: "Fan investment platform artist profile with offering", cap: "Artist profile & offering" },
      { src: P + "fan-investing-4.webp", alt: "Fan investment platform list of artists held in portfolio", cap: "Your artist holdings" },
    ],
    industryPage: "/fintech-app-development/",
  },
];

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);
export const liveCases = cases.filter((c) => c.kind === "live");

export const workStats = [
  { num: "4", lbl: "Apps shipped", count: 4 },
  { num: "8", lbl: "Store listings (iOS+Android)", count: 8 },
  { num: "97wk", lbl: "Combined build time", count: 97, suffix: "wk" },
  { num: "100%", lbl: "React Native + MERN", count: 100, suffix: "%" },
];

export type EnterpriseProject = { id: string; title: string; role: string; html: string; tech: string[] };
export const enterprise: { category: string; blurb: string; projects: EnterpriseProject[] }[] = [
  {
    category: "FinTech, Risk & Compliance",
    blurb: "Regulatory-grade software for financial institutions — engineered for accuracy, auditability and scale.",
    projects: [
      { id: "bam", title: "BAM+ — AML & Fraud Case Management", role: "Solution Architect & Delivery Lead", html: "A web-based <strong>BSA/AML and enterprise-fraud case management platform</strong> that lets financial institutions run every risk workflow from one console, driven by a configurable scenario library for a blended-analytics approach to risk. Coverage spans ACH origination & incoming fraud, check fraud, debit-card fraud, new-account fraud and wire fraud — on a C#/.NET <strong>microservices architecture</strong> with Apache Kafka event streaming.", tech: ["C#", "ASP.NET Core", "Microservices", "Apache Kafka", "MongoDB", "Kubernetes", "Azure", "AWS", "GraphQL", "Terraform"] },
      { id: "iq", title: "IQ AutoScan — Sanctions & Watchlist Screening", role: "Solution Architect & Delivery Lead", html: "A real-time <strong>sanctions and watchlist screening solution</strong> that screens customers, vendors and counterparties against OFAC, EU/UN/UK and FinCEN lists and other watchlists — helping institutions meet complex <strong>AML and KYC compliance</strong> obligations. Delivered as event-driven microservices on a containerised, cloud-native stack.", tech: ["C#", "ASP.NET Core", "Microservices", "Apache Kafka", "MongoDB", "Angular", "TypeScript", "Kubernetes", "Azure", "AWS"] },
    ],
  },
  {
    category: "Loyalty & Rewards Platforms",
    blurb: "Configurable loyalty engines and financial analytics that power rewards programmes end to end.",
    projects: [
      { id: "rule", title: "Loyalty Rule Engine", role: "Architecture & Implementation", html: "A high-throughput <strong>loyalty rule engine</strong> letting administrators configure an effectively unlimited set of rules across tiers, actions, rewards, events, benefits and channels — the configurable core of a modern rewards platform. Built with ASP.NET Core microservices, MongoDB and Apache Kafka on Azure.", tech: ["ASP.NET Core", "Microservices", "MongoDB", "Apache Kafka", "Azure", "Kubernetes", "Docker"] },
      { id: "pnl", title: "Loyalty P&L Reporting & Analytics", role: "Architecture & Implementation", html: "A <strong>financial analytics and P&L reporting platform</strong> giving stakeholders self-serve access to margins, mark-ups, subscription fees, accruals and redemptions. A <strong>serverless data pipeline</strong> on AWS — Lambda, SQS, DynamoDB, Redshift and QuickSight — turns raw loyalty events into board-ready reporting.", tech: ["Python", ".NET Core", "AWS Lambda", "DynamoDB", "Redshift", "QuickSight", "ETL", "Microservices"] },
    ],
  },
  {
    category: "Cloud Migration & DevOps",
    blurb: "On-premises to cloud — lifted, shifted and re-architected on AWS for resilience and elastic scale.",
    projects: [
      { id: "loyalty-mig", title: "Loyalty Platform — Cloud Migration & Re-Architecture", role: "Solutions Architecture & Migration", html: "End-to-end <strong>AWS cloud migration</strong> of a loyalty platform's on-premises integration services and APIs, followed by <strong>re-architecture</strong> of critical components using cloud-native AWS PaaS and proven patterns — delivering a highly available, resilient and horizontally scalable system.", tech: ["AWS", "ASP.NET Core", "Apache Kafka", "React Native", "Kubernetes", "Docker", "Microservices"] },
      { id: "lift", title: "AWS Lift & Shift and Re-Architecture", role: "Solutions Architecture & Migration", html: "Migration of on-premises integration services and APIs to AWS using IaaS, then re-architecture of critical components with AWS PaaS and <strong>Well-Architected</strong> patterns for high availability and elastic scale — <strong>infrastructure as code</strong> with HashiCorp Terraform across Route 53, CloudFront, WAF/Shield, VPC, EC2, RDS and S3.", tech: ["AWS", "HashiCorp Terraform", "IaC", "CloudFront", "WAF", "VPC", "EC2", "RDS"] },
    ],
  },
  {
    category: "Enterprise Integration & Identity",
    blurb: "EAI, API platforms and single sign-on that connect systems, partners and identities securely.",
    projects: [
      { id: "mkt", title: "Marketplace Integration Platform", role: "Solution Architect & Delivery Lead", html: "An <strong>enterprise integration platform</strong> that synchronises supplier catalogues into a marketplace and integrates order placement back to suppliers in real time. Event-driven microservices spanning AWS (ECS, Lambda, SQS, EventBridge, API Gateway) and Azure (AKS, API Management, Azure SQL), with GraphQL APIs.", tech: ["C#", "ASP.NET Core", "React", "Microservices", "AWS", "Azure", "GraphQL", "Kubernetes"] },
      { id: "eai", title: "Custom Integration Platform & Integrations", role: "Architecture Lead", html: "A custom <strong>enterprise application integration (EAI)</strong> platform and a broad suite of integrations connecting on-premises and SaaS systems through APIs, messaging and event-driven flows — fronted by a <strong>Kong API gateway</strong> and built on reusable enterprise-integration patterns across a multi-year .NET estate.", tech: ["ASP.NET Core", ".NET", "Microservices", "RabbitMQ", "Kong API Gateway", "Azure", "AWS", "Kubernetes"] },
      { id: "sso", title: "Azure AD OneClick SSO", role: "Architecture & Implementation", html: "A one-click <strong>single sign-on (SSO)</strong> integration delivering uni-directional federation from <strong>Microsoft Azure Active Directory</strong> to Cornerstone — configurable in minutes and eliminating separate portal credentials.", tech: ["Azure Active Directory", "SSO", ".NET Core", "ASP.NET Core", "MS SQL"] },
    ],
  },
  {
    category: "Healthcare & HealthTech",
    blurb: "Clinical systems with HL7 integration across labs, providers and patient portals.",
    projects: [
      { id: "nhsp", title: "NHSP Hearing Screening System", role: "Architecture & Technical Guidance", html: "A healthcare platform to manage patients, record newborn <strong>hearing-screening</strong> tests, generate clinical reports and run analytics — with <strong>HL7 integration</strong> to connected health systems.", tech: ["ASP.NET MVC", "ASP.NET Web API", "WCF", "MS SQL Server", "HL7"] },
      { id: "care", title: "CareEvolve — Lab Management & Health Data Integration", role: "Architecture & Technical Guidance", html: "A <strong>laboratory management and health-data integration</strong> system enabling physicians to order lab tests, trigger alerts, generate reports and run analytics — with <strong>HL7 integration</strong> to multiple laboratories and a patient portal for results.", tech: ["ASP.NET MVC", "Web Services", "MS SQL Server", "HL7", ".NET Framework"] },
    ],
  },
];
export const enterpriseIntro = {
  eyebrow: "Enterprise & platform engineering",
  heading: "Beyond apps — platforms built to scale.",
  html: "Soni Consultancy Services doesn't only ship mobile apps. We architect and deliver <strong>enterprise-grade platforms</strong> — BSA/AML and fraud-detection systems, sanctions-screening engines, loyalty and rewards platforms, large-scale AWS cloud migrations and HL7 healthcare integrations — built with microservices, event-driven architecture and DevOps for high availability, resilience and scale.",
};
