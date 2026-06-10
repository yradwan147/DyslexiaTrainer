'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Feedback } from '@/components/ui/Feedback';
import type { ExerciseConfig, TrialResult, ExerciseScore } from '@/lib/exercises/types';

// Exercise components
import { CoherentMotion } from './CoherentMotion';
import { VisualSearch } from './VisualSearch';
import { LineTracking } from './LineTracking';
import { MazeTracking } from './MazeTracking';
import { DynamicFootball } from './DynamicFootball';
import { DynamicTennis } from './DynamicTennis';
import { VisualSaccades } from './VisualSaccades';
import { VisualMemory } from './VisualMemory';
import { VisualDiscrimination } from './VisualDiscrimination';
import { PairSearch } from './PairSearch';

interface ExerciseRunnerProps {
  config: ExerciseConfig;
  exerciseRunId: number;
  onComplete: (results: TrialResult[], score?: ExerciseScore) => void;
  onExit: () => void;
}

type Phase = 'intro' | 'running' | 'feedback' | 'complete';

export function ExerciseRunner({ config, exerciseRunId, onComplete, onExit }: ExerciseRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [results, setResults] = useState<TrialResult[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Derive the real aggregate score. Self-contained exercises emit one summary
  // result carrying score_correct/score_total; per-trial exercises (coherent_motion)
  // leave it undefined and the score is computed from per-trial is_correct downstream.
  const aggregateScore: ExerciseScore | undefined = (() => {
    const scored = results.find(r => typeof r.score_total === 'number');
    if (scored) return { correct_count: scored.score_correct ?? 0, total_trials: scored.score_total as number };
    return undefined;
  })();

  // Handle exercise completion
  const handleExerciseComplete = useCallback(() => {
    const scored = results.find(r => typeof r.score_total === 'number');
    const score: ExerciseScore | undefined = scored
      ? { correct_count: scored.score_correct ?? 0, total_trials: scored.score_total as number }
      : undefined;
    onComplete(results, score);
  }, [results, onComplete]);

  // Start exercise
  const handleStart = () => {
    // Best-effort: enter fullscreen for all exercises on start.
    // (May be blocked by browser gesture requirements; user can still use browser fullscreen manually.)
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // ignore
      });
    }
    setPhase('running');
  };

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  // Sync fullscreen state with browser fullscreenchange event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    const correctCount = aggregateScore ? aggregateScore.correct_count : results.filter(r => r.is_correct).length;
    const scoreTotal = aggregateScore ? aggregateScore.total_trials : totalTrials;
    const percentage = scoreTotal > 0 ? Math.round((correctCount / scoreTotal) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-success-50 to-success-100">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-child-2xl font-bold text-slate-800 mb-4">
            Great Job!
          </h1>
          <p className="text-child-base text-slate-600 mb-4">
            You got {correctCount} out of {scoreTotal} correct!
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
    <div ref={containerRef} className="h-screen flex flex-col bg-slate-900 overflow-hidden">
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
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white p-2 text-lg"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>
          <button 
            onClick={() => setIsPaused(true)}
            className="text-slate-400 hover:text-white p-2"
            title="Pause (Esc)"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Exercise area -- fills remaining space */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 overflow-hidden">
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

