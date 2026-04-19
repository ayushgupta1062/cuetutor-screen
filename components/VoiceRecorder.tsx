/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptReady: (text: string) => void;
  onTranscriptUpdate: (text: string) => void;
  disabled?: boolean;
  /** When true the component shows a "get ready" countdown then enables the mic button */
  readyToListen?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceRecorder({
  onTranscriptReady,
  onTranscriptUpdate,
  disabled = false,
  readyToListen = false,
}: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [interimText, setInterimText] = useState("");

  // "get-ready" phase: 2s countdown before mic button becomes active
  const [micReady, setMicReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // nudge if candidate hasn't tapped mic within 8s of it becoming ready
  const [nudge, setNudge] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const hasSpokeRef = useRef(false);

  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const readyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── CLEANUP ─────────────────────────────────────────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (nudgeTimerRef.current) { clearTimeout(nudgeTimerRef.current); nudgeTimerRef.current = null; }
    if (readyTimerRef.current) { clearTimeout(readyTimerRef.current); readyTimerRef.current = null; }
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
  }, []);

  // ─── STOP RECOGNITION ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  // ─── START RECOGNITION ───────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported || disabled || !micReady) return;

    setMicError(null);
    setNudge(false);
    finalTranscriptRef.current = "";
    hasSpokeRef.current = false;
    setInterimText("");
    onTranscriptUpdate("");

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { setIsSupported(false); return; }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += t + " ";
        } else {
          interim += t;
        }
      }

      if (newFinal) {
        hasSpokeRef.current = true;
        finalTranscriptRef.current += newFinal;
        onTranscriptUpdate(finalTranscriptRef.current.trim());
      }
      if (interim) {
        hasSpokeRef.current = true;
        setInterimText(interim);
        onTranscriptUpdate((finalTranscriptRef.current + interim).trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicError("Microphone permission denied. Enable mic access in browser settings.");
        setShowFallback(true);
      } else if (event.error === "no-speech") {
        // browser timeout — just restart silently
        try {
          recognition.stop();
          setTimeout(() => { try { recognition.start(); } catch (_) { /* */ } }, 300);
        } catch (_) { /* */ }
        return;
      }
      setIsListening(false);
      setInterimText("");
    };

    recognition.onend = () => {
      // only fires if browser killed it unexpectedly; manual stop is handled in handleToggle
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { console.error("Recognition start error:", e); }
  }, [isSupported, disabled, micReady, onTranscriptUpdate]);

  // ─── MANUAL TOGGLE ───────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (isListening) {
      // TAP TO SAVE
      const full = finalTranscriptRef.current.trim();
      stopListening();
      // always fire — even if empty (page handles empty as skip/nudge)
      onTranscriptReady(full);
    } else {
      // TAP TO RECORD
      startListening();
    }
  };

  // ─── FALLBACK SUBMIT ─────────────────────────────────────────────────────────
  const handleFallbackSubmit = () => {
    const text = fallbackText.trim();
    if (text) { onTranscriptReady(text); setFallbackText(""); }
  };

  // ─── SUPPORT CHECK (mount) ───────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setShowFallback(true);
    }
    return () => {
      clearAllTimers();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (_) { /* */ } }
    };
  }, [clearAllTimers]);

  // ─── readyToListen EFFECT — 2s countdown then arm mic ───────────────────────
  useEffect(() => {
    if (readyToListen && !disabled) {
      // reset
      setMicReady(false);
      setNudge(false);
      setCountdown(2);
      clearAllTimers();

      // Tick countdown every second
      let tick = 2;
      countdownIntervalRef.current = setInterval(() => {
        tick -= 1;
        setCountdown(tick > 0 ? tick : null);
        if (tick <= 0) {
          clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
        }
      }, 1000);

      // After 2s arm the mic
      readyTimerRef.current = setTimeout(() => {
        setMicReady(true);
        setCountdown(null);

        // If candidate doesn't tap within 8s → nudge
        nudgeTimerRef.current = setTimeout(() => {
          setNudge(true);
        }, 8000);
      }, 2000);
    } else {
      // AI still speaking or disabled — disarm everything
      clearAllTimers();
      setMicReady(false);
      setNudge(false);
      setCountdown(null);
      if (isListening) stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToListen, disabled]);

  // ─── Once candidate taps mic, cancel nudge timer ─────────────────────────────
  useEffect(() => {
    if (isListening) {
      setNudge(false);
      if (nudgeTimerRef.current) { clearTimeout(nudgeTimerRef.current); nudgeTimerRef.current = null; }
    }
  }, [isListening]);

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER — FALLBACK
  // ────────────────────────────────────────────────────────────────────────────
  if (!isSupported || showFallback) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50 w-full">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-bold mb-1">Voice input unavailable</p>
            <p className="font-medium">
              {micError || "Your browser doesn't support voice recognition. Use Chrome or Edge. Type your answer below:"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <textarea
            value={fallbackText}
            onChange={(e) => setFallbackText(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1 px-4 py-3 bg-white border-2 border-[var(--border-light)] rounded-xl text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--cue-green)] h-24"
            disabled={disabled}
          />
          <button
            onClick={handleFallbackSubmit}
            disabled={!fallbackText.trim() || disabled}
            className="px-6 py-2 text-white rounded-xl font-bold disabled:opacity-50 self-end"
            style={{ background: 'var(--cue-green)' }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER — MAIN
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3">

      {/* Error */}
      <AnimatePresence>
        {micError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4" />{micError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nudge banner */}
      <AnimatePresence>
        {nudge && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-center"
            style={{ background: 'rgba(225,112,85,0.12)', color: 'var(--cue-orange)' }}
          >
            Please tap the mic and share your response 🎤
          </motion.div>
        )}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--cue-green-light)', color: 'var(--cue-green-dark)' }}
          >
            Mic ready in {countdown}s…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live interim text */}
      <AnimatePresence>
        {interimText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-[var(--border-light)] max-w-xs text-center"
          >
            <p className="text-[var(--text-secondary)] text-sm font-medium italic">
              &ldquo;{interimText}...&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when recording */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                key="r1"
                className="absolute rounded-full"
                style={{ backgroundColor: "rgba(225,112,85,0.18)" }}
                initial={{ width: 80, height: 80, opacity: 0.8 }}
                animate={{ width: 130, height: 130, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="r2"
                className="absolute rounded-full"
                style={{ backgroundColor: "rgba(225,112,85,0.12)" }}
                initial={{ width: 80, height: 80, opacity: 0.6 }}
                animate={{ width: 175, height: 175, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleToggle}
          disabled={disabled || (!micReady && !isListening)}
          className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center disabled:cursor-not-allowed transition-all"
          style={{
            background: isListening
              ? "var(--gradient-orange)"
              : micReady
              ? "#FFFFFF"
              : "#F0FAF8",
            boxShadow: isListening
              ? "0 0 0 0 rgba(225,112,85,0.4)"
              : micReady
              ? "0 8px 24px rgba(0,0,0,0.08)"
              : "none",
            border: isListening
              ? "none"
              : micReady
              ? "2px solid var(--cue-green)"
              : "2px solid var(--border-light)",
          }}
          whileHover={micReady && !isListening ? { scale: 1.06 } : {}}
          whileTap={micReady || isListening ? { scale: 0.94 } : {}}
        >
          {isListening ? (
            /* animated wave bars */
            <div className="flex items-center gap-1 h-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  style={{ animation: `wave 1s infinite ease-in-out`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          ) : micReady ? (
            <Mic className="w-6 h-6" style={{ color: "var(--cue-green)" }} />
          ) : (
            <MicOff className="w-6 h-6" style={{ color: "var(--border-medium)" }} />
          )}
        </motion.button>
      </div>

      {/* Label */}
      <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider text-center">
        {disabled
          ? "Please wait"
          : isListening
          ? "Recording — tap mic to save"
          : micReady
          ? "Tap mic to start recording"
          : countdown !== null
          ? "Get ready to respond…"
          : "Waiting for question…"}
      </p>

      {/* Hint when ready and not yet recording */}
      <AnimatePresence>
        {micReady && !isListening && !disabled && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-[var(--text-muted)] text-center max-w-[200px] leading-relaxed"
          >
            Tap once to start · tap again when done speaking
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
