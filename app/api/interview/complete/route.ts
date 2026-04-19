import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Always use SERVICE ROLE KEY — anon key cannot update interviews table
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const interview_id = body.interview_id

    console.log('=== COMPLETE API CALLED, interview_id:', interview_id)

    if (!interview_id) {
      return NextResponse.json({ error: 'Missing interview_id' }, { status: 400 })
    }

    // ── 1. Fetch messages ────────────────────────────────────────────────────
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', interview_id)
      .order('timestamp', { ascending: true })

    if (msgError) {
      console.error('Messages fetch error:', msgError)
      return NextResponse.json({ error: 'Failed to fetch messages: ' + msgError.message }, { status: 500 })
    }

    console.log('Messages found:', messages?.length ?? 0)

    const transcript = (messages || [])
      .map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n')

    // ── 2. Score with Groq ─────────────────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY
    console.log('Groq key present:', !!groqKey)

    // Default fallback scores if Groq fails
    let scores = {
      clarity_score: 2,
      clarity_quote: 'Evaluation could not be completed automatically.',
      warmth_score: 2,
      warmth_quote: 'Evaluation could not be completed automatically.',
      simplicity_score: 2,
      simplicity_quote: 'Evaluation could not be completed automatically.',
      patience_score: 2,
      patience_quote: 'Evaluation could not be completed automatically.',
      fluency_score: 2,
      fluency_quote: 'Evaluation could not be completed automatically.',
      overall_score: 2.0,
      recommendation: 'Maybe',
      summary: 'Automatic AI evaluation could not be completed. Please review the transcript manually.'
    }

    if (groqKey && transcript.length > 50) {
      const prompt = `You are an expert HR assessor for Cuemath. Analyze this tutor interview.

Score each dimension 1-5 strictly. Use ACTUAL quotes from candidate responses.
IMPORTANT: If candidate says anything violent, rude, or inappropriate → score 1, recommend Reject.
If answers are vague or very short → score 2-3.
If answers show good teaching instincts → score 4-5.

DIMENSIONS:
1. clarity_score: How clearly and articulately does the candidate communicate?
2. warmth_score: Does the candidate show genuine care and empathy toward students?
3. simplicity_score: Can the candidate explain concepts in simple, accessible terms?
4. patience_score: Does the candidate demonstrate patience with struggling students?
5. fluency_score: Is the candidate's English fluent and grammatically correct?

RULES:
- overall_score = average of all 5 scores (1 decimal)
- Strong Hire = 4.5+, Hire = 3.5-4.4, Maybe = 2.5-3.4, Reject = below 2.5
- If transcript is empty or very short → Reject with score 1

Return ONLY raw JSON, exactly like this format. Ensure keys are double-quoted.
{"clarity_score":X,"clarity_quote":"exact quote","warmth_score":X,"warmth_quote":"exact quote","simplicity_score":X,"simplicity_quote":"exact quote","patience_score":X,"patience_quote":"exact quote","fluency_score":X,"fluency_quote":"exact quote","overall_score":X.X,"recommendation":"Strong Hire or Hire or Maybe or Reject","summary":"2-3 sentence assessment of the candidate"}

TRANSCRIPT:
${transcript}`

      try {
        console.log(`Trying Groq model: llama-3.3-70b-versatile`)
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        })

        console.log(`Groq status:`, groqRes.status)
        const groqData = await groqRes.json()

        if (!groqRes.ok) {
          console.error(`Groq error:`, groqData)
        } else {
          const rawText = groqData?.choices?.[0]?.message?.content
          console.log('Groq raw text (first 400 chars):', rawText?.substring(0, 400))

          if (rawText) {
            scores = JSON.parse(rawText)
            console.log('Scores parsed successfully:', JSON.stringify(scores))
          }
        }
      } catch (modelErr) {
        console.error(`Groq failed:`, modelErr)
      }
    } else {
      console.log('Skipping Groq — no key or transcript too short')
    }

    // ── 3. Save scores to DB ─────────────────────────────────────────────────
    console.log('Saving scores to DB...')
    const { error: scoreErr } = await supabase
      .from('scores')
      .upsert(
        {
          interview_id,
          clarity_score: scores.clarity_score,
          clarity_quote: scores.clarity_quote,
          warmth_score: scores.warmth_score,
          warmth_quote: scores.warmth_quote,
          simplicity_score: scores.simplicity_score,
          simplicity_quote: scores.simplicity_quote,
          patience_score: scores.patience_score,
          patience_quote: scores.patience_quote,
          fluency_score: scores.fluency_score,
          fluency_quote: scores.fluency_quote,
          overall_score: scores.overall_score,
          recommendation: scores.recommendation,
          summary: scores.summary
        },
        { onConflict: 'interview_id' }
      )

    if (scoreErr) {
      console.error('Score upsert error:', scoreErr)
      return NextResponse.json({ error: 'Failed to save scores: ' + scoreErr.message }, { status: 500 })
    }
    console.log('Scores saved successfully')

    // ── 4. Mark interview as completed ───────────────────────────────────────
    console.log('Marking interview as completed...')
    const { error: updateErr } = await supabase
      .from('interviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        audio_url: body.audio_url || null
      })
      .eq('id', interview_id)

    if (updateErr) {
      console.error('Interview status update error:', updateErr)
      return NextResponse.json({ error: 'Failed to update interview status: ' + updateErr.message }, { status: 500 })
    }
    console.log('Interview marked completed ✓')

    // ── 5. Success ───────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      recommendation: scores.recommendation,
      overall_score: scores.overall_score
    })

  } catch (err: any) {
    console.error('=== COMPLETE API FATAL ERROR:', err)
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
