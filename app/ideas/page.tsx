import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Lightbulb, Wrench, CheckCircle, Sparkles, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "רעיונות לכלים חדשים — הצרחן הנבון",
  description:
    "הציעו רעיונות לכלים חדשים, קחו פרויקט לפיתוח, או שפרו כלים קיימים — הקהילה של הצרחן הנבון",
  alternates: { canonical: "https://sadot.click/ideas" },
};

interface Idea {
  id: number;
  number: number;
  title: string;
  description: string;
  authorName: string;
  status: "new" | "wip" | "done";
  type: "new-idea" | "improvement";
  createdAt: string;
}

const statusConfig = {
  new: { label: "חדש", icon: Lightbulb, color: "bg-status-soon/10 text-status-soon" },
  wip: { label: "בפיתוח", icon: Wrench, color: "bg-status-wip/10 text-status-wip" },
  done: { label: "הושלם", icon: CheckCircle, color: "bg-status-live/10 text-status-live" },
};

const typeConfig = {
  "new-idea": { label: "רעיון חדש", icon: Sparkles, color: "text-accent-warm" },
  improvement: { label: "שיפור לכלי קיים", icon: RefreshCw, color: "text-accent" },
};

async function getIdeas(): Promise<Idea[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sadot.click";
    const res = await fetch(`${baseUrl}/api/ideas`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function IdeasPage() {
  const ideas = await getIdeas();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            רעיונות לכלים חדשים
          </h1>
          <p className="text-text-secondary">
            הציעו רעיונות, קחו פרויקט לפיתוח, או שפרו כלים קיימים
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          הציעו רעיון
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-12 text-center">
          <Lightbulb size={40} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-text-secondary mb-4">
            עדיין אין רעיונות — היו הראשונים להציע!
          </p>
          <Link
            href="/ideas/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            הציעו רעיון
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ideas.map((idea) => {
            const sc = statusConfig[idea.status];
            const tc = typeConfig[idea.type];
            const StatusIcon = sc.icon;
            const TypeIcon = tc.icon;

            return (
              <div
                key={idea.id}
                className="rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${sc.color}`}
                  >
                    <StatusIcon size={12} />
                    {sc.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${tc.color}`}
                  >
                    <TypeIcon size={12} />
                    {tc.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {idea.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                  {idea.description}
                </p>
                <div className="text-xs text-text-tertiary">
                  הוגש על ידי {idea.authorName}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
