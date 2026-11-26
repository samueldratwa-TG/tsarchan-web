// The set of catalog product pages (/catalog/<chain>/<barcode>), in ONE place: the product page's
// generateStaticParams and app/sitemap.ts both call catalogPageParams(), so the sitemap can never
// list a page that was not prerendered (the page has dynamicParams = false, so anything else 404s).
import { readFileSync } from "node:fs";
import path from "node:path";
import { CHAIN_NAMES } from "./catalogNames";

export const CATALOG_CHAINS = Object.keys(CHAIN_NAMES);

/** One page per key of public/data/catalog_stores_<chain>.json (written daily by
 *  tsarchan-index/build_catalog.py). An unreadable file is logged loudly and gives that chain no
 *  pages - in the sitemap and in the build alike. */
export function catalogPageParams(): { chain: string; barcode: string }[] {
  const params: { chain: string; barcode: string }[] = [];
  for (const chain of CATALOG_CHAINS) {
    const file = path.join(process.cwd(), "public", "data", `catalog_stores_${chain}.json`);
    try {
      for (const barcode of Object.keys(JSON.parse(readFileSync(file, "utf-8")))) params.push({ chain, barcode });
    } catch (err) {
      console.error(`[catalog] ${file} unreadable - no product pages for ${chain}:`, err);
    }
  }
  return params;
}

/** The path a product page is served at - the same encoding as the links to it and its canonical. */
export function catalogPagePath(chain: string, barcode: string): string {
  return `/catalog/${chain}/${encodeURIComponent(barcode)}`;
}
