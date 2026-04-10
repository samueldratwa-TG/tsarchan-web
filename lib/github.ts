const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";

interface GitHubLabel {
  name: string;
  color: string;
}

interface GitHubUser {
  login: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  labels: GitHubLabel[];
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  state: string;
}

export interface Idea {
  id: number;
  number: number;
  title: string;
  description: string;
  authorName: string;
  status: "new" | "wip" | "done";
  type: "new-idea" | "improvement";
  createdAt: string;
  updatedAt: string;
}

function getHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function mapStatus(labels: GitHubLabel[]): Idea["status"] {
  if (labels.some((l) => l.name === "status:done")) return "done";
  if (labels.some((l) => l.name === "status:wip")) return "wip";
  return "new";
}

function mapType(labels: GitHubLabel[]): Idea["type"] {
  if (labels.some((l) => l.name === "type:improvement")) return "improvement";
  return "new-idea";
}

function extractAuthorName(body: string | null): string {
  if (!body) return "אנונימי";
  const match = body.match(/\*\*מגיש:\*\*\s*(.+)/);
  return match ? match[1].trim() : "אנונימי";
}

function extractDescription(body: string | null): string {
  if (!body) return "";
  return body.replace(/\*\*מגיש:\*\*\s*.+\n?/, "").trim();
}

function mapIssue(issue: GitHubIssue): Idea {
  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    description: extractDescription(issue.body),
    authorName: extractAuthorName(issue.body),
    status: mapStatus(issue.labels),
    type: mapType(issue.labels),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
  };
}

export async function listIdeas(): Promise<Idea[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&labels=&per_page=50&sort=created&direction=desc`,
    { headers: getHeaders(), next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const issues: GitHubIssue[] = await res.json();
  return issues.map(mapIssue);
}

export async function createIdea(
  title: string,
  description: string,
  authorName: string,
  type: "new-idea" | "improvement"
): Promise<Idea> {
  const body = `${description}\n\n**מגיש:** ${authorName}`;
  const labels = [`status:new`, `type:${type}`];

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, labels }),
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const issue: GitHubIssue = await res.json();
  return mapIssue(issue);
}

export async function claimIdea(
  issueNumber: number,
  claimerName: string
): Promise<void> {
  // Add wip label
  await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/labels`,
    {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ labels: ["status:wip"] }),
    }
  );

  // Remove new label
  await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/labels/status:new`,
    { method: "DELETE", headers: getHeaders() }
  ).catch(() => {});

  // Add comment
  await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`,
    {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        body: `🔧 **${claimerName}** לקח/ה את הפרויקט הזה לפיתוח`,
      }),
    }
  );
}
