"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown, ExternalLink, Inbox } from "lucide-react";

type Recommendation = "Strong Hire" | "Hire" | "Maybe" | "Reject";

interface InterviewRow {
  id: string;
  candidates: { name: string; email: string };
  scores: {
    overall_score: number;
    recommendation: Recommendation;
  } | null;
  started_at: string;
  completed_at: string | null;
}

interface InterviewTableProps {
  interviews: InterviewRow[];
}

const recommendationConfig: Record<
  Recommendation,
  { color: string; bg: string; border: string }
> = {
  "Strong Hire": {
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.3)",
  },
  Hire: {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.3)",
  },
  Maybe: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.3)",
  },
  Reject: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.3)",
  },
};

function getScoreColor(score: number): string {
  if (score >= 4.5) return "#10B981";
  if (score >= 3.5) return "#3B82F6";
  if (score >= 2.5) return "#F59E0B";
  return "#EF4444";
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SortField = "date" | "score";
type SortDir = "asc" | "desc";

const FILTER_OPTIONS: (Recommendation | "All")[] = [
  "All",
  "Strong Hire",
  "Hire",
  "Maybe",
  "Reject",
];

export default function InterviewTable({ interviews }: InterviewTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Recommendation | "All">("All");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let rows = interviews;

    if (filter !== "All") {
      rows = rows.filter((r) => r.scores?.recommendation === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.candidates.name.toLowerCase().includes(q) ||
          r.candidates.email.toLowerCase().includes(q)
      );
    }

    rows = [...rows].sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.completed_at || a.started_at).getTime();
        const dateB = new Date(b.completed_at || b.started_at).getTime();
        return sortDir === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const scoreA = a.scores?.overall_score ?? 0;
        const scoreB = b.scores?.overall_score ?? 0;
        return sortDir === "asc" ? scoreA - scoreB : scoreB - scoreA;
      }
    });

    return rows;
  }, [interviews, filter, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5" />
      )
    ) : (
      <ChevronDown className="w-3.5 h-3.5 opacity-30" />
    );

  if (interviews.length === 0 && !search && filter === "All") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 mt-8 bg-white rounded-2xl border border-brand-border">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-10 h-10 text-brand-text-muted" />
        </div>
        <h3 className="text-xl font-bold text-brand-text-heading mb-2">No interviews yet</h3>
        <p className="text-brand-text-body text-center max-w-sm">
          Share the interview link with candidates to get started. Once they complete their assessment, scorecards will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                filter === opt
                  ? {
                      background: "#FF6B35",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)"
                    }
                  : {
                      background: "transparent",
                      color: "#718096",
                    }
              }
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border-2 border-brand-border rounded-xl text-sm text-brand-text-heading placeholder-brand-text-muted focus:outline-none focus:border-brand-primary transition-colors w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-border bg-gray-50">
              <th className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider hidden md:table-cell">
                Email
              </th>
              <th
                className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date <SortIcon field="date" />
                </div>
              </th>
              <th
                className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider cursor-pointer hover:text-brand-primary transition-colors"
                onClick={() => toggleSort("score")}
              >
                <div className="flex items-center gap-1">
                  Score <SortIcon field="score" />
                </div>
              </th>
              <th className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">
                Verdict
              </th>
              <th className="px-5 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider hidden lg:table-cell">
                Duration
              </th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-brand-text-muted font-medium"
                >
                  No matching interviews found for filters
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => {
                const rec = row.scores?.recommendation as Recommendation | undefined;
                const recConfig = rec ? recommendationConfig[rec] : null;
                const scoreColor = row.scores
                  ? getScoreColor(row.scores.overall_score)
                  : "#718096";

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-brand-border hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(`/dashboard/home/${row.id}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <span className="font-bold text-brand-text-heading text-sm">
                        {row.candidates.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-brand-text-body text-sm font-medium hidden md:table-cell">
                      {row.candidates.email}
                    </td>
                    <td className="px-5 py-4 text-brand-text-muted text-sm font-medium">
                      {formatDate(row.completed_at || row.started_at)}
                    </td>
                    <td className="px-5 py-4">
                      {row.scores ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: scoreColor }}
                          />
                          <span
                            className="font-bold text-sm"
                            style={{ color: scoreColor }}
                          >
                            {Number(row.scores.overall_score).toFixed(1)}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-brand-text-muted text-sm font-medium">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {recConfig && rec ? (
                        <span
                          className="px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{
                            color: recConfig.color,
                            backgroundColor: recConfig.bg,
                            border: `1px solid ${recConfig.border}`,
                          }}
                        >
                          {rec}
                        </span>
                      ) : (
                        <span className="text-brand-text-muted text-sm font-medium">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-brand-text-muted text-sm font-medium hidden lg:table-cell">
                      {formatDuration(row.started_at, row.completed_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-brand-primary transition-colors inline-block" />
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-brand-text-muted text-xs font-medium text-right mt-1">
        Showing {filtered.length} of {interviews.length} interviews
      </p>
    </div>
  );
}
