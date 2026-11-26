"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export interface Store {
  store: string;
  name: string;
  city: string;
  region: string;
  price: number;
}

/** One store's row in public/data/stores_<chain>.json (written by build_catalog.py). Fetched
 *  when a row is clicked - deliberately NOT part of the prerendered page, which would copy it
 *  into every one of the ~1,550 product pages. */
interface StoreDetails {
  name?: string;
  address?: string;
  city?: string;
  zip?: string;
  online?: boolean;
}

type SortKey = "name" | "city" | "region" | "price";
type SortDir = "asc" | "desc";

const collator = new Intl.Collator("he", { sensitivity: "base", numeric: true });

/** Search normalisation: hyphens -> space, quotes/geresh dropped, lower case, single spaces.
 *  So "תל-אביב" finds "תל אביב" and 'ת"א' finds "תא". */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[-–־]/g, " ")
    .replace(/["'״׳]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const detailsCache = new Map<string, Promise<Record<string, StoreDetails>>>();
function loadDetails(chain: string): Promise<Record<string, StoreDetails>> {
  let p = detailsCache.get(chain);
  if (!p) {
    p = fetch(`/data/stores_${chain}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    // a failed fetch is not cached, so the next click retries
    p.catch(() => detailsCache.delete(chain));
    detailsCache.set(chain, p);
  }
  return p;
}

export function StoreTable({
  stores,
  regionNames,
  chain,
  chainName,
}: {
  stores: Store[];
  regionNames: Record<string, string>;
  chain: string;
  chainName: string;
}) {
  const [region, setRegion] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Store | null>(null);
  const closeDialog = useCallback(() => setSelected(null), []);

  const availableRegions = useMemo(
    () => Array.from(new Set(stores.map((s) => s.region).filter(Boolean))),
    [stores]
  );

  const visible = useMemo(() => {
    const q = norm(query);
    const filtered = stores.filter(
      (s) =>
        (region === "all" || s.region === region) &&
        (!q || norm(s.name).includes(q) || norm(s.city || "").includes(q))
    );
    const textOf = (s: Store): string =>
      sortKey === "name" ? s.name : sortKey === "city" ? s.city || "" : regionNames[s.region] || "";
    const sign = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "price") {
        return (a.price - b.price) * sign || collator.compare(a.name, b.name);
      }
      const ta = textOf(a);
      const tb = textOf(b);
      // a store with no city / region stays at the bottom in both directions
      if (!ta !== !tb) return ta ? -1 : 1;
      return collator.compare(ta, tb) * sign || a.price - b.price;
    });
  }, [stores, region, query, sortKey, sortDir, regionNames]);

  const prices = visible.map((s) => s.price);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const colorable = min !== null && max !== null && min !== max;
  const filtered = region !== "all" || norm(query) !== "";

  /** Row click, or Enter / Space on a focused row, opens that store's details. */
  function onRowActivate(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) {
    if ("key" in e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
    }
    const tr = (e.target as HTMLElement).closest<HTMLElement>("tr[data-s]");
    const s = tr && stores.find((x) => x.store === tr.dataset.s);
    if (s) setSelected(s);
  }

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  return (
    <div>
      <div className="mb-3">
        <label htmlFor="store-search" className="sr-only">
          חיפוש סניף לפי שם או עיר
        </label>
        <input
          id="store-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם סניף או עיר"
          className="w-full sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {availableRegions.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={region === "all"} onClick={() => setRegion("all")} label="כל האזורים" />
          {availableRegions.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)} label={regionNames[r] || r} />
          ))}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <SortHeader label="סניף" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="עיר" k="city" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="אזור" k="region" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="מחיר" k="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} center />
            </tr>
          </thead>
          <tbody onClick={onRowActivate} onKeyDown={onRowActivate}>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500 text-[13px]">
                  לא נמצאו סניפים התואמים לחיפוש
                </td>
              </tr>
            ) : (
              // Deliberately lean markup (classes in globals.css, one delegated handler on the
              // tbody): these rows are repeated on ~1,550 prerendered pages.
              visible.map((s) => (
                <tr key={s.store} data-s={s.store} tabIndex={0} className="st-r">
                  <td>{s.name}</td>
                  <td>{s.city || "—"}</td>
                  <td>{regionNames[s.region] || "—"}</td>
                  <td
                    className={
                      colorable && s.price === min ? "st-p st-min" : colorable && s.price === max ? "st-p st-max" : "st-p"
                    }
                  >
                    {s.price.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {filtered ? `${visible.length} מתוך ${stores.length} סניפים` : `${stores.length} סניפים`}
        {" · "}לחיצה על סניף מציגה כתובת וקישור לניווט
      </p>

      {selected && (
        <StoreDialog
          key={selected.store}
          store={selected}
          chain={chain}
          chainName={chainName}
          regionNames={regionNames}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

function SortHeader({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  center,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  center?: boolean;
}) {
  const active = sortKey === k;
  return (
    <th
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`${center ? "text-center" : "text-right"} py-0 px-0.5 sm:px-2 font-semibold text-xs`}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 py-2.5 px-1.5 sm:px-2 rounded whitespace-nowrap hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
          active ? "text-blue-700" : "text-gray-800"
        }`}
      >
        {label}
        <span aria-hidden="true" className={active ? "" : "text-gray-300"}>
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
      }`}
    >
      {label}
    </button>
  );
}

type DetailsState = { status: "loading" } | { status: "ok"; d: StoreDetails | null } | { status: "error" };

function StoreDialog({
  store,
  chain,
  chainName,
  regionNames,
  onClose,
}: {
  store: Store;
  chain: string;
  chainName: string;
  regionNames: Record<string, string>;
  onClose: () => void;
}) {
  const [state, setState] = useState<DetailsState>({ status: "loading" });
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    let alive = true;
    loadDetails(chain)
      .then((all) => alive && setState({ status: "ok", d: all[store.store] ?? null }))
      .catch((err) => {
        console.error(`store details for ${chain} could not be loaded:`, err);
        if (alive) setState({ status: "error" });
      });
    return () => {
      alive = false;
    };
  }, [chain, store.store]);

  // Escape closes; focus goes to the close button and back to the row's button afterwards.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  const d = state.status === "ok" ? state.d : null;
  const unlisted = state.status === "ok" && !d; // not in the chain's stores file ("סניף #id")
  const city = store.city || d?.city || "";
  const address = d?.address || "";
  const online = !!d?.online;

  // Map links: by address when one is published, else a search for the store by name.
  // No API key - plain public URLs. An online-only or unlisted store gets none.
  let mapQuery = "";
  let byName = false;
  if (d && !online) {
    if (address) {
      mapQuery = city && !norm(address).includes(norm(city)) ? `${address}, ${city}` : address;
    } else {
      const nm = norm(store.name).includes(norm(chainName)) ? store.name : `${chainName} ${store.name}`;
      mapQuery = city && !norm(nm).includes(norm(city)) ? `${nm}, ${city}` : nm;
      byName = true;
    }
  }
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const waze = `https://waze.com/ul?q=${encodeURIComponent(mapQuery)}&navigate=yes`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500">{chainName}</div>
            <h2 id={titleId} className="text-lg font-bold text-gray-900">
              {store.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="shrink-0 w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 text-xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            ×
          </button>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm mb-4">
          <dt className="text-gray-500">כתובת</dt>
          <dd className="text-gray-900">
            {state.status === "loading"
              ? "טוען…"
              : state.status === "error"
                ? "פרטי הסניף אינם זמינים כרגע"
                : unlisted
                  ? "הסניף אינו מופיע במאגר הסניפים של הרשת"
                  : online
                    ? "סניף מקוון (משלוחים)"
                    : address || "הרשת לא פרסמה כתובת"}
          </dd>
          <dt className="text-gray-500">עיר</dt>
          <dd className="text-gray-900">{city || "—"}</dd>
          <dt className="text-gray-500">אזור</dt>
          <dd className="text-gray-900">{regionNames[store.region] || "—"}</dd>
          {d?.zip ? (
            <>
              <dt className="text-gray-500">מיקוד</dt>
              <dd className="text-gray-900" dir="ltr" style={{ textAlign: "right" }}>
                {d.zip}
              </dd>
            </>
          ) : null}
          <dt className="text-gray-500">מחיר המוצר</dt>
          <dd className="text-gray-900 font-bold">₪{store.price.toFixed(2)}</dd>
        </dl>

        {mapQuery ? (
          <>
            <div className="flex flex-wrap gap-2">
              <a
                href={gmaps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] text-center text-sm font-semibold px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                פתיחה ב-Google Maps
              </a>
              <a
                href={waze}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] text-center text-sm font-semibold px-4 py-2.5 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                ניווט ב-Waze
              </a>
            </div>
            {byName && (
              <p className="text-xs text-gray-400 mt-2">אין כתובת רשמית - הקישורים מחפשים את הסניף לפי שמו.</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
