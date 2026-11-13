import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { MunicipalDirectory } from "@/components/MunicipalDirectory";
import { formatPercent } from "@/lib/format";
import { RANKED_MUNICIPALITIES_2026, SORTED_LOWEST_TAX_2026 } from "@/lib/municipalSeo";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = buildPageMetadata({
  title: `Kommunalskatt ${SITE_CONFIG.year} – Alla 290 kommuner & lön efter skatt`,
  description: `Jämför kommunalskatten ${SITE_CONFIG.year} i samtliga 290 svenska kommuner från lägst (Österåker 28,93 %) till högst (Dorotea 35,65 %). Se tabell för lön efter skatt i din kommun.`,
  path: "/lon-efter-skatt",
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Vilken kommun har lägst skatt i Sverige 2026?",
    answer:
      "Österåker har Sveriges lägsta totala kommunal- och regionskatt år 2026 på 28,93 %, följt av Kävlinge (29,59 %) och Lidingö (29,67 %).",
  },
  {
    question: "Vilken kommun har högst skatt i Sverige 2026?",
    answer:
      "Dorotea har Sveriges högsta totala kommunal- och regionskatt år 2026 på 35,65 %, följt av Vilhelmina (35,50 %) och Åsele/Sorsele (35,45 %).",
  },
  {
    question: "Vad är den genomsnittliga kommunalskatten i Sverige 2026?",
    answer:
      "Den genomsnittliga totala kommunalskatten (kommun + region) i Sverige är 32,38 % för inkomståret 2026 enligt SCB.",
  },
];

export default function LonEfterSkattHubPage() {
  const lowest5 = SORTED_LOWEST_TAX_2026.slice(0, 5);
  const highest5 = SORTED_LOWEST_TAX_2026.slice(-5).reverse();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Hem", path: "/" },
    { name: `Kommunalskatt ${SITE_CONFIG.year}`, path: "/lon-efter-skatt" },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Brödsmulor" className="mb-4 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-[#0B4F3F] hover:underline">
          Hem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Alla 290 kommuner ({SITE_CONFIG.year})</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Kommunalskatt {SITE_CONFIG.year} – Alla 290 kommuner
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Komplett lista över {SITE_CONFIG.year} års kommunal- och regionskatt från Skatteverket.
          Klicka på en kommun för att se nettolön för 25 000–70 000 kr/mån och räkna på pendling.
        </p>
      </header>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-[#DDD9CE] border-t-4 border-t-[#0B4F3F] bg-white p-5">
          <h2 className="text-sm font-bold tracking-wider text-[#0B4F3F] uppercase">
            Lägst kommunalskatt {SITE_CONFIG.year}
          </h2>
          <ol className="mt-3 divide-y divide-stone-200 text-sm">
            {lowest5.map((m) => (
              <li key={m.slug} className="flex items-center justify-between py-2">
                <Link href={`/lon-efter-skatt/${m.slug}`} className="font-semibold hover:text-[#0B4F3F] hover:underline">
                  {m.taxRankLowestFirst}. {m.name}
                </Link>
                <span className="font-mono-num font-semibold text-zinc-900">
                  {formatPercent(m.municipalTax, 2)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] border-t-4 border-t-amber-700 bg-white p-5">
          <h2 className="text-sm font-bold tracking-wider text-amber-800 uppercase">
            Högst kommunalskatt {SITE_CONFIG.year}
          </h2>
          <ol className="mt-3 divide-y divide-stone-200 text-sm">
            {highest5.map((m) => (
              <li key={m.slug} className="flex items-center justify-between py-2">
                <Link href={`/lon-efter-skatt/${m.slug}`} className="font-semibold hover:text-[#0B4F3F] hover:underline">
                  {m.taxRankLowestFirst}. {m.name}
                </Link>
                <span className="font-mono-num font-semibold text-zinc-900">
                  {formatPercent(m.municipalTax, 2)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <MunicipalDirectory municipalities={RANKED_MUNICIPALITIES_2026} />

      <FaqSection title="Vanliga frågor om kommunalskatt 2026" items={FAQ_ITEMS} />
    </div>
  );
}
