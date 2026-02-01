'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  generateVisualSearchConfig,
  getSilhouetteAsset,
  getSilhouetteEmoji,
  type VisualSearchConfig 
} from '@/lib/exercises/visualSearchData';

const TASKS_PER_SESSION = 10;
const MAX_ATTEMPTS = 20;

// Generate a session seed for reproducible but unique puzzles
function getSessionSeed(): number {
  // Use current date as base seed so puzzles change daily
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Silhouette display component
function Silhouette({ name, size }: { name: string; size: number }) {
  const assetPath = getSilhouetteAsset(name);
  const emoji = getSilhouetteEmoji(name);
  
  if (assetPath) {
    return (
      <Image
        src={assetPath}
        alt={name}
        width={size}
        height={size}
        className="object-contain"
        style={{ filter: 'brightness(0)' }} // Ensure pure black
      />
    );
  }
  
  // Fallback to emoji
  return (
    <span style={{ fontSize: size * 0.7 }}>{emoji}</span>
  );
}

export function VisualSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [foundItems, setFoundItems] = useState<Set<string>>(new Set());
  const [wrongClicks, setWrongClicks] = useState<Set<string>>(new Set());
  const [currentTask, setCurrentTask] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionSeed] = useState(() => getSessionSeed() + currentTrialIndex * 100);
  const startTimeRef = useRef<number>(Date.now());

  // Generate unique configuration for each task
  // Uses procedural generation with session seed for variety
  const searchConfig = generateVisualSearchConfig(currentTask, sessionSeed);

  const { gridSize, gridRows, mainItem, differentItems, totalDifferent, description } = searchConfig;
  const actualRows = gridRows || gridSize;

  // Reset on trial/task change
  useEffect(() => {
    setFoundItems(new Set());
    setWrongClicks(new Set());
    setShowSuccess(false);
  }, [currentTask]);

  // Reset everything on new trial
  useEffect(() => {
    setFoundItems(new Set());
    setWrongClicks(new Set());
    setCurrentTask(0);
    setTotalAttempts(0);
    setShowSuccess(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Check if a position has a different item
  const getDifferentItem = useCallback((row: number, col: number) => {
    return differentItems.find(d => d.row === row && d.col === col);
  }, [differentItems]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (showSuccess) return;
    
    const key = `${row}-${col}`;
    if (foundItems.has(key) || wrongClicks.has(key)) return;

    setTotalAttempts(prev => prev + 1);

    // Special case: if no different items (level 10), any click completes
    if (totalDifferent === 0) {
      setShowSuccess(true);
      setTimeout(() => {
        const nextTask = currentTask + 1;
        if (nextTask >= TASKS_PER_SESSION) {
          onTrialComplete({
            trial_index: currentTrialIndex,
            user_response: JSON.stringify({ 
              tasksCompleted: nextTask,
              totalAttempts: totalAttempts + 1,
              configId: searchConfig.id 
            }),
            response_time_ms: Date.now() - startTimeRef.current,
            is_correct: true,
            is_timed_out: false,
            is_skipped: false,
            started_at: new Date(startTimeRef.current).toISOString(),
            responded_at: new Date().toISOString(),
          });
        } else {
          setCurrentTask(nextTask);
          setFoundItems(new Set());
          setWrongClicks(new Set());
          setShowSuccess(false);
        }
      }, 1000);
      return;
    }

    const different = getDifferentItem(row, col);
    
    if (different) {
      // Found a different item!
      const newFound = new Set(foundItems);
      newFound.add(key);
      setFoundItems(newFound);

      // Check if all found
      if (newFound.size === totalDifferent) {
        setShowSuccess(true);
        
        setTimeout(() => {
          const nextTask = currentTask + 1;
          
          if (nextTask >= TASKS_PER_SESSION || totalAttempts >= MAX_ATTEMPTS) {
            // Session complete
            onTrialComplete({
              trial_index: currentTrialIndex,
              user_response: JSON.stringify({ 
                tasksCompleted: nextTask,
                totalAttempts: totalAttempts + 1,
                level 
              }),
              response_time_ms: Date.now() - startTimeRef.current,
              is_correct: true,
              is_timed_out: false,
              is_skipped: false,
              started_at: new Date(startTimeRef.current).toISOString(),
              responded_at: new Date().toISOString(),
            });
          } else {
            // Next task
            setCurrentTask(nextTask);
            setFoundItems(new Set());
            setWrongClicks(new Set());
            setShowSuccess(false);
          }
        }, 1000);
      }
    } else {
      // Wrong click
      const newWrong = new Set(wrongClicks);
      newWrong.add(key);
      setWrongClicks(newWrong);

      // Check max attempts
      if (totalAttempts + 1 >= MAX_ATTEMPTS) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify({ 
            tasksCompleted: currentTask,
            totalAttempts: totalAttempts + 1,
            level 
          }),
          response_time_ms: Date.now() - startTimeRef.current,
          is_correct: false,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      }
    }
  }, [showSuccess, foundItems, wrongClicks, getDifferentItem, totalDifferent, currentTask, totalAttempts, currentTrialIndex, searchConfig.id, onTrialComplete]);

  // Generate grid
  const renderGrid = () => {
    const cells = [];
    const maxGridDimension = Math.max(gridSize, actualRows);
    const cellSize = Math.min(70, 480 / maxGridDimension);

    for (let row = 0; row < actualRows; row++) {
      for (let col = 0; col < gridSize; col++) {
        const key = `${row}-${col}`;
        const different = getDifferentItem(row, col);
        const item = different ? different.item : mainItem;
        const isFound = foundItems.has(key);
        const isWrong = wrongClicks.has(key);

        cells.push(
          <button
            key={key}
            onClick={() => handleCellClick(row, col)}
            disabled={isFound || showSuccess}
            className={`
              relative flex items-center justify-center transition-all duration-200 rounded-lg
              ${isFound ? 'bg-green-100 ring-4 ring-green-500' : 'bg-white'}
              ${isWrong ? 'bg-red-50' : ''}
              ${!isFound && !isWrong && !showSuccess ? 'hover:bg-slate-100 hover:scale-105' : ''}
              ${showSuccess ? 'cursor-default' : 'cursor-pointer'}
            `}
            style={{
              width: cellSize,
              height: cellSize,
            }}
          >
            <Silhouette name={item} size={cellSize - 8} />
            
            {/* Found overlay */}
            {isFound && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-200/50 rounded-lg">
                <span className="text-green-600 text-3xl font-bold">✓</span>
              </div>
            )}
            
            {/* Wrong click indicator */}
            {isWrong && (
              <div className="absolute top-1 right-1">
                <span className="text-red-400 text-sm">✗</span>
              </div>
            )}
          </button>
        );
      }
    }

    return (
      <div
        className="grid gap-2 p-4 bg-slate-100 rounded-2xl shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-white text-2xl font-bold">
        {totalDifferent === 0 
          ? 'Are they all the same?' 
          : `Find the Different Item${totalDifferent > 1 ? 's' : ''}!`}
      </h2>
      
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Level: {searchConfig.id} / 15</span>
        <span>Task: {currentTask + 1} / {TASKS_PER_SESSION}</span>
        {totalDifferent > 0 && <span>Found: {foundItems.size} / {totalDifferent}</span>}
        <span>Attempts: {totalAttempts}</span>
      </div>

      <p className="text-slate-300 text-sm">
        {description}
      </p>

      {renderGrid()}

      {showSuccess && (
        <div className="text-green-400 text-xl font-bold animate-pulse">
          {totalDifferent === 0 
            ? '✓ Correct - All the same!' 
            : `🎉 Found ${totalDifferent > 1 ? 'them all' : 'it'}! 🎉`}
        </div>
      )}

      <div className="text-slate-500 text-sm">
        Grid: {gridSize}×{actualRows} | Black silhouettes
      </div>
    </div>
  );
}
