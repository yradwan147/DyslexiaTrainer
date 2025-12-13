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

    const db = getDb();
    const userId = session.user.id;

    // Get stats for the current user
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalExercises,
        COALESCE(SUM(correct_count), 0) as totalCorrect,
        COALESCE(SUM(total_trials), 0) as totalTrials
      FROM exercise_runs
      WHERE user_id = ? AND ended_at IS NOT NULL
    `).get(userId) as { totalExercises: number; totalCorrect: number; totalTrials: number };

    return NextResponse.json({
      totalExercises: stats?.totalExercises || 0,
      totalCorrect: stats?.totalCorrect || 0,
      totalTrials: stats?.totalTrials || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
