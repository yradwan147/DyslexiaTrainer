'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps, SaccadesTrialConfig } from '@/lib/exercises/types';

export function VisualSaccades({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const [currentPosIndex, setCurrentPosIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [showCircle, setShowCircle] = useState(true);

  const trial = config.trials[currentTrialIndex] as SaccadesTrialConfig;
  const { positions, circle_radius } = trial;

  const currentPos = positions[currentPosIndex];
  const width = 600;
  const height = 400;

  // Reset on trial change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setCurrentPosIndex(0);
    setHits(0);
    setShowCircle(true);
  }, [currentTrialIndex]);

  // Handle circle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showCircle) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const circleX = currentPos.x * width;
    const circleY = currentPos.y * height;

    const dist = Math.sqrt(Math.pow(clickX - circleX, 2) + Math.pow(clickY - circleY, 2));

    if (dist <= circle_radius + 10) {
      setHits(prev => prev + 1);
      setShowCircle(false);

      // Move to next position after brief delay
      setTimeout(() => {
        if (currentPosIndex + 1 >= positions.length) {
          // Trial complete
          onTrialComplete({
            trial_index: currentTrialIndex,
            user_response: String(hits + 1),
            response_time_ms: Date.now() - startTimeRef.current,
            is_correct: hits + 1 >= positions.length * 0.7,
            is_timed_out: false,
            is_skipped: false,
            started_at: new Date(startTimeRef.current).toISOString(),
            responded_at: new Date().toISOString(),
          });
        } else {
          setCurrentPosIndex(prev => prev + 1);
          setShowCircle(true);
        }
      }, 200);
    }
  }, [showCircle, currentPos, circle_radius, currentPosIndex, positions.length, hits, currentTrialIndex, onTrialComplete, width, height]);

  // Auto-advance if not clicked
  useEffect(() => {
    if (!showCircle) return;

    const timeout = setTimeout(() => {
      setShowCircle(false);
      setTimeout(() => {
        if (currentPosIndex + 1 >= positions.length) {
          onTrialComplete({
            trial_index: currentTrialIndex,
            user_response: String(hits),
            response_time_ms: Date.now() - startTimeRef.current,
            is_correct: hits >= positions.length * 0.7,
            is_timed_out: false,
            is_skipped: false,
            started_at: new Date(startTimeRef.current).toISOString(),
            responded_at: new Date().toISOString(),
          });
        } else {
          setCurrentPosIndex(prev => prev + 1);
          setShowCircle(true);
        }
      }, 100);
    }, currentPos.duration);

    return () => clearTimeout(timeout);
  }, [showCircle, currentPos, currentPosIndex, positions.length, hits, currentTrialIndex, onTrialComplete]);

  // Draw circle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    if (showCircle) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(currentPos.x * width, currentPos.y * height, circle_radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [currentPos, circle_radius, showCircle, width, height]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click on the circle as it appears!</h2>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="rounded-2xl cursor-pointer"
      />
      
      <div className="text-white text-xl">
        <span className="text-success-400">Hits: {hits} / {positions.length}</span>
      </div>
    </div>
  );
}

