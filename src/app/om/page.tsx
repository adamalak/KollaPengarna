import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Mail, ShieldCheck, RefreshCw } from "lucide-react";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { ALL_PRIMARY_SOURCES } from "@/lib/sources";

export const metadata: Metadata = buildPageMetadata({
  title: `Om ${SITE_CONFIG.name} – Metod, granskning & primärkällor`,
  description: `Läs om ${SITE_CONFIG.domainLabel}: vilka som driver sajten, hur våra siffror granskas och uppdateras inför varje år, kontaktväg samt alla officiella primärkällor.`,
  path: "/om",
});

export default function OmPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Hem", path: "/" },
    { name: "Om & primärkällor", path: "/om" },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Brödsmulor" className="mb-4 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-[#0B4F3F] hover:underline">
          Hem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Om &amp; källor</span>
      </nav>

      <div className="space-y-8">
        <header className="rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-8">
          <p className="font-mono-num text-xs font-semibold tracking-wider text-[#0B4F3F] uppercase">
            Transparens &amp; metodik &middot; Senast granskad {SITE_CONFIG.lastReviewed}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Om {SITE_CONFIG.domainLabel} – Metod, granskning &amp; primärkällor
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-700 sm:text-base">
            <strong>{SITE_CONFIG.domainLabel}</strong> drivs av{" "}
            <strong>{SITE_CONFIG.publisherName}</strong> ({SITE_CONFIG.publisherSubtitle}). Målet
            är att ge snabba, genomskinliga svenska räkneverktyg för lön, skatt, CSN, sparande och
            delbetalningar – utan kontokrav, dolda spårningscookies eller affiliatelänkar.
          </p>

          <div className="mt-5 grid gap-4 border-t border-stone-200 pt-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0B4F3F]" />
              <div className="text-sm">
                <p className="font-semibold text-zinc-900">Ansvarig avsändare &amp; kontakt</p>
                <p className="text-stone-600">
                  {SITE_CONFIG.publisherName} &middot; {SITE_CONFIG.publisherSubtitle}
                </p>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="font-mono-num mt-1 inline-block text-xs font-semibold text-[#0B4F3F] underline"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0B4F3F]" />
              <div className="text-sm">
                <p className="font-semibold text-zinc-900">Oberoende &amp; integritet</p>
                <p className="text-stone-600">
                  Alla beräkningar sker 100 % lokalt i din webbläsare. Vi tar inte emot ersättning
                  från banker eller kreditinstitut.{" "}
                  <Link href="/integritet" className="font-medium text-[#0B4F3F] underline">
                    Läs integritetspolicy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Review & Update Methodology */}
        <section className="rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[#0B4F3F]" />
            <h2 className="font-editorial text-xl font-semibold text-zinc-900">
              Så granskas och uppdateras våra siffror
            </h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            Samtliga beloppsgränser, skattesatser och formler stäms av direkt mot offentliga
            myndigheters öppna data och rättslig vägledning innan varje inkomstår. Vid upptäckta
            regeländringar eller läsarpåpekanden kontrollerar vi siffrorna mot primärkällan och
            justerar beräkningsmotorns automatiska enhetstester innan ny publicering.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-stone-200 bg-[#FAF9F6] p-4">
              <p className="font-mono-num text-xs font-semibold text-[#0B4F3F] uppercase">
                1. Slutet av november
              </p>
              <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                Statslåneränta &amp; ISK
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                När Riksgälden fastställer statslåneräntan per 30 november räknar vi om nästa års
                schablonintäkt och effektiva ISK-skatt tillsammans med beslutad grundnivå.
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-[#FAF9F6] p-4">
              <p className="font-mono-num text-xs font-semibold text-[#0B4F3F] uppercase">
                2. December
              </p>
              <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                Skattesatser, CSN &amp; basbelopp
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                Kommunala och regionala skattesatser för samtliga 290 kommuner hämtas från SCB
                (OE0101) och Skatteverket, tillsammans med nytt prisbasbelopp, skiktgräns och CSN:s
                beslutade ränta och fribelopp.
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-[#FAF9F6] p-4">
              <p className="font-mono-num text-xs font-semibold text-[#0B4F3F] uppercase">
                3. Januari–februari
              </p>
              <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                Inkomststatistik &amp; tester
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                När SCB publicerar uppdaterad årsstatistik för sammanräknad förvärvsinkomst per
                kommun (HE0110) uppdateras kommunsidornas referenstal och verifieras via tester.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm leading-relaxed text-stone-700">
            <h3 className="font-bold text-zinc-900">Beräkningsmodeller i korthet</h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Lön efter skatt &amp; 290 kommunsidor:</strong> Utgår från 2026 års
                prisbasbelopp (59 200 kr), lagstadgade PBB-intervall för grundavdrag och
                jobbskatteavdrag (under 66 år), public service-avgift (1 % upp till 1 285 kr/år),
                statlig inkomstskatt (20 % över 643 000 kr beskattningsbar inkomst) samt kommunens
                kommunal-, region- och begravningsavgift (med valfri kyrkoavgift).
              </li>
              <li>
                <strong>Ränta på ränta &amp; ISK:</strong> Månadsvis sammansatt avkastning minus
                årlig fondavgift. För 2026 är de första 300 000 kr skattefria per person och på
                överskjutande belopp dras 1,065 % schablonskatt (30 % skatt på 3,55 %
                schablonintäkt).
              </li>
              <li>
                <strong>CSN Fribelopp &amp; Återbetalning:</strong> Fribeloppet beräknas från CSN:s
                ankarpunkter (5–26 veckor vid 100 %, 75 % och 50 % studietakt, där 20 veckor heltid
                ger 114 676 kr) med 61 % nedsättning på överskjutande bruttoinkomst. Återbetalning
                modelleras som uppräknad annuitet med 2026 års ränta (2,135 %), 2 % årlig
                uppräkning och 150 kr expeditionsavgift.
              </li>
              <li>
                <strong>Delbetalning &amp; effektiv ränta:</strong> Numerisk lösning (bisektion) av
                konsumentkreditlagens nuvärdesekvation inklusive uppläggningsavgift och månatlig
                aviavgift.
              </li>
            </ul>
          </div>
        </section>

        {/* Clickable Primary Sources */}
        <section className="rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-8">
          <h2 className="font-editorial text-xl font-semibold text-zinc-900">
            Verifierade primärkällor ({SITE_CONFIG.year})
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Alla kalkylatorer och kommunala skatte- och inkomstsidor bygger på nedanstående
            officiella källor från svenska myndigheter, regeringen och riksdagen:
          </p>

          <div className="mt-5 divide-y divide-stone-200 rounded-lg border border-stone-200">
            {ALL_PRIMARY_SOURCES.map((source) => (
              <div
                key={source.id}
                className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <span className="font-mono-num text-[11px] font-semibold tracking-wider text-[#0B4F3F] uppercase">
                    {source.authority}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900">{source.title}</h3>
                  <p className="mt-0.5 text-xs text-stone-600">{source.scope}</p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-stone-300 bg-[#FAF9F6] px-3 py-1.5 text-xs font-semibold text-[#0B4F3F] transition hover:border-[#0B4F3F]"
                >
                  <span>Öppna källa</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
