'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const MOVEMENTS_PER_TRIAL = 10;
const TRIALS_PER_SESSION = 5;

// Circle radius scales with a 1–15 training run index:
// Runs 1–5: large, 6–10: medium, 11–15: small.
function getCircleRadius(trainingRunIndex: number): number {
  if (trainingRunIndex <= 5) return 60; // 120px diameter
  if (trainingRunIndex <= 10) return 40; // 80px diameter
  return 20; // 40px diameter
}

export function VisualSaccades({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const trialStartTimeRef = useRef<number>(0);
  const [currentMovement, setCurrentMovement] = useState(0);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [hits, setHits] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [circlePos, setCirclePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [trialTimes, setTrialTimes] = useState<number[]>([]);

  const level = config.difficulty_level || 1;
  const trainingRunIndex = config.training_run_index ?? level;
  const circleRadius = getCircleRadius(trainingRunIndex);
  const width = 800;
  const height = 500;

  // Generate random position ensuring it's within bounds
  const generateRandomPosition = useCallback(() => {
    const margin = circleRadius / Math.min(width, height) + 0.05;
    return {
      x: margin + Math.random() * (1 - 2 * margin),
      y: margin + Math.random() * (1 - 2 * margin),
    };
  }, [circleRadius, width, height]);

  // Reset on trial change
  useEffect(() => {
    startTimeRef.current = Date.now();
    trialStartTimeRef.current = Date.now();
    setCurrentMovement(0);
    setCurrentTrial(0);
    setHits(0);
    setTotalHits(0);
    setTrialTimes([]);
    setCirclePos(generateRandomPosition());
  }, [currentTrialIndex, generateRandomPosition]);

  // Handle circle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const circleX = circlePos.x * width;
    const circleY = circlePos.y * height;

    const dist = Math.sqrt(Math.pow(clickX - circleX, 2) + Math.pow(clickY - circleY, 2));

    if (dist <= circleRadius + 5) {
      setHits(prev => prev + 1);
      setTotalHits(prev => prev + 1);

      const nextMovement = currentMovement + 1;

      if (nextMovement >= MOVEMENTS_PER_TRIAL) {
        // Trial complete
        const trialTime = Date.now() - trialStartTimeRef.current;
        const newTrialTimes = [...trialTimes, trialTime];
        setTrialTimes(newTrialTimes);
        
        const nextTrial = currentTrial + 1;

        if (nextTrial >= TRIALS_PER_SESSION) {
          // Session complete
          onTrialComplete({
            trial_index: currentTrialIndex,
            user_response: JSON.stringify({ 
              totalHits: totalHits + 1,
              trialTimes: newTrialTimes,
              level,
              trainingRunIndex,
              circleSize: circleRadius * 2 
            }),
            response_time_ms: Date.now() - startTimeRef.current,
            is_correct: true,
            is_timed_out: false,
            is_skipped: false,
            started_at: new Date(startTimeRef.current).toISOString(),
            responded_at: new Date().toISOString(),
          });
        } else {
          // Next trial
          setCurrentTrial(nextTrial);
          setCurrentMovement(0);
          setHits(0);
          trialStartTimeRef.current = Date.now();
          setCirclePos(generateRandomPosition());
        }
      } else {
        // Next movement
        setCurrentMovement(nextMovement);
        setCirclePos(generateRandomPosition());
      }
    }
  }, [circlePos, circleRadius, currentMovement, currentTrial, totalHits, trialTimes, level, trainingRunIndex, currentTrialIndex, onTrialComplete, generateRandomPosition, width, height]);

  // Handle mouse move for hover effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const circleX = circlePos.x * width;
    const circleY = circlePos.y * height;

    const dist = Math.sqrt(Math.pow(mouseX - circleX, 2) + Math.pow(mouseY - circleY, 2));
    setIsHovered(dist <= circleRadius);
  }, [circlePos, circleRadius, width, height]);

  // Draw circle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw circle
    const x = circlePos.x * width;
    const y = circlePos.y * height;

    // Glow effect when hovered
    if (isHovered) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, circleRadius * 1.5);
      gradient.addColorStop(0, '#fbbf2440');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, circleRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main circle
    ctx.fillStyle = isHovered ? '#fbbf24' : '#22c55e';
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Circle border
    ctx.strokeStyle = isHovered ? '#f59e0b' : '#16a34a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x - circleRadius * 0.3, y - circleRadius * 0.3, circleRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

  }, [circlePos, circleRadius, isHovered, width, height]);

  // Calculate size label
  const getSizeLabel = (difficulty: number) => {
    // Keep label stable even if caller passes a training run index.
    const radius = getCircleRadius(difficulty);
    return `${radius * 2}px circle`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click on the circle!</h2>
      
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Trial: {currentTrial + 1} / {TRIALS_PER_SESSION}</span>
        <span>Movement: {currentMovement + 1} / {MOVEMENTS_PER_TRIAL}</span>
        <span>Level: {level} ({getSizeLabel(trainingRunIndex)})</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsHovered(false)}
        className="rounded-2xl cursor-pointer"
        style={{ cursor: isHovered ? 'pointer' : 'default' }}
      />
      
      <div className="flex gap-8 text-white text-lg">
        <span className="text-green-400">This trial: {hits} / {currentMovement}</span>
        <span className="text-blue-400">Total hits: {totalHits}</span>
      </div>

      {trialTimes.length > 0 && (
        <div className="text-slate-500 text-sm">
          Previous trial times: {trialTimes.map((t, i) => 
            `Trial ${i + 1}: ${(t / 1000).toFixed(1)}s`
          ).join(' | ')}
        </div>
      )}
      
      <p className="text-slate-400 text-sm">
        Mouse changes color when hovering. Click to move the circle.
      </p>
    </div>
  );
}
