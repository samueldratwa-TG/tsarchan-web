import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Lightbulb, Wrench, CheckCircle, Sparkles, RefreshCw } from "lucide-react";
import { VoteButton, ClaimButton } from "./IdeaActions";

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
  votes: number;
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

const seedIdeas: Idea[] = [
  {
    id: -1, number: -1,
    title: "מחשבון עלות נסיעה ברכבת ישראל לעומת נסיעה ברכב פרטי",
    description: "כלי שמשווה את עלות הנסיעה ברכבת (כולל זמן הגעה לתחנה) לעומת נסיעה ברכב פרטי (דלק + כביש אגרה + חניה). יעזור להחליט מה באמת משתלם.",
    authorName: "דנה כהן",
    status: "new", type: "new-idea",
    createdAt: "2026-04-05T10:00:00Z",
    votes: 3,
  },
  {
    id: -2, number: -2,
    title: "השוואת מחירי ביטוח רכב — סוכנים מול ישיר",
    description: "הרבה אנשים לא יודעים שאפשר לחסוך מאות שקלים בשנה על ביטוח רכב. כלי שמאפשר להזין פרטי רכב ולראות הערכת מחיר ממספר חברות.",
    authorName: "יוסי לוי",
    status: "new", type: "new-idea",
    createdAt: "2026-04-03T14:00:00Z",
    votes: 1,
  },
  {
    id: -3, number: -3,
    title: "תזכורת לחידוש רישיון רכב / ביטוח / טסט",
    description: "כלי פשוט שמזכיר לך מתי צריך לחדש רישיון רכב, ביטוח חובה, ביטוח מקיף, וטסט. מזין את התאריכים פעם אחת ומקבל התראות לפני שפג התוקף.",
    authorName: "מיכל אברהם",
    status: "new", type: "new-idea",
    createdAt: "2026-03-28T09:00:00Z",
    votes: 5,
  },
  {
    id: -4, number: -4,
    title: "הוספת גרף מגמה שבועית למדד המזון",
    description: "במדד של הצרחן הנבון, להוסיף גרף קטן שמראה את המגמה של השבוע האחרון — האם המחירים עלו או ירדו ובאיזה קצב.",
    authorName: "עמית רז",
    status: "new", type: "improvement",
    createdAt: "2026-03-25T11:00:00Z",
    votes: 2,
  },
  {
    id: -5, number: -5,
    title: "מצב נהג במחשבון המוניות — הזנה ידנית של קילומטרים",
    description: "ממשק פשוט לנהגי מונית: להזין קילומטרים ושעות ידנית ולקבל חישוב מדויק, בלי GPS. שימושי לנסיעות הלוך-חזור ולסיכומים יומיים.",
    authorName: "נועה שלום",
    status: "wip", type: "improvement",
    createdAt: "2026-03-20T16:00:00Z",
    votes: 4,
  },
];

async function getApiIdeas(): Promise<Idea[]> {
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
  const apiIdeas = await getApiIdeas();
  // Always show seed ideas + any ideas from API
  const allIdeas = [...apiIdeas, ...seedIdeas];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors shrink-0"
        >
          <Plus size={16} />
          הציעו רעיון
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allIdeas.map((idea) => {
          const sc = statusConfig[idea.status];
          const tc = typeConfig[idea.type];
          const StatusIcon = sc.icon;
          const TypeIcon = tc.icon;

          return (
            <div
              key={idea.id}
              className="rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm hover:shadow-md transition-all"
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
              <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                {idea.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  הוגש על ידי {idea.authorName}
                </span>
                <div className="flex items-center gap-2">
                  {idea.number > 0 && (
                    <VoteButton ideaNumber={idea.number} initialVotes={idea.votes} />
                  )}
                  {idea.number < 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-bg-tertiary px-3 py-1.5 text-xs font-semibold text-text-tertiary">
                      👍 {idea.votes}
                    </span>
                  )}
                  {idea.status === "new" && idea.number > 0 && (
                    <ClaimButton ideaNumber={idea.number} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
