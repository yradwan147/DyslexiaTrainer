'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const GOAL_WIDTH = 150;
const GOAL_HEIGHT = 60;
const BALL_RADIUS = 15;
const TOTAL_GOALS = 10;
const SUCCESS_THRESHOLD = 7; // Need 7/10 to increase speed
const SPEED_INCREASE = 0.03; // 3% speed increase
const BASE_SPEED = 3;

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
  const startTimeRef = useRef<number>(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentGoal, setCurrentGoal] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [showFeedback, setShowFeedback] = useState<'hit' | 'miss' | null>(null);
  const ballRef = useRef<Ball | null>(null);

  const width = 700;
  const height = 500;
  const goalX = (width - GOAL_WIDTH) / 2;
  const goalY = height - GOAL_HEIGHT - 10;

  // Calculate current speed based on level
  const currentSpeed = BASE_SPEED * (1 + (speedLevel - 1) * SPEED_INCREASE);

  // Create a new ball with random trajectory that bounces 2-3 times
  const createBall = useCallback(() => {
    const startX = Math.random() * (width - 100) + 50;
    const startY = 50 + Math.random() * 50;
    
    // Calculate angle towards goal with some randomness
    const targetX = width / 2;
    const targetY = goalY;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Add randomness to trajectory
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
    
    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * currentSpeed,
      vy: Math.sin(angle) * currentSpeed,
      bounces: 0,
      active: true,
    };
  }, [currentSpeed, goalY, width]);

  // Handle click
  const handleClick = useCallback(() => {
    if (!ballRef.current || !ballRef.current.active || showFeedback) return;
    
    const ball = ballRef.current;
    
    // Check if ball is in goal area
    const inGoalX = ball.x >= goalX && ball.x <= goalX + GOAL_WIDTH;
    const inGoalY = ball.y >= goalY - BALL_RADIUS && ball.y <= goalY + GOAL_HEIGHT;
    
    if (inGoalX && inGoalY) {
      setHits(prev => prev + 1);
      setShowFeedback('hit');
    } else {
      setMisses(prev => prev + 1);
      setShowFeedback('miss');
    }
    
    ball.active = false;
    
    setTimeout(() => {
      setShowFeedback(null);
      const nextGoal = currentGoal + 1;
      
      if (nextGoal >= TOTAL_GOALS) {
        // Trial complete
        const totalHits = hits + (showFeedback === 'hit' ? 0 : 0); // Already updated above
        const newSpeedLevel = totalHits >= SUCCESS_THRESHOLD ? speedLevel + 1 : speedLevel;
        
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: JSON.stringify({ 
            hits: hits + (inGoalX && inGoalY ? 1 : 0), 
            misses: misses + (!inGoalX || !inGoalY ? 1 : 0),
            speedLevel: newSpeedLevel 
          }),
          response_time_ms: Date.now() - startTimeRef.current,
          is_correct: totalHits >= SUCCESS_THRESHOLD,
          is_timed_out: false,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
        
        // Update speed for next session if successful
        if (hits + (inGoalX && inGoalY ? 1 : 0) >= SUCCESS_THRESHOLD) {
          setSpeedLevel(prev => prev + 1);
        }
      } else {
        setCurrentGoal(nextGoal);
        ballRef.current = createBall();
      }
    }, 800);
  }, [showFeedback, goalX, goalY, hits, misses, currentGoal, speedLevel, currentTrialIndex, onTrialComplete, createBall]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();
    setHits(0);
    setMisses(0);
    setCurrentGoal(0);
    ballRef.current = createBall();

    const animate = () => {
      const ball = ballRef.current;
      
      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

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
      if (ball && ball.active) {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off edges (2-3 times before heading to goal)
        if (ball.x <= BALL_RADIUS || ball.x >= width - BALL_RADIUS) {
          ball.vx = -ball.vx;
          ball.bounces++;
          ball.x = Math.max(BALL_RADIUS, Math.min(width - BALL_RADIUS, ball.x));
        }
        if (ball.y <= BALL_RADIUS) {
          ball.vy = Math.abs(ball.vy);
          ball.bounces++;
          ball.y = BALL_RADIUS;
        }

        // After enough bounces, bias towards goal
        if (ball.bounces >= 2 && ball.y < goalY - 100) {
          const targetX = goalX + GOAL_WIDTH / 2;
          const dx = targetX - ball.x;
          ball.vx += dx * 0.001;
        }

        // Draw ball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball pattern
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        
        // Check if ball entered goal without click (miss)
        if (ball.y >= goalY + GOAL_HEIGHT) {
          ball.active = false;
          setMisses(prev => prev + 1);
          setShowFeedback('miss');
          
          setTimeout(() => {
            setShowFeedback(null);
            const nextGoal = currentGoal + 1;
            if (nextGoal >= TOTAL_GOALS) {
              onTrialComplete({
                trial_index: currentTrialIndex,
                user_response: JSON.stringify({ hits, misses: misses + 1, speedLevel }),
                response_time_ms: Date.now() - startTimeRef.current,
                is_correct: hits >= SUCCESS_THRESHOLD,
                is_timed_out: false,
                is_skipped: false,
                started_at: new Date(startTimeRef.current).toISOString(),
                responded_at: new Date().toISOString(),
              });
            } else {
              setCurrentGoal(nextGoal);
              ballRef.current = createBall();
            }
          }, 800);
        }
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Goals: ${currentGoal + 1} / ${TOTAL_GOALS}`, 20, 30);
      ctx.fillText(`Hits: ${hits}`, 20, 55);
      ctx.fillText(`Speed Level: ${speedLevel}`, width - 150, 30);

      // Feedback overlay
      if (showFeedback) {
        ctx.fillStyle = showFeedback === 'hit' ? '#22c55e80' : '#ef444480';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(showFeedback === 'hit' ? 'GOAL!' : 'MISS!', width / 2, height / 2);
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
  }, [currentTrialIndex, createBall, goalX, goalY, width, height, currentGoal, hits, misses, showFeedback, speedLevel, onTrialComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Click when the ball enters the goal!</h2>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        className="rounded-2xl cursor-pointer border-2 border-slate-600"
      />
      
      <div className="flex gap-8 text-white text-lg">
        <span className="text-green-400">Hits: {hits}</span>
        <span className="text-red-400">Misses: {misses}</span>
        <span className="text-blue-400">Speed: {speedLevel}</span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Click anywhere when the ball is inside the goal. Score {SUCCESS_THRESHOLD}+ to increase speed!
      </p>
    </div>
  );
}
