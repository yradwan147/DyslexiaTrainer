'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps, TwoCirclesTrialConfig } from '@/lib/exercises/types';

export function DynamicCircles({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [hits, setHits] = useState(0);
  const clickTimesRef = useRef<number[]>([]);

  const trial = config.trials[currentTrialIndex] as TwoCirclesTrialConfig;
  const { circle1_path, circle2_path, overlap_times, circle_radius, stimulus_duration_ms } = trial;

  // Handle click
  const handleClick = useCallback(() => {
    const currentTime = Date.now() - startTimeRef.current;
    clickTimesRef.current.push(currentTime);

    // Check if click is within any overlap window (±400ms)
    const isHit = overlap_times.some(t => Math.abs(currentTime - t) < 400);
    if (isHit) {
      setHits(prev => prev + 1);
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
    clickTimesRef.current = [];

    const width = canvas.width;
    const height = canvas.height;

    let pathIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;

      // Find current position in paths
      while (pathIndex < circle1_path.length - 1 && circle1_path[pathIndex + 1].time < elapsed) {
        pathIndex++;
      }

      if (elapsed >= stimulus_duration_ms) {
        const hitCount = overlap_times.filter(t =>
          clickTimesRef.current.some(ct => Math.abs(ct - t) < 400)
        ).length;

        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify(clickTimesRef.current),
          response_time_ms: elapsed,
          is_correct: hitCount >= Math.max(1, overlap_times.length * 0.5),
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
        return;
      }

      const idx = Math.min(pathIndex, circle1_path.length - 1);
      const pos1 = circle1_path[idx];
      const pos2 = circle2_path[idx];

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw circle 1 (red)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pos1.x * width, pos1.y * height, circle_radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw circle 2 (blue)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(pos2.x * width, pos2.y * height, circle_radius, 0, Math.PI * 2);
      ctx.fill();

      // Check if overlapping (visual feedback)
      const dist = Math.sqrt(
        Math.pow((pos1.x - pos2.x) * width, 2) +
        Math.pow((pos1.y - pos2.y) * height, 2)
      );
      if (dist < circle_radius * 2) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(
          (pos1.x + pos2.x) / 2 * width,
          (pos1.y + pos2.y) / 2 * height,
          circle_radius * 1.5,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circle1_path, circle2_path, overlap_times, circle_radius, stimulus_duration_ms, currentTrialIndex, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click when the circles touch!</h2>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleClick}
        className="rounded-2xl cursor-pointer"
      />
      
      <div className="text-white text-xl">
        <span className="text-success-400">Hits: {hits}</span>
      </div>
    </div>
  );
}

