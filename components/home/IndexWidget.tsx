"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

interface IndexData {
  currentValue: number;
  previousValue: number;
  date: string;
  change: number;
  changePercent: number;
}

export function IndexWidget() {
  const [data, setData] = useState<IndexData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/hamadad")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const ChangeIcon =
    data && data.change > 0
      ? TrendingUp
      : data && data.change < 0
        ? TrendingDown
        : Minus;

  const changeColor =
    data && data.change > 0
      ? "text-red-500"
      : data && data.change < 0
        ? "text-status-live"
        : "text-text-tertiary";

  return (
    <section className="mx-auto max-w-[1200px] px-6 mb-16">
      <a
        href="https://hamadad.sadot.click"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border-2 border-transparent bg-gradient-to-l from-accent/5 to-accent-warm/5 p-6 md:p-8 transition-all hover:shadow-lg group"
        style={{
          borderImage: "linear-gradient(to left, var(--accent-primary), var(--accent-warm)) 1",
          borderImageSlice: 1,
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h2 className="text-lg font-bold text-text-primary mb-1">
              מדד הצרחן הנבון
            </h2>
            <p className="text-sm text-text-tertiary">
              עוקב אחר 37 מוצרי יסוד ב-8 רשתות
            </p>
          </div>

          {data && !error ? (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-text-primary">
                  {data.currentValue.toFixed(1)}
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  עודכן: {data.date}
                </div>
              </div>
              <div className={`flex items-center gap-1 ${changeColor}`}>
                <ChangeIcon size={20} />
                <span className="text-sm font-bold">
                  {data.changePercent > 0 ? "+" : ""}
                  {data.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-accent">
              <span className="text-sm font-medium">לצפייה במדד המלא</span>
              <ExternalLink
                size={16}
                className="group-hover:translate-x-[-2px] transition-transform"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-accent text-sm font-medium">
            <span>למדד המלא</span>
            <ExternalLink
              size={14}
              className="group-hover:translate-x-[-2px] transition-transform"
            />
          </div>
        </div>
      </a>
    </section>
  );
}
