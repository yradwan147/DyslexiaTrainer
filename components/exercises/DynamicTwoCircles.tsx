'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const CIRCLE_RADIUS = 40;
const TOTAL_ROUNDS = 10;

interface Circle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export function DynamicTwoCircles({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  
  // Use refs for animation values
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const currentRoundRef = useRef(0);
  const showFeedbackRef = useRef<'hit' | 'miss' | null>(null);
  const circle1Ref = useRef<Circle | null>(null);
  const circle2Ref = useRef<Circle | null>(null);
  const isOverlappingRef = useRef(false);
  
  // State for display
  const [displayHits, setDisplayHits] = useState(0);
  const [displayMisses, setDisplayMisses] = useState(0);
  const [displayRound, setDisplayRound] = useState(0);
  const [displayOverlapping, setDisplayOverlapping] = useState(false);

  const width = 700;
  const height = 500;

  // Speed based on difficulty (1-5)
  const difficulty = config.difficulty_level || 1;
  const baseSpeed = 1.5 + difficulty * 0.5; // 2, 2.5, 3, 3.5, 4

  // Create circles that will collide within ~3 seconds
  const createCircles = useCallback(() => {
    // Random Y positions for both circles
    const y1 = CIRCLE_RADIUS + Math.random() * (height - 2 * CIRCLE_RADIUS);
    const y2 = CIRCLE_RADIUS + Math.random() * (height - 2 * CIRCLE_RADIUS);
    
    // Calculate velocity needed to meet in center in ~2-3 seconds (120-180 frames)
    const meetTime = 120 + Math.random() * 60; // frames until they meet
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Circle 1 starts left, moves toward center-right
    const c1: Circle = {
      x: CIRCLE_RADIUS + Math.random() * 50, // Start on left edge
      y: y1,
      vx: ((centerX - 50 + Math.random() * 100) - (CIRCLE_RADIUS + 25)) / meetTime * baseSpeed,
      vy: ((centerY - 50 + Math.random() * 100) - y1) / meetTime * baseSpeed,
      color: '#3b82f6',
    };
    
    // Circle 2 starts right, moves toward center-left
    const c2: Circle = {
      x: width - CIRCLE_RADIUS - Math.random() * 50, // Start on right edge
      y: y2,
      vx: ((centerX - 50 + Math.random() * 100) - (width - CIRCLE_RADIUS - 25)) / meetTime * baseSpeed,
      vy: ((centerY - 50 + Math.random() * 100) - y2) / meetTime * baseSpeed,
      color: '#ef4444',
    };
    
    return { c1, c2 };
  }, [baseSpeed, width, height]);

  // Check overlap
  const checkOverlap = (c1: Circle, c2: Circle): boolean => {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < CIRCLE_RADIUS * 2;
  };

  // Handle click
  const handleClick = useCallback(() => {
    if (showFeedbackRef.current) return;
    
    const c1 = circle1Ref.current;
    const c2 = circle2Ref.current;
    if (!c1 || !c2) return;
    
    const overlapping = checkOverlap(c1, c2);
    
    if (overlapping) {
      hitsRef.current++;
      setDisplayHits(hitsRef.current);
      showFeedbackRef.current = 'hit';
    } else {
      missesRef.current++;
      setDisplayMisses(missesRef.current);
      showFeedbackRef.current = 'miss';
    }
    
    setTimeout(() => {
      showFeedbackRef.current = null;
      currentRoundRef.current++;
      setDisplayRound(currentRoundRef.current);
      
      if (currentRoundRef.current >= TOTAL_ROUNDS) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify({ 
            hits: hitsRef.current, 
            misses: missesRef.current,
            difficulty
          }),
          response_time_ms: Date.now() - startTimeRef.current,
          is_correct: hitsRef.current >= TOTAL_ROUNDS / 2,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      } else {
        const { c1, c2 } = createCircles();
        circle1Ref.current = c1;
        circle2Ref.current = c2;
      }
    }, 600);
  }, [currentTrialIndex, onTrialComplete, createCircles, difficulty]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset all refs
    startTimeRef.current = Date.now();
    hitsRef.current = 0;
    missesRef.current = 0;
    currentRoundRef.current = 0;
    showFeedbackRef.current = null;
    
    const { c1, c2 } = createCircles();
    circle1Ref.current = c1;
    circle2Ref.current = c2;
    
    setDisplayHits(0);
    setDisplayMisses(0);
    setDisplayRound(0);

    const animate = () => {
      const c1 = circle1Ref.current;
      const c2 = circle2Ref.current;
      
      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      if (c1 && c2 && !showFeedbackRef.current) {
        // Apply gentle attraction toward each other (ensures collision within ~5s)
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const attraction = 0.002; // Subtle pull toward each other
        c1.vx += dx * attraction;
        c1.vy += dy * attraction;
        c2.vx -= dx * attraction;
        c2.vy -= dy * attraction;
        
        // Cap velocity to prevent too fast movement
        const maxSpeed = baseSpeed * 2;
        const speed1 = Math.sqrt(c1.vx * c1.vx + c1.vy * c1.vy);
        const speed2 = Math.sqrt(c2.vx * c2.vx + c2.vy * c2.vy);
        if (speed1 > maxSpeed) {
          c1.vx = (c1.vx / speed1) * maxSpeed;
          c1.vy = (c1.vy / speed1) * maxSpeed;
        }
        if (speed2 > maxSpeed) {
          c2.vx = (c2.vx / speed2) * maxSpeed;
          c2.vy = (c2.vy / speed2) * maxSpeed;
        }
        
        // Update circle 1
        c1.x += c1.vx;
        c1.y += c1.vy;
        
        if (c1.x <= CIRCLE_RADIUS || c1.x >= width - CIRCLE_RADIUS) {
          c1.vx = -c1.vx;
          c1.x = Math.max(CIRCLE_RADIUS, Math.min(width - CIRCLE_RADIUS, c1.x));
        }
        if (c1.y <= CIRCLE_RADIUS || c1.y >= height - CIRCLE_RADIUS) {
          c1.vy = -c1.vy;
          c1.y = Math.max(CIRCLE_RADIUS, Math.min(height - CIRCLE_RADIUS, c1.y));
        }
        
        // Update circle 2
        c2.x += c2.vx;
        c2.y += c2.vy;
        
        if (c2.x <= CIRCLE_RADIUS || c2.x >= width - CIRCLE_RADIUS) {
          c2.vx = -c2.vx;
          c2.x = Math.max(CIRCLE_RADIUS, Math.min(width - CIRCLE_RADIUS, c2.x));
        }
        if (c2.y <= CIRCLE_RADIUS || c2.y >= height - CIRCLE_RADIUS) {
          c2.vy = -c2.vy;
          c2.y = Math.max(CIRCLE_RADIUS, Math.min(height - CIRCLE_RADIUS, c2.y));
        }
        
        // Check overlap
        const overlapping = checkOverlap(c1, c2);
        if (overlapping !== isOverlappingRef.current) {
          isOverlappingRef.current = overlapping;
          setDisplayOverlapping(overlapping);
        }
      }

      // Draw circles
      if (c1) {
        ctx.fillStyle = c1.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(c1.x, c1.y, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      if (c2) {
        ctx.fillStyle = c2.color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(c2.x, c2.y, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Round: ${currentRoundRef.current + 1} / ${TOTAL_ROUNDS}`, 20, 30);
      ctx.fillText(`Hits: ${hitsRef.current}`, 20, 55);
      ctx.fillText(`Level ${difficulty}`, width - 100, 30);

      // Feedback overlay
      if (showFeedbackRef.current) {
        ctx.fillStyle = showFeedbackRef.current === 'hit' ? '#22c55e80' : '#ef444480';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(showFeedbackRef.current === 'hit' ? 'HIT!' : 'MISS!', width / 2, height / 2);
        ctx.textAlign = 'left';
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrialIndex, difficulty, baseSpeed, createCircles]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click when the circles overlap!</h2>
      
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Round {displayRound + 1} of {TOTAL_ROUNDS}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="rounded-2xl cursor-pointer border-2 border-slate-600"
      />
      
      <div className="flex gap-8 text-white text-lg">
        <span className="text-green-400">Hits: {displayHits}</span>
        <span className="text-red-400">Misses: {displayMisses}</span>
        <span className={displayOverlapping ? 'text-yellow-400 animate-pulse font-bold' : 'text-slate-500'}>
          {displayOverlapping ? '⚡ OVERLAPPING!' : 'Waiting...'}
        </span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Click anywhere when the blue and red circles overlap
      </p>
    </div>
  );
}
