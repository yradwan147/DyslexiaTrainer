// Exercise type definitions

export interface ExerciseConfig {
  exercise_id: string;
  exercise_version: string;
  difficulty_level: number;
  training_run_index?: number;
  name: string;
  description: string;
  trials: TrialConfig[];
}

export interface TrialConfig {
  trial_id: number;
  seed: number;
  stimulus_duration_ms: number;
  response_window_ms: number;
  iti_ms: number; // Inter-trial interval
  [key: string]: unknown; // Exercise-specific parameters
}

// Coherent Motion specific
export interface CoherentMotionTrialConfig extends TrialConfig {
  coherence_percent: number;
  coherent_side: 'left' | 'right';
  motion_direction: 'left' | 'right';
  dot_count: number;
  dot_speed: number;
}

// Visual Search specific
export interface VisualSearchTrialConfig extends TrialConfig {
  grid_rows: number;
  grid_cols: number;
  target_count: number;
  target_positions: [number, number][];
  difference_type: 'shape' | 'color' | 'orientation';
}

// Line Tracking specific
export interface LineTrackingTrialConfig extends TrialConfig {
  line_count: number;
  correct_end: number;
  line_paths: { start: [number, number]; end: [number, number]; control_points: [number, number][] }[];
}

// Maze Tracking specific
export interface MazeTrackingTrialConfig extends TrialConfig {
  maze_width: number;
  maze_height: number;
  maze_cells: number[][];
  start_position: [number, number];
  end_position: [number, number];
}

// Dynamic Tracking (Football) specific
export interface FootballTrialConfig extends TrialConfig {
  circle_path: { x: number; y: number; time: number }[];
  overlap_times: number[];
  circle_radius: number;
  square_size: number;
}

// Dynamic Tracking (Tennis) specific
export interface TennisTrialConfig extends TrialConfig {
  ball_path: { x: number; y: number; time: number }[];
  ball_speed: number;
  paddle_width: number;
  paddle_height: number;
}

// Visual Discrimination specific
export interface VisualDiscriminationTrialConfig extends TrialConfig {
  target_shape_id: number;
  option_shape_ids: number[];
  correct_option_index: number;
}

// Visual Saccades specific
export interface SaccadesTrialConfig extends TrialConfig {
  positions: { x: number; y: number; duration: number }[];
  circle_radius: number;
}

// Visual Memory specific
export interface VisualMemoryTrialConfig extends TrialConfig {
  sequence: number[];
  display_time_per_item_ms: number;
  image_set: string[];
}

// Pair Search specific
export interface PairSearchTrialConfig extends TrialConfig {
  grid_size: number;
  pairs: { item_id: string; positions: [number, number][] }[];
  total_items: number;
}

// Trial result from child
export interface TrialResult {
  trial_index: number;
  user_response: string;
  response_time_ms: number;
  is_correct: boolean;
  is_timed_out: boolean;
  is_skipped: boolean;
  started_at: string;
  responded_at: string;
}

// Exercise component props
export interface ExerciseProps {
  config: ExerciseConfig;
  onTrialComplete: (result: TrialResult) => void;
  onExerciseComplete: () => void;
  currentTrialIndex: number;
  showFeedback: boolean;
}

// All exercise IDs (in session order)
export type ExerciseId = 
  | 'line_tracking'
  | 'coherent_motion'
  | 'visual_discrimination'
  | 'maze_tracking'
  | 'visual_memory'
  | 'dynamic_football'
  | 'dynamic_tennis'
  | 'visual_saccades'
  | 'visual_search'
  | 'pair_search';

export const EXERCISE_NAMES: Record<ExerciseId, string> = {
  line_tracking: 'Static Eye Tracking - Lines',
  coherent_motion: 'Coherent Motion Detection',
  visual_discrimination: 'Visual Discrimination - Pairs',
  maze_tracking: 'Static Eye Tracking - Maze',
  visual_memory: 'Visual Memory',
  dynamic_football: 'Dynamic Eye Tracking - Football',
  dynamic_tennis: 'Dynamic Eye Tracking - Tennis',
  visual_saccades: 'Saccades',
  visual_search: 'Visual Search',
  pair_search: 'Pair Search (Legacy)',
};

// Session exercise order (9 exercises as per instructions)
export const SESSION_EXERCISE_ORDER: ExerciseId[] = [
  'line_tracking',
  'coherent_motion',
  'visual_discrimination',
  'maze_tracking',
  'visual_memory',
  'dynamic_football',
  'dynamic_tennis',
  'visual_saccades',
  'visual_search',
];

