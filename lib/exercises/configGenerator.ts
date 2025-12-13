/**
 * Generates pre-scripted trial configurations for all exercises
 * These are deterministic based on exercise_id, version, and difficulty
 */

import { createSeededRandom } from './prng';
import type {
  ExerciseConfig,
  CoherentMotionTrialConfig,
  VisualSearchTrialConfig,
  LineTrackingTrialConfig,
  MazeTrackingTrialConfig,
  FootballTrialConfig,
  TennisTrialConfig,
  TwoCirclesTrialConfig,
  SaccadesTrialConfig,
  VisualMemoryTrialConfig,
  PairSearchTrialConfig,
} from './types';

// Base seed for all configurations - ensures reproducibility
const BASE_SEED = 42;

function generateSeed(exerciseId: string, difficulty: number, trialIndex: number): number {
  // Create unique seed from exercise + difficulty + trial
  let hash = BASE_SEED;
  for (const char of exerciseId) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash = hash & hash;
  }
  return Math.abs(hash + difficulty * 1000 + trialIndex);
}

// Coherent Motion Configuration
export function generateCoherentMotionConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const coherenceByLevel = [60, 50, 40, 30, 25];
  const coherence = coherenceByLevel[difficulty - 1] || 40;
  
  const trials: CoherentMotionTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('coherent_motion', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('coherent_motion', difficulty, i),
      coherence_percent: coherence,
      coherent_side: rng.nextBool() ? 'left' : 'right',
      motion_direction: rng.nextBool() ? 'left' : 'right',
      dot_count: 100,
      dot_speed: 3,
      stimulus_duration_ms: 2300,
      response_window_ms: 2000,
      iti_ms: 500,
    });
  }
  
  return {
    exercise_id: 'coherent_motion',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Coherent Motion Detection',
    description: 'Find the side where dots are moving together',
    trials,
  };
}

// Visual Search Configuration
export function generateVisualSearchConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const gridSizes = [3, 4, 4, 5, 5];
  const targetCounts = [1, 1, 2, 2, 3];
  const gridSize = gridSizes[difficulty - 1] || 4;
  const maxTargets = targetCounts[difficulty - 1] || 2;
  
  const trials: VisualSearchTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('visual_search', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const targetCount = rng.nextInt(1, maxTargets);
    const positions: [number, number][] = [];
    
    // Generate unique target positions
    while (positions.length < targetCount) {
      const pos: [number, number] = [rng.nextInt(0, gridSize - 1), rng.nextInt(0, gridSize - 1)];
      if (!positions.some(p => p[0] === pos[0] && p[1] === pos[1])) {
        positions.push(pos);
      }
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('visual_search', difficulty, i),
      grid_rows: gridSize,
      grid_cols: gridSize,
      target_count: targetCount,
      target_positions: positions,
      difference_type: rng.pick(['shape', 'color', 'orientation']),
      stimulus_duration_ms: 15000,
      response_window_ms: 15000,
      iti_ms: 500,
    });
  }
  
  return {
    exercise_id: 'visual_search',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Visual Search',
    description: 'Count how many items are different',
    trials,
  };
}

// Line Tracking Configuration
export function generateLineTrackingConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const lineCounts = [3, 4, 5, 6, 7];
  const lineCount = lineCounts[difficulty - 1] || 4;
  
  const trials: LineTrackingTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('line_tracking', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const correctEnd = rng.nextInt(0, lineCount - 1);
    const linePaths = [];
    
    for (let j = 0; j < lineCount; j++) {
      const startY = (j + 0.5) / lineCount;
      const endY = rng.next() * 0.8 + 0.1;
      const numControlPoints = rng.nextInt(2, 4);
      const controlPoints: [number, number][] = [];
      
      for (let k = 0; k < numControlPoints; k++) {
        controlPoints.push([
          (k + 1) / (numControlPoints + 1),
          rng.next() * 0.8 + 0.1
        ]);
      }
      
      linePaths.push({
        start: [0.05, startY] as [number, number],
        end: [0.95, endY] as [number, number],
        control_points: controlPoints,
      });
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('line_tracking', difficulty, i),
      line_count: lineCount,
      correct_end: correctEnd,
      line_paths: linePaths,
      stimulus_duration_ms: 30000,
      response_window_ms: 30000,
      iti_ms: 500,
    });
  }
  
  return {
    exercise_id: 'line_tracking',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Line Tracking',
    description: 'Follow the line from the star to find the matching shape',
    trials,
  };
}

// Maze Tracking Configuration
export function generateMazeTrackingConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const mazeSizes = [5, 7, 9, 11, 13];
  const mazeSize = mazeSizes[difficulty - 1] || 7;
  
  const trials: MazeTrackingTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('maze_tracking', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    // Generate simple maze (0 = wall, 1 = path)
    const maze: number[][] = [];
    for (let y = 0; y < mazeSize; y++) {
      maze[y] = [];
      for (let x = 0; x < mazeSize; x++) {
        maze[y][x] = rng.next() > 0.3 ? 1 : 0;
      }
    }
    
    // Ensure start and end are open
    maze[0][0] = 1;
    maze[mazeSize - 1][mazeSize - 1] = 1;
    
    // Create a guaranteed path
    let x = 0, y = 0;
    while (x < mazeSize - 1 || y < mazeSize - 1) {
      maze[y][x] = 1;
      if (x < mazeSize - 1 && (y >= mazeSize - 1 || rng.nextBool())) {
        x++;
      } else if (y < mazeSize - 1) {
        y++;
      }
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('maze_tracking', difficulty, i),
      maze_width: mazeSize,
      maze_height: mazeSize,
      maze_cells: maze,
      start_position: [0, 0],
      end_position: [mazeSize - 1, mazeSize - 1],
      stimulus_duration_ms: 60000,
      response_window_ms: 60000,
      iti_ms: 500,
    });
  }
  
  return {
    exercise_id: 'maze_tracking',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Maze Tracking',
    description: 'Find the path from start to finish',
    trials,
  };
}

// Football (Dynamic Tracking) Configuration
export function generateFootballConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const speeds = [1, 1.5, 2, 2.5, 3];
  const speed = speeds[difficulty - 1] || 1.5;
  
  const trials: FootballTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('dynamic_football', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const path: { x: number; y: number; time: number }[] = [];
    const overlapTimes: number[] = [];
    const duration = 10000; // 10 seconds per trial
    
    let x = 0.5, y = 0.5;
    let dx = (rng.next() - 0.5) * 0.02 * speed;
    let dy = (rng.next() - 0.5) * 0.02 * speed;
    
    for (let t = 0; t < duration; t += 50) {
      x += dx;
      y += dy;
      
      // Bounce off walls
      if (x < 0.1 || x > 0.9) dx = -dx;
      if (y < 0.1 || y > 0.9) dy = -dy;
      
      x = Math.max(0.1, Math.min(0.9, x));
      y = Math.max(0.1, Math.min(0.9, y));
      
      path.push({ x, y, time: t });
      
      // Check if near center (overlap with square)
      if (Math.abs(x - 0.5) < 0.1 && Math.abs(y - 0.5) < 0.1) {
        if (overlapTimes.length === 0 || t - overlapTimes[overlapTimes.length - 1] > 1000) {
          overlapTimes.push(t);
        }
      }
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('dynamic_football', difficulty, i),
      circle_path: path,
      overlap_times: overlapTimes.slice(0, 5), // Max 5 overlaps per trial
      circle_radius: 30,
      square_size: 60,
      stimulus_duration_ms: duration,
      response_window_ms: duration,
      iti_ms: 1000,
    });
  }
  
  return {
    exercise_id: 'dynamic_football',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Football',
    description: 'Click when the ball enters the goal',
    trials,
  };
}

// Tennis Configuration
export function generateTennisConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const speeds = [2, 3, 4, 5, 6];
  const paddleSizes = [100, 90, 80, 70, 60];
  const speed = speeds[difficulty - 1] || 3;
  const paddleWidth = paddleSizes[difficulty - 1] || 80;
  
  const trials: TennisTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('dynamic_tennis', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const path: { x: number; y: number; time: number }[] = [];
    const duration = 15000;
    
    let x = 0.5, y = 0.1;
    let dx = (rng.next() - 0.5) * 0.01 * speed;
    let dy = 0.005 * speed;
    
    for (let t = 0; t < duration; t += 30) {
      x += dx;
      y += dy;
      
      // Bounce off walls
      if (x < 0.05 || x > 0.95) dx = -dx;
      if (y < 0.05) dy = Math.abs(dy);
      
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(0.05, y);
      
      path.push({ x, y, time: t });
      
      // Reset if ball goes past paddle zone
      if (y > 0.95) {
        x = 0.5;
        y = 0.1;
        dx = (rng.next() - 0.5) * 0.01 * speed;
      }
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('dynamic_tennis', difficulty, i),
      ball_path: path,
      ball_speed: speed,
      paddle_width: paddleWidth,
      paddle_height: 15,
      stimulus_duration_ms: duration,
      response_window_ms: duration,
      iti_ms: 1000,
    });
  }
  
  return {
    exercise_id: 'dynamic_tennis',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Tennis',
    description: 'Move the paddle to hit the ball',
    trials,
  };
}

// Two Circles Configuration
export function generateTwoCirclesConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const speeds = [1, 1.5, 2, 2.5, 3];
  const speed = speeds[difficulty - 1] || 1.5;
  
  const trials: TwoCirclesTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('dynamic_circles', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const duration = 12000;
    const path1: { x: number; y: number; time: number }[] = [];
    const path2: { x: number; y: number; time: number }[] = [];
    const overlapTimes: number[] = [];
    
    let x1 = 0.2, y1 = 0.5;
    let x2 = 0.8, y2 = 0.5;
    let dx1 = rng.next() * 0.015 * speed;
    let dy1 = (rng.next() - 0.5) * 0.015 * speed;
    let dx2 = -rng.next() * 0.015 * speed;
    let dy2 = (rng.next() - 0.5) * 0.015 * speed;
    
    for (let t = 0; t < duration; t += 30) {
      x1 += dx1; y1 += dy1;
      x2 += dx2; y2 += dy2;
      
      if (x1 < 0.1 || x1 > 0.9) dx1 = -dx1;
      if (y1 < 0.1 || y1 > 0.9) dy1 = -dy1;
      if (x2 < 0.1 || x2 > 0.9) dx2 = -dx2;
      if (y2 < 0.1 || y2 > 0.9) dy2 = -dy2;
      
      path1.push({ x: x1, y: y1, time: t });
      path2.push({ x: x2, y: y2, time: t });
      
      // Check overlap
      const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
      if (dist < 0.1) {
        if (overlapTimes.length === 0 || t - overlapTimes[overlapTimes.length - 1] > 1000) {
          overlapTimes.push(t);
        }
      }
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('dynamic_circles', difficulty, i),
      circle1_path: path1,
      circle2_path: path2,
      overlap_times: overlapTimes,
      circle_radius: 25,
      stimulus_duration_ms: duration,
      response_window_ms: duration,
      iti_ms: 1000,
    });
  }
  
  return {
    exercise_id: 'dynamic_circles',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Two Moving Circles',
    description: 'Click when the two circles touch',
    trials,
  };
}

// Visual Saccades Configuration
export function generateSaccadesConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const durations = [1500, 1200, 1000, 800, 600];
  const duration = durations[difficulty - 1] || 1000;
  
  const trials: SaccadesTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('visual_saccades', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const positionCount = rng.nextInt(5, 10);
    const positions: { x: number; y: number; duration: number }[] = [];
    
    // Generate positions in a scanning pattern (left to right, top to bottom)
    for (let j = 0; j < positionCount; j++) {
      positions.push({
        x: 0.1 + (j % 5) * 0.2 + rng.next() * 0.1,
        y: 0.2 + Math.floor(j / 5) * 0.3 + rng.next() * 0.1,
        duration: duration,
      });
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('visual_saccades', difficulty, i),
      positions,
      circle_radius: 30,
      stimulus_duration_ms: positionCount * duration,
      response_window_ms: positionCount * duration,
      iti_ms: 500,
    });
  }
  
  return {
    exercise_id: 'visual_saccades',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Visual Saccades',
    description: 'Click on the circle as it appears',
    trials,
  };
}

// Visual Memory Configuration
export function generateVisualMemoryConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const sequenceLengths = [3, 4, 5, 6, 7];
  const displayTimes = [2000, 1500, 1200, 1000, 800];
  const sequenceLength = sequenceLengths[difficulty - 1] || 4;
  const displayTime = displayTimes[difficulty - 1] || 1500;
  
  const imageSet = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];
  
  const trials: VisualMemoryTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('visual_memory', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const sequence: number[] = [];
    for (let j = 0; j < sequenceLength; j++) {
      sequence.push(rng.nextInt(0, imageSet.length - 1));
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('visual_memory', difficulty, i),
      sequence,
      display_time_per_item_ms: displayTime,
      image_set: imageSet,
      stimulus_duration_ms: sequenceLength * displayTime + 2000,
      response_window_ms: 30000,
      iti_ms: 1000,
    });
  }
  
  return {
    exercise_id: 'visual_memory',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Visual Memory',
    description: 'Remember and reproduce the sequence',
    trials,
  };
}

// Pair Search Configuration
export function generatePairSearchConfig(difficulty: number, trialCount: number): ExerciseConfig {
  const gridSizes = [3, 4, 4, 5, 6];
  const gridSize = gridSizes[difficulty - 1] || 4;
  const pairCount = Math.floor((gridSize * gridSize) / 2);
  
  const itemSet = ['🌟', '🌙', '☀️', '⭐', '💫', '🌈', '🔥', '💧', '🍀', '🌸', '🌺', '🌻', '🦋', '🐝', '🐞', '🌍', '🎈', '🎁'];
  
  const trials: PairSearchTrialConfig[] = [];
  const rng = createSeededRandom(generateSeed('pair_search', difficulty, 0));
  
  for (let i = 0; i < trialCount; i++) {
    const shuffledItems = rng.shuffle(itemSet.slice(0, pairCount));
    const allPositions: [number, number][] = [];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        allPositions.push([x, y]);
      }
    }
    
    const shuffledPositions = rng.shuffle(allPositions);
    const pairs: { item_id: string; positions: [number, number][] }[] = [];
    
    for (let j = 0; j < pairCount; j++) {
      pairs.push({
        item_id: shuffledItems[j],
        positions: [shuffledPositions[j * 2], shuffledPositions[j * 2 + 1]],
      });
    }
    
    trials.push({
      trial_id: i + 1,
      seed: generateSeed('pair_search', difficulty, i),
      grid_size: gridSize,
      pairs,
      total_items: pairCount * 2,
      stimulus_duration_ms: 120000,
      response_window_ms: 120000,
      iti_ms: 1000,
    });
  }
  
  return {
    exercise_id: 'pair_search',
    exercise_version: '1.0.0',
    difficulty_level: difficulty,
    name: 'Pair Search',
    description: 'Find all matching pairs',
    trials,
  };
}

// Main function to get config for any exercise
export function getExerciseConfig(exerciseId: string, difficulty: number, trialCount: number): ExerciseConfig {
  switch (exerciseId) {
    case 'coherent_motion':
      return generateCoherentMotionConfig(difficulty, trialCount);
    case 'visual_search':
      return generateVisualSearchConfig(difficulty, trialCount);
    case 'line_tracking':
      return generateLineTrackingConfig(difficulty, trialCount);
    case 'maze_tracking':
      return generateMazeTrackingConfig(difficulty, trialCount);
    case 'dynamic_football':
      return generateFootballConfig(difficulty, trialCount);
    case 'dynamic_tennis':
      return generateTennisConfig(difficulty, trialCount);
    case 'dynamic_circles':
      return generateTwoCirclesConfig(difficulty, trialCount);
    case 'visual_saccades':
      return generateSaccadesConfig(difficulty, trialCount);
    case 'visual_memory':
      return generateVisualMemoryConfig(difficulty, trialCount);
    case 'pair_search':
      return generatePairSearchConfig(difficulty, trialCount);
    default:
      throw new Error(`Unknown exercise: ${exerciseId}`);
  }
}

