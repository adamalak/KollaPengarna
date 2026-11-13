"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownBar } from "@/components/BreakdownBar";
import { ShareSummaryBar } from "@/components/ShareSummaryBar";
import { SliderField } from "@/components/SliderField";
import { calculateCsnRepayment, CSN_REPAYMENT_2026 } from "@/lib/calculators/csnRepayment";
import { formatSEK } from "@/lib/format";

export function CsnRepaymentCalculator() {
  const [debtAmount, setDebtAmount] = useState<number>(230000);
  const [currentAge, setCurrentAge] = useState<number>(25);
  const [interestRatePercent, setInterestRatePercent] = useState<number>(
    CSN_REPAYMENT_2026.interestRatePercent
  );
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debtParam = Number(params.get("debt"));
    const ageParam = Number(params.get("age"));
    const rateParam = Number(params.get("rate"));
    const extraParam = Number(params.get("extra"));

    if (Number.isFinite(debtParam) && debtParam >= 0) setDebtAmount(debtParam);
    if (Number.isFinite(ageParam) && ageParam >= 18 && ageParam <= 63) {
      setCurrentAge(Math.round(ageParam));
    }
    if (Number.isFinite(rateParam) && rateParam >= 0 && rateParam <= 15) {
      setInterestRatePercent(rateParam);
    }
    if (Number.isFinite(extraParam) && extraParam >= 0) setExtraMonthlyPayment(extraParam);
  }, []);

  const result = useMemo(
    () =>
      calculateCsnRepayment({
        debtAmount,
        currentAge,
        interestRatePercent,
        extraMonthlyPayment,
      }),
    [debtAmount, currentAge, interestRatePercent, extraMonthlyPayment]
  );

  const shareQueryString = `debt=${debtAmount}&age=${currentAge}&rate=${interestRatePercent}&extra=${extraMonthlyPayment}`;

  const summaryText = `CSN Återbetalning (2026): Skuld ${formatSEK(
    result.debtAmount
  )} vid ${currentAge} års ålder (${interestRatePercent
    .toFixed(3)
    .replace(".", ",")} % ränta) ger ca ${formatSEK(
    result.firstYearMonthlyWithFee
  )}/mån första året och blir skuldfri på ${result.actualYearsToPayoff} år.`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Inputs */}
      <div className="space-y-5 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-7 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <h2 className="text-base font-bold text-zinc-900">Ditt studielån</h2>
          <button
            type="button"
            onClick={() => {
              setDebtAmount(230000);
              setCurrentAge(25);
              setInterestRatePercent(CSN_REPAYMENT_2026.interestRatePercent);
              setExtraMonthlyPayment(0);
            }}
            className="rounded border border-stone-300 bg-[#F6F5F1] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-200"
          >
            Snittskuld (230 000 kr)
          </button>
        </div>

        <SliderField
          label="Kvarvarande CSN-skuld"
          value={debtAmount}
          onChange={setDebtAmount}
          min={10000}
          max={700000}
          step={5000}
          unit="kr"
        />

        <SliderField
          label="Din ålder när du börjar betala"
          value={currentAge}
          onChange={(v) => setCurrentAge(Math.round(v))}
          min={19}
          max={60}
          step={1}
          unit="år"
          hint="Återbetalningstiden är högst 25 år eller fram till det år du fyller 64."
        />

        <SliderField
          label="CSN-ränta (2026 års ränta: 2,135 %)"
          value={interestRatePercent}
          onChange={setInterestRatePercent}
          min={0}
          max={6}
          step={0.05}
          unit="%"
          allowDecimals
          hint="2026 års ränta är 2,135 %. Rabatten (30 %) är redan avdragen i CSN:s räntesats."
        />

        <SliderField
          label="Frivillig extraamortering per månad"
          value={extraMonthlyPayment}
          onChange={setExtraMonthlyPayment}
          min={0}
          max={5000}
          step={100}
          unit="kr"
          hint="Se hur mycket snabbare lånet försvinner om du betalar in lite extra varje månad."
        />
      </div>

      {/* Right: Results */}
      <div className="space-y-5 lg:col-span-6">
        <div className="rounded-lg border border-[#DDD9CE] border-t-4 border-t-[#0B4F3F] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            Beräknad månadskostnad första året
          </p>
          <p className="font-mono-num mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {formatSEK(result.firstYearMonthlyWithFee)}/mån
          </p>
          <p className="mt-1.5 text-sm text-stone-600">
            Inkluderar 150 kr/år i expeditionsavgift (12,50 kr/mån). Årsbeloppet räknas normalt upp
            med ca 2 % per år.
          </p>

          <dl className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Återbetalningstid</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {result.actualYearsToPayoff} år{" "}
                <span className="text-xs font-normal text-stone-500">
                  (slutår vid {Math.round(currentAge + result.actualYearsToPayoff)} år)
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Total räntekostnad</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                {formatSEK(result.totalInterestPaid)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Totalt återbetalt inkl. avgifter</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.totalRepaid)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          <BreakdownBar
            title="Fördelning av allt du betalar tillbaka"
            segments={[
              {
                label: "Lånat kapital",
                value: result.debtAmount,
                formattedValue: formatSEK(result.debtAmount),
                colorClass: "bg-[#0B4F3F]",
              },
              {
                label: "Ränta",
                value: result.totalInterestPaid,
                formattedValue: formatSEK(result.totalInterestPaid),
                colorClass: "bg-amber-600",
              },
              {
                label: "Expeditionsavgifter",
                value: result.totalFeesPaid,
                formattedValue: formatSEK(result.totalFeesPaid),
                colorClass: "bg-stone-400",
              },
            ]}
          />

          {extraMonthlyPayment > 0 && result.monthsSavedByExtra > 0 && (
            <p className="border-l-2 border-[#0B4F3F] bg-emerald-50/50 py-2 pr-3 pl-3 text-xs leading-relaxed text-zinc-800">
              Med{" "}
              <strong className="font-mono-num">{formatSEK(extraMonthlyPayment)}/mån</strong> extra
              blir du skuldfri{" "}
              <strong className="font-mono-num">
                {(result.monthsSavedByExtra / 12).toFixed(1)} år snabbare
              </strong>{" "}
              och sparar{" "}
              <strong className="font-mono-num">{formatSEK(result.interestSavedByExtra)}</strong> i
              ränta.
            </p>
          )}

          <ShareSummaryBar summaryText={summaryText} shareQueryString={shareQueryString} />
        </div>
      </div>
    </div>
  );
}
