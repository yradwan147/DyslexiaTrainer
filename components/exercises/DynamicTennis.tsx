'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 12;
const TOTAL_HITS = 10;
const SUCCESS_THRESHOLD = 7; // Need 7/10 to increase speed
const SPEED_INCREASE = 0.03; // 3% speed increase
const BASE_SPEED = 3;
const PADDLE_SPEED = 8;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
  active: boolean;
}

export function DynamicTennis({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [showFeedback, setShowFeedback] = useState<'hit' | 'miss' | null>(null);
  const ballRef = useRef<Ball | null>(null);
  const paddleXRef = useRef<number>(0.5);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const width = 700;
  const height = 500;
  const paddleY = height - 40;

  // Calculate current speed based on level
  const currentSpeed = BASE_SPEED * (1 + (speedLevel - 1) * SPEED_INCREASE);

  // Create a new ball with random trajectory that bounces 2-3 times
  const createBall = useCallback(() => {
    const startX = Math.random() * (width - 100) + 50;
    const startY = 50;
    
    // Random horizontal velocity
    const vx = (Math.random() - 0.5) * currentSpeed * 1.5;
    const vy = currentSpeed;
    
    return {
      x: startX,
      y: startY,
      vx,
      vy,
      bounces: 0,
      active: true,
    };
  }, [currentSpeed, width]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = true;
      if (e.key === 'ArrowRight') keysRef.current.right = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false;
      if (e.key === 'ArrowRight') keysRef.current.right = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Complete the trial
  const completeTrial = useCallback((finalHits: number, finalMisses: number) => {
    const newSpeedLevel = finalHits >= SUCCESS_THRESHOLD ? speedLevel + 1 : speedLevel;
    
    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: JSON.stringify({ 
        hits: finalHits, 
        misses: finalMisses,
        speedLevel: newSpeedLevel 
      }),
      response_time_ms: Date.now() - startTimeRef.current,
      is_correct: finalHits >= SUCCESS_THRESHOLD,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
    
    if (finalHits >= SUCCESS_THRESHOLD) {
      setSpeedLevel(prev => prev + 1);
    }
  }, [speedLevel, currentTrialIndex, onTrialComplete]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();
    setHits(0);
    setMisses(0);
    setCurrentRound(0);
    paddleXRef.current = 0.5;
    ballRef.current = createBall();

    let localHits = 0;
    let localMisses = 0;
    let localRound = 0;
    let feedbackTimer: NodeJS.Timeout | null = null;

    const animate = () => {
      const ball = ballRef.current;
      
      // Update paddle position based on arrow keys
      if (keysRef.current.left) {
        paddleXRef.current = Math.max(PADDLE_WIDTH / 2 / width, paddleXRef.current - PADDLE_SPEED / width);
      }
      if (keysRef.current.right) {
        paddleXRef.current = Math.min(1 - PADDLE_WIDTH / 2 / width, paddleXRef.current + PADDLE_SPEED / width);
      }
      
      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Draw court lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddle at bottom
      const paddleX = paddleXRef.current * width;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(paddleX - PADDLE_WIDTH / 2, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
      
      // Paddle highlight
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(paddleX - PADDLE_WIDTH / 2, paddleY, PADDLE_WIDTH, 4);

      // Update and draw ball
      if (ball && ball.active && !showFeedback) {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off side edges
        if (ball.x <= BALL_RADIUS || ball.x >= width - BALL_RADIUS) {
          ball.vx = -ball.vx;
          ball.bounces++;
          ball.x = Math.max(BALL_RADIUS, Math.min(width - BALL_RADIUS, ball.x));
        }
        
        // Bounce off top
        if (ball.y <= BALL_RADIUS) {
          ball.vy = Math.abs(ball.vy);
          ball.bounces++;
          ball.y = BALL_RADIUS;
        }

        // After 2-3 bounces, ensure ball heads downward
        if (ball.bounces >= 2 && ball.vy < 0) {
          ball.vy = Math.abs(ball.vy);
        }

        // Check paddle collision
        if (ball.y >= paddleY - BALL_RADIUS && ball.y <= paddleY + PADDLE_HEIGHT) {
          if (ball.x >= paddleX - PADDLE_WIDTH / 2 - BALL_RADIUS && 
              ball.x <= paddleX + PADDLE_WIDTH / 2 + BALL_RADIUS) {
            // Hit!
            ball.active = false;
            localHits++;
            setHits(localHits);
            setShowFeedback('hit');
            
            feedbackTimer = setTimeout(() => {
              setShowFeedback(null);
              localRound++;
              setCurrentRound(localRound);
              
              if (localRound >= TOTAL_HITS) {
                completeTrial(localHits, localMisses);
              } else {
                ballRef.current = createBall();
              }
            }, 600);
          }
        }

        // Check if ball missed paddle (went past)
        if (ball.y >= height) {
          ball.active = false;
          localMisses++;
          setMisses(localMisses);
          setShowFeedback('miss');
          
          feedbackTimer = setTimeout(() => {
            setShowFeedback(null);
            localRound++;
            setCurrentRound(localRound);
            
            if (localRound >= TOTAL_HITS) {
              completeTrial(localHits, localMisses);
            } else {
              ballRef.current = createBall();
            }
          }, 600);
        }

        // Draw ball
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball outline
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (ball && !showFeedback) {
        // Draw stationary ball
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Round: ${localRound + 1} / ${TOTAL_HITS}`, 20, 30);
      ctx.fillText(`Hits: ${localHits}`, 20, 55);
      ctx.fillText(`Speed Level: ${speedLevel}`, width - 150, 30);

      // Feedback overlay
      if (showFeedback) {
        ctx.fillStyle = showFeedback === 'hit' ? '#22c55e80' : '#ef444480';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(showFeedback === 'hit' ? 'HIT!' : 'MISS!', width / 2, height / 2);
        ctx.textAlign = 'left';
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
      }
    };
  }, [currentTrialIndex, createBall, width, height, paddleY, showFeedback, speedLevel, completeTrial]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Use arrow keys to catch the ball!</h2>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-2xl border-2 border-slate-600"
        tabIndex={0}
      />
      
      <div className="flex gap-8 text-white text-lg">
        <span className="text-green-400">Hits: {hits}</span>
        <span className="text-red-400">Misses: {misses}</span>
        <span className="text-blue-400">Speed: {speedLevel}</span>
      </div>
      
      <p className="text-slate-400 text-sm">
        Use ← and → arrow keys to move the paddle. Score {SUCCESS_THRESHOLD}+ to increase speed!
      </p>
    </div>
  );
}
