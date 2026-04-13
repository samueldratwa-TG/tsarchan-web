# המדד של הצרחן הנבון (hamadad) — Claude Code Instructions

## What This Is
Daily Israeli food price index at hamadad.sadot.click.
Hebrew-first (RTL), Next.js 16, Tailwind CSS, Recharts.

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Recharts (charts)
- Font: Assistant (Hebrew)
- Deployed on Vercel free tier
- Domain: hamadad.sadot.click (AWS Route 53)

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
npx next build && npx vercel --prod --yes
