"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Solution = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

function PollBar({
  solution,
  totalVotes,
  onVote,
  rank,
}: {
  solution: Solution;
  totalVotes: number;
  onVote: () => void;
  rank: number;
}) {
  const pct = totalVotes > 0 ? (solution.votes / totalVotes) * 100 : 0;
  const isLeading = rank === 0 && totalVotes > 0;

  return (
    <button
      onClick={onVote}
      className="group relative w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
    >
      {/* Animated fill bar */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: isLeading
            ? "linear-gradient(90deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))"
            : "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.06))",
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 leading-snug">{solution.body}</p>
          {solution.author && (
            <p className="mt-1 text-[11px] text-white/40">— {solution.author}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-white/50 tabular-nums">
            {pct.toFixed(0)}%
          </span>
          <span
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums transition-colors ${
              isLeading
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-white/[0.06] text-white/60"
            }`}
          >
            <span className="text-[10px] opacity-60">▲</span>
            {solution.votes}
          </span>
        </div>
      </div>
    </button>
  );
}

function QuestionCard({
  q,
  onUpvote,
}: {
  q: Question;
  onUpvote: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [newSolution, setNewSolution] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadSolutions() {
    if (!expanded) {
      setExpanded(true);
      setLoadingSolutions(true);
      try {
        const res = await fetch(`/api/questions/${q.id}/solutions`);
        const data = await res.json();
        setSolutions(data.solutions ?? []);
      } catch {
        /* ignore */
      }
      setLoadingSolutions(false);
    } else {
      setExpanded(false);
    }
  }

  async function voteSolution(solutionId: string) {
    // Optimistic update
    setSolutions((sols) =>
      sols.map((s) => (s.id === solutionId ? { ...s, votes: s.votes + 1 } : s))
    );

    const res = await fetch(
      `/api/questions/${q.id}/solutions/${solutionId}/vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: getVoterId() }),
      }
    );

    if (!res.ok) {
      setSolutions((sols) =>
        sols.map((s) =>
          s.id === solutionId ? { ...s, votes: s.votes - 1 } : s
        )
      );
    }
  }

  async function addSolution() {
    if (!newSolution.trim()) return;
    setAdding(true);

    const res = await fetch(`/api/questions/${q.id}/solutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newSolution }),
    });

    if (res.ok) {
      const created = await res.json();
      setSolutions((sols) => [...sols, { ...created, votes: 0 }]);
      setNewSolution("");
    }
    setAdding(false);
  }

  const totalVotes = solutions.reduce((sum, s) => sum + s.votes, 0);
  const sorted = [...solutions].sort((a, b) => b.votes - a.votes);

  return (
    <li className="group rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300 hover:border-white/[0.1] hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start gap-3 p-4">
        {/* Upvote button */}
        <button
          onClick={() => onUpvote(q.id)}
          className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-indigo-400 transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/5"
        >
          <span className="text-xs leading-none">▲</span>
          <span className="text-sm font-semibold leading-none tabular-nums">
            {q.votes}
          </span>
        </button>

        {/* Question content */}
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="leading-snug text-white/90">{q.body}</p>
          <div className="mt-2 flex items-center gap-3">
            {q.author && (
              <span className="text-xs text-white/40">{q.author}</span>
            )}
            <button
              onClick={loadSolutions}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400/80 transition-colors hover:text-indigo-300"
            >
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {expanded ? "Hide" : "Solutions"} Poll
            </button>
          </div>
        </div>
      </div>

      {/* Expandable poll section */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-4 py-3 space-y-2.5 animate-in">
          {loadingSolutions ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
            </div>
          ) : (
            <>
              {solutions.length > 0 && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                    Vote for the best solution
                  </span>
                  <span className="text-[11px] text-white/30 tabular-nums">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                {sorted.map((s, i) => (
                  <PollBar
                    key={s.id}
                    solution={s}
                    totalVotes={totalVotes}
                    onVote={() => voteSolution(s.id)}
                    rank={i}
                  />
                ))}
              </div>

              {solutions.length === 0 && (
                <p className="text-center text-xs text-white/30 py-2">
                  No solutions yet — add one below!
                </p>
              )}

              {/* Add solution */}
              <div className="flex gap-2 pt-1">
                <input
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSolution()}
                  placeholder="Suggest a solution…"
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/90 outline-none placeholder:text-white/30 focus:border-indigo-500/30 transition-colors"
                />
                <button
                  onClick={addSolution}
                  disabled={adding}
                  className="rounded-lg bg-indigo-500/20 px-3 py-2 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/30 disabled:opacity-50"
                >
                  {adding ? "…" : "+ Add"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const created = await res.json();
    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });
    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, votes: q.votes - 1 } : q))
      );
    }
  }

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Ask box */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 shadow-lg shadow-black/10">
        <div className="flex gap-2">
          <input
            id="ask-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-indigo-500/40 transition-colors"
          />
          <button
            id="ask-button"
            onClick={submit}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 active:scale-95"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Search + hydration */}
      <div className="flex items-center gap-3">
        <input
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-4 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-indigo-500/40 transition-colors"
        />
        <span className="shrink-0 text-xs text-white/30">
          {hydrated ? "Interactive ✓" : "Loading…"}
        </span>
      </div>

      {/* Questions list */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <QuestionCard key={q.id} q={q} onUpvote={upvote} />
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/[0.1] p-8 text-center text-sm text-white/40">
          No questions yet — be the first to ask.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            id="load-more-button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-indigo-500/30 hover:text-indigo-300 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
