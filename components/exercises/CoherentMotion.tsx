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
  birthTime: number; // For dot lifetime
}

// Constants based on research specifications
const DOTS_PER_FIELD = 300;
const DOT_LIFETIME_MS = 225; // Dots regenerate after 225ms
const DOT_SPEED = 3; // Pixels per frame (approximating 7 deg/s)
const STIMULUS_DURATION_MS = 3000; // 3 seconds per stimulus
const INITIAL_COHERENCE = 30; // Start at 30%
const COHERENCE_STEP = 1; // Adjust by 1%

export function CoherentMotion({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [hasResponded, setHasResponded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);
  const [trialCount, setTrialCount] = useState(0);
  const [currentCoherence, setCurrentCoherence] = useState(INITIAL_COHERENCE);

  const trial = config.trials[currentTrialIndex] as CoherentMotionTrialConfig;
  const { seed, coherent_side, motion_direction } = trial;
  
  // Use current coherence level (which adapts based on performance)
  const coherence_percent = currentCoherence;

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle response
  const handleResponse = useCallback((side: 'left' | 'right') => {
    if (hasResponded) return;
    setHasResponded(true);

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = side === coherent_side;
    
    // Show feedback
    setShowFeedback(isCorrect);
    
    // Adjust coherence based on staircase method
    setTimeout(() => {
      if (isCorrect) {
        // Decrease coherence (make it harder) by 1%
        setCurrentCoherence(prev => Math.max(1, prev - COHERENCE_STEP));
      } else {
        // Increase coherence (make it easier) by 1%
        setCurrentCoherence(prev => Math.min(100, prev + COHERENCE_STEP));
      }
      
      setShowFeedback(null);
      setTrialCount(prev => prev + 1);
      
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
    }, 1000);
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
    
    // Calculate field dimensions with proper spacing
    const fieldWidth = width * 0.35;
    const fieldHeight = height * 0.8;
    const gap = width * 0.1; // ~5 degrees visual angle equivalent
    const leftFieldX = (width - 2 * fieldWidth - gap) / 2;
    const rightFieldX = leftFieldX + fieldWidth + gap;
    const fieldY = (height - fieldHeight) / 2;

    // Create dots for each field with lifetime tracking
    const rng = createSeededRandom(seed + currentTrialIndex);
    
    const createDot = (fieldX: number, isCoherentField: boolean, time: number): Dot => {
      const isCoherent = isCoherentField && rng.next() < coherence_percent / 100;
      const angle = isCoherent 
        ? (motion_direction === 'right' ? 0 : Math.PI)
        : rng.next() * Math.PI * 2;
      
      return {
        x: fieldX + rng.next() * fieldWidth,
        y: fieldY + rng.next() * fieldHeight,
        vx: Math.cos(angle) * DOT_SPEED,
        vy: Math.sin(angle) * DOT_SPEED,
        isCoherent,
        birthTime: time,
      };
    };

    const createDots = (fieldX: number, isCoherentField: boolean): Dot[] => {
      const dots: Dot[] = [];
      for (let i = 0; i < DOTS_PER_FIELD; i++) {
        // Stagger birth times for natural dot lifetime distribution
        const birthTime = -rng.next() * DOT_LIFETIME_MS;
        dots.push(createDot(fieldX, isCoherentField, birthTime));
      }
      return dots;
    };

    const leftDots = createDots(leftFieldX, coherent_side === 'left');
    const rightDots = createDots(rightFieldX, coherent_side === 'right');

    // Animation loop
    const animate = () => {
      const currentTime = Date.now() - startTimeRef.current;
      
      // Dark background for high contrast
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw field backgrounds (very dark, almost black)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(leftFieldX, fieldY, fieldWidth, fieldHeight);
      ctx.fillRect(rightFieldX, fieldY, fieldWidth, fieldHeight);

      // Update and draw dots with lifetime
      const updateDots = (dots: Dot[], fieldX: number, isCoherentField: boolean) => {
        ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i];
          const age = currentTime - dot.birthTime;
          
          // Regenerate dot if lifetime exceeded
          if (age > DOT_LIFETIME_MS) {
            dots[i] = createDot(fieldX, isCoherentField, currentTime);
            continue;
          }
          
          // Update position
          dot.x += dot.vx;
          dot.y += dot.vy;

          // Wrap around within field
          if (dot.x < fieldX) dot.x = fieldX + fieldWidth;
          if (dot.x > fieldX + fieldWidth) dot.x = fieldX;
          if (dot.y < fieldY) dot.y = fieldY + fieldHeight;
          if (dot.y > fieldY + fieldHeight) dot.y = fieldY;

          // Draw dot (high luminance for contrast)
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      updateDots(leftDots, leftFieldX, coherent_side === 'left');
      updateDots(rightDots, rightFieldX, coherent_side === 'right');

      // Check timeout
      if (currentTime > STIMULUS_DURATION_MS && !hasResponded) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: '',
          response_time_ms: STIMULUS_DURATION_MS,
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
  }, [seed, coherence_percent, coherent_side, motion_direction, currentTrialIndex, onTrialComplete, hasResponded]);

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
    <div 
      ref={containerRef}
      className={`flex flex-col items-center gap-6 ${isFullscreen ? 'bg-black p-8' : ''}`}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-white text-xl font-bold">Coherent Motion Detection</h2>
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
      
      <div className="text-slate-400 text-sm flex gap-6">
        <span>Trial: {trialCount + 1} / 10</span>
        <span>Coherence: {currentCoherence}%</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={isFullscreen ? window.innerWidth - 100 : 900}
          height={isFullscreen ? window.innerHeight - 200 : 500}
          className="rounded-lg"
        />
        
        {/* Feedback overlay */}
        {showFeedback !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className={`text-8xl ${showFeedback ? 'text-green-500' : 'text-red-500'}`}>
              {showFeedback ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>

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
      
      <p className="text-slate-400 text-sm">
        Which side has dots moving together? Use arrow keys or click the buttons.
      </p>
    </div>
  );
}
