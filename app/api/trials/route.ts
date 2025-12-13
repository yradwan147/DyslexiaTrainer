import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const {
    exercise_run_id,
    trial_index,
    trial_config,
    correct_answer,
    user_response,
    response_time_ms,
    is_correct,
    is_timed_out,
    is_skipped,
    started_at,
    responded_at,
  } = body;

  const result = db.prepare(`
    INSERT INTO trials (
      exercise_run_id, trial_index, trial_config, correct_answer,
      user_response, response_time_ms, is_correct, is_timed_out,
      is_skipped, started_at, responded_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    exercise_run_id,
    trial_index,
    trial_config,
    correct_answer,
    user_response,
    response_time_ms,
    is_correct ? 1 : 0,
    is_timed_out ? 1 : 0,
    is_skipped ? 1 : 0,
    started_at,
    responded_at
  );

  return NextResponse.json({ trialId: result.lastInsertRowid });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const exerciseRunId = searchParams.get('exerciseRunId');

  if (exerciseRunId) {
    const trials = db.prepare(`
      SELECT * FROM trials WHERE exercise_run_id = ? ORDER BY trial_index ASC
    `).all(exerciseRunId);
    return NextResponse.json({ trials });
  }

  return NextResponse.json({ trials: [] });
}

