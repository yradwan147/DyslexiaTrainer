'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';
import { getExerciseConfig } from '@/lib/exercises/configGenerator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/Feedback';
import type { ExerciseConfig, TrialResult } from '@/lib/exercises/types';

interface StudyExercise {
  id: number;
  exercise_id: string;
  exercise_version: string;
  difficulty_level: number;
  trial_count: number;
  display_order: number;
}

interface ExerciseRunData {
  id: number;
  exercise_id: string;
  correct_count?: number;
}

type SessionPhase = 'loading' | 'intro' | 'exercise' | 'transition' | 'complete';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.sessionId);

  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [exercises, setExercises] = useState<StudyExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseRuns, setExerciseRuns] = useState<ExerciseRunData[]>([]);
  const [currentExerciseRunId, setCurrentExerciseRunId] = useState<number | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ExerciseConfig | null>(null);
  const [sessionStats, setSessionStats] = useState({ totalCorrect: 0, totalTrials: 0 });

  // Fetch session exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // Get study exercises for this session
        const res = await fetch(`/api/sessions?sessionId=${sessionId}`);
        const data = await res.json();
        
        // For now, use default exercises - in full implementation, get from study config
        const defaultExercises: StudyExercise[] = [
          { id: 1, exercise_id: 'coherent_motion', exercise_version: '1.0.0', difficulty_level: 1, trial_count: 5, display_order: 1 },
          { id: 2, exercise_id: 'visual_search', exercise_version: '1.0.0', difficulty_level: 1, trial_count: 5, display_order: 2 },
          { id: 3, exercise_id: 'visual_memory', exercise_version: '1.0.0', difficulty_level: 1, trial_count: 3, display_order: 3 },
          { id: 4, exercise_id: 'pair_search', exercise_version: '1.0.0', difficulty_level: 1, trial_count: 1, display_order: 4 },
        ];

        setExercises(defaultExercises);
        setPhase('intro');
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, [sessionId]);

  // Start an exercise
  const startExercise = useCallback(async (exercise: StudyExercise) => {
    try {
      // Create exercise run record
      const res = await fetch('/api/exercise-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: exercise.exercise_id,
          exercise_version: exercise.exercise_version,
          difficulty_level: exercise.difficulty_level,
          display_order: exercise.display_order,
          total_trials: exercise.trial_count,
        }),
      });

      const data = await res.json();
      setCurrentExerciseRunId(data.exerciseRun.id);

      // Generate exercise config
      const config = getExerciseConfig(
        exercise.exercise_id,
        exercise.difficulty_level,
        exercise.trial_count
      );
      setCurrentConfig(config);
      setPhase('exercise');
    } catch (error) {
      console.error('Error starting exercise:', error);
    }
  }, [sessionId]);

  // Handle exercise completion
  const handleExerciseComplete = useCallback(async (results: TrialResult[]) => {
    const correctCount = results.filter(r => r.is_correct).length;
    const avgReactionTime = results.length > 0
      ? results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length
      : 0;

    // Update exercise run with results
    if (currentExerciseRunId) {
      await fetch('/api/exercise-runs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseRunId: currentExerciseRunId,
          correct_count: correctCount,
          avg_reaction_time_ms: avgReactionTime,
        }),
      });

      setExerciseRuns(prev => [...prev, {
        id: currentExerciseRunId,
        exercise_id: exercises[currentExerciseIndex].exercise_id,
        correct_count: correctCount,
      }]);
    }

    setSessionStats(prev => ({
      totalCorrect: prev.totalCorrect + correctCount,
      totalTrials: prev.totalTrials + results.length,
    }));

    // Check if more exercises
    if (currentExerciseIndex + 1 < exercises.length) {
      setPhase('transition');
    } else {
      // Complete session
      await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'completed',
        }),
      });
      setPhase('complete');
    }
  }, [currentExerciseRunId, currentExerciseIndex, exercises, sessionId]);

  // Handle transition to next exercise
  const handleNextExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => prev + 1);
    setCurrentConfig(null);
    setCurrentExerciseRunId(null);
  }, []);

  // Start next exercise when index changes
  useEffect(() => {
    if (phase === 'transition' || (phase === 'intro' && currentExerciseIndex > 0)) {
      const nextExercise = exercises[currentExerciseIndex];
      if (nextExercise) {
        startExercise(nextExercise);
      }
    }
  }, [currentExerciseIndex, exercises, phase, startExercise]);

  // Handle exit
  const handleExit = async () => {
    await fetch('/api/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        status: 'incomplete',
      }),
    });
    router.push('/dashboard');
  };

  // Loading
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl text-slate-600">Preparing your session...</p>
        </div>
      </div>
    );
  }

  // Intro
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <Card className="max-w-lg text-center py-12">
          <div className="text-8xl mb-6">🎮</div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            Ready to Start?
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            You have {exercises.length} exercises to complete today.
          </p>
          <p className="text-slate-500 mb-8">
            Take your time and do your best!
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => startExercise(exercises[0])}
              size="xl"
            >
              Let&apos;s Go!
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exercise
  if (phase === 'exercise' && currentConfig && currentExerciseRunId) {
    return (
      <ExerciseRunner
        config={currentConfig}
        exerciseRunId={currentExerciseRunId}
        onComplete={handleExerciseComplete}
        onExit={handleExit}
      />
    );
  }

  // Transition between exercises
  if (phase === 'transition') {
    const nextExercise = exercises[currentExerciseIndex + 1];
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-success-50 to-success-100">
        <Card className="max-w-lg text-center py-12">
          <div className="text-8xl mb-6">🌟</div>
          <h1 className="text-child-xl font-bold text-slate-800 mb-4">
            Great Job!
          </h1>
          <p className="text-slate-600 mb-2">
            {currentExerciseIndex + 1} of {exercises.length} exercises done
          </p>
          <p className="text-child-base text-slate-700 mb-8">
            Next up: {nextExercise?.exercise_id.replace(/_/g, ' ')}
          </p>
          <Button
            onClick={handleNextExercise}
            size="xl"
            variant="success"
          >
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  // Session Complete
  if (phase === 'complete') {
    const percentage = sessionStats.totalTrials > 0
      ? Math.round((sessionStats.totalCorrect / sessionStats.totalTrials) * 100)
      : 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-warning-50 to-warning-100">
        <Card className="max-w-lg text-center py-12">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            Session Complete!
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            You completed all {exercises.length} exercises!
          </p>
          <p className="text-slate-700 mb-4">
            Score: {sessionStats.totalCorrect} / {sessionStats.totalTrials} ({percentage}%)
          </p>
          <div className="mb-8">
            <StarRating score={sessionStats.totalCorrect} maxScore={sessionStats.totalTrials} />
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            size="xl"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}

