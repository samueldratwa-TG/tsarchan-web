import type { MetadataRoute } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE_URL } from "@/lib/site";

// Built once per deploy; the madad-daily run deploys after every data update.
export const dynamic = "force-static";

// The main pages only (Samuel, 2026-10-22). The catalog product pages stay reachable through
// the links on /catalog but are deliberately not listed here.
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
  return PAGES.map((p) => ({
    // "/" matches the home canonical, which has no trailing slash.
    url: p === "/" ? SITE_URL : `${SITE_URL}${p}`,
    ...(DAILY.has(p) && dataDate ? { lastModified: dataDate } : {}),
  }));
}
