// Display names shared by the catalog product page (server) and its client components, so the
// client components import them instead of receiving them as props on each of ~1,550 pages.

export const CHAIN_NAMES: Record<string, string> = {
  shufersal: "שופרסל", rami_levy: "רמי לוי", yohananof: "יוחננוף", victory: "ויקטורי",
  osher_ad: "אושר עד", hazi_hinam: "חצי חינם", tiv_taam: "טיב טעם", yayno_bitan_and_carrefour: "קרפור",
};

export const REGION_NAMES: Record<string, string> = {
  center: "מרכז", bnei_brak: "בני ברק", north: "צפון", south: "דרום", jerusalem: "ירושלים",
};
