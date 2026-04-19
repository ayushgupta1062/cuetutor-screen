"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/dashboard/home");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid access code");
      }
    } catch {
      setError("Login failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "var(--cue-green-light)",
        backgroundImage: `
          radial-gradient(ellipse at 80% 20%, rgba(0,184,148,0.18) 0%, transparent 60%),
          radial-gradient(ellipse at 10% 80%, rgba(0,184,148,0.12) 0%, transparent 50%)
        `,
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-[-60px] right-[-60px] w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{ background: "rgba(0,184,148,0.12)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-[-40px] left-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: "rgba(0,184,148,0.1)", filter: "blur(50px)" }}
      />

      {/* Login Card */}
      <div
        className="relative w-full max-w-[460px] bg-white rounded-[28px] px-12 py-12"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.08), 0 8px 24px rgba(0,184,148,0.1)",
        }}
      >
        {/* 3D offset shadow layer */}
        <div
          className="absolute inset-0 rounded-[28px] -z-10"
          style={{
            background: "rgba(0,184,148,0.1)",
            transform: "translate(8px, 8px)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--cue-green)" }}
          >
            C
          </div>
          <span
            className="font-extrabold text-xl tracking-tight"
            style={{ color: "var(--cue-green-dark)" }}
          >
            Cuemath
          </span>
        </div>

        <h1 className="text-[26px] font-[800] text-[var(--text-primary)] mb-2">
          Hiring Team Portal
        </h1>
        <p className="text-[14px] text-[var(--text-muted)] mb-10 leading-relaxed">
          Access candidate transcripts, AI assessments, and scorecard analytics.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Floating label input */}
          <div className="relative">
            <input
              type="password"
              id="access_code"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="block w-full px-4 pt-6 pb-2 text-[16px] bg-transparent border-b-2 border-[#C8E6E0] appearance-none focus:outline-none focus:ring-0 focus:border-[var(--cue-green)] peer transition-colors font-mono tracking-widest"
              style={{ color: "var(--text-primary)" }}
            />
            <label
              htmlFor="access_code"
              className="absolute text-[13px] text-[var(--text-muted)] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[var(--cue-green)]"
            >
              Access Code
            </label>
          </div>

          {error && (
            <p className="text-[#E53E3E] text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-[700] rounded-xl text-[16px] py-[16px] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-[2px]"
            style={{
              background: "var(--cue-green)",
              boxShadow: "0 8px 24px rgba(0,184,148,0.25)",
              height: "54px",
            }}
          >
            {loading ? "Authenticating..." : "Access Dashboard →"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[var(--border-light)]">
          <Link
            href="/"
            className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--cue-green)] transition-colors"
          >
            ← Back to Interview Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
