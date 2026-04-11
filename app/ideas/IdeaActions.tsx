"use client";

import { useState, useEffect } from "react";
import { Hand, ThumbsUp } from "lucide-react";

function getVotedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("voted-ideas") || "[]");
  } catch {
    return [];
  }
}

function markVoted(ideaNumber: number) {
  const voted = getVotedIds();
  if (!voted.includes(ideaNumber)) {
    voted.push(ideaNumber);
    localStorage.setItem("voted-ideas", JSON.stringify(voted));
  }
}

export function VoteButton({
  ideaNumber,
  initialVotes,
}: {
  ideaNumber: number;
  initialVotes: number;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setHasVoted(getVotedIds().includes(ideaNumber));
  }, [ideaNumber]);

  const handleVote = async () => {
    if (hasVoted || voting) return;
    setVoting(true);

    // Optimistic update
    setVotes((v) => v + 1);
    setHasVoted(true);
    markVoted(ideaNumber);

    try {
      await fetch(`/api/ideas/${ideaNumber}/vote`, { method: "POST" });
    } catch {
      // Already updated optimistically — leave it
    }
    setVoting(false);
  };

  return (
    <button
      onClick={handleVote}
      disabled={hasVoted}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        hasVoted
          ? "bg-accent/10 text-accent cursor-default"
          : "bg-bg-tertiary text-text-secondary hover:bg-accent/10 hover:text-accent"
      }`}
      title={hasVoted ? "כבר הצבעת" : "הצביעו לרעיון הזה"}
    >
      <ThumbsUp size={13} />
      {votes}
    </button>
  );
}

export function ClaimButton({ ideaNumber }: { ideaNumber: number }) {
  const [claiming, setClaiming] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
      // silent
    }
    setClaiming(false);
  };

  if (claimed) {
    return <span className="text-xs text-status-live font-medium">נתפס! 🎉</span>;
  }

  if (showForm) {
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
      onClick={() => setShowForm(true)}
      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
    >
      <Hand size={12} />
      אני עובד על זה
    </button>
  );
}
