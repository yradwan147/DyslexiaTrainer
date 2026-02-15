'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getMazeConfig,
  getPlayerImagePath,
  getObjectImagePath,
  type MazeConfig,
} from '@/lib/exercises/mazeTrackingData';

export function MazeTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const level = Math.max(1, Math.min(15, config.difficulty_level || 1));
  const mazeConfig: MazeConfig = getMazeConfig(level);
  const { grid_size, grid, player, objects, object_count, maze_id } = mazeConfig;

  const [collectedSet, setCollectedSet] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [availableHeight, setAvailableHeight] = useState(500);
  const startTimeRef = useRef<number>(Date.now());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCollectedSet(new Set());
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Measure available space to size the maze dynamically
  useEffect(() => {
    const measure = () => {
      // Estimate available height: viewport minus header/status (~160px)
      const vh = window.innerHeight - 180;
      setAvailableHeight(Math.max(300, vh));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleComplete = useCallback(() => {
    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: JSON.stringify({ maze_id, level, collected: object_count }),
      response_time_ms: Date.now() - startTimeRef.current,
      is_correct: true,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [currentTrialIndex, maze_id, level, object_count, onTrialComplete]);

  const handleObjectClick = useCallback(
    (order: number) => {
      if (isComplete || collectedSet.has(order)) return;
      // No enforced order -- any uncollected object can be clicked
      const newSet = new Set(collectedSet);
      newSet.add(order);
      setCollectedSet(newSet);
      if (newSet.size === object_count) {
        setIsComplete(true);
        setTimeout(() => handleComplete(), 1200);
      }
    },
    [isComplete, collectedSet, object_count, handleComplete],
  );

  // Dynamic cell size: fit maze into available height (with padding for the outer border visibility)
  const padding = 12; // px padding around the maze grid
  const maxMazePx = Math.min(availableHeight - 20, 600);
  const cellSize = Math.floor(maxMazePx / grid_size);
  const mazePixelSize = cellSize * grid_size;

  return (
    <div ref={wrapperRef} className="flex flex-col items-center gap-2">
      <h2 className="text-white text-xl font-bold">Collect the Treasures!</h2>

      <div className="flex items-center gap-3 text-slate-300 text-sm">
        <span>Level {level}</span>
        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
          {object_count} objects
        </span>
      </div>

      <p className="text-slate-400 text-xs">Find and click the items by following the maze paths!</p>

      {/* Outer wrapper with contrasting background so exit gaps are visible */}
      <div
        className="rounded-xl shadow-lg"
        style={{
          padding: padding,
          backgroundColor: '#94a3b8', // slate-400: clearly different from both walls and paths
        }}
      >
        {/* Maze grid - no overflow-hidden so exits at edges aren't clipped */}
        <div
          className="relative"
          style={{ width: mazePixelSize, height: mazePixelSize }}
        >
          {/* Render wall/path cells */}
          {grid.map((rowStr, r) =>
            rowStr.split('').map((ch, c) => {
              const isWall = ch === '#';
              const isBorderCell = r === 0 || r === grid_size - 1 || c === 0 || c === rowStr.length - 1;
              const isExit = !isWall && isBorderCell;

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: 'absolute',
                    left: c * cellSize,
                    top: r * cellSize,
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isWall
                      ? '#1e293b'
                      : isExit
                      ? '#86efac' // bright green for exit openings
                      : '#ffffff',
                  }}
                />
              );
            }),
          )}

          {/* Player sprite */}
          <div
            style={{
              position: 'absolute',
              left: player.col * cellSize,
              top: player.row * cellSize,
              width: cellSize,
              height: cellSize,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlayerImagePath()}
              alt="Player"
              style={{
                width: cellSize * 1.6,
                height: cellSize * 1.6,
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
          </div>

          {/* Object sprites */}
          {objects.map((obj) => {
            const isCollected = collectedSet.has(obj.order);

            return (
              <div
                key={`obj-${obj.order}`}
                onClick={() => handleObjectClick(obj.order)}
                style={{
                  position: 'absolute',
                  left: obj.col * cellSize,
                  top: obj.row * cellSize,
                  width: cellSize,
                  height: cellSize,
                  zIndex: 20,
                  cursor: isCollected ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* No indicators -- child finds items by maze paths */}
                {isCollected ? (
                  <span style={{ fontSize: cellSize * 0.6, color: '#22c55e' }}>✓</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getObjectImagePath(maze_id)}
                    alt={`Object ${obj.order}`}
                    style={{
                      width: cellSize * 1.4,
                      height: cellSize * 1.4,
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="text-slate-400 text-sm">
        <span>Collected: {collectedSet.size} / {object_count}</span>
      </div>

      {isComplete && (
        <div className="text-green-400 text-lg font-bold animate-pulse">Maze Complete!</div>
      )}
    </div>
  );
}
