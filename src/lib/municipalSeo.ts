import type { FaqItem } from "@/components/FaqSection";
import {
  calculateSalaryAndCommute,
  MUNICIPALITIES_2026,
  TAX_2026,
  type Municipality2026,
} from "./calculators/salary";
import { formatPercent, formatSEK } from "./format";

export interface RankedMunicipality extends Municipality2026 {
  slug: string;
  taxRankLowestFirst: number; // 1 = lowest tax (Österåker), 290 = highest (Dorotea)
  totalWithBurial: number;
  totalWithChurch: number;
  diffFromNationalPct: number;
}

export function slugifyMunicipality(name: string): string {
  // Disambiguate Habo vs Håbo cleanly for SEO URLs
  if (name.trim().toLowerCase() === "håbo") {
    return "habo-kommun";
  }
  return name
    .trim()
    .toLowerCase()
    .replace(/å|ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/é|è/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sortedByTaxAsc = [...MUNICIPALITIES_2026].sort((a, b) =>
  a.municipalTax !== b.municipalTax
    ? a.municipalTax - b.municipalTax
    : a.name.localeCompare(b.name, "sv")
);

const rankMap = new Map<string, number>();
sortedByTaxAsc.forEach((m, idx) => {
  rankMap.set(m.name, idx + 1);
});

export const RANKED_MUNICIPALITIES_2026: ReadonlyArray<RankedMunicipality> = MUNICIPALITIES_2026.map(
  (m) => ({
    ...m,
    slug: slugifyMunicipality(m.name),
    taxRankLowestFirst: rankMap.get(m.name) ?? 145,
    totalWithBurial: Number((m.municipalTax + m.burialFee).toFixed(3)),
    totalWithChurch: Number((m.municipalTax + m.burialFee + m.avgChurchFee).toFixed(3)),
    diffFromNationalPct: Number((m.municipalTax - TAX_2026.defaultMunicipalRate).toFixed(2)),
  })
);

export const SORTED_LOWEST_TAX_2026: ReadonlyArray<RankedMunicipality> = [
  ...RANKED_MUNICIPALITIES_2026,
].sort((a, b) => a.taxRankLowestFirst - b.taxRankLowestFirst);

export function getMunicipalityBySlug(slug: string): RankedMunicipality | undefined {
  return RANKED_MUNICIPALITIES_2026.find((m) => m.slug === slug);
}

export const SAMPLE_SALARIES = [25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000] as const;

export interface MunicipalitySalaryRow {
  grossMonthly: number;
  netMonthlyNoChurch: number;
  monthlyTaxNoChurch: number;
  effectiveTaxPercent: number;
  netMonthlyWithChurch: number;
  diffPerYearVsNational35k?: number;
}

export function getSalaryTableForMunicipality(m: RankedMunicipality): MunicipalitySalaryRow[] {
  return SAMPLE_SALARIES.map((gross) => {
    const noChurch = calculateSalaryAndCommute({
      grossMonthlySalary: gross,
      municipalTaxRate: m.municipalTax,
      burialFeeRate: m.burialFee,
      churchFeeRate: m.avgChurchFee,
      includeChurchFee: false,
      contractHoursPerWeek: 40,
      commuteCostMonthly: 0,
      commuteMinutesPerDay: 0,
      officeDaysPerWeek: 5,
    });
    const withChurch = calculateSalaryAndCommute({
      grossMonthlySalary: gross,
      municipalTaxRate: m.municipalTax,
      burialFeeRate: m.burialFee,
      churchFeeRate: m.avgChurchFee,
      includeChurchFee: true,
      contractHoursPerWeek: 40,
      commuteCostMonthly: 0,
      commuteMinutesPerDay: 0,
      officeDaysPerWeek: 5,
    });
    return {
      grossMonthly: gross,
      netMonthlyNoChurch: noChurch.netMonthlySalary,
      monthlyTaxNoChurch: noChurch.estimatedMonthlyTax,
      effectiveTaxPercent: noChurch.effectiveTaxPercent,
      netMonthlyWithChurch: withChurch.netMonthlySalary,
    };
  });
}

/**
 * Build genuinely unique, data-anchored editorial summary and FAQs for each municipality
 * so pages deliver distinct hyper-local value (avoiding thin variable-swap boilerplate).
 */
export function getMunicipalityInsights(m: RankedMunicipality): {
  comparisonHeadline: string;
  editorialParagraph: string;
  net35k: number;
  annualDiffVsNational35k: number;
  faqs: FaqItem[];
  nearbyPeers: RankedMunicipality[];
} {
  const local35k = calculateSalaryAndCommute({
    grossMonthlySalary: 35000,
    municipalTaxRate: m.municipalTax,
    burialFeeRate: m.burialFee,
    churchFeeRate: m.avgChurchFee,
    includeChurchFee: false,
    contractHoursPerWeek: 40,
    commuteCostMonthly: 0,
    commuteMinutesPerDay: 0,
    officeDaysPerWeek: 5,
  });

  const national35k = calculateSalaryAndCommute({
    grossMonthlySalary: 35000,
    municipalTaxRate: TAX_2026.defaultMunicipalRate,
    burialFeeRate: TAX_2026.defaultBurialFee,
    includeChurchFee: false,
    contractHoursPerWeek: 40,
    commuteCostMonthly: 0,
    commuteMinutesPerDay: 0,
    officeDaysPerWeek: 5,
  });

  const monthlyDiff35k = local35k.netMonthlySalary - national35k.netMonthlySalary;
  const annualDiffVsNational35k = monthlyDiff35k * 12;

  const isLow = m.taxRankLowestFirst <= 75;
  const isHigh = m.taxRankLowestFirst >= 215;

  let comparisonHeadline: string;
  let editorialParagraph: string;

  if (isLow) {
    comparisonHeadline = `${m.name} tillhör den fjärdedel kommuner i Sverige som har lägst skatt 2026 (plats ${m.taxRankLowestFirst} av 290).`;
    editorialParagraph = `Med en kommunal- och regionskatt på ${formatPercent(
      m.municipalTax,
      2
    )} ligger ${m.name} ${formatPercent(
      Math.abs(m.diffFromNationalPct),
      2
    )} under riksgenomsnittet på 32,38 %. Vid en månadslön på 35 000 kr före skatt ger det cirka ${formatSEK(
      Math.abs(annualDiffVsNational35k)
    )} mer kvar i plånboken per år jämfört med genomsnittskommunen.`;
  } else if (isHigh) {
    comparisonHeadline = `${m.name} ligger i den övre fjärdedelen av Sveriges skattesatser 2026 (plats ${m.taxRankLowestFirst} av 290).`;
    editorialParagraph = `Den sammanlagda kommun- och regionskatten i ${m.name} är ${formatPercent(
      m.municipalTax,
      2
    )}, vilket är ${formatPercent(
      Math.abs(m.diffFromNationalPct),
      2
    )} högre än riksgenomsnittet (32,38 %). På en bruttolön om 35 000 kr/mån innebär det cirka ${formatSEK(
      Math.abs(annualDiffVsNational35k)
    )} mindre i nettolön per år jämfört med snittet i Sverige.`;
  } else {
    comparisonHeadline = `${m.name} ligger nära det svenska skattesnittet 2026 (plats ${m.taxRankLowestFirst} av 290).`;
    const direction =
      m.diffFromNationalPct < 0
        ? `${formatPercent(Math.abs(m.diffFromNationalPct), 2)} lägre än`
        : m.diffFromNationalPct > 0
        ? `${formatPercent(Math.abs(m.diffFromNationalPct), 2)} högre än`
        : "exakt i nivå med";
    editorialParagraph = `Skattesatsen i ${m.name} uppgår till ${formatPercent(
      m.municipalTax,
      2
    )} före kyrko- och begravningsavgift, vilket är ${direction} riksgenomsnittet på 32,38 %. Vid 35 000 kr i bruttolön blir skillnaden mot rikssnittet ungefär ${formatSEK(
      Math.abs(annualDiffVsNational35k)
    )} per år.`;
  }

  const net30k = calculateSalaryAndCommute({
    grossMonthlySalary: 30000,
    municipalTaxRate: m.municipalTax,
    burialFeeRate: m.burialFee,
    includeChurchFee: false,
    contractHoursPerWeek: 40,
    commuteCostMonthly: 0,
    commuteMinutesPerDay: 0,
    officeDaysPerWeek: 5,
  }).netMonthlySalary;

  const net40k = calculateSalaryAndCommute({
    grossMonthlySalary: 40000,
    municipalTaxRate: m.municipalTax,
    burialFeeRate: m.burialFee,
    includeChurchFee: false,
    contractHoursPerWeek: 40,
    commuteCostMonthly: 0,
    commuteMinutesPerDay: 0,
    officeDaysPerWeek: 5,
  }).netMonthlySalary;

  const faqs: FaqItem[] = [
    {
      question: `Vad är kommunalskatten i ${m.name} år 2026?`,
      answer: `Den totala kommunal- och regionskatten i ${m.name} för 2026 är ${formatPercent(
        m.municipalTax,
        2
      )} (exklusive begravningsavgift på ${formatPercent(
        m.burialFee,
        3
      )} och eventuell kyrkoavgift på i snitt ${formatPercent(
        m.avgChurchFee,
        2
      )}). Det placerar ${m.name} på plats ${m.taxRankLowestFirst} av 290 kommuner räknat från lägst skatt.`,
    },
    {
      question: `Hur mycket får man kvar efter skatt på 30 000, 35 000 och 40 000 kr i ${m.name}?`,
      answer: `Utifrån 2026 års skatteregler (under 66 år, ej medlem i Svenska kyrkan) ger 30 000 kr i bruttolön cirka ${formatSEK(
        net30k
      )} efter skatt i ${m.name}. En lön på 35 000 kr ger cirka ${formatSEK(
        local35k.netMonthlySalary
      )} och 40 000 kr ger cirka ${formatSEK(net40k)} i nettolön per månad.`,
    },
    {
      question: `Tillkommer kyrkoavgift och begravningsavgift i ${m.name}?`,
      answer: `Alla folkbokförda i ${m.name} betalar begravningsavgift på ${formatPercent(
        m.burialFee,
        3
      )}. Om du är medlem i Svenska kyrkan tillkommer dessutom en församlingsavgift som i ${m.name} ligger runt ${formatPercent(
        m.avgChurchFee,
        2
      )} i genomsnitt.`,
    },
  ];

  // Pick 4 nearby-ranked municipalities for internal hub-and-spoke linking
  const idx = Math.max(0, m.taxRankLowestFirst - 1);
  const candidates = [
    SORTED_LOWEST_TAX_2026[idx - 2],
    SORTED_LOWEST_TAX_2026[idx - 1],
    SORTED_LOWEST_TAX_2026[idx + 1],
    SORTED_LOWEST_TAX_2026[idx + 2],
  ].filter((x): x is RankedMunicipality => Boolean(x && x.slug !== m.slug));

  return {
    comparisonHeadline,
    editorialParagraph,
    net35k: local35k.netMonthlySalary,
    annualDiffVsNational35k,
    faqs,
    nearbyPeers: candidates,
  };
}
