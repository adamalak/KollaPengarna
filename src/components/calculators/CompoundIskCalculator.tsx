"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownBar } from "@/components/BreakdownBar";
import { ShareSummaryBar } from "@/components/ShareSummaryBar";
import { SliderField } from "@/components/SliderField";
import { calculateCompoundIsk, ISK_2026 } from "@/lib/calculators/compound";
import { formatSEK } from "@/lib/format";

export function CompoundIskCalculator() {
  const [initialAmount, setInitialAmount] = useState<number>(25000);
  const [monthlySaving, setMonthlySaving] = useState<number>(2500);
  const [years, setYears] = useState<number>(20);
  const [expectedAnnualReturnPercent, setExpectedAnnualReturnPercent] = useState<number>(7);
  const [annualFeePercent, setAnnualFeePercent] = useState<number>(0.2);
  const [useIskTax, setUseIskTax] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initParam = Number(params.get("init"));
    const monParam = Number(params.get("mon"));
    const yrsParam = Number(params.get("yrs"));
    const retParam = Number(params.get("ret"));
    const feeParam = Number(params.get("fee"));
    const iskParam = params.get("isk");

    if (Number.isFinite(initParam) && initParam >= 0) setInitialAmount(initParam);
    if (Number.isFinite(monParam) && monParam >= 0) setMonthlySaving(monParam);
    if (Number.isFinite(yrsParam) && yrsParam >= 1 && yrsParam <= 60) {
      setYears(Math.round(yrsParam));
    }
    if (Number.isFinite(retParam) && retParam >= -10 && retParam <= 30) {
      setExpectedAnnualReturnPercent(retParam);
    }
    if (Number.isFinite(feeParam) && feeParam >= 0 && feeParam <= 5) {
      setAnnualFeePercent(feeParam);
    }
    if (iskParam === "0" || iskParam === "1") setUseIskTax(iskParam === "1");
  }, []);

  const result = useMemo(
    () =>
      calculateCompoundIsk({
        initialAmount,
        monthlySaving,
        years,
        expectedAnnualReturnPercent,
        annualFeePercent,
        useIskTax,
      }),
    [initialAmount, monthlySaving, years, expectedAnnualReturnPercent, annualFeePercent, useIskTax]
  );

  // Build crisp responsive SVG chart path
  const chartData = useMemo(() => {
    const width = 560;
    const height = 180;
    const padX = 8;
    const padY = 12;
    const maxVal = Math.max(1, ...result.timeline.map((p) => p.totalBalance));
    const count = Math.max(1, result.timeline.length - 1);

    const toX = (idx: number) => padX + (idx / count) * (width - padX * 2);
    const toY = (val: number) => height - padY - (val / maxVal) * (height - padY * 2);

    const balanceLine = result.timeline
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.totalBalance).toFixed(1)}`)
      .join(" ");

    const depositLine = result.timeline
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.totalDeposited).toFixed(1)}`
      )
      .join(" ");

    const areaPath = `${balanceLine} L ${toX(count).toFixed(1)} ${(height - padY).toFixed(
      1
    )} L ${toX(0).toFixed(1)} ${(height - padY).toFixed(1)} Z`;

    return { width, height, balanceLine, depositLine, areaPath };
  }, [result.timeline]);

  const shareQueryString = `init=${initialAmount}&mon=${monthlySaving}&yrs=${years}&ret=${expectedAnnualReturnPercent}&fee=${annualFeePercent}&isk=${
    useIskTax ? "1" : "0"
  }`;

  const summaryText = `Ränta på ränta (ISK 2026): ${formatSEK(
    initialAmount
  )} i startkapital + ${formatSEK(monthlySaving)}/mån i ${years} år (${expectedAnnualReturnPercent}% avkastning) blir ca ${formatSEK(
    result.finalBalance
  )} efter ISK-skatt.`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Inputs */}
      <div className="space-y-5 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-7 lg:col-span-6">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-base font-bold text-zinc-900">Ditt sparande</h2>
        </div>

        <SliderField
          label="Startkapital"
          value={initialAmount}
          onChange={setInitialAmount}
          min={0}
          max={1000000}
          step={5000}
          unit="kr"
        />

        <SliderField
          label="Månadssparande"
          value={monthlySaving}
          onChange={setMonthlySaving}
          min={0}
          max={30000}
          step={500}
          unit="kr"
        />

        <SliderField
          label="Spartid"
          value={years}
          onChange={(v) => setYears(Math.max(1, Math.round(v)))}
          min={1}
          max={45}
          step={1}
          unit="år"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SliderField
            label="Förväntad avkastning / år"
            value={expectedAnnualReturnPercent}
            onChange={setExpectedAnnualReturnPercent}
            min={1}
            max={15}
            step={0.5}
            unit="%"
            allowDecimals
          />
          <SliderField
            label="Fondavgift / år"
            value={annualFeePercent}
            onChange={setAnnualFeePercent}
            min={0}
            max={2.5}
            step={0.05}
            unit="%"
            allowDecimals
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 bg-[#F6F5F1] p-3.5">
          <input
            type="checkbox"
            checked={useIskTax}
            onChange={(e) => setUseIskTax(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[#0B4F3F] focus:ring-[#0B4F3F]"
          />
          <span className="text-sm text-stone-700">
            <span className="font-semibold text-zinc-900">Räkna med 2026 års ISK-skatt</span>
            <span className="mt-0.5 block text-xs text-stone-500">
              Första {formatSEK(ISK_2026.taxFreeLimit)} är helt skattefria 2026. Belopp däröver
              beskattas med {ISK_2026.effectiveTaxRatePercent.toString().replace(".", ",")} %/år.
            </span>
          </span>
        </label>
      </div>

      {/* Right: Results */}
      <div className="space-y-5 lg:col-span-6">
        <div className="rounded-lg border border-[#DDD9CE] border-t-4 border-t-[#0B4F3F] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            Beräknat slutkapital efter {years} år
          </p>
          <p className="font-mono-num mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {formatSEK(result.finalBalance)}
          </p>

          <dl className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Insatt eget kapital</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                {formatSEK(result.totalDeposited)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Avkastning (ränta på ränta)</dt>
              <dd className="font-mono-num font-semibold text-[#0B4F3F]">
                +{formatSEK(result.netReturn)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Betald ISK-skatt totalt</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                {formatSEK(result.totalIskTaxPaid)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">4 %-regeln (månadsuttag år {years})</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                ca {formatSEK(result.monthlyPassiveEstimate4Pct)}/mån
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          {/* Crisp SVG Growth Chart */}
          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span>Utveckling år 0–{years}</span>
              <div className="flex items-center gap-3 normal-case">
                <span className="flex items-center gap-1 text-zinc-700">
                  <span className="inline-block h-2 w-3 bg-[#0B4F3F]" /> Totalt värde
                </span>
                <span className="flex items-center gap-1 text-stone-500">
                  <span className="inline-block h-0.5 w-3 border-t-2 border-dashed border-stone-500" />{" "}
                  Insatt
                </span>
              </div>
            </div>
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="h-44 w-full overflow-visible"
              role="img"
              aria-label={`Tillväxtgraf från år 0 till år ${years}`}
            >
              <path d={chartData.areaPath} fill="#0B4F3F" fillOpacity="0.1" />
              <path
                d={chartData.depositLine}
                fill="none"
                stroke="#78716C"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <path d={chartData.balanceLine} fill="none" stroke="#0B4F3F" strokeWidth="2.5" />
            </svg>
          </div>

          <BreakdownBar
            segments={[
              {
                label: "Insatt kapital",
                value: result.totalDeposited,
                formattedValue: formatSEK(result.totalDeposited),
                colorClass: "bg-stone-500",
              },
              {
                label: "Avkastning efter skatt",
                value: Math.max(0, result.netReturn),
                formattedValue: formatSEK(Math.max(0, result.netReturn)),
                colorClass: "bg-[#0B4F3F]",
              },
            ]}
          />

          <ShareSummaryBar summaryText={summaryText} shareQueryString={shareQueryString} />
        </div>
      </div>
    </div>
  );
}
