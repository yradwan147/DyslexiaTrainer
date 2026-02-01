'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  MAZE_CONFIGS,
  getMazeTrackingConfig,
  type MazeConfig, 
  type WallSegment,
  getCharacterEmoji,
  getCollectibleEmoji 
} from '@/lib/exercises/mazeTrackingData';

// Generate a session seed for reproducible but unique puzzles
function getSessionSeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

const MAZES_PER_SESSION = 5;

export function MazeTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [clickedCollectibles, setClickedCollectibles] = useState<Set<number>>(new Set());
  const [nextExpectedOrder, setNextExpectedOrder] = useState(1);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMaze, setCurrentMaze] = useState(0);
  const [sessionSeed] = useState(() => getSessionSeed() + currentTrialIndex * 100);
  const startTimeRef = useRef<number>(Date.now());

  // Get maze configuration - uses procedural generation for variety
  const mazeConfig = getMazeTrackingConfig(currentMaze, sessionSeed);

  const { gridSize, walls, collectibles, characterType, characterPosition, collectibleType } = mazeConfig;
  
  // Calculate cell size based on grid size
  const mazeSize = 450;
  const cellSize = mazeSize / gridSize;

  // Reset on maze change
  useEffect(() => {
    setClickedCollectibles(new Set());
    setNextExpectedOrder(1);
    setShowWrongFeedback(null);
    setIsComplete(false);
  }, [currentMaze]);

  // Reset everything on new trial
  useEffect(() => {
    setClickedCollectibles(new Set());
    setNextExpectedOrder(1);
    setWrongClicks(0);
    setShowWrongFeedback(null);
    setIsComplete(false);
    setCurrentMaze(0);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Find collectible at position
  const getCollectibleAt = useCallback((row: number, col: number) => {
    return collectibles.find(c => c.row === row && c.col === col);
  }, [collectibles]);

  // Handle collectible click
  const handleCollectibleClick = useCallback((row: number, col: number) => {
    if (isComplete) return;
    
    const collectible = getCollectibleAt(row, col);
    if (!collectible) return;
    
    // Already clicked
    if (clickedCollectibles.has(collectible.order)) return;

    if (collectible.order === nextExpectedOrder) {
      // Correct order
      const newClicked = new Set(clickedCollectibles);
      newClicked.add(collectible.order);
      setClickedCollectibles(newClicked);
      setNextExpectedOrder(prev => prev + 1);

      // Check if all collectibles collected
      if (newClicked.size === collectibles.length) {
        setIsComplete(true);
        setTimeout(() => {
          const nextMaze = currentMaze + 1;
          
          if (nextMaze >= MAZES_PER_SESSION) {
            // Session complete
            onTrialComplete({
              trial_index: currentTrialIndex,
              user_response: JSON.stringify({ 
                mazesCompleted: nextMaze,
                wrongClicks,
                configId: mazeConfig.id
              }),
              response_time_ms: Date.now() - startTimeRef.current,
              is_correct: true,
              is_timed_out: false,
              is_skipped: false,
              started_at: new Date(startTimeRef.current).toISOString(),
              responded_at: new Date().toISOString(),
            });
          } else {
            // Next maze
            setCurrentMaze(nextMaze);
          }
        }, 1000);
      }
    } else {
      // Wrong order
      setWrongClicks(prev => prev + 1);
      setShowWrongFeedback({ row, col });
      setTimeout(() => setShowWrongFeedback(null), 500);
    }
  }, [isComplete, getCollectibleAt, clickedCollectibles, nextExpectedOrder, collectibles.length, wrongClicks, currentTrialIndex, currentMaze, mazeConfig.id, onTrialComplete]);

  // Get character start position based on characterPosition
  const getCharacterPos = (): { row: number; col: number } | null => {
    switch (characterPosition) {
      case 'top-left': return { row: -0.5, col: -0.5 };
      case 'left': return { row: Math.floor(gridSize / 2), col: -0.5 };
      case 'bottom-right': return { row: gridSize - 0.5, col: gridSize + 0.5 };
      default: return null;
    }
  };

  const characterPos = getCharacterPos();

  // Render wall segments as SVG paths
  const renderWalls = () => {
    return walls.map((wall, idx) => {
      const { type, row, col, length } = wall;
      
      if (type === 'h') {
        // Horizontal wall
        const x1 = col * cellSize;
        const y1 = row * cellSize;
        const x2 = (col + length) * cellSize;
        const y2 = row * cellSize;
        return (
          <line
            key={`wall-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1e293b"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      } else {
        // Vertical wall
        const x1 = col * cellSize;
        const y1 = row * cellSize;
        const x2 = col * cellSize;
        const y2 = (row + length) * cellSize;
        return (
          <line
            key={`wall-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1e293b"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      }
    });
  };

  // Render collectibles
  const renderCollectibles = () => {
    return collectibles.map((collectible, idx) => {
      const { row, col, order } = collectible;
      const isClicked = clickedCollectibles.has(order);
      const isNext = order === nextExpectedOrder;
      const isLast = order === collectibles.length;
      const hasWrongFeedback = showWrongFeedback?.row === row && showWrongFeedback?.col === col;
      
      const cx = (col + 0.5) * cellSize;
      const cy = (row + 0.5) * cellSize;
      
      return (
        <g key={`collectible-${idx}`}>
          {/* Background circle for highlighting */}
          {isNext && !isClicked && (
            <circle
              cx={cx}
              cy={cy}
              r={cellSize * 0.4}
              fill="rgba(250, 204, 21, 0.3)"
              stroke="#facc15"
              strokeWidth={2}
              className="animate-pulse"
            />
          )}
          {hasWrongFeedback && (
            <circle
              cx={cx}
              cy={cy}
              r={cellSize * 0.4}
              fill="rgba(239, 68, 68, 0.3)"
            />
          )}
          {/* Clickable area */}
          <circle
            cx={cx}
            cy={cy}
            r={cellSize * 0.35}
            fill={isClicked ? 'rgba(34, 197, 94, 0.2)' : 'transparent'}
            stroke="transparent"
            className={!isClicked ? 'cursor-pointer hover:fill-yellow-100' : ''}
            onClick={() => handleCollectibleClick(row, col)}
          />
          {/* Emoji */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={cellSize * 0.5}
            style={{ pointerEvents: 'none' }}
          >
            {isClicked ? '✅' : (hasWrongFeedback ? '❌' : getCollectibleEmoji(collectibleType, isLast))}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Find the Path & Collect Treasures!</h2>
      
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Maze: {currentMaze + 1} / {MAZES_PER_SESSION}</span>
        <span>Collected: {clickedCollectibles.size} / {collectibles.length}</span>
        <span>Wrong clicks: {wrongClicks}</span>
        <span>Config: {mazeConfig.id}</span>
      </div>

      <p className="text-slate-300 text-sm max-w-md text-center">
        Follow the path with your eyes from the {getCharacterEmoji(characterType)} and click the {collectibleType}s in order!
      </p>

      {/* Maze SVG */}
      <div className="relative bg-white rounded-lg p-4 shadow-lg">
        <svg
          width={mazeSize}
          height={mazeSize}
          viewBox={`0 0 ${mazeSize} ${mazeSize}`}
          className="border-2 border-slate-800"
        >
          {/* Background */}
          <rect x={0} y={0} width={mazeSize} height={mazeSize} fill="white" />
          
          {/* Grid lines (light) */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={0}
                y1={i * cellSize}
                x2={mazeSize}
                y2={i * cellSize}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />
              <line
                x1={i * cellSize}
                y1={0}
                x2={i * cellSize}
                y2={mazeSize}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />
            </g>
          ))}
          
          {/* Walls */}
          {renderWalls()}
          
          {/* Collectibles */}
          {renderCollectibles()}
        </svg>
        
        {/* Character (outside maze) */}
        {characterPos && (
          <div
            className="absolute text-3xl"
            style={{
              left: characterPos.col < 0 ? -40 : (characterPos.col >= gridSize ? mazeSize + 20 : characterPos.col * cellSize),
              top: characterPos.row < 0 ? -40 : (characterPos.row >= gridSize ? mazeSize + 20 : characterPos.row * cellSize),
            }}
          >
            {getCharacterEmoji(characterType)}
          </div>
        )}
      </div>

      {isComplete && (
        <div className="text-green-400 text-xl font-bold animate-pulse">
          🎉 Maze Complete! 🎉
        </div>
      )}

      <p className="text-slate-500 text-xs">
        Hint: Click on the items in order (1st, 2nd, 3rd...). The next one has a yellow highlight.
      </p>
    </div>
  );
}
