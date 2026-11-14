import type { FaqItem } from "@/components/FaqSection";
import {
  calculateSalaryAndCommute,
  MUNICIPALITIES_2026,
  SCB_BENCHMARKS_2026,
  TAX_2026,
  type Municipality2026,
  type ScbRegionBenchmark,
} from "./calculators/salary";
import { formatPercent, formatSEK } from "./format";

export interface RankedMunicipality extends Municipality2026 {
  slug: string;
  taxRankLowestFirst: number; // 1 = lowest tax (Österåker), 290 = highest (Dorotea)
  countyRankLowestFirst: number;
  countyTotalMunicipalities: number;
  taxChangeTotalPct: number;
  taxChangeMunicipalityPct: number;
  taxChangeRegionPct: number;
  typicalMonthlyIncome: number; // SCB 2024 median förvärvsinkomst / 12, avrundad till närmaste 100 kr
  totalWithBurial: number;
  totalWithChurch: number;
  diffFromNationalPct: number;
  diffFromCountyPct: number;
  isSingleTierGotland: boolean;
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

export function roundToNearest100(amount: number): number {
  return Math.round(amount / 100) * 100;
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

const byCountyGroups = new Map<string, Municipality2026[]>();
for (const m of sortedByTaxAsc) {
  const arr = byCountyGroups.get(m.countyCode) ?? [];
  arr.push(m);
  byCountyGroups.set(m.countyCode, arr);
}

const countyRankMap = new Map<string, { rank: number; total: number }>();
for (const [, group] of byCountyGroups) {
  group.forEach((m, idx) => {
    countyRankMap.set(m.name, { rank: idx + 1, total: group.length });
  });
}

export const RANKED_MUNICIPALITIES_2026: ReadonlyArray<RankedMunicipality> = MUNICIPALITIES_2026.map(
  (m) => {
    const countyBenchmark = SCB_BENCHMARKS_2026.counties[m.countyCode];
    const countyRank = countyRankMap.get(m.name) ?? { rank: 1, total: 1 };
    const taxChangeTotalPct = Number((m.municipalTax - m.municipalTax2025).toFixed(2));
    const taxChangeMunicipalityPct = Number(
      (m.municipalityPartTax - m.municipalityPartTax2025).toFixed(2)
    );
    const taxChangeRegionPct = Number((m.regionPartTax - m.regionPartTax2025).toFixed(2));

    return {
      ...m,
      slug: slugifyMunicipality(m.name),
      taxRankLowestFirst: rankMap.get(m.name) ?? 145,
      countyRankLowestFirst: countyRank.rank,
      countyTotalMunicipalities: countyRank.total,
      taxChangeTotalPct,
      taxChangeMunicipalityPct,
      taxChangeRegionPct,
      typicalMonthlyIncome: roundToNearest100(m.medianIncome2024Annual / 12),
      totalWithBurial: Number((m.municipalTax + m.burialFee).toFixed(3)),
      totalWithChurch: Number((m.municipalTax + m.burialFee + m.avgChurchFee).toFixed(3)),
      diffFromNationalPct: Number(
        (m.municipalTax - SCB_BENCHMARKS_2026.national.municipalTax2026).toFixed(2)
      ),
      diffFromCountyPct: Number(
        (m.municipalTax - countyBenchmark.municipalTax2026).toFixed(2)
      ),
      isSingleTierGotland: m.regionPartTax === 0,
    };
  }
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
  isLocalTypical: boolean;
}

function buildRow(m: RankedMunicipality, gross: number): MunicipalitySalaryRow {
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
    isLocalTypical: gross === m.typicalMonthlyIncome,
  };
}

export function getSalaryTableForMunicipality(m: RankedMunicipality): MunicipalitySalaryRow[] {
  const levels = new Set<number>(SAMPLE_SALARIES);
  levels.add(m.typicalMonthlyIncome);
  return [...levels].sort((a, b) => a - b).map((gross) => buildRow(m, gross));
}

function formatOreOrKronor(absPctPoints: number): string {
  const ore = Math.round(absPctPoints * 100);
  if (ore >= 100 && ore % 100 === 0) {
    const kr = ore / 100;
    return `${kr} kr per hundralapp`;
  }
  return `${ore} öre per hundralapp`;
}

function describeTaxChange(m: RankedMunicipality): {
  shortBadge: string;
  driverLabel: string;
  sentence: string;
} {
  const totalDelta = m.taxChangeTotalPct;
  if (Math.abs(totalDelta) < 0.001) {
    return {
      shortBadge: "Oförändrad från 2025",
      driverLabel: "Oförändrad i både kommun och region",
      sentence: `Den totala skattesatsen i ${m.name} är oförändrad jämfört med 2025 (${formatPercent(
        m.municipalTax2025,
        2
      )}).`,
    };
  }

  const direction = totalDelta < 0 ? "sänkt" : "höjd";
  const sign = totalDelta < 0 ? "−" : "+";
  const absDelta = Math.abs(totalDelta);
  const munChanged = Math.abs(m.taxChangeMunicipalityPct) >= 0.001;
  const regChanged = Math.abs(m.taxChangeRegionPct) >= 0.001;

  let driverLabel: string;
  let driverClause: string;

  if (munChanged && regChanged) {
    driverLabel = "Ändrad i både kommun & region";
    const munDir = m.taxChangeMunicipalityPct < 0 ? "sänktes" : "höjdes";
    const regDir = m.taxChangeRegionPct < 0 ? "sänktes" : "höjdes";
    driverClause = `både kommunalskatten (${munDir} med ${formatPercent(
      Math.abs(m.taxChangeMunicipalityPct),
      2
    )}) och regionskatten (${regDir} med ${formatPercent(
      Math.abs(m.taxChangeRegionPct),
      2
    )}) justerades`;
  } else if (munChanged) {
    driverLabel = `Kommunalskatt ${direction}`;
    driverClause = `${m.name} kommun justerade sin kommunala skattesats medan regionskatten låg stilla`;
  } else {
    driverLabel = `Regionskatt ${direction}`;
    driverClause = `förändringen beror helt på regionen som justerade regionskatten medan den kommunala delen var oförändrad`;
  }

  return {
    shortBadge: `${sign}${formatPercent(absDelta, 2).replace(" %", "")} %-enh. vs 2025`,
    driverLabel,
    sentence: `Inför 2026 blev skatten i ${m.name} ${direction} med ${formatPercent(
      absDelta,
      2
    )} (${formatOreOrKronor(absDelta)}) från ${formatPercent(
      m.municipalTax2025,
      2
    )} år 2025 – ${driverClause}.`,
  };
}

function compareLabel(diffPct: number, baselineLabel: string): string {
  if (Math.abs(diffPct) < 0.005) {
    return `exakt i nivå med ${baselineLabel}`;
  }
  return diffPct < 0
    ? `${formatPercent(Math.abs(diffPct), 2)} lägre än ${baselineLabel}`
    : `${formatPercent(Math.abs(diffPct), 2)} högre än ${baselineLabel}`;
}

export interface MunicipalityInsights {
  county: ScbRegionBenchmark;
  national: ScbRegionBenchmark;
  comparisonHeadline: string;
  editorialParagraph: string;
  editorialSections: {
    taxStructure: string;
    localIncome: string;
    feesAndThreshold: string;
  };
  taxChange: {
    shortBadge: string;
    driverLabel: string;
    sentence: string;
  };
  typicalSalary: {
    annualMedian: number;
    annualMean: number;
    monthlyGrossRounded: number;
    netMonthlyNoChurch: number;
    monthlyTaxNoChurch: number;
    effectiveTaxPercent: number;
    netMonthlyWithChurch: number;
    annualDiffVsNationalTaxAtTypical: number;
    incomeDiffVsNationalPct: number;
  };
  net35k: number;
  annualDiffVsNational35k: number;
  faqs: FaqItem[];
  sameCountyPeers: RankedMunicipality[];
  nearbyPeers: RankedMunicipality[];
}

export function getMunicipalityInsights(m: RankedMunicipality): MunicipalityInsights {
  const county = SCB_BENCHMARKS_2026.counties[m.countyCode];
  const national = SCB_BENCHMARKS_2026.national;
  const taxChange = describeTaxChange(m);

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

  const annualDiffVsNational35k = (local35k.netMonthlySalary - national35k.netMonthlySalary) * 12;

  const localTypicalRow = buildRow(m, m.typicalMonthlyIncome);
  const nationalAtTypical = calculateSalaryAndCommute({
    grossMonthlySalary: m.typicalMonthlyIncome,
    municipalTaxRate: TAX_2026.defaultMunicipalRate,
    burialFeeRate: TAX_2026.defaultBurialFee,
    includeChurchFee: false,
    contractHoursPerWeek: 40,
    commuteCostMonthly: 0,
    commuteMinutesPerDay: 0,
    officeDaysPerWeek: 5,
  });

  const annualDiffVsNationalTaxAtTypical =
    (localTypicalRow.netMonthlyNoChurch - nationalAtTypical.netMonthlySalary) * 12;

  const incomeDiffVsNationalPct = Number(
    (
      ((m.medianIncome2024Annual - national.medianIncome2024Annual) /
        national.medianIncome2024Annual) *
      100
    ).toFixed(1)
  );

  // Build comparison headline
  const countyPositionClause = m.isSingleTierGotland
    ? "Gotlands län omfattar enbart Gotlands kommun"
    : `plats ${m.countyRankLowestFirst} av ${m.countyTotalMunicipalities} i ${m.countyName}`;

  const tierDescription =
    m.taxRankLowestFirst <= 75
      ? "tillhör den fjärdedel kommuner i landet som har lägst skatt"
      : m.taxRankLowestFirst >= 215
      ? "ligger i den övre fjärdedelen av Sveriges kommunala skattesatser"
      : "ligger nära mitten bland Sveriges kommunala skattesatser";

  const comparisonHeadline = `${m.name} ${tierDescription} år 2026 (plats ${m.taxRankLowestFirst} av 290 i Sverige, ${countyPositionClause}).`;

  // Paragraph 1: Tax composition, 2025->2026 shift & county comparison
  const splitClause = m.isSingleTierGotland
    ? `Eftersom Region Gotland ansvarar för både kommunala och regionala uppgifter redovisas hela skattesatsen om ${formatPercent(
        m.municipalityPartTax,
        2
      )} som primärkommunal skatt (0,00 % separat regionskatt).`
    : `Av den totala kommunala skattesatsen på ${formatPercent(
        m.municipalTax,
        2
      )} går ${formatPercent(
        m.municipalityPartTax,
        2
      )} till ${m.name} kommun och ${formatPercent(m.regionPartTax, 2)} till regionen.`;

  const countyCompareSentence = m.isSingleTierGotland
    ? `Skattesatsen är ${compareLabel(
        m.diffFromNationalPct,
        `riksgenomsnittet på ${formatPercent(national.municipalTax2026, 2)}`
      )}.`
    : `Jämfört med ${m.countyName} som helhet (${formatPercent(
        county.municipalTax2026,
        2
      )} i skattesats) ligger ${m.name} ${compareLabel(
        m.diffFromCountyPct,
        "länssnittet"
      )}, och ${compareLabel(
        m.diffFromNationalPct,
        `rikssnittet på ${formatPercent(national.municipalTax2026, 2)}`
      )}.`;

  const taxStructure = `${splitClause} ${taxChange.sentence} ${countyCompareSentence}`;

  // Paragraph 2: Local SCB 2024 earned income (20-64 år) & local net-salary calculation
  const incomeComparisonClause =
    Math.abs(incomeDiffVsNationalPct) < 1
      ? `nära riksmedianen på ${formatSEK(national.medianIncome2024Annual)}/år`
      : incomeDiffVsNationalPct > 0
      ? `${formatPercent(Math.abs(incomeDiffVsNationalPct), 1)} över riksmedianen (${formatSEK(
          national.medianIncome2024Annual
        )}/år)`
      : `${formatPercent(Math.abs(incomeDiffVsNationalPct), 1)} under riksmedianen (${formatSEK(
          national.medianIncome2024Annual
        )}/år)`;

  const localTaxEffectClause =
    annualDiffVsNationalTaxAtTypical === 0
      ? `Det ger i praktiken samma nettolön som i en genomsnittlig svensk kommun (32,38 %).`
      : annualDiffVsNationalTaxAtTypical > 0
      ? `Tack vare kommunens skattenivå behåller invånaren på den nivån cirka ${formatSEK(
          annualDiffVsNationalTaxAtTypical
        )} mer efter skatt per år än i en genomsnittskommun med 32,38 % skatt.`
      : `Det innebär att samma månadsinkomst beskattas cirka ${formatSEK(
          Math.abs(annualDiffVsNationalTaxAtTypical)
        )} hårdare per år än i en genomsnittskommun med 32,38 % skatt.`;

  const localIncome = `Enligt SCB:s senaste inkomststatistik (2024) är den typiska sammanräknade förvärvsinkomsten bland boende i åldern 20–64 år i ${m.name} ${formatSEK(
    m.medianIncome2024Annual
  )} per år i median (medelinkomst ${formatSEK(
    m.meanIncome2024Annual
  )}/år) – ${incomeComparisonClause}. Utslaget per månad motsvarar medianen cirka ${formatSEK(
    m.typicalMonthlyIncome
  )} (avrundat till närmaste 100-tal kr), vilket efter 2026 års skatt ger ungefär ${formatSEK(
    localTypicalRow.netMonthlyNoChurch
  )} kvar efter skatt varje månad (effektiv skatt ${formatPercent(
    localTypicalRow.effectiveTaxPercent,
    1
  )}, ej medlem i Svenska kyrkan). ${localTaxEffectClause} Observera att SCB:s mått omfattar samtliga förvärvsarbetande och inkomsttagare i åldersgruppen 20–64 år oavsett sysselsättningsgrad – det är alltså inte en ren heltidslön.`;

  // Paragraph 3: Burial fee, church fee & state tax breakpoint
  const burialNote =
    m.name === "Stockholm"
      ? `Stockholms stad sköter sin egen begravningsverksamhet och har därför landets lägsta begravningsavgift på ${formatPercent(
          m.burialFee,
          3
        )} (jämfört med ${formatPercent(TAX_2026.defaultBurialFee, 3)} i större delen av övriga landet).`
      : m.name === "Tranås"
      ? `Tranås kommun sköter begravningsverksamheten i egen regi med en avgift på ${formatPercent(
          m.burialFee,
          3
        )} (mot ${formatPercent(TAX_2026.defaultBurialFee, 3)} i övriga kommuner med Svenska kyrkan som huvudman).`
      : `Alla folkbokförda i ${m.name} betalar den nationellt enhetliga begravningsavgiften på ${formatPercent(
          m.burialFee,
          3
        )}.`;

  const deductionsAndFeesText = `${burialNote} För den som är medlem i Svenska kyrkan tillkommer församlingens kyrkoavgift, som i ${m.name} i genomsnitt är ${formatPercent(
    m.avgChurchFee,
    2
  )} (vilket vid ${formatSEK(m.typicalMonthlyIncome)}/mån motsvarar cirka ${formatSEK(
    localTypicalRow.netMonthlyNoChurch - localTypicalRow.netMonthlyWithChurch
  )} extra i månaden). Statlig inkomstskatt på 20 % börjar först när den beskattningsbara förvärvsinkomsten överstiger 643 000 kr/år – motsvarande en månadslön på drygt 55 000 kr före grundavdrag för personer under 66 år.`;

  const net30k = buildRow(m, 30000).netMonthlyNoChurch;
  const net40k = buildRow(m, 40000).netMonthlyNoChurch;

  const faqs: FaqItem[] = [
    {
      question: `Vad är kommunalskatten i ${m.name} 2026 och hur har den ändrats från 2025?`,
      answer: m.isSingleTierGotland
        ? `Den totala skattesatsen i ${m.name} är ${formatPercent(
            m.municipalTax,
            2
          )} för 2026 (hela beloppet utgör kommunalskatt eftersom Region Gotland sköter regionala uppdrag utan separat regionskatt). ${taxChange.sentence} Det ger plats ${m.taxRankLowestFirst} av 290 kommuner i Sverige.`
        : `Den totala kommunala skattesatsen i ${m.name} år 2026 är ${formatPercent(
            m.municipalTax,
            2
          )}, fördelat på ${formatPercent(
            m.municipalityPartTax,
            2
          )} till kommunen och ${formatPercent(
            m.regionPartTax,
            2
          )} till regionen. ${taxChange.sentence} Det placerar kommunen på plats ${m.taxRankLowestFirst} av 290 i Sverige och plats ${m.countyRankLowestFirst} av ${m.countyTotalMunicipalities} i ${m.countyName}.`,
    },
    {
      question: `Vad är den typiska inkomsten i ${m.name} och vad blir kvar efter skatt?`,
      answer: `Enligt SCB (2024, 20–64 år) är medianen för sammanräknad förvärvsinkomst i ${m.name} ${formatSEK(
        m.medianIncome2024Annual
      )} per år – motsvarande cirka ${formatSEK(
        m.typicalMonthlyIncome
      )}/mån (avrundat till närmaste 100 kr, och inkluderar samtliga inkomsttagare i åldersgruppen oavsett sysselsättningsgrad). Med 2026 års skatteregler ger ${formatSEK(
        m.typicalMonthlyIncome
      )} före skatt ungefär ${formatSEK(
        localTypicalRow.netMonthlyNoChurch
      )} i nettolön per månad utan kyrkoavgift.`,
    },
    {
      question: `Hur mycket får man efter skatt på 30 000, 35 000 och 40 000 kr i ${m.name}?`,
      answer: `För en person under 66 år (ej medlem i Svenska kyrkan) ger 30 000 kr i månadslön cirka ${formatSEK(
        net30k
      )} efter skatt i ${m.name} år 2026. En bruttolön på 35 000 kr ger cirka ${formatSEK(
        local35k.netMonthlySalary
      )} och 40 000 kr ger cirka ${formatSEK(net40k)} per månad efter jobbskatteavdrag och grundavdrag.`,
    },
    {
      question: `Tillkommer kyrkoavgift och begravningsavgift i ${m.name}?`,
      answer: `Alla folkbokförda i ${m.name} betalar begravningsavgift på ${formatPercent(
        m.burialFee,
        3
      )}. Medlemmar i Svenska kyrkan betalar dessutom församlingsavgift, som i ${m.name} i snitt ligger på ${formatPercent(
        m.avgChurchFee,
        2
      )} beroende på församling.`,
    },
  ];

  // County peers sorted by tax proximity within the same county
  const sameCountyAll = SORTED_LOWEST_TAX_2026.filter(
    (peer) => peer.countyCode === m.countyCode && peer.slug !== m.slug
  );
  const sameCountyPeers = [...sameCountyAll]
    .sort((a, b) => {
      const diffA = Math.abs(a.municipalTax - m.municipalTax);
      const diffB = Math.abs(b.municipalTax - m.municipalTax);
      return diffA !== diffB ? diffA - diffB : a.name.localeCompare(b.name, "sv");
    })
    .slice(0, 6);

  // National peers adjacent in total tax ranking
  const idx = Math.max(0, m.taxRankLowestFirst - 1);
  const nearbyPeers = [
    SORTED_LOWEST_TAX_2026[idx - 2],
    SORTED_LOWEST_TAX_2026[idx - 1],
    SORTED_LOWEST_TAX_2026[idx + 1],
    SORTED_LOWEST_TAX_2026[idx + 2],
  ].filter((x): x is RankedMunicipality => Boolean(x && x.slug !== m.slug));

  return {
    county,
    national,
    comparisonHeadline,
    editorialParagraph: taxStructure,
    editorialSections: {
      taxStructure,
      localIncome,
      feesAndThreshold: deductionsAndFeesText,
    },
    taxChange,
    typicalSalary: {
      annualMedian: m.medianIncome2024Annual,
      annualMean: m.meanIncome2024Annual,
      monthlyGrossRounded: m.typicalMonthlyIncome,
      netMonthlyNoChurch: localTypicalRow.netMonthlyNoChurch,
      monthlyTaxNoChurch: localTypicalRow.monthlyTaxNoChurch,
      effectiveTaxPercent: localTypicalRow.effectiveTaxPercent,
      netMonthlyWithChurch: localTypicalRow.netMonthlyWithChurch,
      annualDiffVsNationalTaxAtTypical,
      incomeDiffVsNationalPct,
    },
    net35k: local35k.netMonthlySalary,
    annualDiffVsNational35k,
    faqs,
    sameCountyPeers,
    nearbyPeers,
  };
}
