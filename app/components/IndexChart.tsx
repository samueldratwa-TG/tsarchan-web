"use client";

import { useState, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  index: number;
  cbs_cpi?: number | null;
}

interface ChartRow extends DataPoint {
  // CBS value repeated only on publication days (the 15th); null otherwise.
  // Drawn as its own dot series so the real data points stand out from the
  // daily interpolation between them.
  cbs_pub: number | null;
}

// Time-range presets (stock-style). `days` is counted back from the latest
// data point, not "today", so it stays correct even if the feed lags.
const RANGES: { key: string; label: string; days: number | null }[] = [
  { key: "all", label: "הכל", days: null },
  { key: "1y", label: "שנה", days: 365 },
  { key: "6m", label: "חצי שנה", days: 182 },
  { key: "3m", label: "3 חודשים", days: 91 },
  { key: "1m", label: "חודש", days: 30 },
  { key: "1w", label: "שבוע", days: 7 },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 12;
const MIN_WINDOW = 5; // never show fewer than this many points when zoomed

function dayFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDay(v: string): string {
  const p = v.split("-");
  return `${p[2]}/${p[1]}`;
}

// Custom tooltip: shows only the two real series (ignores the cbs_pub marker
// helper, so it never adds a duplicate row).
function ChartTooltip(props: {
  active?: boolean;
  label?: string | number;
  payload?: { dataKey?: string | number; value?: number }[];
}) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const val = (key: string) =>
    payload.find((p) => p.dataKey === key)?.value ?? null;
  const idx = val("index");
  const cbs = val("cbs_cpi");
  const p = String(label).split("-");
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
      }}
    >
      <div style={{ color: "#6b7280", marginBottom: 4 }}>{`${p[2]}/${p[1]}/${p[0]}`}</div>
      {idx != null && (
        <div style={{ color: "#2563eb" }}>מדד מזון: {Number(idx).toFixed(2)}</div>
      )}
      {cbs != null && (
        <div style={{ color: "#f97316" }}>מדד למ&quot;ס: {Number(cbs).toFixed(2)}</div>
      )}
    </div>
  );
}

export function IndexChart({ data }: { data: DataPoint[] }) {
  const [rangeKey, setRangeKey] = useState("all");
  const [zoom, setZoom] = useState(1);
  // The right edge (most recent visible index) of the zoom window. null = latest.
  const [endIdx, setEndIdx] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  // 1) Filter to the selected time range, then tag publication days.
  const ranged = useMemo<ChartRow[]>(() => {
    const range = RANGES.find((r) => r.key === rangeKey);
    let rows = data;
    if (range && range.days != null && data.length > 0) {
      const cutoff = dayFromIso(data[data.length - 1].date);
      cutoff.setDate(cutoff.getDate() - range.days);
      rows = data.filter((d) => dayFromIso(d.date) >= cutoff);
    }
    return rows.map((d) => ({
      ...d,
      cbs_pub:
        d.cbs_cpi != null && Number(d.date.split("-")[2]) === 15 ? d.cbs_cpi : null,
    }));
  }, [data, rangeKey]);

  const n = ranged.length;

  // 2) Apply zoom (window size) + pan (window position). At zoom 1 the window is
  //    the whole range → identical to the original full-width chart.
  const windowSize =
    zoom <= MIN_ZOOM || n === 0
      ? n
      : Math.max(Math.min(MIN_WINDOW, n), Math.round(n / zoom));
  const end = Math.min(endIdx ?? n - 1, n - 1);
  const start = Math.max(0, end - windowSize + 1);
  const realEnd = Math.min(n - 1, start + windowSize - 1);
  const visible = useMemo(
    () => ranged.slice(start, realEnd + 1),
    [ranged, start, realEnd]
  );
  const zoomed = windowSize < n;

  // Y axis auto-fits whatever is currently visible (like a stock chart).
  const { yMin, yMax } = useMemo(() => {
    const vals = visible.flatMap((d) =>
      [d.index, d.cbs_cpi].filter((v): v is number => v != null && v > 0)
    );
    if (vals.length === 0) return { yMin: 95, yMax: 105 };
    return {
      yMin: Math.floor(Math.min(...vals) - 0.5),
      yMax: Math.ceil(Math.max(...vals) + 0.5),
    };
  }, [visible]);

  const showDots = visible.length <= 45;
  // Keep today's exact look at the default (full range, no zoom); adapt elsewhere.
  const xInterval: number | "preserveStartEnd" =
    !zoomed && rangeKey === "all" ? 6 : "preserveStartEnd";

  function pickRange(key: string) {
    setRangeKey(key);
    setZoom(1);
    setEndIdx(null);
  }

  function changeZoom(z: number) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    setZoom(next);
    // Anchor the window to the latest data when zooming back out fully.
    if (next <= MIN_ZOOM) setEndIdx(null);
  }

  // Drag-to-pan: moving the chart shifts which window of days is shown.
  const drag = useRef({ x: 0, end: 0, w: 1, active: false });
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomed || !plotRef.current) return;
    drag.current = {
      x: e.clientX,
      end,
      w: plotRef.current.clientWidth || 1,
      active: true,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    // Drag right → reveal older data (window moves back). LTR chart.
    const deltaIdx = Math.round((dx / drag.current.w) * windowSize);
    const next = Math.min(n - 1, Math.max(windowSize - 1, drag.current.end - deltaIdx));
    setEndIdx(next);
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    drag.current.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => pickRange(r.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                rangeKey === r.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={() => changeZoom(zoom - 1)}
            disabled={zoom <= MIN_ZOOM}
            className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 text-lg leading-none flex items-center justify-center"
            aria-label="הקטנת מרווח"
            title="הקטנת מרווח (זום אאוט)"
          >
            −
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.5}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="w-24 sm:w-32 accent-blue-600"
            aria-label="מרווח / הגדלת הגרף"
            title="הרחבת הגרף לראיית מעבר יומי"
          />
          <button
            onClick={() => changeZoom(zoom + 1)}
            disabled={zoom >= MAX_ZOOM}
            className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 text-lg leading-none flex items-center justify-center"
            aria-label="הרחבת מרווח"
            title="הרחבת מרווח (זום אין)"
          >
            +
          </button>
        </div>
      </div>

      {/* Chart. The Y axis stays fixed; zoom/pan only changes the window of days. */}
      <div
        ref={plotRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={zoomed ? "cursor-grab active:cursor-grabbing select-none" : ""}
        style={{
          width: "100%",
          height: 400,
          direction: "ltr",
          touchAction: zoomed ? "pan-y" : "auto",
        }}
      >
        <ResponsiveContainer>
          <LineChart data={visible} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={fmtDay}
              interval={xInterval}
              minTickGap={24}
            />
            <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="index"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={showDots ? { r: 2 } : false}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cbs_cpi"
              stroke="#f97316"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            {/* Prominent markers on the real CBS publication days (the 15th).
                Its own series with built-in dots — reliably rendered, and kept
                out of the legend/tooltip. */}
            <Line
              type="monotone"
              dataKey="cbs_pub"
              stroke="none"
              connectNulls={false}
              isAnimationActive={false}
              dot={{ r: 4, fill: "#f97316", stroke: "#ffffff", strokeWidth: 1.5 }}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend (HTML) — also documents the orange publication dots. */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-blue-600" />
          מדד מחירי מזון
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-orange-500" />
          מדד המחירים לצרכן (למ&quot;ס)
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shadow-sm" />
          ימי פרסום המדד הרשמי
        </span>
      </div>

      {zoomed && (
        <p className="text-[11px] text-gray-400 mt-1 text-center">
          ↔ גררו את הגרף הצידה כדי לנוע בזמן &middot; הזיזו את המחוון להרחבה/הקטנה
        </p>
      )}
    </div>
  );
}
