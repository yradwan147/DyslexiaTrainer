'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  VISUAL_DISCRIMINATION_PAIRS_CONFIGS,
  getDiscriminationConfig,
  type CompositeShape,
  type ShapeElement 
} from '@/lib/exercises/visualDiscriminationPairsData';

// Generate a session seed for reproducible but unique puzzles
function getSessionSeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

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
      // Diamond is a rotated square
      const half = elemSize / 2;
      const points = [
        [cx, cy - half], // Top
        [cx + half, cy], // Right
        [cx, cy + half], // Bottom
        [cx - half, cy], // Left
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
      
      // Arrow shaft
      const shaftStart = [0, arrowLen / 2];
      const shaftEnd = [0, -arrowLen / 2 + headSize * 0.3];
      
      // Arrow head
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
  const [optionStates, setOptionStates] = useState<OptionState[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Items per session - progress through different configurations
  const ITEMS_PER_SESSION = 4;
  const [sessionSeed] = useState(() => getSessionSeed() + currentTrialIndex * 100);
  
  // Get configuration - uses procedural generation for variety
  const discConfig = getDiscriminationConfig(currentItem, sessionSeed);

  // Reset on trial change
  useEffect(() => {
    setOptionStates(discConfig.options.map(() => ({ eliminated: false, selected: false })));
    setAttempts(0);
    setShowSuccess(false);
    setCurrentItem(0);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex, discConfig]);

  // Handle option click
  const handleOptionClick = useCallback((index: number) => {
    if (optionStates[index]?.eliminated || showSuccess) return;

    const isCorrect = index === discConfig.correctIndex;
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      // Show success and advance
      setShowSuccess(true);
      setOptionStates(prev => prev.map((s, i) => 
        i === index ? { ...s, selected: true } : s
      ));

      setTimeout(() => {
        const newItem = currentItem + 1;
        
        if (newItem >= ITEMS_PER_SESSION) {
          // Session complete
          onTrialComplete({
            trial_index: currentTrialIndex,
            user_response: JSON.stringify({ items: ITEMS_PER_SESSION, attempts }),
            response_time_ms: Date.now() - startTimeRef.current,
            is_correct: true,
            is_timed_out: false,
            is_skipped: false,
            started_at: new Date(startTimeRef.current).toISOString(),
            responded_at: new Date().toISOString(),
          });
        } else {
          // Next item - reset states
          setCurrentItem(newItem);
          setShowSuccess(false);
          setOptionStates(discConfig.options.map(() => ({ eliminated: false, selected: false })));
          startTimeRef.current = Date.now();
        }
      }, 1000);
    } else {
      // Cross out wrong option
      setOptionStates(prev => prev.map((s, i) => 
        i === index ? { ...s, eliminated: true } : s
      ));
    }
  }, [optionStates, showSuccess, discConfig, currentItem, attempts, currentTrialIndex, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-white text-2xl font-bold">Find the Matching Shape</h2>
      
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Level: {discConfig.id} / 15</span>
        <span>Item: {currentItem + 1} / {ITEMS_PER_SESSION}</span>
        <span>Attempts: {attempts}</span>
      </div>

      <p className="text-slate-300 text-sm">{discConfig.description}</p>

      {/* Target shape at top */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-400 text-sm">Target:</span>
        <div className="bg-slate-200 rounded-2xl p-4 shadow-lg">
          <ShapeDisplay shape={discConfig.target} size={150} />
        </div>
      </div>

      {/* Options below */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-400 text-sm">Find the exact match:</span>
        <div className="flex gap-4 flex-wrap justify-center">
          {discConfig.options.map((option, index) => {
            const state = optionStates[index] || { eliminated: false, selected: false };
            
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={state.eliminated || showSuccess}
                className={`
                  relative bg-slate-200 rounded-2xl p-3 transition-all duration-200
                  ${!state.eliminated && !showSuccess ? 'hover:bg-slate-300 hover:shadow-lg cursor-pointer' : ''}
                  ${state.eliminated ? 'opacity-50' : ''}
                  ${state.selected ? 'ring-4 ring-green-500' : ''}
                `}
              >
                <ShapeDisplay shape={option} size={120} />
                
                {/* Eliminated overlay */}
                {state.eliminated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl text-red-500 font-bold">✗</span>
                  </div>
                )}
                
                {/* Correct overlay */}
                {state.selected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
                    <span className="text-6xl text-green-500">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-slate-400 text-sm">
        Click on the shape that exactly matches the target above
      </p>
    </div>
  );
}
