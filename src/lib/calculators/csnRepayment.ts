import { clampNumber } from "../format";

/**
 * Official CSN 2026 repayment constants (lån tagna från och med 2001).
 * Source: csn.se (2026).
 */
export const CSN_REPAYMENT_2026 = {
  interestRatePercent: 2.135, // Fastställd CSN-ränta för 2026
  annualEscalationRate: 0.02, // Årsbeloppet räknas normalt upp med 2 % per år
  annualExpeditionFee: 150, // Årlig expeditionsavgift
  maxRepaymentYears: 25,
  maxAgeLimit: 64, // Återbetalas senast det år man fyller 64 (lån >= 2022) / 60 (äldre)
} as const;

export interface CsnRepaymentInput {
  debtAmount: number; // Kvarvarande CSN-skuld i kr
  currentAge: number; // Ålder när återbetalning börjar / idag
  interestRatePercent: number; // Default 2.135 % (2026)
  extraMonthlyPayment: number; // Frivillig extraamortering per månad
}

export interface CsnRepaymentYearRow {
  year: number;
  age: number;
  annualPayment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

export interface CsnRepaymentResult {
  debtAmount: number;
  repaymentYearsPlanned: number;
  actualYearsToPayoff: number;
  firstYearMonthlyPayment: number;
  firstYearMonthlyWithFee: number;
  totalInterestPaid: number;
  totalFeesPaid: number;
  totalRepaid: number;
  monthsSavedByExtra: number;
  interestSavedByExtra: number;
  schedule: CsnRepaymentYearRow[];
}

/**
 * Solve the initial annual annuity payment `A_1` for an escalating annuity that grows by `g` (2%/yr)
 * over `N` years at interest rate `r`, such that ending balance after N years equals 0.
 */
function solveFirstYearPayment(debt: number, rate: number, growth: number, years: number): number {
  if (debt <= 0 || years <= 0) return 0;

  let low = 0;
  let high = debt * (1 + rate) + 1000;

  for (let iter = 0; iter < 60; iter++) {
    const mid = (low + high) / 2;
    let balance = debt;
    for (let y = 0; y < years; y++) {
      const payment = mid * Math.pow(1 + growth, y);
      balance = balance * (1 + rate) - payment;
    }
    if (balance > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

function simulateRepayment(
  debt: number,
  currentAge: number,
  rateDecimal: number,
  extraMonthly: number,
  maxYears: number
): {
  firstYearAnnual: number;
  totalInterest: number;
  totalFees: number;
  totalPaid: number;
  monthsToPayoff: number;
  schedule: CsnRepaymentYearRow[];
} {
  if (debt <= 0 || maxYears <= 0) {
    return {
      firstYearAnnual: 0,
      totalInterest: 0,
      totalFees: 0,
      totalPaid: 0,
      monthsToPayoff: 0,
      schedule: [],
    };
  }

  const baseFirstAnnual = solveFirstYearPayment(
    debt,
    rateDecimal,
    CSN_REPAYMENT_2026.annualEscalationRate,
    maxYears
  );

  let balance = debt;
  let totalInterest = 0;
  let totalFees = 0;
  let totalPaid = 0;
  let monthsToPayoff = 0;
  const schedule: CsnRepaymentYearRow[] = [];

  for (let y = 0; y < maxYears && balance > 0.5; y++) {
    const scheduledAnnual = baseFirstAnnual * Math.pow(1 + CSN_REPAYMENT_2026.annualEscalationRate, y);
    const desiredAnnual = scheduledAnnual + extraMonthly * 12;

    const yearInterest = balance * rateDecimal;
    const dueWithInterest = balance + yearInterest;
    const actualAnnual = Math.min(dueWithInterest, desiredAnnual);
    const principalPaid = Math.max(0, actualAnnual - yearInterest);
    const endingBalance = Math.max(0, dueWithInterest - actualAnnual);

    totalInterest += yearInterest;
    totalFees += CSN_REPAYMENT_2026.annualExpeditionFee;
    totalPaid += actualAnnual + CSN_REPAYMENT_2026.annualExpeditionFee;

    if (endingBalance <= 0.5) {
      const fractionOfYear = dueWithInterest > 0 ? Math.min(1, actualAnnual / desiredAnnual) : 1;
      monthsToPayoff += Math.max(1, Math.round(fractionOfYear * 12));
    } else {
      monthsToPayoff += 12;
    }

    schedule.push({
      year: y + 1,
      age: currentAge + y,
      annualPayment: actualAnnual,
      interestPaid: yearInterest,
      principalPaid,
      endingBalance,
    });

    balance = endingBalance;
  }

  return {
    firstYearAnnual: baseFirstAnnual,
    totalInterest,
    totalFees,
    totalPaid,
    monthsToPayoff,
    schedule,
  };
}

/**
 * Calculate CSN student loan monthly repayment and lifetime cost based on 2026 rules.
 */
export function calculateCsnRepayment(input: CsnRepaymentInput): CsnRepaymentResult {
  const debtAmount = clampNumber(input.debtAmount, 0, 2_000_000, 230_000);
  const currentAge = Math.round(clampNumber(input.currentAge, 18, 63, 25));
  const interestRatePercent = clampNumber(
    input.interestRatePercent,
    0,
    15,
    CSN_REPAYMENT_2026.interestRatePercent
  );
  const extraMonthlyPayment = clampNumber(input.extraMonthlyPayment, 0, 50_000, 0);

  const repaymentYearsPlanned = Math.min(
    CSN_REPAYMENT_2026.maxRepaymentYears,
    Math.max(1, CSN_REPAYMENT_2026.maxAgeLimit - currentAge)
  );
  const rateDecimal = interestRatePercent / 100;

  const baseline = simulateRepayment(debtAmount, currentAge, rateDecimal, 0, repaymentYearsPlanned);
  const withExtra =
    extraMonthlyPayment > 0
      ? simulateRepayment(
          debtAmount,
          currentAge,
          rateDecimal,
          extraMonthlyPayment,
          repaymentYearsPlanned
        )
      : baseline;

  const firstYearMonthlyBase = withExtra.firstYearAnnual / 12 + extraMonthlyPayment;
  const firstYearMonthlyWithFee =
    firstYearMonthlyBase + (debtAmount > 0 ? CSN_REPAYMENT_2026.annualExpeditionFee / 12 : 0);

  return {
    debtAmount,
    repaymentYearsPlanned,
    actualYearsToPayoff: Number((withExtra.monthsToPayoff / 12).toFixed(1)),
    firstYearMonthlyPayment: Math.round(firstYearMonthlyBase),
    firstYearMonthlyWithFee: Math.round(firstYearMonthlyWithFee),
    totalInterestPaid: Math.round(withExtra.totalInterest),
    totalFeesPaid: Math.round(withExtra.totalFees),
    totalRepaid: Math.round(withExtra.totalPaid),
    monthsSavedByExtra: Math.max(0, baseline.monthsToPayoff - withExtra.monthsToPayoff),
    interestSavedByExtra: Math.max(0, Math.round(baseline.totalInterest - withExtra.totalInterest)),
    schedule: withExtra.schedule,
  };
}
