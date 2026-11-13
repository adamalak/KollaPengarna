import { clampNumber } from "../format";
import municipalitiesRaw from "../data/municipalities2026.json";

export interface Municipality2026 {
  name: string;
  municipalTax: number;
  burialFee: number;
  avgChurchFee: number;
}

export const MUNICIPALITIES_2026: ReadonlyArray<Municipality2026> =
  municipalitiesRaw as Municipality2026[];

/**
 * 2026 Swedish tax constants.
 * Sources: Skatteverket & SCB (2026).
 */
export const TAX_2026 = {
  prisbasbelopp: 59_200,
  defaultMunicipalRate: 32.38,
  defaultBurialFee: 0.292,
  defaultChurchFee: 1.0,
  stateTaxThresholdTaxable: 643_000, // Skiktgräns beskattningsbar förvärvsinkomst
  stateTaxRate: 0.2,
  weeksPerMonth: 52 / 12,
} as const;

export interface SalaryCommuteInput {
  grossMonthlySalary: number;
  municipalTaxRate: number; // kommunal + regional skattesats (%)
  burialFeeRate?: number; // begravningsavgift (%)
  churchFeeRate?: number; // kyrkoavgift (%)
  includeChurchFee: boolean;
  contractHoursPerWeek: number; // e.g. 40
  commuteCostMonthly: number; // e.g. 1020 kr for SL or 2500 kr for car
  commuteMinutesPerDay: number; // round-trip per office day
  officeDaysPerWeek: number; // 0..7
}

export interface SalaryCommuteResult {
  grossMonthlySalary: number;
  estimatedAnnualTax: number;
  estimatedMonthlyTax: number;
  effectiveTaxPercent: number;
  netMonthlySalary: number;
  contractMonthlyHours: number;
  nominalNetHourlyWage: number;
  commuteCostMonthly: number;
  monthlyCommuteHours: number;
  netAfterCommute: number;
  realHourlyWage: number;
  hourlyWageLoss: number;
  hourlyWageLossPercent: number;
  annualCommuteHours: number;
  annualCommuteCost: number;
  paysStateTax: boolean;
}

export function findMunicipality2026(name: string): Municipality2026 | undefined {
  const normalized = name.trim().toLowerCase();
  return MUNICIPALITIES_2026.find((m) => m.name.toLowerCase() === normalized);
}

/**
 * Estimate Swedish grundavdrag (2026, under 66 år) based on prisbasbelopp (PBB = 59 200 kr).
 */
export function estimateGrundavdrag2026(annualGross: number): number {
  if (annualGross <= 0) return 0;
  const pbb = TAX_2026.prisbasbelopp;

  let raw: number;
  if (annualGross <= 0.99 * pbb) {
    raw = 0.423 * pbb;
  } else if (annualGross <= 2.72 * pbb) {
    raw = 0.423 * pbb + 0.2 * (annualGross - 0.99 * pbb);
  } else if (annualGross <= 3.11 * pbb) {
    raw = 0.77 * pbb;
  } else if (annualGross <= 7.88 * pbb) {
    raw = 0.77 * pbb - 0.1 * (annualGross - 3.11 * pbb);
  } else {
    raw = 0.293 * pbb;
  }

  return Math.min(annualGross, Math.round(raw / 100) * 100);
}

/**
 * Estimate Swedish jobbskatteavdrag (2026, under 66 år) using statutory PBB brackets.
 */
export function estimateJobbskatteavdrag2026(
  annualGross: number,
  grundavdrag: number,
  municipalRateDecimal: number
): number {
  if (annualGross <= grundavdrag) return 0;
  const pbb = TAX_2026.prisbasbelopp;

  let baseAmount: number;
  if (annualGross <= 0.91 * pbb) {
    baseAmount = annualGross - grundavdrag;
  } else if (annualGross <= 3.24 * pbb) {
    baseAmount = 0.91 * pbb + 0.3874 * (annualGross - 0.91 * pbb) - grundavdrag;
  } else if (annualGross <= 8.08 * pbb) {
    baseAmount = 1.813 * pbb + 0.251 * (annualGross - 3.24 * pbb) - grundavdrag;
  } else {
    baseAmount = 3.028 * pbb - grundavdrag;
  }

  return Math.max(0, Math.round(baseAmount * municipalRateDecimal));
}

/**
 * Calculate estimated net salary (2026) and real hourly wage after commuting money and time.
 */
export function calculateSalaryAndCommute(input: SalaryCommuteInput): SalaryCommuteResult {
  const grossMonthlySalary = clampNumber(input.grossMonthlySalary, 0, 1_000_000, 36_000);
  const municipalRatePct = clampNumber(
    input.municipalTaxRate,
    20,
    45,
    TAX_2026.defaultMunicipalRate
  );
  const burialPct = clampNumber(
    input.burialFeeRate ?? TAX_2026.defaultBurialFee,
    0,
    2,
    TAX_2026.defaultBurialFee
  );
  const churchPct = clampNumber(
    input.churchFeeRate ?? TAX_2026.defaultChurchFee,
    0,
    3,
    TAX_2026.defaultChurchFee
  );
  const contractHoursPerWeek = clampNumber(input.contractHoursPerWeek, 1, 80, 40);
  const commuteCostMonthly = clampNumber(input.commuteCostMonthly, 0, 50_000, 0);
  const commuteMinutesPerDay = clampNumber(input.commuteMinutesPerDay, 0, 480, 0);
  const officeDaysPerWeek = clampNumber(input.officeDaysPerWeek, 0, 7, 5);

  const annualGross = grossMonthlySalary * 12;
  const municipalRateDecimal = municipalRatePct / 100;
  const churchDecimal = input.includeChurchFee ? churchPct / 100 : 0;
  const funeralDecimal = burialPct / 100;

  const grundavdrag = estimateGrundavdrag2026(annualGross);
  const taxableIncome = Math.max(0, annualGross - grundavdrag);

  const municipalAndChurchTax = taxableIncome * (municipalRateDecimal + churchDecimal + funeralDecimal);
  const jobbskatteavdrag = estimateJobbskatteavdrag2026(
    annualGross,
    grundavdrag,
    municipalRateDecimal
  );

  // Public service-avgift 2026: 1% of taxable income, capped at ~1 285 kr/year
  const publicServiceFee = Math.min(1285, taxableIncome * 0.01);

  const paysStateTax = taxableIncome > TAX_2026.stateTaxThresholdTaxable;
  const stateTax = paysStateTax
    ? (taxableIncome - TAX_2026.stateTaxThresholdTaxable) * TAX_2026.stateTaxRate
    : 0;

  const estimatedAnnualTax = Math.max(
    0,
    Math.round(municipalAndChurchTax + stateTax + publicServiceFee - jobbskatteavdrag)
  );
  const estimatedMonthlyTax = Math.round(estimatedAnnualTax / 12);
  const netMonthlySalary = Math.max(0, grossMonthlySalary - estimatedMonthlyTax);
  const effectiveTaxPercent =
    grossMonthlySalary > 0 ? (estimatedMonthlyTax / grossMonthlySalary) * 100 : 0;

  const contractMonthlyHours = contractHoursPerWeek * TAX_2026.weeksPerMonth;
  const nominalNetHourlyWage = contractMonthlyHours > 0 ? netMonthlySalary / contractMonthlyHours : 0;

  const monthlyCommuteHours =
    (commuteMinutesPerDay / 60) * officeDaysPerWeek * TAX_2026.weeksPerMonth;
  const netAfterCommute = netMonthlySalary - commuteCostMonthly;

  const totalTimeCommitted = contractMonthlyHours + monthlyCommuteHours;
  const realHourlyWage = totalTimeCommitted > 0 ? netAfterCommute / totalTimeCommitted : 0;

  const hourlyWageLoss = Math.max(0, nominalNetHourlyWage - realHourlyWage);
  const hourlyWageLossPercent =
    nominalNetHourlyWage > 0 ? (hourlyWageLoss / nominalNetHourlyWage) * 100 : 0;

  return {
    grossMonthlySalary,
    estimatedAnnualTax,
    estimatedMonthlyTax,
    effectiveTaxPercent,
    netMonthlySalary,
    contractMonthlyHours,
    nominalNetHourlyWage,
    commuteCostMonthly,
    monthlyCommuteHours,
    netAfterCommute,
    realHourlyWage,
    hourlyWageLoss,
    hourlyWageLossPercent,
    annualCommuteHours: monthlyCommuteHours * 12,
    annualCommuteCost: commuteCostMonthly * 12,
    paysStateTax,
  };
}
