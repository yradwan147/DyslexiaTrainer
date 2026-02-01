'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  MEMORY_SEQUENCES,
  getMemorySequenceConfig,
  getItemEmoji, 
  getAllUniqueItems,
  type MemorySequence 
} from '@/lib/exercises/visualMemoryData';

// Generate a session seed for reproducible but unique puzzles
function getSessionSeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

type Phase = 'showing' | 'input' | 'feedback' | 'complete';

const DISPLAY_TIME_MS = 10000; // 10 seconds to view all images
const ITEMS_PER_SESSION = 5;
const MAX_RETRIES = 5;

export function VisualMemory({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [phase, setPhase] = useState<Phase>('showing');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(DISPLAY_TIME_MS / 1000);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [sessionSeed] = useState(() => getSessionSeed() + currentTrialIndex * 100);
  const startTimeRef = useRef<number>(Date.now());

  // Get sequence - uses procedural generation for variety
  const currentSequence = getMemorySequenceConfig(currentItem, sessionSeed);

  // Reset on trial/item change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setPhase('showing');
    setUserSequence([]);
    setTimeRemaining(DISPLAY_TIME_MS / 1000);
    setShowCorrect(false);
    // Generate available items for selection
    setAvailableItems(getAllUniqueItems(currentSequence));
  }, [currentTrialIndex, currentItem, currentSequence]);

  // Countdown timer during showing phase
  useEffect(() => {
    if (phase !== 'showing') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setPhase('input');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Handle item selection
  const handleSelect = useCallback((item: string) => {
    if (phase !== 'input') return;

    const newSequence = [...userSequence, item];
    setUserSequence(newSequence);

    // Check if sequence is complete
    if (newSequence.length >= currentSequence.sequence.length) {
      const isCorrect = newSequence.every((item, idx) => item === currentSequence.sequence[idx]);
      
      if (isCorrect) {
        setShowCorrect(true);
        setPhase('feedback');
        
        setTimeout(() => {
          const newItem = currentItem + 1;
          
          if (newItem >= ITEMS_PER_SESSION) {
            // Session complete
            onTrialComplete({
              trial_index: currentTrialIndex,
              user_response: JSON.stringify({ 
                completed: ITEMS_PER_SESSION, 
                retries: retryCount 
              }),
              response_time_ms: Date.now() - startTimeRef.current,
              is_correct: true,
              is_timed_out: false,
              is_skipped: false,
              started_at: new Date(startTimeRef.current).toISOString(),
              responded_at: new Date().toISOString(),
            });
          } else {
            // Next item
            setCurrentItem(newItem);
            setRetryCount(0);
          }
        }, 1500);
      } else {
        // Wrong - retry or move on
        setShowCorrect(false);
        setPhase('feedback');
        
        setTimeout(() => {
          if (retryCount + 1 >= MAX_RETRIES) {
            // Max retries reached, move to next
            const newItem = currentItem + 1;
            
            if (newItem >= ITEMS_PER_SESSION) {
              onTrialComplete({
                trial_index: currentTrialIndex,
                user_response: JSON.stringify({ 
                  completed: currentItem, 
                  retries: retryCount + 1 
                }),
                response_time_ms: Date.now() - startTimeRef.current,
                is_correct: false,
                is_timed_out: false,
                is_skipped: false,
                started_at: new Date(startTimeRef.current).toISOString(),
                responded_at: new Date().toISOString(),
              });
            } else {
              setCurrentItem(newItem);
              setRetryCount(0);
            }
          } else {
            // Retry same sequence
            setRetryCount(prev => prev + 1);
            setUserSequence([]);
            setPhase('showing');
            setTimeRemaining(DISPLAY_TIME_MS / 1000);
          }
        }, 1500);
      }
    }
  }, [phase, userSequence, currentSequence, currentItem, retryCount, currentTrialIndex, onTrialComplete]);

  // Undo last selection
  const handleUndo = useCallback(() => {
    if (phase === 'input' && userSequence.length > 0) {
      setUserSequence(prev => prev.slice(0, -1));
    }
  }, [phase, userSequence]);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-white text-2xl font-bold">
        {phase === 'showing' ? 'Remember these images!' : 
         phase === 'feedback' ? (showCorrect ? 'Correct!' : 'Try again!') :
         'Select the images in order'}
      </h2>

      <div className="text-slate-400 text-sm flex gap-6">
        <span>Item: {currentItem + 1} / {ITEMS_PER_SESSION}</span>
        <span>Sequence length: {currentSequence.sequence.length}</span>
        {retryCount > 0 && <span>Attempt: {retryCount + 1} / {MAX_RETRIES}</span>}
      </div>

      {/* Display area - show ALL images simultaneously */}
      <div className="min-h-[180px] flex flex-col items-center justify-center gap-4">
        {phase === 'showing' && (
          <>
            {/* Timer */}
            <div className="text-slate-400 text-lg">
              Time remaining: {timeRemaining}s
            </div>
            
            {/* All images displayed in a row */}
            <div className="flex gap-4 p-4 bg-slate-800 rounded-2xl">
              {currentSequence.sequence.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-2"
                >
                  <div className="text-6xl p-3 bg-slate-700 rounded-xl">
                    {getItemEmoji(item)}
                  </div>
                  <span className="text-slate-500 text-xs">{idx + 1}</span>
                </div>
              ))}
            </div>
            
            <p className="text-slate-400 text-sm">
              Remember the order from left to right!
            </p>
          </>
        )}

        {phase === 'input' && (
          <>
            {/* User's current selection */}
            <div className="flex gap-3 mb-4">
              {userSequence.map((item, idx) => (
                <div key={idx} className="text-5xl p-2 bg-slate-700 rounded-xl">
                  {getItemEmoji(item)}
                </div>
              ))}
              {userSequence.length < currentSequence.sequence.length && (
                <div className="w-16 h-16 border-4 border-dashed border-slate-500 rounded-xl flex items-center justify-center text-slate-500">
                  {userSequence.length + 1}
                </div>
              )}
            </div>
          </>
        )}

        {phase === 'feedback' && (
          <div className={`text-6xl ${showCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {showCorrect ? '✓' : '✗'}
          </div>
        )}
      </div>

      {/* Selection grid */}
      {phase === 'input' && (
        <>
          <div className="grid grid-cols-4 gap-3 max-w-lg">
            {availableItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                disabled={userSequence.includes(item)}
                className={`
                  text-4xl p-3 rounded-xl transition-all
                  ${userSequence.includes(item) 
                    ? 'bg-slate-800 opacity-50 cursor-not-allowed' 
                    : 'bg-slate-700 hover:bg-slate-600 active:scale-95 cursor-pointer'
                  }
                `}
              >
                {getItemEmoji(item)}
              </button>
            ))}
          </div>
          
          {userSequence.length > 0 && (
            <button
              onClick={handleUndo}
              className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-500"
            >
              Undo
            </button>
          )}
        </>
      )}

      <p className="text-slate-500 text-xs max-w-md text-center">
        Level {currentSequence.level}: {
          currentSequence.level === 1 ? 'Visually different items' :
          currentSequence.level === 2 ? 'Visually similar, different categories' :
          'Visually similar, same category'
        }
      </p>
    </div>
  );
}
