"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white text-[var(--text-primary)]">
      {/* Mesh Gradient Top */}
      <div 
        className="absolute top-0 inset-x-0 h-[400px] pointer-events-none opacity-40 z-0" 
        style={{ background: 'var(--gradient-hero)' }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-[100px] h-[100px] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-brand-primary/20"
        style={{ background: "var(--cue-green-light)", border: "2px solid var(--cue-green)" }}
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Check className="w-12 h-12" style={{ color: "var(--cue-green)" }} strokeWidth={4} />
        </motion.div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[36px] font-[800] mb-2"
      >
        Interview Complete!
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[24px] font-[600] mb-8"
        style={{ color: "var(--cue-green-dark)" }}
      >
        Thank you for your time.
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-[120px] h-1 rounded-full mb-8"
        style={{ background: "var(--gradient-green)" }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[16px] text-[var(--text-muted)] max-w-[480px] text-center leading-relaxed mb-12"
      >
        Your responses have been recorded. Our hiring team will carefully review your interview and reach out within 2 business days.
      </motion.p>

      {/* Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-6 relative before:absolute before:left-[11px] before:top-2 before:-bottom-2 before:w-[2px] before:bg-[var(--border-medium)] mb-12"
      >
        <div className="flex items-center gap-4 relative z-10 w-full max-w-[300px]">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--cue-green)", color: "white" }}>
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </div>
          <p className="text-[15px] font-[700] text-[var(--text-primary)]">Responses Recorded</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 w-full max-w-[300px]">
          <div className="w-6 h-6 rounded-full border-2 bg-white shrink-0" style={{ borderColor: 'var(--border-medium)' }} />
          <p className="text-[15px] font-[500] text-[var(--text-muted)]">Team Review — within 24 hours</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10 w-full max-w-[300px]">
          <div className="w-6 h-6 rounded-full border-2 bg-white shrink-0" style={{ borderColor: 'var(--border-medium)' }} />
          <p className="text-[15px] font-[500] text-[var(--text-muted)]">You&apos;ll hear from us — within 2 days</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-[14px] text-[var(--text-muted)] mb-10"
      >
        Questions? Contact us at <span className="font-semibold cursor-pointer hover:text-[var(--cue-green)] transition-colors">hiring@cuemath.com</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link
          href="/"
          className="text-[14px] font-[700] transition-colors"
          style={{ color: "var(--cue-green)" }}
        >
          &larr; Back to Cuemath Home
        </Link>
      </motion.div>

    </div>
  );
}
