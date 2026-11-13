"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";

interface ShareSummaryBarProps {
  summaryText: string;
  shareQueryString: string;
}

export function ShareSummaryBar({ summaryText, shareQueryString }: ShareSummaryBarProps) {
  const [copiedType, setCopiedType] = useState<"text" | "link" | null>(null);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedType("text");
      setTimeout(() => setCopiedType(null), 2200);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}?${shareQueryString}`;
      await navigator.clipboard.writeText(url);
      setCopiedType("link");
      setTimeout(() => setCopiedType(null), 2200);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <button
        type="button"
        onClick={copyText}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-[#F6F5F1] px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-stone-200/70"
      >
        {copiedType === "text" ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#0B4F3F]" />
            <span className="text-[#0B4F3F]">Sammanfattning kopierad</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-stone-500" />
            <span>Kopiera resultat</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-[#F6F5F1] px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-stone-200/70"
      >
        {copiedType === "link" ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#0B4F3F]" />
            <span className="text-[#0B4F3F]">Länk kopierad</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5 text-stone-500" />
            <span>Dela länk med siffror</span>
          </>
        )}
      </button>
    </div>
  );
}
