'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 12;
const TOTAL_ROUNDS = 10;
const PADDLE_SPEED = 10;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export function DynamicTennis({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  
  // Use refs for animation values
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const currentRoundRef = useRef(0);
  const showFeedbackRef = useRef<'hit' | 'miss' | null>(null);
  const feedbackPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const ballRef = useRef<Ball | null>(null);
  const paddleXRef = useRef(0.5);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const gameStartedRef = useRef(false);
  
  // State for display only
  const [displayHits, setDisplayHits] = useState(0);
  const [displayMisses, setDisplayMisses] = useState(0);
  const [displayRound, setDisplayRound] = useState(0);

  // Responsive canvas sizing
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 500 });
  const sizeRef = useRef({ width: 700, height: 500 });

  useEffect(() => {
    const updateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const size = {
        width: Math.max(400, Math.min(vw - 40, 1200)),
        height: Math.max(300, vh - 200),
      };
      sizeRef.current = size;
      setCanvasSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Speed based on difficulty (1-5)
  const difficulty = config.difficulty_level || 1;
  // Cap Level 5 speed to equal Level 4.
  const cappedDifficulty = Math.min(difficulty, 4);
  const baseSpeed = 2 + cappedDifficulty * 0.8; // 2.8, 3.6, 4.4, 5.2, 5.2
  // Paddle width decreases with difficulty
  const actualPaddleWidth = PADDLE_WIDTH - (difficulty - 1) * 10; // 100, 90, 80, 70, 60

  // Create a new ball
  const createBall = useCallback((): Ball => {
    const { width } = sizeRef.current;
    const startX = Math.random() * (width - 100) + 50;
    const startY = 50;

    return {
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * baseSpeed * 1.5,
      vy: baseSpeed,
      active: true,
    };
  }, [baseSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // First keypress starts the game
      if (!gameStartedRef.current) {
        gameStartedRef.current = true;
        ballRef.current = createBall();
        startTimeRef.current = Date.now();
      }
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
  }, [createBall]);

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
    paddleXRef.current = 0.5;
    gameStartedRef.current = false;
    ballRef.current = null;

    setDisplayHits(0);
    setDisplayMisses(0);
    setDisplayRound(0);

    let feedbackTimeout: NodeJS.Timeout | null = null;

    const animate = () => {
      const ball = ballRef.current;
      const { width, height } = sizeRef.current;
      const paddleY = height - 40;

      // Sync canvas buffer size with current dimensions
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Update paddle position based on arrow keys
      if (keysRef.current.left) {
        paddleXRef.current = Math.max(actualPaddleWidth / 2 / width, paddleXRef.current - PADDLE_SPEED / width);
      }
      if (keysRef.current.right) {
        paddleXRef.current = Math.min(1 - actualPaddleWidth / 2 / width, paddleXRef.current + PADDLE_SPEED / width);
      }

      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Show "Press any key to start" if game hasn't started
      if (!gameStartedRef.current) {
        // Still draw paddle
        const paddleX = paddleXRef.current * width;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(paddleX - actualPaddleWidth / 2, paddleY, actualPaddleWidth, PADDLE_HEIGHT);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(paddleX - actualPaddleWidth / 2, paddleY, actualPaddleWidth, 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press any key to start', width / 2, height / 2);
        ctx.textAlign = 'left';
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Draw court lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddle
      const paddleX = paddleXRef.current * width;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(paddleX - actualPaddleWidth / 2, paddleY, actualPaddleWidth, PADDLE_HEIGHT);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(paddleX - actualPaddleWidth / 2, paddleY, actualPaddleWidth, 4);

      // Update ball if active and no feedback showing
      if (ball && ball.active && !showFeedbackRef.current) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off sides
        if (ball.x <= BALL_RADIUS || ball.x >= width - BALL_RADIUS) {
          ball.vx = -ball.vx;
          ball.x = Math.max(BALL_RADIUS, Math.min(width - BALL_RADIUS, ball.x));
        }

        // Bounce off top
        if (ball.y <= BALL_RADIUS) {
          ball.vy = Math.abs(ball.vy);
          ball.y = BALL_RADIUS;
        }

        // Check paddle collision
        if (ball.y >= paddleY - BALL_RADIUS && ball.y <= paddleY + PADDLE_HEIGHT) {
          if (ball.x >= paddleX - actualPaddleWidth / 2 - BALL_RADIUS && 
              ball.x <= paddleX + actualPaddleWidth / 2 + BALL_RADIUS) {
            // Hit!
            ball.active = false;
            hitsRef.current++;
            setDisplayHits(hitsRef.current);
            showFeedbackRef.current = 'hit';
            feedbackPosRef.current = { x: ball.x, y: ball.y };
            
            feedbackTimeout = setTimeout(() => {
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
                  score_correct: hitsRef.current,
                  score_total: TOTAL_ROUNDS,
                  is_timed_out: false,
                  is_skipped: false,
                  started_at: new Date(startTimeRef.current).toISOString(),
                  responded_at: new Date().toISOString(),
                });
              } else {
                ballRef.current = createBall();
              }
            }, 600);
          }
        }

        // Check if ball missed paddle
        if (ball.y >= height) {
          ball.active = false;
          missesRef.current++;
          setDisplayMisses(missesRef.current);
          showFeedbackRef.current = 'miss';
          feedbackPosRef.current = { x: ball.x, y: Math.min(ball.y, height - 30) };
          
          feedbackTimeout = setTimeout(() => {
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
                score_correct: hitsRef.current,
                score_total: TOTAL_ROUNDS,
                is_timed_out: false,
                is_skipped: false,
                started_at: new Date(startTimeRef.current).toISOString(),
                responded_at: new Date().toISOString(),
              });
            } else {
              ballRef.current = createBall();
            }
          }, 600);
        }
      }

      // Draw ball with feedback-aware colors
      if (ball) {
        const isHitFeedback = showFeedbackRef.current === 'hit';
        const isMissFeedback = showFeedbackRef.current === 'miss';

        const ballColor = isHitFeedback ? '#22c55e' : isMissFeedback ? '#ef4444' : '#fbbf24';
        const strokeColor = isHitFeedback ? '#16a34a' : isMissFeedback ? '#dc2626' : '#f59e0b';

        ctx.fillStyle = ballColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw small feedback text near ball area (no full-screen flash)
      if (showFeedbackRef.current) {
        const fbPos = feedbackPosRef.current;
        ctx.fillStyle = showFeedbackRef.current === 'hit' ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          showFeedbackRef.current === 'hit' ? 'HIT!' : 'MISS!',
          fbPos.x,
          fbPos.y - 30
        );
        ctx.textAlign = 'left';
      }

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Round: ${currentRoundRef.current + 1} / ${TOTAL_ROUNDS}`, 20, 30);
      ctx.fillText(`Hits: ${hitsRef.current}`, 20, 55);
      ctx.fillText(`Level ${difficulty}`, width - 100, 30);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
    };
  }, [currentTrialIndex, difficulty, actualPaddleWidth]); // Minimal dependencies

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Use arrow keys to catch the ball!</h2>
      
      <div className="flex items-center gap-4 text-slate-300">
        <span className="text-lg">Round {displayRound + 1} of {TOTAL_ROUNDS}</span>
        <span className="px-2 py-1 bg-slate-700 rounded text-sm">
          Level {difficulty} • Paddle: {actualPaddleWidth}px
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="rounded-2xl border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        tabIndex={0}
        autoFocus
      />
      
      <div className="flex gap-8 text-white text-lg">
        <span className="text-green-400">Hits: {displayHits}</span>
        <span className="text-red-400">Misses: {displayMisses}</span>
      </div>
    </div>
  );
}
