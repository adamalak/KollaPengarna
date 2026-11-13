"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Municipality2026 } from "@/lib/calculators/salary";

interface MunicipalityComboboxProps {
  municipalities: ReadonlyArray<Municipality2026>;
  selectedName: string; // "" means custom / riksgenomsnitt
  onSelect: (municipality: Municipality2026 | null) => void;
}

export function MunicipalityCombobox({
  municipalities,
  selectedName,
  onSelect,
}: MunicipalityComboboxProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedName);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selectedName);
  }, [selectedName]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selectedName);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [selectedName]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === selectedName.toLowerCase()) {
      return municipalities;
    }
    const startsWith: Municipality2026[] = [];
    const contains: Municipality2026[] = [];
    for (const m of municipalities) {
      const lower = m.name.toLowerCase();
      if (lower.startsWith(q)) startsWith.push(m);
      else if (lower.includes(q)) contains.push(m);
    }
    return [...startsWith, ...contains];
  }, [municipalities, query, selectedName]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-semibold text-zinc-900">
          Välj kommun / stad (alla 290 kommuner, 2026)
        </label>
        {selectedName && (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
              setOpen(false);
            }}
            className="text-xs font-medium text-stone-500 hover:text-zinc-900 hover:underline"
          >
            Återställ till riksgenomsnitt
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder="Sök kommun (t.ex. Stockholm, Göteborg, Kiruna, Lund)..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="w-full rounded-md border border-stone-300 bg-white py-2 pr-16 pl-9 text-sm font-medium text-zinc-900 placeholder:text-stone-400 focus:border-[#0B4F3F] focus:ring-2 focus:ring-[#0B4F3F]/15 focus:outline-none"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpen(true);
              }}
              aria-label="Rensa sökning"
              className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Visa kommunlista"
            className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-zinc-700"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[#DDD9CE] bg-white py-1 shadow-lg"
        >
          <li role="option" aria-selected={selectedName === ""}>
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-stone-100"
            >
              <span className="font-medium text-zinc-800">Riksgenomsnitt Sverige</span>
              <span className="font-mono-num text-xs text-stone-500">32,38 %</span>
            </button>
          </li>

          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-stone-500">
              Ingen kommun matchade ”{query}”.
            </li>
          ) : (
            filtered.map((m) => {
              const isSelected = m.name === selectedName;
              return (
                <li key={m.name} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(m);
                      setQuery(m.name);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-[#0B4F3F]/10 font-semibold text-[#0B4F3F]"
                        : "text-zinc-800 hover:bg-stone-100"
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="font-mono-num text-xs text-stone-500">
                      {m.municipalTax.toFixed(2).replace(".", ",")} %
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
