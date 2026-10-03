/** Brand facts — single source of truth. Edit here; components never hard-code these. */
export const site = {
  name: "Soni Consultancy Services",
  short: "SCS",
  url: "https://soniconsultancyservices.com",
  positioning: "React Native · MERN · AI Integration",
  description:
    "React Native, MERN & AI app development for founders. Senior engineers, fixed-price proposals in 48 hours, apps live on both stores.",
  themeColor: "#060607",
  email: "het.soni@soniconsultancyservices.com",
  phone: "+91-8160-682185", // from the live site's LocalBusiness schema
  calendly: "https://calendly.com/het-soni-soniconsultancyservices/introductory",
  founder: {
    name: "Het Soni",
    role: "Founder & Lead Engineer",
    linkedin: "https://www.linkedin.com/in/hetsoni/",
    initials: "HS",
  },
  /** Het's LinkedIn newsletter (name, cadence and description as published on its LinkedIn page). */
  newsletter: {
    name: "Lead Gen Lab",
    url: "https://www.linkedin.com/newsletters/lead-gen-lab-7452722488368644096/",
    blurb: "Daily lead generation experiments with real data, real outreach, and real results.",
    cadence: "Published daily on LinkedIn",
  },
  socials: {
    linkedin: "https://www.linkedin.com/in/hetsoni/",
    instagram: "https://www.instagram.com/soni.consultancyservices/",
    facebook: "https://www.facebook.com/soniconsultancyservices",
    medium: "https://medium.com/@hetsoni9398",
  },
  areaServed: ["GB", "US", "AE", "IN", "CA", "AU"],
  markets: [
    { code: "GB", name: "UK", lat: 51.5, lon: -0.12 },
    { code: "US", name: "US", lat: 40.7, lon: -74 },
    { code: "AE", name: "UAE", lat: 25.2, lon: 55.27 },
    { code: "IN", name: "India", lat: 23.02, lon: 72.57 },
    { code: "CA", name: "Canada", lat: 43.65, lon: -79.38 },
    { code: "AU", name: "Australia", lat: -33.87, lon: 151.2 },
  ],
  footerLine: "© 2026 Soni Consultancy Services. All rights reserved. React Native · MERN · AI",
} as const;

export const nav = [
  { label: "Services", href: "/services/", mega: "services" as const },
  { label: "Work", href: "/work/" },
  { label: "Blog", href: "/blog/" },
  { label: "AI Apps", href: "/ai-app-development/" },
  { label: "DevOps & Cloud", href: "/devops-cloud-engineering/" },
  { label: "About", href: "/about/", mega: "industries" as const },
  { label: "Contact", href: "/contact/" },
];

export const megaServices = [
  { n: "01", label: "React Native App Development", href: "/react-native-app-development/", icon: "phone" },
  { n: "02", label: "MVP Development", href: "/mvp-development/", icon: "blocks" },
  { n: "03", label: "MERN-Stack & Web Development", href: "/services/#mern", icon: "server" },
  { n: "04", label: "AI Integration", href: "/ai-app-development/", icon: "brain" },
  { n: "05", label: "DevOps & Cloud", href: "/devops-cloud-engineering/", icon: "cloud" },
  { n: "06", label: "Hire a Developer", href: "/hire/", icon: "users" },
  { n: "07", label: "WordPress Website Development", href: "/wordpress-website-development-india/", icon: "layout" },
];
export const industries = [
  { label: "FinTech", href: "/fintech-app-development/", icon: "vault" },
  { label: "Retail", href: "/retail-app-development/", icon: "store" },
  { label: "Ride-Hailing", href: "/ride-hailing-app-development/", icon: "car" },
  { label: "HR & Payroll", href: "/hr-payroll-app-development/", icon: "fingerprint" },
];

export const footer = {
  explore: [
    { label: "Services", href: "/services/" },
    { label: "React Native", href: "/react-native-app-development/" },
    { label: "MVP Development", href: "/mvp-development/" },
    { label: "Work", href: "/work/" },
    { label: "Blog", href: "/blog/" },
    { label: "AI Apps", href: "/ai-app-development/" },
    { label: "DevOps & Cloud", href: "/devops-cloud-engineering/" },
    { label: "About", href: "/about/" },
    { label: "WordPress Websites", href: "/wordpress-website-development-india/" },
    { label: "Hire a Developer", href: "/hire/" },
  ],
  industries,
  company: [
    { label: "LinkedIn", href: site.socials.linkedin },
    { label: "Instagram", href: site.socials.instagram },
    { label: "Facebook", href: site.socials.facebook },
    { label: "Medium", href: site.socials.medium },
    { label: "Newsletter", href: site.newsletter.url },
    { label: "Contact", href: "/contact/" },
    { label: "Privacy", href: "/privacy/" },
  ],
  start: [
    { label: "Book a Call", href: site.calendly, calendly: true },
    { label: "App cost estimate", href: "/app-cost-calculator/" },
    { label: "Free scoping guide", href: "/app-scoping-guide/" },
    { label: "Email us", href: `mailto:${site.email}` },
  ],
  regions: [
    { label: "React Native — USA", href: "/react-native-app-development-usa/" },
    { label: "React Native — UK", href: "/react-native-app-development-uk/" },
    { label: "React Native — Dubai", href: "/react-native-app-development-dubai/" },
  ],
  tools: [
    { label: "Cloud cost calculator", href: "/cloud-cost-calculator/" },
    { label: "DevOps maturity assessment", href: "/devops-maturity-assessment/" },
  ],
};
