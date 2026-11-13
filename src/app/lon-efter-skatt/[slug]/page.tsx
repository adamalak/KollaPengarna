import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/FaqSection";
import { formatPercent, formatSEK } from "@/lib/format";
import {
  getMunicipalityBySlug,
  getMunicipalityInsights,
  getSalaryTableForMunicipality,
  RANKED_MUNICIPALITIES_2026,
} from "@/lib/municipalSeo";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return RANKED_MUNICIPALITIES_2026.map((m) => ({
    slug: m.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipalityBySlug(slug);
  if (!m) return {};

  const taxStr = formatPercent(m.municipalTax, 2);
  return buildPageMetadata({
    title: `Lön efter skatt i ${m.name} ${SITE_CONFIG.year} – Kommunalskatt ${taxStr}`,
    description: `Se exakt vad du får kvar efter skatt i ${m.name} ${SITE_CONFIG.year}. Kommunalskatt ${taxStr} (plats ${m.taxRankLowestFirst} av 290), lönetabell 25 000–70 000 kr och egen kalkylator.`,
    path: `/lon-efter-skatt/${m.slug}`,
  });
}

export default async function MunicipalitySalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const m = getMunicipalityBySlug(slug);
  if (!m) notFound();

  const insights = getMunicipalityInsights(m);
  const salaryRows = getSalaryTableForMunicipality(m);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Hem", path: "/" },
    { name: `Kommunalskatt ${SITE_CONFIG.year}`, path: "/lon-efter-skatt" },
    { name: m.name, path: `/lon-efter-skatt/${m.slug}` },
  ]);

  const diffSign = insights.annualDiffVsNational35k >= 0 ? "+" : "−";

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
        <Link href="/lon-efter-skatt" className="hover:text-[#0B4F3F] hover:underline">
          Alla 290 kommuner
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{m.name}</span>
      </nav>

      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-[#DDD9CE] pb-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="font-mono-num text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            Skatteverket {SITE_CONFIG.year} &middot; Plats {m.taxRankLowestFirst} av 290
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Lön efter skatt i {m.name} ({SITE_CONFIG.year})
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
            {insights.comparisonHeadline}
          </p>
        </div>

        <Link
          href={`/verklig-timlon?kommun=${encodeURIComponent(m.name)}`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#0B4F3F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083B2F]"
        >
          Öppna kalkylator för {m.name} &rarr;
        </Link>
      </header>

      {/* Hyper-local KPI Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Kommunal + regionskatt</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            {formatPercent(m.municipalTax, 2)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Begravningsavgift: {formatPercent(m.burialFee, 3)}
          </p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Skatteranking i Sverige</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            #{m.taxRankLowestFirst} / 290
          </p>
          <p className="mt-1 text-xs text-stone-500">1 = lägst skatt i landet</p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Nettolön vid 35 000 kr</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-[#0B4F3F]">
            {formatSEK(insights.net35k)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Ej medlem i Svenska kyrkan</p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Skillnad mot rikssnitt/år (35k)</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            {diffSign}
            {formatSEK(Math.abs(insights.annualDiffVsNational35k))}
          </p>
          <p className="mt-1 text-xs text-stone-500">Jämfört med 32,38 % riksgenomsnitt</p>
        </div>
      </section>

      {/* Contextual Editorial Analysis */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-7">
        <h2 className="font-editorial text-xl font-semibold text-zinc-900">
          Så påverkar skatten i {m.name} din månadslön {SITE_CONFIG.year}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-700 sm:text-base">
          {insights.editorialParagraph}
        </p>
      </section>

      {/* Full Salary Breakdown Table */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-7">
        <h2 className="font-editorial text-xl font-semibold text-zinc-900">
          Tabell: Lön efter skatt i {m.name} ({SITE_CONFIG.year})
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">
          Beräknad med 2026 års grundavdrag, förstärkt jobbskatteavdrag och skiktgräns för statlig
          inkomstskatt (643 000 kr beskattningsbar inkomst).
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                <th className="py-3 pr-4">Bruttolön / mån</th>
                <th className="px-4 py-3">Nettolön (ej kyrkan)</th>
                <th className="px-4 py-3">Skatt / mån</th>
                <th className="px-4 py-3">Effektiv skatt</th>
                <th className="py-3 pl-4">Med kyrkoavgift ({formatPercent(m.avgChurchFee, 2)})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {salaryRows.map((row) => (
                <tr key={row.grossMonthly} className="hover:bg-[#FAF9F6]">
                  <td className="font-mono-num py-3 pr-4 font-semibold text-zinc-900">
                    {formatSEK(row.grossMonthly)}
                  </td>
                  <td className="font-mono-num px-4 py-3 font-semibold text-[#0B4F3F]">
                    {formatSEK(row.netMonthlyNoChurch)}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-stone-700">
                    {formatSEK(row.monthlyTaxNoChurch)}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-stone-700">
                    {formatPercent(row.effectiveTaxPercent, 1)}
                  </td>
                  <td className="font-mono-num py-3 pl-4 text-stone-700">
                    {formatSEK(row.netMonthlyWithChurch)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FaqSection title={`Vanliga frågor om skatt i ${m.name}`} items={insights.faqs} />

      {/* Hub & Spoke Peer Links */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-900">Jämför med liknande skattekommuner</h2>
          <Link href="/lon-efter-skatt" className="text-xs font-semibold text-[#0B4F3F] hover:underline">
            Visa alla 290 kommuner &rarr;
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {insights.nearbyPeers.map((peer) => (
            <Link
              key={peer.slug}
              href={`/lon-efter-skatt/${peer.slug}`}
              className="flex items-center justify-between rounded-md border border-stone-200 bg-[#FAF9F6] px-3 py-2 text-sm hover:border-[#0B4F3F]"
            >
              <span className="font-medium text-zinc-900">{peer.name}</span>
              <span className="font-mono-num text-xs text-stone-600">
                {formatPercent(peer.municipalTax, 2)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
