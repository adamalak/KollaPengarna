import Link from "next/link";
import { SITE_CONFIG } from "@/lib/siteConfig";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#DDD9CE] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-bold text-[#0B4F3F]">{SITE_CONFIG.domainLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Oberoende svenska kalkylatorer för lön, skatt, CSN och sparande. All beräkning sker
              lokalt i din webbläsare utan databas eller spårning.
            </p>
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
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
              Källor &amp; trygghet
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/integritet" className="hover:text-[#0B4F3F] hover:underline">
                  Integritetspolicy &amp; ansvarsfriskrivning
                </Link>
              </li>
              <li>
                <a
                  href="https://www.csn.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  CSN.se – Studiemedel &amp; ränta
                </a>
              </li>
              <li>
                <a
                  href="https://www.skatteverket.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  Skatteverket.se – Skattesatser &amp; ISK
                </a>
              </li>
              <li>
                <a
                  href="https://www.konsumentverket.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0B4F3F] hover:underline"
                >
                  Konsumentverket.se – Konsumentkrediter
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
