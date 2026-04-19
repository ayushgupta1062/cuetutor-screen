import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;

    // Fetch interview with candidate (using LEFT JOIN so it doesn't fail if candidate missing)
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select(`
        *,
        candidates!left (
          id,
          name,
          email
        )
      `)
      .eq("id", interviewId)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Add fallback for candidate data
    interview.candidates = interview.candidates || {
      id: interview.candidate_id,
      name: 'Unknown Candidate',
      email: '—'
    };

    // Fetch scores
    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("interview_id", interviewId)
      .single();

    // Fetch messages (using correct timestamp column)
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content, question_number, timestamp")
      .eq("interview_id", interviewId)
      .order("timestamp", { ascending: true });

    return NextResponse.json({
      interview,
      scores: scores || null,
      messages: messages || [],
    });
  } catch (error) {
    console.error("Interview detail API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
