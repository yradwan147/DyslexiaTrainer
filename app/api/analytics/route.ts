import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin/researcher access
    if (session.user.role !== 'admin' && session.user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb();

    // Get overall stats
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as totalExerciseRuns,
        COALESCE(SUM(total_trials), 0) as totalTrials,
        COALESCE(SUM(correct_count), 0) as totalCorrect
      FROM exercise_runs
      WHERE ended_at IS NOT NULL
    `).get() as { totalExerciseRuns: number; totalTrials: number; totalCorrect: number };

    const avgAccuracy = overallStats.totalTrials > 0
      ? Math.round((overallStats.totalCorrect / overallStats.totalTrials) * 100)
      : 0;

    // Get recent activity with user info
    const recentActivity = db.prepare(`
      SELECT 
        er.id,
        u.child_code,
        u.first_name,
        er.exercise_id,
        er.difficulty_level,
        er.correct_count,
        er.total_trials,
        er.started_at
      FROM exercise_runs er
      JOIN users u ON er.user_id = u.id
      WHERE er.ended_at IS NOT NULL
      ORDER BY er.started_at DESC
      LIMIT 20
    `).all();

    return NextResponse.json({
      totalExerciseRuns: overallStats?.totalExerciseRuns || 0,
      totalTrials: overallStats?.totalTrials || 0,
      avgAccuracy,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
