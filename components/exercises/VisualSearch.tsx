'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  generateVisualSearchConfig,
  getSearchImagePath,
  LEVEL_TABLE,
  type VisualSearchConfig,
} from '@/lib/exercises/visualSearchData';

// 10 puzzles per session (one per puzzle type)
const PUZZLES_PER_SESSION = 10;

export function VisualSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Level 1-15 (from config.difficulty_level, set by exercise page via localStorage)
  const level = Math.max(1, Math.min(15, config.difficulty_level || 1));

  // Unique session seed
  const sessionSeed = useMemo(() => Date.now() + Math.random() * 1000000, []);

  // Pre-generate all 10 puzzles for this session
  const sessionPuzzles = useMemo(() => {
    const puzzles: VisualSearchConfig[] = [];
    for (let i = 0; i < PUZZLES_PER_SESSION; i++) {
      puzzles.push(generateVisualSearchConfig(i, sessionSeed + i * 12345, level));
    }
    return puzzles;
  }, [sessionSeed, level]);

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [foundItems, setFoundItems] = useState<Set<string>>(new Set());
  const [wrongClicks, setWrongClicks] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const puzzleConfig = sessionPuzzles[currentPuzzle];
  const { gridSize, mainItem, differentItems, totalDifferent, description } = puzzleConfig;

  // Reset on new puzzle
  useEffect(() => {
    setFoundItems(new Set());
    setWrongClicks(new Set());
    setShowSuccess(false);
  }, [currentPuzzle]);

  // Reset on exercise restart
  useEffect(() => {
    setCurrentPuzzle(0);
    setFoundItems(new Set());
    setWrongClicks(new Set());
    setShowSuccess(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  const getDifferentItem = useCallback(
    (row: number, col: number) => differentItems.find((d) => d.row === row && d.col === col),
    [differentItems],
  );

  // Advance to next puzzle or complete session
  const advanceToNext = useCallback(() => {
    const next = currentPuzzle + 1;
    if (next >= PUZZLES_PER_SESSION) {
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({
          puzzlesCompleted: PUZZLES_PER_SESSION,
          wrongClicks: wrongClicks.size,
          level,
        }),
        response_time_ms: Date.now() - startTimeRef.current,
        is_correct: true,
        is_timed_out: false,
        is_skipped: false,
        started_at: new Date(startTimeRef.current).toISOString(),
        responded_at: new Date().toISOString(),
      });
    } else {
      setCurrentPuzzle(next);
    }
  }, [currentPuzzle, wrongClicks.size, level, currentTrialIndex, onTrialComplete]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (showSuccess) return;
      const key = `${row}-${col}`;
      if (foundItems.has(key) || wrongClicks.has(key)) return;

      if (totalDifferent === 0) {
        setShowSuccess(true);
        setTimeout(() => advanceToNext(), 1000);
        return;
      }

      const diff = getDifferentItem(row, col);
      if (diff) {
        const newFound = new Set(foundItems);
        newFound.add(key);
        setFoundItems(newFound);
        if (newFound.size === totalDifferent) {
          setShowSuccess(true);
          setTimeout(() => advanceToNext(), 1000);
        }
      } else {
        const newWrong = new Set(wrongClicks);
        newWrong.add(key);
        setWrongClicks(newWrong);
      }
    },
    [showSuccess, foundItems, wrongClicks, getDifferentItem, totalDifferent, advanceToNext],
  );

  // Responsive cell size for fullscreen
  const cellSize = Math.min(70, Math.floor(520 / gridSize));

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const key = `${row}-${col}`;
        const diff = getDifferentItem(row, col);
        const itemName = diff ? diff.item : mainItem;
        const isFound = foundItems.has(key);
        const isWrong = wrongClicks.has(key);

        cells.push(
          <button
            key={key}
            onClick={() => handleCellClick(row, col)}
            disabled={isFound || showSuccess}
            className={`
              relative flex items-center justify-center transition-all duration-200 rounded-lg
              ${isFound ? 'bg-green-100 ring-4 ring-green-500' : 'bg-white'}
              ${isWrong ? 'bg-red-50' : ''}
              ${!isFound && !isWrong && !showSuccess ? 'hover:bg-slate-100 hover:scale-105' : ''}
              ${showSuccess ? 'cursor-default' : 'cursor-pointer'}
            `}
            style={{ width: cellSize, height: cellSize }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getSearchImagePath(itemName)}
              alt={itemName}
              style={{ width: cellSize - 8, height: cellSize - 8, objectFit: 'contain' }}
            />
            {isFound && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-200/50 rounded-lg">
                <span className="text-green-600 text-3xl font-bold">✓</span>
              </div>
            )}
            {isWrong && (
              <div className="absolute top-1 right-1">
                <span className="text-red-400 text-sm">✗</span>
              </div>
            )}
          </button>,
        );
      }
    }

    return (
      <div
        className="grid gap-1 sm:gap-2 p-3 sm:p-4 bg-slate-100 rounded-2xl shadow-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}
      >
        {cells}
      </div>
    );
  };

  const levelInfo = LEVEL_TABLE[level - 1];

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">
        {totalDifferent === 0 ? 'Are they all the same?' : 'Find the Different One!'}
      </h2>

      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">
          Puzzle {currentPuzzle + 1} of {PUZZLES_PER_SESSION}
        </span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {level} &bull; {levelInfo.gridSize}&times;{levelInfo.gridSize} &bull;{' '}
          {levelInfo.differentCount} different
        </span>
      </div>

      <p className="text-slate-400 text-sm">{description}</p>

      {renderGrid()}

      {showSuccess && (
        <div className="text-green-400 text-xl font-bold animate-pulse">
          {totalDifferent === 0 ? '✓ Correct!' : 'Found it!'}
        </div>
      )}

      {wrongClicks.size > 0 && !showSuccess && (
        <div className="text-slate-500 text-sm">Keep looking...</div>
      )}
    </div>
  );
}
