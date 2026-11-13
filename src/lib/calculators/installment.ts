import { clampNumber } from "../format";

export type InstallmentInputMode = "byRate" | "byMonthlyPayment";

export interface InstallmentInput {
  mode: InstallmentInputMode;
  cashPrice: number; // Kontantpris i kr
  months: number; // 1..120
  annualNominalRatePercent: number; // Used when mode === 'byRate'
  baseMonthlyPayment: number; // Used when mode === 'byMonthlyPayment' (exkl. aviavgift)
  setupFee: number; // Uppläggningsavgift i kr
  monthlyAdminFee: number; // Aviavgift per månad i kr
  netHourlyWage: number; // För att visa hur många timmar extrakostnaden motsvarar
}

export interface InstallmentResult {
  cashPrice: number;
  months: number;
  monthlyInstallmentExclAdmin: number;
  totalMonthlyOutflow: number;
  totalPrincipalAndInterest: number;
  totalSetupFee: number;
  totalAdminFees: number;
  totalInterestCost: number;
  totalExtraCost: number;
  totalPaid: number;
  markupPercent: number;
  effectiveAnnualRatePercent: number; // Effektiv årsränta (APR)
  extraWorkHours: number;
  isCheaperThanCash: boolean;
}

/**
 * Compute present value of an installment plan discounted at annual effective rate `apr`.
 * Uses Konsumentkreditlagen / EU Directive compounding: (1 + apr)^(-m/12).
 */
function presentValueOfSchedule(
  apr: number,
  months: number,
  monthlyPayment: number,
  setupFee: number
): number {
  let pv = setupFee;
  for (let m = 1; m <= months; m++) {
    pv += monthlyPayment / Math.pow(1 + apr, m / 12);
  }
  return pv;
}

/**
 * Solve annual effective interest rate (APR, e.g. 0.245 for 24.5%) via bisection.
 * Guarantees convergence without NaN or Newton-Raphson divergence.
 */
export function solveEffectiveApr(
  cashPrice: number,
  months: number,
  monthlyOutflow: number,
  setupFee: number
): number {
  const totalPaid = setupFee + months * monthlyOutflow;
  if (cashPrice <= 0 || months <= 0 || totalPaid <= cashPrice) {
    return 0;
  }

  // If setupFee alone already equals or exceeds cashPrice, APR is effectively unbounded; cap gracefully.
  if (setupFee >= cashPrice) {
    return 99.99;
  }

  let low = 0;
  let high = 100; // 10 000% upper bound handles extreme short-term micro-loans
  while (presentValueOfSchedule(high, months, monthlyOutflow, setupFee) > cashPrice && high < 10000) {
    high *= 2;
  }

  for (let iter = 0; iter < 80; iter++) {
    const mid = (low + high) / 2;
    const pv = presentValueOfSchedule(mid, months, monthlyOutflow, setupFee);
    if (pv > cashPrice) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

/**
 * Calculate the true total cost and effective annual rate (effektiv ränta) of an installment plan.
 */
export function calculateInstallment(input: InstallmentInput): InstallmentResult {
  const cashPrice = clampNumber(input.cashPrice, 100, 5_000_000, 10_000);
  const months = Math.round(clampNumber(input.months, 1, 120, 12));
  const setupFee = clampNumber(input.setupFee, 0, 50_000, 0);
  const monthlyAdminFee = clampNumber(input.monthlyAdminFee, 0, 5_000, 0);
  const netHourlyWage = clampNumber(input.netHourlyWage, 50, 5_000, 180);

  let monthlyInstallmentExclAdmin: number;
  if (input.mode === "byRate") {
    const annualRate = clampNumber(input.annualNominalRatePercent, 0, 200, 0) / 100;
    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) {
      monthlyInstallmentExclAdmin = cashPrice / months;
    } else {
      monthlyInstallmentExclAdmin =
        (cashPrice * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }
  } else {
    monthlyInstallmentExclAdmin = clampNumber(input.baseMonthlyPayment, 0, 1_000_000, cashPrice / months);
  }

  const totalMonthlyOutflow = monthlyInstallmentExclAdmin + monthlyAdminFee;
  const totalPrincipalAndInterest = monthlyInstallmentExclAdmin * months;
  const totalAdminFees = monthlyAdminFee * months;
  const totalPaid = totalPrincipalAndInterest + totalAdminFees + setupFee;

  const totalInterestCost = totalPrincipalAndInterest - cashPrice;
  const totalExtraCost = totalPaid - cashPrice;
  const markupPercent = cashPrice > 0 ? (totalExtraCost / cashPrice) * 100 : 0;

  const effectiveApr = solveEffectiveApr(cashPrice, months, totalMonthlyOutflow, setupFee);
  const extraWorkHours = totalExtraCost > 0 ? totalExtraCost / netHourlyWage : 0;

  return {
    cashPrice,
    months,
    monthlyInstallmentExclAdmin,
    totalMonthlyOutflow,
    totalPrincipalAndInterest,
    totalSetupFee: setupFee,
    totalAdminFees,
    totalInterestCost,
    totalExtraCost,
    totalPaid,
    markupPercent,
    effectiveAnnualRatePercent: effectiveApr * 100,
    extraWorkHours,
    isCheaperThanCash: totalPaid < cashPrice - 1,
  };
}
