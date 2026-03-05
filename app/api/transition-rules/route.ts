import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

// GET: Fetch transition rules for a study
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('studyId');

  if (!studyId) {
    return NextResponse.json({ error: 'studyId is required' }, { status: 400 });
  }

  const rules = db.prepare(
    'SELECT * FROM transition_rules WHERE study_id = ?'
  ).all(studyId);

  return NextResponse.json({ rules });
}

// POST: Create or update a transition rule
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const {
    study_id,
    exercise_id,
    advance_threshold = 0.8,
    regress_threshold = 0.5,
    min_trials_required = 5,
    max_level = 15,
  } = body;

  if (!study_id || !exercise_id) {
    return NextResponse.json({ error: 'study_id and exercise_id are required' }, { status: 400 });
  }

  db.prepare(`
    INSERT OR REPLACE INTO transition_rules
      (study_id, exercise_id, advance_threshold, regress_threshold, min_trials_required, max_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(study_id, exercise_id, advance_threshold, regress_threshold, min_trials_required, max_level);

  const rule = db.prepare(
    'SELECT * FROM transition_rules WHERE study_id = ? AND exercise_id = ?'
  ).get(study_id, exercise_id);

  return NextResponse.json({ rule });
}

// DELETE: Remove a transition rule
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  db.prepare('DELETE FROM transition_rules WHERE id = ?').run(id);

  return NextResponse.json({ success: true });
}
