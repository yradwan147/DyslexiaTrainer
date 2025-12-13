'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createSeededRandom } from '@/lib/exercises/prng';
import type { ExerciseProps, VisualSearchTrialConfig } from '@/lib/exercises/types';

const SHAPES = ['●', '■', '▲', '◆'];
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

export function VisualSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [hasResponded, setHasResponded] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const trial = config.trials[currentTrialIndex] as VisualSearchTrialConfig;
  const { seed, grid_rows, grid_cols, target_count, target_positions, difference_type, stimulus_duration_ms } = trial;

  // Generate grid items
  const rng = createSeededRandom(seed);
  const baseShape = rng.pick(SHAPES);
  const baseColor = rng.pick(COLORS);
  const targetShape = difference_type === 'shape' ? rng.pick(SHAPES.filter(s => s !== baseShape)) : baseShape;
  const targetColor = difference_type === 'color' ? rng.pick(COLORS.filter(c => c !== baseColor)) : baseColor;

  const grid: { shape: string; color: string; isTarget: boolean }[][] = [];
  for (let row = 0; row < grid_rows; row++) {
    grid[row] = [];
    for (let col = 0; col < grid_cols; col++) {
      const isTarget = target_positions.some(([r, c]) => r === row && c === col);
      grid[row][col] = {
        shape: isTarget ? targetShape : baseShape,
        color: isTarget ? targetColor : baseColor,
        isTarget,
      };
    }
  }

  // Reset on trial change
  useEffect(() => {
    setHasResponded(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Handle response
  const handleResponse = useCallback((count: number) => {
    if (hasResponded) return;
    setHasResponded(true);

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = count === target_count;

    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: String(count),
      response_time_ms: responseTime,
      is_correct: isCorrect,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [hasResponded, target_count, currentTrialIndex, onTrialComplete]);

  // Timeout handler
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasResponded) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: '',
          response_time_ms: stimulus_duration_ms,
          is_correct: false,
          is_timed_out: true,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      }
    }, stimulus_duration_ms);

    return () => clearTimeout(timeout);
  }, [stimulus_duration_ms, hasResponded, currentTrialIndex, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-white text-2xl font-bold">How many are different?</h2>
      
      {/* Grid */}
      <div 
        className="grid gap-4 bg-slate-800 p-6 rounded-2xl"
        style={{ 
          gridTemplateColumns: `repeat(${grid_cols}, 1fr)`,
        }}
      >
        {grid.flat().map((cell, idx) => (
          <div
            key={idx}
            className="w-16 h-16 flex items-center justify-center text-4xl rounded-xl bg-slate-700"
            style={{ color: cell.color }}
          >
            {cell.shape}
          </div>
        ))}
      </div>

      {/* Answer buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {[0, 1, 2, 3, 4, 5, 6].map(num => (
          <button
            key={num}
            onClick={() => handleResponse(num)}
            disabled={hasResponded}
            className="w-16 h-16 text-2xl font-bold bg-primary-500 text-white rounded-xl
                       hover:bg-primary-600 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

