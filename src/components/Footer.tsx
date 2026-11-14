import Link from "next/link";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { PRIMARY_SOURCES } from "@/lib/sources";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#DDD9CE] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-bold text-[#0B4F3F]">{SITE_CONFIG.domainLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {SITE_CONFIG.publisherSubtitle}. All beräkning sker lokalt i din webbläsare utan
              databas, konto eller spårningscookies.
            </p>
            <div className="mt-3 space-y-1 text-xs text-stone-600">
              <p>
                <strong>Avsändare:</strong> {SITE_CONFIG.publisherName}
              </p>
              <p>
                <strong>Kontakt:</strong>{" "}
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="font-mono-num font-medium text-[#0B4F3F] underline"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
              </p>
              <p className="font-mono-num text-[11px] text-stone-500">
                Senast granskad: {SITE_CONFIG.lastReviewed}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
              Kalkylatorer ({SITE_CONFIG.year})
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              {SITE_CONFIG.tools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="hover:text-[#0B4F3F] hover:underline">
                    {tool.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/lon-efter-skatt" className="hover:text-[#0B4F3F] hover:underline">
                  Kommunalskatt {SITE_CONFIG.year} (alla 290 kommuner)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
              Om, metod &amp; primärkällor
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/om" className="font-semibold text-[#0B4F3F] hover:underline">
                  Om {SITE_CONFIG.name} – Metod &amp; källor
                </Link>
              </li>
              <li>
                <Link href="/integritet" className="hover:text-[#0B4F3F] hover:underline">
                  Integritetspolicy &amp; ansvarsfriskrivning
                </Link>
              </li>
              <li>
                <a
                  href={PRIMARY_SOURCES.skatteverketIsk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  Skatteverket – ISK &amp; 300 000 kr gräns
                </a>
              </li>
              <li>
                <a
                  href={PRIMARY_SOURCES.scbKommunalskatter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  SCB – Kommunala skattesatser {SITE_CONFIG.year}
                </a>
              </li>
              <li>
                <a
                  href={PRIMARY_SOURCES.csnRanta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  CSN – Ränta &amp; fribelopp {SITE_CONFIG.year}
                </a>
              </li>
              <li>
                <a
                  href={PRIMARY_SOURCES.konsumentverketKredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  Konsumentverket – Effektiv ränta
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Ingen finansiell rådgivning:</strong> Resultaten är matematiska uppskattningar
            utifrån {SITE_CONFIG.year} års regelverk. Kontrollera alltid exakta beslut hos CSN,
            Skatteverket eller din långivare.
          </p>
          <p className="shrink-0 font-mono-num">
            &copy; {SITE_CONFIG.year} {SITE_CONFIG.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
