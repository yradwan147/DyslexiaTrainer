'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Stats {
  totalStudies: number;
  totalParticipants: number;
  totalExerciseRuns: number;
  totalTrials: number;
  avgAccuracy: number;
}

interface RecentActivity {
  id: number;
  child_code: string;
  first_name: string;
  exercise_id: string;
  difficulty_level: number;
  correct_count: number;
  total_trials: number;
  started_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudies: 0,
    totalParticipants: 0,
    totalExerciseRuns: 0,
    totalTrials: 0,
    avgAccuracy: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studiesRes, participantsRes, analyticsRes] = await Promise.all([
        fetch('/api/studies'),
        fetch('/api/participants'),
        fetch('/api/analytics'),
      ]);

      const [studiesData, participantsData, analyticsData] = await Promise.all([
        studiesRes.json(),
        participantsRes.json(),
        analyticsRes.json(),
      ]);

      setStats({
        totalStudies: studiesData.studies?.length || 0,
        totalParticipants: participantsData.participants?.length || 0,
        totalExerciseRuns: analyticsData.totalExerciseRuns || 0,
        totalTrials: analyticsData.totalTrials || 0,
        avgAccuracy: analyticsData.avgAccuracy || 0,
      });

      setRecentActivity(analyticsData.recentActivity || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExerciseName = (id: string) => {
    const names: Record<string, string> = {
      coherent_motion: 'Motion Detection',
      visual_search: 'Visual Search',
      line_tracking: 'Line Tracking',
      maze_tracking: 'Maze Tracking',
      dynamic_football: 'Football',
      dynamic_tennis: 'Tennis',
      visual_saccades: 'Saccades',
      visual_memory: 'Visual Memory',
      pair_search: 'Pair Search',
    };
    return names[id] || id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of training activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold">{stats.totalStudies}</div>
          <div className="text-primary-100">Studies</div>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold">{stats.totalParticipants}</div>
          <div className="text-success-100">Participants</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-4xl mb-2">🎮</div>
          <div className="text-3xl font-bold">{stats.totalExerciseRuns}</div>
          <div className="text-purple-100">Exercises Done</div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-3xl font-bold">{stats.totalTrials}</div>
          <div className="text-orange-100">Total Trials</div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold">{stats.avgAccuracy}%</div>
          <div className="text-cyan-100">Avg Accuracy</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
        
        {recentActivity.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No activity yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Exercise</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Difficulty</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => {
                  const accuracy = activity.total_trials > 0 
                    ? Math.round((activity.correct_count / activity.total_trials) * 100) 
                    : 0;
                  return (
                    <tr key={activity.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{activity.first_name || activity.child_code}</div>
                        <div className="text-sm text-slate-500">{activity.child_code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{getExerciseName(activity.exercise_id)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-sm">
                          Level {activity.difficulty_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          accuracy >= 80 
                            ? 'bg-success-100 text-success-600'
                            : accuracy >= 60
                            ? 'bg-warning-100 text-warning-600'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {activity.correct_count}/{activity.total_trials} ({accuracy}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {activity.started_at ? new Date(activity.started_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/participants"
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span>Add Participant</span>
          </a>
          <a 
            href="/admin/studies"
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <span>Manage Studies</span>
          </a>
          <a 
            href="/admin/export"
            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl">📊</span>
            <span>Export Data</span>
          </a>
        </div>
      </Card>
    </div>
  );
}
