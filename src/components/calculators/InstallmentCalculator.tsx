"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownBar } from "@/components/BreakdownBar";
import { ShareSummaryBar } from "@/components/ShareSummaryBar";
import { SliderField } from "@/components/SliderField";
import {
  calculateInstallment,
  type InstallmentInputMode,
} from "@/lib/calculators/installment";
import { formatHours, formatPercent, formatSEK } from "@/lib/format";

export function InstallmentCalculator() {
  const [mode, setMode] = useState<InstallmentInputMode>("byRate");
  const [cashPrice, setCashPrice] = useState<number>(12000);
  const [months, setMonths] = useState<number>(12);
  const [annualNominalRatePercent, setAnnualNominalRatePercent] = useState<number>(0);
  const [baseMonthlyPayment, setBaseMonthlyPayment] = useState<number>(1000);
  const [setupFee, setSetupFee] = useState<number>(395);
  const [monthlyAdminFee, setMonthlyAdminFee] = useState<number>(45);
  const [netHourlyWage, setNetHourlyWage] = useState<number>(175);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const priceParam = Number(params.get("price"));
    const monthsParam = Number(params.get("months"));
    const rateParam = Number(params.get("rate"));
    const payParam = Number(params.get("pay"));
    const setupParam = Number(params.get("setup"));
    const adminParam = Number(params.get("admin"));
    const wageParam = Number(params.get("wage"));

    if (modeParam === "byRate" || modeParam === "byMonthlyPayment") setMode(modeParam);
    if (Number.isFinite(priceParam) && priceParam >= 100) setCashPrice(priceParam);
    if (Number.isFinite(monthsParam) && monthsParam >= 1 && monthsParam <= 120) {
      setMonths(Math.round(monthsParam));
    }
    if (Number.isFinite(rateParam) && rateParam >= 0) setAnnualNominalRatePercent(rateParam);
    if (Number.isFinite(payParam) && payParam >= 0) setBaseMonthlyPayment(payParam);
    if (Number.isFinite(setupParam) && setupParam >= 0) setSetupFee(setupParam);
    if (Number.isFinite(adminParam) && adminParam >= 0) setMonthlyAdminFee(adminParam);
    if (Number.isFinite(wageParam) && wageParam >= 50) setNetHourlyWage(wageParam);
  }, []);

  const result = useMemo(
    () =>
      calculateInstallment({
        mode,
        cashPrice,
        months,
        annualNominalRatePercent,
        baseMonthlyPayment,
        setupFee,
        monthlyAdminFee,
        netHourlyWage,
      }),
    [
      mode,
      cashPrice,
      months,
      annualNominalRatePercent,
      baseMonthlyPayment,
      setupFee,
      monthlyAdminFee,
      netHourlyWage,
    ]
  );

  const isExpensive = result.effectiveAnnualRatePercent >= 15;
  const isModerate =
    result.effectiveAnnualRatePercent > 0 && result.effectiveAnnualRatePercent < 15;

  const shareQueryString = `mode=${mode}&price=${cashPrice}&months=${months}&rate=${annualNominalRatePercent}&pay=${baseMonthlyPayment}&setup=${setupFee}&admin=${monthlyAdminFee}&wage=${netHourlyWage}`;

  const summaryText = `Delbetalningskoll: En vara för ${formatSEK(
    result.cashPrice
  )} på ${result.months} mån kostar totalt ${formatSEK(
    result.totalPaid
  )} (+${formatSEK(result.totalExtraCost)} i ränta & avgifter). Effektiv årsränta: ${formatPercent(
    result.effectiveAnnualRatePercent,
    1
  )}.`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Inputs */}
      <div className="space-y-5 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-7 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <h2 className="text-base font-bold text-zinc-900">Kreditens villkor</h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode("byRate");
                setCashPrice(12000);
                setMonths(12);
                setAnnualNominalRatePercent(0);
                setSetupFee(395);
                setMonthlyAdminFee(45);
              }}
              className="rounded border border-stone-300 bg-[#F6F5F1] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-200"
            >
              ”Räntefritt” 12 mån
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("byRate");
                setCashPrice(15000);
                setMonths(24);
                setAnnualNominalRatePercent(19.9);
                setSetupFee(0);
                setMonthlyAdminFee(29);
              }}
              className="rounded border border-stone-300 bg-[#F6F5F1] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-200"
            >
              Konto 19,9 %
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-md border border-stone-200 bg-[#F6F5F1] p-1">
          <button
            type="button"
            onClick={() => setMode("byRate")}
            className={`rounded py-1.5 text-xs font-semibold transition sm:text-sm ${
              mode === "byRate" ? "bg-white text-zinc-900 shadow-2xs" : "text-stone-600"
            }`}
          >
            Jag vet räntan (%)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("byMonthlyPayment");
              setBaseMonthlyPayment(Math.round(cashPrice / months));
            }}
            className={`rounded py-1.5 text-xs font-semibold transition sm:text-sm ${
              mode === "byMonthlyPayment" ? "bg-white text-zinc-900 shadow-2xs" : "text-stone-600"
            }`}
          >
            Jag vet månadsbeloppet
          </button>
        </div>

        <SliderField
          label="Varans kontantpris"
          value={cashPrice}
          onChange={setCashPrice}
          min={500}
          max={100000}
          step={500}
          unit="kr"
        />

        <SliderField
          label="Antal månader"
          value={months}
          onChange={(v) => setMonths(Math.max(1, Math.round(v)))}
          min={1}
          max={60}
          step={1}
          unit="mån"
        />

        {mode === "byRate" ? (
          <SliderField
            label="Angiven årsränta (nominell)"
            value={annualNominalRatePercent}
            onChange={setAnnualNominalRatePercent}
            min={0}
            max={40}
            step={0.5}
            unit="%"
            allowDecimals
            hint="Sätt 0 % om köpet marknadsförs som ”räntefritt”."
          />
        ) : (
          <SliderField
            label="Månadsbelopp (exkl. aviavgift)"
            value={baseMonthlyPayment}
            onChange={setBaseMonthlyPayment}
            min={100}
            max={20000}
            step={50}
            unit="kr"
            hint="Amortering + ränta per månad innan aviavgiften läggs på."
          />
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <SliderField
            label="Uppläggningsavgift"
            value={setupFee}
            onChange={setSetupFee}
            min={0}
            max={1500}
            step={50}
            unit="kr"
          />
          <SliderField
            label="Aviavgift / mån"
            value={monthlyAdminFee}
            onChange={setMonthlyAdminFee}
            min={0}
            max={150}
            step={5}
            unit="kr"
          />
        </div>

        <SliderField
          label="Din timlön efter skatt (valfritt)"
          value={netHourlyWage}
          onChange={setNetHourlyWage}
          min={90}
          max={500}
          step={5}
          unit="kr"
          hint="Visar hur många extra arbetstimmar som går åt till bara ränta och avgifter."
        />
      </div>

      {/* Right: Results */}
      <div className="space-y-5 lg:col-span-6">
        <div
          className={`rounded-lg border border-[#DDD9CE] border-t-4 bg-white p-5 sm:p-7 ${
            isExpensive
              ? "border-t-red-700"
              : isModerate
              ? "border-t-amber-600"
              : "border-t-[#0B4F3F]"
          }`}
        >
          <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
            Verklig effektiv årsränta (APR)
          </p>
          <p className="font-mono-num mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {formatPercent(result.effectiveAnnualRatePercent, 1)}
          </p>
          <p className="mt-1.5 text-sm text-stone-600">
            {result.totalExtraCost > 0
              ? `Du betalar ${formatSEK(result.totalExtraCost)} extra (+${formatPercent(
                  result.markupPercent,
                  1
                )} påslag på priset).`
              : "Inga extra ränte- eller avgiftskostnader utöver kontantpriset."}
          </p>

          <dl className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Totalt att betala</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.totalPaid)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Månadskostnad (inkl. aviavgift)</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.totalMonthlyOutflow)}/mån
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Arbetstid för ränta &amp; avgifter</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatHours(result.extraWorkHours)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          <BreakdownBar
            title="Fördelning av totalbeloppet"
            segments={[
              {
                label: "Varans pris",
                value: result.cashPrice,
                formattedValue: formatSEK(result.cashPrice),
                colorClass: "bg-[#0B4F3F]",
              },
              {
                label: "Ränta",
                value: Math.max(0, result.totalInterestCost),
                formattedValue: formatSEK(Math.max(0, result.totalInterestCost)),
                colorClass: "bg-red-700",
              },
              {
                label: "Uppläggning & aviavgifter",
                value: result.totalSetupFee + result.totalAdminFees,
                formattedValue: formatSEK(result.totalSetupFee + result.totalAdminFees),
                colorClass: "bg-amber-600",
              },
            ]}
          />

          <ShareSummaryBar summaryText={summaryText} shareQueryString={shareQueryString} />
        </div>
      </div>
    </div>
  );
}
