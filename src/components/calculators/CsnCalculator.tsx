"use client";

import { useEffect, useMemo, useState } from "react";
import { BreakdownBar } from "@/components/BreakdownBar";
import { ShareSummaryBar } from "@/components/ShareSummaryBar";
import { SliderField } from "@/components/SliderField";
import { calculateCsn, type StudyPace } from "@/lib/calculators/csn";
import { formatSEK } from "@/lib/format";

const PACE_OPTIONS: ReadonlyArray<{ pace: StudyPace; label: string }> = [
  { pace: 100, label: "100 % Heltid" },
  { pace: 75, label: "75 % Deltid" },
  { pace: 50, label: "50 % Halvtid" },
];

export function CsnCalculator() {
  const [studyPace, setStudyPace] = useState<StudyPace>(100);
  const [weeks, setWeeks] = useState<number>(20);
  const [expectedIncomeHalfYear, setExpectedIncomeHalfYear] = useState<number>(95000);
  const [includeLoan, setIncludeLoan] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paceParam = Number(params.get("pace"));
    const weeksParam = Number(params.get("weeks"));
    const incomeParam = Number(params.get("income"));
    const loanParam = params.get("loan");

    if (paceParam === 100 || paceParam === 75 || paceParam === 50) setStudyPace(paceParam);
    if (Number.isFinite(weeksParam) && weeksParam >= 1 && weeksParam <= 26) {
      setWeeks(Math.round(weeksParam));
    }
    if (Number.isFinite(incomeParam) && incomeParam >= 0 && incomeParam <= 2_000_000) {
      setExpectedIncomeHalfYear(incomeParam);
    }
    if (loanParam === "0" || loanParam === "1") setIncludeLoan(loanParam === "1");
  }, []);

  const result = useMemo(
    () =>
      calculateCsn({
        studyPace,
        weeks,
        expectedIncomeHalfYear,
        includeLoan,
      }),
    [studyPace, weeks, expectedIncomeHalfYear, includeLoan]
  );

  const shareQueryString = `pace=${studyPace}&weeks=${weeks}&income=${expectedIncomeHalfYear}&loan=${
    includeLoan ? "1" : "0"
  }`;

  const summaryText = result.isOverLimit
    ? `CSN-koll (2026): Vid ${studyPace} % i ${weeks} veckor är fribeloppet ${formatSEK(
        result.fribelopp
      )}/halvår. Med ${formatSEK(expectedIncomeHalfYear)} i inkomst dras studiemedlet ner med ${formatSEK(
        result.totalReduction
      )}.`
    : `CSN-koll (2026): Vid ${studyPace} % i ${weeks} veckor är fribeloppet ${formatSEK(
        result.fribelopp
      )}/halvår. Med ${formatSEK(expectedIncomeHalfYear)} i inkomst har jag ${formatSEK(
        result.remainingMargin
      )} kvar i marginal.`;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left: Inputs */}
      <div className="space-y-6 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-7 lg:col-span-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <h2 className="text-base font-bold text-zinc-900">Studier &amp; inkomst</h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStudyPace(100);
                setWeeks(20);
                setExpectedIncomeHalfYear(95000);
                setIncludeLoan(true);
              }}
              className="rounded border border-stone-300 bg-[#F6F5F1] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-200"
            >
              Normal termin (20 v)
            </button>
            <button
              type="button"
              onClick={() => {
                setStudyPace(100);
                setWeeks(20);
                setExpectedIncomeHalfYear(140000);
                setIncludeLoan(true);
              }}
              className="rounded border border-stone-300 bg-[#F6F5F1] px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-200"
            >
              Mycket extrajobb
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-semibold text-zinc-900">Studietakt</span>
          <div className="grid grid-cols-3 gap-2">
            {PACE_OPTIONS.map((opt) => {
              const selected = studyPace === opt.pace;
              return (
                <button
                  key={opt.pace}
                  type="button"
                  onClick={() => setStudyPace(opt.pace)}
                  className={`rounded-md border px-2.5 py-2 text-xs font-semibold transition sm:text-sm ${
                    selected
                      ? "border-[#0B4F3F] bg-[#0B4F3F] text-white"
                      : "border-stone-300 bg-white text-zinc-800 hover:bg-stone-100"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <SliderField
          label="Veckor med CSN under kalenderhalvåret"
          value={weeks}
          onChange={(v) => setWeeks(Math.min(26, Math.max(1, Math.round(v))))}
          min={1}
          max={26}
          step={1}
          unit="v"
          hint="Ett kalenderhalvår är 1 jan–30 jun eller 1 jul–31 dec. En normal termin är 20 veckor."
        />

        <SliderField
          label="Beräknad inkomst före skatt (halvåret)"
          value={expectedIncomeHalfYear}
          onChange={setExpectedIncomeHalfYear}
          min={0}
          max={300000}
          step={1000}
          unit="kr"
          hint="Lön före skatt och ev. skattepliktig kapitalinkomst under halvåret. CSN räknas inte."
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 bg-[#F6F5F1] p-3.5">
          <input
            type="checkbox"
            checked={includeLoan}
            onChange={(e) => setIncludeLoan(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[#0B4F3F] focus:ring-[#0B4F3F]"
          />
          <span className="text-sm text-stone-700">
            <span className="font-semibold text-zinc-900">Jag tar även studielån</span>
            <span className="mt-0.5 block text-xs text-stone-500">
              Vid överskott minskar CSN lånet först, och först därefter bidraget.
            </span>
          </span>
        </label>
      </div>

      {/* Right: Ledger Results */}
      <div className="space-y-5 lg:col-span-6">
        <div
          className={`rounded-lg border border-[#DDD9CE] border-t-4 bg-white p-5 sm:p-7 ${
            result.isOverLimit ? "border-t-red-700" : "border-t-[#0B4F3F]"
          }`}
        >
          <p
            className={`text-xs font-semibold tracking-wider uppercase ${
              result.isOverLimit ? "text-red-700" : "text-[#0B4F3F]"
            }`}
          >
            {result.isOverLimit ? "Över fribeloppet" : "Inom fribeloppet"}
          </p>
          <p className="font-mono-num mt-1.5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {result.isOverLimit
              ? `−${formatSEK(result.totalReduction)}`
              : formatSEK(result.remainingMargin)}
          </p>
          <p className="mt-1.5 text-sm text-stone-600">
            {result.isOverLimit
              ? `Beräknat avdrag på CSN (61 % av ${formatSEK(result.excessIncome)} över gränsen).`
              : `Kvar i marginal före avdrag (ditt fribelopp är ${formatSEK(result.fribelopp)}).`}
          </p>

          <dl className="mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Fribelopp 2026 (halvår)</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.fribelopp)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">Motsvarar i snitt per månad</dt>
              <dd className="font-mono-num font-medium text-zinc-900">
                ca {formatSEK(result.monthlyAverageLimit)}/mån
              </dd>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-stone-600">CSN kvar att få ut</dt>
              <dd className="font-mono-num font-semibold text-zinc-900">
                {formatSEK(result.remainingAid)}{" "}
                <span className="text-xs font-normal text-stone-500">
                  av {formatSEK(result.totalAid)}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-lg border border-[#DDD9CE] bg-white p-5 sm:p-6">
          <BreakdownBar
            title="Fördelning av ditt studiemedel"
            segments={[
              {
                label: "Kvarstående CSN",
                value: result.remainingAid,
                formattedValue: formatSEK(result.remainingAid),
                colorClass: "bg-[#0B4F3F]",
              },
              {
                label: "Minskat lån",
                value: result.loanReduction,
                formattedValue: formatSEK(result.loanReduction),
                colorClass: "bg-amber-600",
              },
              {
                label: "Minskat bidrag",
                value: result.grantReduction,
                formattedValue: formatSEK(result.grantReduction),
                colorClass: "bg-red-700",
              },
            ]}
          />

          {result.isOverLimit && (
            <p className="border-l-2 border-amber-600 bg-amber-50/70 py-2 pr-3 pl-3 text-xs leading-relaxed text-amber-950">
              <strong>Marginaleffekt:</strong> På inkomster över fribeloppet betalar du både
              inkomstskatt (~30 %) och tappar 61 öre per krona i CSN.
            </p>
          )}

          <ShareSummaryBar summaryText={summaryText} shareQueryString={shareQueryString} />
        </div>
      </div>
    </div>
  );
}
