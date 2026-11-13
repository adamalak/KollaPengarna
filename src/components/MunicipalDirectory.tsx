"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPercent } from "@/lib/format";
import type { RankedMunicipality } from "@/lib/municipalSeo";

interface MunicipalDirectoryProps {
  municipalities: ReadonlyArray<RankedMunicipality>;
}

type SortMode = "alpha" | "lowest" | "highest";

export function MunicipalDirectory({ municipalities }: MunicipalDirectoryProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("lowest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? municipalities.filter((m) => m.name.toLowerCase().includes(q))
      : [...municipalities];

    if (sortMode === "lowest") {
      return [...base].sort((a, b) => a.taxRankLowestFirst - b.taxRankLowestFirst);
    }
    if (sortMode === "highest") {
      return [...base].sort((a, b) => b.taxRankLowestFirst - a.taxRankLowestFirst);
    }
    return [...base].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  }, [municipalities, query, sortMode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrera kommun (t.ex. Uppsala, Lund, Luleå)..."
            aria-label="Filtrera kommun"
            className="w-full rounded-md border border-stone-300 bg-white py-2 pr-3 pl-9 text-sm text-zinc-900 placeholder:text-stone-400 focus:border-[#0B4F3F] focus:ring-2 focus:ring-[#0B4F3F]/15 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: "lowest", label: "Lägst skatt först" },
              { id: "highest", label: "Högst skatt först" },
              { id: "alpha", label: "A–Ö" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSortMode(tab.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                sortMode === tab.id
                  ? "border-[#0B4F3F] bg-[#0B4F3F] text-white"
                  : "border-stone-300 bg-white text-zinc-700 hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#DDD9CE] bg-white">
        <table className="w-full min-w-[540px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-[#FAF9F6] text-xs font-semibold tracking-wider text-stone-500 uppercase">
              <th className="px-4 py-3">Plats</th>
              <th className="px-4 py-3">Kommun</th>
              <th className="px-4 py-3">Kommunalskatt</th>
              <th className="px-4 py-3">Begravningsavgift</th>
              <th className="px-4 py-3 text-right">Lönetabell</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filtered.map((m) => (
              <tr key={m.slug} className="hover:bg-[#FAF9F6]">
                <td className="font-mono-num px-4 py-2.5 text-xs text-stone-500">
                  #{m.taxRankLowestFirst}
                </td>
                <td className="px-4 py-2.5 font-semibold text-zinc-900">
                  <Link href={`/lon-efter-skatt/${m.slug}`} className="hover:text-[#0B4F3F] hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="font-mono-num px-4 py-2.5 font-medium text-zinc-900">
                  {formatPercent(m.municipalTax, 2)}
                </td>
                <td className="font-mono-num px-4 py-2.5 text-stone-600">
                  {formatPercent(m.burialFee, 3)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/lon-efter-skatt/${m.slug}`}
                    className="text-xs font-semibold text-[#0B4F3F] hover:underline"
                  >
                    Se nettolön &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
