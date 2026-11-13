"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownBar } from "@/components/BreakdownBar";
import { MunicipalityCombobox } from "@/components/MunicipalityCombobox";
import { ShareSummaryBar } from "@/components/ShareSummaryBar";
import { SliderField } from "@/components/SliderField";
import {
  calculateSalaryAndCommute,
  findMunicipality2026,
  MUNICIPALITIES_2026,
  TAX_2026,
  type Municipality2026,
} from "@/lib/calculators/salary";
import { formatHours, formatPercent, formatSEK } from "@/lib/format";

export function SalaryCalculator() {
  const [grossMonthlySalary, setGrossMonthlySalary] = useState<number>(36000);
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState<string>("");
  const [municipalTaxRate, setMunicipalTaxRate] = useState<number>(TAX_2026.defaultMunicipalRate);
  const [burialFeeRate, setBurialFeeRate] = useState<number>(TAX_2026.defaultBurialFee);
  const [churchFeeRate, setChurchFeeRate] = useState<number>(TAX_2026.defaultChurchFee);
  const [includeChurchFee, setIncludeChurchFee] = useState<boolean>(false);
  const [contractHoursPerWeek, setContractHoursPerWeek] = useState<number>(40);
  const [commuteCostMonthly, setCommuteCostMonthly] = useState<number>(1050);
  const [commuteMinutesPerDay, setCommuteMinutesPerDay] = useState<number>(70);
  const [officeDaysPerWeek, setOfficeDaysPerWeek] = useState<number>(5);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kommunParam = params.get("kommun");
    const grossParam = Number(params.get("gross"));
    const taxParam = Number(params.get("tax"));
    const churchParam = params.get("church");
    const hoursParam = Number(params.get("hours"));
    const costParam = Number(params.get("cost"));
    const minsParam = Number(params.get("mins"));
    const daysParam = Number(params.get("days"));

    if (kommunParam) {
      const found = findMunicipality2026(kommunParam);
      if (found) {
        setSelectedMunicipalityName(found.name);
        setMunicipalTaxRate(found.municipalTax);
        setBurialFeeRate(found.burialFee);
        setChurchFeeRate(found.avgChurchFee);
      }
    }
    if (Number.isFinite(grossParam) && grossParam >= 0) setGrossMonthlySalary(grossParam);
    if (!kommunParam && Number.isFinite(taxParam) && taxParam >= 20 && taxParam <= 45) {
      setMunicipalTaxRate(taxParam);
    }
    if (churchParam === "1" || churchParam === "0") setIncludeChurchFee(churchParam === "1");
    if (Number.isFinite(hoursParam) && hoursParam >= 1 && hoursParam <= 80) {
      setContractHoursPerWeek(hoursParam);
    }
    if (Number.isFinite(costParam) && costParam >= 0) setCommuteCostMonthly(costParam);
    if (Number.isFinite(minsParam) && minsParam >= 0) setCommuteMinutesPerDay(minsParam);
    if (Number.isFinite(daysParam) && daysParam >= 0 && daysParam <= 7) {
      setOfficeDaysPerWeek(daysParam);
    }
  }, []);

  const handleSelectMunicipality = (m: Municipality2026 | null) => {
    if (!m) {
      setSelectedMunicipalityName("");
      setMunicipalTaxRate(TAX_2026.defaultMunicipalRate);
      setBurialFeeRate(TAX_2026.defaultBurialFee);
      setChurchFeeRate(TAX_2026.defaultChurchFee);
    } else {
      setSelectedMunicipalityName(m.name);
      setMunicipalTaxRate(m.municipalTax);
      setBurialFeeRate(m.burialFee);
      setChurchFeeRate(m.avgChurchFee);
    }
  };

  const result = useMemo(
    () =>
      calculateSalaryAndCommute({
        grossMonthlySalary,
        municipalTaxRate,
        burialFeeRate,
        churchFeeRate,
        includeChurchFee,
        contractHoursPerWeek,
        commuteCostMonthly,
        commuteMinutesPerDay,
        officeDaysPerWeek,
      }),
    [
      grossMonthlySalary,
      municipalTaxRate,
      burialFeeRate,
      churchFeeRate,
      includeChurchFee,
      contractHoursPerWeek,
      commuteCostMonthly,
      commuteMinutesPerDay,
      officeDaysPerWeek,
    ]
  );

  const shareQueryString = `gross=${grossMonthlySalary}&kommun=${encodeURIComponent(
    selectedMunicipalityName
  )}&tax=${municipalTaxRate}&church=${includeChurchFee ? "1" : "0"}&hours=${contractHoursPerWeek}&cost=${commuteCostMonthly}&mins=${commuteMinutesPerDay}&days=${officeDaysPerWeek}`;

  const summaryText = `Lön & pendling (2026${
    selectedMunicipalityName ? `, ${selectedMunicipalityName}` : ""
  }): Bruttolön ${formatSEK(result.grossMonthlySalary)} ger ca ${formatSEK(
    result.netMonthlySalary
  )} efter skatt (${formatSEK(
    result.nominalNetHourlyWage
  )}/tim). Efter pendlingskostnad och restid blir verklig timlön ${formatSEK(
    result.realHourlyWage
  )}/tim (−${formatPercent(result.hourlyWageLossPercent, 1)}).`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Inputs */}
      <div className="space-y-5 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-7 lg:col-span-6">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-base font-bold text-zinc-900">Lön, kommun &amp; pendling</h2>
        </div>

        <SliderField
          label="Månadslön före skatt (brutto)"
          value={grossMonthlySalary}
          onChange={setGrossMonthlySalary}
          min={15000}
          max={90000}
          step={500}
          unit="kr"
        />

        <MunicipalityCombobox
          municipalities={MUNICIPALITIES_2026}
          selectedName={selectedMunicipalityName}
          onSelect={handleSelectMunicipality}
        />

        <SliderField
          label="Kommunal + regional skattesats"
          value={municipalTaxRate}
          onChange={(val) => {
            setSelectedMunicipalityName("");
            setMunicipalTaxRate(val);
          }}
          min={28}
          max={36}
          step={0.05}
          unit="%"
          allowDecimals
          hint={`Inkluderar begravningsavgift på ${burialFeeRate
            .toFixed(2)
            .replace(".", ",")} %${selectedMunicipalityName ? ` för ${selectedMunicipalityName}` : ""}.`}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-stone-200 bg-[#F6F5F1] p-3">
          <input
            type="checkbox"
            checked={includeChurchFee}
            onChange={(e) => setIncludeChurchFee(e.target.checked)}
            className="h-4 w-4 rounded border-stone-400 text-[#0B4F3F] focus:ring-[#0B4F3F]"
          />
          <span className="text-sm text-stone-700">
            Medlem i Svenska kyrkan (+{churchFeeRate.toFixed(2).replace(".", ",")} % kyrkoavgift)
          </span>
        </label>

        <div className="border-t border-stone-200 pt-4">
          <SliderField
            label="Avtalad arbetstid per vecka"
            value={contractHoursPerWeek}
            onChange={setContractHoursPerWeek}
            min={10}
            max={50}
            step={1}
            unit="tim"
          />
        </div>

        <SliderField
          label="Pendlingskostnad per månad"
          value={commuteCostMonthly}
          onChange={setCommuteCostMonthly}
          min={0}
          max={8000}
          step={100}
          unit="kr"
          hint="Månadskort i kollektivtrafik eller bensin + parkering + slitage."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SliderField
            label="Restid / dag (tur & retur)"
            value={commuteMinutesPerDay}
            onChange={setCommuteMinutesPerDay}
            min={0}
            max={240}
            step={5}
            unit="min"
          />
          <SliderField
            label="Kontorsdagar / vecka"
            value={officeDaysPerWeek}
            onChange={setOfficeDaysPerWeek}
            min={0}
            max={5}
            step={1}
            unit="dagar"
          />
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-5 lg:col-span-6">
        <div className="rounded-lg border border-[#DDD9CE] border-t-4 border-t-[#0B4F3F] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            Verklig timlön (efter skatt, resekostnad &amp; restid)
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <p className="font-mono-num text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              {formatSEK(result.realHourlyWage)}/tim
            </p>
            {result.hourlyWageLoss > 1 && (
              <span className="font-mono-num rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                −{formatPercent(result.hourlyWageLossPercent, 1)} mot{" "}
                {formatSEK(result.nominalNetHourlyWage)}/tim
              </span>
            )}
          </div>

          <dl className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">
                Lön efter skatt {selectedMunicipalityName ? `(${selectedMunicipalityName})` : ""}
              </dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.netMonthlySalary)}/mån
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Effektiv inkomstskatt</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                {formatPercent(result.effectiveTaxPercent, 1)}
                {result.paysStateTax ? " (inkl. statlig skatt)" : ""}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Kvar efter pendlingskostnad</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.netAfterCommute)}/mån
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Årlig pendlingstid</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                {Math.round(result.annualCommuteHours)} tim (
                {(result.annualCommuteHours / contractHoursPerWeek).toFixed(1)} arbetsveckor)
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          <BreakdownBar
            title="Fördelning av din bruttolön"
            segments={[
              {
                label: "Kvar efter skatt & resa",
                value: Math.max(0, result.netAfterCommute),
                formattedValue: formatSEK(Math.max(0, result.netAfterCommute)),
                colorClass: "bg-[#0B4F3F]",
              },
              {
                label: "Pendlingskostnad",
                value: result.commuteCostMonthly,
                formattedValue: formatSEK(result.commuteCostMonthly),
                colorClass: "bg-amber-600",
              },
              {
                label: "Beräknad skatt",
                value: result.estimatedMonthlyTax,
                formattedValue: formatSEK(result.estimatedMonthlyTax),
                colorClass: "bg-stone-400",
              },
            ]}
          />

          <p className="text-xs leading-relaxed text-stone-600">
            Resorna kostar ca{" "}
            <strong className="font-mono-num text-zinc-900">
              {formatSEK(result.annualCommuteCost)}/år
            </strong>{" "}
            och tar{" "}
            <strong className="font-mono-num text-zinc-900">
              {formatHours(result.monthlyCommuteHours)}
            </strong>{" "}
            varje månad.
          </p>

          <ShareSummaryBar summaryText={summaryText} shareQueryString={shareQueryString} />
        </div>
      </div>
    </div>
  );
}
