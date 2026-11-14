import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SCB_TAX_URL =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/OE/OE0101/Kommunalskatter2000";
const SCB_INCOME_URL =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/HE/HE0110/HE0110A/SamForvInk1";

const MUNICIPALITIES_PATH = path.resolve(
  process.cwd(),
  "src",
  "lib",
  "data",
  "municipalities2026.json"
);
const BENCHMARKS_PATH = path.resolve(
  process.cwd(),
  "src",
  "lib",
  "data",
  "scbBenchmarks2026.json"
);

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`SCB API error ${response.status} for ${url}`);
  }
  return response.json();
}

const existingMunicipalities = JSON.parse(readFileSync(MUNICIPALITIES_PATH, "utf8"));
const existingByName = new Map(existingMunicipalities.map((m) => [m.name, m]));

const [taxMeta, taxData, incomeData] = await Promise.all([
  fetchJson(SCB_TAX_URL),
  fetchJson(SCB_TAX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: [
        { code: "Region", selection: { filter: "all", values: ["*"] } },
        { code: "ContentsCode", selection: { filter: "item", values: ["OE0101D1", "OE0101D2", "OE0101D3"] } },
        { code: "Tid", selection: { filter: "item", values: ["2025", "2026"] } },
      ],
      response: { format: "json" },
    }),
  }),
  fetchJson(SCB_INCOME_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: [
        { code: "Region", selection: { filter: "all", values: ["*"] } },
        { code: "Kon", selection: { filter: "item", values: ["1+2"] } },
        { code: "Alder", selection: { filter: "item", values: ["20-64"] } },
        { code: "Inkomstklass", selection: { filter: "item", values: ["TOT"] } },
        { code: "ContentsCode", selection: { filter: "item", values: ["HE0110J7", "HE0110J8"] } },
        { code: "Tid", selection: { filter: "item", values: ["2024"] } },
      ],
      response: { format: "json" },
    }),
  }),
]);

const regionVar = taxMeta.variables.find((v) => v.code === "Region");
if (!regionVar) {
  throw new Error("Kunde inte läsa Region-variabeln från SCB OE0101");
}

const regionNameByCode = new Map(
  regionVar.values.map((code, idx) => [code, regionVar.valueTexts[idx]])
);

const taxRowMap = new Map();
for (const row of taxData.data) {
  const [regionCode, year] = row.key;
  taxRowMap.set(`${regionCode}:${year}`, {
    total: Number(row.values[0]),
    municipality: Number(row.values[1]),
    region: Number(row.values[2]),
  });
}

const incomeRowMap = new Map();
for (const row of incomeData.data) {
  const [regionCode] = row.key;
  incomeRowMap.set(regionCode, {
    meanAnnual: Math.round(Number(row.values[0]) * 1000),
    medianAnnual: Math.round(Number(row.values[1]) * 1000),
  });
}

// Build national + 21 county benchmarks
const countyCodes = regionVar.values.filter((code) => code.length === 2 && code !== "00");
const nationalTax2026 = taxRowMap.get("00:2026");
const nationalTax2025 = taxRowMap.get("00:2025");
const nationalIncome2024 = incomeRowMap.get("00");

if (!nationalTax2026 || !nationalTax2025 || !nationalIncome2024) {
  throw new Error("Saknar rikssiffror från SCB");
}

const counties = {};
for (const countyCode of countyCodes) {
  const countyName = regionNameByCode.get(countyCode);
  const c26 = taxRowMap.get(`${countyCode}:2026`);
  const c25 = taxRowMap.get(`${countyCode}:2025`);
  const cInc = incomeRowMap.get(countyCode);
  if (!countyName || !c26 || !c25 || !cInc) {
    throw new Error(`Saknar länsdata från SCB för ${countyCode}`);
  }
  counties[countyCode] = {
    code: countyCode,
    name: countyName,
    municipalTax2026: c26.total,
    municipalityPartTax2026: c26.municipality,
    regionPartTax2026: c26.region,
    municipalTax2025: c25.total,
    medianIncome2024Annual: cInc.medianAnnual,
    meanIncome2024Annual: cInc.meanAnnual,
  };
}

// Map SCB 4-digit municipality codes back into existing ordering
const scbCodeByMuniName = new Map();
for (const code of regionVar.values) {
  if (code.length === 4) {
    scbCodeByMuniName.set(regionNameByCode.get(code), code);
  }
}

if (scbCodeByMuniName.size !== 290) {
  throw new Error(`Förväntade 290 kommuner från SCB, fick ${scbCodeByMuniName.size}`);
}

let componentMismatchCount = 0;
const enrichedMunicipalities = existingMunicipalities.map((m) => {
  const scbCode = scbCodeByMuniName.get(m.name);
  if (!scbCode) {
    throw new Error(`Kunde inte matcha kommunnamn i SCB: ${m.name}`);
  }

  const countyCode = scbCode.slice(0, 2);
  const county = counties[countyCode];
  if (!county) {
    throw new Error(`Saknar län ${countyCode} för ${m.name}`);
  }

  const t26 = taxRowMap.get(`${scbCode}:2026`);
  const t25 = taxRowMap.get(`${scbCode}:2025`);
  const inc = incomeRowMap.get(scbCode);

  if (!t26 || !t25 || !inc) {
    throw new Error(`Ofullständig SCB-data för ${m.name} (${scbCode})`);
  }

  if (Math.abs(t26.total - m.municipalTax) > 0.001) {
    throw new Error(
      `Skatteskillnad för ${m.name}: befintlig=${m.municipalTax}, SCB=${t26.total}`
    );
  }

  if (Math.abs(t26.municipality + t26.region - t26.total) > 0.02) {
    componentMismatchCount += 1;
  }

  const verifiedExisting = existingByName.get(m.name);
  return {
    name: verifiedExisting.name,
    scbCode,
    countyCode,
    countyName: county.name,
    municipalTax: t26.total,
    municipalityPartTax: t26.municipality,
    regionPartTax: t26.region,
    municipalTax2025: t25.total,
    municipalityPartTax2025: t25.municipality,
    regionPartTax2025: t25.region,
    burialFee: verifiedExisting.burialFee,
    avgChurchFee: verifiedExisting.avgChurchFee,
    medianIncome2024Annual: inc.medianAnnual,
    meanIncome2024Annual: inc.meanAnnual,
  };
});

const benchmarks = {
  sourceTaxTable: "SCB OE0101 / Kommunalskatter2000 (2025–2026)",
  sourceIncomeTable: "SCB HE0110A / SamForvInk1 (2024, 20–64 år, totalt)",
  fetchedAt: new Date().toISOString().slice(0, 10),
  national: {
    code: "00",
    name: "Riket",
    municipalTax2026: nationalTax2026.total,
    municipalityPartTax2026: nationalTax2026.municipality,
    regionPartTax2026: nationalTax2026.region,
    municipalTax2025: nationalTax2025.total,
    medianIncome2024Annual: nationalIncome2024.medianAnnual,
    meanIncome2024Annual: nationalIncome2024.meanAnnual,
  },
  counties,
};

writeFileSync(
  MUNICIPALITIES_PATH,
  `${JSON.stringify(enrichedMunicipalities, null, 2)}\n`,
  "utf8"
);
writeFileSync(
  BENCHMARKS_PATH,
  `${JSON.stringify(benchmarks, null, 2)}\n`,
  "utf8"
);

console.log(
  `Uppdaterade ${enrichedMunicipalities.length} kommuner + ${Object.keys(counties).length} län.`
);
console.log(`Komponentavvikelser (>0.02): ${componentMismatchCount}`);
