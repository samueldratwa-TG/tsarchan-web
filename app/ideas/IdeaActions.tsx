"use client";

import { useState } from "react";
import { Hand } from "lucide-react";

export function IdeaActions({ ideaNumber }: { ideaNumber: number }) {
  const [claiming, setClaiming] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimerName, setClaimerName] = useState("");
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    if (!claimerName.trim()) return;
    setClaiming(true);
    try {
      const res = await fetch(`/api/ideas/${ideaNumber}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimerName: claimerName.trim() }),
      });
      if (res.ok) setClaimed(true);
    } catch {
      // silent fail
    }
    setClaiming(false);
  };

  if (claimed) {
    return (
      <span className="text-xs text-status-live font-medium">
        נתפס! 🎉
      </span>
    );
  }

  if (showClaimForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={claimerName}
          onChange={(e) => setClaimerName(e.target.value)}
          placeholder="השם שלך"
          className="w-28 rounded-md border border-border-subtle bg-bg-primary px-2 py-1 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={handleClaim}
          disabled={claiming || !claimerName.trim()}
          className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          {claiming ? "..." : "אישור"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowClaimForm(true)}
      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
    >
      <Hand size={12} />
      אני עובד על זה
    </button>
  );
}
