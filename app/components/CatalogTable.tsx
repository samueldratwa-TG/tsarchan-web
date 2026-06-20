"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Cell {
  bc: string;
  median: number;
  mean: number;
  min: number;
  max: number;
  stores: number;
  chg: number | null;
}
interface Row {
  key: string;
  name: string;
  category: string;
  comparable: boolean;
  n_chains: number;
  cells: Record<string, Cell>;
}
export interface Catalog {
  updated: string;
  change_ref: string;
  window_days: number;
  chains: string[];
  chain_names: Record<string, string>;
  categories: Record<string, string>;
  region_names: Record<string, string>;
  counts: { total: number; comparable: number; single: number };
  rows: Row[];
}

type SortKey = "name" | "chains" | "price";

function rowMinMedian(r: Row): number {
  const vals = Object.values(r.cells).map((c) => c.median);
  return vals.length ? Math.min(...vals) : Infinity;
}

type TipState = { cell: Cell; chain: string; chainHe: string; name: string; x: number; y: number } | null;

export function CatalogTable({ catalog }: { catalog: Catalog }) {
  const { chains, chain_names, categories } = catalog;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [comparableOnly, setComparableOnly] = useState(false);
  const [tip, setTip] = useState<TipState>(null);

  const { hero, tail } = useMemo(() => {
    const q = query.trim();
    let rows = catalog.rows;
    if (q) rows = rows.filter((r) => r.name.includes(q));
    const sortFn = (a: Row, b: Row) => {
      if (sort === "chains") return b.n_chains - a.n_chains || a.name.localeCompare(b.name, "he");
      if (sort === "price") return rowMinMedian(a) - rowMinMedian(b);
      return a.name.localeCompare(b.name, "he");
    };
    const hero = rows.filter((r) => r.comparable).sort(sortFn);
    const tail = rows.filter((r) => !r.comparable).sort(sortFn);
    return { hero, tail };
  }, [catalog.rows, query, sort]);

  function enter(e: React.MouseEvent, cell: Cell, chain: string, name: string) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ cell, chain, chainHe: chain_names[chain] || chain, name, x: r.left + r.width / 2, y: r.top });
  }

  const colCount = chains.length + 2;

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מוצר…"
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:border-blue-400"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg cursor-pointer">
          <input type="checkbox" checked={comparableOnly} onChange={(e) => setComparableOnly(e.target.checked)} />
          רק מוצרים בני-השוואה (2+ רשתות)
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="name">מיון: א״ב</option>
          <option value="chains">מיון: הכי הרבה רשתות</option>
          <option value="price">מיון: מחיר (זול קודם)</option>
        </select>
        <span className="text-xs text-gray-400 mr-auto">
          {hero.length + tail.length} מתוך {catalog.counts.total} מוצרים
        </span>
      </div>

      {/* note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-2.5 text-[13px] mb-4 leading-relaxed">
        כל תא = <b>חציון</b> המחיר בין סניפי הרשת. מעבר עכבר מציג טווח (זול–יקר), ממוצע ומספר סניפים.
        {" "}<b className="text-green-700">ירוק</b> = הרשת הזולה ביותר למוצר, <b className="text-red-600">אדום</b> = היקרה ביותר.
        החץ הקטן = שינוי שבועי (7 ימים). «—» = המוצר לא קיים ברשת. לחיצה על תא מציגה את המחיר בכל סניפי הרשת.
      </div>

      {/* table */}
      <div className="overflow-auto border border-gray-200 rounded-xl" style={{ maxHeight: "78vh" }}>
        <table className="text-sm border-collapse" style={{ minWidth: 1080 }}>
          <thead>
            <tr>
              <th className="sticky top-0 right-0 z-30 bg-gray-50 text-right py-2.5 px-3 font-semibold text-xs border-b border-gray-200" style={{ minWidth: 190 }}>
                מוצר
              </th>
              <th className="sticky top-0 z-20 bg-gray-50 py-2.5 px-2 font-semibold text-xs text-gray-600 border-b border-gray-200">רשתות</th>
              {chains.map((c) => (
                <th key={c} className="sticky top-0 z-20 bg-gray-50 py-2.5 px-2 font-semibold text-xs text-gray-700 border-b border-gray-200" style={{ minWidth: 86 }}>
                  {chain_names[c] || c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SectionHeader colCount={colCount} label="מוצרים בני-השוואה" sub={`${catalog.counts.comparable} מוצרים · ב-2+ רשתות`} />
            {hero.map((r) => (
              <CatalogRow key={r.key} row={r} chains={chains} categories={categories} onEnter={enter} onLeave={() => setTip(null)} />
            ))}
            {!comparableOnly && (
              <>
                <SectionHeader colCount={colCount} label="מוצרים ברשת אחת" sub={`${catalog.counts.single} מוצרים · ללא השוואה`} />
                {tail.map((r) => (
                  <CatalogRow key={r.key} row={r} chains={chains} categories={categories} onEnter={enter} onLeave={() => setTip(null)} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* hover tooltip */}
      {tip && (
        <div
          className="bg-gray-900 text-white rounded-lg px-3 py-2 text-[12.5px] leading-relaxed shadow-xl"
          style={{ position: "fixed", left: tip.x, top: tip.y - 10, transform: "translate(-50%,-100%)", width: 210, zIndex: 50, pointerEvents: "none" }}
        >
          <div className="font-bold mb-1">{tip.chainHe} · {tip.name}</div>
          <Stat k="חציון" v={`₪${tip.cell.median.toFixed(2)}`} />
          <Stat k="טווח סניפים" v={`${tip.cell.min.toFixed(2)}–${tip.cell.max.toFixed(2)}`} ltr />
          <Stat k="ממוצע" v={`₪${tip.cell.mean.toFixed(2)}`} />
          <Stat k="סניפים" v={`${tip.cell.stores}`} />
          <Stat k="שינוי שבועי" v={tip.cell.chg != null ? `${tip.cell.chg > 0 ? "+" : ""}${tip.cell.chg}%` : "—"} />
          <div className="text-blue-300 text-[11px] mt-1.5">לחץ לפירוט כל הסניפים ←</div>
        </div>
      )}
    </div>
  );
}

function Stat({ k, v, ltr }: { k: string; v: string; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400">{k}</span>
      <span dir={ltr ? "ltr" : undefined}>{v}</span>
    </div>
  );
}

function SectionHeader({ colCount, label, sub }: { colCount: number; label: string; sub: string }) {
  return (
    <tr>
      <td colSpan={colCount} className="bg-gray-100 text-right py-2 px-3 font-bold text-gray-700 text-[13.5px] border-b border-gray-200">
        {label} <span className="font-normal text-gray-500 text-xs">· {sub}</span>
      </td>
    </tr>
  );
}

function CatalogRow({
  row, chains, categories, onEnter, onLeave,
}: {
  row: Row;
  chains: string[];
  categories: Record<string, string>;
  onEnter: (e: React.MouseEvent, cell: Cell, chain: string, name: string) => void;
  onLeave: () => void;
}) {
  const medians = Object.values(row.cells).map((c) => c.median);
  const min = medians.length ? Math.min(...medians) : null;
  const max = medians.length ? Math.max(...medians) : null;
  const colorable = row.comparable && min !== null && max !== null && min !== max;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60">
      <td className="sticky right-0 z-10 bg-white text-right py-1.5 px-3 text-[13px] font-medium" style={{ minWidth: 190 }}>
        {row.category && categories[row.category] && (
          <span className="inline-block text-[10.5px] font-semibold text-indigo-800 bg-indigo-50 rounded px-1.5 py-px ml-1.5">
            {categories[row.category]}
          </span>
        )}
        {row.name}
      </td>
      <td className="py-1.5 px-2 text-center text-xs text-gray-400 font-semibold">{row.n_chains}</td>
      {chains.map((c) => {
        const cell = row.cells[c];
        if (!cell) return <td key={c} className="py-1.5 px-2 text-center text-gray-300">—</td>;
        const isMin = colorable && cell.median === min;
        const isMax = colorable && cell.median === max;
        const bg = isMin ? "bg-green-50" : isMax ? "bg-red-50" : "";
        const priceColor = isMin ? "text-green-700" : isMax ? "text-red-600" : "text-gray-700";
        return (
          <td key={c} className={`p-0 text-center ${bg}`}>
            <Link
              href={`/catalog/${c}/${encodeURIComponent(cell.bc)}`}
              className="block py-1.5 px-2"
              onMouseEnter={(e) => onEnter(e, cell, c, row.name)}
              onMouseLeave={onLeave}
            >
              <span className={`font-semibold text-[13px] ${priceColor}`}>{cell.median.toFixed(2)}</span>
              <span className="block text-[10.5px] mt-px">
                {cell.chg == null || cell.chg === 0 ? (
                  <span className="text-gray-300">—</span>
                ) : cell.chg > 0 ? (
                  <span className="text-red-600">▲{cell.chg}%</span>
                ) : (
                  <span className="text-green-600">▼{Math.abs(cell.chg)}%</span>
                )}
              </span>
            </Link>
          </td>
        );
      })}
    </tr>
  );
}
