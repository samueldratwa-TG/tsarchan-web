import { InsightsClient } from "../components/InsightsClient";
import { Footer } from "../components/Footer";
import { promises as fs } from "fs";
import path from "path";

async function loadData() {
  // Load daily_prices.csv and extract only first-of-month rows from Dec 2025+
  const dailyPath = path.join(process.cwd(), "public", "data", "daily_prices.csv");
  const raw = await fs.readFile(dailyPath, "utf-8");
  const lines = raw.replace(/^﻿/, "").trim().split("\n").map(l => l.replace(/\r/g, ""));
  const headers = lines[0].split(",");

  const priceColIndices = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h !== "date" && !h.endsWith("_chains"))
    .map(({ h, i }) => ({ name: h, idx: i }));

  const allRows = lines.slice(1).map(line => {
    const cells = line.split(",");
    const row: Record<string, string | number> = { date: cells[0] };
    for (const { name, idx } of priceColIndices) {
      const v = cells[idx];
      row[name] = v ? parseFloat(v) : 0;
    }
    return row;
  });

  // Keep: 1st of each month from Dec 2025 onward, plus the latest date always
  const latestDate = allRows[allRows.length - 1]?.date as string;
  const filteredRows = allRows.filter(r => {
    const d = r.date as string;
    if (d === latestDate) return true;
    const [y, m, day] = d.split("-");
    if (day !== "01") return false;
    if (y === "2025") return parseInt(m) >= 12;
    return y >= "2026";
  });

  // Product names from products.json
  const productsPath = path.join(process.cwd(), "public", "data", "products.json");
  const productsJson = JSON.parse(await fs.readFile(productsPath, "utf-8"));
  const productIds = new Set(priceColIndices.map(c => c.name));
  const productMeta = (productsJson.products as { id: string; name: string }[])
    .filter(p => productIds.has(p.id))
    .map(p => ({ id: p.id, name: p.name }));

  // Chain gaps from insights.json (static, date-independent)
  const insightsPath = path.join(process.cwd(), "public", "data", "insights.json");
  const insights = JSON.parse(await fs.readFile(insightsPath, "utf-8"));

  return { priceData: filteredRows, productMeta, chainGaps: insights.biggest_chain_gap };
}

export default async function InsightsPage() {
  const { priceData, productMeta, chainGaps } = await loadData();
  return (
    <>
      <InsightsClient priceData={priceData} productMeta={productMeta} chainGaps={chainGaps} />
      <Footer />
    </>
  );
}
