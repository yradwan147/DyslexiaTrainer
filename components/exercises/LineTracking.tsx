'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps, LineTrackingTrialConfig } from '@/lib/exercises/types';
import { generateLineTrackingConfig, type LineTrackingConfig, type LineItem } from '@/lib/exercises/lineTrackingData';

// 5 unique line puzzles per session
const PUZZLES_PER_SESSION = 5;

// Generate curved path between two points with random-ish control points
function generateCurvedPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number,
  complexity: number = 3
): string {
  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const midX = (startX + endX) / 2;
  const width = endX - startX;
  
  let path = `M ${startX} ${startY}`;
  
  // Generate control points for a smooth curve
  const points: [number, number][] = [[startX, startY]];
  
  for (let i = 1; i <= complexity; i++) {
    const t = i / (complexity + 1);
    const x = startX + t * width;
    // Add vertical variation based on seed
    const yOffset = (seededRandom(i * 100) - 0.5) * 150;
    const y = startY + (endY - startY) * t + yOffset;
    points.push([x, y]);
  }
  
  points.push([endX, endY]);
  
  // Create smooth bezier curve through points
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cpX = (x0 + x1) / 2;
    
    if (i === 1) {
      path += ` Q ${cpX} ${y0} ${x1} ${y1}`;
    } else if (i === points.length - 1) {
      path += ` Q ${cpX} ${y0} ${x1} ${y1}`;
    } else {
      const prevCpX = (points[i - 2][0] + x0) / 2;
      path += ` C ${prevCpX} ${y0} ${cpX} ${y1} ${x1} ${y1}`;
    }
  }
  
  return path;
}

// Generate angular path between two points
function generateAngularPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number
): string {
  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const segments = 4 + Math.floor(seededRandom(1) * 3);
  const width = endX - startX;
  
  let path = `M ${startX} ${startY}`;
  let currentY = startY;
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const x = startX + t * width;
    
    if (i < segments) {
      // Horizontal then vertical
      path += ` L ${x} ${currentY}`;
      const newY = startY + (endY - startY) * t + (seededRandom(i * 50) - 0.5) * 100;
      path += ` L ${x} ${newY}`;
      currentY = newY;
    } else {
      path += ` L ${x} ${currentY}`;
      path += ` L ${endX} ${endY}`;
    }
  }
  
  return path;
}

export function LineTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Get difficulty from config (1-5)
  const difficulty = config.difficulty_level || 1;
  
  // Generate a unique session seed when component mounts
  const sessionSeed = useMemo(() => Date.now() + Math.random() * 1000000, []);
  
  // Pre-generate all puzzles for this session - difficulty affects number of lines
  const sessionPuzzles = useMemo(() => {
    const puzzles: LineTrackingConfig[] = [];
    
    for (let i = 0; i < PUZZLES_PER_SESSION; i++) {
      // Each puzzle is procedurally generated with random items and connections
      puzzles.push(generateLineTrackingConfig(i, sessionSeed + i * 77777, difficulty));
    }
    
    return puzzles;
  }, [sessionSeed, difficulty]);

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [solvedLines, setSolvedLines] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);

  // Get current puzzle configuration
  const lineConfig = sessionPuzzles[currentPuzzle];
  const itemCount = lineConfig.leftItems.length;
  const allSolved = solvedLines.size === itemCount;

  // Reset state when moving to a new puzzle
  useEffect(() => {
    setCurrentLineIndex(0);
    setSolvedLines(new Set());
    setShowFeedback(null);
  }, [currentPuzzle]);

  // Reset everything when exercise restarts
  useEffect(() => {
    setCurrentPuzzle(0);
    setCurrentLineIndex(0);
    setSolvedLines(new Set());
    setWrongAttempts(0);
    setShowFeedback(null);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Find which left item the current right item connects to
  const findCorrectLeftIndex = useCallback((rightIndex: number): number => {
    return lineConfig.connections.findIndex(rightIdx => rightIdx === rightIndex);
  }, [lineConfig.connections]);

  // Advance to next puzzle or complete session
  const advanceToNext = useCallback(() => {
    const nextPuzzle = currentPuzzle + 1;
    
    if (nextPuzzle >= PUZZLES_PER_SESSION) {
      // Session complete!
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({ 
          puzzlesCompleted: PUZZLES_PER_SESSION,
          wrongAttempts
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
  }, [currentPuzzle, wrongAttempts, currentTrialIndex, onTrialComplete]);

  // Handle clicking on a left item
  const handleLeftClick = useCallback((leftIndex: number) => {
    if (solvedLines.has(leftIndex)) return;
    if (showFeedback) return;
    
    // Check if this left item connects to the current right item (where the eye is)
    const correctLeftIndex = findCorrectLeftIndex(currentLineIndex);
    const isCorrect = leftIndex === correctLeftIndex;
    
    setShowFeedback({ index: leftIndex, correct: isCorrect });
    
    setTimeout(() => {
      if (isCorrect) {
        const newSolved = new Set(solvedLines);
        newSolved.add(leftIndex);
        setSolvedLines(newSolved);
        
        // Move eye to next unsolved line
        let nextLine = currentLineIndex + 1;
        while (nextLine < itemCount && newSolved.has(findCorrectLeftIndex(nextLine))) {
          nextLine++;
        }
        
        // If all solved, move to next puzzle
        if (newSolved.size === itemCount) {
          setTimeout(() => advanceToNext(), 800);
        } else if (nextLine < itemCount) {
          setCurrentLineIndex(nextLine);
        }
      } else {
        setWrongAttempts(prev => prev + 1);
      }
      setShowFeedback(null);
    }, 800);
  }, [solvedLines, showFeedback, currentLineIndex, itemCount, findCorrectLeftIndex, advanceToNext]);

  // Render an item (image or text)
  const renderItem = (item: LineItem, size: number = 60) => {
    if (item.type === 'image') {
      return (
        <img 
          src={item.value} 
          alt="" 
          style={{ width: size, height: size, objectFit: 'contain' }}
          onError={(e) => {
            // Fallback to emoji if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    } else {
      // Map font styles to CSS font families
      let fontFamily = 'Arial, sans-serif';
      let fontStyle = 'normal';
      let fontWeight = 'bold';
      
      switch (item.fontStyle) {
        case 'cursive':
          fontFamily = "'Brush Script MT', 'Segoe Script', cursive";
          break;
        case 'serif':
          fontFamily = "Georgia, 'Times New Roman', serif";
          break;
        case 'italic':
          fontFamily = "Georgia, 'Times New Roman', serif";
          fontStyle = 'italic';
          break;
        case 'gothic':
          fontFamily = "'Old English Text MT', 'UnifrakturMaguntia', 'Luminari', fantasy";
          break;
        case 'handwritten':
          fontFamily = "'Comic Sans MS', 'Marker Felt', 'Bradley Hand', cursive";
          break;
        case 'normal':
        default:
          fontFamily = "Arial, 'Helvetica Neue', sans-serif";
          break;
      }
      
      return (
        <span 
          style={{ 
            fontSize: size * 0.8, 
            fontFamily,
            color: item.color || '#333',
            fontStyle: fontStyle as React.CSSProperties['fontStyle'],
            fontWeight,
          }}
        >
          {item.value}
        </span>
      );
    }
  };

  // Calculate dimensions
  const width = 700;
  const height = 400;
  const leftMargin = 80;
  const rightMargin = 80;
  const lineAreaWidth = width - leftMargin - rightMargin;
  const itemSpacing = height / (itemCount + 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">{lineConfig.title}</h2>
      
      {/* Progress and difficulty indicator */}
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Puzzle {currentPuzzle + 1} of {PUZZLES_PER_SESSION}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty} • {itemCount} lines
        </span>
      </div>
      
      <div className="relative" style={{ width, height }}>
        {/* SVG for lines */}
        <svg 
          ref={svgRef}
          className="absolute inset-0" 
          viewBox={`0 0 ${width} ${height}`}
          style={{ overflow: 'visible' }}
        >
          {/* Draw lines from left to right items */}
          {lineConfig.leftItems.map((_, leftIdx) => {
            const rightIdx = lineConfig.connections[leftIdx];
            const leftY = (leftIdx + 1) * itemSpacing;
            const rightY = (rightIdx + 1) * itemSpacing;
            
            const startX = leftMargin;
            const endX = width - rightMargin;
            
            // Generate path based on line style
            let pathD: string;
            const seed = lineConfig.id * 100 + leftIdx * 10 + rightIdx;
            
            if (lineConfig.lineStyle.type === 'curved') {
              pathD = generateCurvedPath(startX, leftY, endX, rightY, seed);
            } else {
              pathD = generateAngularPath(startX, leftY, endX, rightY, seed);
            }
            
            const isSolved = solvedLines.has(leftIdx);
            
            return (
              <path
                key={`line-${leftIdx}`}
                d={pathD}
                fill="none"
                stroke={isSolved ? '#22c55e' : lineConfig.lineColor}
                strokeWidth={lineConfig.lineStyle.strokeWidth}
                strokeDasharray={lineConfig.lineStyle.dashed ? '8,4' : 'none'}
                opacity={isSolved ? 0.5 : 1}
              />
            );
          })}
        </svg>

        {/* Left items (clickable) */}
        {lineConfig.leftItems.map((item, idx) => {
          const y = (idx + 1) * itemSpacing - 30;
          const isSolved = solvedLines.has(idx);
          const feedback = showFeedback?.index === idx ? showFeedback : null;
          
          return (
            <button
              key={`left-${idx}`}
              className={`absolute flex items-center justify-center w-16 h-16 rounded-full transition-all
                ${isSolved ? 'bg-green-200 ring-4 ring-green-500' : 'bg-white hover:bg-blue-50'}
                ${feedback?.correct === true ? 'ring-4 ring-green-500 bg-green-100' : ''}
                ${feedback?.correct === false ? 'ring-4 ring-red-500 bg-red-100 animate-shake' : ''}
              `}
              style={{ left: 0, top: y }}
              onClick={() => handleLeftClick(idx)}
              disabled={isSolved || !!showFeedback}
            >
              {renderItem(item)}
              {isSolved && (
                <span className="absolute -top-1 -right-1 text-green-600 text-xl">✓</span>
              )}
            </button>
          );
        })}

        {/* Right items with eye indicator */}
        {lineConfig.rightItems.map((item, idx) => {
          const y = (idx + 1) * itemSpacing - 30;
          const isCurrentEye = idx === currentLineIndex;
          const isSolved = solvedLines.has(findCorrectLeftIndex(idx));
          
          return (
            <div
              key={`right-${idx}`}
              className={`absolute flex items-center justify-center w-16 h-16 rounded-full
                ${isSolved ? 'bg-green-200' : 'bg-white'}
              `}
              style={{ right: 0, top: y }}
            >
              {renderItem(item)}
              {isCurrentEye && !allSolved && (
                <span className="absolute -top-2 -left-2 text-3xl animate-pulse">👁️</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="flex gap-8 text-white text-lg">
        <span>Matched: {solvedLines.size} / {itemCount}</span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Follow the line from the 👁️ eye on the right and click the matching item on the left
      </p>
    </div>
  );
}
