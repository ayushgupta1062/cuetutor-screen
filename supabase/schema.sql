-- CueTutor Screen — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- Table: candidates
-- ============================================================
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- ============================================================
-- Table: interviews
-- ============================================================
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- Table: messages
-- ============================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references interviews(id) on delete cascade,
  role text not null check (role in ('ai', 'candidate')),
  content text not null,
  question_number integer,
  timestamp timestamptz default now()
);

-- ============================================================
-- Table: scores
-- ============================================================
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references interviews(id) on delete cascade unique,
  clarity_score integer not null check (clarity_score between 1 and 5),
  clarity_quote text not null,
  warmth_score integer not null check (warmth_score between 1 and 5),
  warmth_quote text not null,
  simplicity_score integer not null check (simplicity_score between 1 and 5),
  simplicity_quote text not null,
  patience_score integer not null check (patience_score between 1 and 5),
  patience_quote text not null,
  fluency_score integer not null check (fluency_score between 1 and 5),
  fluency_quote text not null,
  overall_score numeric(3,1) not null,
  recommendation text not null check (recommendation in ('Strong Hire', 'Hire', 'Maybe', 'Reject')),
  summary text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_interviews_candidate_id on interviews(candidate_id);
create index if not exists idx_interviews_status on interviews(status);
create index if not exists idx_messages_interview_id on messages(interview_id);
create index if not exists idx_scores_interview_id on scores(interview_id);
