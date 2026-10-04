/**
 * Interactive tools — inputs, weights and formulas ported 1:1 from the live site's JavaScript
 * (captured 2026-10-01). Change numbers here only; the UI reads everything from this file.
 */

/* ───────────── App cost calculator (/app-cost-calculator/) ───────────── */
export const appCalc = {
  /** Indicative blended $/week (about $9–$15 an hour): the studio's own low-cost pricing, set 2026-10-04. */
  rateLo: 360,
  rateHi: 600,
  minWeeks: 3,
  platforms: [
    { value: "cross", label: "Cross-platform", mult: 1 },
    { value: "ios", label: "iOS only", mult: 0.9 },
    { value: "android", label: "Android only", mult: 0.9 },
  ],
  stages: [
    { value: "mvp", label: "MVP", base: 4, hint: "~4 wk base" },
    { value: "ready", label: "Market-ready", base: 8, hint: "~8 wk base" },
    { value: "scale", label: "Scale / enterprise", base: 14, hint: "~14 wk base" },
  ],
  features: [
    { label: "User accounts & profiles", weeks: 1.5, on: true },
    { label: "Payments / subscriptions", weeks: 2.5 },
    { label: "Chat / messaging", weeks: 2.5 },
    { label: "Maps & geolocation", weeks: 2 },
    { label: "Push notifications", weeks: 1 },
    { label: "Admin dashboard", weeks: 3 },
    { label: "AI integration", weeks: 3 },
    { label: "Offline mode / sync", weeks: 2 },
    { label: "Analytics dashboards", weeks: 1.5 },
    { label: "Social feed", weeks: 2 },
  ],
  designs: [
    { value: "standard", label: "Standard", mult: 1 },
    { value: "custom", label: "Custom UI/UX", mult: 1.2 },
    { value: "premium", label: "Premium / animated", mult: 1.4 },
  ],
  backends: [
    { value: "baas", label: "Managed / BaaS", add: 0 },
    { value: "mern", label: "Custom MERN API", add: 3, hint: "+3" },
    { value: "realtime", label: "Realtime + scale", add: 5, hint: "+5" },
  ],
  team: "Het + dedicated engineers",
  pricingModel: "Fixed-price",
  submit: "Email me the breakdown →",
  gateNote: "We'll send a detailed scope breakdown and reply within one business day. No spam.",
  success: '✓ Got it. We\'ll review your scope and reply with a detailed breakdown within one business day — or <a href="https://calendly.com/het-soni-soniconsultancyservices/introductory">book a call</a> to lock the fixed price now.',
  disclaimer: "Estimates are indicative, based on typical project scope — not a quote. Your exact fixed price is confirmed after a short discovery call once requirements are clear.",
};
export type AppCalcConfig = { platform: number; stage: number; features: boolean[]; design: number; backend: number };
export const appCalcDefault: AppCalcConfig = { platform: 0, stage: 0, features: appCalc.features.map((f) => !!f.on), design: 0, backend: 0 };

/** weeks = round((base + Σfeatures + backend) × platform × design), min 3; cost = weeks × rate, rounded to $500. */
export function estimateApp(c: AppCalcConfig) {
  const feat = appCalc.features.reduce((s, f, i) => s + (c.features[i] ? f.weeks : 0), 0);
  let weeks = Math.round((appCalc.stages[c.stage].base + feat + appCalc.backends[c.backend].add) * appCalc.platforms[c.platform].mult * appCalc.designs[c.design].mult);
  if (weeks < appCalc.minWeeks) weeks = appCalc.minWeeks;
  const lo = Math.round((weeks * appCalc.rateLo) / 500) * 500, hi = Math.round((weeks * appCalc.rateHi) / 500) * 500;
  return { weeks, lo, hi };
}
export const fmtK = (n: number) => `$${Math.round(n / 100) / 10}k`; // one decimal when needed: $2.5k, $4k

/* ───────────── Cloud cost calculator (/cloud-cost-calculator/) ───────────── */
export const cloudCalc = {
  spend: { min: 1000, max: 250000, step: 1000, initial: 15000 },
  clouds: ["AWS", "Azure", "Google Cloud", "Multi-cloud"],
  cloudValues: ["AWS", "Azure", "GCP", "Multi-cloud"],
  waste: [
    { label: "Compute isn't right-sized", lo: 6, hi: 12, on: true },
    { label: "No savings plans / reserved instances", lo: 5, hi: 12, on: true },
    { label: "Idle / always-on non-prod resources", lo: 4, hi: 8, on: true },
    { label: "No autoscaling", lo: 3, hi: 6 },
    { label: "Over-provisioned databases", lo: 3, hi: 7 },
    { label: "Unattached storage & old snapshots", lo: 1, hi: 3 },
  ],
  capLo: 35, // "indicative optimisation band — capped so it stays credible"
  capHi: 55,
  submit: "Email me the savings plan →",
  gateNote: "We'll review your setup and reply with where the savings likely are, within one business day. No spam.",
  success: '✓ Got it. We\'ll review your inputs and reply with where your savings likely are — or <a href="https://calendly.com/het-soni-soniconsultancyservices/introductory">book a call</a> to start a cloud cost audit.',
  disclaimer: "Estimates are indicative, based on typical optimisation outcomes for the items you selected — not a guarantee. Your exact savings are confirmed by a short, fixed-scope cloud cost audit.",
};
export function estimateCloud(spend: number, picked: boolean[]) {
  let lo = 0, hi = 0;
  cloudCalc.waste.forEach((w, i) => { if (picked[i]) { lo += w.lo; hi += w.hi; } });
  lo = Math.min(lo, cloudCalc.capLo); hi = Math.min(hi, cloudCalc.capHi);
  const annual = spend * 12;
  return { lo, hi, saveLo: (annual * lo) / 100, saveHi: (annual * hi) / 100, moLo: (spend * lo) / 100, moHi: (spend * hi) / 100, bar: Math.min(100, hi * 1.8) };
}
export const fmtMoney = (n: number) => (n >= 1000 ? `$${(Math.round(n / 100) / 10).toFixed(1).replace(/\.0$/, "")}k` : `$${Math.round(n)}`);

/* ───────────── DevOps maturity assessment (/devops-maturity-assessment/) ───────────── */
export const devopsAssessment = {
  max: 24,
  questions: [
    { kick: "01 · Delivery", q: "How often do you deploy to production?", options: ["Less than once a month", "Roughly monthly", "Weekly", "On demand — multiple times a day"] },
    { kick: "02 · CI/CD", q: "How automated is your build & release?", options: ["Mostly manual steps", "Some build scripts", "Automated builds, manual deploys", "Fully automated CI/CD with rollbacks"] },
    { kick: "03 · Infrastructure", q: "How is your infrastructure managed?", options: ["By hand in the cloud console", "A mix of scripts and clicking", "Partially infrastructure-as-code", "Fully codified (Terraform / Bicep)"] },
    { kick: "04 · Environments", q: "Can you reproduce an environment?", options: ["Not really — it's bespoke", "Manually, and it takes a while", "Mostly automated", "One command, identical every time"] },
    { kick: "05 · Observability", q: "How do you find out about problems?", options: ["Users tell us", "We dig through logs", "Dashboards and some alerts", "Metrics, logs, traces + SLOs"] },
    { kick: "06 · Recovery", q: "If a deploy breaks production, how fast do you recover?", options: ["Hours or more", "About an hour", "Minutes, manually", "Automatic rollback in minutes"] },
    { kick: "07 · Security", q: "Where does security sit in your pipeline?", options: ["Not formally addressed", "Occasional manual reviews", "Some automated scanning", "Scans + secrets management (DevSecOps)"] },
    { kick: "08 · Cloud cost", q: "How do you manage cloud cost?", options: ["We don't really track it", "We glance at the monthly bill", "Tagging and budgets in place", "Right-sizing, savings plans, FinOps"] },
  ],
  /** each option is worth its index (0–3); every question starts on option 1, as on the live page */
  initial: 1,
  bands: [
    { min: 21, name: "Elite", sub: "Deploying on demand with strong automation, observability and recovery. We can help you push cost efficiency and reliability even further." },
    { min: 15, name: "Established", sub: "Solid foundations. The biggest gains now are in deeper automation, full observability and tighter cost control." },
    { min: 8, name: "Developing", sub: "You've started automating, but manual steps and gaps still slow you down. A focused DevOps Foundations engagement would move the needle fast." },
    { min: 0, name: "Foundational", sub: "Most delivery is still manual — which means big upside. CI/CD, infrastructure-as-code and observability would cut risk and free up your team." },
  ],
  submit: "Email me the full report →",
  gateNote: "We'll send your scored breakdown and the highest-leverage next steps, within one business day. No spam.",
  success: '✓ Got it. We\'ll send your scored breakdown and tailored next steps — or <a href="https://calendly.com/het-soni-soniconsultancyservices/introductory">book a call</a> to walk through it together.',
  disclaimer: "A self-assessment to help you benchmark and prioritise — not a formal audit. A short call turns it into a concrete plan.",
};
export const GATE_FIELDS = [
  { name: "name", label: "Your name", placeholder: "James Morrison", required: true, autoComplete: "name" },
  { name: "email", label: "Work email", type: "email" as const, placeholder: "james@company.com", autoComplete: "email" },
];
