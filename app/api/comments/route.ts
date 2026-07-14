import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";

function getHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

interface GitHubComment {
  id: number;
  body: string;
  created_at: string;
}

function extractAuthorName(body: string): string {
  const match = body.match(/^\*\*(.+?)\*\*/);
  return match ? match[1] : "אנונימי";
}

function extractCommentBody(body: string): string {
  return body.replace(/^\*\*.+?\*\*\n+/, "").trim();
}

// Find the GitHub issue holding a post's comments (read-only, used by GET)
async function findCommentIssue(slug: string): Promise<number | null> {
  const label = `comments:${slug}`;
  const searchRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues?labels=${encodeURIComponent(label)}&state=open&per_page=1`,
    { headers: getHeaders() }
  );
  if (searchRes.ok) {
    const issues = await searchRes.json();
    if (issues.length > 0) return issues[0].number;
  }
  return null;
}

// Find or create a GitHub issue for a blog post's comments (POST only — a GET
// must never create issues, or any unauthenticated read could spam the repo)
async function getOrCreateCommentIssue(slug: string): Promise<number> {
  const existing = await findCommentIssue(slug);
  if (existing !== null) return existing;
  const label = `comments:${slug}`;

  // Create new issue for this post
  const createRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `תגובות: ${slug}`,
        body: `תגובות על הפוסט: ${slug}\n\nאל תמחקו issue זה — הוא משמש לאחסון תגובות.`,
        labels: [label],
      }),
    }
  );
  if (!createRes.ok) throw new Error("Failed to create comment issue");
  const issue = await createRes.json();
  return issue.number;
}

// GET — list comments for a post
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json([]);

  try {
    const issueNumber = await findCommentIssue(slug);
    if (issueNumber === null) return NextResponse.json([]);
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/comments?per_page=50&sort=created&direction=asc`,
      { headers: getHeaders(), next: { revalidate: 60 } }
    );
    if (!res.ok) return NextResponse.json([]);

    const ghComments: GitHubComment[] = await res.json();
    const comments = ghComments.map((c) => ({
      id: c.id,
      authorName: extractAuthorName(c.body),
      body: extractCommentBody(c.body),
      createdAt: c.created_at,
    }));

    return NextResponse.json(comments);
  } catch {
    return NextResponse.json([]);
  }
}

// POST — add a comment
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`comments:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "יותר מדי תגובות. נסו שוב מאוחר יותר." },
      { status: 429 }
    );
  }

  try {
    const { slug, name, body } = await request.json();
    if (!slug || !name?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "שם ותגובה הם שדות חובה" }, { status: 400 });
    }

    const issueNumber = await getOrCreateCommentIssue(slug);
    const commentBody = `**${name.trim()}**\n\n${body.trim()}`;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      }
    );

    if (!res.ok) throw new Error("Failed to post comment");
    const ghComment: GitHubComment = await res.json();

    return NextResponse.json({
      id: ghComment.id,
      authorName: name.trim(),
      body: body.trim(),
      createdAt: ghComment.created_at,
    });
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחה" }, { status: 500 });
  }
}
