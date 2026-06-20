import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { CatalogTable, type Catalog } from "../components/CatalogTable";

export const metadata: Metadata = {
  title: "קטלוג המוצרים המלא | מדד על מחירי מזון",
  description: "כל המוצרים שאנו מתעדים בכל רשת — מחיר חציוני, פערים בין רשתות ושינוי שבועי, עם פירוט מחירים בכל סניף.",
};

async function loadCatalog(): Promise<Catalog> {
  const filePath = path.join(process.cwd(), "public", "data", "catalog.json");
  return JSON.parse(await fs.readFile(filePath, "utf-8"));
}

export default async function CatalogPage() {
  const catalog = await loadCatalog();
  const [d, m, y] = catalog.updated.split("-").reverse();

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 text-sm mb-4 inline-block">&rarr; חזרה לעמוד הראשי</Link>

        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">קטלוג המוצרים המלא</h1>
          <p className="text-gray-500">
            כל המוצרים שאנו מתעדים בסנפשוט היומי &mdash; {catalog.counts.total} מוצרים על פני {catalog.chains.length} רשתות.
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            עודכן לאחרונה: {d}/{m}/{y} · מחיר התא = חציון בין סניפי הרשת
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <CatalogTable catalog={catalog} />
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          הנתונים מבוססים על קובץ המחירים היומי של כל רשת. רוב המוצרים (כ&minus;{catalog.counts.single}) מופיעים ברשת אחת בלבד
          ולכן אין עבורם השוואה בין רשתות. שמות וכתובות הסניפים נכונים למועד העדכון האחרון של מאגר הסניפים ועשויים להתעדכן בפיגור.
        </p>
      </main>
      <Footer />
    </>
  );
}
