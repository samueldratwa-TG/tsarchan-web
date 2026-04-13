import { Footer } from "../components/Footer";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

interface InsightItem {
  id: string;
  name: string;
  change_pct?: number;
  base?: number;
  current?: number;
  gap_pct?: number;
  cheapest_chain?: string;
  cheapest_price?: number;
  expensive_chain?: string;
  expensive_price?: number;
}

const chainNamesHe: Record<string, string> = {
  shufersal: "שופרסל", rami_levy: "רמי לוי", yohananof: "יוחננוף",
  victory: "ויקטורי", osher_ad: "אושר עד", hazi_hinam: "חצי חינם",
  tiv_taam: "טיב טעם", yayno_bitan_and_carrefour: "יינות ביתן",
};

async function getData() {
  const filePath = path.join(process.cwd(), "public", "data", "insights.json");
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export default async function InsightsPage() {
  const insights = await getData();

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">&rarr; חזרה לדף הראשי</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">תובנות והשוואות</h1>
        <p className="text-gray-500 mb-8">ניתוחים והשוואות מעמיקות המבוססים על 37 מוצרים ב-8 רשתות</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Biggest increases */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-4">התייקרויות הכי גדולות (מאז 15/12/2025)</h2>
            <div className="space-y-3">
              {(insights.biggest_increase as InsightItem[]).slice(0, 8).map((item, i) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{i + 1}.</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.base?.toFixed(2)} &larr; {item.current?.toFixed(2)}</span>
                    <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded">+{item.change_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Biggest decreases */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-green-700 mb-4">הוזלות הכי גדולות (מאז 15/12/2025)</h2>
            <div className="space-y-3">
              {(insights.biggest_decrease as InsightItem[]).slice(0, 8).map((item, i) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{i + 1}.</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.base?.toFixed(2)} &larr; {item.current?.toFixed(2)}</span>
                    <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded">{item.change_pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Biggest chain gaps */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">פערי מחירים גדולים בין הרשתות</h2>
          <p className="text-xs text-gray-400 mb-4">אותו מוצר זהה, מחיר שונה</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right py-2 px-3 font-semibold">מוצר</th>
                  <th className="text-center py-2 px-3 font-semibold text-green-700">הכי זול</th>
                  <th className="text-center py-2 px-3 font-semibold text-red-600">הכי יקר</th>
                  <th className="text-center py-2 px-3 font-semibold">פער</th>
                </tr>
              </thead>
              <tbody>
                {(insights.biggest_chain_gap as InsightItem[]).slice(0, 15).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-green-700 font-medium">{item.cheapest_price?.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">{chainNamesHe[item.cheapest_chain || ""] || item.cheapest_chain}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-red-600 font-medium">{item.expensive_price?.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">{chainNamesHe[item.expensive_chain || ""] || item.expensive_chain}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs">{item.gap_pct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
