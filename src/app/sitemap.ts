import type { MetadataRoute } from "next";
import { RANKED_MUNICIPALITIES_2026 } from "@/lib/municipalSeo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const coreRoutes = [
    { path: "", priority: 1.0, freq: "monthly" as const },
    { path: "/csn-fribelopp", priority: 0.9, freq: "yearly" as const },
    { path: "/csn-aterbetalning", priority: 0.9, freq: "yearly" as const },
    { path: "/verklig-timlon", priority: 0.9, freq: "yearly" as const },
    { path: "/ranta-pa-ranta", priority: 0.9, freq: "yearly" as const },
    { path: "/delbetalning", priority: 0.9, freq: "yearly" as const },
    { path: "/lon-efter-skatt", priority: 0.9, freq: "yearly" as const },
    { path: "/om", priority: 0.6, freq: "monthly" as const },
    { path: "/integritet", priority: 0.3, freq: "yearly" as const },
  ];

  const coreEntries: MetadataRoute.Sitemap = coreRoutes.map((r) => ({
    url: `${SITE_CONFIG.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const municipalityEntries: MetadataRoute.Sitemap = RANKED_MUNICIPALITIES_2026.map((m) => ({
    url: `${SITE_CONFIG.url}/lon-efter-skatt/${m.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...coreEntries, ...municipalityEntries];
}
