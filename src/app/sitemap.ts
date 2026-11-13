import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/csn-fribelopp",
    "/csn-aterbetalning",
    "/verklig-timlon",
    "/ranta-pa-ranta",
    "/delbetalning",
    "/integritet",
  ];

  return routes.map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1.0 : route === "/integritet" ? 0.3 : 0.9,
  }));
}
