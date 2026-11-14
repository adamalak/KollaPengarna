export interface PrimarySource {
  id: string;
  authority: string;
  title: string;
  url: string;
  scope: string;
}

export const PRIMARY_SOURCES = {
  skatteverketRegler2026: {
    id: "skatteverketRegler2026",
    authority: "Skatteverket",
    title: "Nya lagar och regler 2026 (prisbasbelopp & beloppsgränser)",
    url: "https://www.skatteverket.se/omoss/pressochmedia/nyheter/2025/nyheter/nyalagarochregler2026.5.1522bf3f19aea8075ba32a2.html",
    scope: "Prisbasbelopp 59 200 kr, förstärkt jobbskatteavdrag och skattegränser 2026.",
  },
  skatteverketSkattesatser: {
    id: "skatteverketSkattesatser",
    authority: "Skatteverket",
    title: "Öppna data: Skattesatser per kommun",
    url: "https://www7.skatteverket.se/portal/apier-och-oppna-data/utvecklarportalen/oppetdata/Skattesatser%20per%20kommun",
    scope: "Officiella skattesatser, begravningsavgift och församlingsavgifter för alla 290 kommuner.",
  },
  skatteverketStatligSkatt: {
    id: "skatteverketStatligSkatt",
    authority: "Skatteverket",
    title: "Statlig inkomstskatt, skiktgräns och brytpunkt",
    url: "https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/inkomstavtjanst/privattjansteinkomsterfaq/narskamanbetalastatliginkomstskattochhurhogarden.5.10010ec103545f243e8000166.html",
    scope: "Skiktgräns (643 000 kr beskattningsbar inkomst) och 20 % statlig skatt.",
  },
  skatteverketJobbskatteavdrag: {
    id: "skatteverketJobbskatteavdrag",
    authority: "Skatteverket",
    title: "Rättslig vägledning: Beräkning av jobbskatteavdrag (2026)",
    url: "https://www4.skatteverket.se/rattsligvagledning/edition/2026.14/2940.html",
    scope: "Lagstadgade PBB-intervall och procentsatser för jobbskatteavdraget.",
  },
  skatteverketIsk: {
    id: "skatteverketIsk",
    authority: "Skatteverket",
    title: "Skatt på investeringssparkonto (ISK) 2026",
    url: "https://www.skatteverket.se/privat/skatter/vardepapper/investeringssparkontoisk.4.5fc8c94513259a4ba1d800037851.html",
    scope: "300 000 kr skattefri grundnivå, 3,55 % schablonintäkt och 1,065 % effektiv ISK-skatt.",
  },
  riksgaldenStatslaneranta: {
    id: "riksgaldenStatslaneranta",
    authority: "Riksgälden",
    title: "Statslåneräntan (underlag för ISK-schablon)",
    url: "https://www.riksgalden.se/var-verksamhet/statslanerantan/",
    scope: "Statslåneräntan per 30 nov 2025 (2,55 %) som styr 2026 års ISK-beskattning.",
  },
  regeringenIsk: {
    id: "regeringenIsk",
    authority: "Regeringen / Finansdepartementet",
    title: "En skattefri grundnivå för sparande på ISK och kapitalförsäkring",
    url: "https://www.regeringen.se/rattsliga-dokument/lagradsremiss/2024/05/en-skattefri-grundniva-for-sparande-pa-investeringssparkonto-och-i-kapitalforsakring/",
    scope: "Regelverket bakom den skattefria grundnivån som 2026 uppgår till 300 000 kr.",
  },
  riksdagenBetankandeIsk: {
    id: "riksdagenBetankandeIsk",
    authority: "Riksdagen",
    title: "Skatteutskottets betänkande (2025/26:SkU15)",
    url: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/foretag-kapital-och-fastighet_hd01sku15/html/",
    scope: "Riksdagsbehandlingen för höjd skattefri grundnivå på ISK till 300 000 kr år 2026.",
  },
  scbKommunalskatter: {
    id: "scbKommunalskatter",
    authority: "SCB",
    title: "Totala kommunala skattesatser 2026, kommunvis (OE0101)",
    url: "https://www.scb.se/hitta-statistik/statistik-efter-amne/offentlig-ekonomi/finanser-for-den-kommunala-sektorn/kommunalskatterna/pong/tabell-och-diagram/totala-kommunala-skattesatser-2026-kommunvis/",
    scope: "Uppdelning på kommunalskatt och regionskatt 2025–2026, läns- och rikssnitt (32,38 %).",
  },
  scbInkomster: {
    id: "scbInkomster",
    authority: "SCB",
    title: "Inkomster och skatter: Sammanräknad förvärvsinkomst per kommun (HE0110)",
    url: "https://www.scb.se/hitta-statistik/statistik-efter-amne/hushallens-ekonomi/hushallens-inkomster-tillgangar-och-skulder/inkomster-och-skatter/",
    scope: "Median- och medelvärde för sammanräknad förvärvsinkomst 2024 (20–64 år) per kommun.",
  },
  csnRanta: {
    id: "csnRanta",
    authority: "CSN",
    title: "Ränta och avgifter för studielån 2026",
    url: "https://www.csn.se/betala-tillbaka/betala-tillbaka-studielan/ranta-och-avgifter.html",
    scope: "Fastställd studielåneränta 2,135 % (2026), 150 kr expeditionsavgift och annuitetsuppräkning.",
  },
  csnFribelopp: {
    id: "csnFribelopp",
    authority: "CSN",
    title: "Inkomst och fribelopp när du studerar med studiemedel",
    url: "https://www.csn.se/fragor-och-svar/hur-stor-inkomst-far-jag-ha-nar-jag-studerar-med-studiemedel.html",
    scope: "Fribeloppsgränser per halvår (114 676 kr vid 20 v heltid 2026) och 61 %-minskning.",
  },
  konsumentverketKredit: {
    id: "konsumentverketKredit",
    authority: "Konsumentverket",
    title: "Konsumentkreditlagen & beräkning av effektiv ränta",
    url: "https://www.konsumentverket.se/lagar/konsumentkreditlagen-konsument/",
    scope: "Lagstadgad metod för effektiv årsränta (APR) inklusive avi- och uppläggningsavgifter.",
  },
} as const satisfies Record<string, PrimarySource>;

export type SourceKey = keyof typeof PRIMARY_SOURCES;

export const ALL_PRIMARY_SOURCES: ReadonlyArray<PrimarySource> = Object.values(PRIMARY_SOURCES);
