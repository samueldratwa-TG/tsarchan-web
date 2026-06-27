import { IndexChart } from "./components/IndexChart";
import { ProductTable } from "./components/ProductTable";
import { RegionBar } from "./components/RegionBar";
import { Footer } from "./components/Footer";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";

async function loadJSON(filename: string) {
  const filePath = path.join(process.cwd(), "public", "data", filename);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function loadCSV(filename: string): Promise<string[][]> {
  const filePath = path.join(process.cwd(), "public", "data", filename);
  const raw = await fs.readFile(filePath, "utf-8");
  const content = raw.replace(/^\uFEFF/, "");
  return content.trim().split("\n").map((line) => line.replace(/\r/g, "").split(","));
}

async function getData() {
  const indexRows = await loadCSV("index.csv");
  const indexHeader = indexRows[0];
  const cbsColIdx = indexHeader.indexOf("cbs_cpi");
  const indexData = indexRows.slice(1).map((row) => ({
    date: row[0],
    index: row[1] ? parseFloat(row[1]) : null,
    products_count: parseInt(row[2]) || 0,
    cbs_cpi: cbsColIdx >= 0 && row[cbsColIdx] ? parseFloat(row[cbsColIdx]) || null : null,
  }));

  const productsData = await loadJSON("products.json");
  const regionsData = await loadJSON("regions.json");
  const insightsData = await loadJSON("insights.json");

  return { indexData, productsData, regionsData, insightsData };
}

export default async function Home() {
  const { indexData, productsData, regionsData, insightsData } = await getData();

  const validIndex = indexData.filter((r) => r.index !== null);
  const latestIndex = validIndex[validIndex.length - 1];
  const change = latestIndex ? latestIndex.index! - 100 : 0;

  const categories: Record<string, string> = {
    dairy: "מוצרי חלב", grains: "לחם ודגנים", produce: "פירות וירקות",
    meat: "בשר ועוף", pantry: "מזווה ושימורים", beverages: "משקאות", snacks: "חטיפים וממתקים",
  };

  const regionNames: Record<string, string> = {
    center: "מרכז", bnei_brak: "בני ברק", north: "צפון", south: "דרום", jerusalem: "ירושלים",
  };
  const regionChartData = Object.entries(regionsData.basket_index || {}).map(([r, idx]) => ({
    region: r, name: regionNames[r] || r, index: idx as number,
  }));

  const topIncrease = insightsData.biggest_increase?.[0];
  const topDecrease = insightsData.biggest_decrease?.[0];

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">מדד על מחירי מזון</h1>
          <p className="text-gray-500">מדד מחירי מזון שבועי | {productsData.products.length} מוצרים | 8 רשתות שיווק</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <div className="text-sm text-gray-500 mb-1">מדד נוכחי</div>
            <div className="text-3xl font-bold text-gray-900">{latestIndex?.index?.toFixed(2) ?? "---"}</div>
            <div className="text-xs text-gray-400 mt-1">{latestIndex?.date}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <div className="text-sm text-gray-500 mb-1">שינוי מהבסיס</div>
            <div className={`text-3xl font-bold ${change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-gray-900"}`}>
              {change > 0 ? "+" : ""}{change.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">מאז 15/06/2025</div>
          </div>
          {topIncrease && (
            <div className="bg-red-50 rounded-xl shadow p-5 text-center">
              <div className="text-sm text-red-600 mb-1">התייקר הכי הרבה</div>
              <div className="text-lg font-bold text-red-700">{topIncrease.name.slice(0, 20)}</div>
              <div className="text-sm text-red-500">+{topIncrease.change_pct}%</div>
            </div>
          )}
          {topDecrease && (
            <div className="bg-green-50 rounded-xl shadow p-5 text-center">
              <div className="text-sm text-green-600 mb-1">הוזל הכי הרבה</div>
              <div className="text-lg font-bold text-green-700">{topDecrease.name.slice(0, 20)}</div>
              <div className="text-sm text-green-500">{topDecrease.change_pct}%</div>
            </div>
          )}
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-1">מדד מחירי מזון</h2>
          <p className="text-xs text-gray-400 mb-4">קו מחירי מזון (כחול) מול מדד המחירים לצרכן של הלמ&quot;ס (כתום) &mdash; הנקודות הכתומות הן ימי פרסום המדד הרשמי (ה&minus;15 בכל חודש); בין לבין הקו משוערך</p>
          <IndexChart data={validIndex.map((r) => ({ date: r.date, index: r.index!, cbs_cpi: r.cbs_cpi }))} />
        </div>

        {/* Regional Teaser */}
        <Link href="/regions" className="block mb-8">
          <div className="bg-gradient-to-l from-blue-600 to-blue-800 rounded-xl shadow p-6 text-white hover:from-blue-500 hover:to-blue-700 transition-all">
            <h2 className="text-2xl font-bold mb-2">
              האם את יודעת שסל מוצרים זהה במרכז עולה יותר
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">סל קניות זהה עולה עד 7.7% יותר במרכז - מה שמגיע לאלפי שקלים</p>
                <p className="text-blue-200 text-sm">לחצו להשוואה מלאה בין 5 אזורים &larr;</p>
              </div>
              <RegionBar data={regionChartData} darkBg={true} />
            </div>
          </div>
        </Link>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">טבלת מחיר - השוואה בין רשתות</h2>
          <ProductTable
            products={productsData.products}
            displayChains={productsData.display_chains}
            chainNames={productsData.chain_names}
            categories={categories}
          />
        </div>

        {/* Insights Teaser */}
        <Link href="/insights" className="block mb-8">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all border-r-4 border-amber-400">
            <h2 className="text-lg font-semibold mb-2">תובנות והשוואות מתקדמות</h2>
            <p className="text-gray-500 text-sm">
              איזה מוצרים עם הכי הרבה פערי מחיר בין הרשתות? מה המוצרים שעלו הכי הרבה?
              {" "}<span className="text-blue-600">לכל התובנות &larr;</span>
            </p>
          </div>
        </Link>

        {/* Catalog Teaser */}
        <Link href="/catalog" className="block mb-8">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all border-r-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-2">קטלוג המוצרים המלא</h2>
            <p className="text-gray-500 text-sm">
              כל המוצרים שאנו מתעדים בכל אחת מ&minus;8 הרשתות &mdash; מחיר חציוני, פערים בין הרשתות ושינוי שבועי, עם פירוט מחיר בכל סניף.
              {" "}<span className="text-blue-600">לקטלוג המלא &larr;</span>
            </p>
          </div>
        </Link>
      </main>

      <Footer />
    </>
  );
}
