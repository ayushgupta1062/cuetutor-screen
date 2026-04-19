import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateFollowUp } from "@/lib/gemini";
import { QUESTIONS } from "@/lib/questions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interview_id, question_number, candidate_response } = body;

    if (!interview_id || question_number === undefined || !candidate_response) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save candidate message to DB
    const { error: candidateMsgError } = await supabase
      .from("messages")
      .insert({
        interview_id,
        role: "candidate",
        content: candidate_response,
        question_number,
      });

    if (candidateMsgError) {
      console.error("Candidate message save error:", candidateMsgError);
    }

    // Determine if follow-up is needed using Gemini
    const currentQuestion = QUESTIONS[question_number];
    const followUpResult = await generateFollowUp(
      currentQuestion,
      candidate_response
    );

    let aiContent: string;
    let nextQuestionNumber: number;
    let responseType: "followup" | "next_question";

    if (
      followUpResult.type === "followup" &&
      followUpResult.content
    ) {
      // Ask follow-up on the same question
      aiContent = followUpResult.content;
      nextQuestionNumber = question_number;
      responseType = "followup";
    } else {
      // Move to next question
      const nextIndex = question_number + 1;
      if (nextIndex < QUESTIONS.length) {
        aiContent = QUESTIONS[nextIndex];
        nextQuestionNumber = nextIndex;
        responseType = "next_question";
      } else {
        // Interview complete
        aiContent =
          "Thank you so much for your thoughtful answers. That concludes our interview. We'll review your responses and get back to you soon!";
        nextQuestionNumber = question_number + 1;
        responseType = "next_question";
      }
    }

    // Save AI response to DB
    const { error: aiMsgError } = await supabase.from("messages").insert({
      interview_id,
      role: "ai",
      content: aiContent,
      question_number: nextQuestionNumber,
    });

    if (aiMsgError) {
      console.error("AI message save error:", aiMsgError);
    }

    return NextResponse.json({
      response_type: responseType,
      content: aiContent,
      next_question_number: nextQuestionNumber,
    });
  } catch (error) {
    console.error("Respond API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
