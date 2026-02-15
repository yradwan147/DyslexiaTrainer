'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';
import { getExerciseConfig } from '@/lib/exercises/configGenerator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/Feedback';
import type { ExerciseConfig, TrialResult } from '@/lib/exercises/types';

const EXERCISE_INFO: Record<string, { name: string; description: string; icon: string }> = {
  coherent_motion: { name: 'Coherent Motion Detection', description: 'Find the side where dots are moving together', icon: '🌊' },
  visual_search: { name: 'Visual Search', description: 'Find the odd one out among similar shapes', icon: '🔍' },
  line_tracking: { name: 'Line Tracking', description: 'Follow the path with your eyes', icon: '〰️' },
  maze_tracking: { name: 'Maze Tracking', description: 'Navigate through the maze', icon: '🧩' },
  dynamic_football: { name: 'Football', description: 'Track the moving ball', icon: '⚽' },
  dynamic_tennis: { name: 'Tennis', description: 'Follow the bouncing ball', icon: '🎾' },
  visual_saccades: { name: 'Visual Saccades', description: 'Quick eye movement training', icon: '👀' },
  visual_memory: { name: 'Visual Memory', description: 'Remember what you saw', icon: '🧠' },
  pair_search: { name: 'Pair Search', description: 'Find matching pairs', icon: '🃏' },
};

type Phase = 'intro' | 'exercise' | 'complete';

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();
  
  const exerciseId = params.exerciseId as string;

  const [phase, setPhase] = useState<Phase>('intro');
  const [exerciseRunId, setExerciseRunId] = useState<number | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ExerciseConfig | null>(null);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [difficulty, setDifficulty] = useState(1);

  const exerciseInfo = EXERCISE_INFO[exerciseId] || { 
    name: exerciseId, 
    description: 'Complete the exercise', 
    icon: '🎯' 
  };

  // Start exercise
  const startExercise = useCallback(async () => {
    try {
      const isSaccades = exerciseId === 'visual_saccades';
      const isVisualSearch = exerciseId === 'visual_search';
      const isVisualMemory = exerciseId === 'visual_memory';
      const isMaze = exerciseId === 'maze_tracking';
      const isLineTracking = exerciseId === 'line_tracking';
      const isPairSearch = exerciseId === 'pair_search';

      // Saccades: persist a per-browser 1-15 training run index
      let saccadesTrainingRunIndex: number | undefined;
      if (isSaccades) {
        const completedRaw = localStorage.getItem('saccadesTrainingRun');
        const completed = Math.max(0, Number.parseInt(completedRaw || '0', 10) || 0);
        saccadesTrainingRunIndex = Math.min(15, completed + 1);
      }

      // Visual Search: persist a per-browser 1-15 training level
      let effectiveDifficulty = difficulty;
      if (isVisualSearch) {
        const raw = localStorage.getItem('visualSearchTrainingLevel');
        effectiveDifficulty = Math.max(1, Math.min(15, Number.parseInt(raw || '1', 10) || 1));
      }

      // Visual Memory: persist a per-browser 1-15 session number
      if (isVisualMemory) {
        const raw = localStorage.getItem('visualMemoryTrainingSession');
        effectiveDifficulty = Math.max(1, Math.min(15, Number.parseInt(raw || '1', 10) || 1));
      }

      // Maze Tracking: persist a per-browser 1-15 level
      if (isMaze) {
        const raw = localStorage.getItem('mazeTrainingLevel');
        effectiveDifficulty = Math.max(1, Math.min(15, Number.parseInt(raw || '1', 10) || 1));
      }

      // Line Tracking: persist a per-browser 1-15 level
      if (isLineTracking) {
        const raw = localStorage.getItem('lineTrackingLevel');
        effectiveDifficulty = Math.max(1, Math.min(15, Number.parseInt(raw || '1', 10) || 1));
      }

      // Pair Search: persist a per-browser 1-15 level
      if (isPairSearch) {
        const raw = localStorage.getItem('pairSearchLevel');
        effectiveDifficulty = Math.max(1, Math.min(15, Number.parseInt(raw || '1', 10) || 1));
      }

      const trialCount = isSaccades ? 1 : (isVisualSearch || isVisualMemory || isMaze || isLineTracking || isPairSearch) ? 1 : 10;

      // Create exercise run record
      const res = await fetch('/api/exercise-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exerciseId,
          exercise_version: '1.0.0',
          difficulty_level: effectiveDifficulty,
          total_trials: trialCount,
        }),
      });

      const data = await res.json();
      setExerciseRunId(data.exerciseRun.id);

      // Generate exercise config
      const config = getExerciseConfig(exerciseId, effectiveDifficulty, trialCount);
      if (isSaccades && saccadesTrainingRunIndex) {
        config.training_run_index = saccadesTrainingRunIndex;
      }
      setCurrentConfig(config);
      setPhase('exercise');
    } catch (error) {
      console.error('Error starting exercise:', error);
      alert('Failed to start exercise');
    }
  }, [exerciseId, difficulty]);

  // Handle exercise completion
  const handleExerciseComplete = useCallback(async (trialResults: TrialResult[]) => {
    const correctCount = trialResults.filter(r => r.is_correct).length;
    const avgReactionTime = trialResults.length > 0
      ? trialResults.reduce((sum, r) => sum + r.response_time_ms, 0) / trialResults.length
      : 0;

    // Update exercise run with results
    if (exerciseRunId) {
      await fetch('/api/exercise-runs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseRunId,
          correct_count: correctCount,
          avg_reaction_time_ms: avgReactionTime,
        }),
      });
    }

    setResults({ correct: correctCount, total: trialResults.length });
    setPhase('complete');

    // After completion, advance the Saccades training run counter (up to 15).
    if (exerciseId === 'visual_saccades') {
      const completedRaw = localStorage.getItem('saccadesTrainingRun');
      const completed = Math.max(0, Number.parseInt(completedRaw || '0', 10) || 0);
      localStorage.setItem('saccadesTrainingRun', String(Math.min(15, completed + 1)));
    }

    // After completion, advance the Visual Search training level (up to 15).
    if (exerciseId === 'visual_search') {
      const raw = localStorage.getItem('visualSearchTrainingLevel');
      const current = Math.max(1, Number.parseInt(raw || '1', 10) || 1);
      localStorage.setItem('visualSearchTrainingLevel', String(Math.min(15, current + 1)));
    }

    // After completion, advance the Visual Memory training session (up to 15).
    if (exerciseId === 'visual_memory') {
      const raw = localStorage.getItem('visualMemoryTrainingSession');
      const current = Math.max(1, Number.parseInt(raw || '1', 10) || 1);
      localStorage.setItem('visualMemoryTrainingSession', String(Math.min(15, current + 1)));
    }

    // After completion, advance the Maze training level (up to 15).
    if (exerciseId === 'maze_tracking') {
      const raw = localStorage.getItem('mazeTrainingLevel');
      const current = Math.max(1, Number.parseInt(raw || '1', 10) || 1);
      localStorage.setItem('mazeTrainingLevel', String(Math.min(15, current + 1)));
    }

    // After completion, advance the Line Tracking level (up to 15).
    if (exerciseId === 'line_tracking') {
      const raw = localStorage.getItem('lineTrackingLevel');
      const current = Math.max(1, Number.parseInt(raw || '1', 10) || 1);
      localStorage.setItem('lineTrackingLevel', String(Math.min(15, current + 1)));
    }

    // After completion, advance the Pair Search level (up to 15).
    if (exerciseId === 'pair_search') {
      const raw = localStorage.getItem('pairSearchLevel');
      const current = Math.max(1, Number.parseInt(raw || '1', 10) || 1);
      localStorage.setItem('pairSearchLevel', String(Math.min(15, current + 1)));
    }
  }, [exerciseRunId, exerciseId]);

  // Handle exit
  const handleExit = () => {
    router.push('/dashboard');
  };

  // Play again
  const playAgain = () => {
    setPhase('intro');
    setExerciseRunId(null);
    setCurrentConfig(null);
    setResults({ correct: 0, total: 0 });
  };

  // Intro
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-lg text-center py-12">
          <div className="text-8xl mb-6">{exerciseInfo.icon}</div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            {exerciseInfo.name}
          </h1>
          <p className="text-child-base text-slate-600 mb-6">
            {exerciseInfo.description}
          </p>
          
          {/* Difficulty selector - hidden for exercises with auto-progression */}
          {!['visual_saccades', 'visual_search', 'visual_memory', 'maze_tracking', 'line_tracking', 'pair_search'].includes(exerciseId) && (
            <div className="mb-8">
              <p className="text-sm text-slate-500 mb-3">Select Difficulty</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`
                      w-12 h-12 rounded-xl font-bold text-lg transition-all
                      ${difficulty === level 
                        ? 'bg-primary-500 text-white shadow-lg scale-110' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : difficulty === 3 ? 'Hard' : difficulty === 4 ? 'Very Hard' : 'Expert'}
              </p>
            </div>
          )}

          <p className="text-slate-500 mb-8">
            {exerciseId === 'visual_saccades' ? '1 training run • Take your time!'
              : exerciseId === 'visual_search' ? '10 puzzles • Find the different one!'
              : exerciseId === 'visual_memory' ? '5 sequences • Remember the order!'
              : exerciseId === 'maze_tracking' ? '1 maze • Collect the treasures in order!'
              : exerciseId === 'line_tracking' ? '1 puzzle • Follow the lines!'
              : exerciseId === 'pair_search' ? '1 puzzle • Find the matching shape!'
              : '10 trials • Take your time!'}
          </p>
          
          <div className="flex flex-col gap-4">
            <Button onClick={startExercise} size="xl">
              Start!
            </Button>
            <Button onClick={handleExit} variant="ghost">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exercise running
  if (phase === 'exercise' && currentConfig && exerciseRunId) {
    return (
      <ExerciseRunner
        config={currentConfig}
        exerciseRunId={exerciseRunId}
        onComplete={handleExerciseComplete}
        onExit={handleExit}
      />
    );
  }

  // Complete
  if (phase === 'complete') {
    const percentage = results.total > 0
      ? Math.round((results.correct / results.total) * 100)
      : 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-warning-50 to-warning-100">
        <Card className="max-w-lg text-center py-12">
          <div className="text-8xl mb-6">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : percentage >= 40 ? '💪' : '🌟'}
          </div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            {percentage >= 80 ? 'Amazing!' : percentage >= 60 ? 'Great Job!' : percentage >= 40 ? 'Good Try!' : 'Keep Practicing!'}
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            You completed {exerciseInfo.name}!
          </p>
          <p className="text-2xl font-bold text-slate-700 mb-4">
            Score: {results.correct} / {results.total} ({percentage}%)
          </p>
          <div className="mb-8">
            <StarRating score={results.correct} maxScore={results.total} />
          </div>
          <div className="flex flex-col gap-4">
            <Button onClick={playAgain} size="xl" variant="success">
              Play Again
            </Button>
            <Button onClick={handleExit} variant="ghost">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
