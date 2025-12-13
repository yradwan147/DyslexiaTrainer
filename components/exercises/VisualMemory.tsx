'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps, VisualMemoryTrialConfig } from '@/lib/exercises/types';

type Phase = 'showing' | 'input' | 'complete';

export function VisualMemory({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [phase, setPhase] = useState<Phase>('showing');
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const trial = config.trials[currentTrialIndex] as VisualMemoryTrialConfig;
  const { sequence, display_time_per_item_ms, image_set } = trial;

  // Reset on trial change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setPhase('showing');
    setCurrentShowIndex(0);
    setUserSequence([]);
  }, [currentTrialIndex]);

  // Show sequence
  useEffect(() => {
    if (phase !== 'showing') return;

    const showNext = () => {
      if (currentShowIndex >= sequence.length) {
        // Done showing, switch to input
        setTimeout(() => setPhase('input'), 500);
        return;
      }

      const timer = setTimeout(() => {
        setCurrentShowIndex(prev => prev + 1);
      }, display_time_per_item_ms);

      return () => clearTimeout(timer);
    };

    const cleanup = showNext();
    return cleanup;
  }, [phase, currentShowIndex, sequence.length, display_time_per_item_ms]);

  // Handle item selection
  const handleSelect = useCallback((itemIndex: number) => {
    if (phase !== 'input') return;

    const newSequence = [...userSequence, itemIndex];
    setUserSequence(newSequence);

    if (newSequence.length >= sequence.length) {
      // Check correctness
      const correctCount = newSequence.filter((item, idx) => item === sequence[idx]).length;
      const isCorrect = correctCount === sequence.length;

      onTrialComplete({
        trial_index: currentTrialIndex,
        user_response: JSON.stringify(newSequence),
        response_time_ms: Date.now() - startTimeRef.current,
        is_correct: isCorrect,
        is_timed_out: false,
        is_skipped: false,
        started_at: new Date(startTimeRef.current).toISOString(),
        responded_at: new Date().toISOString(),
      });
    }
  }, [phase, userSequence, sequence, currentTrialIndex, onTrialComplete]);

  // Clear last selection
  const handleUndo = useCallback(() => {
    setUserSequence(prev => prev.slice(0, -1));
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-white text-2xl font-bold">
        {phase === 'showing' ? 'Remember this sequence!' : 'Repeat the sequence in order'}
      </h2>

      {/* Display area */}
      <div className="min-h-[150px] flex items-center justify-center">
        {phase === 'showing' && currentShowIndex < sequence.length && (
          <div className="text-8xl animate-pulse">
            {image_set[sequence[currentShowIndex]]}
          </div>
        )}
        
        {phase === 'showing' && currentShowIndex >= sequence.length && (
          <div className="text-white text-xl">Get ready...</div>
        )}
        
        {phase === 'input' && (
          <div className="flex gap-4">
            {userSequence.map((item, idx) => (
              <div key={idx} className="text-5xl p-2 bg-slate-700 rounded-xl">
                {image_set[item]}
              </div>
            ))}
            {userSequence.length < sequence.length && (
              <div className="w-16 h-16 border-4 border-dashed border-slate-500 rounded-xl flex items-center justify-center text-slate-500">
                {userSequence.length + 1}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {phase === 'showing' && (
        <div className="flex gap-2">
          {sequence.map((_, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full ${
                idx < currentShowIndex ? 'bg-primary-500' : 
                idx === currentShowIndex ? 'bg-primary-300 animate-pulse' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Selection grid */}
      {phase === 'input' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {image_set.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="text-5xl p-4 bg-slate-700 rounded-xl hover:bg-slate-600 
                           active:scale-95 transition-all"
              >
                {item}
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
    </div>
  );
}

