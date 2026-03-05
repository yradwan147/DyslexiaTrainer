import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const exerciseId = searchParams.get('exerciseId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // Get all exercise runs for this user, optionally filtered by exercise
  const runsQuery = `
    SELECT
      er.id,
      er.exercise_id,
      er.difficulty_level,
      er.started_at,
      er.ended_at,
      er.total_trials,
      er.correct_count,
      er.avg_reaction_time_ms
    FROM exercise_runs er
    WHERE er.user_id = ?
    ${exerciseId ? 'AND er.exercise_id = ?' : ''}
    ORDER BY er.started_at ASC
  `;

  const runs = exerciseId
    ? db.prepare(runsQuery).all(userId, exerciseId) as Record<string, unknown>[]
    : db.prepare(runsQuery).all(userId) as Record<string, unknown>[];

  // Get metrics for each run
  const metricsQuery = `
    SELECT erm.exercise_run_id, erm.metric_key, erm.metric_value
    FROM exercise_run_metrics erm
    WHERE erm.exercise_run_id IN (
      SELECT id FROM exercise_runs WHERE user_id = ?
      ${exerciseId ? 'AND exercise_id = ?' : ''}
    )
    ORDER BY erm.exercise_run_id
  `;

  const metrics = exerciseId
    ? db.prepare(metricsQuery).all(userId, exerciseId) as { exercise_run_id: number; metric_key: string; metric_value: number }[]
    : db.prepare(metricsQuery).all(userId) as { exercise_run_id: number; metric_key: string; metric_value: number }[];

  // Group metrics by run
  const metricsByRun: Record<number, Record<string, number>> = {};
  for (const m of metrics) {
    if (!metricsByRun[m.exercise_run_id]) metricsByRun[m.exercise_run_id] = {};
    metricsByRun[m.exercise_run_id][m.metric_key] = m.metric_value;
  }

  // Get trial data for coherence staircase
  let coherenceTrials: Record<string, unknown>[] = [];
  if (!exerciseId || exerciseId === 'coherent_motion') {
    coherenceTrials = db.prepare(`
      SELECT
        t.trial_index,
        t.user_response,
        t.response_time_ms,
        t.is_correct,
        er.id as run_id,
        er.started_at as run_started_at
      FROM trials t
      JOIN exercise_runs er ON t.exercise_run_id = er.id
      WHERE er.user_id = ? AND er.exercise_id = 'coherent_motion'
      ORDER BY er.started_at ASC, t.trial_index ASC
    `).all(userId) as Record<string, unknown>[];
  }

  // Get progress levels
  const progress = db.prepare(
    'SELECT * FROM exercise_progress WHERE user_id = ?'
  ).all(userId) as Record<string, unknown>[];

  // Get user info
  const user = db.prepare(
    'SELECT id, child_code, first_name, age, created_at FROM users WHERE id = ?'
  ).get(userId) as Record<string, unknown> | undefined;

  // Get session history
  const sessions = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM exercise_runs WHERE session_id = s.id) as exercises_completed
    FROM sessions s
    WHERE s.participant_id IN (SELECT id FROM participants WHERE user_id = ?)
    ORDER BY s.session_number ASC
  `).all(userId) as Record<string, unknown>[];

  // Get study info for progress context
  const studyInfo = db.prepare(`
    SELECT st.name as study_name, st.target_sessions
    FROM participants p
    JOIN studies st ON p.study_id = st.id
    WHERE p.user_id = ?
    LIMIT 1
  `).get(userId) as { study_name: string; target_sessions: number } | undefined;

  return NextResponse.json({
    user,
    runs: runs.map(r => ({
      ...r,
      metrics: metricsByRun[(r as { id: number }).id] || {},
    })),
    coherenceTrials,
    progress,
    sessions,
    studyInfo,
  });
}
