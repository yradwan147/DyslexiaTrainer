import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { evaluateTransition } from '@/lib/transitions';

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
  const { exercise_id, correct_count, total_trials, increment_level } = body;
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

  const currentLevel = existing?.current_level ?? 1;
  let newLevel: number;

  // Use transition logic if correct_count and total_trials are provided
  if (correct_count !== undefined && total_trials !== undefined) {
    // Look up transition rules for this study/exercise
    const rule = db.prepare(
      'SELECT * FROM transition_rules WHERE study_id = ? AND exercise_id = ?'
    ).get(studyId, exercise_id) as {
      advance_threshold: number;
      regress_threshold: number;
      min_trials_required: number;
      max_level: number;
    } | undefined;

    const result = evaluateTransition({
      correctCount: correct_count,
      totalTrials: total_trials,
      currentLevel,
      rule: rule || undefined,
    });

    newLevel = result.newLevel;
  } else if (increment_level) {
    // Legacy: blind increment
    newLevel = Math.min(15, currentLevel + 1);
  } else {
    newLevel = currentLevel;
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
