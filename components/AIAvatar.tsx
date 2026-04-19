"use client";

import { motion, AnimatePresence } from "framer-motion";

type AvatarStatus = "idle" | "speaking" | "listening" | "thinking";

interface AIAvatarProps {
  status: AvatarStatus;
}

const statusConfig = {
  idle: {
    label: "Ready",
    color: "#9090A0",
    pulseColor: "rgba(144,144,160,0.3)",
    bgGradient: "from-slate-800 to-slate-700",
  },
  speaking: {
    label: "Speaking...",
    color: "#7C3AED",
    pulseColor: "rgba(124,58,237,0.3)",
    bgGradient: "from-purple-900 to-purple-700",
  },
  listening: {
    label: "Listening...",
    color: "#FF6B35",
    pulseColor: "rgba(255,107,53,0.3)",
    bgGradient: "from-orange-900 to-orange-700",
  },
  thinking: {
    label: "Thinking...",
    color: "#10B981",
    pulseColor: "rgba(16,185,129,0.3)",
    bgGradient: "from-emerald-900 to-emerald-700",
  },
};

export default function AIAvatar({ status }: AIAvatarProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer pulse rings */}
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {(status === "speaking" || status === "listening") && (
            <>
              <motion.div
                key="ring1"
                className="absolute rounded-full border-2"
                style={{ borderColor: config.pulseColor }}
                initial={{ width: 140, height: 140, opacity: 0.8 }}
                animate={{ width: 200, height: 200, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="ring2"
                className="absolute rounded-full border-2"
                style={{ borderColor: config.pulseColor }}
                initial={{ width: 140, height: 140, opacity: 0.6 }}
                animate={{ width: 240, height: 240, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.4,
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main avatar circle */}
        <motion.div
          className="relative w-36 h-36 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 40% 35%, ${config.color}40, #13131A)`,
            border: `2px solid ${config.color}60`,
            boxShadow: `0 0 40px ${config.pulseColor}`,
          }}
          animate={
            status === "speaking"
              ? { scale: [1, 1.04, 1] }
              : status === "thinking"
              ? { opacity: [0.8, 1, 0.8] }
              : { scale: 1 }
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* AI face / icon */}
          <div className="flex flex-col items-center gap-2">
            {/* Eyes */}
            <div className="flex gap-3">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
                animate={
                  status === "thinking"
                    ? { scaleY: [1, 0.2, 1] }
                    : { scaleY: 1 }
                }
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
                animate={
                  status === "thinking"
                    ? { scaleY: [1, 0.2, 1] }
                    : { scaleY: 1 }
                }
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                  delay: 0.1,
                }}
              />
            </div>

            {/* Sound wave bars (speaking) */}
            {status === "speaking" && (
              <div className="flex items-center gap-0.5 h-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    initial={{ height: 12 }}
                  />
                ))}
              </div>
            )}

            {/* Static mouth line (idle/listening) */}
            {status !== "speaking" && (
              <div
                className="w-8 h-0.5 rounded-full"
                style={{ backgroundColor: `${config.color}80` }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Name + Status */}
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Aria</p>
        <p className="text-sm text-brand-text-secondary">
          Cuemath AI Interviewer
        </p>
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
            border: `1px solid ${config.color}40`,
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
            animate={
              status !== "idle"
                ? { opacity: [1, 0.3, 1] }
                : { opacity: 1 }
            }
            transition={{ duration: 1, repeat: Infinity }}
          />
          {config.label}
        </motion.div>
      </div>
    </div>
  );
}
