/**
 * Copy used by the home page sections (and the About/assistant pages that reuse it).
 * Kept apart from content/site.ts so it is only downloaded where it is rendered.
 */
export const values = [
  { title: "Ship over slideware.", body: "Working software every week beats a perfect plan." },
  { title: "Senior engineering only.", body: "No juniors. All code is written by experienced engineers." },
  { title: "Honest partnerships.", body: "Transparent advice, even when that means declining a project." },
];

/** Trust strip / guarantees. Bodies for the first three are the live home-page copy. */
export const guarantees = [
  { key: "weeks", title: "Ship in weeks, not quarters", body: "A focused MVP on both stores in 6–10 weeks. You see working software every week — no black box." },
  { key: "senior", title: "Senior engineers, no juniors", body: "The people on your call are the people writing the code. 5+ years commercial, store-proven." },
  { key: "price", title: "Fixed scope, fixed price", body: "A clear proposal within 48 hours of our call. You know the number before you commit a penny." },
  { key: "ip", title: "You own all code & IP", body: "" },
  { key: "nda", title: "NDA on request", body: "" },
  { key: "free", title: "Free intro call, no upfront fee", body: "" },
];

export const stats = [
  { value: 4, suffix: "+", label: "Apps live on App Store & Play Store" },
  { value: 35, suffix: "%", label: "More downloads (creator marketplace)" },
  { value: 40, suffix: "%", label: "Less payroll admin (HR platform)" },
  { value: 30, suffix: "+", label: "Countries served" },
];

export const marquee = {
  tech: ["React Native", "Expo", "TypeScript", "Node.js", "MongoDB", "Next.js", "PostgreSQL", "AWS", "Azure", "Docker", "Kubernetes", "Terraform", "Claude", "GPT"],
  proof: ["App Store", "Google Play", "GoodFirms 5.0"],
};

export const process = [
  { n: "01", title: "Discover", body: "Goals, scope, the metric to move. Fixed proposal in 48h." },
  { n: "02", title: "Design", body: "Clickable UX before a line of code." },
  { n: "03", title: "Build", body: "Weekly working software, in your tools." },
  { n: "04", title: "Launch", body: "App Store & Play Store submission, done for you." },
  { n: "05", title: "Scale", body: "Iterate on real usage; own the ops." },
];

export const homeServices = [
  { key: "rn", scene: "codeSplit" as const, title: "React Native App Development", body: "iOS & Android from one codebase — native performance, push, maps, payments, offline. Submitted, approved, live.", chips: ["React Native", "Expo", "iOS + Android"], href: "/react-native-app-development/" },
  { key: "mern", scene: "nodeGraph" as const, title: "MERN-Stack Backends", body: "MongoDB, Express, React, Node — the API, auth, dashboards and real-time infrastructure your app runs on, built to scale.", chips: ["Node.js", "MongoDB", "Next.js", "AWS"], href: "/services/#mern" },
  { key: "ai", scene: "neural" as const, title: "AI Integration", body: "Claude & GPT features that earn their place — AI fare prediction, smart matching, assistants, RAG.", chips: ["Claude API", "GPT", "RAG"], href: "/ai-app-development/", linkLabel: "See AI app ideas →" },
];

export const testimonials = [
  { name: "Satyam Rathaur", role: "Verified client review", source: "GoodFirms", initials: "SR", rating: "5.0", html: "A 5.0-rated engagement for the <b>Sales Automation</b> project — Mobile App Development, on a fixed-price build." },
  { name: "Shalin Bhatt", role: "Business Consultant for Startups & SMBs", source: "LinkedIn", initials: "SB", html: "“I've had the pleasure of collaborating with Het. Having strong technical knowledge, particularly in DevOps and Power BI, and always approaching challenges with a solution-oriented mindset.”" },
  { name: "Jiri Borc", role: "Networking & community building", source: "LinkedIn", initials: "JB", html: "“Het is a friendly, positive, responsible person and it was amazing meeting him on my networking sessions about digital marketing.”" },
];

export const tools = [
  { kick: "Calculator", title: "App Cost Calculator", cta: "Estimate cost →", href: "/app-cost-calculator/", viz: "calc" },
  { kick: "Free PDF · 8 pages", title: "App Scoping Guide", cta: "Get the Guide (Free)", href: "/app-scoping-guide/", viz: "guide" },
  { kick: "Stack picker", title: "Which stack fits your MVP", cta: "Get a recommendation →", href: "/blog/mvp-tech-stack-2026", viz: "stack" },
  { kick: "Decision tool", title: "Native, React Native or Flutter?", cta: "Get a recommendation →", href: "/blog/native-vs-cross-platform-2026", viz: "fork" },
  { kick: "Self-audit", title: "Score your app's security", cta: "Run the audit →", href: "/blog/mobile-app-security-checklist", viz: "shield" },
  { kick: "Revenue explorer", title: "How will your app make money?", cta: "Explore models →", href: "/blog/app-monetization-models", viz: "bars" },
];
