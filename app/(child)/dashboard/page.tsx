'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Exercise {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ALL_EXERCISES: Exercise[] = [
  { id: 'coherent_motion', name: 'Motion Detection', description: 'Find where dots move together', icon: '🌊', color: 'bg-blue-500' },
  { id: 'visual_search', name: 'Visual Search', description: 'Find the odd one out', icon: '🔍', color: 'bg-purple-500' },
  { id: 'line_tracking', name: 'Line Tracking', description: 'Follow the path with your eyes', icon: '〰️', color: 'bg-green-500' },
  { id: 'maze_tracking', name: 'Maze Tracking', description: 'Navigate through the maze', icon: '🧩', color: 'bg-yellow-500' },
  { id: 'dynamic_football', name: 'Football', description: 'Track the moving ball', icon: '⚽', color: 'bg-emerald-500' },
  { id: 'dynamic_tennis', name: 'Tennis', description: 'Follow the bouncing ball', icon: '🎾', color: 'bg-lime-500' },
  { id: 'visual_saccades', name: 'Saccades', description: 'Quick eye movements', icon: '👀', color: 'bg-indigo-500' },
  { id: 'visual_memory', name: 'Visual Memory', description: 'Remember what you saw', icon: '🧠', color: 'bg-pink-500' },
  { id: 'pair_search', name: 'Pair Search', description: 'Find matching pairs', icon: '🃏', color: 'bg-orange-500' },
];

interface StudyContext {
  enrolled: boolean;
  study?: {
    id: number;
    name: string;
    target_sessions: number;
    sessions_per_day: number;
    sessions_per_week: number | null;
    min_days_between_sessions: number | null;
  };
  completed_sessions?: number;
  today_sessions?: { id: number; status: string }[];
  remaining_today?: number;
  remaining_this_week?: number | null;
  days_until_eligible?: number;
  study_exercises?: string[];
}

interface Stats {
  totalExercises: number;
  totalCorrect: number;
  totalTrials: number;
}

export default function ChildDashboard() {
  const router = useRouter();
  const [studyContext, setStudyContext] = useState<StudyContext | null>(null);
  const [stats, setStats] = useState<Stats>({ totalExercises: 0, totalCorrect: 0, totalTrials: 0 });
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/child-study').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ]).then(([studyData, statsData]) => {
      setStudyContext(studyData);
      setStats(statsData);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startSession = async () => {
    setStartingSession(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceInfo: navigator.userAgent }),
      });
      const data = await res.json();
      if (data.session) {
        router.push(`/session/${data.session.id}`);
      } else {
        alert(data.error || 'Could not start session');
        setStartingSession(false);
      }
    } catch {
      alert('Failed to start session');
      setStartingSession(false);
    }
  };

  const startExercise = (exerciseId: string) => {
    router.push(`/exercise/${exerciseId}`);
  };

  const accuracy = stats.totalTrials > 0
    ? Math.round((stats.totalCorrect / stats.totalTrials) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isEnrolled = studyContext?.enrolled;
  const study = studyContext?.study;
  const completedSessions = studyContext?.completed_sessions ?? 0;
  const remainingToday = studyContext?.remaining_today ?? 0;
  const remainingThisWeek = studyContext?.remaining_this_week;
  const daysUntilEligible = studyContext?.days_until_eligible ?? 0;
  const todaySessions = studyContext?.today_sessions ?? [];
  const todayCompleted = todaySessions.filter(s => s.status === 'completed').length;
  const studyExercises = studyContext?.study_exercises ?? [];
  const sessionsPerDay = study?.sessions_per_day ?? 1;

  // Determine if session can be started (all scheduling constraints must pass)
  const canStartSession = remainingToday > 0
    && (remainingThisWeek === null || remainingThisWeek === undefined || remainingThisWeek > 0)
    && daysUntilEligible === 0;

  // Filter exercises to study exercises if enrolled
  const displayExercises = isEnrolled && studyExercises.length > 0
    ? ALL_EXERCISES.filter(e => studyExercises.includes(e.id))
    : ALL_EXERCISES;

  return (
    <div className="space-y-8">
      {/* Welcome / Study Status Card */}
      {isEnrolled && study ? (
        <Card className="text-center py-8">
          <h1 className="text-child-xl font-bold text-slate-800 mb-2">
            {study.name}
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            Session {completedSessions} of {study.target_sessions}
          </p>
          <div className="max-w-xs mx-auto mb-6">
            <ProgressBar
              value={completedSessions}
              max={study.target_sessions}
              color="primary"
            />
          </div>

          {canStartSession ? (
            <div>
              {sessionsPerDay > 1 && todayCompleted > 0 && (
                <p className="text-slate-500 mb-3">
                  {todayCompleted} of {sessionsPerDay} sessions done today. Start your next one!
                </p>
              )}
              <Button
                onClick={startSession}
                size="xl"
                isLoading={startingSession}
              >
                Start Today&apos;s Session
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              {daysUntilEligible > 0 ? (
                <p className="text-child-base text-blue-600 font-medium">
                  Next session available in {daysUntilEligible} day{daysUntilEligible !== 1 ? 's' : ''}!
                </p>
              ) : remainingThisWeek !== null && remainingThisWeek !== undefined && remainingThisWeek <= 0 ? (
                <p className="text-child-base text-blue-600 font-medium">
                  You&apos;ve completed all sessions for this week! Great work!
                </p>
              ) : (
                <p className="text-child-base text-green-600 font-medium">
                  All done for today! Great work!
                </p>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-8">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-child-xl font-bold text-slate-800 mb-2">
            Welcome Back!
          </h1>
          <p className="text-child-base text-slate-600">
            {isEnrolled === false
              ? "You're not assigned to a study yet. Practice any exercise below!"
              : 'Choose an exercise to start training'}
          </p>
        </Card>
      )}

      {/* Stats Card */}
      {stats.totalExercises > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{stats.totalExercises}</div>
              <div className="text-sm text-slate-600">Exercises Done</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{stats.totalCorrect}</div>
              <div className="text-sm text-slate-600">Correct Answers</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">{accuracy}%</div>
              <div className="text-sm text-slate-600">Accuracy</div>
            </div>
          </div>
        </Card>
      )}

      {/* Exercise Selection */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {isEnrolled ? '🎮 Practice Mode' : '🎮 Choose Your Exercise'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => startExercise(exercise.id)}
              className={`
                relative p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl
                transition-all duration-200 transform hover:scale-105
                active:scale-95
                border-2 border-transparent hover:border-primary-300
                flex flex-col items-center text-center gap-3
              `}
            >
              <div className={`w-16 h-16 ${exercise.color} rounded-2xl flex items-center justify-center text-3xl shadow-md`}>
                {exercise.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{exercise.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{exercise.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
