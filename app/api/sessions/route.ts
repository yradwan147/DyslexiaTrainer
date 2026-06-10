import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get('participantId');
  const sessionIdParam = searchParams.get('sessionId');

  // When sessionId is passed, return full session data with template exercises
  if (sessionIdParam) {
    const sessionRecord = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionIdParam) as {
      id: number; participant_id: number; session_number: number; status: string;
    } | undefined;

    if (!sessionRecord) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const participant = db.prepare('SELECT * FROM participants WHERE id = ?').get(sessionRecord.participant_id) as {
      id: number; user_id: number; study_id: number;
    } | undefined;

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Count templates for this study
    const templateCount = db.prepare(
      'SELECT COUNT(*) as count FROM session_templates WHERE study_id = ?'
    ).get(participant.study_id) as { count: number };

    let exercises: unknown[] = [];
    let templateLabel: string | null = null;

    if (templateCount.count > 0) {
      // Determine which template to use based on session number cycling
      const templateNumber = ((sessionRecord.session_number - 1) % templateCount.count) + 1;

      const template = db.prepare(
        'SELECT * FROM session_templates WHERE study_id = ? AND template_number = ?'
      ).get(participant.study_id, templateNumber) as { id: number; label: string | null } | undefined;

      if (template) {
        templateLabel = template.label;

        // Get exercises from template
        const templateExercises = db.prepare(
          'SELECT * FROM session_template_exercises WHERE template_id = ? ORDER BY display_order ASC'
        ).all(template.id) as { exercise_id: string; exercise_version: string; trial_count: number; difficulty_level: number; display_order: number }[];

        // Level is the fixed difficulty configured by the researcher on the template.
        exercises = templateExercises.map(te => ({
          exercise_id: te.exercise_id,
          exercise_version: te.exercise_version,
          trial_count: te.trial_count,
          display_order: te.display_order,
          current_level: te.difficulty_level ?? 1,
        }));
      }
    }

    // Fallback to study_exercises if no templates exist
    if (exercises.length === 0) {
      const studyExercises = db.prepare(
        'SELECT * FROM study_exercises WHERE study_id = ? ORDER BY display_order ASC'
      ).all(participant.study_id) as { exercise_id: string; exercise_version: string; difficulty_level: number; trial_count: number; display_order: number }[];

      exercises = studyExercises.map(se => {
        const progress = db.prepare(
          'SELECT current_level FROM exercise_progress WHERE user_id = ? AND study_id = ? AND exercise_id = ?'
        ).get(participant.user_id, participant.study_id, se.exercise_id) as { current_level: number } | undefined;

        return {
          exercise_id: se.exercise_id,
          exercise_version: se.exercise_version,
          trial_count: se.trial_count,
          display_order: se.display_order,
          current_level: progress?.current_level ?? se.difficulty_level,
        };
      });
    }

    return NextResponse.json({
      session: {
        id: sessionRecord.id,
        session_number: sessionRecord.session_number,
        status: sessionRecord.status,
      },
      exercises,
      template_label: templateLabel,
    });
  }

  if (session.user.role === 'child') {
    // Get sessions for the logged-in child
    const participant = db.prepare(`
      SELECT p.* FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE u.id = ?
    `).get(session.user.id);

    if (!participant) {
      return NextResponse.json({ sessions: [] });
    }

    const sessions = db.prepare(`
      SELECT * FROM sessions
      WHERE participant_id = ?
      ORDER BY session_number ASC
    `).all((participant as { id: number }).id);

    return NextResponse.json({ sessions });
  }

  // Researcher view
  if (participantId) {
    const sessions = db.prepare(`
      SELECT * FROM sessions
      WHERE participant_id = ?
      ORDER BY session_number ASC
    `).all(participantId);
    return NextResponse.json({ sessions });
  }

  // Get all sessions
  const sessions = db.prepare(`
    SELECT s.*, u.child_code, st.name as study_name
    FROM sessions s
    JOIN participants p ON s.participant_id = p.id
    JOIN users u ON p.user_id = u.id
    JOIN studies st ON p.study_id = st.id
    ORDER BY s.created_at DESC
    LIMIT 100
  `).all();

  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();

  if (session.user.role === 'child') {
    // Create new session for the child
    const participant = db.prepare(`
      SELECT p.*, s.target_sessions, s.sessions_per_day, s.sessions_per_week, s.min_days_between_sessions FROM participants p
      JOIN users u ON p.user_id = u.id
      JOIN studies s ON p.study_id = s.id
      WHERE u.id = ?
    `).get(session.user.id) as { id: number; target_sessions: number; sessions_per_day: number; sessions_per_week: number | null; min_days_between_sessions: number | null } | undefined;

    if (!participant) {
      return NextResponse.json({ error: 'Not enrolled in any study' }, { status: 400 });
    }

    // Check existing sessions
    const existingSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE participant_id = ?
    `).get(participant.id) as { count: number };

    const sessionNumber = existingSessions.count + 1;

    // Check daily limit using sessions_per_day
    const sessionsPerDay = participant.sessions_per_day || 1;
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE participant_id = ?
      AND date(started_at) = date('now')
    `).get(participant.id) as { count: number };

    if (todayCount.count >= sessionsPerDay) {
      return NextResponse.json({ error: 'Daily session limit reached' }, { status: 400 });
    }

    // Check weekly limit
    if (participant.sessions_per_week) {
      const weekCount = db.prepare(`
        SELECT COUNT(*) as count FROM sessions
        WHERE participant_id = ?
        AND started_at >= datetime('now', '-7 days')
      `).get(participant.id) as { count: number };
      if (weekCount.count >= participant.sessions_per_week) {
        return NextResponse.json({ error: 'Weekly session limit reached' }, { status: 400 });
      }
    }

    // Check min days between sessions
    if (participant.min_days_between_sessions) {
      const lastSession = db.prepare(`
        SELECT started_at FROM sessions
        WHERE participant_id = ?
        ORDER BY started_at DESC LIMIT 1
      `).get(participant.id) as { started_at: string } | undefined;
      if (lastSession) {
        const daysSince = (Date.now() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < participant.min_days_between_sessions) {
          const daysRemaining = Math.ceil(participant.min_days_between_sessions - daysSince);
          return NextResponse.json({
            error: `Must wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''} between sessions`,
            days_remaining: daysRemaining,
          }, { status: 400 });
        }
      }
    }

    // Create session
    const result = db.prepare(`
      INSERT INTO sessions (participant_id, session_number, started_at, status, device_info)
      VALUES (?, ?, datetime('now'), 'in_progress', ?)
    `).run(participant.id, sessionNumber, body.deviceInfo || null);

    const newSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ session: newSession });
  }

  // Researcher creating session
  const { participantId, sessionNumber } = body;
  const result = db.prepare(`
    INSERT INTO sessions (participant_id, session_number, status)
    VALUES (?, ?, 'pending')
  `).run(participantId, sessionNumber);

  const newSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ session: newSession });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { sessionId, status } = body;

  db.prepare(`
    UPDATE sessions 
    SET status = ?, ended_at = CASE WHEN ? IN ('completed', 'incomplete') THEN datetime('now') ELSE ended_at END
    WHERE id = ?
  `).run(status, status, sessionId);

  const updatedSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  return NextResponse.json({ session: updatedSession });
}

