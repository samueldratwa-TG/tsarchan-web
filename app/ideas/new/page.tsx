"use client";

import { useState } from "react";
import { Send, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewIdeaPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [type, setType] = useState<"new-idea" | "improvement">("new-idea");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (title.length < 10) {
      setErrorMsg("הכותרת חייבת להכיל לפחות 10 תווים");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ideas/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, authorName, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בשליחה");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "שגיאה בשליחה");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-12 text-center">
        <div className="rounded-2xl border border-border-subtle bg-bg-primary p-12">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            הרעיון נשלח בהצלחה!
          </h1>
          <p className="text-text-secondary mb-6">
            תודה על ההצעה. הרעיון יופיע בלוח הרעיונות בקרוב.
          </p>
          <Link
            href="/ideas"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            <ArrowRight size={14} />
            חזרה לרעיונות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-6 py-12">
      <Link
        href="/ideas"
        className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors mb-6"
      >
        <ArrowRight size={14} />
        חזרה לרעיונות
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mb-2">
        הציעו רעיון חדש
      </h1>
      <p className="text-text-secondary mb-8">
        יש לכם רעיון לכלי חדש או שיפור לכלי קיים? ספרו לנו!
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot */}
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
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            סוג ההצעה
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("new-idea")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                type === "new-idea"
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border-subtle text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              ✨ רעיון חדש
            </button>
            <button
              type="button"
              onClick={() => setType("improvement")}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                type === "improvement"
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border-subtle text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              🔄 שיפור לכלי קיים
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            כותרת *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={10}
            placeholder="תארו בקצרה את הרעיון"
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            תיאור
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="פרטו על הרעיון — מה הבעיה שזה פותר? למי זה מיועד?"
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="authorName"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            שם *
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            placeholder="השם שלכם"
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {status === "sending" ? "שולח..." : "שלח רעיון"}
        </button>
      </form>
    </div>
  );
}
