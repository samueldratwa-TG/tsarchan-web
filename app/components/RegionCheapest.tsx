"use client";

import { useMemo } from "react";
import { CHAIN_NAMES, REGION_NAMES } from "@/lib/catalogNames";
import type { Store } from "./StoreTable";

const collator = new Intl.Collator("he", { sensitivity: "base", numeric: true });

/**
 * The cheapest store per region, computed from the page's own store list. It receives the SAME
 * `stores` array as StoreTable, which React serializes once and then references - so this table
 * adds almost nothing to the ~1,550 prerendered pages. Still rendered into the static HTML.
 */
export function RegionCheapest({ stores, chain }: { stores: Store[]; chain: string }) {
  const chainHe = CHAIN_NAMES[chain] || chain;
  const { regions, noRegion } = useMemo(() => {
    const regions = Object.keys(REGION_NAMES)
      .map((reg) => {
        const rs = stores.filter((s) => s.region === reg);
        if (!rs.length) return null;
        const min = Math.min(...rs.map((s) => s.price));
        const at = rs.filter((s) => s.price === min).sort((a, b) => collator.compare(a.name, b.name));
        return { reg, n: rs.length, min, store: at[0], more: at.length - 1 };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { regions, noRegion: stores.filter((s) => !s.region).length };
  }, [stores]);

  return (
    <section className="bg-white rounded-xl shadow p-3 sm:p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-1">הסניף הזול בכל אזור</h2>
      {regions.length === 0 ? (
        <p className="text-sm text-gray-500">לסניפים של המוצר אין שיוך לאזור.</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {`המחיר הנמוך ביותר של המוצר ב${chainHe} בכל אזור, לפי קובץ המחירים היומי.`}
            {noRegion ? ` ${noRegion === 1 ? "סניף אחד" : `${noRegion} סניפים`} ללא שיוך לאזור אינם נכללים.` : ""}
          </p>
          <table className="cx">
            <thead>
              <tr><th>אזור</th><th>סניף</th><th>מחיר</th></tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.reg}>
                  <td>{REGION_NAMES[r.reg]}</td>
                  <td>
                    {r.store.name}
                    {r.store.city ? <span className="cx-s">{r.store.city}</span> : null}
                    {r.more > 0 ? (
                      <span className="cx-s">{r.more === 1 ? "ועוד סניף אחד במחיר זה" : `ועוד ${r.more} סניפים במחיר זה`}</span>
                    ) : null}
                    <span className="cx-s">{r.n === 1 ? "סניף אחד באזור" : `${r.n} סניפים באזור`}</span>
                  </td>
                  <td>{`₪${r.min.toFixed(2)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
