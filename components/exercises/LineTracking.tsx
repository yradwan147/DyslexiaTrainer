'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getLineTrackingConfigForLevel,
  getLineTrackingImagePath,
  type LineTrackingConfig,
} from '@/lib/exercises/lineTrackingData';

const LEFT_LABELS = ['A', 'B', 'C', 'D', 'E'];
const RIGHT_LABELS = ['1', '2', '3', '4', '5'];

export function LineTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const level = Math.max(1, Math.min(16, config.difficulty_level || 1));
  const puzzleConfig: LineTrackingConfig = getLineTrackingConfigForLevel(level);
  const { itemCount, connections, imageFile } = puzzleConfig;

  const [currentLeftIdx, setCurrentLeftIdx] = useState(0);
  const [solvedLeft, setSolvedLeft] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongBtn, setWrongBtn] = useState<number | null>(null);
  const [correctBtn, setCorrectBtn] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const allSolved = solvedLeft.size === itemCount;

  useEffect(() => {
    setCurrentLeftIdx(0);
    setSolvedLeft(new Set());
    setWrongAttempts(0);
    setWrongBtn(null);
    setCorrectBtn(null);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  const handleComplete = useCallback(() => {
    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: JSON.stringify({ level, wrongAttempts }),
      response_time_ms: Date.now() - startTimeRef.current,
      is_correct: true,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [currentTrialIndex, level, wrongAttempts, onTrialComplete]);

  const handleRightClick = useCallback(
    (rightIdx: number) => {
      if (allSolved || wrongBtn !== null || correctBtn !== null) return;

      const correctRightIdx = connections[currentLeftIdx];

      if (rightIdx === correctRightIdx) {
        setCorrectBtn(rightIdx);
        setTimeout(() => {
          const newSolved = new Set(solvedLeft);
          newSolved.add(currentLeftIdx);
          setSolvedLeft(newSolved);
          setCorrectBtn(null);

          let next = currentLeftIdx + 1;
          while (next < itemCount && newSolved.has(next)) next++;

          if (newSolved.size === itemCount) {
            setTimeout(() => handleComplete(), 600);
          } else if (next < itemCount) {
            setCurrentLeftIdx(next);
          }
        }, 400);
      } else {
        setWrongAttempts((prev) => prev + 1);
        setWrongBtn(rightIdx);
        setTimeout(() => setWrongBtn(null), 400);
      }
    },
    [allSolved, wrongBtn, correctBtn, connections, currentLeftIdx, solvedLeft, itemCount, handleComplete],
  );

  // Which right buttons are already solved?
  const solvedRightIndices = new Set<number>();
  solvedLeft.forEach((leftIdx) => {
    solvedRightIndices.add(connections[leftIdx]);
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-white text-xl font-bold">Kdo je kaj izgubil?</h2>

      <div className="flex items-center gap-3 text-slate-300 text-sm">
        <span>Level {level}</span>
        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{itemCount} lines</span>
      </div>

      <p className="text-slate-400 text-xs">
        Follow the line from the highlighted letter, then click the matching number
      </p>

      {/* Main layout: [left labels] [image] [right buttons] */}
      <div className="flex items-center gap-2">
        {/* Left side: eye indicator labels */}
        <div className="flex flex-col gap-1" style={{ minWidth: 48 }}>
          {Array.from({ length: itemCount }, (_, idx) => {
            const isCurrent = idx === currentLeftIdx && !allSolved;
            const isSolved = solvedLeft.has(idx);

            return (
              <div
                key={`left-${idx}`}
                className={`
                  flex items-center justify-center rounded-lg text-lg font-bold transition-all
                  ${isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-110' : ''}
                  ${isSolved ? 'bg-green-200 text-green-700' : ''}
                  ${!isCurrent && !isSolved ? 'bg-slate-700 text-slate-400' : ''}
                `}
                style={{ width: 44, height: 44 }}
              >
                {isCurrent && <span className="mr-0.5 text-sm">👁️</span>}
                {LEFT_LABELS[idx]}
                {isSolved && <span className="ml-0.5 text-sm">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Center: puzzle image */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ maxWidth: 650, flex: '1 1 auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getLineTrackingImagePath(imageFile)}
            alt={`Line tracking puzzle ${level}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            draggable={false}
          />
        </div>

        {/* Right side: answer buttons */}
        <div className="flex flex-col gap-1" style={{ minWidth: 48 }}>
          {Array.from({ length: itemCount }, (_, idx) => {
            const isSolved = solvedRightIndices.has(idx);
            const isWrong = wrongBtn === idx;
            const isCorrectFlash = correctBtn === idx;

            return (
              <button
                key={`right-${idx}`}
                onClick={() => handleRightClick(idx)}
                disabled={isSolved || allSolved}
                className={`
                  flex items-center justify-center rounded-lg text-lg font-bold transition-all
                  ${isCorrectFlash ? 'bg-green-500 text-white ring-2 ring-green-300 scale-110' : ''}
                  ${isWrong ? 'bg-red-500 text-white ring-2 ring-red-300 animate-shake' : ''}
                  ${isSolved ? 'bg-green-200 text-green-700' : ''}
                  ${!isSolved && !isWrong && !isCorrectFlash ? 'bg-white text-slate-700 hover:bg-blue-50 hover:scale-105 shadow-md border-2 border-slate-200' : ''}
                  ${allSolved && !isSolved ? 'opacity-50' : ''}
                `}
                style={{ width: 44, height: 44 }}
              >
                {RIGHT_LABELS[idx]}
                {isSolved && <span className="ml-0.5 text-sm">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-slate-400 text-sm">
        Matched: {solvedLeft.size} / {itemCount}
      </div>
    </div>
  );
}
