import { GoogleGenerativeAI } from "@google/generative-ai";

// Server-side only — NEVER import in client components
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface FollowUpResponse {
  type: "followup" | "next";
  content: string;
}

export interface ScoreResponse {
  clarity: { score: number; quote: string };
  warmth: { score: number; quote: string };
  simplicity: { score: number; quote: string };
  patience: { score: number; quote: string };
  fluency: { score: number; quote: string };
  overall_score: number;
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "Reject";
  summary: string;
}

/**
 * Given an interview question and candidate answer, decide if a follow-up
 * is needed or if we should move to the next question.
 */
export async function generateFollowUp(
  question: string,
  candidateResponse: string
): Promise<FollowUpResponse> {
  const prompt = `You are an AI interviewer conducting a tutor screening for Cuemath, an online math tutoring platform.

The candidate was asked: "${question}"

The candidate responded: "${candidateResponse}"

Was their answer specific, clear, and at least 30 words long? 
- If the answer is vague, too short (under 30 words), or lacks concrete detail, generate ONE natural, conversational follow-up question to probe deeper.
- If the answer is satisfactory and clear, return type "next" to move on.

Return ONLY valid JSON, no markdown, no explanation:
{"type": "followup" or "next", "content": "the follow-up question text OR empty string if next"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      type: parsed.type === "followup" ? "followup" : "next",
      content: parsed.content || "",
    };
  } catch (error) {
    console.error("Gemini follow-up error:", error);
    // Fallback: move to next question
    return { type: "next", content: "" };
  }
}

/**
 * Score a full interview transcript across 5 dimensions.
 */
export async function scoreInterview(
  transcript: string
): Promise<ScoreResponse> {
  const prompt = `You are an expert HR assessor for Cuemath, an online math tutoring platform. Analyze the following tutor candidate interview transcript and score the candidate on 5 dimensions. For each dimension, give a score from 1-5 and select a SHORT direct quote from the candidate's responses as evidence. Return ONLY valid JSON, no markdown, no explanation.

Dimensions:
- clarity: How clearly and articulately does the candidate communicate?
- warmth: Does the candidate show genuine care, empathy, and encouragement toward students?
- simplicity: Can the candidate explain complex concepts in simple, accessible terms?
- patience: Does the candidate demonstrate patience and multiple strategies when faced with a struggling student?
- fluency: Is the candidate's English fluent, natural, and grammatically correct?

Also provide:
- overall_score: average of the 5 scores (1 decimal place)
- recommendation: one of "Strong Hire" (4.5+), "Hire" (3.5-4.4), "Maybe" (2.5-3.4), "Reject" (below 2.5)
- summary: 2-3 sentence overall assessment

Return format:
{
  "clarity": { "score": number, "quote": string },
  "warmth": { "score": number, "quote": string },
  "simplicity": { "score": number, "quote": string },
  "patience": { "score": number, "quote": string },
  "fluency": { "score": number, "quote": string },
  "overall_score": number,
  "recommendation": string,
  "summary": string
}

Transcript:
${transcript}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed as ScoreResponse;
}
