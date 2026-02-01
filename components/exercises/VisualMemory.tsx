'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import { 
  generateMemorySequence,
  getItemEmoji, 
  getAllUniqueItems,
  type MemorySequence 
} from '@/lib/exercises/visualMemoryData';

// 5 unique memory puzzles per session
const PUZZLES_PER_SESSION = 5;
const DISPLAY_TIME_MS = 10000; // 10 seconds to view all images
const MAX_RETRIES = 3;

type Phase = 'showing' | 'input' | 'feedback';

export function VisualMemory({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Get difficulty from config (1-5)
  const difficulty = config.difficulty_level || 1;
  
  // Generate a unique session seed when component mounts
  const sessionSeed = useMemo(() => Date.now() + Math.random() * 1000000, []);
  
  // Pre-generate all sequences for this session - difficulty affects length and similarity
  const sessionSequences = useMemo(() => {
    const sequences: MemorySequence[] = [];
    
    for (let i = 0; i < PUZZLES_PER_SESSION; i++) {
      // Each sequence is procedurally generated with random items
      sequences.push(generateMemorySequence(i, sessionSeed + i * 88888, difficulty));
    }
    
    return sequences;
  }, [sessionSeed, difficulty]);

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [phase, setPhase] = useState<Phase>('showing');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DISPLAY_TIME_MS / 1000);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Get current sequence configuration
  const currentSequence = sessionSequences[currentPuzzle];

  // Reset state when moving to a new puzzle
  useEffect(() => {
    setPhase('showing');
    setUserSequence([]);
    setTimeRemaining(DISPLAY_TIME_MS / 1000);
    setShowWrongFeedback(false);
    setAvailableItems(getAllUniqueItems(currentSequence));
  }, [currentPuzzle, currentSequence]);

  // Reset everything when exercise restarts
  useEffect(() => {
    setCurrentPuzzle(0);
    setPhase('showing');
    setUserSequence([]);
    setRetryCount(0);
    setTimeRemaining(DISPLAY_TIME_MS / 1000);
    setShowWrongFeedback(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

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

  // Advance to next puzzle or complete session
  const advanceToNext = useCallback(() => {
    const nextPuzzle = currentPuzzle + 1;
    
    if (nextPuzzle >= PUZZLES_PER_SESSION) {
      // Session complete!
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({ 
          puzzlesCompleted: PUZZLES_PER_SESSION,
          totalRetries: retryCount
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
  }, [currentPuzzle, retryCount, currentTrialIndex, onTrialComplete]);

  // Handle item selection
  const handleSelect = useCallback((item: string) => {
    if (phase !== 'input') return;

    const newSequence = [...userSequence, item];
    setUserSequence(newSequence);

    // Check if sequence is complete
    if (newSequence.length >= currentSequence.sequence.length) {
      const isCorrect = newSequence.every((item, idx) => item === currentSequence.sequence[idx]);
      
      if (isCorrect) {
        setPhase('feedback');
        setTimeout(() => advanceToNext(), 1500);
      } else {
        // Wrong sequence
        setShowWrongFeedback(true);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          if (retryCount + 1 >= MAX_RETRIES) {
            // Too many retries, move on anyway
            advanceToNext();
          } else {
            // Retry - show sequence again
            setUserSequence([]);
            setShowWrongFeedback(false);
            setPhase('showing');
            setTimeRemaining(DISPLAY_TIME_MS / 1000);
          }
        }, 1500);
      }
    }
  }, [phase, userSequence, currentSequence.sequence, retryCount, advanceToNext]);

  // Skip to input phase
  const handleSkipTimer = () => {
    if (phase === 'showing') {
      setPhase('input');
      setTimeRemaining(0);
    }
  };

  // Render the sequence display during showing phase
  const renderSequenceDisplay = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-slate-300 text-lg">Remember this sequence:</p>
        
        <div className="flex gap-4 flex-wrap justify-center max-w-lg">
          {currentSequence.sequence.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 shadow-lg flex flex-col items-center"
            >
              <span className="text-5xl">{getItemEmoji(item)}</span>
              <span className="text-slate-400 text-sm mt-1">{idx + 1}</span>
            </div>
          ))}
        </div>
        
        <div className="text-white text-2xl font-bold">
          {timeRemaining}s
        </div>
        
        <button
          onClick={handleSkipTimer}
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          I'm ready!
        </button>
      </div>
    );
  };

  // Render the input phase
  const renderInputPhase = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-slate-300 text-lg">
          Click the items in the correct order ({userSequence.length}/{currentSequence.sequence.length})
        </p>
        
        {/* User's current selection */}
        <div className="flex gap-2 min-h-16">
          {userSequence.map((item, idx) => (
            <div
              key={idx}
              className="bg-blue-100 rounded-lg p-2 flex items-center justify-center"
            >
              <span className="text-3xl">{getItemEmoji(item)}</span>
            </div>
          ))}
          {userSequence.length === 0 && (
            <div className="text-slate-500">Select items below...</div>
          )}
        </div>
        
        {/* Available items grid */}
        <div className="grid grid-cols-4 gap-3 bg-slate-100 p-4 rounded-2xl">
          {availableItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item)}
              className="bg-white rounded-xl p-3 shadow hover:scale-110 transition-transform"
            >
              <span className="text-4xl">{getItemEmoji(item)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render feedback phase
  const renderFeedbackPhase = () => {
    return (
      <div className="flex flex-col items-center gap-6">
        {showWrongFeedback ? (
          <>
            <div className="text-red-400 text-2xl font-bold">
              Not quite right...
            </div>
            <p className="text-slate-400">
              {retryCount < MAX_RETRIES ? 'Let\'s try again!' : 'Moving to next puzzle...'}
            </p>
          </>
        ) : (
          <>
            <div className="text-green-400 text-2xl font-bold animate-pulse">
              🎉 Perfect! 🎉
            </div>
            <div className="flex gap-2">
              {currentSequence.sequence.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-green-100 rounded-lg p-2"
                >
                  <span className="text-3xl">{getItemEmoji(item)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-white text-2xl font-bold">Remember the Sequence!</h2>
      
      {/* Progress and difficulty indicator */}
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Puzzle {currentPuzzle + 1} of {PUZZLES_PER_SESSION}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty} • {currentSequence.sequence.length} items
        </span>
      </div>

      {/* Sequence info */}
      <div className="text-slate-400 text-sm">
        {currentSequence.sequence.length} items to remember
      </div>

      {/* Main content based on phase */}
      <div className="bg-slate-800 rounded-2xl p-8 min-w-[400px]">
        {phase === 'showing' && renderSequenceDisplay()}
        {phase === 'input' && renderInputPhase()}
        {phase === 'feedback' && renderFeedbackPhase()}
      </div>
    </div>
  );
}
