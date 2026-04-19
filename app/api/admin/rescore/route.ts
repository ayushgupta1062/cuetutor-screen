import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

async function scoreTranscript(transcript: string, groqKey: string): Promise<Record<string, unknown>> {
  const prompt = `You are an expert HR assessor for Cuemath. Analyze this tutor interview transcript.

Score each dimension 1-5. Use ACTUAL quotes from candidate responses.
If answers are vague or very short → score 2-3.
If answers show good teaching instincts → score 4-5.
If transcript is empty or very short → score 1, Reject.

Return ONLY raw JSON, exactly like this format. Ensure keys are double-quoted.
{"clarity_score":X,"clarity_quote":"quote","warmth_score":X,"warmth_quote":"quote","simplicity_score":X,"simplicity_quote":"quote","patience_score":X,"patience_quote":"quote","fluency_score":X,"fluency_quote":"quote","overall_score":X.X,"recommendation":"Strong Hire or Hire or Maybe or Reject","summary":"2-3 sentence assessment"}

Strong Hire=4.5+, Hire=3.5-4.4, Maybe=2.5-3.4, Reject=below 2.5

TRANSCRIPT:
${transcript}`

  // Groq API accepts OpenAI compatible chat completions
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      }),
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error("Groq error status:", res.status)
      const errData = await res.text()
      console.error("Groq error data:", errData)
      throw new Error(`Groq failed: ${res.status}`)
    }

    const data = await res.json()
    const rawText = data?.choices?.[0]?.message?.content
    
    if (rawText) {
      return JSON.parse(rawText)
    }
  } catch (err) {
    console.error("Groq scoring error:", err)
  }

  // Fallback default
  return {
    clarity_score: 2, clarity_quote: 'Could not evaluate',
    warmth_score: 2, warmth_quote: 'Could not evaluate',
    simplicity_score: 2, simplicity_quote: 'Could not evaluate',
    patience_score: 2, patience_quote: 'Could not evaluate',
    fluency_score: 2, fluency_quote: 'Could not evaluate',
    overall_score: 2.0,
    recommendation: 'Maybe',
    summary: 'Automatic evaluation failed. Please review transcript manually.'
  }
}

// ── GET /api/admin/rescore — rescore ALL completed interviews (or only those missing scores) ──
export async function GET(request: NextRequest) {
  // Prevent Next.js from caching Supabase fetch calls
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )

  const onlyMissing = request.nextUrl.searchParams.get('only_missing') !== 'false'
  const groqKey = process.env.GROQ_API_KEY!

  if (!groqKey) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 })
  }

  try {
    // 1. Fetch completed interviews
    const { data: interviews, error: intError } = await supabase
      .from('interviews')
      .select('id')
      .eq('status', 'completed')

    if (intError) throw new Error('Failed to fetch interviews: ' + intError.message)
    if (!interviews || interviews.length === 0) {
      return NextResponse.json({ message: 'No completed interviews found.' })
    }

    console.log(`Rescore: found ${interviews.length} completed interviews`)

    // 2. If only_missing=true, filter to those without scores
    let toScore = interviews
    if (onlyMissing) {
      const ids = interviews.map(i => i.id)
      const { data: existingScores } = await supabase
        .from('scores')
        .select('interview_id')
        .in('interview_id', ids)

      const scoredIds = new Set((existingScores || []).map((s: any) => s.interview_id))
      toScore = interviews.filter(i => !scoredIds.has(i.id))
      console.log(`Rescore: ${toScore.length} interviews missing scores`)
    }

    if (toScore.length === 0) {
      return NextResponse.json({ message: 'All completed interviews already have scores.', processed: 0 })
    }

    const results = []

    // 3. Loop and score each
    for (const interview of toScore) {
      const interview_id = interview.id

      // Fetch messages — try both created_at and timestamp column names
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('role, content')
        .eq('interview_id', interview_id)
        .order('timestamp', { ascending: true })

      if (msgError) {
        results.push({ interview_id, status: 'failed', error: msgError.message })
        continue
      }

      const transcript = (messages || [])
        .map((m: any) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
        .join('\n\n')

      if (!transcript.trim()) {
        results.push({ interview_id, status: 'skipped', reason: 'Empty transcript' })
        continue
      }

      try {
        const scores: any = await scoreTranscript(transcript, groqKey)

        const { error: scoreErr } = await supabase
          .from('scores')
          .upsert({
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
          }, { onConflict: 'interview_id' })

        if (scoreErr) throw new Error('Score save failed: ' + scoreErr.message)

        console.log(`✓ Scored interview ${interview_id}: ${scores.recommendation} (${scores.overall_score})`)
        results.push({ interview_id, status: 'success', recommendation: scores.recommendation })
      } catch (e: any) {
        console.error(`✗ Failed interview ${interview_id}:`, e.message)
        results.push({ interview_id, status: 'failed', error: e.message })
      }
    }

    return NextResponse.json({
      success: true,
      processed: toScore.length,
      succeeded: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    })

  } catch (err) {
    console.error('RESCORE ERROR:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
