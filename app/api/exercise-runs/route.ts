import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userId = session.user.id;
  const body = await request.json();
  const { 
    exercise_id, 
    exercise_version, 
    difficulty_level,
    total_trials 
  } = body;

  const result = db.prepare(`
    INSERT INTO exercise_runs (
      user_id, exercise_id, exercise_version, difficulty_level,
      total_trials, started_at
    )
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(userId, exercise_id, exercise_version, difficulty_level, total_trials);

  const exerciseRun = db.prepare('SELECT * FROM exercise_runs WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ exerciseRun });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { exerciseRunId, correct_count, avg_reaction_time_ms } = body;

  db.prepare(`
    UPDATE exercise_runs 
    SET ended_at = datetime('now'),
        correct_count = ?,
        avg_reaction_time_ms = ?
    WHERE id = ?
  `).run(correct_count, avg_reaction_time_ms, exerciseRunId);

  const exerciseRun = db.prepare('SELECT * FROM exercise_runs WHERE id = ?').get(exerciseRunId);
  return NextResponse.json({ exerciseRun });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '50';

  // Get exercise runs for the current user
  const exerciseRuns = db.prepare(`
    SELECT * FROM exercise_runs 
    WHERE user_id = ? 
    ORDER BY started_at DESC 
    LIMIT ?
  `).all(userId, parseInt(limit));

  return NextResponse.json({ exerciseRuns });
}
