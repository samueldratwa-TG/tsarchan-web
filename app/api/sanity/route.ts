import { NextResponse } from "next/server";

// Daily data-sanity check, hit by the Vercel cron in vercel.json (0 6 * * *).
// Verifies the published data files are fresh and internally healthy; returns
// 200 {ok:true} or 500 {ok:false, problems:[...]} so a failed run is visible
// in the Vercel cron dashboard. Added 2026-07-14 after regions.json silently
// served identical all-100 values for 8 days.
export async function GET(request: Request) {
  const problems: string[] = [];
  const host = request.headers.get("host") || "hamadad.sadot.click";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const base = `${proto}://${host}`;

  try {
    // 1) Index freshness + plausibility
    const idxRes = await fetch(`${base}/data/index.csv`, { cache: "no-store" });
    if (!idxRes.ok) {
      problems.push(`index.csv fetch failed (${idxRes.status})`);
    } else {
      const lines = (await idxRes.text()).trim().split("\n");
      const last = lines[lines.length - 1]?.split(",");
      const lastDate = last?.[0]?.trim();
      const lastValue = parseFloat(last?.[1] ?? "");
      if (!lastDate || isNaN(lastValue)) {
        problems.push("index.csv: unparseable last row");
      } else {
        const ageDays = (Date.now() - new Date(`${lastDate}T00:00:00Z`).getTime()) / 86_400_000;
        if (ageDays > 4) problems.push(`index.csv stale: last date ${lastDate} (${Math.floor(ageDays)}d old)`);
        if (lastValue < 80 || lastValue > 130) problems.push(`index value implausible: ${lastValue}`);
      }
    }

    // 2) Regional data health (the July-2026 failure mode: all regions
    //    identical / a region silently empty)
    const regRes = await fetch(`${base}/data/regions.json`, { cache: "no-store" });
    if (!regRes.ok) {
      problems.push(`regions.json fetch failed (${regRes.status})`);
    } else {
      const regions = await regRes.json();
      const vals = Object.values(regions.basket_index || {}) as number[];
      if (vals.length < 4) problems.push(`regions: only ${vals.length} regions have a basket_index`);
      if (vals.length >= 2 && new Set(vals).size === 1)
        problems.push("regions: ALL basket_index values identical — store->region join likely collapsed");
      if ((regions.common_product_count ?? 0) < 25)
        problems.push(`regions: common_product_count=${regions.common_product_count} (healthy ~37)`);
    }
  } catch (e) {
    problems.push(`sanity check error: ${e instanceof Error ? e.message : String(e)}`);
  }

  const ok = problems.length === 0;
  return NextResponse.json(
    { ok, problems, checkedAt: new Date().toISOString() },
    { status: ok ? 200 : 500 }
  );
}
