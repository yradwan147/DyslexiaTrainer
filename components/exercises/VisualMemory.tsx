'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';
import {
  getMemorySession,
  getMemoryImagePath,
  getAllUniqueItems,
  type MemorySequence,
  type MemorySession,
} from '@/lib/exercises/visualMemoryData';

const DISPLAY_TIME_MS = 10000; // 10 seconds to view sequence
const MAX_RETRIES = 3;

type Phase = 'showing' | 'input' | 'feedback';

export function VisualMemory({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  // Session number 1-15 (injected via difficulty_level from exercise page)
  const sessionNumber = Math.max(1, Math.min(15, config.difficulty_level || 1));
  const session: MemorySession = getMemorySession(sessionNumber);
  const totalPuzzles = session.sequences.length; // always 5

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [phase, setPhase] = useState<Phase>('showing');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DISPLAY_TIME_MS / 1000);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentSequence: MemorySequence = session.sequences[currentPuzzle];

  // Reset on new puzzle
  useEffect(() => {
    setPhase('showing');
    setUserSequence([]);
    setTimeRemaining(DISPLAY_TIME_MS / 1000);
    setShowWrongFeedback(false);
    setAvailableItems(getAllUniqueItems(currentSequence, session));
  }, [currentPuzzle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on exercise restart
  useEffect(() => {
    setCurrentPuzzle(0);
    setPhase('showing');
    setUserSequence([]);
    setRetryCount(0);
    setTimeRemaining(DISPLAY_TIME_MS / 1000);
    setShowWrongFeedback(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'showing') return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPhase('input');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Advance to next puzzle or complete
  const advanceToNext = useCallback(() => {
    const next = currentPuzzle + 1;
    if (next >= totalPuzzles) {
      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify({
          puzzlesCompleted: totalPuzzles,
          totalRetries: retryCount,
          sessionNumber,
        }),
        response_time_ms: Date.now() - startTimeRef.current,
        is_correct: true,
        is_timed_out: false,
        is_skipped: false,
        started_at: new Date(startTimeRef.current).toISOString(),
        responded_at: new Date().toISOString(),
      });
    } else {
      setCurrentPuzzle(next);
    }
  }, [currentPuzzle, totalPuzzles, retryCount, sessionNumber, currentTrialIndex, onTrialComplete]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: string) => {
      if (phase !== 'input') return;
      const newSeq = [...userSequence, item];
      setUserSequence(newSeq);

      if (newSeq.length >= currentSequence.sequence.length) {
        const isCorrect = newSeq.every((it, idx) => it === currentSequence.sequence[idx]);
        if (isCorrect) {
          setPhase('feedback');
          setTimeout(() => advanceToNext(), 1500);
        } else {
          setShowWrongFeedback(true);
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            if (retryCount + 1 >= MAX_RETRIES) {
              advanceToNext();
            } else {
              setUserSequence([]);
              setShowWrongFeedback(false);
              setPhase('showing');
              setTimeRemaining(DISPLAY_TIME_MS / 1000);
            }
          }, 1500);
        }
      }
    },
    [phase, userSequence, currentSequence.sequence, retryCount, advanceToNext],
  );

  const handleSkipTimer = () => {
    if (phase === 'showing') {
      setPhase('input');
      setTimeRemaining(0);
    }
  };

  // Image size for sequence display (scales down for 7 items to stay in one line)
  const seqImageSize = currentSequence.sequence.length <= 5 ? 80 : 64;

  // ----- Render helpers -----

  const renderSequenceDisplay = () => (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-300 text-lg">Remember this sequence:</p>

      {/* Single line, no wrap */}
      <div className="flex gap-3 flex-nowrap justify-center">
        {currentSequence.sequence.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-3 shadow-lg flex flex-col items-center shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMemoryImagePath(item)}
              alt={item}
              style={{ width: seqImageSize, height: seqImageSize, objectFit: 'contain' }}
            />
            <span className="text-slate-400 text-sm mt-1">{idx + 1}</span>
          </div>
        ))}
      </div>

      <div className="text-white text-2xl font-bold">{timeRemaining}s</div>

      <button
        onClick={handleSkipTimer}
        className="text-slate-400 text-sm hover:text-white transition-colors"
      >
        I&apos;m ready!
      </button>
    </div>
  );

  const renderInputPhase = () => (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-300 text-lg">
        Click the items in the correct order ({userSequence.length}/{currentSequence.sequence.length})
      </p>

      {/* User's current selection */}
      <div className="flex gap-2 min-h-16 flex-nowrap">
        {userSequence.map((item, idx) => (
          <div key={idx} className="bg-blue-100 rounded-lg p-2 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMemoryImagePath(item)}
              alt={item}
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
          </div>
        ))}
        {userSequence.length === 0 && (
          <div className="text-slate-500">Select items below...</div>
        )}
      </div>

      {/* Available items grid - white cells */}
      <div className="grid grid-cols-4 gap-3 bg-slate-100 p-4 rounded-2xl">
        {availableItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(item)}
            className="bg-white rounded-xl p-3 shadow hover:scale-110 transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMemoryImagePath(item)}
              alt={item}
              style={{ width: 56, height: 56, objectFit: 'contain' }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderFeedbackPhase = () => (
    <div className="flex flex-col items-center gap-6">
      {showWrongFeedback ? (
        <>
          <div className="text-red-400 text-2xl font-bold">Not quite right...</div>
          <p className="text-slate-400">
            {retryCount < MAX_RETRIES ? "Let's try again!" : 'Moving to next puzzle...'}
          </p>
        </>
      ) : (
        <>
          <div className="text-green-400 text-2xl font-bold animate-pulse">Perfect!</div>
          <div className="flex gap-2 flex-nowrap">
            {currentSequence.sequence.map((item, idx) => (
              <div key={idx} className="bg-green-100 rounded-lg p-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMemoryImagePath(item)}
                  alt={item}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Remember the Sequence!</h2>

      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">
          Puzzle {currentPuzzle + 1} of {totalPuzzles}
        </span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Session {sessionNumber} &bull; {currentSequence.sequence.length} items
        </span>
      </div>

      <div className="text-slate-400 text-sm">
        {currentSequence.sequence.length} items to remember
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 min-w-[360px] max-w-full">
        {phase === 'showing' && renderSequenceDisplay()}
        {phase === 'input' && renderInputPhase()}
        {phase === 'feedback' && renderFeedbackPhase()}
      </div>
    </div>
  );
}
