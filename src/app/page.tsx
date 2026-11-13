import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

const BENCHMARKS_2026 = [
  { label: "CSN fribelopp (20 v heltid)", value: "114 676 kr / halvår", href: "/csn-fribelopp" },
  { label: "CSN-ränta", value: "2,135 %", href: "/csn-aterbetalning" },
  { label: "Genomsnittlig kommunalskatt", value: "32,38 % (290 kommuner)", href: "/verklig-timlon" },
  { label: "Prisbasbelopp", value: "59 200 kr", href: "/verklig-timlon" },
  { label: "Skattefri ISK-grundnivå", value: "300 000 kr (1,065 % över)", href: "/ranta-pa-ranta" },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Editorial Header */}
      <section className="border-b border-[#DDD9CE] pb-8">
        <p className="font-mono-num text-xs font-medium tracking-wider text-[#0B4F3F] uppercase">
          Oberoende kalkylatorer &middot; Sverige {SITE_CONFIG.year}
        </p>
        <h1 className="mt-2.5 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Räkna ut vad lön, CSN, krediter och sparande faktiskt ger i handen.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
          Fem konkreta verktyg byggda på {SITE_CONFIG.year} års officiella svenska regler och
          skattesatser. Ingen inloggning, inga cookies och all beräkning sker direkt på din enhet.
        </p>
      </section>

      {/* Structured Tool Directory */}
      <section aria-label="Kalkylatorer" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
            Välj kalkylator
          </h2>
          <span className="font-mono-num text-xs text-stone-500">
            {SITE_CONFIG.tools.length} verktyg
          </span>
        </div>

        <div className="divide-y divide-[#DDD9CE] rounded-lg border border-[#DDD9CE] bg-white">
          {SITE_CONFIG.tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group grid items-center gap-4 px-5 py-5 transition-colors hover:bg-[#FAF9F6] sm:grid-cols-12 sm:px-6"
            >
              <div className="flex items-baseline gap-3 sm:col-span-5">
                <span className="font-mono-num text-xs font-medium text-stone-400">
                  {tool.num}
                </span>
                <div>
                  <span className="block text-[11px] font-semibold tracking-wider text-[#0B4F3F] uppercase">
                    {tool.category}
                  </span>
                  <span className="text-base font-bold text-zinc-900 group-hover:text-[#0B4F3F] sm:text-lg">
                    {tool.title}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-stone-600 sm:col-span-4">
                {tool.description}
              </p>

              <div className="flex items-center justify-between gap-4 sm:col-span-3 sm:justify-end">
                <div className="sm:text-right">
                  <span className="block text-[11px] text-stone-500">{tool.metricLabel}</span>
                  <span className="font-mono-num text-sm font-semibold text-zinc-900">
                    {tool.metricValue}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0B4F3F]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2026 Quick Reference Table */}
      <section className="mt-12 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-editorial text-2xl font-semibold tracking-tight text-zinc-900">
            Viktiga svenska nyckeltal {SITE_CONFIG.year}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Samtliga belopp är hämtade från Skatteverket, CSN och SCB för inkomståret{" "}
            {SITE_CONFIG.year}. Klicka på en rad för att öppna tillhörande kalkylator.
          </p>
        </div>

        <div className="rounded-lg border border-[#DDD9CE] bg-white lg:col-span-7">
          <dl className="divide-y divide-stone-200 text-sm">
            {BENCHMARKS_2026.map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAF9F6]"
              >
                <dt className="font-medium text-stone-700">{row.label}</dt>
                <dd className="font-mono-num font-semibold text-zinc-900">{row.value}</dd>
              </Link>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
