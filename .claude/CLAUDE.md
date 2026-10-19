# המדד של הצרחן הנבון (hamadad) — Claude Code Instructions

## What This Is
Daily Israeli food price index at hamadad.sadotlab.com.
Hebrew-first (RTL), Next.js 16, Tailwind CSS, Recharts.

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Recharts (charts)
- Font: Assistant (Hebrew)
- Deployed on Vercel free tier
- Domain: hamadad.sadotlab.com (Cloudflare DNS, CNAME DNS-only to Vercel). Hosts live in
  `lib/site.ts` (SITE_HOST/SITE_URL, OLD_HOST, HUB_URL) - never hard-code a host elsewhere.
- Vercel alias: hamadad-phi.vercel.app (hamadad.vercel.app is NOT ours); never redirected.

## Domain migration (2026-10-19)
- Moved from hamadad.sadot.click (plan: C:\ClaudeProjects\domain-migration\MIGRATION.md).
- The old host stays attached to the Vercel project (at least until 2027-12-31) and answers
  308 to the same path on the new host, query kept, `moved=1` added (`next.config.ts`
  `redirects()`, host-matched).
- `app/components/MovedBanner.tsx` (mounted once in app/layout.tsx) shows a Hebrew "we moved"
  notice only when `moved=1` is present, then strips it from the URL. Colours: the
  `--moved-banner-*` variables in app/globals.css.
- Every page's canonical names its own path on the new host (`metadataBase` + canonical `./`
  in app/layout.tsx).
- `public/llms.txt` is a stale copy of the hub's file, left untouched on purpose (Samuel,
  2026-10-19 - the migration cleanup session decides).
- Until 2026-11-19 (or an IT allow-list of *.sadotlab.com) Allot's firewall blocks the new
  domain as newly-registered-domain; hamadad-phi.vercel.app is the fallback.

## Key Rules
- ALL text Hebrew (RTL) unless explicitly English
- Root layout: `<html lang="he" dir="rtl">`
- No database — data from CSV/JSON in public/data/
- Data pipeline is in ../tsarchan-index/ (Python)

## Pages
- `/` — Main dashboard: KPI cards, index chart, product table, regional teaser, insights teaser
- `/regions` — Regional price comparison (5 areas)
- `/insights` — Price increases/decreases, chain gaps
- `/api/hamadad` — API route fetching index data

## Data Files (public/data/)
- index.csv — Daily price index + CBS CPI
- products.json — 37 products with chain prices
- regions.json — 5 regional indices
- insights.json — Top increases/decreases/gaps

## Environment Variables
None required for the app itself.

## Deployment
npx next build && npx vercel --prod --yes --archive=tgz
(`--archive=tgz` is required on Windows. The CLI ships the WORKING TREE; the madad-daily
scheduled task deploys it every day ~09:00, so never leave the tree half-edited across that time.)
