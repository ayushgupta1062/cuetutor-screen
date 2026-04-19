"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageSquare, Heart, Lightbulb, Clock, Globe, Download, Play, Square, ChevronDown, ChevronUp } from "lucide-react";

export default function Scorecard() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`/api/dashboard/interviews/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (res.ok) {
          setData({ ...json.interview, scores: json.scores, messages: json.messages });
        } else {
          console.error(json);
          setData(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--cue-green)] bg-[var(--bg-secondary)]"><span className="animate-spin text-4xl">⟳</span></div>;
  if (!data || !data.scores) return <div className="min-h-screen p-10 text-center font-bold text-red-500 bg-[var(--bg-secondary)]">Assessment data missing or not yet processed.</div>;

  const s = data.scores;

  const getRecStyle = (rec: string) => {
    switch (rec) {
      case "Strong Hire": return { bg: "var(--gradient-green)", color: "white" };
      case "Hire": return { bg: "#0D9488", color: "white" }; // teal
      case "Maybe": return { bg: "var(--cue-orange)", color: "white" };
      case "Reject": return { bg: "#E53E3E", color: "white" };
      default: return { bg: "var(--border-medium)", color: "var(--text-primary)" };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "var(--cue-green)";
    if (score >= 3) return "var(--cue-orange)";
    return "#E53E3E";
  };

  const dimensions = [
    { key: "clarity", name: "Communication Clarity", icon: MessageSquare, score: s.clarity_score, quote: s.clarity_quote, c: "#3B82F6" },
    { key: "warmth", name: "Student Warmth", icon: Heart, score: s.warmth_score, quote: s.warmth_quote, c: "#EC4899" },
    { key: "simplicity", name: "Concept Simplicity", icon: Lightbulb, score: s.simplicity_score, quote: s.simplicity_quote, c: "#F59E0B" },
    { key: "patience", name: "Teaching Patience", icon: Clock, score: s.patience_score, quote: s.patience_quote, c: "#8B5CF6" },
    { key: "fluency", name: "Language Fluency", icon: Globe, score: s.fluency_score, quote: s.fluency_quote, c: "#14B8A6" },
  ];

  const durationMin = Math.max(1, Math.floor((new Date(data.completed_at).getTime() - new Date(data.started_at).getTime()) / 60000));

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-secondary)' }}>

      {/* BREADCRUMB */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-4 sm:pb-6">
        <Link href="/dashboard/home" className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-[700] hover:underline" style={{ color: 'var(--cue-green)' }}>
          <ArrowLeft className="w-4 h-4" /> All Interviews
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">

        {/* HERO CARD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 sm:gap-10" style={{ boxShadow: 'var(--shadow-float)', border: '1px solid var(--border-light)' }}>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <div className="w-16 h-16 sm:w-[84px] sm:h-[84px] rounded-full flex items-center justify-center text-[24px] sm:text-[32px] font-[800] text-white shadow-md shrink-0" style={{ background: 'var(--gradient-green)' }}>
              {data.candidates?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-[24px] sm:text-[32px] font-[800] text-[var(--text-primary)] mb-1 leading-tight">{data.candidates?.name}</h1>
              <div className="text-[13px] sm:text-[15px] font-[500] text-[var(--text-muted)] flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <span className="truncate max-w-[200px] sm:max-w-none">{data.candidates?.email}</span>
                <span className="hidden xs:inline w-1 h-1 rounded-full bg-[var(--border-medium)]" />
                <span>{new Date(data.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="hidden xs:inline w-1 h-1 rounded-full bg-[var(--border-medium)]" />
                <span>{durationMin}m duration</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end w-full md:w-auto border-t sm:border-t-0 pt-6 sm:pt-0 border-[var(--border-light)]">
            <div className="text-[11px] sm:text-[12px] font-[800] tracking-widest uppercase text-[var(--text-muted)] mb-1">OVERALL SCORE</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[56px] sm:text-[72px] font-[800] leading-none tracking-tighter" style={{ color: getScoreColor(s.overall_score) }}>
                {s.overall_score?.toFixed(1) || "-"}
              </span>
              <span className="text-[20px] sm:text-[24px] font-[700] text-[var(--text-muted)]">/5.0</span>
            </div>

            <div className="px-6 py-2 rounded-full text-[18px] font-[800] uppercase tracking-wide w-full md:w-auto text-center" style={getRecStyle(s.recommendation)}>
              {s.recommendation}
            </div>
          </div>
        </motion.div>

        {/* AI SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[20px] p-6 sm:p-8 border-l-[4px]" style={{ background: 'var(--bg-tertiary)', borderLeftColor: 'var(--cue-green)' }}>
          <div className="text-[11px] sm:text-[12px] font-[800] tracking-widest uppercase text-[var(--cue-green)] mb-3">Assessment Summary</div>
          <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[var(--text-secondary)] font-[500]">{s.summary}</p>
        </motion.div>

        {/* DIMENSIONS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {dimensions.map((dim, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (idx * 0.1) }}
              className="bg-white p-8 rounded-[20px] transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${dim.c}15`, color: dim.c }}>
                    <dim.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-[800] text-[var(--text-primary)]">{dim.name}</h3>
                </div>
                <div className="text-[20px] font-[800]" style={{ color: getScoreColor(dim.score) }}>{dim.score}/5</div>
              </div>

              <div className="w-full h-[8px] rounded-[4px] mb-6 overflow-hidden bg-[var(--border-light)]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(dim.score / 5) * 100}%` }} transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full rounded-[4px]" style={{ background: getScoreColor(dim.score) }} />
              </div>

              <div className="pl-4 py-1 italic text-[13px] sm:text-[14px] leading-relaxed text-[var(--text-muted)] font-[500] border-l-[3px]" style={{ borderColor: dim.c }}>
                &ldquo;{dim.quote}&rdquo;
              </div>

              {dim.key === "fluency" && data.audio_url && (
                <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
                  <h4 className="flex items-center gap-2 text-[12px] font-[800] tracking-widest uppercase text-[var(--text-muted)] mb-4" style={{ color: dim.c }}>
                    <Play className="w-4 h-4" /> Full Interview Recording
                  </h4>
                  <div className="rounded-[12px] overflow-hidden bg-[var(--bg-tertiary)] p-2">
                    <audio controls src={data.audio_url} className="w-full h-10 outline-none" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>



        {/* TRANSCRIPT TOGGLE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col items-center pt-4">
          <button onClick={() => setTranscriptOpen(!transcriptOpen)} className="flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-[700] text-[var(--cue-green-dark)] bg-[var(--cue-green-light)] hover:bg-[#D1F2EB] transition-colors">
            {transcriptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {transcriptOpen ? "Hide Full Transcript" : `View Full Transcript (${data.messages?.length || 0} messages)`}
          </button>

          <AnimatePresence>
            {transcriptOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full mt-8 overflow-hidden rounded-[20px] bg-white p-8 space-y-6" style={{ border: '1px solid var(--border-light)' }}>
                {data.messages?.map((msg: any, i: number) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[11px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider px-1">
                      {msg.role === 'ai' ? 'Aria' : 'Candidate'}
                    </span>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 text-[14px] sm:text-[15px] leading-relaxed shadow-sm max-w-[90%] sm:max-w-[85%] font-[500]`}
                      style={msg.role === 'ai' ? {
                        background: 'white', border: '1px solid var(--border-light)', borderRadius: '4px 20px 20px 20px', borderLeft: '3px solid var(--cue-green)'
                      } : {
                        background: 'var(--cue-green-light)', borderRadius: '20px 4px 20px 20px'
                      }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-[var(--border-light)]">
          <Link href="/dashboard/home" className="text-[14px] font-[700] hover:text-[var(--cue-green)] text-[var(--text-secondary)] transition-colors">
            &larr; Back to All Interviews
          </Link>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-[800] border-2 border-[var(--cue-green)] text-[var(--cue-green)] hover:bg-[var(--cue-green)] hover:text-white transition-colors">
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>

      </div>
    </div>
  );
}
