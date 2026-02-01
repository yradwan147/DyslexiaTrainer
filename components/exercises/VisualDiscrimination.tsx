'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  generateVisualDiscriminationConfig,
  type CompositeShape,
  type ShapeElement,
  type VisualDiscriminationPairsConfig
} from '@/lib/exercises/visualDiscriminationPairsData';

// 5 unique puzzles per session
const PUZZLES_PER_SESSION = 5;

interface OptionState {
  eliminated: boolean;
  selected: boolean;
}

// Render a single shape element
function renderShapeElement(element: ShapeElement, size: number, key: string) {
  const scale = size / 100;
  const cx = element.x * scale;
  const cy = element.y * scale;
  const elemSize = element.size * scale;
  const elemHeight = element.height ? element.height * scale : elemSize * 0.25;
  
  switch (element.type) {
    case 'circle':
      return (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={elemSize / 2}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    
    case 'triangle': {
      const height = elemSize * 0.866;
      const rad = (element.rotation * Math.PI) / 180;
      const points = [
        [0, -height / 2],
        [-elemSize / 2, height / 2],
        [elemSize / 2, height / 2],
      ].map(([x, y]) => [
        x * Math.cos(rad) - y * Math.sin(rad) + cx,
        x * Math.sin(rad) + y * Math.cos(rad) + cy,
      ]);
      return (
        <polygon
          key={key}
          points={points.map(p => p.join(',')).join(' ')}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    case 'rectangle': {
      const rectW = elemSize;
      const rectH = elemHeight;
      return (
        <g key={key} transform={`rotate(${element.rotation} ${cx} ${cy})`}>
          <rect
            x={cx - rectW / 2}
            y={cy - rectH / 2}
            width={rectW}
            height={rectH}
            fill="none"
            stroke="#333"
            strokeWidth={3}
          />
        </g>
      );
    }
    
    case 'diamond': {
      const half = elemSize / 2;
      const points = [
        [cx, cy - half],
        [cx + half, cy],
        [cx, cy + half],
        [cx - half, cy],
      ];
      return (
        <polygon
          key={key}
          points={points.map(p => p.join(',')).join(' ')}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    case 'arc': {
      const radius = elemSize / 2;
      const startAngle = element.rotation;
      const endAngle = element.rotation + 180;
      const start = {
        x: cx + radius * Math.cos((startAngle * Math.PI) / 180),
        y: cy + radius * Math.sin((startAngle * Math.PI) / 180),
      };
      const end = {
        x: cx + radius * Math.cos((endAngle * Math.PI) / 180),
        y: cy + radius * Math.sin((endAngle * Math.PI) / 180),
      };
      return (
        <path
          key={key}
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    case 'pentagon': {
      const radius = elemSize / 2;
      const points = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * (Math.PI / 180);
        points.push([
          cx + radius * Math.cos(angle),
          cy + radius * Math.sin(angle),
        ]);
      }
      return (
        <polygon
          key={key}
          points={points.map(p => p.join(',')).join(' ')}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    case 'octagon': {
      const radius = elemSize / 2;
      const points = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * 45 - 22.5) * (Math.PI / 180);
        points.push([
          cx + radius * Math.cos(angle),
          cy + radius * Math.sin(angle),
        ]);
      }
      return (
        <polygon
          key={key}
          points={points.map(p => p.join(',')).join(' ')}
          fill="none"
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    case 'arrow': {
      const arrowLen = elemSize;
      const headSize = arrowLen * 0.5;
      const rad = (element.rotation * Math.PI) / 180;
      
      const shaftStart = [0, arrowLen / 2];
      const shaftEnd = [0, -arrowLen / 2 + headSize * 0.3];
      const headLeft = [-headSize / 2, -arrowLen / 2 + headSize];
      const headRight = [headSize / 2, -arrowLen / 2 + headSize];
      const headTip = [0, -arrowLen / 2];
      
      const transform = ([x, y]: number[]) => [
        x * Math.cos(rad) - y * Math.sin(rad) + cx,
        x * Math.sin(rad) + y * Math.cos(rad) + cy,
      ];
      
      const [sx1, sy1] = transform(shaftStart);
      const [sx2, sy2] = transform(shaftEnd);
      const [hx1, hy1] = transform(headLeft);
      const [hx2, hy2] = transform(headRight);
      const [tx, ty] = transform(headTip);
      
      return (
        <g key={key}>
          <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#333" strokeWidth={3} />
          <polygon
            points={`${tx},${ty} ${hx1},${hy1} ${hx2},${hy2}`}
            fill="#333"
            stroke="#333"
            strokeWidth={1}
          />
        </g>
      );
    }
    
    case 'line': {
      const lineLen = elemSize;
      const rad = (element.rotation * Math.PI) / 180;
      const dx = (lineLen / 2) * Math.cos(rad + Math.PI / 2);
      const dy = (lineLen / 2) * Math.sin(rad + Math.PI / 2);
      return (
        <line
          key={key}
          x1={cx - dx}
          y1={cy - dy}
          x2={cx + dx}
          y2={cy + dy}
          stroke="#333"
          strokeWidth={3}
        />
      );
    }
    
    default:
      return null;
  }
}

// Component to render a composite shape
function ShapeDisplay({ shape, size = 120 }: { shape: CompositeShape; size?: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shape.elements.map((element, idx) => 
        renderShapeElement(element, size, `elem-${idx}`)
      )}
    </svg>
  );
}

export function VisualDiscrimination({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Get difficulty from config (1-5)
  const difficulty = config.difficulty_level || 1;
  
  // Generate a unique session seed when component mounts
  const sessionSeed = useMemo(() => Date.now() + Math.random() * 1000000, []);
  
  // Pre-generate all puzzles for this session - difficulty affects subtlety of differences
  const sessionPuzzles = useMemo(() => {
    const puzzles: VisualDiscriminationPairsConfig[] = [];
    
    for (let i = 0; i < PUZZLES_PER_SESSION; i++) {
      // Each puzzle is procedurally generated with random shape variations
      puzzles.push(generateVisualDiscriminationConfig(i, sessionSeed + i * 99999, difficulty));
    }
    
    return puzzles;
  }, [sessionSeed, difficulty]);

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [optionStates, setOptionStates] = useState<OptionState[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Get current puzzle configuration
  const puzzleConfig = sessionPuzzles[currentPuzzle];

  // Reset option states when moving to a new puzzle
  useEffect(() => {
    setOptionStates(puzzleConfig.options.map(() => ({ eliminated: false, selected: false })));
    setShowSuccess(false);
  }, [currentPuzzle, puzzleConfig.options]);

  // Reset everything when exercise restarts
  useEffect(() => {
    setCurrentPuzzle(0);
    setOptionStates(puzzleConfig.options.map(() => ({ eliminated: false, selected: false })));
    setShowSuccess(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Advance to next puzzle or complete session
  const advanceToNext = useCallback(() => {
    const nextPuzzle = currentPuzzle + 1;
    
    if (nextPuzzle >= PUZZLES_PER_SESSION) {
      // Session complete!
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({ 
          puzzlesCompleted: PUZZLES_PER_SESSION
        }),
        response_time_ms: Date.now() - startTimeRef.current,
        is_correct: true,
        is_timed_out: false,
        is_skipped: false,
        started_at: new Date(startTimeRef.current).toISOString(),
        responded_at: new Date().toISOString(),
      });
    } else {
      // Next puzzle
      setCurrentPuzzle(nextPuzzle);
    }
  }, [currentPuzzle, currentTrialIndex, onTrialComplete]);

  // Handle option click
  const handleOptionClick = useCallback((index: number) => {
    if (optionStates[index]?.eliminated || showSuccess) return;

    const isCorrect = index === puzzleConfig.correctIndex;

    if (isCorrect) {
      // Show success and advance
      setShowSuccess(true);
      setOptionStates(prev => prev.map((s, i) => 
        i === index ? { ...s, selected: true } : s
      ));

      setTimeout(() => advanceToNext(), 1000);
    } else {
      // Cross out wrong option
      setOptionStates(prev => prev.map((s, i) => 
        i === index ? { ...s, eliminated: true } : s
      ));
    }
  }, [optionStates, showSuccess, puzzleConfig.correctIndex, advanceToNext]);

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-white text-2xl font-bold">Find the Matching Shape</h2>
      
      {/* Progress and difficulty indicator */}
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Puzzle {currentPuzzle + 1} of {PUZZLES_PER_SESSION}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty}
        </span>
      </div>

      {/* Target shape */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <p className="text-slate-500 text-sm text-center mb-2">Find this shape:</p>
        <ShapeDisplay shape={puzzleConfig.target} size={150} />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-4">
        {puzzleConfig.options.map((option, index) => {
          const state = optionStates[index] || { eliminated: false, selected: false };
          
          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={state.eliminated || showSuccess}
              className={`
                relative bg-white rounded-xl p-4 shadow-lg transition-all
                ${state.selected ? 'ring-4 ring-green-500 bg-green-50' : ''}
                ${state.eliminated ? 'opacity-50' : 'hover:scale-105'}
                ${!state.eliminated && !showSuccess ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <ShapeDisplay shape={option} size={100} />
              
              {/* Crossed out indicator */}
              {state.eliminated && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-red-500 text-6xl font-bold">✗</span>
                </div>
              )}
              
              {/* Correct indicator */}
              {state.selected && (
                <div className="absolute -top-2 -right-2">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
              )}
              
              {/* Option number */}
              <div className="absolute bottom-1 right-2 text-slate-400 text-sm">
                {index + 1}
              </div>
            </button>
          );
        })}
      </div>

      {showSuccess && (
        <div className="text-green-400 text-xl font-bold animate-pulse">
          🎉 Correct! 🎉
        </div>
      )}
    </div>
  );
}
