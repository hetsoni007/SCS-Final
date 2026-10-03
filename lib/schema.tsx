import { site } from "@/content/site";

/** Renders JSON-LD. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.filter(Boolean).map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}

export const personSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}/#het-soni`,
  name: site.founder.name,
  jobTitle: site.founder.role,
  url: `${site.url}/about/`,
  sameAs: [site.founder.linkedin, site.socials.medium],
  worksFor: { "@id": `${site.url}/#org` },
});

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${site.url}/#org`,
  name: site.name,
  alternateName: site.short,
  url: site.url,
  logo: `${site.url}/favicon.svg`,
  image: `${site.url}/opengraph-image`,
  email: site.email,
  telephone: site.phone,
  description: "React Native & MERN-stack mobile app development studio with AI integration.",
  founder: { "@type": "Person", "@id": `${site.url}/#het-soni`, name: site.founder.name },
  sameAs: Object.values(site.socials),
  areaServed: site.areaServed,
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  knowsAbout: ["React Native", "MERN Stack", "AI App Development", "Cross-platform mobile apps", "DevOps & Cloud Engineering"],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  alternateName: site.short,
  url: `${site.url}/`,
  publisher: { "@id": `${site.url}/#org` },
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
});

export const faqSchema = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } })),
});

export const serviceSchema = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url: `${site.url}${path}`,
  provider: { "@id": `${site.url}/#org` },
  areaServed: site.areaServed,
});

export const creativeWorkSchema = (name: string, description: string, path: string, keywords: string[]) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name,
  description,
  url: `${site.url}${path}`,
  creator: { "@id": `${site.url}/#org` },
  keywords: keywords.join(", "),
});
