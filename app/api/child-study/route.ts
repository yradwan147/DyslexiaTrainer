import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userId = Number(session.user.id);

  // Find participant record
  const participant = db.prepare(`
    SELECT p.*, s.name as study_name, s.target_sessions, s.sessions_per_day,
           s.sessions_per_week, s.min_days_between_sessions,
           s.session_duration_minutes, s.id as study_id
    FROM participants p
    JOIN studies s ON p.study_id = s.id
    WHERE p.user_id = ?
    LIMIT 1
  `).get(userId) as {
    id: number;
    study_id: number;
    study_name: string;
    target_sessions: number;
    sessions_per_day: number;
    sessions_per_week: number | null;
    min_days_between_sessions: number | null;
    session_duration_minutes: number;
  } | undefined;

  if (!participant) {
    return NextResponse.json({ enrolled: false });
  }

  // Count completed sessions
  const completedCount = db.prepare(
    "SELECT COUNT(*) as count FROM sessions WHERE participant_id = ? AND status = 'completed'"
  ).get(participant.id) as { count: number };

  // Get today's sessions
  const todaySessions = db.prepare(`
    SELECT id, status FROM sessions
    WHERE participant_id = ?
    AND date(started_at) = date('now')
  `).all(participant.id) as { id: number; status: string }[];

  const todayCount = todaySessions.length;
  const sessionsPerDay = participant.sessions_per_day || 1;
  const remainingToday = Math.max(0, sessionsPerDay - todayCount);

  // Calculate weekly remaining
  let remainingThisWeek: number | null = null;
  if (participant.sessions_per_week) {
    const weekCount = db.prepare(`
      SELECT COUNT(*) as count FROM sessions
      WHERE participant_id = ?
      AND started_at >= datetime('now', '-7 days')
    `).get(participant.id) as { count: number };
    remainingThisWeek = Math.max(0, participant.sessions_per_week - weekCount.count);
  }

  // Calculate days until eligible
  let daysUntilEligible = 0;
  if (participant.min_days_between_sessions) {
    const lastSession = db.prepare(`
      SELECT started_at FROM sessions
      WHERE participant_id = ?
      ORDER BY started_at DESC LIMIT 1
    `).get(participant.id) as { started_at: string } | undefined;
    if (lastSession) {
      const daysSince = (Date.now() - new Date(lastSession.started_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < participant.min_days_between_sessions) {
        daysUntilEligible = Math.ceil(participant.min_days_between_sessions - daysSince);
      }
    }
  }

  // Get unique exercise IDs from all session templates
  let studyExercises: string[] = [];
  const templateExercises = db.prepare(`
    SELECT DISTINCT ste.exercise_id
    FROM session_template_exercises ste
    JOIN session_templates st ON ste.template_id = st.id
    WHERE st.study_id = ?
    ORDER BY ste.display_order
  `).all(participant.study_id) as { exercise_id: string }[];

  if (templateExercises.length > 0) {
    studyExercises = templateExercises.map(e => e.exercise_id);
  } else {
    // Fallback to study_exercises
    const fallback = db.prepare(
      'SELECT DISTINCT exercise_id FROM study_exercises WHERE study_id = ? ORDER BY display_order'
    ).all(participant.study_id) as { exercise_id: string }[];
    studyExercises = fallback.map(e => e.exercise_id);
  }

  return NextResponse.json({
    enrolled: true,
    study: {
      id: participant.study_id,
      name: participant.study_name,
      target_sessions: participant.target_sessions,
      sessions_per_day: sessionsPerDay,
      sessions_per_week: participant.sessions_per_week,
      min_days_between_sessions: participant.min_days_between_sessions,
    },
    completed_sessions: completedCount.count,
    today_sessions: todaySessions,
    remaining_today: remainingToday,
    remaining_this_week: remainingThisWeek,
    days_until_eligible: daysUntilEligible,
    study_exercises: studyExercises,
  });
}
