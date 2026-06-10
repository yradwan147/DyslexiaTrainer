'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ExerciseRunner } from '@/components/exercises/ExerciseRunner';
import { getExerciseConfig } from '@/lib/exercises/configGenerator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/Feedback';
import { EXERCISE_NAMES, ExerciseId } from '@/lib/exercises/types';
import type { ExerciseConfig, TrialResult, ExerciseScore } from '@/lib/exercises/types';
import { extractMetrics } from '@/lib/transitions';

interface SessionExercise {
  exercise_id: string;
  exercise_version: string;
  trial_count: number;
  display_order: number;
  current_level: number;
}

interface ExerciseRunData {
  id: number;
  exercise_id: string;
  correct_count?: number;
  total_trials?: number;
}

type SessionPhase = 'loading' | 'intro' | 'exercise' | 'transition' | 'complete';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.sessionId);

  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseRuns, setExerciseRuns] = useState<ExerciseRunData[]>([]);
  const [currentExerciseRunId, setCurrentExerciseRunId] = useState<number | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ExerciseConfig | null>(null);
  const [sessionStats, setSessionStats] = useState({ totalCorrect: 0, totalTrials: 0 });
  const [templateLabel, setTemplateLabel] = useState<string | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number>(0);

  // Fetch session exercises from API
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`/api/sessions?sessionId=${sessionId}`);
        const data = await res.json();

        if (data.exercises && data.exercises.length > 0) {
          setExercises(data.exercises);
        }
        if (data.template_label) {
          setTemplateLabel(data.template_label);
        }
        if (data.session) {
          setSessionNumber(data.session.session_number);
        }
        setPhase('intro');
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, [sessionId]);

  const getExerciseName = (exerciseId: string): string => {
    return EXERCISE_NAMES[exerciseId as ExerciseId] || exerciseId.replace(/_/g, ' ');
  };

  // Start an exercise
  const startExercise = useCallback(async (exercise: SessionExercise) => {
    try {
      // Create exercise run record
      const res = await fetch('/api/exercise-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          exercise_id: exercise.exercise_id,
          exercise_version: exercise.exercise_version,
          difficulty_level: exercise.current_level,
          display_order: exercise.display_order,
          total_trials: exercise.trial_count,
        }),
      });

      const data = await res.json();
      setCurrentExerciseRunId(data.exerciseRun.id);

      // Generate exercise config using current_level from server
      const config = getExerciseConfig(
        exercise.exercise_id,
        exercise.current_level,
        exercise.trial_count
      );

      // For saccades, set training_run_index
      if (exercise.exercise_id === 'visual_saccades') {
        config.training_run_index = exercise.current_level;
      }

      setCurrentConfig(config);
      setPhase('exercise');
    } catch (error) {
      console.error('Error starting exercise:', error);
    }
  }, [sessionId]);

  // Handle exercise completion
  const handleExerciseComplete = useCallback(async (results: TrialResult[], score?: ExerciseScore) => {
    const currentExercise = exercises[currentExerciseIndex];
    // Prefer the exercise's real aggregate score (correct sub-tasks / total sub-tasks);
    // fall back to per-trial results for exercises that report them (e.g. coherent_motion).
    const correctCount = score ? score.correct_count : results.filter(r => r.is_correct).length;
    const totalTrials = score ? score.total_trials : results.length;
    const avgReactionTime = results.length > 0
      ? results.reduce((sum, r) => sum + r.response_time_ms, 0) / results.length
      : 0;
    // Extract exercise-specific metrics from the last result's payload for research data.
    const lastResponse = results.length > 0 ? results[results.length - 1].user_response : '';
    const metrics = extractMetrics(currentExercise.exercise_id, lastResponse, avgReactionTime);

    // Update exercise run with results (non-critical)
    try {
      if (currentExerciseRunId) {
        await fetch('/api/exercise-runs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseRunId: currentExerciseRunId,
            correct_count: correctCount,
            total_trials: totalTrials,
            avg_reaction_time_ms: avgReactionTime,
            metrics,
          }),
        });

        setExerciseRuns(prev => [...prev, {
          id: currentExerciseRunId,
          exercise_id: currentExercise.exercise_id,
          correct_count: correctCount,
          total_trials: totalTrials,
        }]);
      }
    } catch {
      // Non-critical, continue to next exercise
    }

    // Record session-completion tracking (non-critical). Difficulty level is
    // researcher-set and fixed, so this no longer changes the level.
    try {
      await fetch('/api/exercise-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: currentExercise.exercise_id,
          correct_count: correctCount,
          total_trials: totalTrials,
        }),
      });
    } catch {
      // Non-critical, continue
    }

    setSessionStats(prev => ({
      totalCorrect: prev.totalCorrect + correctCount,
      totalTrials: prev.totalTrials + totalTrials,
    }));

    // Check if more exercises
    if (currentExerciseIndex + 1 < exercises.length) {
      setPhase('transition');
    } else {
      // Complete session
      try {
        await fetch('/api/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            status: 'completed',
          }),
        });
      } catch {
        // Non-critical
      }
      setPhase('complete');
    }
  }, [currentExerciseRunId, currentExerciseIndex, exercises, sessionId]);

  // Handle transition to next exercise
  const handleNextExercise = useCallback(() => {
    const nextIndex = currentExerciseIndex + 1;
    setCurrentExerciseIndex(nextIndex);
    setCurrentConfig(null);
    setCurrentExerciseRunId(null);
    startExercise(exercises[nextIndex]);
  }, [currentExerciseIndex, exercises, startExercise]);

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
          {templateLabel && (
            <p className="text-sm text-slate-400 mb-2">{templateLabel}</p>
          )}
          {sessionNumber > 0 && (
            <p className="text-sm text-slate-400 mb-2">Session {sessionNumber}</p>
          )}
          <p className="text-child-base text-slate-600 mb-4">
            You have {exercises.length} exercises to complete.
          </p>
          <p className="text-slate-500 mb-8">
            Take your time and do your best!
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => startExercise(exercises[0])}
              size="xl"
              disabled={exercises.length === 0}
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
            Next up: {nextExercise ? getExerciseName(nextExercise.exercise_id) : ''}
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
