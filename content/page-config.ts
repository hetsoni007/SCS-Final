import type { SceneKey } from "@/lib/gl-store";

/** Signature 3D scene per page (hero). Every scene has a static poster + reduced-motion fallback. */
export const pageScene: Record<string, { scene: SceneKey; props?: Record<string, unknown>; poster?: "orb" | "globe" | "phones" | "device" | "portal" | "grid"; screens?: string[] }> = {
  about: { scene: "globe", props: { orbit: true }, poster: "globe" },
  services: { scene: "exploded" },
  "react-native-app-development": { scene: "codeSplit" },
  "mvp-development": { scene: "blocks", props: { count: 10 } },
  "ai-app-development": { scene: "neural" },
  "devops-cloud-engineering": { scene: "cloud", poster: "grid" },
  "wordpress-website-development-india": { scene: "browser" },
  hire: { scene: "pods" },
  "fintech-app-development": { scene: "vault" },
  "retail-app-development": { scene: "shelf" },
  "ride-hailing-app-development": { scene: "city", poster: "grid" },
  "hr-payroll-app-development": { scene: "ledger" },
  "react-native-app-development-usa": { scene: "device", props: { screens: ["/assets/portfolio/creator-marketplace-1.webp", "/assets/portfolio/retail-ops-1.webp"] }, poster: "device", screens: ["/assets/portfolio/creator-marketplace-1.webp"] },
  "react-native-app-development-uk": { scene: "device", props: { screens: ["/assets/portfolio/hr-payroll-sim-punch.webp", "/assets/portfolio/creator-marketplace-3.webp"], platform: "android" }, poster: "device", screens: ["/assets/portfolio/hr-payroll-sim-punch.webp"] },
  "react-native-app-development-dubai": { scene: "device", props: { screens: ["/assets/portfolio/ride-hailing-sim-map.webp", "/assets/portfolio/creator-marketplace-g3.webp"] }, poster: "device", screens: ["/assets/portfolio/ride-hailing-sim-map.webp"] },
  contact: { scene: "orb" },
  "app-scoping-guide": { scene: "booklet" },
  blog: { scene: "pages" },
  work: { scene: "device", props: { screens: ["/assets/portfolio/hr-payroll-sim-punch.webp", "/assets/portfolio/creator-marketplace-1.webp", "/assets/portfolio/retail-ops-1.webp", "/assets/portfolio/ride-hailing-sim-map.webp"] }, poster: "device", screens: ["/assets/portfolio/hr-payroll-sim-punch.webp"] },
};

/** Pages rendered entirely by the shared template at app/[slug]/page.tsx. */
export const templatePages = [
  "about", "services", "react-native-app-development", "mvp-development", "hire",
  "fintech-app-development", "retail-app-development", "ride-hailing-app-development", "hr-payroll-app-development",
  "react-native-app-development-usa", "react-native-app-development-uk", "react-native-app-development-dubai",
  "wordpress-website-development-india", "ai-app-development", "devops-cloud-engineering",
];

/** Breadcrumb labels for pages whose live version has no breadcrumb trail. */
export const crumbLabel: Record<string, string> = {
  work: "Work", "app-scoping-guide": "App Scoping Guide", privacy: "Privacy", blog: "Blog", contact: "Contact",
};
