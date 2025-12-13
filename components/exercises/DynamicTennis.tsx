'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps, TennisTrialConfig } from '@/lib/exercises/types';

export function DynamicTennis({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const paddleXRef = useRef<number>(0.5);
  const [score, setScore] = useState({ hits: 0, misses: 0 });

  const trial = config.trials[currentTrialIndex] as TennisTrialConfig;
  const { ball_path, paddle_width, paddle_height, stimulus_duration_ms } = trial;

  // Handle mouse/touch movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    paddleXRef.current = (e.clientX - rect.left) / canvas.width;
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();
    setScore({ hits: 0, misses: 0 });
    paddleXRef.current = 0.5;

    const width = canvas.width;
    const height = canvas.height;
    const paddleY = height - 30;
    const ballRadius = 15;

    let pathIndex = 0;
    let localHits = 0;
    let localMisses = 0;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      // Find current position in path
      while (pathIndex < ball_path.length - 1 && ball_path[pathIndex + 1].time < elapsed) {
        const prevPos = ball_path[pathIndex];
        const nextPos = ball_path[pathIndex + 1];
        
        // Check if ball crossed paddle line
        if (prevPos.y < 0.9 && nextPos.y >= 0.9) {
          const ballX = nextPos.x * width;
          const paddleLeft = paddleXRef.current * width - paddle_width / 2;
          const paddleRight = paddleXRef.current * width + paddle_width / 2;
          
          if (ballX >= paddleLeft && ballX <= paddleRight) {
            localHits++;
            setScore(s => ({ ...s, hits: localHits }));
          } else {
            localMisses++;
            setScore(s => ({ ...s, misses: localMisses }));
          }
        }
        pathIndex++;
      }

      if (elapsed >= stimulus_duration_ms) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify({ hits: localHits, misses: localMisses }),
          response_time_ms: elapsed,
          is_correct: localHits > localMisses,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
        return;
      }

      const pos = ball_path[Math.min(pathIndex, ball_path.length - 1)];
      const ballX = pos.x * width;
      const ballY = pos.y * height;

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw paddle
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(
        paddleXRef.current * width - paddle_width / 2,
        paddleY,
        paddle_width,
        paddle_height
      );

      // Draw ball
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ball_path, paddle_width, paddle_height, stimulus_duration_ms, currentTrialIndex, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Move the paddle to catch the ball!</h2>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseMove={handleMouseMove}
        className="rounded-2xl cursor-none"
      />
      
      <div className="flex gap-8 text-white text-xl">
        <span className="text-success-400">Hits: {score.hits}</span>
        <span className="text-danger-400">Misses: {score.misses}</span>
      </div>
      
      <p className="text-slate-400">Move your mouse to control the paddle</p>
    </div>
  );
}

