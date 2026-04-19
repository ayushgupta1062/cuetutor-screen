"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, UserX, Target, Star, Search, RefreshCw, BarChart2, Inbox, Zap, AlertCircle } from "lucide-react";

export default function DashboardHome() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [rescoring, setRescoring] = useState(false);
  const [rescoreResult, setRescoreResult] = useState<{ succeeded: number; failed: number } | null>(null);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/interviews", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/dashboard/login", { method: "DELETE" });
    router.push("/dashboard");
  };

  // ── Rescore interviews that are missing scores ────────────────────────────
  const handleRescore = async () => {
    setRescoring(true);
    setRescoreResult(null);
    try {
      const res = await fetch("/api/admin/rescore?only_missing=true");
      const data = await res.json();
      setRescoreResult({ succeeded: data.succeeded ?? 0, failed: data.failed ?? 0 });
      // Refresh the list
      await fetchInterviews();
    } catch (err) {
      console.error("Rescore error:", err);
    } finally {
      setRescoring(false);
    }
  };

  const calculateStats = () => {
    const total = interviews.length;
    const strongHires = interviews.filter(i => i.scores?.recommendation === "Strong Hire").length;
    const hires = interviews.filter(i => i.scores?.recommendation === "Hire").length;
    const maybe = interviews.filter(i => i.scores?.recommendation === "Maybe").length;
    const rejects = interviews.filter(i => i.scores?.recommendation === "Reject").length;
    const pendingScore = interviews.filter(i => !i.scores).length;

    const scored = interviews.filter(i => i.scores?.overall_score);
    const avgScore = scored.length > 0
      ? (scored.reduce((acc, curr) => acc + (curr.scores?.overall_score || 0), 0) / scored.length).toFixed(1)
      : "0.0";

    return { total, strongHires, hires, maybe, rejects, avgScore, pendingScore };
  };

  const stats = calculateStats();

  const filteredInterviews = interviews.filter(interview => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Pending" && !interview.scores) ||
      interview.scores?.recommendation === filter;
    const matchesSearch =
      interview.candidates?.name?.toLowerCase().includes(search.toLowerCase()) ||
      interview.candidates?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBadgeStyle = (recommendation: string): React.CSSProperties => {
    switch (recommendation) {
      case "Strong Hire": return { background: "linear-gradient(135deg, #00B894 0%, #00CEC9 100%)", color: "white" };
      case "Hire": return { background: "#0D9488", color: "white" };
      case "Maybe": return { background: "#E17055", color: "white" };
      case "Reject": return { background: "#DC2626", color: "white" };
      default: return { background: "#E2E8F0", color: "#4A5568" };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
      {/* TOP NAV */}
      <div className="bg-white sticky top-0 z-30" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shrink-0" style={{ background: "var(--cue-green)" }}>C</div>
            <div className="min-w-0">
              <h1 className="font-[800] text-[var(--text-primary)] tracking-tight text-[15px] sm:text-[18px] truncate">Hiring Dashboard</h1>
              <p className="hidden xs:block text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider truncate">Tutor Evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Rescore Missing Scores button */}
            {stats.pendingScore > 0 && (
              <button
                onClick={handleRescore}
                disabled={rescoring}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-[700] text-white transition-all hover:-translate-y-[1px] disabled:opacity-70"
                style={{ background: "var(--gradient-orange)", boxShadow: "0 4px 16px rgba(225,112,85,0.3)" }}
              >
                <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${rescoring ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">{rescoring ? "Scoring…" : `Score ${stats.pendingScore} Missing`}</span>
                <span className="sm:hidden">{stats.pendingScore}</span>
              </button>
            )}
            <button
              onClick={fetchInterviews}
              className="p-1.5 sm:p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--cue-green)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? "animate-spin text-[var(--cue-green)]" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-[13px] font-[700] rounded-xl transition-colors border-2"
              style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-20">

        {/* Rescore result banner */}
        <AnimatePresence>
          {rescoreResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-[14px] font-[600]"
              style={{
                background: rescoreResult.failed === 0 ? "rgba(0,184,148,0.1)" : "rgba(225,112,85,0.1)",
                border: `1px solid ${rescoreResult.failed === 0 ? "var(--cue-green)" : "var(--cue-orange)"}`,
                color: rescoreResult.failed === 0 ? "var(--cue-green-dark)" : "var(--cue-orange)"
              }}
            >
              {rescoreResult.failed === 0
                ? `✓ Successfully scored ${rescoreResult.succeeded} interview${rescoreResult.succeeded !== 1 ? "s" : ""}. Dashboard updated.`
                : `⚠ Scored ${rescoreResult.succeeded}, failed ${rescoreResult.failed}. Check server logs for details.`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS ROW */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-10"
        >
          {[
            { label: "Total Completed", val: stats.total, icon: Users, color: "#1A2332" },
            { label: "Avg Score", val: `${stats.avgScore}/5`, icon: BarChart2, color: "#8A2BE2" },
            { label: "Strong Hires", val: stats.strongHires, icon: Target, color: "var(--cue-green-dark)" },
            { label: "Hires", val: stats.hires, icon: UserCheck, color: "#0D9488" },
            { label: "Maybe", val: stats.maybe, icon: Star, color: "var(--cue-orange)" },
            { label: "Rejected", val: stats.rejects, icon: UserX, color: "#E53E3E" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-white p-4 sm:p-6 rounded-[16px] transition-transform hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-md)", border: "1px solid var(--border-light)" }}
            >
              <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className="text-[24px] sm:text-[32px] font-[800] leading-none" style={{ color: stat.color }}>{stat.val}</div>
                <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${stat.color}15` }}>
                  <stat.icon className="w-4 h-4 sm:w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pending score alert */}
        {stats.pendingScore > 0 && !rescoring && (
          <div
            className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-[13px] font-[600]"
            style={{ background: "rgba(225,112,85,0.08)", border: "1px solid rgba(225,112,85,0.3)", color: "var(--cue-orange)" }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {stats.pendingScore} completed interview{stats.pendingScore !== 1 ? "s" : ""} {stats.pendingScore !== 1 ? "are" : "is"} missing AI scores.
            Click <strong>&quot;Score {stats.pendingScore} Missing&quot;</strong> in the top-right to score them now.
          </div>
        )}

        {/* FILTER + SEARCH ROW */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-8">
          <div className="w-full md:w-auto overflow-hidden">
            <div className="flex bg-white rounded-full p-1 overflow-x-auto scrollbar-hide no-scrollbar" style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)" }}>
              {["All", "Strong Hire", "Hire", "Maybe", "Reject", "Pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-full text-[13px] font-[700] transition-colors whitespace-nowrap"
                  style={filter === f ? { background: "var(--gradient-green)", color: "white" } : { color: "var(--text-secondary)" }}
                >
                  {f === "Pending" ? `Pending (${stats.pendingScore})` : f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full text-[14px] font-medium bg-white focus:outline-none transition-shadow"
              style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white rounded-[20px] overflow-hidden" style={{ boxShadow: "var(--shadow-md)", border: "1px solid var(--border-light)" }}>
          {loading && interviews.length === 0 ? (
            <div className="flex items-center justify-center p-20">
              <RefreshCw className="w-8 h-8 text-[var(--cue-green)] animate-spin" />
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--cue-green-light)" }}>
                <Inbox className="w-10 h-10 text-[var(--cue-green)]" />
              </div>
              <h3 className="text-[20px] font-bold text-[var(--text-primary)] mb-2">No interviews found</h3>
              <p className="text-[15px] text-[var(--text-muted)] max-w-[300px]">
                Share the candidate portal link to start collecting interviews or adjust your filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      <th className="px-8 py-5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Candidate</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Overall Score</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Verdict</th>
                      <th className="px-8 py-5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-light)" }}>
                    {filteredInterviews.map((interview) => (
                      <tr key={interview.id} className="hover:bg-[var(--bg-tertiary)] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ background: "var(--gradient-green)" }}>
                              {interview.candidates?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="font-[700] text-[var(--text-primary)] mb-0.5">
                                {interview.candidates?.name || "Unknown Candidate"}
                              </div>
                              <div className="text-[13px] font-[500] text-[var(--text-muted)]">
                                {interview.candidates?.email || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {interview.completed_at ? (
                            <>
                              <div className="text-[14px] font-[600] text-[var(--text-primary)] mb-0.5">
                                {new Date(interview.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                              <div className="text-[13px] font-[500] text-[var(--text-muted)]">
                                {new Date(interview.completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </div>
                            </>
                          ) : (
                            <span className="text-[13px] text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          {interview.scores ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[18px] font-[800] text-[var(--text-primary)]">
                                {interview.scores.overall_score?.toFixed(1) || "—"}
                              </span>
                              <span className="text-[13px] text-[var(--text-muted)] font-medium">/ 5.0</span>
                            </div>
                          ) : (
                            <span className="text-[13px] text-[var(--text-muted)] italic">Not scored yet</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          {interview.scores?.recommendation ? (
                            <div
                              className="inline-flex px-3 py-1 rounded-full text-[12px] font-[800] uppercase tracking-wide shadow-sm"
                              style={getBadgeStyle(interview.scores.recommendation)}
                            >
                              {interview.scores.recommendation}
                            </div>
                          ) : (
                            <div
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-[700] uppercase tracking-wide"
                              style={{ background: "rgba(225,112,85,0.1)", color: "var(--cue-orange)" }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
                              Pending
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link
                            href={`/dashboard/home/${interview.id}`}
                            className="inline-flex px-5 py-2 rounded-xl text-[13px] font-[700] transition-colors bg-white border border-[var(--border-medium)] text-[var(--text-primary)] group-hover:border-[var(--cue-green)] group-hover:text-[var(--cue-green)] shadow-sm"
                          >
                            View Report →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-[var(--border-light)]">
                {filteredInterviews.map((interview) => (
                  <div key={interview.id} className="p-4 bg-white hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0" style={{ background: "var(--gradient-green)" }}>
                        {interview.candidates?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-[700] text-[15px] text-[var(--text-primary)] truncate">
                          {interview.candidates?.name || "Unknown"}
                        </div>
                        <div className="text-[12px] text-[var(--text-muted)] truncate">
                          {interview.candidates?.email || "—"}
                        </div>
                      </div>
                      {interview.scores?.recommendation ? (
                        <div className="px-2 py-0.5 rounded-full text-[9px] font-[800] uppercase tracking-wide shrink-0" style={getBadgeStyle(interview.scores.recommendation)}>
                          {interview.scores.recommendation}
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-full text-[9px] font-[700] uppercase tracking-wide bg-orange-50 text-orange-600 shrink-0 border border-orange-100">
                          Pending
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Date</span>
                        <span className="text-[13px] font-[600] text-[var(--text-primary)]">
                          {interview.completed_at ? new Date(interview.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Score</span>
                        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-light)]">
                          <span className="text-[14px] font-[800] text-[var(--text-primary)]">
                            {interview.scores?.overall_score?.toFixed(1) || "—"}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold">/ 5.0</span>
                        </div>
                      </div>
                      <Link 
                        href={`/dashboard/home/${interview.id}`}
                        className="px-4 py-2 rounded-xl text-[12px] font-[800] bg-white border border-[var(--border-medium)] text-[var(--cue-green-dark)] shadow-sm active:bg-[var(--cue-green-light)]"
                      >
                        View Report →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
