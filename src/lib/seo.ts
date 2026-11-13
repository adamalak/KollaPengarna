import type { Metadata } from "next";
import { SITE_CONFIG } from "./siteConfig";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string; // e.g. "/csn-fribelopp" or "/lon-efter-skatt/kiruna"
}

/**
 * Build consistent Next.js metadata with canonical URL and Swedish OpenGraph tags.
 */
export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonicalUrl = `${SITE_CONFIG.url}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: path || "/",
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
    },
  };
}

/**
 * Build BreadcrumbList JSON-LD for Google Search breadcrumbs.
 */
export function buildBreadcrumbJsonLd(items: ReadonlyArray<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path}`,
    })),
  };
}

/**
 * Build WebApplication JSON-LD for interactive calculator pages.
 */
export function buildWebAppJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: `${SITE_CONFIG.url}${input.path}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: "sv-SE",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SEK",
    },
  };
}
