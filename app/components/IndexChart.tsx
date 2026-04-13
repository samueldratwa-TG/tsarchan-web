"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  index: number;
  cbs_cpi?: number | null;
}

export function IndexChart({ data }: { data: DataPoint[] }) {
  const allVals = data.flatMap((d) => [d.index, d.cbs_cpi].filter((v): v is number => v != null && v > 0));
  const yMin = Math.floor(Math.min(...allVals) - 0.5);
  const yMax = Math.ceil(Math.max(...allVals) + 0.5);

  return (
    <div style={{ width: "100%", height: 400, direction: "ltr" }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => {
              const parts = v.split("-");
              return `${parts[2]}/${parts[1]}`;
            }}
            interval={6}
          />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => {
              const label = name === "index" ? "מדד מזון" : "מדד למ\"ס";
              return [Number(value).toFixed(2), label];
            }}
            labelFormatter={(label) => {
              const parts = String(label).split("-");
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }}
          />
          <Legend
            formatter={(value) => (value === "index" ? "מדד מחירי מזון" : "מדד המחירים לצרכן (למ\"ס)")}
          />
          <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="index" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="cbs_cpi" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 5 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
