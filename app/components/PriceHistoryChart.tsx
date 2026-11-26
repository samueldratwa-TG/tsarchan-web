"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { expandHistory, type HistoryDay, type PriceHistory } from "@/lib/priceHistory";

/**
 * Daily price history of one product at one chain: the median over the chain's stores (line)
 * and the cheapest-to-dearest store range (band). The series is fetched from
 * public/data/history/<chain>/<barcode>.json (tsarchan-index/build_catalog_history.py), so it is
 * NOT copied into the ~1,550 prerendered pages. A day without a fresh price point is a gap -
 * never a joined line, never an interpolated value - and its tooltip says why.
 */

const RANGES: { key: string; label: string; days: number | null }[] = [
  { key: "all", label: "הכל", days: null },
  { key: "3m", label: "3 חודשים", days: 91 },
  { key: "1m", label: "חודש", days: 30 },
];

const REASON_TEXT: Record<string, string> = {
  held: "לא התקבל ביום זה קובץ מחירים חדש מהרשת",
  same: "קובץ זהה ליום הקודם - לא ניתן לאשר פרסום חדש",
  low: "פרסום חלקי (פחות ממחצית סניפי הרשת) - הושמט",
  none: "אין נתון ליום זה",
};

/** 3-6 evenly spaced ticks on a 1 / 2 / 2.5 / 5 x 10^k step that cover [lo, hi]. */
function niceTicks(lo: number, hi: number): number[] {
  if (hi - lo < 0.2) {
    lo -= 0.5;
    hi += 0.5;
  }
  const raw = (hi - lo) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? 10 * mag;
  const start = Math.max(0, Math.floor(lo / step) * step);
  const out: number[] = [];
  for (let v = start; v < hi + step - 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

function fmtShort(iso: string): string {
  const p = iso.split("-");
  return `${p[2]}/${p[1]}`;
}
function fmtFull(iso: string): string {
  const p = iso.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function HistoryTooltip(props: {
  active?: boolean;
  label?: string | number;
  byDate: Map<string, HistoryDay>;
}) {
  const { active, label, byDate } = props;
  if (!active || label == null) return null;
  const row = byDate.get(String(label));
  if (!row) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 12,
        direction: "rtl",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        maxWidth: 230,
      }}
    >
      <div style={{ color: "#6b7280", marginBottom: 4 }}>{fmtFull(row.date)}</div>
      {row.med != null && row.band ? (
        <>
          <div style={{ color: "#1d4ed8", fontWeight: 700 }}>חציון: ₪{row.med.toFixed(2)}</div>
          <div style={{ color: "#374151" }}>
            טווח סניפים: <span dir="ltr">₪{row.band[0].toFixed(2)}-₪{row.band[1].toFixed(2)}</span>
          </div>
          <div style={{ color: "#6b7280" }}>סניפים: {row.n}</div>
        </>
      ) : (
        <div style={{ color: "#6b7280" }}>{REASON_TEXT[row.reason || "none"]}</div>
      )}
    </div>
  );
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; hist: PriceHistory };

export function PriceHistoryChart({ chain, barcode }: { chain: string; barcode: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [rangeKey, setRangeKey] = useState("all");
  const [showBand, setShowBand] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/data/history/${chain}/${encodeURIComponent(barcode)}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PriceHistory>;
      })
      .then((hist) => {
        if (alive) setState(hist && Array.isArray(hist.p) ? { status: "ok", hist } : { status: "error" });
      })
      .catch(() => {
        if (alive) setState({ status: "error" });
      });
    return () => {
      alive = false;
    };
  }, [chain, barcode]);

  const all = useMemo(() => (state.status === "ok" ? expandHistory(state.hist) : []), [state]);

  const visible = useMemo(() => {
    const range = RANGES.find((r) => r.key === rangeKey);
    if (!range || range.days == null || all.length === 0) return all;
    return all.slice(Math.max(0, all.length - range.days));
  }, [all, rangeKey]);

  const byDate = useMemo(() => new Map(visible.map((r) => [r.date, r])), [visible]);
  const nPoints = visible.filter((r) => r.med != null).length;

  // Y range from what is drawn (the band only when it is shown), on round ticks.
  const yTicks = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const r of visible) {
      if (r.med == null || !r.band) continue;
      lo = Math.min(lo, showBand ? r.band[0] : r.med);
      hi = Math.max(hi, showBand ? r.band[1] : r.med);
    }
    if (!isFinite(lo)) return [0, 1];
    return niceTicks(lo, hi);
  }, [visible, showBand]);

  if (state.status === "loading") {
    return <div className="h-[260px] sm:h-[300px] rounded-lg bg-gray-50 animate-pulse" aria-label="טוען היסטוריית מחירים" />;
  }
  if (state.status === "error" || all.length === 0) {
    return (
      <div className="h-[120px] rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500 text-center px-4">
        אין נתונים: היסטוריית המחירים של המוצר ברשת זו אינה זמינה כרגע.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRangeKey(r.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                rangeKey === r.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none mr-auto">
          <input type="checkbox" checked={showBand} onChange={(e) => setShowBand(e.target.checked)} />
          טווח בין הסניפים
        </label>
      </div>

      <div className="h-[260px] sm:h-[300px]" style={{ direction: "ltr" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={fmtShort} minTickGap={28} interval="preserveStartEnd" />
            <YAxis
              domain={[yTicks[0], yTicks[yTicks.length - 1]]}
              ticks={yTicks}
              tick={{ fontSize: 11 }}
              width={44}
              tickFormatter={(v: number) => `₪${Number.isInteger(v) ? v : Number(v).toFixed(1)}`}
            />
            {/* filterNull={false}: on a gap day every value is null, and Recharts hides the tooltip
                box when nothing survives its null filter - but the gap's reason is exactly what
                the tooltip must say there. */}
            <Tooltip content={<HistoryTooltip byDate={byDate} />} filterNull={false} />
            {showBand && (
              <Area
                type="linear"
                dataKey="band"
                stroke="none"
                fill="#bfdbfe"
                fillOpacity={0.55}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={false}
              />
            )}
            {/* Built-in dot object (custom dot elements do not render in Recharts 2.15 + React 19):
                a fresh day between two gaps has no line segment, so its dot is what shows it. */}
            <Line
              type="linear"
              dataKey="med"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: nPoints > 60 ? 1.2 : 2, fill: "#2563eb", stroke: "#2563eb" }}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11.5px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-blue-600" />
          מחיר חציוני ברשת
        </span>
        {showBand && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-200" />
            מהסניף הזול ליקר
          </span>
        )}
        <span>רווח בקו = יום בלי נתון טרי (פרטים במעבר עכבר)</span>
      </div>
    </div>
  );
}
