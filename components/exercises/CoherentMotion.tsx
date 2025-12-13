'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createSeededRandom } from '@/lib/exercises/prng';
import type { ExerciseProps, CoherentMotionTrialConfig } from '@/lib/exercises/types';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isCoherent: boolean;
}

export function CoherentMotion({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [hasResponded, setHasResponded] = useState(false);

  const trial = config.trials[currentTrialIndex] as CoherentMotionTrialConfig;
  const { seed, coherence_percent, coherent_side, motion_direction, dot_count, dot_speed, stimulus_duration_ms } = trial;

  // Handle response
  const handleResponse = useCallback((side: 'left' | 'right') => {
    if (hasResponded) return;
    setHasResponded(true);

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = side === coherent_side;

    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: side,
      response_time_ms: responseTime,
      is_correct: isCorrect,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [hasResponded, coherent_side, currentTrialIndex, onTrialComplete]);

  // Initialize and animate dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setHasResponded(false);
    startTimeRef.current = Date.now();

    const width = canvas.width;
    const height = canvas.height;
    const patchWidth = width * 0.4;
    const patchHeight = height * 0.7;
    const leftPatchX = width * 0.05;
    const rightPatchX = width * 0.55;
    const patchY = height * 0.15;

    // Create dots for each patch
    const rng = createSeededRandom(seed);
    const dotsPerPatch = Math.floor(dot_count / 2);
    
    const createDots = (isLeft: boolean): Dot[] => {
      const patchX = isLeft ? leftPatchX : rightPatchX;
      const isCoherentPatch = (isLeft && coherent_side === 'left') || (!isLeft && coherent_side === 'right');
      const dots: Dot[] = [];

      for (let i = 0; i < dotsPerPatch; i++) {
        const isCoherent = isCoherentPatch && rng.next() < coherence_percent / 100;
        const angle = isCoherent 
          ? (motion_direction === 'right' ? 0 : Math.PI)
          : rng.next() * Math.PI * 2;
        
        dots.push({
          x: patchX + rng.next() * patchWidth,
          y: patchY + rng.next() * patchHeight,
          vx: Math.cos(angle) * dot_speed,
          vy: Math.sin(angle) * dot_speed,
          isCoherent,
        });
      }
      return dots;
    };

    const leftDots = createDots(true);
    const rightDots = createDots(false);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw patch backgrounds
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(leftPatchX, patchY, patchWidth, patchHeight);
      ctx.fillRect(rightPatchX, patchY, patchWidth, patchHeight);

      // Update and draw dots
      const drawDots = (dots: Dot[], patchX: number) => {
        ctx.fillStyle = '#ffffff';
        for (const dot of dots) {
          dot.x += dot.vx;
          dot.y += dot.vy;

          // Wrap around
          if (dot.x < patchX) dot.x = patchX + patchWidth;
          if (dot.x > patchX + patchWidth) dot.x = patchX;
          if (dot.y < patchY) dot.y = patchY + patchHeight;
          if (dot.y > patchY + patchHeight) dot.y = patchY;

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawDots(leftDots, leftPatchX);
      drawDots(rightDots, rightPatchX);

      // Check timeout
      if (Date.now() - startTimeRef.current > stimulus_duration_ms && !hasResponded) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: '',
          response_time_ms: stimulus_duration_ms,
          is_correct: false,
          is_timed_out: true,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [seed, coherence_percent, coherent_side, motion_direction, dot_count, dot_speed, stimulus_duration_ms, currentTrialIndex, onTrialComplete, hasResponded]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleResponse('left');
      if (e.key === 'ArrowRight') handleResponse('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResponse]);

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="rounded-2xl"
      />
      <div className="flex gap-8">
        <button
          onClick={() => handleResponse('left')}
          disabled={hasResponded}
          className="px-12 py-6 text-2xl font-bold bg-primary-500 text-white rounded-2xl 
                     hover:bg-primary-600 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Left
        </button>
        <button
          onClick={() => handleResponse('right')}
          disabled={hasResponded}
          className="px-12 py-6 text-2xl font-bold bg-primary-500 text-white rounded-2xl 
                     hover:bg-primary-600 active:scale-95 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Right →
        </button>
      </div>
      <p className="text-slate-400 text-sm">Use arrow keys or click the buttons</p>
    </div>
  );
}

