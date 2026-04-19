"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize interview");

      // Move to interview room
      router.push(`/interview/${data.interview_id}`);
    } catch (err: any) {
      console.error(err);
      setError("Registration failed. Please click try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Background Gradient Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-50" 
        style={{ background: 'var(--gradient-hero)' }} 
      />
      
      <div className="relative z-10 w-full max-w-[520px]">
        {/* 3D Stack Effect */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none z-[-1]" style={{ background: 'rgba(0,184,148,0.08)', transform: 'translate(8px, 8px)' }} />
        
        <div className="bg-white rounded-[28px] p-[48px]" style={{ boxShadow: 'var(--shadow-float)', border: '1px solid var(--border-light)' }}>
          <div className="flex flex-col items-center text-center mb-10">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg shadow-brand-primary/20"
              style={{ background: 'var(--gradient-green)' }}
            >
              C
            </div>
            
            <h1 className="text-[24px] font-[800] text-[var(--text-primary)] mb-2">Cuemath Tutor Application</h1>
            <p className="text-[14px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Step 1 of 2 — Your Details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="block w-full px-4 pt-6 pb-2 text-[16px] text-[var(--text-primary)] bg-transparent border-b-2 border-[#E8F4F2] appearance-none focus:outline-none focus:ring-0 focus:border-[var(--cue-green)] peer transition-colors"
              />
              <label
                htmlFor="name"
                className="absolute text-[14px] text-[var(--text-muted)] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[var(--cue-green)]"
              >
                Full Legal Name
              </label>
            </div>

            <div className="relative group">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="block w-full px-4 pt-6 pb-2 text-[16px] text-[var(--text-primary)] bg-transparent border-b-2 border-[#E8F4F2] appearance-none focus:outline-none focus:ring-0 focus:border-[var(--cue-green)] peer transition-colors"
              />
              <label
                htmlFor="email"
                className="absolute text-[14px] text-[var(--text-muted)] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[var(--cue-green)]"
              >
                Email Address
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="mt-8 mb-8" style={{ background: 'var(--cue-green-light)', borderLeft: '3px solid var(--cue-green)', borderRadius: '12px', padding: '16px' }}>
              <p className="text-[14px] text-[var(--cue-green-dark)] font-medium leading-relaxed">
                <span className="mr-2">🎤</span> Please ensure you have a working microphone and are in a quiet environment before continuing.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-[700] rounded-xl text-[16px] py-[18px] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(225,112,85,0.25)] hover:shadow-[0_12px_32px_rgba(225,112,85,0.35)] hover:-translate-y-[2px] disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ background: 'var(--gradient-orange)', height: '56px' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Setting up environment...
                </>
              ) : (
                <>Continue to Interview &rarr;</>
              )}
            </button>
          </form>
        </div>
        
        {/* Progress Flow Graphic */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[var(--text-muted)] font-medium">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)]"><div className="w-4 h-4 rounded-full bg-[var(--cue-green)] text-white flex items-center justify-center text-[10px]">1</div> Register</span>
          <span className="opacity-40">&rarr;</span>
          <span className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">2</div> Interview</span>
          <span className="opacity-40">&rarr;</span>
          <span className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</div> Results</span>
        </div>
      </div>
    </div>
  );
}
