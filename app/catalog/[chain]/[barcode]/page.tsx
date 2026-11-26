import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "../../../components/Footer";
import { StoreTable, type Store } from "../../../components/StoreTable";
import { PriceHistoryChart } from "../../../components/PriceHistoryChart";
import { ChainCompare, type CompareCell } from "../../../components/ChainCompare";
import { RegionCheapest } from "../../../components/RegionCheapest";
import type { Catalog } from "../../../components/CatalogTable";
import { summaryLines, fmtDate, type PriceHistory } from "@/lib/priceHistory";
import { CHAIN_NAMES, REGION_NAMES } from "@/lib/catalogNames";

// Size budget: every byte this page renders lands ~5 times per page in the deploy (HTML, its inline
// RSC payload, .rsc, _full and __PAGE__ segments) x ~1,550 pages, inside a 10 GB quota that keeps
// about a week of deploys. So the price series is fetched by the chart, the two small tables are
// client components fed compact data (the region table reuses the store list StoreTable already
// gets - React serializes a repeated object once), and the JSON-LD carries only what Google uses.

const CHAINS = Object.keys(CHAIN_NAMES);
const DATA_DIR = path.join(process.cwd(), "public", "data");

interface Entry {
  name: string;
  stats: { median: number; mean: number; min: number; max: number; stores: number; chg: number | null; chain_stores?: number };
  stores: Store[];
}
type Row = Catalog["rows"][number];

const _chainCache = new Map<string, Record<string, Entry>>();
async function loadChain(chain: string): Promise<Record<string, Entry>> {
  if (!CHAINS.includes(chain)) return {};
  if (_chainCache.has(chain)) return _chainCache.get(chain)!;
  const filePath = path.join(DATA_DIR, `catalog_stores_${chain}.json`);
  let data: Record<string, Entry> = {};
  try {
    data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    data = {};
  }
  _chainCache.set(chain, data);
  return data;
}

/** catalog.json, indexed by "<chain>|<barcode>" -> its row (the same product at every chain). */
let _catalog: Promise<{ updated: string; categories: Record<string, string>; byCell: Map<string, Row> }> | null = null;
function loadCatalog() {
  if (!_catalog) {
    _catalog = fs
      .readFile(path.join(DATA_DIR, "catalog.json"), "utf-8")
      .then((t) => {
        const c = JSON.parse(t) as Catalog;
        const byCell = new Map<string, Row>();
        for (const r of c.rows) for (const [ch, cell] of Object.entries(r.cells)) byCell.set(`${ch}|${cell.bc}`, r);
        return { updated: c.updated || "", categories: c.categories || {}, byCell };
      })
      .catch(() => ({ updated: "", categories: {}, byCell: new Map<string, Row>() }));
  }
  return _catalog;
}

/** Ids of the 37 index-basket products (public/data/basket_config.json, copied by the pipeline);
 *  a basket product's catalog row key is its id. */
let _basket: Promise<Set<string>> | null = null;
function loadBasketIds() {
  if (!_basket) {
    _basket = fs
      .readFile(path.join(DATA_DIR, "basket_config.json"), "utf-8")
      .then((t) => new Set<string>((JSON.parse(t).products || []).map((p: { id: string }) => p.id)))
      .catch(() => new Set<string>());
  }
  return _basket;
}

async function loadHistory(chain: string, bc: string): Promise<PriceHistory | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, "history", chain, `${bc}.json`), "utf-8"));
  } catch {
    return null; // no file -> the page says "no data", never a made-up line
  }
}

function decodeBc(barcode: string): string | null {
  try {
    return decodeURIComponent(barcode);
  } catch {
    return null; // malformed %-sequence (e.g. a scanner hitting a bad URL) -> treat as not found
  }
}

/** A real EAN-13 (valid check digit). Only used for a barcode several chains publish identically. */
function validEan13(bc: string): boolean {
  if (!/^\d{13}$/.test(bc)) return false;
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(bc[i]) * (i % 2 ? 3 : 1);
  return (10 - (s % 10)) % 10 === Number(bc[12]);
}

const ils = (v: number) => `₪${v.toFixed(2)}`;

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { chain: string; barcode: string }[] = [];
  for (const chain of CHAINS) {
    const data = await loadChain(chain);
    for (const barcode of Object.keys(data)) params.push({ chain, barcode });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chain: string; barcode: string }>;
}): Promise<Metadata> {
  const { chain, barcode } = await params;
  const bc = decodeBc(barcode);
  const data = await loadChain(chain);
  const entry = bc ? data[bc] : undefined;
  const chainHe = CHAIN_NAMES[chain] || chain;
  if (!entry) return { title: "מוצר לא נמצא | מדד על מחירי מזון" };
  const { updated } = await loadCatalog();
  const st = entry.stats;
  return {
    title: `${entry.name} ב${chainHe} - מחירים לפי סניף | מדד על מחירי מזון`,
    description:
      `${entry.name} ב${chainHe}: מחיר חציוני ${ils(st.median)} ב-${st.stores} סניפים (טווח ${ils(st.min)}-${ils(st.max)})` +
      `${updated ? `, נכון ל-${fmtDate(updated)}` : ""}. גרף היסטוריית מחירים, השוואה לרשתות אחרות והסניף הזול בכל אזור.`,
  };
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ chain: string; barcode: string }>;
}) {
  const { chain, barcode } = await params;
  const bc = decodeBc(barcode);
  const data = await loadChain(chain);
  const entry = bc ? data[bc] : undefined;
  if (!entry || !bc) notFound();

  const chainHe = CHAIN_NAMES[chain] || chain;
  const st = entry.stats;
  const [{ updated, categories, byCell }, basket, hist] = await Promise.all([
    loadCatalog(),
    loadBasketIds(),
    loadHistory(chain, bc),
  ]);
  const row = byCell.get(`${chain}|${bc}`);
  const catHe = row?.category ? categories[row.category] : undefined;
  const inBasket = !!row && basket.has(row.key);
  const summary = summaryLines(hist, chainHe);
  const compare: CompareCell[] | null = row
    ? Object.entries(row.cells)
        .sort(([a, x], [b, y]) => x.median - y.median || CHAINS.indexOf(a) - CHAINS.indexOf(b))
        .map(([ch, c]) => [ch, c.bc, c.median, c.min, c.max, c.stores])
    : null;

  // Structured data: exactly the prices visible in the stat cards (טווח = low/high, סניפים = count).
  // gtin13 only for a barcode several chains publish identically (a real GTIN); a chain's own code
  // (produce PLUs like 606, 7290000000135) is just its sku.
  const gtin = !!row && row.key.startsWith("bc_") && row.n_chains >= 2 && validEan13(bc);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: entry.name,
    sku: bc,
    ...(gtin ? { gtin13: bc } : {}),
    ...(catHe ? { category: catHe } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ILS",
      lowPrice: st.min,
      highPrice: st.max,
      offerCount: st.stores,
      seller: { "@type": "Organization", name: chainHe },
    },
  };

  const [d, m, y] = updated ? updated.split("-").reverse() : ["", "", ""];

  return (
    <>
      {/* w-full min-w-0: <body> is a flex column, so without them <main> sizes to its content and
          the store table's 480px min-width stretched the whole page past a phone's width. */}
      <main className="w-full min-w-0 max-w-4xl mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Link href="/catalog" className="text-blue-600 text-sm mb-4 inline-block">&rarr; חזרה לקטלוג</Link>

        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{entry.name}</h1>
          <span className="text-blue-600 font-bold text-xl">· {chainHe}</span>
        </div>
        <p className="text-gray-500 mb-2">
          מחירי המוצר בכל סניפי הרשת{updated ? ` · ${d}/${m}/${y}` : ""}
        </p>
        {(catHe || inBasket) && (
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {catHe && <span className="font-semibold text-indigo-800 bg-indigo-50 rounded px-2 py-0.5">{catHe}</span>}
            {inBasket && (
              <Link href="/methodology" className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 hover:bg-amber-100">
                אחד מ-37 מוצרי סל המדד &larr; איך מחושב המדד
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 mb-6">
          <StatCard label="חציון" value={`₪${st.median?.toFixed(2)}`} />
          <StatCard label="ממוצע" value={`₪${st.mean?.toFixed(2)}`} />
          <StatCard label="טווח" value={`${st.min?.toFixed(2)}-${st.max?.toFixed(2)}`} ltr />
          <StatCard label="סניפים" value={st.chain_stores ? `${st.stores} / ${st.chain_stores}` : `${st.stores}`} ltr />
          {/* chg: 0 = the chain median really did not move this week; null = too few stores
              (or no snapshot a week ago) to compare - only null is "no data". */}
          <StatCard
            label="שינוי שבועי"
            value={st.chg == null ? "—" : st.chg === 0 ? "ללא שינוי" : `${st.chg > 0 ? "+" : ""}${st.chg}%`}
            color={st.chg == null || st.chg === 0 ? "text-gray-600" : st.chg > 0 ? "text-red-600" : "text-green-600"}
            ltr={st.chg != null && st.chg !== 0}
            title={st.chg == null ? "אין מספיק סניפים או נתונים כדי להשוות לשבוע שעבר" : "שינוי במחיר החציוני של הרשת לעומת לפני שבוע"}
          />
        </div>

        {st.chain_stores && st.stores < st.chain_stores ? (
          <p className="text-sm text-gray-500 -mt-3 mb-5">
            {`המוצר מתפרסם ב-${st.stores} מתוך ${st.chain_stores} סניפי הרשת - לא כל סניף מוכר (או מפרסם) כל מק"ט.`}
          </p>
        ) : null}

        <section className="bg-white rounded-xl shadow p-3 sm:p-5 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">היסטוריית המחיר ב{chainHe}</h2>
          <PriceHistoryChart chain={chain} barcode={bc} />
          <div className="text-sm text-gray-700 leading-relaxed mt-3 space-y-1">
            {summary ? summary.map((l, i) => <p key={i}>{l}</p>) : <p>אין נתונים: היסטוריית המחירים של המוצר ברשת זו אינה זמינה.</p>}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 mb-5">
          <ChainCompare chain={chain} cells={compare} comparable={!!row?.comparable} updated={updated} />
          <RegionCheapest stores={entry.stores} chain={chain} />
        </div>

        <section className="bg-white rounded-xl shadow p-3 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">המחיר בכל סניף</h2>
          <StoreTable stores={entry.stores} regionNames={REGION_NAMES} chain={chain} chainName={chainHe} />
        </section>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          המחיר הוא לפי קובץ המחירים היומי של הרשת. שמות וכתובות הסניפים מבוססים על מאגר הסניפים הרשמי ועשויים להתעדכן בפיגור;
          סניף חדש ללא שם רשום מוצג כ&laquo;סניף #מזהה&raquo;.
        </p>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ label, value, color, ltr, title }: { label: string; value: string; color?: string; ltr?: boolean; title?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 min-w-[110px]" title={title}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${color || "text-gray-900"}`} dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "right" } : undefined}>{value}</div>
    </div>
  );
}
