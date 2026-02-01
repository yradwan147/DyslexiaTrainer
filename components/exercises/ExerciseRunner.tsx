'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Feedback } from '@/components/ui/Feedback';
import type { ExerciseConfig, TrialResult } from '@/lib/exercises/types';

// Exercise components
import { CoherentMotion } from './CoherentMotion';
import { VisualSearch } from './VisualSearch';
import { LineTracking } from './LineTracking';
import { MazeTracking } from './MazeTracking';
import { DynamicFootball } from './DynamicFootball';
import { DynamicTennis } from './DynamicTennis';
import { DynamicTwoCircles } from './DynamicTwoCircles';
import { VisualSaccades } from './VisualSaccades';
import { VisualMemory } from './VisualMemory';
import { VisualDiscrimination } from './VisualDiscrimination';
import { PairSearch } from './PairSearch';

interface ExerciseRunnerProps {
  config: ExerciseConfig;
  exerciseRunId: number;
  onComplete: (results: TrialResult[]) => void;
  onExit: () => void;
}

type Phase = 'intro' | 'running' | 'feedback' | 'complete';

export function ExerciseRunner({ config, exerciseRunId, onComplete, onExit }: ExerciseRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const totalTrials = config.trials.length;
  const currentTrial = config.trials[currentTrialIndex];

  // Handle trial completion
  const handleTrialComplete = useCallback((result: TrialResult) => {
    setResults(prev => [...prev, result]);
    setFeedbackType(result.is_correct ? 'correct' : 'incorrect');
    setPhase('feedback');

    // Log trial to server
    fetch('/api/trials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exercise_run_id: exerciseRunId,
        ...result,
        trial_config: JSON.stringify(currentTrial),
        correct_answer: getCorrectAnswer(config.exercise_id, currentTrial),
      }),
    }).catch(console.error);
  }, [exerciseRunId, currentTrial, config.exercise_id]);

  // Move to next trial after feedback
  const handleFeedbackComplete = useCallback(() => {
    setFeedbackType(null);
    
    if (currentTrialIndex + 1 >= totalTrials) {
      setPhase('complete');
    } else {
      setCurrentTrialIndex(prev => prev + 1);
      setPhase('running');
    }
  }, [currentTrialIndex, totalTrials]);

  // Handle exercise completion
  const handleExerciseComplete = useCallback(() => {
    onComplete(results);
  }, [results, onComplete]);

  // Start exercise
  const handleStart = () => {
    setPhase('running');
  };

  // Pause handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'running') {
        setIsPaused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Render exercise component based on type
  const renderExercise = () => {
    const exerciseProps = {
      config,
      currentTrialIndex,
      onTrialComplete: handleTrialComplete,
      onExerciseComplete: handleExerciseComplete,
      showFeedback: false,
    };

    switch (config.exercise_id) {
      case 'coherent_motion':
        return <CoherentMotion {...exerciseProps} />;
      case 'visual_search':
        return <VisualSearch {...exerciseProps} />;
      case 'line_tracking':
        return <LineTracking {...exerciseProps} />;
      case 'maze_tracking':
        return <MazeTracking {...exerciseProps} />;
      case 'dynamic_football':
        return <DynamicFootball {...exerciseProps} />;
      case 'dynamic_tennis':
        return <DynamicTennis {...exerciseProps} />;
      case 'dynamic_circles':
        return <DynamicTwoCircles {...exerciseProps} />;
      case 'visual_saccades':
        return <VisualSaccades {...exerciseProps} />;
      case 'visual_memory':
        return <VisualMemory {...exerciseProps} />;
      case 'visual_discrimination':
        return <VisualDiscrimination {...exerciseProps} />;
      case 'pair_search':
        return <PairSearch {...exerciseProps} />;
      default:
        return <div>Unknown exercise type: {config.exercise_id}</div>;
    }
  };

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center max-w-lg">
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            {config.name}
          </h1>
          <p className="text-child-base text-slate-600 mb-8">
            {config.description}
          </p>
          <p className="text-lg text-slate-500 mb-8">
            {totalTrials} tasks to complete
          </p>
          <Button onClick={handleStart} size="xl">
            Start!
          </Button>
        </div>
      </div>
    );
  }

  // Complete screen
  if (phase === 'complete') {
    const correctCount = results.filter(r => r.is_correct).length;
    const percentage = Math.round((correctCount / totalTrials) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-success-50 to-success-100">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            Great Job!
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            You got {correctCount} out of {totalTrials} correct!
          </p>
          <div className="text-6xl mb-8">
            {percentage >= 80 ? '⭐⭐⭐' : percentage >= 50 ? '⭐⭐' : '⭐'}
          </div>
          <Button onClick={handleExerciseComplete} variant="success" size="xl">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Pause overlay
  if (isPaused) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900/90">
        <div className="text-center">
          <h2 className="text-child-xl font-bold text-white mb-8">Paused</h2>
          <div className="flex gap-4">
            <Button onClick={() => setIsPaused(false)} variant="primary">
              Resume
            </Button>
            <Button onClick={onExit} variant="danger">
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Running/Feedback phase
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Progress bar */}
      <div className="p-4 bg-slate-800">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <span className="text-white font-medium">
            {currentTrialIndex + 1} / {totalTrials}
          </span>
          <div className="flex-1">
            <ProgressBar 
              value={currentTrialIndex + 1} 
              max={totalTrials} 
              showLabel={false}
              color="primary"
            />
          </div>
          <button 
            onClick={() => setIsPaused(true)}
            className="text-slate-400 hover:text-white p-2"
            title="Pause (Esc)"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {phase === 'feedback' ? (
          <Feedback 
            type={feedbackType} 
            onComplete={handleFeedbackComplete}
            duration={800}
          />
        ) : null}
        {renderExercise()}
      </div>
    </div>
  );
}

// Helper to extract correct answer for logging
function getCorrectAnswer(exerciseId: string, trial: unknown): string {
  const t = trial as Record<string, unknown>;
  switch (exerciseId) {
    case 'coherent_motion':
      return String(t.coherent_side);
    case 'visual_search':
      return String(t.target_count);
    case 'line_tracking':
      return String(t.correct_end);
    case 'maze_tracking':
      return JSON.stringify(t.end_position);
    default:
      return 'varies';
  }
}

