"use client";

import { motion } from "framer-motion";
import { QUESTION_COUNT } from "@/lib/questions";

interface ProgressBarProps {
  currentQuestion: number; // 0-indexed
}

export default function ProgressBar({ currentQuestion }: ProgressBarProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-brand-text-secondary text-sm font-medium">
        Question{" "}
        <span className="text-white font-semibold">
          {Math.min(currentQuestion + 1, QUESTION_COUNT)}
        </span>{" "}
        of <span className="text-white font-semibold">{QUESTION_COUNT}</span>
      </p>
      <div className="flex gap-2">
        {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            initial={{ width: 8 }}
            animate={{
              width: i === currentQuestion ? 24 : 8,
              backgroundColor:
                i < currentQuestion
                  ? "#FF6B35"
                  : i === currentQuestion
                  ? "#FF6B35"
                  : "#1E1E2E",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              border:
                i === currentQuestion
                  ? "1px solid rgba(255,107,53,0.5)"
                  : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
