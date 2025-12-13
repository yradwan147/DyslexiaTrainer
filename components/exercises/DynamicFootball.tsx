'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps, FootballTrialConfig } from '@/lib/exercises/types';

export function DynamicFootball({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const clickTimesRef = useRef<number[]>([]);

  const trial = config.trials[currentTrialIndex] as FootballTrialConfig;
  const { circle_path, overlap_times, circle_radius, square_size, stimulus_duration_ms } = trial;

  // Handle click
  const handleClick = useCallback(() => {
    const currentTime = Date.now() - startTimeRef.current;
    clickTimesRef.current.push(currentTime);

    // Check if click is within any overlap window (±500ms)
    const isHit = overlap_times.some(t => Math.abs(currentTime - t) < 500);
    if (isHit) {
      setHits(prev => prev + 1);
    } else {
      setMisses(prev => prev + 1);
    }
  }, [overlap_times]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();
    setHits(0);
    setMisses(0);
    clickTimesRef.current = [];

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let pathIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      // Find current position in path
      while (pathIndex < circle_path.length - 1 && circle_path[pathIndex + 1].time < elapsed) {
        pathIndex++;
      }

      if (elapsed >= stimulus_duration_ms) {
        // Trial complete
        const hitCount = overlap_times.filter(t => 
          clickTimesRef.current.some(ct => Math.abs(ct - t) < 500)
        ).length;

        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify(clickTimesRef.current),
          response_time_ms: elapsed,
          is_correct: hitCount >= overlap_times.length * 0.6,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
        return;
      }

      const pos = circle_path[Math.min(pathIndex, circle_path.length - 1)];
      const circleX = pos.x * width;
      const circleY = pos.y * height;

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw goal (square in center)
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(
        centerX - square_size / 2,
        centerY - square_size / 2,
        square_size,
        square_size
      );

      // Draw ball (circle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(circleX, circleY, circle_radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText(`Hits: ${hits}`, 20, 40);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circle_path, overlap_times, circle_radius, square_size, stimulus_duration_ms, currentTrialIndex, onTrialComplete, hits]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click when the ball enters the goal!</h2>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleClick}
        className="rounded-2xl cursor-pointer"
      />
      
      <div className="flex gap-8 text-white text-xl">
        <span className="text-success-400">Hits: {hits}</span>
        <span className="text-danger-400">Misses: {misses}</span>
      </div>
    </div>
  );
}

