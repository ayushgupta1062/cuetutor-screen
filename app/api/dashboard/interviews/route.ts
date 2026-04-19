import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
  try {
    // ── 1. Fetch ALL completed interviews ──────────────────────────────────────
    // Use !left to force LEFT JOIN on candidates so interviews without a
    // matching candidate row are NOT silently dropped.
    const { data: interviews, error: intError } = await supabase
      .from('interviews')
      .select(`
        id, status, started_at, completed_at, candidate_id,
        candidates!left ( id, name, email )
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (intError) {
      console.error('Dashboard interviews fetch error:', intError)
      throw intError
    }

    console.log('Completed interviews from DB:', interviews?.length ?? 0)

    if (!interviews || interviews.length === 0) {
      return NextResponse.json({ interviews: [] })
    }

    // ── 2. Fetch all scores for these interview IDs ────────────────────────────
    const interviewIds = interviews.map(i => i.id)
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select('*')
      .in('interview_id', interviewIds)

    if (scoresError) {
      console.error('Scores fetch error:', scoresError)
    }

    console.log('Scores found:', allScores?.length ?? 0, 'for', interviewIds.length, 'interviews')

    // ── 3. Merge scores into interviews ────────────────────────────────────────
    const merged = interviews.map(interview => {
      const score = allScores?.find(s => s.interview_id === interview.id) ?? null

      // If candidate join returned null, build a fallback so the row still renders
      const candidateData = interview.candidates || {
        id: interview.candidate_id,
        name: 'Unknown Candidate',
        email: '—'
      }

      return {
        ...interview,
        candidates: candidateData,
        scores: score,
        // Flag interviews that completed but have no scores yet
        needs_scoring: !score
      }
    })

    console.log('Dashboard merged interviews:', merged.length)
    return NextResponse.json({ interviews: merged })

  } catch (err) {
    console.error('Dashboard interviews API error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
