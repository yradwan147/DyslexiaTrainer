import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('studyId');

  let query = `
    SELECT 
      p.id, p.group_name, p.created_at,
      u.id as user_id, u.child_code, u.first_name, u.age,
      s.id as study_id, s.name as study_name, s.target_sessions,
      (SELECT COUNT(*) FROM sessions WHERE participant_id = p.id AND status = 'completed') as completed_sessions
    FROM participants p
    JOIN users u ON p.user_id = u.id
    JOIN studies s ON p.study_id = s.id
  `;

  if (studyId) {
    query += ` WHERE p.study_id = ?`;
    const participants = db.prepare(query).all(studyId);
    return NextResponse.json({ participants });
  }

  const participants = db.prepare(query + ' ORDER BY p.created_at DESC').all();
  return NextResponse.json({ participants });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const body = await request.json();
  const { child_code, password, first_name, age, study_id, group_name } = body;

  // Check if child_code exists
  const existing = db.prepare('SELECT id FROM users WHERE child_code = ?').get(child_code);
  if (existing) {
    return NextResponse.json({ error: 'Child code already exists' }, { status: 400 });
  }

  // Create user
  const passwordHash = await bcrypt.hash(password, 10);
  const userResult = db.prepare(`
    INSERT INTO users (child_code, password_hash, role, first_name, age)
    VALUES (?, ?, 'child', ?, ?)
  `).run(child_code, passwordHash, first_name || null, age || null);

  // Create participant entry
  const participantResult = db.prepare(`
    INSERT INTO participants (user_id, study_id, group_name)
    VALUES (?, ?, ?)
  `).run(userResult.lastInsertRowid, study_id, group_name || null);

  const participant = db.prepare(`
    SELECT p.*, u.child_code, u.first_name, u.age, s.name as study_name
    FROM participants p
    JOIN users u ON p.user_id = u.id
    JOIN studies s ON p.study_id = s.id
    WHERE p.id = ?
  `).get(participantResult.lastInsertRowid);

  return NextResponse.json({ participant });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'child') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get('id');

  if (!participantId) {
    return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
  }

  // Get user_id before deleting
  const participant = db.prepare('SELECT user_id FROM participants WHERE id = ?').get(participantId) as { user_id: number } | undefined;
  
  if (participant) {
    // Delete participant (cascades to sessions, exercise_runs, trials)
    db.prepare('DELETE FROM participants WHERE id = ?').run(participantId);
    
    // Check if user has other participations
    const otherParticipations = db.prepare('SELECT COUNT(*) as count FROM participants WHERE user_id = ?').get(participant.user_id) as { count: number };
    
    if (otherParticipations.count === 0) {
      // Delete user if no other participations
      db.prepare('DELETE FROM users WHERE id = ?').run(participant.user_id);
    }
  }

  return NextResponse.json({ success: true });
}

