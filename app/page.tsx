"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mic, CheckCircle, UserCircle, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-[#1A2332] bg-white">
      {/* Nav (Premium Solid Header) */}
      <header className="w-full bg-white relative z-50" style={{ 
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,184,148,0.1)'
      }}>
        {/* Premium purely decorative top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'var(--gradient-green)' }} />
        
        <nav className="flex items-center justify-between px-10 py-[18px] max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{ background: 'var(--gradient-green)' }}
            >
              C
            </div>
            <span className="font-extrabold text-[#1A2332] text-xl tracking-tight" style={{ color: 'var(--cue-green-dark)' }}>Cuemath</span>
            <span className="text-[#8A9BB0] font-light hidden sm:inline mx-1">|</span>
            <span className="text-[#8A9BB0] font-medium hidden sm:inline text-sm">Tutor Assessment</span>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="text-[14px] font-[600] px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-md hover:-translate-y-[1px]"
              style={{
                background: 'rgba(0,184,148,0.06)',
                color: 'var(--cue-green-dark)',
                border: '1px solid rgba(0,184,148,0.15)'
              }}
            >
              HR Login &rarr;
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION & BACKGROUND WRAPPER ── */}
      <div className="relative w-full overflow-hidden bg-white min-h-[100vh] flex flex-col justify-end">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1758685848142-06e158cf64bc?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
          }}
        />
        {/* Overlay — Frosted bottom to make text highly readable */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.95) 75%, rgba(255,255,255,1) 100%)',
          }}
        />
        {/* Bottom fade overlap for smooth transition to sections */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[100px] z-[2] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,1))'
          }}
        />

        {/* Hero Content */}
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-[78vh] pb-16 w-full max-w-[800px] mx-auto mt-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold mb-10"
            style={{
              background: "var(--cue-green-light)",
              border: "1px solid rgba(0, 184, 148, 0.2)",
              color: "var(--cue-green-dark)",
            }}
          >
            ✦ Cuemath Official Tutor Assessment Portal
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(36px,5.5vw,64px)] font-[800] leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-6"
          >
            Begin Your Journey<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-green)' }}>
              as a Cuemath Tutor
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[17px] text-[var(--text-secondary)] font-[500] max-w-[500px] leading-[1.6] mb-10"
          >
            Complete a short structured interview from the comfort of your home. Our team reviews your responses within 48 hours.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center w-full"
          >
            <Link
              href="/interview"
              className="flex items-center justify-center gap-2 px-12 py-[18px] w-full sm:w-auto rounded-full font-[700] text-white text-[18px] transition-all duration-300 hover:-translate-y-[2px]"
              style={{
                background: 'var(--gradient-orange)',
                boxShadow: '0 8px 32px rgba(225,112,85,0.35)'
              }}
            >
              Start Your Interview &rarr;
            </Link>

            <div className="flex items-center justify-center flex-wrap gap-3 mt-8 text-[13px] text-[var(--text-muted)] font-medium">
              <span>🔒 Private & Secure</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span>⏱ Takes 8–10 minutes</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span>📱 Any device</span>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ── LOWER SECTIONS WITH NEW BACKGROUND ── */}
      <div className="relative w-full">
        {/* New Background Image (Below the Hero Teacher Image) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1758685848226-eedca8f6bce7?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Premium frost overlay to ensure section text remains highly readable */}
        <div className="absolute inset-0 z-[1] bg-white/85 backdrop-blur-[4px] pointer-events-none" />

        <div className="relative z-10 pt-12 pb-12">
          {/* Floating Stats Row */}
          <section className="max-w-5xl mx-auto px-6 pb-24 h-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { num: "5", label: "Questions" },
                { num: "8-10", label: "Minutes" },
                { num: "5", label: "Dimensions Evaluated" },
                { num: "48hr", label: "Response Time" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-white/90 backdrop-blur-md p-6 rounded-[20px] text-center transition-transform hover:-translate-y-1"
                  style={{
                    boxShadow: 'var(--shadow-float)',
                    border: '1px solid rgba(0,184,148,0.1)'
                  }}
                >
                  <div className="text-[36px] font-[800] leading-none mb-2" style={{ color: 'var(--cue-green)' }}>
                    {stat.num}
                  </div>
                  <div className="text-[14px] font-[600] text-[var(--text-secondary)]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* How it works */}
          <section className="py-24 px-6 rounded-3xl mx-6 sm:mx-12 overflow-hidden relative shadow-sm border border-black/5" style={{ background: 'rgba(248, 250, 252, 0.7)' }}>
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-[32px] font-[800] text-[var(--text-primary)] mb-4">
                  What to Expect
                </h2>
                <p className="text-[18px] text-[var(--text-secondary)]">
                  A simple 4-step process designed for your comfort
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { step: "1", icon: UserCircle, title: "Register", desc: "Enter your name and email" },
                  { step: "2", icon: Mic, title: "Interview", desc: "Answer 5 structured questions" },
                  { step: "3", icon: BarChart, title: "Evaluate", desc: "Responses assessed across dimensions" },
                  { step: "4", icon: CheckCircle, title: "Decision", desc: "Hear back within 48 hours" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[20px] p-8 text-center flex flex-col items-center transition-transform hover:-translate-y-2 relative"
                    style={{
                      boxShadow: 'var(--shadow-md)',
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = `perspective(1000px) rotateY(5deg) translateY(-4px)`;
                    }}
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = `none`;
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white mb-6 font-bold shadow-lg"
                      style={{ background: 'var(--gradient-green)' }}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-3">{item.title}</h3>
                    <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Requirements Section */}
          <section className="py-24 px-6 relative z-10 w-full mb-12">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-[32px] font-[800] text-[var(--text-primary)] mb-12">
                Before You Begin
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 border-b-black/5 p-8 flex flex-col items-center text-center">
                  <Mic className="w-8 h-8 mb-4 stroke-2" style={{ color: 'var(--cue-green)' }} />
                  <h4 className="font-bold text-[18px] mb-2">Working Microphone</h4>
                  <p className="text-[14px] text-[var(--text-muted)]">Built-in or external, any will work perfectly.</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 border-b-black/5 p-8 flex flex-col items-center text-center">
                  <div className="w-8 h-8 mb-4 flex justify-center items-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cue-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                  </div>
                  <h4 className="font-bold text-[18px] mb-2">Quiet Environment</h4>
                  <p className="text-[14px] text-[var(--text-muted)]">Find a calm spot for best audio analysis results.</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 border-b-black/5 p-8 flex flex-col items-center text-center">
                  <svg className="w-8 h-8 mb-4 stroke-2" viewBox="0 0 24 24" fill="none" stroke="var(--cue-green)" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <h4 className="font-bold text-[18px] mb-2">10 Minutes Free</h4>
                  <p className="text-[14px] text-[var(--text-muted)]">Uninterrupted time to complete the interview continuously.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6" style={{ background: 'var(--text-primary)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--cue-green)' }}>
              C
            </div>
            <span className="font-bold text-white tracking-wide">Cuemath Tutor Assessment</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-[#8A9BB0]">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>

          <div className="text-[13px] text-[#8A9BB0]">
            © 2026 Cuemath. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
