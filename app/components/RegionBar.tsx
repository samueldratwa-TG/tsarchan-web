"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface RegionData {
  region: string;
  name: string;
  index: number;
}

export function RegionBar({ data, darkBg = false }: { data: RegionData[]; darkBg?: boolean }) {
  const colors: Record<string, string> = {
    center: "#ef4444",
    north: "#60a5fa",
    south: "#4ade80",
    jerusalem: "#c084fc",
    bnei_brak: "#2dd4bf",
  };

  const textColor = darkBg ? "#ffffff" : "#374151";
  const gridColor = darkBg ? "rgba(255,255,255,0.15)" : "#f0f0f0";
  const refColor = darkBg ? "rgba(255,255,255,0.4)" : "#9ca3af";

  return (
    <div style={{ width: "100%", height: 300, direction: "ltr" }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fontSize: 13, fill: textColor }} />
          {/* Adaptive domain that always includes the 100 reference line, so
              bars stay readable wherever the regional spread lands. */}
          <YAxis
            domain={[
              (dataMin: number) => Math.floor(Math.min(dataMin, 100) - 2),
              (dataMax: number) => Math.ceil(Math.max(dataMax, 100) + 1),
            ]}
            tick={{ fontSize: 12, fill: textColor }}
          />
          <Tooltip formatter={(value) => [Number(value).toFixed(1), "מדד מחירי"]} />
          <ReferenceLine y={100} stroke={refColor} strokeDasharray="5 5" />
          <Bar dataKey="index" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.region} fill={colors[entry.region] || "#6b7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
