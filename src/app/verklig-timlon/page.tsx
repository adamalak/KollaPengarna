import type { Metadata } from "next";
import Link from "next/link";
import { SalaryCalculator } from "@/components/calculators/SalaryCalculator";
import { FaqSection, type FaqItem } from "@/components/FaqSection";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Lön efter skatt 2026 (alla 290 kommuner) & verklig timlön med pendling",
  description:
    "Räkna ut din lön efter skatt 2026 i valfri svensk kommun (alla 290 kommuner) och se vad din verkliga timlön blir efter resekostnad och pendlingstid.",
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Hur beräknas lönen efter skatt för 2026?",
    answer:
      "Kalkylatorn använder 2026 års officiella kommunal- och regionskatt samt begravningsavgift för alla 290 kommuner från Skatteverket, 2026 års prisbasbelopp (59 200 kr), grundavdrag, det förstärkta jobbskatteavdraget och statlig inkomstskatt (20 % över 643 000 kr beskattningsbar inkomst).",
  },
  {
    question: "Varför räknas pendlingstid med i den verkliga timlönen?",
    answer:
      "Ett jobb som betalar 3 000 kr mer i månaden men kräver 90 minuters extra pendling per dag och ett dyrare pendlingskort kan ge lägre betalning per nedlagd timme än ett jobb närmare hemmet.",
  },
  {
    question: "Kan jag göra reseavdrag på deklarationen?",
    answer:
      "Ja, om dina årliga resekostnader överstiger 11 000 kr och du uppfyller Skatteverkets avstånds- och tidsvinstkrav (t.ex. minst 2 timmars tidsvinst per dag för bil jämfört med kollektivtrafik). Kontrollera alltid aktuella regler på Skatteverket.se.",
  },
];

export default function VerkligTimlonPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Brödsmulor" className="mb-4 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-[#0B4F3F] hover:underline">
          Hem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Lön efter skatt &amp; pendling {SITE_CONFIG.year}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Lön efter skatt &amp; verklig timlön {SITE_CONFIG.year}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-600 sm:text-base">
          Sök fram din kommun bland alla 290 svenska kommuner och se vad som faktiskt blir kvar
          efter skatt, resekostnader och obetald pendlingstid.
        </p>
      </header>

      <SalaryCalculator />

      <FaqSection title="Vanliga frågor om lön, skatt & pendling" items={FAQ_ITEMS} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#DDD9CE] bg-white p-5">
        <p className="text-sm text-stone-600">
          Pluggar du samtidigt som du jobbar? Kolla så du inte passerar CSN:s gräns.
        </p>
        <Link
          href="/csn-fribelopp"
          className="text-sm font-semibold text-[#0B4F3F] hover:underline"
        >
          Kolla CSN Fribelopp {SITE_CONFIG.year} &rarr;
        </Link>
      </div>
    </div>
  );
}
