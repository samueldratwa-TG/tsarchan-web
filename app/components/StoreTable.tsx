"use client";

import { useMemo, useState } from "react";

export interface Store {
  store: string;
  name: string;
  city: string;
  region: string;
  price: number;
}

export function StoreTable({
  stores,
  regionNames,
}: {
  stores: Store[];
  regionNames: Record<string, string>;
}) {
  const [region, setRegion] = useState<string>("all");

  const availableRegions = useMemo(
    () => Array.from(new Set(stores.map((s) => s.region).filter(Boolean))),
    [stores]
  );

  const visible = useMemo(
    () => (region === "all" ? stores : stores.filter((s) => s.region === region)),
    [stores, region]
  );

  const prices = visible.map((s) => s.price);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const colorable = min !== null && max !== null && min !== max;

  return (
    <div>
      {availableRegions.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={region === "all"} onClick={() => setRegion("all")} label="כל האזורים" />
          {availableRegions.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)} label={regionNames[r] || r} />
          ))}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm" style={{ minWidth: 480 }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-right py-2.5 px-4 font-semibold text-xs">סניף</th>
              <th className="text-right py-2.5 px-4 font-semibold text-xs">עיר</th>
              <th className="text-right py-2.5 px-4 font-semibold text-xs">אזור</th>
              <th className="text-center py-2.5 px-4 font-semibold text-xs">מחיר</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => {
              const isMin = colorable && s.price === min;
              const isMax = colorable && s.price === max;
              return (
                <tr key={`${s.store}-${i}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4 text-[13px]">{s.name}</td>
                  <td className="py-2 px-4 text-[13px] text-gray-600">{s.city || "—"}</td>
                  <td className="py-2 px-4 text-[13px] text-gray-600">{regionNames[s.region] || "—"}</td>
                  <td
                    className={`py-2 px-4 text-center font-bold ${
                      isMin ? "bg-green-50 text-green-700" : isMax ? "bg-red-50 text-red-600" : "text-gray-800"
                    }`}
                  >
                    {s.price.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{visible.length} סניפים</p>
    </div>
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
