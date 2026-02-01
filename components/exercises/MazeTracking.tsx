'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  generateMazeConfig,
  type MazeConfig,
  getCharacterEmoji,
  getCollectibleEmoji 
} from '@/lib/exercises/mazeTrackingData';

// 5 unique mazes per session
const MAZES_PER_SESSION = 5;

export function MazeTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Get difficulty from config (1-5)
  const difficulty = config.difficulty_level || 1;
  
  // Generate a unique session seed when component mounts
  const sessionSeed = useMemo(() => Date.now() + Math.random() * 1000000, []);
  
  // Pre-generate all mazes for this session - difficulty affects size and collectibles
  const sessionMazes = useMemo(() => {
    const mazes: MazeConfig[] = [];
    
    for (let i = 0; i < MAZES_PER_SESSION; i++) {
      // Each maze is procedurally generated with random walls and collectibles
      mazes.push(generateMazeConfig(i, sessionSeed + i * 54321, difficulty));
    }
    
    return mazes;
  }, [sessionSeed, difficulty]);

  const [currentMaze, setCurrentMaze] = useState(0);
  const [clickedCollectibles, setClickedCollectibles] = useState<Set<number>>(new Set());
  const [nextExpectedOrder, setNextExpectedOrder] = useState(1);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Get current maze configuration
  const mazeConfig = sessionMazes[currentMaze];
  const { gridSize, walls, collectibles, characterType, characterPosition, collectibleType } = mazeConfig;
  
  // Calculate cell size based on grid size
  const mazeSize = 450;
  const cellSize = mazeSize / gridSize;

  // Reset state when moving to a new maze
  useEffect(() => {
    setClickedCollectibles(new Set());
    setNextExpectedOrder(1);
    setShowWrongFeedback(null);
    setIsComplete(false);
  }, [currentMaze]);

  // Reset everything when exercise restarts
  useEffect(() => {
    setCurrentMaze(0);
    setClickedCollectibles(new Set());
    setNextExpectedOrder(1);
    setWrongClicks(0);
    setShowWrongFeedback(null);
    setIsComplete(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Find collectible at position
  const getCollectibleAt = useCallback((row: number, col: number) => {
    return collectibles.find(c => c.row === row && c.col === col);
  }, [collectibles]);

  // Advance to next maze or complete session
  const advanceToNext = useCallback(() => {
    const nextMaze = currentMaze + 1;
    
    if (nextMaze >= MAZES_PER_SESSION) {
      // Session complete!
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({ 
          mazesCompleted: MAZES_PER_SESSION,
          wrongClicks
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
  }, [currentMaze, wrongClicks, currentTrialIndex, onTrialComplete]);

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
        setTimeout(() => advanceToNext(), 1000);
      }
    } else {
      // Wrong order
      setWrongClicks(prev => prev + 1);
      setShowWrongFeedback({ row, col });
      setTimeout(() => setShowWrongFeedback(null), 500);
    }
  }, [isComplete, getCollectibleAt, clickedCollectibles, nextExpectedOrder, collectibles.length, advanceToNext]);

  // Get character start position based on characterPosition
  const getCharacterPosition = () => {
    switch (characterPosition) {
      case 'top-left':
        return { x: -cellSize * 0.8, y: cellSize * 0.5 };
      case 'left':
        return { x: -cellSize * 0.8, y: mazeSize / 2 };
      case 'bottom-right':
        return { x: mazeSize + cellSize * 0.3, y: mazeSize - cellSize * 0.5 };
      default:
        return { x: -cellSize * 0.8, y: cellSize * 0.5 };
    }
  };

  const charPos = getCharacterPosition();

  // Render wall segments as SVG lines
  const renderWalls = () => {
    return walls.map((wall, idx) => {
      const { type, row, col, length } = wall;
      
      if (type === 'h') {
        // Horizontal wall
        const x1 = col * cellSize;
        const y1 = row * cellSize;
        const x2 = (col + length) * cellSize;
        const y2 = y1;
        return (
          <line
            key={`wall-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      } else {
        // Vertical wall
        const x1 = col * cellSize;
        const y1 = row * cellSize;
        const x2 = x1;
        const y2 = (row + length) * cellSize;
        return (
          <line
            key={`wall-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      }
    });
  };

  // Render collectibles
  const renderCollectibles = () => {
    return collectibles.map((collectible) => {
      const { row, col, order } = collectible;
      const cx = (col + 0.5) * cellSize;
      const cy = (row + 0.5) * cellSize;
      const isCollected = clickedCollectibles.has(order);
      const isNext = order === nextExpectedOrder;
      const isWrongClick = showWrongFeedback?.row === row && showWrongFeedback?.col === col;
      const isLast = order === collectibles.length;

      return (
        <g key={`collectible-${order}`}>
          {/* Highlight next collectible */}
          {isNext && !isCollected && (
            <circle
              cx={cx}
              cy={cy}
              r={cellSize * 0.4}
              fill="rgba(34, 197, 94, 0.3)"
              className="animate-pulse"
            />
          )}
          
          {/* Wrong click feedback */}
          {isWrongClick && (
            <circle
              cx={cx}
              cy={cy}
              r={cellSize * 0.4}
              fill="rgba(239, 68, 68, 0.5)"
            />
          )}
          
          {/* Collectible button */}
          <circle
            cx={cx}
            cy={cy}
            r={cellSize * 0.35}
            fill={isCollected ? '#86efac' : '#fef3c7'}
            stroke={isCollected ? '#22c55e' : '#f59e0b'}
            strokeWidth="2"
            style={{ cursor: isCollected ? 'default' : 'pointer' }}
            onClick={() => handleCollectibleClick(row, col)}
          />
          
          {/* Collectible emoji */}
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontSize={cellSize * 0.35}
            style={{ pointerEvents: 'none' }}
          >
            {isCollected ? '✓' : getCollectibleEmoji(collectibleType, isLast)}
          </text>
          
          {/* Order number */}
          <text
            x={cx}
            y={cy - cellSize * 0.25}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
            style={{ pointerEvents: 'none' }}
          >
            {order}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Collect the Treasures!</h2>
      
      {/* Progress and difficulty indicator */}
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Maze {currentMaze + 1} of {MAZES_PER_SESSION}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty} • {gridSize}×{gridSize} maze
        </span>
      </div>

      <p className="text-slate-400 text-sm">
        Click the items in order (1, 2, 3...)
      </p>

      {/* Maze container */}
      <div className="relative bg-white rounded-2xl p-4 shadow-lg">
        <svg 
          width={mazeSize + cellSize} 
          height={mazeSize + cellSize}
          viewBox={`${-cellSize * 0.5} ${-cellSize * 0.5} ${mazeSize + cellSize} ${mazeSize + cellSize}`}
        >
          {/* Background grid */}
          <rect x="0" y="0" width={mazeSize} height={mazeSize} fill="#f8fafc" />
          
          {/* Walls */}
          {renderWalls()}
          
          {/* Collectibles */}
          {renderCollectibles()}
          
          {/* Character */}
          {characterType !== 'none' && (
            <text
              x={charPos.x}
              y={charPos.y}
              fontSize={cellSize * 0.6}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {getCharacterEmoji(characterType)}
            </text>
          )}
        </svg>
      </div>

      {/* Status */}
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Collected: {clickedCollectibles.size} / {collectibles.length}</span>
      </div>

      {isComplete && (
        <div className="text-green-400 text-xl font-bold animate-pulse">
          🎉 Maze Complete! 🎉
        </div>
      )}
    </div>
  );
}
