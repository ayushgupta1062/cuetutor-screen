import { createClient } from "@supabase/supabase-js";

// Server-side only Supabase client using service role key
// NEVER use this in client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client-side Supabase client using anon key for public storage uploads
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our database schema
export type Candidate = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type Interview = {
  id: string;
  candidate_id: string;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
  audio_url: string | null;
};

export type Message = {
  id: string;
  interview_id: string;
  role: "ai" | "candidate";
  content: string;
  question_number: number | null;
  timestamp: string;
};

export type Score = {
  id: string;
  interview_id: string;
  clarity_score: number;
  clarity_quote: string;
  warmth_score: number;
  warmth_quote: string;
  simplicity_score: number;
  simplicity_quote: string;
  patience_score: number;
  patience_quote: string;
  fluency_score: number;
  fluency_quote: string;
  overall_score: number;
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "Reject";
  summary: string;
  created_at: string;
};

export type InterviewWithDetails = Interview & {
  candidates: Candidate;
  scores: Score | null;
};
