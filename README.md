# KollaPengarna – Svenska ekonomikalkylatorer (2026)

En snabb, integritetsvänlig och helt statisk webbapp med tre svenska kalkylatorer:

1. **CSN Fribelopp-kalkylator 2026** (`/csn-fribelopp`)
2. **Delbetalningsfällan / Effektiv ränta** (`/delbetalning`)
3. **Verklig lön efter skatt & pendling 2026** (`/verklig-timlon`)

All kod körs 100 % i användarens webbläsare utan databas, utan AI-API-kostnader och utan spårningscookies.

## Kom igång lokalt

```bash
npm install
npm run dev
```

Öppna `http://localhost:3000` i din webbläsare.

## Tester & produktionsbygge

```bash
npm test
npm run build
```

`npm run build` skapar en färdig statisk sajt i mappen `out/` (tack vare `output: "export"` i `next.config.ts`).

## Publicera gratis (0 kr/mån)

1. Ladda upp koden till ett GitHub-repo (privat eller publikt).
2. Koppla repot till **Vercel**, **Cloudflare Pages** eller **Netlify** (alla har gratisnivåer).
3. Sätt miljövariabeln `NEXT_PUBLIC_SITE_URL` till din riktiga webbadress (t.ex. `https://kollapengar.se`) så att `sitemap.xml` och `robots.txt` pekar rätt.
4. Registrera din `sitemap.xml` i **Google Search Console** (gratis) så att Google hittar alla undersidor.

## Årlig uppdatering (5 min/år)

- Ändra årtal och domän i `src/lib/siteConfig.ts`.
- Uppdatera CSN:s belopp i `src/lib/calculators/csn.ts`.
- Uppdatera prisbasbelopp, skiktgräns och genomsnittlig kommunalskatt i `src/lib/calculators/salary.ts`.
