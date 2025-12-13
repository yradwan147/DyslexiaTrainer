'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps, PairSearchTrialConfig } from '@/lib/exercises/types';

interface CardState {
  item: string;
  isFlipped: boolean;
  isMatched: boolean;
  position: [number, number];
}

export function PairSearch({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const trial = config.trials[currentTrialIndex] as PairSearchTrialConfig;
  const { grid_size, pairs } = trial;
  const totalPairs = pairs.length;

  // Initialize cards
  useEffect(() => {
    startTimeRef.current = Date.now();
    setMatchedPairs(0);
    setAttempts(0);
    setSelectedIndices([]);
    setIsLocked(false);

    const newCards: CardState[] = [];
    for (const pair of pairs) {
      for (const pos of pair.positions) {
        newCards.push({
          item: pair.item_id,
          isFlipped: false,
          isMatched: false,
          position: pos,
        });
      }
    }
    setCards(newCards);
  }, [currentTrialIndex, pairs]);

  // Handle card click
  const handleCardClick = useCallback((index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (selectedIndices.length >= 2) return;

    // Flip the card
    setCards(prev => {
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], isFlipped: true };
      return newCards;
    });

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1);
      setIsLocked(true);

      const [first, second] = newSelected;
      const isMatch = cards[first].item === cards[second].item;

      setTimeout(() => {
        if (isMatch) {
          setCards(prev => {
            const newCards = [...prev];
            newCards[first] = { ...newCards[first], isMatched: true };
            newCards[second] = { ...newCards[second], isMatched: true };
            return newCards;
          });
          
          const newMatchedCount = matchedPairs + 1;
          setMatchedPairs(newMatchedCount);

          if (newMatchedCount >= totalPairs) {
            // All pairs found
            setTimeout(() => {
              onTrialComplete({
                trial_index: currentTrialIndex,
                user_response: JSON.stringify({ pairs: newMatchedCount, attempts: attempts + 1 }),
                response_time_ms: Date.now() - startTimeRef.current,
                is_correct: true,
                is_timed_out: false,
                is_skipped: false,
                started_at: new Date(startTimeRef.current).toISOString(),
                responded_at: new Date().toISOString(),
              });
            }, 500);
          }
        } else {
          // Flip cards back
          setCards(prev => {
            const newCards = [...prev];
            newCards[first] = { ...newCards[first], isFlipped: false };
            newCards[second] = { ...newCards[second], isFlipped: false };
            return newCards;
          });
        }

        setSelectedIndices([]);
        setIsLocked(false);
      }, 800);
    }
  }, [isLocked, cards, selectedIndices, matchedPairs, totalPairs, attempts, currentTrialIndex, onTrialComplete]);

  // Timeout handler
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (matchedPairs < totalPairs) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify({ pairs: matchedPairs, attempts }),
          response_time_ms: trial.stimulus_duration_ms,
          is_correct: matchedPairs >= totalPairs * 0.5,
          is_timed_out: true,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      }
    }, trial.stimulus_duration_ms);

    return () => clearTimeout(timeout);
  }, [trial.stimulus_duration_ms, matchedPairs, totalPairs, attempts, currentTrialIndex, onTrialComplete]);

  // Create grid layout
  const gridCells: (CardState | null)[][] = [];
  for (let y = 0; y < grid_size; y++) {
    gridCells[y] = [];
    for (let x = 0; x < grid_size; x++) {
      const card = cards.find(c => c.position[0] === x && c.position[1] === y);
      gridCells[y][x] = card || null;
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-white text-2xl font-bold">Find all matching pairs!</h2>
      
      <div className="flex gap-8 text-white text-lg">
        <span>Pairs found: {matchedPairs} / {totalPairs}</span>
        <span>Attempts: {attempts}</span>
      </div>
      
      <div 
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${grid_size}, 1fr)` }}
      >
        {gridCells.flat().map((cell, idx) => {
          if (!cell) {
            return (
              <div 
                key={idx} 
                className="w-20 h-20 bg-transparent"
              />
            );
          }

          const cardIndex = cards.indexOf(cell);
          
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(cardIndex)}
              disabled={cell.isMatched || cell.isFlipped}
              className={`
                w-20 h-20 text-4xl rounded-xl transition-all duration-300
                flex items-center justify-center
                ${cell.isMatched 
                  ? 'bg-success-500/50 cursor-default' 
                  : cell.isFlipped 
                    ? 'bg-primary-500' 
                    : 'bg-slate-600 hover:bg-slate-500 cursor-pointer'
                }
              `}
            >
              {(cell.isFlipped || cell.isMatched) ? cell.item : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

