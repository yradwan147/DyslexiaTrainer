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
  const type = searchParams.get('type') || 'sessions';
  const studyId = searchParams.get('studyId');
  const format = searchParams.get('format') || 'json';

  let data: Record<string, unknown>[] = [];

  if (type === 'sessions') {
    let query = `
      SELECT 
        s.id as session_id,
        s.session_number,
        s.started_at,
        s.ended_at,
        s.status,
        s.device_info,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM sessions s
      JOIN participants p ON s.participant_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN studies st ON p.study_id = st.id
    `;

    if (studyId) {
      query += ` WHERE st.id = ?`;
      data = db.prepare(query + ' ORDER BY s.started_at DESC').all(studyId) as Record<string, unknown>[];
    } else {
      data = db.prepare(query + ' ORDER BY s.started_at DESC').all() as Record<string, unknown>[];
    }
  } else if (type === 'trials') {
    let query = `
      SELECT 
        t.id as trial_id,
        t.trial_index,
        t.trial_config,
        t.correct_answer,
        t.user_response,
        t.response_time_ms,
        t.is_correct,
        t.is_timed_out,
        t.is_skipped,
        t.started_at as trial_started_at,
        t.responded_at,
        er.exercise_id,
        er.exercise_version,
        er.difficulty_level,
        s.id as session_id,
        s.session_number,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM trials t
      JOIN exercise_runs er ON t.exercise_run_id = er.id
      JOIN sessions s ON er.session_id = s.id
      JOIN participants p ON s.participant_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN studies st ON p.study_id = st.id
    `;

    if (studyId) {
      query += ` WHERE st.id = ?`;
      data = db.prepare(query + ' ORDER BY t.started_at DESC').all(studyId) as Record<string, unknown>[];
    } else {
      data = db.prepare(query + ' ORDER BY t.started_at DESC').all() as Record<string, unknown>[];
    }
  } else if (type === 'exercise_runs') {
    let query = `
      SELECT 
        er.id as exercise_run_id,
        er.exercise_id,
        er.exercise_version,
        er.difficulty_level,
        er.started_at as exercise_started_at,
        er.ended_at as exercise_ended_at,
        er.total_trials,
        er.correct_count,
        er.avg_reaction_time_ms,
        s.id as session_id,
        s.session_number,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM exercise_runs er
      JOIN sessions s ON er.session_id = s.id
      JOIN participants p ON s.participant_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN studies st ON p.study_id = st.id
    `;

    if (studyId) {
      query += ` WHERE st.id = ?`;
      data = db.prepare(query + ' ORDER BY er.started_at DESC').all(studyId) as Record<string, unknown>[];
    } else {
      data = db.prepare(query + ' ORDER BY er.started_at DESC').all() as Record<string, unknown>[];
    }
  }

  if (format === 'csv') {
    if (data.length === 0) {
      return new NextResponse('No data', { 
        status: 200,
        headers: { 'Content-Type': 'text/csv' }
      });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val);
        }).join(',')
      )
    ];

    return new NextResponse(csvRows.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ data });
}

