import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/FaqSection";
import { MethodologyNotice } from "@/components/MethodologyNotice";
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
  const typicalMonthStr = formatSEK(m.typicalMonthlyIncome);
  return buildPageMetadata({
    title: `Lön efter skatt i ${m.name} ${SITE_CONFIG.year} – Skatt ${taxStr} (${m.countyName})`,
    description: `Se nettolön i ${m.name} (${m.countyName}) ${SITE_CONFIG.year}. Total kommunal skatt ${taxStr} (plats ${m.taxRankLowestFirst} av 290), räkneexempel på typisk förvärvsinkomst ${typicalMonthStr}/mån och lönetabell.`,
    path: `/lon-efter-skatt/${m.slug}`,
  });
}

function formatChangeCell(deltaPct: number): string {
  if (Math.abs(deltaPct) < 0.001) return "0,00 %-enh.";
  const sign = deltaPct < 0 ? "−" : "+";
  return `${sign}${formatPercent(Math.abs(deltaPct), 2).replace(" %", "")} %-enh.`;
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

  const diffSign = insights.typicalSalary.annualDiffVsNationalTaxAtTypical >= 0 ? "+" : "−";
  const taxDiffColor =
    m.taxChangeTotalPct < 0
      ? "text-[#0B4F3F]"
      : m.taxChangeTotalPct > 0
      ? "text-amber-800"
      : "text-stone-600";

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
        <span className="text-zinc-900">
          {m.name} ({m.countyName})
        </span>
      </nav>

      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-[#DDD9CE] pb-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="font-mono-num text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            SCB &amp; Skatteverket {SITE_CONFIG.year} &middot; {m.countyName} &middot; Plats{" "}
            {m.taxRankLowestFirst} av 290
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
      <section aria-label="Nyckeltal för kommunen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Kommunal + regionskatt 2026</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            {formatPercent(m.municipalTax, 2)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {m.isSingleTierGotland
              ? "Gotland: helkommunalt ansvar (0 % separat region)"
              : `Kommun ${formatPercent(m.municipalityPartTax, 2)} + Region ${formatPercent(
                  m.regionPartTax,
                  2
                )}`}
          </p>
          <p className={`font-mono-num mt-1 text-[11px] font-semibold ${taxDiffColor}`}>
            {insights.taxChange.shortBadge}
          </p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">Skatteranking i riket &amp; länet</p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            #{m.taxRankLowestFirst} / 290
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {m.isSingleTierGotland
              ? "Enda kommunen i Gotlands län"
              : `Plats ${m.countyRankLowestFirst} av ${m.countyTotalMunicipalities} i ${m.countyName}`}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">1 = lägst skattesats</p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">
            Netto på typisk förvärvsinkomst ({formatSEK(insights.typicalSalary.monthlyGrossRounded)})
          </p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-[#0B4F3F]">
            {formatSEK(insights.typicalSalary.netMonthlyNoChurch)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            SCB median 20–64 år: {formatSEK(insights.typicalSalary.annualMedian)}/år
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Ej medlem i Svenska kyrkan</p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white p-4">
          <p className="text-xs font-medium text-stone-500">
            Skatteeffekt/år vs rikssnitt ({formatSEK(insights.typicalSalary.monthlyGrossRounded)}/mån)
          </p>
          <p className="font-mono-num mt-1 text-2xl font-semibold text-zinc-900">
            {diffSign}
            {formatSEK(Math.abs(insights.typicalSalary.annualDiffVsNationalTaxAtTypical))}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Jämfört med {formatPercent(insights.national.municipalTax2026, 2)} rikssnitt
          </p>
          <p className="mt-1 text-[11px] text-stone-500">
            Länssnitt ({m.countyName}): {formatPercent(insights.county.municipalTax2026, 2)}
          </p>
        </div>
      </section>

      {/* Tax Composition & 2025->2026 Breakdown */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-editorial text-xl font-semibold text-zinc-900">
            Skatteuppdelning &amp; förändring 2025–2026 i {m.name}
          </h2>
          <span className="font-mono-num rounded border border-stone-200 bg-[#FAF9F6] px-2.5 py-1 text-xs font-medium text-stone-700">
            {insights.taxChange.driverLabel}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                <th className="py-2.5 pr-4">Del av skatten</th>
                <th className="px-4 py-2.5">2025</th>
                <th className="px-4 py-2.5">2026</th>
                <th className="px-4 py-2.5">Förändring</th>
                <th className="py-2.5 pl-4">Jämförelsesnitt 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr>
                <td className="py-2.5 pr-4 font-medium text-zinc-900">Kommunalskatt ({m.name})</td>
                <td className="font-mono-num px-4 py-2.5 text-stone-600">
                  {formatPercent(m.municipalityPartTax2025, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 font-semibold text-zinc-900">
                  {formatPercent(m.municipalityPartTax, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 text-stone-700">
                  {formatChangeCell(m.taxChangeMunicipalityPct)}
                </td>
                <td className="font-mono-num py-2.5 pl-4 text-stone-500">
                  Riket {formatPercent(insights.national.municipalityPartTax2026, 2)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-medium text-zinc-900">
                  Regionskatt ({m.countyName})
                </td>
                <td className="font-mono-num px-4 py-2.5 text-stone-600">
                  {formatPercent(m.regionPartTax2025, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 font-semibold text-zinc-900">
                  {formatPercent(m.regionPartTax, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 text-stone-700">
                  {formatChangeCell(m.taxChangeRegionPct)}
                </td>
                <td className="font-mono-num py-2.5 pl-4 text-stone-500">
                  Riket {formatPercent(insights.national.regionPartTax2026, 2)}
                </td>
              </tr>
              <tr className="bg-[#FAF9F6] font-semibold">
                <td className="py-2.5 pr-4 text-zinc-900">Summa kommunal + regionskatt</td>
                <td className="font-mono-num px-4 py-2.5 text-stone-700">
                  {formatPercent(m.municipalTax2025, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 text-[#0B4F3F]">
                  {formatPercent(m.municipalTax, 2)}
                </td>
                <td className={`font-mono-num px-4 py-2.5 ${taxDiffColor}`}>
                  {formatChangeCell(m.taxChangeTotalPct)}
                </td>
                <td className="font-mono-num py-2.5 pl-4 text-stone-600">
                  Län {formatPercent(insights.county.municipalTax2026, 2)} &middot; Riket{" "}
                  {formatPercent(insights.national.municipalTax2026, 2)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-stone-700">Begravningsavgift (obligatorisk)</td>
                <td className="px-4 py-2.5 text-stone-400">–</td>
                <td className="font-mono-num px-4 py-2.5 text-stone-800">
                  {formatPercent(m.burialFee, 3)}
                </td>
                <td className="px-4 py-2.5 text-stone-400">–</td>
                <td className="py-2.5 pl-4 text-xs text-stone-500">
                  Kyrkoavgift snitt: {formatPercent(m.avgChurchFee, 2)} (vid medlemskap)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Local Earned Income Benchmark Callout */}
      <section className="mt-8 rounded-lg border border-[#0B4F3F]/25 bg-[#FAF9F6] p-6 sm:p-7">
        <p className="font-mono-num text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
          Lokalt räkneexempel &middot; SCB sammanräknad förvärvsinkomst 2024 (20–64 år)
        </p>
        <h2 className="font-editorial mt-1.5 text-xl font-semibold text-zinc-900">
          Typisk förvärvsinkomst i {m.name} utslaget per månad:{" "}
          {formatSEK(insights.typicalSalary.monthlyGrossRounded)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          I {m.name} var den officiella medianinkomsten (sammanräknad förvärvsinkomst för boende
          20–64 år enligt SCB 2024){" "}
          <strong className="text-zinc-900">
            {formatSEK(insights.typicalSalary.annualMedian)}/år
          </strong>{" "}
          (medelinkomst {formatSEK(insights.typicalSalary.annualMean)}/år), vilket motsvarar cirka{" "}
          <strong className="text-zinc-900">
            {formatSEK(insights.typicalSalary.monthlyGrossRounded)}/mån
          </strong>{" "}
          avrundat till närmaste 100-tal kr. Måttet omfattar samtliga förvärvsarbetande och
          inkomsttagare i åldersgruppen oavsett sysselsättningsgrad.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-[#DDD9CE] bg-white p-3.5">
            <p className="text-xs text-stone-500">Nettolön per månad (ej kyrkan)</p>
            <p className="font-mono-num mt-1 text-lg font-semibold text-[#0B4F3F]">
              {formatSEK(insights.typicalSalary.netMonthlyNoChurch)}
            </p>
          </div>
          <div className="rounded-md border border-[#DDD9CE] bg-white p-3.5">
            <p className="text-xs text-stone-500">Preliminär skatt / mån (effektiv)</p>
            <p className="font-mono-num mt-1 text-lg font-semibold text-zinc-900">
              {formatSEK(insights.typicalSalary.monthlyTaxNoChurch)} (
              {formatPercent(insights.typicalSalary.effectiveTaxPercent, 1)})
            </p>
          </div>
          <div className="rounded-md border border-[#DDD9CE] bg-white p-3.5">
            <p className="text-xs text-stone-500">Nettolön inkl. snittkyrkoavgift</p>
            <p className="font-mono-num mt-1 text-lg font-semibold text-zinc-900">
              {formatSEK(insights.typicalSalary.netMonthlyWithChurch)}
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Dimensional Contextual Editorial Analysis */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-7">
        <h2 className="font-editorial text-xl font-semibold text-zinc-900">
          Så påverkar skatten och inkomstnivån i {m.name} din månadslön {SITE_CONFIG.year}
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700 sm:text-base">
          <p>{insights.editorialSections.taxStructure}</p>
          <p>{insights.editorialSections.localIncome}</p>
          <p>{insights.editorialSections.feesAndThreshold}</p>
        </div>
      </section>

      {/* Full Salary Breakdown Table */}
      <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-7">
        <h2 className="font-editorial text-xl font-semibold text-zinc-900">
          Tabell: Lön efter skatt i {m.name} ({SITE_CONFIG.year})
        </h2>
        <p className="mt-1.5 text-sm text-stone-600">
          Beräknad med 2026 års grundavdrag, förstärkt jobbskatteavdrag och skiktgräns för statlig
          inkomstskatt (643 000 kr beskattningsbar inkomst). Den markerade raden motsvarar typisk
          förvärvsinkomst i {m.name} utslaget per månad (avrundad till närmaste 100 kr från SCB:s
          årsmedian).
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[580px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                <th className="py-3 pr-4">Bruttoinkomst / mån</th>
                <th className="px-4 py-3">Nettolön (ej kyrkan)</th>
                <th className="px-4 py-3">Skatt / mån</th>
                <th className="px-4 py-3">Effektiv skatt</th>
                <th className="py-3 pl-4">Med kyrkoavgift ({formatPercent(m.avgChurchFee, 2)})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {salaryRows.map((row) => (
                <tr
                  key={row.grossMonthly}
                  className={
                    row.isLocalTypical
                      ? "bg-[#ECFDF5]/60 font-medium"
                      : "hover:bg-[#FAF9F6]"
                  }
                >
                  <td className="font-mono-num py-3 pr-4 font-semibold text-zinc-900">
                    <span>{formatSEK(row.grossMonthly)}</span>
                    {row.isLocalTypical && (
                      <span className="ml-2 inline-block rounded border border-[#0B4F3F]/30 bg-white px-2 py-0.5 font-sans text-[11px] font-semibold text-[#0B4F3F]">
                        Typisk i {m.name}
                      </span>
                    )}
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

      {/* County Peers + National Peers */}
      {insights.sameCountyPeers.length > 0 && (
        <section className="mt-8 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-zinc-900">
              Jämför andra kommuner i {m.countyName}
            </h2>
            <span className="text-xs text-stone-500">
              Länssnitt: {formatPercent(insights.county.municipalTax2026, 2)}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {insights.sameCountyPeers.map((peer) => (
              <Link
                key={peer.slug}
                href={`/lon-efter-skatt/${peer.slug}`}
                className="flex items-center justify-between rounded-md border border-stone-200 bg-[#FAF9F6] px-3 py-2 text-sm hover:border-[#0B4F3F]"
              >
                <span className="font-medium text-zinc-900">{peer.name}</span>
                <span className="font-mono-num text-xs text-stone-600">
                  {formatPercent(peer.municipalTax, 2)} &middot; typiskt{" "}
                  {formatSEK(peer.typicalMonthlyIncome)}/mån
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-900">
            Kommuner med liknande total skattesats i Sverige
          </h2>
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

      <MethodologyNotice
        sourceKeys={[
          "scbKommunalskatter",
          "scbInkomster",
          "skatteverketSkattesatser",
          "skatteverketJobbskatteavdrag",
          "skatteverketStatligSkatt",
        ]}
        methodologyNote={`Skattesatser för ${m.name} (kommunalskatt, regionskatt och ändring 2025–2026) kommer från SCB:s tabell OE0101 och Skatteverkets öppna data för skatteåret ${SITE_CONFIG.year}. Inkomstexemplet bygger på SCB:s sammanräknade förvärvsinkomst för 20–64 år (2024, tabell HE0110) delat på 12 och avrundat till närmaste 100 kr. Nettolönen beräknas schablonmässigt för person under 66 år enligt ${SITE_CONFIG.year} års prisbasbelopp (59 200 kr), grundavdrag och jobbskatteavdrag.`}
      />
    </div>
  );
}
