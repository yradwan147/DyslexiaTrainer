import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

// GET: Fetch current progress for a user/exercise
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exerciseId');
  const userId = Number(session.user.id);

  if (exerciseId) {
    // Get progress for a specific exercise
    // Find the user's study
    const participant = db.prepare(
      'SELECT study_id FROM participants WHERE user_id = ? LIMIT 1'
    ).get(userId) as { study_id: number } | undefined;

    if (!participant) {
      return NextResponse.json({ current_level: 1, total_sessions_completed: 0 });
    }

    const progress = db.prepare(
      'SELECT * FROM exercise_progress WHERE user_id = ? AND study_id = ? AND exercise_id = ?'
    ).get(userId, participant.study_id, exerciseId) as Record<string, unknown> | undefined;

    if (!progress) {
      return NextResponse.json({ current_level: 1, total_sessions_completed: 0 });
    }

    return NextResponse.json(progress);
  }

  // Get all progress for the user
  const allProgress = db.prepare(
    'SELECT * FROM exercise_progress WHERE user_id = ?'
  ).all(userId);

  return NextResponse.json({ data: allProgress });
}

// POST: Update progress after exercise completion
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { exercise_id, correct_count, total_trials, ending_coherence } = body;

  // Auto-advancement policy:
  // - Every exercise starts at Level 1 and advances one level the session after the
  //   child scores >= 70% (advance-only; a lower score keeps the same level).
  // - Coherent motion is the exception: it has no discrete level — the next session
  //   resumes at the coherence (%) the staircase ended on, stored in current_level.
  const ADVANCE_THRESHOLD = 0.70;
  const MAX_LEVEL = 15;
  const userId = Number(session.user.id);

  // Find the user's study
  const participant = db.prepare(
    'SELECT study_id FROM participants WHERE user_id = ? LIMIT 1'
  ).get(userId) as { study_id: number } | undefined;

  if (!participant) {
    return NextResponse.json({ error: 'No study assignment found' }, { status: 400 });
  }

  const studyId = participant.study_id;

  // Get existing progress
  const existing = db.prepare(
    'SELECT * FROM exercise_progress WHERE user_id = ? AND study_id = ? AND exercise_id = ?'
  ).get(userId, studyId, exercise_id) as { current_level: number; total_sessions_completed: number } | undefined;

  let newLevel: number;
  if (exercise_id === 'coherent_motion') {
    // Carry over the ending coherence (1–100). Fall back to the stored value, then 30.
    const coh = typeof ending_coherence === 'number' ? ending_coherence : (existing?.current_level ?? 30);
    newLevel = Math.max(1, Math.min(100, Math.round(coh)));
  } else {
    const base = existing?.current_level ?? 1;
    const accuracy = total_trials > 0 ? correct_count / total_trials : 0;
    newLevel = (accuracy >= ADVANCE_THRESHOLD && base < MAX_LEVEL) ? base + 1 : base;
  }

  // Upsert progress
  if (existing) {
    db.prepare(`
      UPDATE exercise_progress
      SET current_level = ?,
          total_sessions_completed = total_sessions_completed + 1,
          last_completed_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND study_id = ? AND exercise_id = ?
    `).run(newLevel, userId, studyId, exercise_id);

    return NextResponse.json({
      current_level: newLevel,
      total_sessions_completed: existing.total_sessions_completed + 1,
    });
  } else {
    db.prepare(`
      INSERT INTO exercise_progress (user_id, study_id, exercise_id, current_level, total_sessions_completed, last_completed_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `).run(userId, studyId, exercise_id, newLevel);

    return NextResponse.json({
      current_level: newLevel,
      total_sessions_completed: 1,
    });
  }
}
