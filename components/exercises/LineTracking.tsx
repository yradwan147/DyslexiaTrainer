'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getLineTrackingConfigForLevel,
  getLineTrackingImagePath,
  type LineTrackingConfig,
} from '@/lib/exercises/lineTrackingData';

export function LineTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Level 1-16 from difficulty
  const level = Math.max(1, Math.min(16, config.difficulty_level || 1));
  const puzzleConfig: LineTrackingConfig = getLineTrackingConfigForLevel(level);

  const { itemCount, connections, leftYPositions, rightYPositions, imageFile } = puzzleConfig;

  const [currentLeftIdx, setCurrentLeftIdx] = useState(0);
  const [solvedLeft, setSolvedLeft] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongFeedback, setWrongFeedback] = useState<number | null>(null); // right idx with red flash
  const [correctFeedback, setCorrectFeedback] = useState<number | null>(null); // right idx with green flash
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 900, h: 600 });

  const allSolved = solvedLeft.size === itemCount;

  // Reset on restart
  useEffect(() => {
    setCurrentLeftIdx(0);
    setSolvedLeft(new Set());
    setWrongAttempts(0);
    setWrongFeedback(null);
    setCorrectFeedback(null);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Track image natural size for aspect ratio
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  // Complete handler
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

  // Handle clicking a right-side hotspot
  const handleRightClick = useCallback(
    (rightIdx: number) => {
      if (allSolved || wrongFeedback !== null || correctFeedback !== null) return;

      const correctRightIdx = connections[currentLeftIdx];
      const isCorrect = rightIdx === correctRightIdx;

      if (isCorrect) {
        setCorrectFeedback(rightIdx);
        setTimeout(() => {
          const newSolved = new Set(solvedLeft);
          newSolved.add(currentLeftIdx);
          setSolvedLeft(newSolved);
          setCorrectFeedback(null);

          // Find next unsolved left item
          let next = currentLeftIdx + 1;
          while (next < itemCount && newSolved.has(next)) next++;

          if (newSolved.size === itemCount) {
            setTimeout(() => handleComplete(), 600);
          } else if (next < itemCount) {
            setCurrentLeftIdx(next);
          }
        }, 500);
      } else {
        setWrongAttempts((prev) => prev + 1);
        setWrongFeedback(rightIdx);
        setTimeout(() => setWrongFeedback(null), 500);
      }
    },
    [allSolved, wrongFeedback, correctFeedback, connections, currentLeftIdx, solvedLeft, itemCount, handleComplete],
  );

  // Hotspot size (percentage of image height)
  const hotspotHeightPct = Math.min(15, 80 / itemCount); // percent of container
  const hotspotWidthPct = 12; // percent of container width

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-white text-2xl font-bold">Kdo je kaj izgubil?</h2>

      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Level {level}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          {itemCount} lines
        </span>
      </div>

      <p className="text-slate-400 text-sm">
        Follow the line from the eye on the left and click the matching item on the right
      </p>

      {/* Image container with overlaid hotspots */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 900,
          minWidth: 700,
          aspectRatio: `${imgSize.w} / ${imgSize.h}`,
        }}
      >
        {/* The puzzle image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getLineTrackingImagePath(imageFile)}
          alt={`Line tracking puzzle ${level}`}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          draggable={false}
        />

        {/* Left-side eye indicators (non-clickable) */}
        {leftYPositions.map((yPct, idx) => {
          const isCurrent = idx === currentLeftIdx && !allSolved;
          const isSolved = solvedLeft.has(idx);

          return (
            <div
              key={`left-${idx}`}
              style={{
                position: 'absolute',
                left: '0%',
                top: `${yPct * 100 - hotspotHeightPct / 2}%`,
                width: `${hotspotWidthPct}%`,
                height: `${hotspotHeightPct}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {isCurrent && (
                <span className="text-3xl animate-pulse drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }}>
                  👁️
                </span>
              )}
              {isSolved && (
                <span className="text-2xl text-green-500 font-bold drop-shadow">✓</span>
              )}
            </div>
          );
        })}

        {/* Right-side clickable hotspots (semi-transparent overlay) */}
        {rightYPositions.map((yPct, idx) => {
          // Find which left connects to this right
          const leftForThis = connections.indexOf(idx);
          const isSolved = leftForThis >= 0 && solvedLeft.has(leftForThis);
          const isWrong = wrongFeedback === idx;
          const isCorrectFlash = correctFeedback === idx;

          return (
            <button
              key={`right-${idx}`}
              onClick={() => handleRightClick(idx)}
              disabled={isSolved || allSolved}
              style={{
                position: 'absolute',
                right: '0%',
                top: `${yPct * 100 - hotspotHeightPct / 2}%`,
                width: `${hotspotWidthPct}%`,
                height: `${hotspotHeightPct}%`,
                border: 'none',
                borderRadius: 8,
                cursor: isSolved ? 'default' : 'pointer',
                // Normally transparent; show feedback colors on click
                backgroundColor: isWrong
                  ? 'rgba(239, 68, 68, 0.35)'
                  : isCorrectFlash
                  ? 'rgba(34, 197, 94, 0.35)'
                  : isSolved
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'transparent',
                transition: 'background-color 0.2s',
                zIndex: 10,
              }}
              title={isSolved ? 'Matched' : 'Click to select'}
            >
              {isSolved && (
                <span className="text-2xl text-green-500 font-bold drop-shadow">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-8 text-white text-lg">
        <span>Matched: {solvedLeft.size} / {itemCount}</span>
      </div>
    </div>
  );
}
