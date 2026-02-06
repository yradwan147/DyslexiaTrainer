'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseProps } from '@/lib/exercises/types';

const GOAL_WIDTH = 150;
const GOAL_HEIGHT = 60;
const GOAL_POST_EXTENSION = 30; // visible post height above crossbar
const BALL_RADIUS = 15;
const TOTAL_ROUNDS = 10;

interface Ball {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number; // 0 to 1
  speed: number;    // progress increment per frame
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

  // Speed based on difficulty (1-5) - exponential scaling for harder high levels
  const difficulty = config.difficulty_level || 1;
  // Speed is progress per frame. Cap Level 5 to equal Level 4.
  // Level 1: ~4 sec, Level 2: ~2.5 sec, Level 3: ~1.5 sec, Level 4: ~1 sec, Level 5: ~1 sec
  const speedLevels = [0.004, 0.007, 0.012, 0.018, 0.018];
  const ballSpeed = speedLevels[difficulty - 1] || 0.012;

  // Create a new ball - uses parametric path from top to goal center
  const createBall = useCallback((): Ball => {
    // Start from random position at top
    const startX = 80 + Math.random() * (width - 160);
    const startY = 20 + Math.random() * 30;
    
    // End point is ALWAYS inside the goal center area
    // Small random offset to add some variety (max ±40px from center in a 150px goal)
    const goalCenterX = goalX + GOAL_WIDTH / 2;
    const goalCenterY = goalY + GOAL_HEIGHT / 2;
    const endX = goalCenterX + (Math.random() - 0.5) * 60;
    const endY = goalCenterY;
    
    return {
      startX,
      startY,
      endX,
      endY,
      progress: 0,
      speed: ballSpeed,
      active: true,
    };
  }, [ballSpeed, goalX, goalY, width]);

  // Get current ball position based on progress
  const getBallPosition = useCallback((ball: Ball) => {
    const x = ball.startX + (ball.endX - ball.startX) * ball.progress;
    const y = ball.startY + (ball.endY - ball.startY) * ball.progress;
    return { x, y };
  }, []);

  // Handle click
  const handleClick = useCallback(() => {
    const ball = ballRef.current;
    if (!ball || !ball.active || showFeedbackRef.current) return;
    
    const { x, y } = getBallPosition(ball);
    
    // Check if ball is inside the full (visible) goal area, including posts/crossbar region.
    const goalHitboxX = goalX - 5;
    const goalHitboxY = goalY - GOAL_POST_EXTENSION;
    const goalHitboxW = GOAL_WIDTH + 10;
    const goalHitboxH = GOAL_HEIGHT + GOAL_POST_EXTENSION;

    const inGoalX = x >= goalHitboxX && x <= goalHitboxX + goalHitboxW;
    const inGoalY = y >= goalHitboxY && y <= goalHitboxY + goalHitboxH;
    
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
  }, [goalX, goalY, currentTrialIndex, onTrialComplete, createBall, difficulty, getBallPosition]);

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
      // Full goal area (match hitbox)
      ctx.fillRect(goalX - 5, goalY - GOAL_POST_EXTENSION, GOAL_WIDTH + 10, GOAL_HEIGHT + GOAL_POST_EXTENSION);
      
      // Goal posts
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(goalX - 5, goalY - GOAL_POST_EXTENSION, 10, GOAL_HEIGHT + GOAL_POST_EXTENSION);
      ctx.fillRect(goalX + GOAL_WIDTH - 5, goalY - GOAL_POST_EXTENSION, 10, GOAL_HEIGHT + GOAL_POST_EXTENSION);
      ctx.fillRect(goalX - 5, goalY - GOAL_POST_EXTENSION, GOAL_WIDTH + 10, 8);
      
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

      // Update ball progress
      if (ball && ball.active && !showFeedbackRef.current) {
        // Advance progress along the path
        ball.progress += ball.speed;
        
        // Check if ball has passed through goal (progress > 1.1 means past the target)
        if (ball.progress >= 1.15) {
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
        // Calculate current position from progress
        const ballX = ball.startX + (ball.endX - ball.startX) * ball.progress;
        const ballY = ball.startY + (ball.endY - ball.startY) * ball.progress;
        
        // Check if ball is in the full visible goal zone (match hitbox)
        const goalHitboxX = goalX - 5;
        const goalHitboxY = goalY - GOAL_POST_EXTENSION;
        const goalHitboxW = GOAL_WIDTH + 10;
        const goalHitboxH = GOAL_HEIGHT + GOAL_POST_EXTENSION;

        const inGoalZone =
          ballX >= goalHitboxX &&
          ballX <= goalHitboxX + goalHitboxW &&
          ballY >= goalHitboxY &&
          ballY <= goalHitboxY + goalHitboxH;
        
        // Glow effect when in goal zone
        if (inGoalZone && ball.active) {
          ctx.fillStyle = '#22c55e';
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(ballX, ballY, BALL_RADIUS + 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = inGoalZone && ball.active ? '#22c55e' : '#333';
        ctx.lineWidth = inGoalZone && ball.active ? 3 : 2;
        ctx.stroke();
        
        // Soccer ball pattern
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ballX - 5, ballY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ballX + 5, ballY + 3, 4, 0, Math.PI * 2);
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
