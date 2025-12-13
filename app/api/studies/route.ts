import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const studies = db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM participants WHERE study_id = s.id) as participant_count,
      (SELECT COUNT(*) FROM exercise_runs er 
       JOIN users u ON er.user_id = u.id 
       JOIN participants p ON p.user_id = u.id
       WHERE p.study_id = s.id AND er.ended_at IS NOT NULL) as completed_exercises
    FROM studies s
    ORDER BY s.created_at DESC
  `).all() as Array<{ id: number; [key: string]: unknown }>;

  // Get exercises for each study
  const studiesWithExercises = studies.map((study) => {
    const exercises = db.prepare(`
      SELECT * FROM study_exercises WHERE study_id = ? ORDER BY display_order ASC
    `).all(study.id);
    return { ...study, exercises };
  });

  return NextResponse.json({ studies: studiesWithExercises });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const {
    name,
    description,
    start_date,
    end_date,
    target_sessions,
    session_duration_minutes,
    exercises,
  } = body;

  // Create study
  const result = db.prepare(`
    INSERT INTO studies (name, description, start_date, end_date, target_sessions, session_duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, description || null, start_date || null, end_date || null, target_sessions || 15, session_duration_minutes || 30);

  const studyId = result.lastInsertRowid;

  // Add exercises
  if (exercises && exercises.length > 0) {
    const insertExercise = db.prepare(`
      INSERT INTO study_exercises (study_id, exercise_id, exercise_version, difficulty_level, trial_count, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const ex of exercises) {
      insertExercise.run(
        studyId,
        ex.exercise_id,
        ex.exercise_version || '1.0.0',
        ex.difficulty_level || 1,
        ex.trial_count || 10,
        ex.display_order
      );
    }
  }

  const study = db.prepare('SELECT * FROM studies WHERE id = ?').get(studyId) as Record<string, unknown>;
  const studyExercises = db.prepare('SELECT * FROM study_exercises WHERE study_id = ?').all(studyId);

  return NextResponse.json({ study: { ...study, exercises: studyExercises } });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { id, is_locked, ...updates } = body;

  if (is_locked !== undefined) {
    db.prepare('UPDATE studies SET is_locked = ? WHERE id = ?').run(is_locked ? 1 : 0, id);
  }

  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    db.prepare(`UPDATE studies SET ${setClause} WHERE id = ?`).run(...values);
  }

  const study = db.prepare('SELECT * FROM studies WHERE id = ?').get(id);
  return NextResponse.json({ study });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('id');

  if (!studyId) {
    return NextResponse.json({ error: 'Study ID required' }, { status: 400 });
  }

  db.prepare('DELETE FROM studies WHERE id = ?').run(studyId);
  return NextResponse.json({ success: true });
}

