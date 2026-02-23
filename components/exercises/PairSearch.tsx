'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getPairSearchGroup,
  getSingleImagePath,
  shuffleArray,
  type PairSearchGroup,
} from '@/lib/exercises/pairSearchData';

const ROUNDS_PER_SESSION = 4;

export function PairSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const level = Math.max(1, Math.min(15, config.difficulty_level || 1));
  const group: PairSearchGroup = getPairSearchGroup(level);

  const [currentRound, setCurrentRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Generate round order (which singles to show as targets, in shuffled order)
  const roundOrder = useMemo(() => shuffleArray([0, 1, 2, 3]), [level]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shuffled options for the current round
  const [shuffledOptions, setShuffledOptions] = useState<number[]>([]);

  // Current target index (0-3)
  const targetIdx = roundOrder[currentRound];
  const targetImage = group.singles[targetIdx];

  // Reset on exercise restart
  useEffect(() => {
    setCurrentRound(0);
    setSelected(null);
    setIsCorrect(null);
    setWrongAttempts(0);
    setTotalWrongAttempts(0);
    setIsSessionComplete(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Shuffle options when round changes
  useEffect(() => {
    setShuffledOptions(shuffleArray([0, 1, 2, 3]));
    setSelected(null);
    setIsCorrect(null);
    setWrongAttempts(0);
  }, [currentRound]);

  const handleComplete = useCallback(() => {
    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: JSON.stringify({ 
        level, 
        totalWrongAttempts, 
        roundsCompleted: ROUNDS_PER_SESSION,
        groupId: group.groupId,
      }),
      response_time_ms: Date.now() - startTimeRef.current,
      is_correct: true,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [currentTrialIndex, level, totalWrongAttempts, group.groupId, onTrialComplete]);

  const advanceRound = useCallback(() => {
    if (currentRound + 1 >= ROUNDS_PER_SESSION) {
      setIsSessionComplete(true);
      setTimeout(() => handleComplete(), 1200);
    } else {
      setCurrentRound((prev) => prev + 1);
    }
  }, [currentRound, handleComplete]);

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (isSessionComplete || selected !== null) return;

      // optionIdx is the index in shuffledOptions, need to find the actual single index
      const actualIdx = shuffledOptions[optionIdx];
      setSelected(optionIdx);

      if (actualIdx === targetIdx) {
        setIsCorrect(true);
        setTimeout(() => advanceRound(), 800);
      } else {
        setIsCorrect(false);
        setWrongAttempts((prev) => prev + 1);
        setTotalWrongAttempts((prev) => prev + 1);
        setTimeout(() => {
          setSelected(null);
          setIsCorrect(null);
        }, 500);
      }
    },
    [isSessionComplete, selected, shuffledOptions, targetIdx, advanceRound],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Find the Match!</h2>

      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Round {currentRound + 1} of {ROUNDS_PER_SESSION}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">Level {level}</span>
      </div>

      <p className="text-slate-400 text-sm">
        Click the image below that matches the target above
      </p>

      {/* Target image at top */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <p className="text-slate-500 text-sm text-center mb-2">Target:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getSingleImagePath(targetImage)}
          alt="Target"
          style={{ width: 120, height: 120, objectFit: 'contain' }}
          draggable={false}
        />
      </div>

      {/* 4 answer options below */}
      <div className="flex gap-4 flex-wrap justify-center">
        {shuffledOptions.map((singleIdx, optionIdx) => {
          const isThis = selected === optionIdx;
          const correct = isThis && isCorrect === true;
          const wrong = isThis && isCorrect === false;

          return (
            <button
              key={optionIdx}
              onClick={() => handleAnswer(optionIdx)}
              disabled={isSessionComplete}
              className={`
                rounded-xl p-3 transition-all
                ${correct ? 'bg-green-100 ring-4 ring-green-400 scale-110' : ''}
                ${wrong ? 'bg-red-100 ring-4 ring-red-400 animate-shake' : ''}
                ${!isThis ? 'bg-white hover:bg-blue-50 hover:scale-105 shadow-lg border-2 border-slate-200' : ''}
                ${isSessionComplete && !isThis ? 'opacity-50' : ''}
              `}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSingleImagePath(group.singles[singleIdx])}
                alt={`Option ${optionIdx + 1}`}
                style={{ width: 100, height: 100, objectFit: 'contain' }}
                draggable={false}
              />
            </button>
          );
        })}
      </div>

      {isSessionComplete && (
        <div className="text-green-400 text-xl font-bold animate-pulse">All rounds complete!</div>
      )}

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
