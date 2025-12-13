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
      SELECT p.*, s.target_sessions FROM participants p
      JOIN users u ON p.user_id = u.id
      JOIN studies s ON p.study_id = s.id
      WHERE u.id = ?
    `).get(session.user.id) as { id: number; target_sessions: number } | undefined;

    if (!participant) {
      return NextResponse.json({ error: 'Not enrolled in any study' }, { status: 400 });
    }

    // Check existing sessions
    const existingSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE participant_id = ?
    `).get(participant.id) as { count: number };

    const sessionNumber = existingSessions.count + 1;

    // Check if already has session today
    const todaySession = db.prepare(`
      SELECT id FROM sessions 
      WHERE participant_id = ? 
      AND date(started_at) = date('now')
      AND status IN ('in_progress', 'completed')
    `).get(participant.id);

    if (todaySession) {
      return NextResponse.json({ error: 'Already completed session today' }, { status: 400 });
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

