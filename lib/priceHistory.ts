// Price history of one product at one chain: public/data/history/<chain>/<barcode>.json, written
// daily by tsarchan-index/build_catalog_history.py. Shared by the product page (server: the text
// summary, read at build time) and PriceHistoryChart (client: fetched in the browser).

export type GapReason = "held" | "same" | "low" | "none";

export interface PriceHistory {
  v: number;
  chain: string;
  bc: string;
  /** first clean snapshot day the product appears in at that chain */
  from: string;
  /** newest snapshot day */
  to: string;
  /** fresh points only: [day offset from `from`, median, min, max, stores] */
  p: [number, number, number, number, number][];
  /** chain-days inside [from, to] that are not fresh price points, by reason (day offsets) */
  x: Partial<Record<"held" | "same" | "low", number[]>>;
}

export interface HistoryDay {
  date: string;
  med: number | null;
  band: [number, number] | null;
  n: number | null;
  /** why there is no point that day (null when there is one) */
  reason: GapReason | null;
}

const DAY_MS = 86_400_000;

function isoToUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function utcToIso(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number): string {
  return utcToIso(isoToUtc(iso) + n * DAY_MS);
}
function daysBetween(a: string, b: string): number {
  return Math.round((isoToUtc(b) - isoToUtc(a)) / DAY_MS);
}
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Every calendar day from `from` to `to`: a value on fresh days, null (with the reason) on the
 *  rest - so a chart draws a gap there and never joins the two sides. */
export function expandHistory(h: PriceHistory): HistoryDay[] {
  const span = daysBetween(h.from, h.to);
  const pts = new Map(h.p.map((r) => [r[0], r]));
  const why = new Map<number, GapReason>();
  for (const [reason, offsets] of Object.entries(h.x || {})) {
    for (const o of offsets || []) why.set(o, reason as GapReason);
  }
  const out: HistoryDay[] = [];
  for (let o = 0; o <= span; o++) {
    const date = addDays(h.from, o);
    const r = pts.get(o);
    out.push(
      r
        ? { date, med: r[1], band: [r[2], r[3]], n: r[4], reason: null }
        : { date, med: null, band: null, n: null, reason: why.get(o) ?? "none" }
    );
  }
  return out;
}

/** Extremes and the 30-day change use only days with at least this many stores (the catalog's
 *  MIN_STORES_FOR_CHANGE), so one or two stores' prices can never become "the lowest". */
export const SUMMARY_MIN_STORES = 3;
const CHANGE_DAYS = 30;
const CHANGE_TOLERANCE = 3;

interface Pt {
  date: string;
  med: number;
  n: number;
}

function extreme(pts: Pt[], pick: (a: number, b: number) => number) {
  const value = pts.reduce((v, p) => pick(v, p.med), pts[0].med);
  const at = pts.filter((p) => p.med === value);
  return { value, date: at[at.length - 1].date, times: at.length };
}

const ils = (v: number) => `₪${v.toFixed(2)}`;

/** The text summary under the chart, one sentence per line. Every number comes from the file;
 *  null when there is no file or no point at all. */
export function summaryLines(h: PriceHistory | null, chainHe: string): string[] | null {
  if (!h || !Array.isArray(h.p) || h.p.length === 0) return null;
  const pts: Pt[] = h.p.map((r) => ({ date: addDays(h.from, r[0]), med: r[1], n: r[4] }));
  const first = pts[0].date;
  const last = pts[pts.length - 1].date;
  const lines: string[] = [
    `המחיר החציוני של המוצר ב${chainHe} נמדד ב-${pts.length} ימים, מ-${fmtDate(first)} עד ${fmtDate(last)}.`,
  ];

  const solid = pts.filter((p) => p.n >= SUMMARY_MIN_STORES);
  if (solid.length === 0) {
    lines.push(`בכל ימי המדידה המוצר נמצא בפחות מ-${SUMMARY_MIN_STORES} סניפים, ולכן אין כאן סיכום של שפל, שיא ושינוי.`);
  } else {
    const lo = extreme(solid, Math.min);
    const hi = extreme(solid, Math.max);
    if (lo.value === hi.value) {
      lines.push(`בכל ימי המדידה עם ${SUMMARY_MIN_STORES} סניפים לפחות החציון היה ${ils(lo.value)}.`);
    } else {
      const when = (e: { date: string; times: number }) =>
        e.times > 1 ? `לאחרונה ב-${fmtDate(e.date)}` : `ב-${fmtDate(e.date)}`;
      lines.push(
        `החציון הנמוך ביותר בתקופה: ${ils(lo.value)} (${when(lo)}); הגבוה ביותר: ${ils(hi.value)} (${when(hi)}).`
      );
    }

    const end = solid[solid.length - 1];
    const target = addDays(end.date, -CHANGE_DAYS);
    if (daysBetween(solid[0].date, target) < -CHANGE_TOLERANCE) {
      lines.push(`המוצר במעקב ברשת זו פחות מ-${CHANGE_DAYS} יום, ולכן אין עדיין השוואה ל-${CHANGE_DAYS} יום.`);
    } else {
      let ref: Pt | null = null;
      for (const p of solid) {
        const d = Math.abs(daysBetween(p.date, target));
        if (d <= CHANGE_TOLERANCE && (ref === null || d < Math.abs(daysBetween(ref.date, target)))) ref = p;
      }
      if (!ref) {
        lines.push(`אין יום מדידה סביב ${fmtDate(target)}, ולכן אין השוואה ל-${CHANGE_DAYS} יום.`);
      } else {
        const pct = Math.round(((end.med - ref.med) / ref.med) * 1000) / 10;
        const span = daysBetween(ref.date, end.date);
        if (pct === 0) {
          lines.push(`ב-${span} הימים האחרונים החציון לא השתנה: ${ils(end.med)} ב-${fmtDate(ref.date)} וגם ב-${fmtDate(end.date)}.`);
        } else {
          lines.push(
            `ב-${span} הימים האחרונים החציון ${pct > 0 ? "עלה" : "ירד"} ב-${Math.abs(pct)}%: מ-${ils(ref.med)} ב-${fmtDate(ref.date)} ל-${ils(end.med)} ב-${fmtDate(end.date)}.`
          );
        }
      }
    }
  }
  if (last !== h.to) {
    lines.push(`ל-${fmtDate(h.to)} אין נתון טרי מהרשת; הנקודה האחרונה בגרף היא מ-${fmtDate(last)}.`);
  }
  return lines;
}
