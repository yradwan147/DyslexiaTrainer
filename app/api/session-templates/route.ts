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
  const studyId = searchParams.get('studyId');

  if (!studyId) {
    return NextResponse.json({ error: 'studyId is required' }, { status: 400 });
  }

  const templates = db.prepare(
    'SELECT * FROM session_templates WHERE study_id = ? ORDER BY template_number ASC'
  ).all(studyId) as { id: number; study_id: number; template_number: number; label: string | null }[];

  // Get exercises for each template
  const templatesWithExercises = templates.map(t => {
    const exercises = db.prepare(
      'SELECT * FROM session_template_exercises WHERE template_id = ? ORDER BY display_order ASC'
    ).all(t.id);
    return { ...t, exercises };
  });

  return NextResponse.json({ templates: templatesWithExercises });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { study_id, label, exercises } = body;

  if (!study_id) {
    return NextResponse.json({ error: 'study_id is required' }, { status: 400 });
  }

  // Determine next template number
  const maxTemplate = db.prepare(
    'SELECT MAX(template_number) as max_num FROM session_templates WHERE study_id = ?'
  ).get(study_id) as { max_num: number | null };

  const templateNumber = (maxTemplate.max_num ?? 0) + 1;

  const result = db.prepare(`
    INSERT INTO session_templates (study_id, template_number, label)
    VALUES (?, ?, ?)
  `).run(study_id, templateNumber, label || `Session Type ${templateNumber}`);

  const templateId = result.lastInsertRowid;

  // Add exercises if provided
  if (exercises && exercises.length > 0) {
    const insertEx = db.prepare(`
      INSERT INTO session_template_exercises (template_id, exercise_id, exercise_version, trial_count, difficulty_level, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const ex of exercises) {
      insertEx.run(templateId, ex.exercise_id, ex.exercise_version || '1.0.0', ex.trial_count || 10, ex.difficulty_level ?? 1, ex.display_order);
    }
  }

  const template = db.prepare('SELECT * FROM session_templates WHERE id = ?').get(templateId);
  const templateExercises = db.prepare(
    'SELECT * FROM session_template_exercises WHERE template_id = ? ORDER BY display_order'
  ).all(templateId);

  return NextResponse.json({ template: { ...template as object, exercises: templateExercises } });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { id, label, exercises } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Update label if provided
  if (label !== undefined) {
    db.prepare('UPDATE session_templates SET label = ? WHERE id = ?').run(label, id);
  }

  // Replace exercises if provided
  if (exercises) {
    db.prepare('DELETE FROM session_template_exercises WHERE template_id = ?').run(id);

    const insertEx = db.prepare(`
      INSERT INTO session_template_exercises (template_id, exercise_id, exercise_version, trial_count, difficulty_level, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const ex of exercises) {
      insertEx.run(id, ex.exercise_id, ex.exercise_version || '1.0.0', ex.trial_count || 10, ex.difficulty_level ?? 1, ex.display_order);
    }
  }

  const template = db.prepare('SELECT * FROM session_templates WHERE id = ?').get(id);
  const templateExercises = db.prepare(
    'SELECT * FROM session_template_exercises WHERE template_id = ? ORDER BY display_order'
  ).all(id);

  return NextResponse.json({ template: { ...template as object, exercises: templateExercises } });
}

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

  // Get the template to find study_id
  const template = db.prepare('SELECT * FROM session_templates WHERE id = ?').get(id) as {
    id: number; study_id: number; template_number: number;
  } | undefined;

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Don't allow deleting the last template
  const count = db.prepare(
    'SELECT COUNT(*) as count FROM session_templates WHERE study_id = ?'
  ).get(template.study_id) as { count: number };

  if (count.count <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last template' }, { status: 400 });
  }

  db.prepare('DELETE FROM session_templates WHERE id = ?').run(id);

  // Re-number remaining templates
  const remaining = db.prepare(
    'SELECT id FROM session_templates WHERE study_id = ? ORDER BY template_number'
  ).all(template.study_id) as { id: number }[];

  remaining.forEach((t, idx) => {
    db.prepare('UPDATE session_templates SET template_number = ? WHERE id = ?').run(idx + 1, t.id);
  });

  return NextResponse.json({ success: true });
}
