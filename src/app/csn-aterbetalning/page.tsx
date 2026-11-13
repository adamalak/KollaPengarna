import type { Metadata } from "next";
import Link from "next/link";
import { CsnRepaymentCalculator } from "@/components/calculators/CsnRepaymentCalculator";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebAppJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = buildPageMetadata({
  title: "CSN Återbetalning 2026 – Räkna ut månadskostnad & ränta (2,135 %)",
  description:
    "Räkna ut vad ditt CSN-studielån kostar i månaden 2026 med räntan 2,135 %. Se total räntekostnad, slutår och vad extraamortering sparar.",
  path: "/csn-aterbetalning",
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Vad är CSN-räntan år 2026?",
    answer:
      "För studielån tagna från och med 1989 är CSN:s ränta 2,135 % under 2026. Räntan är redan subventionerad med 30 %, så du får inget extra ränteavdrag i deklarationen för CSN-lån.",
  },
  {
    question: "Varför ökar CSN-betalningen varje år?",
    answer:
      "För lån utbetalda från och med juli 2001 använder CSN en uppräknad annuitetsmodell där årsbeloppet normalt räknas upp med cirka 2 % per år för att följa den allmänna löneutvecklingen.",
  },
  {
    question: "Lönar det sig att betala av CSN snabbare?",
    answer:
      "Eftersom CSN-lånet har mycket låg ränta (2,135 % år 2026) jämfört med bolån, privatlån och förväntad långsiktig börsavkastning väljer många att betala av i normal takt och istället spara eller amortera dyrare lån först.",
  },
];

export default function CsnAterbetalningPage() {
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Hem", path: "/" },
      { name: `CSN Återbetalning ${SITE_CONFIG.year}`, path: "/csn-aterbetalning" },
    ]),
    buildWebAppJsonLd({
      name: `CSN Återbetalning-kalkylator ${SITE_CONFIG.year}`,
      description:
        "Beräkna månadskostnad, räntekostnad och slutår för CSN-lån med 2026 års ränta 2,135 %.",
      path: "/csn-aterbetalning",
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
        <span className="text-zinc-900">CSN Återbetalning {SITE_CONFIG.year}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          CSN Återbetalning &amp; månadskostnad {SITE_CONFIG.year}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Räkna ut vad ditt studielån kostar per månad med {SITE_CONFIG.year} års ränta (2,135 %),
          hur länge du betalar och vad en extraamortering gör.
        </p>
      </header>

      <CsnRepaymentCalculator />

      <FaqSection title="Vanliga frågor om att betala tillbaka CSN" items={FAQ_ITEMS} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#DDD9CE] bg-white p-5">
        <p className="text-sm text-stone-600">
          Funderar du på att spara i fonder på ISK istället för att extraamortera CSN?
        </p>
        <Link
          href="/ranta-pa-ranta"
          className="text-sm font-semibold text-[#0B4F3F] hover:underline"
        >
          Simulera Ränta på ränta &amp; ISK 2026 &rarr;
        </Link>
      </div>
    </div>
  );
}
