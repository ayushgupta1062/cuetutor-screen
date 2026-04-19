# 🎓 Cuemath Tutor Assessment Portal

A premium, AI-powered platform designed to streamline the recruitment of mathematics tutors. This portal uses advanced AI to conduct automated voice-based interviews, evaluate candidates across multiple pedagogical dimensions, and provide HR teams with deep, data-driven insights.

---

## 🌟 Key Features

### 1. **Premium Landing Page**
A modern, high-conversion landing page designed to attract top-tier teaching talent. Features include:
- Glassmorphic UI elements and vibrant gradients.
- Fixed-attachment background imagery for a professional feel.
- Clear call-to-action for immediate candidate engagement.

![Landing Page](./public/screenshots/landing_page.png)

### 2. **AI-Powered Interview Room**
An interactive environment where candidates converse with **Aria**, the AI recruiter.
- **Voice-to-Text**: Real-time transcription using browser-native SpeechRecognition.
- **Text-to-Speech**: Natural-sounding AI voices via browser SpeechSynthesis.
- **Session Recording**: Full-session audio capture allowed for review by HR.

### 3. **Intelligent Scoring Dashboard**
Recruiters can manage candidates through a feature-rich HR Dashboard:
- **Automated Scorecards**: AI evaluates candidates on **Clarity**, **Warmth**, **Simplicity**, **Patience**, and **Fluency**.
- **Instant Verdicts**: Quick determination of "Strong Hire", "Hire", "Maybe", or "Reject".
- **Transcript Analysis**: View exact quotes from candidates that justify their scores.

(<img width="1912" height="916" alt="image" src="https://github.com/user-attachments/assets/e64a77e6-6ed4-48d4-909a-369329a5a3d1" />)

### 4. **Audio Playback for HR**
Every interview session is recorded and stored securely. Recruiters can:
- Listen to the full conversation directly from the candidate's report.
- Verify the AI's "Fluency" and "Clarity" scores with original audio.
- Ensure pedagogical quality through manual review.

(.<img width="1902" height="904" alt="image" src="https://github.com/user-attachments/assets/a05c9474-d415-455f-ae2c-5aa43314c132" />)

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Database & Storage**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage)
- **AI/LLM Logic**: [Groq API](https://groq.com/) (using Llama 3 for automated evaluation)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Groq API key

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/ayushgupta1062/cuetutor-screen.git
   cd cuetutor-screen
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GROQ_API_KEY=your_groq_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📄 License
This project is for internal evaluation purposes of the Cuemath Tutor Recruitment team.
