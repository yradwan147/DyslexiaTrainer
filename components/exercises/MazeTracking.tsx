'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps, MazeTrackingTrialConfig } from '@/lib/exercises/types';

export function MazeTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0]);
  const [path, setPath] = useState<[number, number][]>([[0, 0]]);
  const [hasResponded, setHasResponded] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const trial = config.trials[currentTrialIndex] as MazeTrackingTrialConfig;
  const { maze_width, maze_height, maze_cells, start_position, end_position, stimulus_duration_ms } = trial;

  const cellSize = Math.min(60, 500 / Math.max(maze_width, maze_height));

  // Reset on trial change
  useEffect(() => {
    setHasResponded(false);
    setCurrentPos(start_position);
    setPath([start_position]);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex, start_position]);

  // Handle cell click
  const handleCellClick = useCallback((x: number, y: number) => {
    if (hasResponded) return;
    if (maze_cells[y][x] === 0) return; // Wall

    // Check if adjacent to current position
    const dx = Math.abs(x - currentPos[0]);
    const dy = Math.abs(y - currentPos[1]);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      setCurrentPos([x, y]);
      setPath(prev => [...prev, [x, y]]);

      // Check if reached end
      if (x === end_position[0] && y === end_position[1]) {
        setHasResponded(true);
        const responseTime = Date.now() - startTimeRef.current;
        
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify([...path, [x, y]]),
          response_time_ms: responseTime,
          is_correct: true,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      }
    }
  }, [hasResponded, maze_cells, currentPos, end_position, path, currentTrialIndex, onTrialComplete]);

  // Timeout handler
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasResponded) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify(path),
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
  }, [stimulus_duration_ms, hasResponded, currentTrialIndex, path, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Navigate from 🟢 to 🏁</h2>
      
      <div 
        className="grid gap-1 bg-slate-800 p-4 rounded-2xl"
        style={{ 
          gridTemplateColumns: `repeat(${maze_width}, ${cellSize}px)`,
        }}
      >
        {maze_cells.map((row, y) =>
          row.map((cell, x) => {
            const isStart = x === start_position[0] && y === start_position[1];
            const isEnd = x === end_position[0] && y === end_position[1];
            const isCurrent = x === currentPos[0] && y === currentPos[1];
            const isPath = path.some(([px, py]) => px === x && py === y);
            const isWall = cell === 0;

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={`
                  flex items-center justify-center text-2xl transition-all
                  ${isWall ? 'bg-slate-700' : 'bg-slate-600 cursor-pointer hover:bg-slate-500'}
                  ${isPath && !isStart && !isEnd ? 'bg-primary-500/50' : ''}
                  ${isCurrent ? 'ring-4 ring-primary-400' : ''}
                `}
                style={{ width: cellSize, height: cellSize }}
              >
                {isStart && '🟢'}
                {isEnd && '🏁'}
                {isCurrent && !isStart && !isEnd && '👤'}
              </div>
            );
          })
        )}
      </div>
      
      <p className="text-slate-400">Click adjacent cells to move</p>
    </div>
  );
}

