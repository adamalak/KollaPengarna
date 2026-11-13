import { clampNumber } from "../format";

export type StudyPace = 100 | 75 | 50;

export interface CsnInput {
  studyPace: StudyPace;
  weeks: number; // 1..26 weeks in a calendar half-year
  expectedIncomeHalfYear: number; // gross taxable income during Jan-Jun or Jul-Dec
  includeLoan: boolean;
}

export interface CsnResult {
  fribelopp: number;
  monthlyAverageLimit: number;
  excessIncome: number;
  remainingMargin: number;
  totalGrant: number;
  totalLoan: number;
  totalAid: number;
  loanReduction: number;
  grantReduction: number;
  totalReduction: number;
  remainingAid: number;
  isOverLimit: boolean;
  isFullyReduced: boolean;
  weeklyRates: {
    grant: number;
    loan: number;
    total: number;
  };
}

/**
 * Official CSN 2026 weekly studiemedel amounts (grant + loan, SEK/week).
 * Source: csn.se (2026 rates).
 */
export const CSN_2026_WEEKLY_RATES: Record<StudyPace, { grant: number; loan: number }> = {
  100: { grant: 1030, loan: 2368 },
  75: { grant: 775, loan: 1776 },
  50: { grant: 509, loan: 1190 },
};

/**
 * Official CSN 2026 fribelopp anchor table per calendar half-year (SEK before tax).
 * Keys are weeks with studiemedel in that half-year (5, 10, 15, 20, 26).
 */
export const CSN_2026_FRIBELOPP_ANCHORS: Record<StudyPace, ReadonlyArray<readonly [number, number]>> = {
  100: [
    [5, 200723],
    [10, 172041],
    [15, 143358],
    [20, 114676],
    [26, 80257],
  ],
  75: [
    [5, 207815],
    [10, 186326],
    [15, 164836],
    [20, 143346],
    [26, 117559],
  ],
  50: [
    [5, 214996],
    [10, 200670],
    [15, 186343],
    [20, 172017],
    [26, 154825],
  ],
};

/**
 * CSN reduces studiemedel by 61% of income exceeding the fribelopp.
 */
export const CSN_REDUCTION_RATE = 0.61;

/**
 * Compute CSN fribelopp (2026) for a given study pace and 1..26 weeks via piecewise
 * linear interpolation/extrapolation across CSN's official anchor points.
 */
export function getCsnFribelopp2026(studyPace: StudyPace, rawWeeks: number): number {
  const weeks = Math.round(clampNumber(rawWeeks, 1, 26, 20));
  const anchors = CSN_2026_FRIBELOPP_ANCHORS[studyPace];

  for (const [anchorWeeks, amount] of anchors) {
    if (anchorWeeks === weeks) return amount;
  }

  // Extrapolate smoothly for 1..4 weeks using the 5-to-10 week slope.
  if (weeks < anchors[0][0]) {
    const [w1, a1] = anchors[0];
    const [w2, a2] = anchors[1];
    const slopePerWeek = (a1 - a2) / (w2 - w1);
    return Math.round(a1 + (w1 - weeks) * slopePerWeek);
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const [w1, a1] = anchors[i];
    const [w2, a2] = anchors[i + 1];
    if (weeks > w1 && weeks < w2) {
      const ratio = (weeks - w1) / (w2 - w1);
      return Math.round(a1 + ratio * (a2 - a1));
    }
  }

  return anchors[anchors.length - 1][1];
}

/**
 * Calculate CSN fribelopp, potential 61% reduction (loan first, then grant), and remaining margin.
 */
export function calculateCsn(input: CsnInput): CsnResult {
  const weeks = Math.round(clampNumber(input.weeks, 1, 26, 20));
  const expectedIncome = Math.max(0, clampNumber(input.expectedIncomeHalfYear, 0, 5_000_000, 0));
  const rates = CSN_2026_WEEKLY_RATES[input.studyPace];

  const fribelopp = getCsnFribelopp2026(input.studyPace, weeks);
  const monthlyAverageLimit = Math.round(fribelopp / 6);

  const totalGrant = rates.grant * weeks;
  const totalLoan = input.includeLoan ? rates.loan * weeks : 0;
  const totalAid = totalGrant + totalLoan;

  const excessIncome = Math.max(0, expectedIncome - fribelopp);
  const remainingMargin = Math.max(0, fribelopp - expectedIncome);

  const rawReduction = Math.round(excessIncome * CSN_REDUCTION_RATE);
  const totalReduction = Math.min(totalAid, rawReduction);

  // CSN reduces the loan portion first; once loan is exhausted, grant is reduced.
  const loanReduction = Math.min(totalLoan, totalReduction);
  const grantReduction = Math.min(totalGrant, Math.max(0, totalReduction - loanReduction));
  const remainingAid = Math.max(0, totalAid - totalReduction);

  return {
    fribelopp,
    monthlyAverageLimit,
    excessIncome,
    remainingMargin,
    totalGrant,
    totalLoan,
    totalAid,
    loanReduction,
    grantReduction,
    totalReduction,
    remainingAid,
    isOverLimit: excessIncome > 0,
    isFullyReduced: totalAid > 0 && remainingAid === 0,
    weeklyRates: {
      grant: rates.grant,
      loan: input.includeLoan ? rates.loan : 0,
      total: rates.grant + (input.includeLoan ? rates.loan : 0),
    },
  };
}
