'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getPairSearchConfigForLevel,
  getPairSearchImagePath,
  type PairSearchConfig,
} from '@/lib/exercises/pairSearchData';

export function PairSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const level = Math.max(1, Math.min(15, config.difficulty_level || 1));
  const puzzleConfig: PairSearchConfig = getPairSearchConfigForLevel(level);

  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Reset on restart
  useEffect(() => {
    setSelected(null);
    setIsCorrect(null);
    setWrongAttempts(0);
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  const handleComplete = useCallback(() => {
    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: JSON.stringify({ level, wrongAttempts, correctAnswer: puzzleConfig.correctAnswer }),
      response_time_ms: Date.now() - startTimeRef.current,
      is_correct: true,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [currentTrialIndex, level, wrongAttempts, puzzleConfig.correctAnswer, onTrialComplete]);

  const handleAnswer = useCallback(
    (answerIdx: number) => {
      if (isComplete || selected !== null) return;

      setSelected(answerIdx);

      if (answerIdx === puzzleConfig.correctAnswer) {
        setIsCorrect(true);
        setIsComplete(true);
        setTimeout(() => handleComplete(), 1000);
      } else {
        setIsCorrect(false);
        setWrongAttempts((prev) => prev + 1);
        // Reset after brief feedback
        setTimeout(() => {
          setSelected(null);
          setIsCorrect(null);
        }, 600);
      }
    },
    [isComplete, selected, puzzleConfig.correctAnswer, handleComplete],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-white text-xl font-bold">Find the Matching Shape!</h2>

      <div className="flex items-center gap-3 text-slate-300 text-sm">
        <span>Level {level}</span>
      </div>

      <p className="text-slate-400 text-xs">
        Look at the shape on top. Which option below matches it exactly?
      </p>

      {/* Puzzle image */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ maxWidth: 700, width: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPairSearchImagePath(puzzleConfig.imageFile)}
          alt={`Pair search puzzle ${level}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>

      {/* 4 answer buttons below the image */}
      <div className="flex gap-3 mt-1">
        {[0, 1, 2, 3].map((idx) => {
          const isThis = selected === idx;
          const correct = isThis && isCorrect === true;
          const wrong = isThis && isCorrect === false;

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isComplete}
              className={`
                w-16 h-16 rounded-xl text-2xl font-bold transition-all
                ${correct ? 'bg-green-500 text-white ring-4 ring-green-300 scale-110' : ''}
                ${wrong ? 'bg-red-500 text-white ring-4 ring-red-300 animate-shake' : ''}
                ${!isThis ? 'bg-white text-slate-700 hover:bg-blue-50 hover:scale-105 shadow-md border-2 border-slate-200' : ''}
                ${isComplete && !isThis ? 'opacity-50' : ''}
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="text-green-400 text-lg font-bold animate-pulse">Correct!</div>
      )}
    </div>
  );
}
