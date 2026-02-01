'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const GOAL_WIDTH = 150;
const GOAL_HEIGHT = 60;
const BALL_RADIUS = 15;
const TOTAL_ROUNDS = 10;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
  active: boolean;
}

export function DynamicFootball({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  
  // Use refs for values that change during animation to avoid re-render loops
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const currentRoundRef = useRef(0);
  const showFeedbackRef = useRef<'hit' | 'miss' | null>(null);
  const ballRef = useRef<Ball | null>(null);
  
  // State only for display updates
  const [displayHits, setDisplayHits] = useState(0);
  const [displayMisses, setDisplayMisses] = useState(0);
  const [displayRound, setDisplayRound] = useState(0);

  const width = 700;
  const height = 500;
  const goalX = (width - GOAL_WIDTH) / 2;
  const goalY = height - GOAL_HEIGHT - 10;

  // Speed based on difficulty (1-5) - more noticeable difference
  const difficulty = config.difficulty_level || 1;
  const baseSpeed = 1.5 + difficulty * 1.0; // Level 1: 2.5, Level 2: 3.5, Level 3: 4.5, Level 4: 5.5, Level 5: 6.5

  // Create a new ball - ALWAYS passes through the CENTER of the green goal area
  const createBall = useCallback((): Ball => {
    // Start from random position at top
    const startX = Math.random() * (width - 200) + 100;
    const startY = 30 + Math.random() * 20;
    
    // Target is the EXACT CENTER of the goal, with tiny random offset
    const goalCenterX = goalX + GOAL_WIDTH / 2;
    const goalCenterY = goalY + GOAL_HEIGHT / 2;
    
    // Very small offset - max 20px from center (goal is 150px wide)
    // This ensures ball is always clearly in the middle of the green area
    const maxOffset = 20;
    const targetX = goalCenterX + (Math.random() - 0.5) * maxOffset;
    
    // Calculate direct path to target
    const dx = targetX - startX;
    const dy = goalCenterY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and scale by speed
    const vx = (dx / distance) * baseSpeed;
    const vy = (dy / distance) * baseSpeed;
    
    return {
      x: startX,
      y: startY,
      vx,
      vy,
      bounces: 0,
      active: true,
    };
  }, [baseSpeed, goalX, goalY, width]);

  // Handle click
  const handleClick = useCallback(() => {
    const ball = ballRef.current;
    if (!ball || !ball.active || showFeedbackRef.current) return;
    
    // Check if ball is clearly inside the goal area:
    // - Horizontally: entire ball must be inside (looks right visually)
    // - Vertically: ball center must be inside (since ball passes through quickly)
    const inGoalX = ball.x - BALL_RADIUS >= goalX && ball.x + BALL_RADIUS <= goalX + GOAL_WIDTH;
    const inGoalY = ball.y >= goalY && ball.y <= goalY + GOAL_HEIGHT;
    
    ball.active = false;
    
    if (inGoalX && inGoalY) {
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
        ballRef.current = createBall();
      }
    }, 800);
  }, [goalX, goalY, currentTrialIndex, onTrialComplete, createBall, difficulty]);

  // Animation loop - only depends on stable values
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
    ballRef.current = createBall();
    
    // Reset display state
    setDisplayHits(0);
    setDisplayMisses(0);
    setDisplayRound(0);

    const animate = () => {
      const ball = ballRef.current;
      
      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw field lines
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw goal at bottom center
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(goalX, goalY, GOAL_WIDTH, GOAL_HEIGHT);
      
      // Goal posts
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalX - 5, goalY - 30, 10, GOAL_HEIGHT + 30);
      ctx.fillRect(goalX + GOAL_WIDTH - 5, goalY - 30, 10, GOAL_HEIGHT + 30);
      ctx.fillRect(goalX - 5, goalY - 30, GOAL_WIDTH + 10, 8);
      
      // Goal net pattern
      ctx.strokeStyle = '#ffffff40';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(goalX + i * (GOAL_WIDTH / 5), goalY);
        ctx.lineTo(goalX + i * (GOAL_WIDTH / 5), goalY + GOAL_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(goalX, goalY + i * (GOAL_HEIGHT / 2));
        ctx.lineTo(goalX + GOAL_WIDTH, goalY + i * (GOAL_HEIGHT / 2));
        ctx.stroke();
      }

      // Update and draw ball
      if (ball && ball.active && !showFeedbackRef.current) {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off side edges - redirect towards goal center
        if (ball.x <= BALL_RADIUS) {
          ball.vx = Math.abs(ball.vx);
          ball.x = BALL_RADIUS;
        }
        if (ball.x >= width - BALL_RADIUS) {
          ball.vx = -Math.abs(ball.vx);
          ball.x = width - BALL_RADIUS;
        }
        
        // Bounce off top
        if (ball.y <= BALL_RADIUS) {
          ball.vy = Math.abs(ball.vy);
          ball.y = BALL_RADIUS;
        }

        // STRONG correction to keep ball heading to goal center
        const goalCenterX = goalX + GOAL_WIDTH / 2;
        const distanceFromCenter = goalCenterX - ball.x;
        
        // Very strong correction - ball will always curve towards center
        ball.vx += distanceFromCenter * 0.008;
        
        // Check if ball passed goal without click (miss)
        if (ball.y >= goalY + GOAL_HEIGHT + BALL_RADIUS) {
          ball.active = false;
          missesRef.current++;
          setDisplayMisses(missesRef.current);
          showFeedbackRef.current = 'miss';
          
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
              ballRef.current = createBall();
            }
          }, 800);
        }
      }

      // Draw ball
      if (ball) {
        // Check if ball is in the goal zone (matches hit detection logic)
        // Horizontally: entire ball inside, Vertically: center inside
        const inGoalZone = ball.x - BALL_RADIUS >= goalX && 
                          ball.x + BALL_RADIUS <= goalX + GOAL_WIDTH &&
                          ball.y >= goalY && 
                          ball.y <= goalY + GOAL_HEIGHT;
        
        // Glow effect when in goal zone
        if (inGoalZone && ball.active) {
          ctx.fillStyle = '#22c55e';
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, BALL_RADIUS + 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = inGoalZone && ball.active ? '#22c55e' : '#333';
        ctx.lineWidth = inGoalZone && ball.active ? 3 : 2;
        ctx.stroke();
        
        // Soccer ball pattern
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ball.x - 5, ball.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ball.x + 5, ball.y + 3, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw score (using refs for current values)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Round: ${currentRoundRef.current + 1} / ${TOTAL_ROUNDS}`, 20, 30);
      ctx.fillText(`Goals: ${hitsRef.current}`, 20, 55);
      ctx.fillText(`Level ${difficulty}`, width - 100, 30);

      // Feedback overlay
      if (showFeedbackRef.current) {
        ctx.fillStyle = showFeedbackRef.current === 'hit' ? '#22c55e80' : '#ef444480';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(showFeedbackRef.current === 'hit' ? 'GOAL!' : 'MISS!', width / 2, height / 2);
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
  }, [currentTrialIndex, difficulty]); // Only restart when trial or difficulty changes

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click when the ball enters the goal!</h2>
      
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
        <span className="text-green-400">Goals: {displayHits}</span>
        <span className="text-red-400">Misses: {displayMisses}</span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Click anywhere when the ball is inside the goal area
      </p>
    </div>
  );
}
