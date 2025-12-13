'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Exercise {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ALL_EXERCISES: Exercise[] = [
  {
    id: 'coherent_motion',
    name: 'Motion Detection',
    description: 'Find where dots move together',
    icon: '🌊',
    color: 'bg-blue-500',
  },
  {
    id: 'visual_search',
    name: 'Visual Search',
    description: 'Find the odd one out',
    icon: '🔍',
    color: 'bg-purple-500',
  },
  {
    id: 'line_tracking',
    name: 'Line Tracking',
    description: 'Follow the path with your eyes',
    icon: '〰️',
    color: 'bg-green-500',
  },
  {
    id: 'maze_tracking',
    name: 'Maze Tracking',
    description: 'Navigate through the maze',
    icon: '🧩',
    color: 'bg-yellow-500',
  },
  {
    id: 'dynamic_football',
    name: 'Football',
    description: 'Track the moving ball',
    icon: '⚽',
    color: 'bg-emerald-500',
  },
  {
    id: 'dynamic_tennis',
    name: 'Tennis',
    description: 'Follow the bouncing ball',
    icon: '🎾',
    color: 'bg-lime-500',
  },
  {
    id: 'dynamic_circles',
    name: 'Two Circles',
    description: 'Track overlapping circles',
    icon: '⭕',
    color: 'bg-cyan-500',
  },
  {
    id: 'visual_saccades',
    name: 'Saccades',
    description: 'Quick eye movements',
    icon: '👀',
    color: 'bg-indigo-500',
  },
  {
    id: 'visual_memory',
    name: 'Visual Memory',
    description: 'Remember what you saw',
    icon: '🧠',
    color: 'bg-pink-500',
  },
  {
    id: 'pair_search',
    name: 'Pair Search',
    description: 'Find matching pairs',
    icon: '🃏',
    color: 'bg-orange-500',
  },
];

interface Stats {
  totalExercises: number;
  totalCorrect: number;
  totalTrials: number;
}

export default function ChildDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalExercises: 0, totalCorrect: 0, totalTrials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="text-center py-8">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-child-xl font-bold text-slate-800 mb-2">
          Welcome Back!
        </h1>
        <p className="text-child-base text-slate-600">
          Choose an exercise to start training
        </p>
      </Card>

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
          🎮 Choose Your Exercise
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ALL_EXERCISES.map((exercise) => (
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
