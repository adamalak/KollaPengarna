import type { Metadata } from "next";
import Link from "next/link";
import { InstallmentCalculator } from "@/components/calculators/InstallmentCalculator";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { MethodologyNotice } from "@/components/MethodologyNotice";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebAppJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Delbetalningsfällan – Räkna ut effektiv ränta & totalkostnad",
  description:
    "Vad kostar ”räntefri” delbetalning eller Klarna-konto egentligen? Räkna ut effektiv årsränta, dolda aviavgifter och hur många extra timmar du får jobba.",
  path: "/delbetalning",
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Hur kan en ”räntefri” delbetalning ändå ha hög effektiv ränta?",
    answer:
      "Även om den nominella räntan är 0 % lägger många butiker och kreditbolag på en uppläggningsavgift (t.ex. 295–495 kr) och en månatlig aviavgift (t.ex. 29–69 kr/mån). På mindre köp under 12 månader motsvarar dessa avgifter ofta 15–35 % i effektiv årsränta.",
  },
  {
    question: "Vad är skillnaden mellan nominell ränta och effektiv ränta?",
    answer:
      "Nominell ränta är bara själva räntesatsen på lånet. Effektiv ränta inkluderar både räntan och alla obligatoriska avgifter omräknat till en årlig procentsats enligt konsumentkreditlagen.",
  },
  {
    question: "Varför visas kostnaden i extra arbetstimmar?",
    answer:
      "Det är lätt att bli fartblind för ”bara 45 kr i månaden”. Genom att översätta den totala extra kostnaden till timmar du måste arbeta efter skatt blir det tydligt om uppdelningen verkligen är värd pengarna.",
  },
];

export default function DelbetalningPage() {
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Hem", path: "/" },
      { name: "Delbetalning & effektiv ränta", path: "/delbetalning" },
    ]),
    buildWebAppJsonLd({
      name: "Delbetalningsfällan – Effektiv ränta-kalkylator",
      description:
        "Räkna ut effektiv årsränta (APR), aviavgifter och extra arbetstid på delbetalningar.",
      path: "/delbetalning",
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
        <span className="text-zinc-900">Delbetalning &amp; effektiv ränta</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Vad kostar delbetalningen egentligen?
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Avslöja den verkliga prislappen bakom ”räntefritt”, aviavgifter och delbetalning. Se både
          effektiv årsränta och hur många arbetstimmar som går till avgifter.
        </p>
      </header>

      <InstallmentCalculator />

      <section className="mt-12 rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-8">
        <h2 className="font-editorial text-xl font-semibold tracking-tight text-zinc-900">
          Tre saker att kontrollera före du väljer delbetalning
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">1. Aviavgiften äter små köp</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              45 kr i aviavgift per månad blir 540 kr på ett år. Köper du en vara för 3 000 kr blir
              bara aviavgiften ett påslag på 18 %.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">2. Villkoren efter kampanjen</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Missar du en betalning eller betalar långsammare än kampanjtiden slår många
              kontokrediter om till 18–24 % ränta på hela skulden.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">3. Många bäckar små</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Tre ”ofarliga” delbetalningar på 300 kr/mån blir snabbt 900 kr i fasta utgifter som
              minskar din marginal varje månad.
            </p>
          </div>
        </div>
      </section>

      <FaqSection title="Vanliga frågor om delbetalning & effektiv ränta" items={FAQ_ITEMS} />

      <MethodologyNotice
        sourceKeys={["konsumentverketKredit"]}
        methodologyNote="Effektiv årsränta (APR) beräknas enligt konsumentkreditlagens och EU-direktivets nuvärdesekvation, där både nominell ränta, uppläggningsavgift och månatliga aviavgifter räknas in över kreditperioden."
      />
    </div>
  );
}
