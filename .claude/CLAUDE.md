# הצרחן הנבון (tsarchan-web) — Claude Code Instructions

## What This Is
Personal brand + app portfolio + blog + community ideas board at sadot.click.
Hebrew-first (RTL), LIGHT theme default (dark toggle), desktop-first, Next.js 16.

## Stack
- Next.js 16 (App Router, TypeScript, SSG for blog, ISR for ideas)
- Tailwind CSS 4
- MDX via next-mdx-remote + gray-matter
- GitHub Issues API for Ideas feature
- Resend API for contact form (key in env)
- Deployed on Vercel free tier
- Domain: sadot.click (AWS Route 53)

## Key Rules
- ALL text Hebrew (RTL) unless explicitly English (app names, code)
- Root layout: `<html lang="he" dir="rtl">`
- LIGHT theme default, dark available via toggle. Use CSS variables everywhere.
- COLOR-BLIND SAFE: Never use color alone. Always pair with icon + text label.
- WCAG AA contrast ratios required on all text.
- Mobile-first Tailwind CSS, but desktop is the primary design target.
- Fonts: Heebo (Hebrew), DM Sans (English UI), JetBrains Mono (code)
- No database. Blog = MDX files. Ideas = GitHub Issues. Contact = Resend.
- SEO is the PRIMARY goal. Every page needs: metadata, JSON-LD, canonical URL, OG tags.
- Every app card and blog post must link to the app's subdomain (= backlinks).
- Footer is MINIMAL: logo + contact link + FAQ link. Nothing else.

## App Subdomains (ALL LIVE)
- il-taxi-price-estimator.sadot.click (taxi fare calculator)
- shivatime.sadot.click (shiva visit coordination)
- flightstatus.sadot.click (flight status tracker)
- smart-power-calc.sadot.click (Israeli electricity plan comparison)
- hamadad.sadot.click (daily food price index)

## Blog Posts
- MDX files in content/blog/ with frontmatter (title, seoTitle, date, excerpt, tags, app, published)
- seoTitle used for <title> tag, title for display
- Custom MDX components: Callout, AppLinkCard, CodeBlock
- generateStaticParams from file list

## Ideas Feature
- GitHub Issues API on repo defined in GITHUB_REPO env var
- GITHUB_TOKEN env var for API access
- Rate limited: 5 submissions/hour/IP
- Labels for status: status:new, status:wip, status:done
- Labels for type: type:improvement, type:new-idea

## Contact Form
- Resend API key in RESEND_API_KEY env var
- Sends to samuel.dratwa@gmail.com
- Rate limited: 3/hour/IP

## Environment Variables Needed
GITHUB_TOKEN=       # Fine-grained PAT for ideas repo
GITHUB_REPO=        # e.g., samueldratwa-TG/tsarchan-ideas
RESEND_API_KEY=     # re_U63aAvrM_JoujdEFzq8qn6GuaWNXAEb59
NEXT_PUBLIC_SITE_URL=https://sadot.click

## Deployment
npx next build && npx vercel --prod
