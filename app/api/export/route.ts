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
  const type = searchParams.get('type') || 'exercise_runs';
  const studyId = searchParams.get('studyId');
  const format = searchParams.get('format') || 'json';

  // For xlsx, generate a multi-sheet workbook
  if (format === 'xlsx') {
    return generateExcelExport(db, studyId);
  }

  let data: Record<string, unknown>[] = [];

  if (type === 'sessions') {
    const query = `
      SELECT
        s.id as session_id,
        s.session_number,
        s.started_at,
        s.ended_at,
        s.status,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM sessions s
      JOIN participants p ON s.participant_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN studies st ON p.study_id = st.id
      ${studyId ? 'WHERE st.id = ?' : ''}
      ORDER BY s.started_at DESC
    `;
    data = studyId
      ? db.prepare(query).all(studyId) as Record<string, unknown>[]
      : db.prepare(query).all() as Record<string, unknown>[];

  } else if (type === 'trials') {
    // Use LEFT JOIN on sessions since session_id may be null
    const query = `
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
        er.session_id,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM trials t
      JOIN exercise_runs er ON t.exercise_run_id = er.id
      JOIN users u ON er.user_id = u.id
      LEFT JOIN participants p ON p.user_id = u.id
      LEFT JOIN studies st ON p.study_id = st.id
      ${studyId ? 'WHERE st.id = ?' : ''}
      ORDER BY t.started_at DESC
    `;
    data = studyId
      ? db.prepare(query).all(studyId) as Record<string, unknown>[]
      : db.prepare(query).all() as Record<string, unknown>[];

  } else if (type === 'exercise_runs') {
    const query = `
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
        er.session_id,
        u.child_code,
        p.group_name,
        st.name as study_name,
        st.id as study_id
      FROM exercise_runs er
      JOIN users u ON er.user_id = u.id
      LEFT JOIN participants p ON p.user_id = u.id
      LEFT JOIN studies st ON p.study_id = st.id
      ${studyId ? 'WHERE st.id = ?' : ''}
      ORDER BY er.started_at DESC
    `;
    data = studyId
      ? db.prepare(query).all(studyId) as Record<string, unknown>[]
      : db.prepare(query).all() as Record<string, unknown>[];

  } else if (type === 'metrics') {
    const query = `
      SELECT
        erm.exercise_run_id,
        erm.metric_key,
        erm.metric_value,
        er.exercise_id,
        er.difficulty_level,
        u.child_code
      FROM exercise_run_metrics erm
      JOIN exercise_runs er ON erm.exercise_run_id = er.id
      JOIN users u ON er.user_id = u.id
      LEFT JOIN participants p ON p.user_id = u.id
      LEFT JOIN studies st ON p.study_id = st.id
      ${studyId ? 'WHERE st.id = ?' : ''}
      ORDER BY erm.exercise_run_id, erm.metric_key
    `;
    data = studyId
      ? db.prepare(query).all(studyId) as Record<string, unknown>[]
      : db.prepare(query).all() as Record<string, unknown>[];
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

async function generateExcelExport(db: ReturnType<typeof getDb>, studyId: string | null) {
  // Dynamic import to avoid bundling issues
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const whereClause = studyId ? 'WHERE st.id = ?' : '';
  const params = studyId ? [studyId] : [];

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  const summary = db.prepare(`
    SELECT
      u.child_code,
      u.first_name,
      p.group_name,
      st.name as study_name,
      COUNT(DISTINCT er.id) as total_runs,
      COUNT(DISTINCT er.exercise_id) as exercises_attempted,
      ROUND(AVG(er.avg_reaction_time_ms), 1) as avg_reaction_time_ms,
      ROUND(AVG(CASE WHEN er.total_trials > 0 THEN CAST(er.correct_count AS REAL) / er.total_trials * 100 END), 1) as avg_accuracy_pct
    FROM users u
    LEFT JOIN participants p ON p.user_id = u.id
    LEFT JOIN studies st ON p.study_id = st.id
    LEFT JOIN exercise_runs er ON er.user_id = u.id
    ${whereClause ? whereClause.replace('st.id', 'st.id') : ''}
    WHERE u.role = 'child'
    GROUP BY u.id
    ORDER BY u.child_code
  `.replace(whereClause ? '' : 'placeholder', '')).all(...params) as Record<string, unknown>[];

  if (summary.length > 0) {
    summarySheet.columns = Object.keys(summary[0]).map(key => ({
      header: key,
      key,
      width: 20,
    }));
    summary.forEach(row => summarySheet.addRow(row));
    styleHeaderRow(summarySheet);
  }

  // Sheet 2: Exercise Runs
  const runsSheet = workbook.addWorksheet('Exercise Runs');
  const runs = db.prepare(`
    SELECT
      er.id as run_id,
      u.child_code,
      er.exercise_id,
      er.difficulty_level,
      er.started_at,
      er.ended_at,
      er.total_trials,
      er.correct_count,
      er.avg_reaction_time_ms,
      er.session_id,
      p.group_name,
      st.name as study_name
    FROM exercise_runs er
    JOIN users u ON er.user_id = u.id
    LEFT JOIN participants p ON p.user_id = u.id
    LEFT JOIN studies st ON p.study_id = st.id
    ${studyId ? 'WHERE st.id = ?' : ''}
    ORDER BY er.started_at DESC
  `).all(...params) as Record<string, unknown>[];

  if (runs.length > 0) {
    runsSheet.columns = Object.keys(runs[0]).map(key => ({
      header: key,
      key,
      width: 18,
    }));
    runs.forEach(row => runsSheet.addRow(row));
    styleHeaderRow(runsSheet);
  }

  // Sheet 3: Trials
  const trialsSheet = workbook.addWorksheet('Trials');
  const trials = db.prepare(`
    SELECT
      t.id as trial_id,
      t.exercise_run_id,
      u.child_code,
      er.exercise_id,
      er.difficulty_level,
      t.trial_index,
      t.user_response,
      t.response_time_ms,
      t.is_correct,
      t.is_timed_out,
      t.is_skipped,
      t.started_at,
      t.responded_at
    FROM trials t
    JOIN exercise_runs er ON t.exercise_run_id = er.id
    JOIN users u ON er.user_id = u.id
    LEFT JOIN participants p ON p.user_id = u.id
    LEFT JOIN studies st ON p.study_id = st.id
    ${studyId ? 'WHERE st.id = ?' : ''}
    ORDER BY t.started_at DESC
  `).all(...params) as Record<string, unknown>[];

  if (trials.length > 0) {
    trialsSheet.columns = Object.keys(trials[0]).map(key => ({
      header: key,
      key,
      width: 18,
    }));
    trials.forEach(row => trialsSheet.addRow(row));
    styleHeaderRow(trialsSheet);
  }

  // Sheet 4: Metrics
  const metricsSheet = workbook.addWorksheet('Metrics');
  const metrics = db.prepare(`
    SELECT
      erm.exercise_run_id,
      u.child_code,
      er.exercise_id,
      er.difficulty_level,
      erm.metric_key,
      erm.metric_value
    FROM exercise_run_metrics erm
    JOIN exercise_runs er ON erm.exercise_run_id = er.id
    JOIN users u ON er.user_id = u.id
    LEFT JOIN participants p ON p.user_id = u.id
    LEFT JOIN studies st ON p.study_id = st.id
    ${studyId ? 'WHERE st.id = ?' : ''}
    ORDER BY erm.exercise_run_id, erm.metric_key
  `).all(...params) as Record<string, unknown>[];

  if (metrics.length > 0) {
    metricsSheet.columns = Object.keys(metrics[0]).map(key => ({
      header: key,
      key,
      width: 18,
    }));
    metrics.forEach(row => metricsSheet.addRow(row));
    styleHeaderRow(metricsSheet);
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="dyslexia_trainer_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}

function styleHeaderRow(sheet: import('exceljs').Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' },
  };
}
