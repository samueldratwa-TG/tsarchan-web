import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "../../../components/Footer";
import { StoreTable, type Store } from "../../../components/StoreTable";

const CHAIN_NAMES: Record<string, string> = {
  shufersal: "שופרסל", rami_levy: "רמי לוי", yohananof: "יוחננוף", victory: "ויקטורי",
  osher_ad: "אושר עד", hazi_hinam: "חצי חינם", tiv_taam: "טיב טעם", yayno_bitan_and_carrefour: "קרפור",
};
const REGION_NAMES: Record<string, string> = {
  center: "מרכז", bnei_brak: "בני ברק", north: "צפון", south: "דרום", jerusalem: "ירושלים",
};
const CHAINS = Object.keys(CHAIN_NAMES);

interface Entry {
  name: string;
  stats: { median: number; mean: number; min: number; max: number; stores: number; chg: number | null; chain_stores?: number };
  stores: Store[];
}

const _chainCache = new Map<string, Record<string, Entry>>();
async function loadChain(chain: string): Promise<Record<string, Entry>> {
  if (!CHAINS.includes(chain)) return {};
  if (_chainCache.has(chain)) return _chainCache.get(chain)!;
  const filePath = path.join(process.cwd(), "public", "data", `catalog_stores_${chain}.json`);
  let data: Record<string, Entry> = {};
  try {
    data = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    data = {};
  }
  _chainCache.set(chain, data);
  return data;
}

let _updated: string | null = null;
async function loadUpdated(): Promise<string> {
  if (_updated) return _updated;
  try {
    const c = JSON.parse(await fs.readFile(path.join(process.cwd(), "public", "data", "catalog.json"), "utf-8"));
    _updated = c.updated || "";
  } catch {
    _updated = "";
  }
  return _updated!;
}

function decodeBc(barcode: string): string | null {
  try {
    return decodeURIComponent(barcode);
  } catch {
    return null; // malformed %-sequence (e.g. a scanner hitting a bad URL) -> treat as not found
  }
}

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
  return { title: `${entry.name} ב${chainHe} — מחירים לפי סניף | מדד על מחירי מזון` };
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
  if (!entry) notFound();

  const chainHe = CHAIN_NAMES[chain] || chain;
  const st = entry.stats;
  const updated = await loadUpdated();
  const [d, m, y] = updated ? updated.split("-").reverse() : ["", "", ""];

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/catalog" className="text-blue-600 text-sm mb-4 inline-block">&rarr; חזרה לקטלוג</Link>

        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{entry.name}</h1>
          <span className="text-blue-600 font-bold text-xl">· {chainHe}</span>
        </div>
        <p className="text-gray-500 mb-4">
          מחירי המוצר בכל סניפי הרשת{updated ? ` · ${d}/${m}/${y}` : ""}
        </p>

        <div className="flex flex-wrap gap-2.5 mb-6">
          <StatCard label="חציון" value={`₪${st.median?.toFixed(2)}`} />
          <StatCard label="ממוצע" value={`₪${st.mean?.toFixed(2)}`} />
          <StatCard label="טווח" value={`${st.min?.toFixed(2)}–${st.max?.toFixed(2)}`} ltr />
          <StatCard label="סניפים" value={st.chain_stores ? `${st.stores} / ${st.chain_stores}` : `${st.stores}`} ltr />
          <StatCard
            label="שינוי שבועי"
            value={st.chg != null && st.chg !== 0 ? `${st.chg > 0 ? "+" : ""}${st.chg}%` : "—"}
            color={st.chg && st.chg > 0 ? "text-red-600" : st.chg && st.chg < 0 ? "text-green-600" : undefined}
          />
        </div>

        {st.chain_stores && st.stores < st.chain_stores ? (
          <p className="text-sm text-gray-500 -mt-3 mb-5">
            {`המוצר מתפרסם ב-${st.stores} מתוך ${st.chain_stores} סניפי הרשת — לא כל סניף מוכר (או מפרסם) כל מק"ט.`}
          </p>
        ) : null}

        <div className="bg-white rounded-xl shadow p-5">
          <StoreTable stores={entry.stores} regionNames={REGION_NAMES} />
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          המחיר הוא לפי קובץ המחירים היומי של הרשת. שמות וכתובות הסניפים מבוססים על מאגר הסניפים הרשמי ועשויים להתעדכן בפיגור;
          סניף חדש ללא שם רשום מוצג כ&laquo;סניף #מזהה&raquo;.
        </p>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ label, value, color, ltr }: { label: string; value: string; color?: string; ltr?: boolean }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 min-w-[110px]">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${color || "text-gray-900"}`} dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "right" } : undefined}>{value}</div>
    </div>
  );
}
