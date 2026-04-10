"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
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
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            ההודעה נשלחה בהצלחה!
          </h1>
          <p className="text-text-secondary">
            תודה על הפנייה. אחזור אליכם בהקדם.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-6 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">צור קשר</h1>
      <p className="text-text-secondary mb-8">
        שאלה, הצעה, באג, או סתם רוצים להגיד שלום — מוזמנים לכתוב
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
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            שם *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            אימייל *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            הודעה *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
          />
        </div>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {status === "sending" ? "שולח..." : "שלח"}
        </button>
      </form>
    </div>
  );
}
