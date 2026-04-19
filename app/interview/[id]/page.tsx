"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, supabaseClient } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Info, Loader2, AlertCircle } from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";

const QUESTIONS = [
  "Hello! I am Aria, representing the Cuemath recruitment team. Could you please introduce yourself and tell me a bit about your background?",
  "That's wonderful. Why are you passionate about teaching mathematics to young students?",
  "Imagine a student is struggling to understand fractions. How would you explain it to them?",
  "How do you handle a student who becomes frustrated and wants to give up during a lesson?",
  "Finally, what makes you a great fit for the Cuemath tutoring program?",
];

const QUESTION_COUNT = QUESTIONS.length;

export default function InterviewRoom() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<{ role: "ai" | "candidate"; content: string }[]>([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [status, setStatus] = useState<"loading" | "speaking" | "listening" | "processing" | "saving" | "error" | "complete">("loading");
  const [saveError, setSaveError] = useState("");
  const [durationTimer, setDurationTimer] = useState("00:00");

  // Refs to avoid stale closures
  const statusRef = useRef<string>("loading");
  const completingRef = useRef(false);  // use ref instead of state to avoid closure staleness
  const startTimeRef = useRef<number>(Date.now());
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const interviewId = id;

  const isProcessing = status === "processing" || status === "speaking" || status === "saving";
  const canEnd = currentQuestionIndex >= 3;

  // ── Keep statusRef in sync ─────────────────────────────────────────────────
  const setStatusSafe = useCallback((s: typeof status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ── Duration timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const int = setInterval(() => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      setDurationTimer(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(int);
  }, []);

  // ── Auto-scroll transcript ─────────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);

  // ── Save message to DB ─────────────────────────────────────────────────────
  const addMessage = useCallback(async (role: "ai" | "candidate", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
    try {
      await supabase.from("messages").insert({ interview_id: interviewId, role, content });
    } catch (err) {
      console.error("addMessage error:", err);
    }
  }, [interviewId]);

  // ── Ask a question via TTS ─────────────────────────────────────────────────
  const askQuestion = useCallback(async (text: string, index: number) => {
    setCurrentQuestionIndex(index);
    setStatusSafe("speaking");
    await addMessage("ai", text);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.name.includes("Zira") ||
        v.name.includes("Female") ||
        v.name.includes("Samantha") ||
        v.name.includes("Victoria")
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    const fallbackMs = text.split(" ").length * 320 + 1200;
    const fallbackTimer = setTimeout(() => {
      if (statusRef.current === "speaking") setStatusSafe("listening");
    }, fallbackMs);

    utterance.onend = () => {
      clearTimeout(fallbackTimer);
      setStatusSafe("listening");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [addMessage, setStatusSafe]);

  // ── Session Audio Recording Logic ──────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingSession, setIsRecordingSession] = useState(false);

  // Start recording when interview truly starts
  const startSessionRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mimeType
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg'];
      const supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
      
      const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : {});
      
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.start(1000); // collect data every second
      mediaRecorderRef.current = recorder;
      setIsRecordingSession(true);
      console.log("=== Session Recording Started with mimeType:", recorder.mimeType);
    } catch (err) {
      console.error("Failed to start session recording:", err);
    }
  }, []);

  // ── Complete interview — THE CRITICAL FUNCTION ─────────────────────────────
  const completeInterview = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;

    window.speechSynthesis.cancel();
    setSaveError("");
    setStatusSafe("saving");

    let finalAudioUrl = null;

    // Stop recording and upload
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        console.log("=== Stopping session recording and uploading... ===");
        
        // Wrap stop in a promise to ensure data is collected
        const audioBlob = await new Promise<Blob>((resolve) => {
          mediaRecorderRef.current!.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current!.mimeType || 'audio/webm' });
            resolve(blob);
          };
          mediaRecorderRef.current!.stop();
          // Stop all tracks to release mic
          mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());
        });

        if (audioBlob.size > 0) {
          const fileName = `${interviewId}_${Date.now()}.webm`;
          // IMPORTANT: Use supabaseClient (anon key) for browser-side storage uploads
          const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('interview-recordings')
            .upload(fileName, audioBlob, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabaseClient.storage
            .from('interview-recordings')
            .getPublicUrl(fileName);
            
          finalAudioUrl = publicUrl;
          console.log("=== Session Recording Uploaded:", finalAudioUrl);
        }
      } catch (err) {
        console.error("Audio upload failed:", err);
        // We continue even if audio fails, so we don't lose the transcript
      }
    }

    try {
      const response = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          interview_id: interviewId,
          audio_url: finalAudioUrl
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `API returned ${response.status}`);

      setStatusSafe("complete");
      router.push("/thankyou");
    } catch (error: any) {
      console.error("=== completeInterview: FAILED:", error);
      completingRef.current = false;
      setSaveError(error.message || "Failed to save your responses. Please try again.");
      setStatusSafe("error");
    }
  }, [interviewId, router, setStatusSafe]);

  // ── Handle candidate response from VoiceRecorder ───────────────────────────
  const handleTranscriptReady = useCallback(async (text: string) => {
    if (statusRef.current !== "listening") return;
    if (completingRef.current) return;

    setStatusSafe("processing");
    setLiveTranscript("");

    // Empty transcript → candidate saved with no speech → re-arm same question
    if (!text.trim()) {
      setTimeout(() => {
        if (statusRef.current === "processing") setStatusSafe("listening");
      }, 500);
      return;
    }

    await addMessage("candidate", text);

    try {
      const res = await fetch("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId,
          question_number: currentQuestionIndex,
          candidate_response: text,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const nextIndex = data.next_question_number;

      if (nextIndex >= QUESTION_COUNT) {
        // All questions done — speak closing line then complete
        await askQuestion(data.content, nextIndex);
        // Wait for TTS to finish (utterance.onend sets status to "listening")
        // then trigger completion — we watch statusRef change via a poll
        const waitForSpeakEnd = () => {
          if (statusRef.current === "listening") {
            // Small buffer so candidate hears full closing sentence
            setTimeout(() => completeInterview(), 1500);
          } else {
            setTimeout(waitForSpeakEnd, 200);
          }
        };
        setTimeout(waitForSpeakEnd, 500);
      } else {
        await askQuestion(data.content, nextIndex);
      }
    } catch (err) {
      console.error("handleTranscriptReady error:", err);
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < QUESTION_COUNT) {
        await askQuestion(QUESTIONS[nextIndex], nextIndex);
      } else {
        await completeInterview();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, interviewId, addMessage, askQuestion, completeInterview]);

  // ── Init: load voices then start ──────────────────────────────────────────
  useEffect(() => {
    if (!interviewId || isInitialized.current) return;
    isInitialized.current = true;
    const init = async () => {
      await new Promise<void>((resolve) => {
        if (window.speechSynthesis.getVoices().length > 0) resolve();
        else {
          window.speechSynthesis.onvoiceschanged = () => resolve();
          setTimeout(resolve, 2000);
        }
      });
      await startSessionRecording();
      await askQuestion(QUESTIONS[0], 0);
    };
    init();
  }, [interviewId, askQuestion, startSessionRecording]);

  const currentQuestion =
    messages.filter((m) => m.role === "ai").slice(-1)[0]?.content ||
    (status === "loading" ? "Preparing your interview..." : "Listening to your response...");

  const readyToListen = status === "listening" && !completingRef.current;

  // ── SAVING OVERLAY ─────────────────────────────────────────────────────────
  if (status === "saving") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6" style={{ background: "var(--bg-secondary)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ background: "var(--gradient-green)" }}>
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-[22px] font-[800] text-[var(--text-primary)] mb-2">Saving your responses…</h2>
          <p className="text-[15px] text-[var(--text-muted)]">Please don't close this tab. This takes about 10–15 seconds.</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[var(--cue-green)]"
              style={{ animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR OVERLAY ──────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center" style={{ background: "var(--bg-secondary)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-100">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-[22px] font-[800] text-[var(--text-primary)] mb-2">Something went wrong</h2>
          <p className="text-[14px] text-[var(--text-muted)] max-w-sm mb-1">
            Your interview responses were recorded, but we couldn't save them. Please try again.
          </p>
          {saveError && (
            <p className="text-[12px] text-red-500 font-mono bg-red-50 px-3 py-2 rounded-lg mt-2 max-w-sm">{saveError}</p>
          )}
        </div>
        <button
          onClick={completeInterview}
          className="px-8 py-3 text-white font-[700] rounded-full text-[16px] transition-all hover:-translate-y-1"
          style={{ background: "var(--gradient-orange)", boxShadow: "0 8px 24px rgba(225,112,85,0.3)" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--bg-secondary)]" style={{ height: "100dvh", overflow: "hidden" }}>

      {/* ── TOP NAVBAR ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)", borderBottom: "1px solid var(--border-light)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: "var(--cue-green)" }}>C</div>
          <span className="font-[800] text-[var(--text-primary)] tracking-tight">Cuemath</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2 items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{ background: i <= currentQuestionIndex ? "var(--cue-green)" : "var(--border-medium)" }} />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Q {Math.min(currentQuestionIndex + 1, 5)} of 5
          </span>
        </div>

        <div className="flex items-center gap-2 text-[14px] font-[600] text-[var(--text-secondary)]">
          <Clock className="w-4 h-4 text-[var(--cue-green)]" />
          {durationTimer}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden min-h-0">

        {/* LEFT — Aria panel */}
        <div
          className="lg:w-[52%] flex flex-col items-center justify-center bg-white rounded-2xl overflow-auto p-6 relative"
          style={{ boxShadow: "var(--shadow-float)", minHeight: 0 }}
        >
          {/* Avatar */}
          <div className="relative mb-4 flex-shrink-0">
            {status === "speaking" && (
              <>
                <div className="absolute inset-0 rounded-full bg-[var(--cue-green)]" style={{ animation: "ring-pulse 2s infinite" }} />
                <div className="absolute inset-0 rounded-full bg-[var(--cue-green)]" style={{ animation: "ring-pulse 2s 0.5s infinite" }} />
              </>
            )}
            <div className="relative w-[90px] h-[90px] rounded-full flex items-center justify-center shadow-lg" style={{ background: "var(--gradient-green)" }}>
              <span className="text-[36px] font-[800] text-white">A</span>
            </div>
          </div>

          <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-0.5">Aria</h2>
          <p className="text-[13px] text-[var(--text-muted)] mb-4">Cuemath Interviewer</p>

          {/* Status pill */}
          <div
            className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all"
            style={{
              background: status === "speaking" ? "rgba(0,184,148,0.1)" : status === "listening" ? "rgba(225,112,85,0.1)" : "rgba(138,155,176,0.08)",
              color: status === "speaking" ? "var(--cue-green-dark)" : status === "listening" ? "var(--cue-orange)" : "var(--text-secondary)",
            }}
          >
            {status === "speaking"
              ? "● Speaking..."
              : status === "listening"
              ? "● Your turn to respond"
              : status === "processing"
              ? "○ Processing..."
              : "○ Starting..."}
          </div>

          {/* Current question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full max-w-[420px] p-5 rounded-2xl border-l-4 border-[var(--cue-green)]"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <p className="text-[15px] text-[var(--text-primary)] font-[500] leading-[1.65] text-center">
                {currentQuestion}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
            <Info className="w-3.5 h-3.5" /> Speak clearly and naturally. Take your time.
          </div>

          {canEnd && !completingRef.current && (
            <button onClick={completeInterview} className="mt-4 text-[12px] font-[700] text-[#E53E3E] hover:underline">
              End Interview Early
            </button>
          )}
        </div>

        {/* RIGHT — Transcript + Mic */}
        <div className="lg:w-[48%] flex flex-col gap-3 min-h-0">

          {/* Transcript scroll */}
          <div
            className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col min-h-0"
            style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)" }}
          >
            <div className="px-5 pt-4 pb-3 flex-shrink-0 border-b border-[var(--border-light)]">
              <h3 className="text-[13px] font-[800] text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--cue-green)]" /> Interview Transcript
              </h3>
            </div>
            <div ref={transcriptRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === "candidate" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider px-1">
                      {msg.role === "ai" ? "Aria" : "You"}
                    </span>
                    <div
                      className="px-4 py-2.5 text-[13px] leading-relaxed max-w-[88%] font-[500]"
                      style={msg.role === "ai"
                        ? { background: "white", border: "1px solid var(--border-light)", borderLeft: "3px solid var(--cue-green)", borderRadius: "4px 16px 16px 16px", color: "var(--text-primary)" }
                        : { background: "var(--cue-green-light)", borderRadius: "16px 4px 16px 16px", color: "var(--text-primary)" }}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {liveTranscript && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider px-1">You</span>
                    <div className="px-4 py-2.5 text-[13px] leading-relaxed max-w-[88%] font-[500]"
                      style={{ background: "var(--cue-green-light)", borderRadius: "16px 4px 16px 16px", opacity: 0.65, color: "var(--text-primary)" }}>
                      {liveTranscript}...
                    </div>
                  </motion.div>
                )}
                {messages.length === 0 && (
                  <p className="text-center text-[13px] text-[var(--text-muted)] mt-8">The conversation will appear here…</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mic Control */}
          <div
            className="flex-shrink-0 bg-white rounded-2xl flex items-center justify-center py-5"
            style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-light)" }}
          >
            <VoiceRecorder
              onTranscriptReady={handleTranscriptReady}
              onTranscriptUpdate={setLiveTranscript}
              disabled={isProcessing || status === "complete" || status === "error" || status === "saving"}
              readyToListen={readyToListen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
