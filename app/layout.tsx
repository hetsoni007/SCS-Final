import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Chrome from "@/components/ui/Chrome";
import MobileBar from "@/components/ui/MobileBar";
import { site } from "@/content/site";
import { preloader } from "@/lib/motion";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/schema";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--f-display", display: "swap", weight: ["500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap", weight: ["400", "500", "600"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "React Native & AI App Development Company | Soni Consultancy", template: "%s" },
  description: site.description,
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: { siteName: site.name, type: "website" },
  twitter: { card: "summary_large_image" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  verification: { google: "-EHgNS5_QI6acSrvKxMND0pMtFpbAC6SAm4x_Q-nB0Q" },
};
export const viewport: Viewport = { themeColor: site.themeColor, width: "device-width", initialScale: 1 };

/**
 * Runs before paint: theme, motion preference, a `js` flag so reveals never hide content without JS, and the
 * first-visit intro flag (wide screens only, never with reduced motion or data saver) that shows the intro cover.
 */
const boot = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('scs-theme'),m=localStorage.getItem('scs-motion');d.dataset.theme=t==='light'?'light':'dark';d.dataset.motion=m||(matchMedia('(prefers-reduced-motion: reduce)').matches?'reduce':'full');d.classList.add('js')}catch(e){d.dataset.theme='dark'}try{var k='${preloader.storageKey}',s=sessionStorage.getItem(k),c=navigator.connection;sessionStorage.setItem(k,'1');if(!s&&d.dataset.motion==='full'&&matchMedia('(min-width: 768px)').matches&&!(c&&c.saveData))d.dataset.intro='1'}catch(e){}})();`;

// Google Tag Manager with Consent Mode: the container loads for every visitor, with storage denied until the
// visitor accepts analytics cookies (a returning visitor's stored choice is applied at once). Ad storage stays
// denied: the banner only asks about analytics. lib/prefs.ts sends the update when the choice changes.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const gtmBoot = GTM_ID
  ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;(function(){var a='denied';try{if(localStorage.getItem('scs-consent')==='granted')a='granted'}catch(e){}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:a})})();(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`
  : "";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        {gtmBoot && <script dangerouslySetInnerHTML={{ __html: gtmBoot }} />}
      </head>
      <body>
        {GTM_ID && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} /></noscript>}
        {/* first-visit intro cover: shown by the boot script's data-intro flag, animated by ui/Preloader */}
        <div className="intro-cover" aria-hidden><span className="intro-mark">SCS</span></div>
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="scroll-progress" aria-hidden />
        <div className="bg-fluid" aria-hidden />
        <div className="grid-lines" aria-hidden />
        <div className="grain" aria-hidden />
        <AppProviders>
          <Nav />
          <main id="main" tabIndex={-1} className="outline-none"><ViewTransition default="page">{children}</ViewTransition></main>
          <Footer />
          <MobileBar />
          <Chrome />
        </AppProviders>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
