'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps, LineTrackingTrialConfig } from '@/lib/exercises/types';
import { LINE_TRACKING_CONFIGS, type LineTrackingConfig, type LineItem } from '@/lib/exercises/lineTrackingData';

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

const CONFIGS_PER_SESSION = 5;

export function LineTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [solvedLines, setSolvedLines] = useState<Set<number>>(new Set());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const [currentConfigNum, setCurrentConfigNum] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);

  const trial = config.trials[currentTrialIndex] as LineTrackingTrialConfig;
  
  // Get the line tracking configuration - each set uses a DIFFERENT configuration
  const configIndex = currentConfigNum % LINE_TRACKING_CONFIGS.length;
  const lineConfig = LINE_TRACKING_CONFIGS[configIndex];
  
  const itemCount = lineConfig.leftItems.length;
  const allSolved = solvedLines.size === itemCount;

  // Reset on config change
  useEffect(() => {
    setCurrentLineIndex(0);
    setSolvedLines(new Set());
    setShowFeedback(null);
  }, [currentConfigNum]);

  // Reset everything on new trial
  useEffect(() => {
    setCurrentLineIndex(0);
    setSolvedLines(new Set());
    setWrongAttempts(0);
    setShowFeedback(null);
    setCurrentConfigNum(0);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Find which left item the current right item connects to
  const findCorrectLeftIndex = useCallback((rightIndex: number): number => {
    return lineConfig.connections.findIndex(rightIdx => rightIdx === rightIndex);
  }, [lineConfig.connections]);

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
        
        // If all solved in this config, move to next config or complete
        if (newSolved.size === itemCount) {
          const nextConfig = currentConfigNum + 1;
          
          if (nextConfig >= CONFIGS_PER_SESSION) {
            // Session complete
            onTrialComplete({
              trial_index: currentTrialIndex,
              user_response: JSON.stringify({ 
                configsCompleted: nextConfig, 
                attempts: wrongAttempts,
                configId: lineConfig.id
              }),
              response_time_ms: Date.now() - startTimeRef.current,
              is_correct: true,
              is_timed_out: false,
              is_skipped: false,
              started_at: new Date(startTimeRef.current).toISOString(),
              responded_at: new Date().toISOString(),
            });
          } else {
            // Next config
            setCurrentConfigNum(nextConfig);
          }
        } else if (nextLine < itemCount) {
          setCurrentLineIndex(nextLine);
        }
      } else {
        setWrongAttempts(prev => prev + 1);
      }
      setShowFeedback(null);
    }, 800);
  }, [solvedLines, showFeedback, currentLineIndex, itemCount, findCorrectLeftIndex, wrongAttempts, currentTrialIndex, currentConfigNum, lineConfig.id, onTrialComplete]);

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
          // Gothic/Blackletter font - using Old English or similar
          fontFamily = "'Old English Text MT', 'UnifrakturMaguntia', 'Luminari', fantasy";
          break;
        case 'handwritten':
          // Handwritten/brush font
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

  const width = 900;
  const height = 500;
  const leftX = 80;
  const rightX = width - 80;
  const itemSpacing = height / (itemCount + 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">{lineConfig.title}</h2>
      <p className="text-slate-400 text-sm">
        Level {lineConfig.level} - Exercise {lineConfig.exercise}
      </p>
      
      <div className="relative" style={{ width, height }}>
        {/* SVG for lines */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="absolute inset-0"
          style={{ background: '#f8fafc' }}
        >
          {/* Draw all connection lines */}
          {lineConfig.connections.map((rightIndex, leftIndex) => {
            const leftY = (leftIndex + 1) * itemSpacing;
            const rightY = (rightIndex + 1) * itemSpacing;
            
            const pathD = lineConfig.lineStyle.type === 'angular'
              ? generateAngularPath(leftX + 40, leftY, rightX - 40, rightY, leftIndex * 1000 + rightIndex)
              : generateCurvedPath(leftX + 40, leftY, rightX - 40, rightY, leftIndex * 1000 + rightIndex, 4);
            
            const isSolved = solvedLines.has(leftIndex);
            
            return (
              <path
                key={`line-${leftIndex}`}
                d={pathD}
                stroke={isSolved ? '#22c55e' : lineConfig.lineColor}
                strokeWidth={lineConfig.lineStyle.strokeWidth}
                strokeDasharray={lineConfig.lineStyle.dashed ? '8,8' : 'none'}
                fill="none"
                opacity={isSolved ? 0.5 : 1}
              />
            );
          })}
        </svg>

        {/* Left items (clickable) */}
        {lineConfig.leftItems.map((item, index) => {
          const y = (index + 1) * itemSpacing;
          const isSolved = solvedLines.has(index);
          const hasFeedback = showFeedback?.index === index;
          
          return (
            <button
              key={`left-${index}`}
              onClick={() => handleLeftClick(index)}
              disabled={isSolved}
              className={`
                absolute flex items-center justify-center
                w-16 h-16 rounded-xl transition-all duration-200
                ${isSolved 
                  ? 'bg-green-100 border-2 border-green-500 cursor-default' 
                  : 'bg-white border-2 border-slate-300 hover:border-primary-500 hover:shadow-lg cursor-pointer'
                }
                ${hasFeedback && showFeedback.correct ? 'bg-green-200 border-green-500' : ''}
                ${hasFeedback && !showFeedback.correct ? 'bg-red-200 border-red-500' : ''}
              `}
              style={{
                left: leftX - 32,
                top: y - 32,
              }}
            >
              {renderItem(item, 48)}
              {isSolved && (
                <span className="absolute -top-2 -right-2 text-xl">✓</span>
              )}
              {hasFeedback && !showFeedback.correct && (
                <span className="absolute inset-0 flex items-center justify-center text-4xl text-red-500">✗</span>
              )}
            </button>
          );
        })}

        {/* Right items (with eye indicator) */}
        {lineConfig.rightItems.map((item, index) => {
          const y = (index + 1) * itemSpacing;
          const isCurrentTarget = index === currentLineIndex && !allSolved;
          const correspondingLeftSolved = solvedLines.has(findCorrectLeftIndex(index));
          
          return (
            <div
              key={`right-${index}`}
              className={`
                absolute flex items-center justify-center
                w-16 h-16 rounded-xl transition-all duration-200
                ${correspondingLeftSolved 
                  ? 'bg-green-100 border-2 border-green-500' 
                  : 'bg-white border-2 border-slate-300'
                }
                ${isCurrentTarget ? 'ring-4 ring-primary-400 ring-offset-2' : ''}
              `}
              style={{
                left: rightX - 32,
                top: y - 32,
              }}
            >
              {renderItem(item, 48)}
              {isCurrentTarget && (
                <span className="absolute -left-8 text-2xl">👁️</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-8 text-white text-lg">
        <span>Set: {currentConfigNum + 1} / {CONFIGS_PER_SESSION}</span>
        <span>Solved: {solvedLines.size} / {itemCount}</span>
        <span className="text-slate-400">Wrong attempts: {wrongAttempts}</span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Follow the line from the 👁️ eye on the right and click the matching item on the left
      </p>
    </div>
  );
}
