import { readFileSync } from "node:fs";
import path from "node:path";

const INDEXNOW_KEY = "kollapengarna-2026-indexnow-sv";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_BATCH = 10_000;

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kollapengarna.bnms.workers.dev";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const { host } = new URL(siteUrl);
const keyLocation = `${siteUrl}/${INDEXNOW_KEY}.txt`;

const sitemapPath = path.resolve(process.cwd(), "out", "sitemap.xml");
const sitemapXml = readFileSync(sitemapPath, "utf8");

const urlList = Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g))
  .map((match) => match[1].trim())
  .filter(Boolean);

if (urlList.length === 0) {
  console.error(`Inga <loc>-adresser hittades i ${sitemapPath}`);
  process.exit(1);
}

for (let i = 0; i < urlList.length; i += MAX_URLS_PER_BATCH) {
  const batch = urlList.slice(i, i + MAX_URLS_PER_BATCH);
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: batch,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const bodyText = (await response.text()).trim();
  console.log(
    `IndexNow POST -> HTTP ${response.status} ${response.statusText} (${batch.length} URL:er, host: ${host})`
  );
  if (bodyText) {
    console.log(`Svar: ${bodyText}`);
  }

  if (!response.ok) {
    process.exit(1);
  }
}
