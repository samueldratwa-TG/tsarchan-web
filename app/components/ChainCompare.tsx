"use client";

import Link from "next/link";
import { CHAIN_NAMES } from "@/lib/catalogNames";

/** [chain, barcode at that chain, median, min, max, stores] - one catalog.json cell, sorted by
 *  median. Tuples rather than objects: this prop is serialized into every product page. */
export type CompareCell = [string, string, number, number, number, number];

const ils = (v: number) => `₪${v.toFixed(2)}`;

/**
 * "The product at other chains" (catalog.json rows[].cells). A client component only so its data
 * travels as compact tuples instead of a server-rendered element tree in each page's RSC copies;
 * it is still rendered into the static HTML.
 * Like the catalog grid, the cheapest chain is highlighted only on a `comparable` row whose
 * medians differ; a non-comparable row is never presented as a like-for-like comparison.
 */
export function ChainCompare({
  chain,
  cells,
  comparable,
  updated,
}: {
  chain: string;
  /** null = the product has no catalog.json row */
  cells: CompareCell[] | null;
  comparable: boolean;
  updated: string;
}) {
  const chainHe = CHAIN_NAMES[chain] || chain;
  const meds = (cells || []).map((c) => c[2]);
  const minMed = meds.length ? Math.min(...meds) : null;
  const maxMed = meds.length ? Math.max(...meds) : null;
  const highlight = comparable && minMed !== null && minMed !== maxMed;
  const mixedCodes = new Set((cells || []).map((c) => c[1])).size > 1;
  const date = updated ? updated.split("-").reverse().join("/") : "";

  return (
    <section className="bg-white rounded-xl shadow p-3 sm:p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-1">המוצר ברשתות אחרות</h2>
      {!cells ? (
        <p className="text-sm text-gray-500">אין נתוני השוואה בין רשתות למוצר זה.</p>
      ) : !comparable ? (
        <p className="text-sm text-gray-500">
          {`מבין ${Object.keys(CHAIN_NAMES).length} הרשתות שבמעקב, המוצר מופיע בקובץ המחירים של ${chainHe} בלבד, ולכן אין לו השוואה בין רשתות.`}
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {`חציון בין סניפי כל רשת${date ? `, ${date}` : ""}.`}
            {highlight ? " ירוק = הרשת הזולה ביותר." : " החציון זהה בכל הרשתות."}
            {mixedCodes ? " בכל רשת המוצר מופיע בקוד שלה; ההתאמה בין הקודים נעשתה ידנית." : ""}
          </p>
          <table className="cx">
            <thead>
              <tr><th>רשת</th><th>חציון</th><th>טווח</th><th>סניפים</th></tr>
            </thead>
            <tbody>
              {cells.map(([ch, bc, med, mn, mx, n]) => {
                const cur = ch === chain;
                const cls = [highlight && med === minMed ? "cx-min" : "", cur ? "cx-cur" : ""].join(" ").trim();
                return (
                  <tr key={ch} className={cls || undefined}>
                    <td>
                      {cur ? CHAIN_NAMES[ch] : <Link href={`/catalog/${ch}/${encodeURIComponent(bc)}`}>{CHAIN_NAMES[ch] || ch}</Link>}
                      {cur ? <span className="cx-b">רשת זו</span> : null}
                    </td>
                    <td>{ils(med)}</td>
                    <td dir="ltr">{`${mn.toFixed(2)}-${mx.toFixed(2)}`}</td>
                    <td>{n}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
