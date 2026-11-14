import type { Metadata } from "next";
import Link from "next/link";
import { CsnCalculator } from "@/components/calculators/CsnCalculator";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { MethodologyNotice } from "@/components/MethodologyNotice";
import { CSN_2026_FRIBELOPP_ANCHORS } from "@/lib/calculators/csn";
import { formatSEK } from "@/lib/format";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebAppJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = buildPageMetadata({
  title: "CSN Fribelopp-kalkylator 2026 – Räkna ut hur mycket du får tjäna",
  description:
    "Räkna ut ditt exakta fribelopp hos CSN för 2026. Se hur mycket du får tjäna vid 100 %, 75 % eller 50 % studietakt och exakt vad som dras vid överträdelse.",
  path: "/csn-fribelopp",
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Vad är CSN:s fribelopp för 2026?",
    answer:
      "För en vanlig 20-veckorstermin på heltid (100 %) är fribeloppet 114 676 kr före skatt per kalenderhalvår år 2026. Det motsvarar cirka 19 113 kr i snitt per månad under halvåret.",
  },
  {
    question: "Räknas lön före eller efter skatt mot fribeloppet?",
    answer:
      "CSN räknar alltid din inkomst före skatt (bruttoinkomst), plus eventuella skattepliktiga kapitalinkomster som vinst vid försäljning av aktier eller fonder. Själva studiemedlet räknas inte in.",
  },
  {
    question: "Räknas sommarjobb in i fribeloppet?",
    answer:
      "Det beror på när lönen betalas ut. Fribeloppet gäller per kalenderhalvår (1 jan–30 jun och 1 jul–31 dec). Lön som betalas ut i juli–augusti räknas till andra kalenderhalvåret.",
  },
  {
    question: "Vad händer om jag tjänar mer än fribeloppet?",
    answer:
      "Ditt studiemedel minskas med 61 procent av beloppet som överstiger fribeloppet. CSN minskar studielånet först. Först om hela lånet skulle ätas upp minskas även studiebidraget.",
  },
];

export default function CsnFribeloppPage() {
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Hem", path: "/" },
      { name: `CSN Fribelopp ${SITE_CONFIG.year}`, path: "/csn-fribelopp" },
    ]),
    buildWebAppJsonLd({
      name: `CSN Fribelopp-kalkylator ${SITE_CONFIG.year}`,
      description:
        "Räkna ut fribelopp och 61 %-avdrag hos CSN för 2026 vid heltid och deltid.",
      path: "/csn-fribelopp",
    }),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Brödsmulor" className="mb-4 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-[#0B4F3F] hover:underline">
          Hem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">CSN Fribelopp {SITE_CONFIG.year}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          CSN Fribelopp-kalkylator {SITE_CONFIG.year}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Kolla direkt hur mycket du kan jobba extra innan CSN minskar ditt studielån och bidrag.
          Allt räknas ut lokalt utifrån {SITE_CONFIG.year} års belopp.
        </p>
      </header>

      <CsnCalculator />

      <section className="mt-12 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-8">
        <h2 className="font-editorial text-xl font-semibold tracking-tight text-zinc-900">
          Tabell: CSN:s fribelopp per kalenderhalvår ({SITE_CONFIG.year})
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Högsta tillåtna bruttoinkomst (före skatt) under 1 jan–30 jun eller 1 jul–31 dec beroende
          på antal veckor med studiemedel.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                <th className="py-3 pr-4">Veckor med CSN</th>
                <th className="px-4 py-3">Heltid (100 %)</th>
                <th className="px-4 py-3">Deltid (75 %)</th>
                <th className="py-3 pl-4">Deltid (50 %)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {CSN_2026_FRIBELOPP_ANCHORS[100].map(([weeks], idx) => (
                <tr key={weeks} className="hover:bg-[#FAF9F6]">
                  <td className="py-3 pr-4 font-semibold text-zinc-900">
                    {weeks} veckor {weeks === 20 ? "(normal termin)" : ""}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-stone-700">
                    {formatSEK(CSN_2026_FRIBELOPP_ANCHORS[100][idx][1])}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-stone-700">
                    {formatSEK(CSN_2026_FRIBELOPP_ANCHORS[75][idx][1])}
                  </td>
                  <td className="font-mono-num py-3 pl-4 text-stone-700">
                    {formatSEK(CSN_2026_FRIBELOPP_ANCHORS[50][idx][1])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FaqSection title="Vanliga frågor om CSN och fribelopp" items={FAQ_ITEMS} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#DDD9CE] bg-white p-5">
        <p className="text-sm text-stone-600">
          Vill du räkna på vad studielånet kostar när du ska börja betala tillbaka det?
        </p>
        <Link
          href="/csn-aterbetalning"
          className="text-sm font-semibold text-[#0B4F3F] hover:underline"
        >
          Öppna CSN Återbetalning {SITE_CONFIG.year} &rarr;
        </Link>
      </div>

      <MethodologyNotice
        sourceKeys={["csnFribelopp", "csnRanta"]}
        methodologyNote="Beräkningen utgår från CSN:s officiella fribeloppstabeller för 2026 (bl.a. 114 676 kr för 20 veckors heltidsstudier), veckobelopp vid 100 %, 75 % och 50 % studietakt samt 61 % nedsättning på överskjutande bruttoinkomst per kalenderhalvår."
      />
    </div>
  );
}
