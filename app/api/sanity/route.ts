import { NextResponse } from "next/server";
import { Resend } from "resend";

const SITE_URL = "https://sadot.click";
const NOTIFY_EMAIL = "samuel.dratwa@gmail.com";

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

// ─── Auto-discover app links from /apps page ───
async function discoverAppUrls(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE_URL}/apps`, { redirect: "follow" });
    const html = await res.text();
    // Extract all external links to *.sadot.click subdomains
    const regex = /href="(https:\/\/[a-z0-9-]+\.sadot\.click)"/g;
    const urls = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
      const url = match[1];
      // Exclude the main site itself
      if (!url.match(/^https:\/\/(www\.)?sadot\.click$/)) {
        urls.add(url);
      }
    }
    return Array.from(urls);
  } catch {
    return [];
  }
}

// ─── Auto-discover blog post links from /blog page ───
async function discoverBlogSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${SITE_URL}/blog`, { redirect: "follow" });
    const html = await res.text();
    const regex = /href="\/blog\/([a-z0-9-]+)"/g;
    const slugs = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
      slugs.add(match[1]);
    }
    return Array.from(slugs);
  } catch {
    return [];
  }
}

// ─── Check: App subdomain is live and not redirecting to main site ───
async function checkAppLink(url: string): Promise<CheckResult> {
  const name = `App: ${new URL(url).hostname}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const finalUrl = res.url;
    const finalHost = new URL(finalUrl).hostname;

    if (!res.ok) {
      return { name, passed: false, detail: `returned ${res.status}` };
    }

    // The critical check: final URL must NOT be sadot.click (the hamadad bug)
    if (finalHost === "sadot.click" || finalHost === "www.sadot.click") {
      return {
        name,
        passed: false,
        detail: `redirects to ${finalHost} (expected to stay on subdomain)`,
      };
    }

    return { name, passed: true, detail: `OK (${res.status})` };
  } catch (err) {
    return {
      name,
      passed: false,
      detail: `fetch error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

// ─── Check: Internal page returns 200 ───
async function checkPage(path: string): Promise<CheckResult> {
  const name = `Page: ${path}`;
  try {
    const res = await fetch(`${SITE_URL}${path}`, { redirect: "follow" });
    if (!res.ok) {
      return { name, passed: false, detail: `returned ${res.status}` };
    }
    return { name, passed: true, detail: `OK (${res.status})` };
  } catch (err) {
    return {
      name,
      passed: false,
      detail: `fetch error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

// ─── Check: API route returns valid JSON ───
async function checkApi(
  path: string,
  validate?: (data: unknown) => boolean
): Promise<CheckResult> {
  const name = `API: ${path}`;
  try {
    const res = await fetch(`${SITE_URL}${path}`, { redirect: "follow" });
    if (!res.ok) {
      return { name, passed: false, detail: `returned ${res.status}` };
    }
    if (validate) {
      const data = await res.json();
      if (!validate(data)) {
        return { name, passed: false, detail: "response validation failed" };
      }
    }
    return { name, passed: true, detail: `OK (${res.status})` };
  } catch (err) {
    return {
      name,
      passed: false,
      detail: `fetch error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

// ─── Check: SEO file returns expected content-type ───
async function checkSeoFile(
  path: string,
  mustContain?: string
): Promise<CheckResult> {
  const name = `SEO: ${path}`;
  try {
    const res = await fetch(`${SITE_URL}${path}`, { redirect: "follow" });
    if (!res.ok) {
      return { name, passed: false, detail: `returned ${res.status}` };
    }
    if (mustContain) {
      const text = await res.text();
      if (!text.includes(mustContain)) {
        return {
          name,
          passed: false,
          detail: `missing expected content: "${mustContain}"`,
        };
      }
    }
    return { name, passed: true, detail: `OK (${res.status})` };
  } catch (err) {
    return {
      name,
      passed: false,
      detail: `fetch error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

// ─── Send failure email ───
async function sendFailureEmail(
  results: CheckResult[]
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const failed = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed);

  const failLines = failed
    .map((r) => `❌ ${r.name} — ${r.detail}`)
    .join("\n");
  const summary = `${failed.length} בדיקות נכשלו, ${passed.length} עברו בהצלחה.`;

  const resend = new Resend(key);
  await resend.emails.send({
    from: "הצרחן הנבון <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject: `⚠️ Sanity Check Failed — sadot.click (${failed.length} failures)`,
    text: `${summary}\n\n${failLines}\n\nFull report: ${SITE_URL}/api/sanity`,
  });
}

// ─── Main handler ───
export async function GET(request: Request) {
  // Verify cron secret in production (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow unauthenticated access if no CRON_SECRET is set (dev mode)
    // But if it IS set, enforce it
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: CheckResult[] = [];

  // 1. Discover and check all app subdomains
  const appUrls = await discoverAppUrls();
  if (appUrls.length === 0) {
    results.push({
      name: "Discovery: app links",
      passed: false,
      detail: "could not discover any app links from /apps page",
    });
  }
  for (const url of appUrls) {
    results.push(await checkAppLink(url));
  }

  // 2. Static pages
  const pages = ["/", "/apps", "/blog", "/about", "/contact", "/ideas"];
  for (const page of pages) {
    results.push(await checkPage(page));
  }

  // 3. Discover and check all blog posts
  const blogSlugs = await discoverBlogSlugs();
  for (const slug of blogSlugs) {
    results.push(await checkPage(`/blog/${slug}`));
  }

  // 4. SEO files
  results.push(await checkSeoFile("/sitemap.xml", "<urlset"));
  results.push(await checkSeoFile("/robots.txt", "Allow"));
  results.push(await checkSeoFile("/rss.xml", "<rss"));
  results.push(await checkSeoFile("/llms.txt"));

  // 5. API health
  results.push(
    await checkApi("/api/hamadad", (data: unknown) => {
      return (
        typeof data === "object" &&
        data !== null &&
        "currentValue" in data
      );
    })
  );

  // Evaluate results
  const failed = results.filter((r) => !r.passed);
  const allPassed = failed.length === 0;

  // Send email only on failure
  if (!allPassed) {
    try {
      await sendFailureEmail(results);
    } catch {
      // Don't let email failure break the response
    }
  }

  return NextResponse.json({
    status: allPassed ? "PASS" : "FAIL",
    timestamp: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: failed.length,
    results,
  });
}
