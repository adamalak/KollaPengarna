import type { Metadata } from "next";
import Link from "next/link";
import { CompoundIskCalculator } from "@/components/calculators/CompoundIskCalculator";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { MethodologyNotice } from "@/components/MethodologyNotice";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebAppJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = buildPageMetadata({
  title: "Ränta på ränta-kalkylator 2026 med ISK-skatt (300 000 kr skattefritt)",
  description:
    "Räkna ut ränta på ränta på ditt månadssparande 2026 inklusive den nya skattefria grundnivån på 300 000 kr på ISK och 1,065 % schablonskatt däröver.",
  path: "/ranta-pa-ranta",
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Hur fungerar ISK-skatten 2026?",
    answer:
      "Från och med 2026 är de första 300 000 kr på ditt totala sparande i ISK och kapitalförsäkring helt skattefria. På belopp över 300 000 kr är schablonräntan 3,55 % för 2026, vilket efter 30 % skatt ger en effektiv årlig skatt på 1,065 %.",
  },
  {
    question: "Hur hög avkastning är rimlig att räkna med?",
    answer:
      "Historiskt har breda aktieindexfonder avkastat omkring 7–9 % per år i genomsnitt före inflation och avgifter, men enskilda år kan svänga kraftigt uppåt eller nedåt.",
  },
  {
    question: "Vad betyder 4 %-regeln i resultatet?",
    answer:
      "4 %-regeln är en tumregel som säger att du långsiktigt kan ta ut ungefär 4 % av ditt sparade kapital per år (delat på 12 för månadssiffra) utan att pengarna tar slut i första taget.",
  },
];

export default function RantaPaRantaPage() {
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Hem", path: "/" },
      { name: `Ränta på ränta & ISK ${SITE_CONFIG.year}`, path: "/ranta-pa-ranta" },
    ]),
    buildWebAppJsonLd({
      name: `Ränta på ränta-kalkylator med ISK-skatt ${SITE_CONFIG.year}`,
      description:
        "Simulera månadssparande med 2026 års skattefria ISK-gräns på 300 000 kr och 1,065 % schablonskatt.",
      path: "/ranta-pa-ranta",
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
        <span className="text-zinc-900">Ränta på ränta &amp; ISK {SITE_CONFIG.year}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Ränta på ränta &amp; ISK-skatt {SITE_CONFIG.year}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Se hur ditt månadssparande växer över tid med {SITE_CONFIG.year} års ISK-regler – där de
          första 300 000 kronorna är helt skattefria.
        </p>
      </header>

      <CompoundIskCalculator />

      <FaqSection title="Vanliga frågor om ränta på ränta & ISK 2026" items={FAQ_ITEMS} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#DDD9CE] bg-white p-5">
        <p className="text-sm text-stone-600">
          Hur mycket kan du spara varje månad efter skatt och pendlingskostnader?
        </p>
        <Link
          href="/verklig-timlon"
          className="text-sm font-semibold text-[#0B4F3F] hover:underline"
        >
          Räkna ut din nettolön i din kommun &rarr;
        </Link>
      </div>

      <MethodologyNotice
        sourceKeys={[
          "skatteverketIsk",
          "riksgaldenStatslaneranta",
          "regeringenIsk",
          "riksdagenBetankandeIsk",
        ]}
        methodologyNote="ISK-skatten 2026 beräknas med skattefri grundnivå på 300 000 kr per person och 1,065 % schablonskatt (30 % skatt på schablonintäkten 3,55 %, baserad på statslåneräntan 2,55 % per 30 november 2025 + 1,00 procentenhet)."
      />
    </div>
  );
}
