import { clampNumber } from "../format";

/**
 * Official 2026 Swedish ISK tax rules.
 * Source: Skatteverket / Statslåneräntan nov 2025 (2.55% + 1.00% = 3.55% -> 30% tax = 1.065%).
 */
export const ISK_2026 = {
  taxFreeLimit: 300_000, // Skattefri grundnivå 2026
  effectiveTaxRatePercent: 1.065, // 3.55% schablonränta * 30% skatt
} as const;

export interface CompoundInput {
  initialAmount: number;
  monthlySaving: number;
  years: number;
  expectedAnnualReturnPercent: number;
  useIskTax: boolean;
  annualFeePercent: number; // Fondavgift t.ex. 0.2 %
}

export interface CompoundYearPoint {
  year: number;
  totalDeposited: number;
  totalBalance: number;
  totalReturnNet: number;
  totalTaxPaid: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalDeposited: number;
  netReturn: number;
  totalIskTaxPaid: number;
  monthlyPassiveEstimate4Pct: number; // 4%-regeln per månad som referens
  timeline: CompoundYearPoint[];
}

/**
 * Simulate compound growth with monthly contributions and 2026 Swedish ISK tax rules
 * (first 300 000 SEK tax-free, 1.065% annual tax on capital above 300 000 SEK).
 */
export function calculateCompoundIsk(input: CompoundInput): CompoundResult {
  const initialAmount = clampNumber(input.initialAmount, 0, 50_000_000, 25_000);
  const monthlySaving = clampNumber(input.monthlySaving, 0, 500_000, 2_500);
  const years = Math.round(clampNumber(input.years, 1, 60, 20));
  const grossReturnPct = clampNumber(input.expectedAnnualReturnPercent, -10, 30, 7);
  const feePct = clampNumber(input.annualFeePercent, 0, 5, 0.2);

  // Effective net annual return after fund fees
  const netAnnualReturnDecimal = (grossReturnPct - feePct) / 100;
  const monthlyGrowthFactor = Math.pow(1 + netAnnualReturnDecimal, 1 / 12);
  const iskTaxRateDecimal = ISK_2026.effectiveTaxRatePercent / 100;

  let balance = initialAmount;
  let totalDeposited = initialAmount;
  let totalTaxPaid = 0;

  const timeline: CompoundYearPoint[] = [
    {
      year: 0,
      totalDeposited: Math.round(totalDeposited),
      totalBalance: Math.round(balance),
      totalReturnNet: 0,
      totalTaxPaid: 0,
    },
  ];

  for (let y = 1; y <= years; y++) {
    let quarterlyCapitalSum = 0;

    for (let m = 1; m <= 12; m++) {
      // Quarterly ISK capital base snapshot at start of quarter (Jan, Apr, Jul, Oct)
      if (m === 1 || m === 4 || m === 7 || m === 10) {
        quarterlyCapitalSum += balance;
      }
      balance = (balance + monthlySaving) * monthlyGrowthFactor;
      totalDeposited += monthlySaving;
    }

    if (input.useIskTax) {
      // Approximate Swedish ISK base: average of 4 quarterly snapshots + deposits during year
      const avgCapitalBase = (quarterlyCapitalSum + monthlySaving * 12) / 4;
      const taxableBase = Math.max(0, avgCapitalBase - ISK_2026.taxFreeLimit);
      const yearTax = taxableBase * iskTaxRateDecimal;
      balance = Math.max(0, balance - yearTax);
      totalTaxPaid += yearTax;
    }

    timeline.push({
      year: y,
      totalDeposited: Math.round(totalDeposited),
      totalBalance: Math.round(balance),
      totalReturnNet: Math.round(balance - totalDeposited),
      totalTaxPaid: Math.round(totalTaxPaid),
    });
  }

  const finalBalance = Math.round(balance);
  const roundedDeposited = Math.round(totalDeposited);

  return {
    finalBalance,
    totalDeposited: roundedDeposited,
    netReturn: finalBalance - roundedDeposited,
    totalIskTaxPaid: Math.round(totalTaxPaid),
    monthlyPassiveEstimate4Pct: Math.round((finalBalance * 0.04) / 12),
    timeline,
  };
}
