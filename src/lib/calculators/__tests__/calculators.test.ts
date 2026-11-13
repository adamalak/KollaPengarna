import { describe, expect, it } from "vitest";
import { calculateCompoundIsk, ISK_2026 } from "../compound";
import { calculateCsn, getCsnFribelopp2026 } from "../csn";
import { calculateCsnRepayment } from "../csnRepayment";
import { calculateInstallment, solveEffectiveApr } from "../installment";
import {
  calculateSalaryAndCommute,
  estimateGrundavdrag2026,
  findMunicipality2026,
  MUNICIPALITIES_2026,
} from "../salary";

describe("CSN Fribelopp 2026 calculator", () => {
  it("matches official CSN 2026 anchor table values", () => {
    expect(getCsnFribelopp2026(100, 20)).toBe(114676);
    expect(getCsnFribelopp2026(100, 26)).toBe(80257);
    expect(getCsnFribelopp2026(75, 20)).toBe(143346);
    expect(getCsnFribelopp2026(50, 20)).toBe(172017);
  });

  it("interpolates weeks smoothly between anchors", () => {
    const f18 = getCsnFribelopp2026(100, 18);
    expect(f18).toBeGreaterThan(114676);
    expect(f18).toBeLessThan(143358);
  });

  it("applies 61% reduction to loan first, then grant", () => {
    const res = calculateCsn({
      studyPace: 100,
      weeks: 20,
      expectedIncomeHalfYear: 124676,
      includeLoan: true,
    });
    expect(res.excessIncome).toBe(10000);
    expect(res.totalReduction).toBe(6100);
    expect(res.loanReduction).toBe(6100);
    expect(res.grantReduction).toBe(0);
    expect(res.remainingAid).toBe(67960 - 6100);
  });

  it("reduces grant when loan is excluded or exhausted", () => {
    const grantOnly = calculateCsn({
      studyPace: 100,
      weeks: 20,
      expectedIncomeHalfYear: 124676,
      includeLoan: false,
    });
    expect(grantOnly.totalLoan).toBe(0);
    expect(grantOnly.loanReduction).toBe(0);
    expect(grantOnly.grantReduction).toBe(6100);
    expect(grantOnly.remainingAid).toBe(1030 * 20 - 6100);
  });
});

describe("CSN Repayment 2026 calculator", () => {
  it("calculates realistic monthly payment for 230 000 kr over 25 years at 2.135%", () => {
    const res = calculateCsnRepayment({
      debtAmount: 230000,
      currentAge: 25,
      interestRatePercent: 2.135,
      extraMonthlyPayment: 0,
    });
    expect(res.repaymentYearsPlanned).toBe(25);
    expect(res.firstYearMonthlyPayment).toBeGreaterThan(700);
    expect(res.firstYearMonthlyPayment).toBeLessThan(900);
    expect(res.schedule.length).toBe(25);
    expect(res.schedule[res.schedule.length - 1].endingBalance).toBeLessThan(5);
  });

  it("reduces payoff duration and interest when paying extra monthly", () => {
    const res = calculateCsnRepayment({
      debtAmount: 230000,
      currentAge: 25,
      interestRatePercent: 2.135,
      extraMonthlyPayment: 500,
    });
    expect(res.monthsSavedByExtra).toBeGreaterThan(60);
    expect(res.interestSavedByExtra).toBeGreaterThan(10000);
  });
});

describe("Installment / Delbetalning calculator", () => {
  it("detects hidden APR on 'interest-free' plan with setup & monthly admin fees", () => {
    const res = calculateInstallment({
      mode: "byRate",
      cashPrice: 10000,
      months: 12,
      annualNominalRatePercent: 0,
      baseMonthlyPayment: 0,
      setupFee: 395,
      monthlyAdminFee: 45,
      netHourlyWage: 180,
    });

    expect(res.totalExtraCost).toBe(395 + 12 * 45);
    expect(res.totalPaid).toBe(10935);
    expect(res.effectiveAnnualRatePercent).toBeGreaterThan(15);
    expect(res.effectiveAnnualRatePercent).toBeLessThan(25);
  });

  it("computes accurate APR when nominal rate is provided without fees", () => {
    const res = calculateInstallment({
      mode: "byRate",
      cashPrice: 20000,
      months: 24,
      annualNominalRatePercent: 12,
      baseMonthlyPayment: 0,
      setupFee: 0,
      monthlyAdminFee: 0,
      netHourlyWage: 200,
    });
    expect(res.effectiveAnnualRatePercent).toBeGreaterThan(12.5);
    expect(res.effectiveAnnualRatePercent).toBeLessThan(12.85);
  });

  it("returns 0% APR when total paid <= cash price", () => {
    expect(solveEffectiveApr(10000, 12, 800, 0)).toBe(0);
  });
});

describe("Salary & Commute 2026 calculator & 290 municipalities", () => {
  it("contains all 290 Swedish municipalities from Skatteverket 2026", () => {
    expect(MUNICIPALITIES_2026.length).toBe(290);
    expect(findMunicipality2026("Stockholm")?.municipalTax).toBe(30.55);
    expect(findMunicipality2026("Göteborg")?.municipalTax).toBe(32.6);
    expect(findMunicipality2026("Dorotea")?.municipalTax).toBe(35.65);
  });

  it("estimates Swedish 2026 net salary accurately near Skattetabell 32", () => {
    const res = calculateSalaryAndCommute({
      grossMonthlySalary: 35000,
      municipalTaxRate: 32.0,
      burialFeeRate: 0,
      includeChurchFee: false,
      contractHoursPerWeek: 40,
      commuteCostMonthly: 0,
      commuteMinutesPerDay: 0,
      officeDaysPerWeek: 5,
    });
    expect(res.netMonthlySalary).toBeGreaterThan(27700);
    expect(res.netMonthlySalary).toBeLessThan(28300);
    expect(res.paysStateTax).toBe(false);
  });

  it("reduces real hourly wage when commute cost and unpaid time are added", () => {
    const res = calculateSalaryAndCommute({
      grossMonthlySalary: 36000,
      municipalTaxRate: 32.38,
      includeChurchFee: false,
      contractHoursPerWeek: 40,
      commuteCostMonthly: 2000,
      commuteMinutesPerDay: 90,
      officeDaysPerWeek: 5,
    });
    expect(res.realHourlyWage).toBeLessThan(res.nominalNetHourlyWage);
    expect(res.monthlyCommuteHours).toBeGreaterThan(30);
    expect(res.hourlyWageLossPercent).toBeGreaterThan(15);
  });

  it("applies grundavdrag within 2026 bounds", () => {
    expect(estimateGrundavdrag2026(175000)).toBeGreaterThan(44000);
    expect(estimateGrundavdrag2026(600000)).toBeLessThan(18000);
  });
});

describe("Compound / ISK 2026 calculator", () => {
  it("pays zero ISK tax below 300 000 kr tax-free threshold", () => {
    const res = calculateCompoundIsk({
      initialAmount: 100000,
      monthlySaving: 1000,
      years: 5,
      expectedAnnualReturnPercent: 5,
      useIskTax: true,
      annualFeePercent: 0,
    });
    expect(res.totalIskTaxPaid).toBe(0);
    expect(res.finalBalance).toBeGreaterThan(160000);
  });

  it("applies 1.065% ISK tax only above 300 000 kr", () => {
    const withTax = calculateCompoundIsk({
      initialAmount: 500000,
      monthlySaving: 3000,
      years: 15,
      expectedAnnualReturnPercent: 7,
      useIskTax: true,
      annualFeePercent: 0.2,
    });
    const noTax = calculateCompoundIsk({
      initialAmount: 500000,
      monthlySaving: 3000,
      years: 15,
      expectedAnnualReturnPercent: 7,
      useIskTax: false,
      annualFeePercent: 0.2,
    });
    expect(ISK_2026.taxFreeLimit).toBe(300000);
    expect(withTax.totalIskTaxPaid).toBeGreaterThan(0);
    expect(withTax.finalBalance).toBeLessThan(noTax.finalBalance);
  });
});
