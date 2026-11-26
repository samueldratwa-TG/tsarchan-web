import type { MetadataRoute } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/lib/site";
import { catalogPageParams, catalogPagePath } from "@/lib/catalogPages";

// Built once per deploy; the madad-daily run deploys after every data update.
export const dynamic = "force-static";

// The main pages, then every prerendered catalog product page (/catalog/<chain>/<barcode>, ~1,550).
// Until 2026-11-26 only the main pages were listed (Samuel, 2026-10-22: Google did not know the site
// yet and the product pages were thin). Samuel approved adding the product pages once they carried a
// price history, a summary, a cross-chain comparison and structured data (2026-11-26).
const PAGES = ["/", "/regions", "/insights", "/catalog", "/methodology"];
// Pages whose content changes with every daily data update.
const DAILY = new Set(["/", "/regions", "/insights", "/catalog"]);

/** Date of the last row in public/data/index.csv, or undefined (logged) if it cannot be read. */
function lastDataDate(): Date | undefined {
  try {
    const csv = readFileSync(path.join(process.cwd(), "public", "data", "index.csv"), "utf8");
    const lastRow = csv.trim().split(/\r?\n/).at(-1) ?? "";
    const date = lastRow.split(",")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`unexpected last row: ${lastRow}`);
    return new Date(`${date}T00:00:00Z`);
  } catch (err) {
    console.error("[sitemap] could not read the data date, lastModified omitted:", err);
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDate = lastDataDate();
  const lastModified = dataDate ? { lastModified: dataDate } : {};
  const main = PAGES.map((p) => ({
    // "/" matches the home canonical, which has no trailing slash.
    url: p === "/" ? SITE_URL : `${SITE_URL}${p}`,
    ...(DAILY.has(p) ? lastModified : {}),
  }));
  // Same list as the product page's generateStaticParams; the URL is the page's canonical
  // (metadataBase + "./" in app/layout.tsx), so the two match character for character.
  // Prices on these pages change with every daily update, like the main data pages.
  const products = catalogPageParams().map(({ chain, barcode }) => ({
    url: `${SITE_URL}${catalogPagePath(chain, barcode)}`,
    ...lastModified,
  }));
  return [...main, ...products];
}
