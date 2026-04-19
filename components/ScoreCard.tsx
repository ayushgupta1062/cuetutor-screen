"use client";

import { motion } from "framer-motion";

interface ScoreCardProps {
  dimension: string;
  score: number; // 1-5
  quote: string;
  delay?: number;
}

const dimensionIcons: Record<string, string> = {
  "Communication Clarity": "🗣️",
  "Student Warmth": "❤️",
  "Concept Simplicity": "💡",
  "Teaching Patience": "🧘",
  "Language Fluency": "✍️",
};

function getScoreColor(score: number): string {
  if (score >= 4.5) return "#10B981"; // green
  if (score >= 3.5) return "#3B82F6"; // blue
  if (score >= 2.5) return "#F59E0B"; // yellow
  return "#EF4444"; // red
}

function ScoreStar({ filled, color }: { filled: boolean; color: string }) {
  return (
    <span style={{ color: filled ? color : "#E2E8F0", fontSize: 16 }}>★</span>
  );
}

export default function ScoreCard({
  dimension,
  score,
  quote,
  delay = 0,
}: ScoreCardProps) {
  const color = getScoreColor(score);
  const icon = dimensionIcons[dimension] || "📊";
  const barPercent = (score / 5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="p-5 rounded-2xl border border-brand-border bg-white flex flex-col gap-3 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-brand-text-heading font-bold text-sm tracking-wide">{dimension}</span>
        </div>
        <span
          className="text-lg font-extrabold"
          style={{ color }}
        >
          {score}/5
        </span>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <ScoreStar key={i} filled={i <= Math.round(score)} color={color} />
        ))}
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${barPercent}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Quote */}
      {quote && (
        <blockquote className="text-brand-text-body text-sm italic leading-relaxed border-l-2 pl-3 mt-1 font-medium bg-gray-50 border-gray-200 py-2 pr-2 rounded-r-lg" style={{ borderLeftColor: color }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
      )}
    </motion.div>
  );
}
