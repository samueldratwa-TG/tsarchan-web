import { RegionBar } from "../components/RegionBar";
import { Footer } from "../components/Footer";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

async function getData() {
  const filePath = path.join(process.cwd(), "public", "data", "regions.json");
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function getProducts() {
  const filePath = path.join(process.cwd(), "public", "data", "products.json");
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export default async function RegionsPage() {
  const regionsData = await getData();
  const productsData = await getProducts();

  const regionOrder = ["center", "north", "south", "jerusalem", "bnei_brak"];
  const regionNames: Record<string, string> = {
    center: "מרכז", bnei_brak: "בני ברק וסביבה", north: "צפון", south: "דרום", jerusalem: "ירושלים",
  };
  const regionColors: Record<string, string> = {
    center: "bg-red-100 text-red-800", north: "bg-blue-100 text-blue-800",
    south: "bg-green-100 text-green-800", jerusalem: "bg-purple-100 text-purple-800",
    bnei_brak: "bg-teal-100 text-teal-800",
  };

  // Only regions that actually have data — a region missing from basket_index
  // must be shown as missing, never silently rendered as a fake 100.
  const basketIndex: Record<string, number> = regionsData.basket_index || {};
  const liveRegions = regionOrder.filter((r) => typeof basketIndex[r] === "number");
  const chartData = liveRegions.map((r) => ({
    region: r, name: regionNames[r] || r, index: basketIndex[r],
  }));

  const hasIndex = liveRegions.length >= 2;
  const cheapest = hasIndex
    ? liveRegions.reduce((a, b) => (basketIndex[a] <= basketIndex[b] ? a : b))
    : null;
  const expensive = hasIndex
    ? liveRegions.reduce((a, b) => (basketIndex[a] >= basketIndex[b] ? a : b))
    : null;
  const gap = cheapest && expensive
    ? ((basketIndex[expensive] - basketIndex[cheapest]) / basketIndex[cheapest] * 100).toFixed(1)
    : null;

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">&rarr; חזרה לדף הראשי</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">השוואה אזורית</h1>
        <p className="text-gray-500 mb-8">
          השוואת {regionsData.common_product_count} מוצרים זהים ב-5 אזורים, על בסיס 878 סניפים ב-8 רשתות
        </p>

        {/* Highlight box */}
        {hasIndex && cheapest && expensive ? (
          <div className="bg-teal-50 border-2 border-teal-300 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">&#x1F6D2;</div>
              <div>
                <h2 className="text-xl font-bold text-teal-900 mb-2">
                  הכי זול לקנות: {regionNames[cheapest]}
                </h2>
                <p className="text-teal-800">
                  סל קניות זהה עולה <strong>{gap}% יותר</strong> ב{regionNames[expensive]} מאשר ב{regionNames[cheapest]}.
                  ההבדל נובע בעיקר מריכוז הרשתות &quot;חצי חנם&quot; ו&quot;אושר עד&quot; באזורים עם אוכלוסייה חרדית ושוליים קמעונאיים נמוכים - לא <strong>בגלל האזור עצמו</strong> אלא בגלל תמהיל הרשתות הפעיל.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8 text-amber-900">
            אין כרגע נתונים אזוריים זמינים — ההשוואה תתעדכן בריצת הנתונים הבאה.
          </div>
        )}

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">מדד מחירי סל לפי אזור (מרכז = 100)</h2>
            <RegionBar data={chartData} />
          </div>
        )}

        {/* Region Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {regionOrder.map((r) => {
            const idx = basketIndex[r];
            if (idx == null) {
              return (
                <div key={r} className="rounded-xl p-4 text-center bg-gray-100 text-gray-400">
                  <div className="text-sm font-medium mb-1">{regionNames[r]}</div>
                  <div className="text-2xl font-bold">&mdash;</div>
                  <div className="text-xs mt-1">אין נתונים</div>
                </div>
              );
            }
            const diff = idx - 100;
            return (
              <div key={r} className={`rounded-xl p-4 text-center ${regionColors[r]}`}>
                <div className="text-sm font-medium mb-1">{regionNames[r]}</div>
                <div className="text-2xl font-bold">{idx.toFixed(1)}</div>
                <div className="text-xs mt-1">{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>

        {/* Product comparison table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">מחיר ממוצע לפי אזור</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-right py-2 px-2 font-semibold">מוצר</th>
                  {regionOrder.map((r) => (
                    <th key={r} className="text-center py-2 px-2 font-semibold text-xs">{regionNames[r]}</th>
                  ))}
                  <th className="text-center py-2 px-2 font-semibold text-xs">פער</th>
                </tr>
              </thead>
              <tbody>
                {productsData.products.map((product: { id: string; name: string }) => {
                  const regionPrices = regionsData.products[product.id] || {};
                  const vals = regionOrder.map((r) => regionPrices[r]).filter((v: number | undefined): v is number => v != null && v > 0);
                  if (vals.length < 2) return null;

                  const minP = Math.min(...vals);
                  const maxP = Math.max(...vals);
                  const gapPct = ((maxP - minP) / minP * 100).toFixed(1);

                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5 px-2 text-xs">{product.name}</td>
                      {regionOrder.map((r) => {
                        const price = regionPrices[r];
                        if (!price) return <td key={r} className="py-1.5 px-2 text-center text-xs text-gray-300">-</td>;
                        const isMin = price === minP && minP !== maxP;
                        const isMax = price === maxP && minP !== maxP;
                        return (
                          <td key={r} className={`py-1.5 px-2 text-center text-xs ${isMin ? "text-green-700 font-bold" : isMax ? "text-red-500" : "text-gray-600"}`}>
                            {price.toFixed(2)}
                          </td>
                        );
                      })}
                      <td className="py-1.5 px-2 text-center text-xs text-gray-500">{gapPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
