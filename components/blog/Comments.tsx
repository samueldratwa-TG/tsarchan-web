"use client";

import { useState, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

interface Comment {
  id: number;
  authorName: string;
  body: string;
  createdAt: string;
}

export function Comments({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?slug=${postSlug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot || !name.trim() || !body.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: postSlug, name: name.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setBody("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="mt-12 pt-8 border-t border-border-subtle">
      <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
        <MessageCircle size={20} />
        תגובות {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Existing comments */}
      {loaded && comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-border-subtle bg-bg-secondary p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-text-primary">
                  {comment.authorName}
                </span>
                <span className="text-xs text-text-tertiary">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {loaded && comments.length === 0 && (
        <p className="text-sm text-text-tertiary mb-6">
          עדיין אין תגובות — היו הראשונים להגיב!
        </p>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium text-text-primary mb-1">
            שם *
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="comment-body" className="block text-sm font-medium text-text-primary mb-1">
            תגובה *
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
            {status === "sending" ? "שולח..." : "שלח תגובה"}
          </button>
          {status === "success" && (
            <span className="text-sm text-status-live">התגובה נשלחה!</span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-500">שגיאה בשליחה</span>
          )}
        </div>
      </form>
    </div>
  );
}
