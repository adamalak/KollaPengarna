import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/siteConfig";

export const metadata: Metadata = buildPageMetadata({
  title: "Integritetspolicy & Ansvarsfriskrivning",
  description: `Läs om hur ${SITE_CONFIG.name} hanterar integritet, GDPR och juridisk ansvarsfriskrivning.`,
  path: "/integritet",
});

export default function IntegritetPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="rounded-lg border border-[#DDD9CE] bg-white p-6 sm:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Integritetspolicy &amp; Ansvarsfriskrivning
        </h1>
        <p className="font-mono-num mt-2 text-xs text-stone-500">
          Senast uppdaterad: {SITE_CONFIG.year}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-700">
          <section>
            <h2 className="text-base font-bold text-zinc-900">1. Vi sparar ingen data om dig</h2>
            <p className="mt-2">
              {SITE_CONFIG.name} är byggd för att vara helt privat. Alla siffror du skriver in – som
              lön, studiemedel, pendlingskostnader eller kreditbelopp – behandlas uteslutande lokalt i
              din egen webbläsare. Ingenting skickas till eller lagras på någon server.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900">2. Inga spårningscookies</h2>
            <p className="mt-2">
              Webbplatsen använder inga cookies för marknadsföring eller användarspårning. Om
              webbplatsen i framtiden lägger till besöksanalys eller annonsering införs en tydlig
              samtyckesbanner enligt GDPR innan några cookies sätts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900">3. Delade länkar</h2>
            <p className="mt-2">
              Om du klickar på ”Dela länk med siffror” läggs kalkylatorns inställningar i
              webbadressen. Dela därför endast sådana länkar med personer du vill ska se just de
              siffrorna.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-zinc-900">
              4. Ingen finansiell eller juridisk rådgivning
            </h2>
            <p className="mt-2">
              Alla resultat på {SITE_CONFIG.name} är matematiska uppskattningar för allmän
              information och utgör <strong>inte</strong> finansiell rådgivning, skatterådgivning
              eller kreditförmedling. Kontrollera alltid exakta besked hos{" "}
              <a
                href="https://www.skatteverket.se"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0B4F3F] underline"
              >
                Skatteverket
              </a>
              ,{" "}
              <a
                href="https://www.csn.se"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0B4F3F] underline"
              >
                CSN
              </a>{" "}
              och respektive kreditgivare.
            </p>
          </section>

          <div className="border-t border-stone-200 pt-6">
            <Link href="/" className="text-sm font-semibold text-[#0B4F3F] hover:underline">
              &larr; Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
