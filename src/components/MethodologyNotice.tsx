import Link from "next/link";
import { BookOpenCheck, ExternalLink } from "lucide-react";
import { PRIMARY_SOURCES, type SourceKey } from "@/lib/sources";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface MethodologyNoticeProps {
  sourceKeys: ReadonlyArray<SourceKey>;
  methodologyNote?: string;
}

export function MethodologyNotice({ sourceKeys, methodologyNote }: MethodologyNoticeProps) {
  const sources = sourceKeys.map((key) => PRIMARY_SOURCES[key]);

  return (
    <aside
      aria-label="Metod, granskning och primärkällor"
      className="mt-8 rounded-lg border border-[#DDD9CE] bg-[#FAF9F6] p-5 text-xs leading-relaxed text-stone-600"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <BookOpenCheck className="h-4 w-4 text-[#0B4F3F]" />
          <span>Metod, granskning &amp; primärkällor</span>
        </div>
        <span className="font-mono-num text-[11px] text-stone-500">
          Granskad {SITE_CONFIG.lastReviewed} &middot; {SITE_CONFIG.publisherName}
        </span>
      </div>

      {methodologyNote && <p className="mt-3 text-stone-700">{methodologyNote}</p>}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {sources.map((src) => (
          <a
            key={src.id}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#0B4F3F] hover:underline"
          >
            <span>
              {src.authority}: {src.title}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-2.5 text-[11px] text-stone-500">
        <span>
          Schabloniserade beräkningar i upplysningssyfte – kontrollera alltid slutgiltiga beslut hos
          berörd myndighet.
        </span>
        <Link href="/om" className="font-semibold text-[#0B4F3F] hover:underline">
          Läs om vår metod &amp; årliga uppdatering &rarr;
        </Link>
      </div>
    </aside>
  );
}
