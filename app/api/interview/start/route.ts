import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Upsert candidate (handle duplicate email gracefully)
    let candidateId: string;

    const { data: existingCandidate } = await supabase
      .from("candidates")
      .select("id, name")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existingCandidate) {
      candidateId = existingCandidate.id;
    } else {
      const { data: newCandidate, error: candidateError } = await supabase
        .from("candidates")
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
        })
        .select("id")
        .single();

      if (candidateError || !newCandidate) {
        console.error("Candidate insert error:", candidateError);
        return NextResponse.json(
          { error: "Failed to create candidate" },
          { status: 500 }
        );
      }
      candidateId = newCandidate.id;
    }

    // Create a new interview session
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .insert({
        candidate_id: candidateId,
        status: "in_progress",
      })
      .select("id")
      .single();

    if (interviewError || !interview) {
      console.error("Interview insert error:", interviewError);
      return NextResponse.json(
        { error: "Failed to create interview" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interview_id: interview.id,
      candidate_name: name.trim(),
    });
  } catch (error) {
    console.error("Start API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
