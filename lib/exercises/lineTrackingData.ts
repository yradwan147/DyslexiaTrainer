// Line Tracking Exercise Data - All 17 configurations based on EXACT reference images
// Each configuration defines the left items, right items, line paths, and visual style

export interface LineTrackingConfig {
  id: number;
  level: number;
  exercise: number;
  title: string;
  leftItems: LineItem[];
  rightItems: LineItem[];
  connections: number[]; // Maps left index to right index
  lineStyle: LineStyle;
  lineColor: string;
}

export interface LineItem {
  type: 'image' | 'text';
  value: string; // Image path or text character
  color?: string;
  fontStyle?: 'normal' | 'italic' | 'cursive' | 'serif' | 'gothic' | 'handwritten';
}

export interface LineStyle {
  type: 'curved' | 'angular' | 'wavy';
  dashed: boolean;
  strokeWidth: number;
}

// Control points for curved lines - each array defines bezier curve control points
// Format: [startY, ...controlPoints, endY] where Y is 0-1 normalized
export interface LinePath {
  controlPoints: [number, number][]; // Array of [x, y] control points
}

export const LINE_TRACKING_CONFIGS: LineTrackingConfig[] = [
  // ============================================
  // Level 2: 4-5 items each (IMAGES)
  // ============================================
  
  // Image 1: Cows → Milk cartons, 4 items, gray curved lines
  {
    id: 1,
    level: 2,
    exercise: 1,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'image', value: '/assets/line-tracking/cow.svg' },
      { type: 'image', value: '/assets/line-tracking/cow.svg' },
      { type: 'image', value: '/assets/line-tracking/cow.svg' },
      { type: 'image', value: '/assets/line-tracking/cow.svg' },
    ],
    rightItems: [
      { type: 'image', value: '/assets/line-tracking/milk.svg' },
      { type: 'image', value: '/assets/line-tracking/milk.svg' },
      { type: 'image', value: '/assets/line-tracking/milk.svg' },
      { type: 'image', value: '/assets/line-tracking/milk.svg' },
    ],
    connections: [2, 0, 3, 1],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 3 },
    lineColor: '#6b7280', // Gray
  },
  
  // Image 2: Lions → Zebras, 4 items, multi-color curved lines
  {
    id: 2,
    level: 2,
    exercise: 2,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'image', value: '/assets/line-tracking/lion.svg' },
      { type: 'image', value: '/assets/line-tracking/lion.svg' },
      { type: 'image', value: '/assets/line-tracking/lion.svg' },
      { type: 'image', value: '/assets/line-tracking/lion.svg' },
    ],
    rightItems: [
      { type: 'image', value: '/assets/line-tracking/zebra.svg' },
      { type: 'image', value: '/assets/line-tracking/zebra.svg' },
      { type: 'image', value: '/assets/line-tracking/zebra.svg' },
      { type: 'image', value: '/assets/line-tracking/zebra.svg' },
    ],
    connections: [3, 1, 0, 2],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 3 },
    lineColor: '#9ca3af', // Light gray (multi-color in original)
  },
  
  // Image 3: Easter bunnies → Baskets, 4 items, GREEN DASHED curved lines
  {
    id: 3,
    level: 2,
    exercise: 3,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'image', value: '/assets/line-tracking/bunny.svg' },
      { type: 'image', value: '/assets/line-tracking/bunny.svg' },
      { type: 'image', value: '/assets/line-tracking/bunny.svg' },
      { type: 'image', value: '/assets/line-tracking/bunny.svg' },
    ],
    rightItems: [
      { type: 'image', value: '/assets/line-tracking/basket.svg' },
      { type: 'image', value: '/assets/line-tracking/basket.svg' },
      { type: 'image', value: '/assets/line-tracking/basket.svg' },
      { type: 'image', value: '/assets/line-tracking/basket.svg' },
    ],
    connections: [1, 3, 0, 2],
    lineStyle: { type: 'curved', dashed: true, strokeWidth: 2 }, // DASHED
    lineColor: '#84cc16', // Green
  },
  
  // Image 4: Hens → Chicks, **5 ITEMS**, black curved lines
  {
    id: 4,
    level: 2,
    exercise: 4,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'image', value: '/assets/line-tracking/hen.svg' },
      { type: 'image', value: '/assets/line-tracking/hen.svg' },
      { type: 'image', value: '/assets/line-tracking/hen.svg' },
      { type: 'image', value: '/assets/line-tracking/hen.svg' },
      { type: 'image', value: '/assets/line-tracking/hen.svg' }, // 5th item
    ],
    rightItems: [
      { type: 'image', value: '/assets/line-tracking/chick.svg' },
      { type: 'image', value: '/assets/line-tracking/chick.svg' },
      { type: 'image', value: '/assets/line-tracking/chick.svg' },
      { type: 'image', value: '/assets/line-tracking/chick.svg' },
      { type: 'image', value: '/assets/line-tracking/chick.svg' }, // 5th item
    ],
    connections: [2, 0, 4, 1, 3], // 5 connections
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 3 },
    lineColor: '#000000', // Black
  },
  
  // ============================================
  // Level 3: 3 items each (LETTERS ABC → 123)
  // ============================================
  
  // Image 6: ABC→123, dark blue sans-serif, blue angular lines
  {
    id: 5,
    level: 3,
    exercise: 1,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#1e3a5f', fontStyle: 'normal' },
      { type: 'text', value: 'B', color: '#1e3a5f', fontStyle: 'normal' },
      { type: 'text', value: 'C', color: '#1e3a5f', fontStyle: 'normal' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#1e3a5f', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#1e3a5f', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#1e3a5f', fontStyle: 'italic' },
    ],
    connections: [0, 2, 1],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#3b82f6', // Blue
  },
  
  // Image 7: ABC→123, purple cursive, blue angular lines
  {
    id: 6,
    level: 3,
    exercise: 2,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#6366f1', fontStyle: 'cursive' },
      { type: 'text', value: 'B', color: '#6366f1', fontStyle: 'cursive' },
      { type: 'text', value: 'C', color: '#6366f1', fontStyle: 'cursive' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#6366f1', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#6366f1', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#6366f1', fontStyle: 'italic' },
    ],
    connections: [2, 0, 1],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#6366f1', // Purple/indigo
  },
  
  // Image 8: ABC→123, yellow/gold serif, PINK curved lines
  {
    id: 7,
    level: 3,
    exercise: 3,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#f59e0b', fontStyle: 'serif' },
      { type: 'text', value: 'B', color: '#f59e0b', fontStyle: 'serif' },
      { type: 'text', value: 'C', color: '#f59e0b', fontStyle: 'serif' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#f59e0b', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#f59e0b', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#f59e0b', fontStyle: 'italic' },
    ],
    connections: [1, 2, 0],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#ec4899', // Pink
  },
  
  // Image 9: ABC→123, red cursive, red curved lines
  {
    id: 8,
    level: 3,
    exercise: 4,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#dc2626', fontStyle: 'cursive' },
      { type: 'text', value: 'B', color: '#dc2626', fontStyle: 'cursive' },
      { type: 'text', value: 'C', color: '#dc2626', fontStyle: 'cursive' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#dc2626', fontStyle: 'cursive' },
      { type: 'text', value: '2', color: '#dc2626', fontStyle: 'cursive' },
      { type: 'text', value: '3', color: '#dc2626', fontStyle: 'cursive' },
    ],
    connections: [0, 1, 2],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#dc2626', // Red
  },
  
  // ============================================
  // Level 4: 4 items each (ABCD → 1234)
  // ============================================
  
  // Image 10: ABCD→1234, green cursive, green curved lines
  {
    id: 9,
    level: 4,
    exercise: 1,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#84cc16', fontStyle: 'cursive' },
      { type: 'text', value: 'B', color: '#84cc16', fontStyle: 'cursive' },
      { type: 'text', value: 'C', color: '#84cc16', fontStyle: 'cursive' },
      { type: 'text', value: 'D', color: '#84cc16', fontStyle: 'cursive' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#84cc16', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#84cc16', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#84cc16', fontStyle: 'italic' },
      { type: 'text', value: '4', color: '#84cc16', fontStyle: 'italic' },
    ],
    connections: [2, 0, 3, 1],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#84cc16', // Green
  },
  
  // Image 11: ABCD→1234, blue sans-serif, blue curved lines
  {
    id: 10,
    level: 4,
    exercise: 2,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#2563eb', fontStyle: 'normal' },
      { type: 'text', value: 'B', color: '#2563eb', fontStyle: 'normal' },
      { type: 'text', value: 'C', color: '#2563eb', fontStyle: 'normal' },
      { type: 'text', value: 'D', color: '#2563eb', fontStyle: 'normal' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#2563eb', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#2563eb', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#2563eb', fontStyle: 'italic' },
      { type: 'text', value: '4', color: '#2563eb', fontStyle: 'italic' },
    ],
    connections: [3, 1, 0, 2],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#2563eb', // Blue
  },
  
  // Image 12: abcd→1234, orange cursive LOWERCASE, blue angular lines
  {
    id: 11,
    level: 4,
    exercise: 3,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'a', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: 'b', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: 'c', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: 'd', color: '#ea580c', fontStyle: 'cursive' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: '2', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: '3', color: '#ea580c', fontStyle: 'cursive' },
      { type: 'text', value: '4', color: '#ea580c', fontStyle: 'cursive' },
    ],
    connections: [0, 3, 1, 2],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#2563eb', // Blue
  },
  
  // Image 13: ABCD→1234, blue GOTHIC/BLACKLETTER, blue angular lines
  {
    id: 12,
    level: 4,
    exercise: 4,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#3b82f6', fontStyle: 'gothic' },
      { type: 'text', value: 'B', color: '#3b82f6', fontStyle: 'gothic' },
      { type: 'text', value: 'C', color: '#3b82f6', fontStyle: 'gothic' },
      { type: 'text', value: 'D', color: '#3b82f6', fontStyle: 'gothic' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#3b82f6', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#3b82f6', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#3b82f6', fontStyle: 'italic' },
      { type: 'text', value: '4', color: '#3b82f6', fontStyle: 'italic' },
    ],
    connections: [1, 2, 3, 0],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#3b82f6', // Blue
  },
  
  // ============================================
  // Level 5: 5 items each (ABCDE → 12345)
  // ============================================
  
  // Image 14: ABCDE→12345, blue sans-serif, blue curved lines
  {
    id: 13,
    level: 5,
    exercise: 1,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: 'B', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: 'C', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: 'D', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: 'E', color: '#3b82f6', fontStyle: 'normal' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: '2', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: '3', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: '4', color: '#3b82f6', fontStyle: 'normal' },
      { type: 'text', value: '5', color: '#3b82f6', fontStyle: 'normal' },
    ],
    connections: [2, 0, 4, 1, 3],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#3b82f6', // Blue
  },
  
  // Image 15: ABCDE→12345, pink/mauve italic, purple curved lines
  {
    id: 14,
    level: 5,
    exercise: 2,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: 'B', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: 'C', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: 'D', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: 'E', color: '#be185d', fontStyle: 'italic' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: '4', color: '#be185d', fontStyle: 'italic' },
      { type: 'text', value: '5', color: '#be185d', fontStyle: 'italic' },
    ],
    connections: [1, 3, 0, 4, 2],
    lineStyle: { type: 'curved', dashed: false, strokeWidth: 2 },
    lineColor: '#a855f7', // Purple
  },
  
  // Image 16: ABCDE→12345, green GOTHIC/BLACKLETTER, blue angular lines
  {
    id: 15,
    level: 5,
    exercise: 3,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#059669', fontStyle: 'gothic' },
      { type: 'text', value: 'B', color: '#059669', fontStyle: 'gothic' },
      { type: 'text', value: 'C', color: '#059669', fontStyle: 'gothic' },
      { type: 'text', value: 'D', color: '#059669', fontStyle: 'gothic' },
      { type: 'text', value: 'E', color: '#059669', fontStyle: 'gothic' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#059669', fontStyle: 'italic' },
      { type: 'text', value: '2', color: '#059669', fontStyle: 'italic' },
      { type: 'text', value: '3', color: '#059669', fontStyle: 'italic' },
      { type: 'text', value: '4', color: '#059669', fontStyle: 'italic' },
      { type: 'text', value: '5', color: '#059669', fontStyle: 'italic' },
    ],
    connections: [4, 2, 0, 3, 1],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#3b82f6', // Blue
  },
  
  // Image 17: ABCDE→12345, orange HANDWRITTEN, red/brown angular lines
  {
    id: 16,
    level: 5,
    exercise: 4,
    title: 'Kdo je kaj izgubil?',
    leftItems: [
      { type: 'text', value: 'A', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: 'B', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: 'C', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: 'D', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: 'E', color: '#ea580c', fontStyle: 'handwritten' },
    ],
    rightItems: [
      { type: 'text', value: '1', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: '2', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: '3', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: '4', color: '#ea580c', fontStyle: 'handwritten' },
      { type: 'text', value: '5', color: '#ea580c', fontStyle: 'handwritten' },
    ],
    connections: [0, 4, 1, 3, 2],
    lineStyle: { type: 'angular', dashed: false, strokeWidth: 2 },
    lineColor: '#b91c1c', // Red/brown
  },
];

export function getConfigForSession(sessionNumber: number): LineTrackingConfig {
  // Session numbers 1-16 map to configs 0-15 (we have 16 configs, image 5 was blank)
  const index = Math.max(0, Math.min(sessionNumber - 1, LINE_TRACKING_CONFIGS.length - 1));
  return LINE_TRACKING_CONFIGS[index];
}

// ============================================
// PROCEDURAL GENERATION
// ============================================

// Color palette for procedural generation
const COLORS = [
  '#1e40af', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#854d0e', // Brown
];

// Font styles for procedural generation
const FONT_STYLES: LineItem['fontStyle'][] = ['normal', 'italic', 'cursive', 'serif', 'gothic', 'handwritten'];

// Line styles for procedural generation
const LINE_STYLES: LineStyle['type'][] = ['curved', 'angular', 'wavy'];

// Image pairs for procedural generation
const IMAGE_PAIRS = [
  { left: '/assets/line-tracking/cow.svg', right: '/assets/line-tracking/milk.svg' },
  { left: '/assets/line-tracking/lion.svg', right: '/assets/line-tracking/zebra.svg' },
  { left: '/assets/line-tracking/bunny.svg', right: '/assets/line-tracking/basket.svg' },
  { left: '/assets/line-tracking/hen.svg', right: '/assets/line-tracking/chick.svg' },
];

// Seeded random number generator
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Shuffle array using seeded RNG
function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate a procedural letter-number matching config
// Difficulty affects number of lines: Level 1 = 3-4 lines, Level 5 = 7-8 lines
export function generateLineTrackingConfig(taskIndex: number, sessionSeed: number = Date.now(), difficulty: number = 1): LineTrackingConfig {
  const rng = seededRandom(sessionSeed + taskIndex * 1000);
  
  // Item count increases with difficulty: 3-4, 4-5, 5-6, 6-7, 7-8
  const baseCount = 2 + difficulty; // 3, 4, 5, 6, 7
  const itemCount = baseCount + Math.floor(rng() * 2); // +0-1 random
  
  // Determine type: image-based (first 4) or letter-based (rest)
  const useImages = taskIndex < 4 && rng() > 0.3;
  
  if (useImages) {
    // Image-based puzzle
    const pairIndex = taskIndex % IMAGE_PAIRS.length;
    const pair = IMAGE_PAIRS[pairIndex];
    
    const leftItems: LineItem[] = Array(itemCount).fill(null).map(() => ({ 
      type: 'image' as const, 
      value: pair.left 
    }));
    const rightItems: LineItem[] = Array(itemCount).fill(null).map(() => ({ 
      type: 'image' as const, 
      value: pair.right 
    }));
    
    // Generate random connections (shuffle indices)
    const connections = shuffleArray([...Array(itemCount).keys()], rng);
    
    // Random line style and color
    const lineStyle: LineStyle = {
      type: LINE_STYLES[Math.floor(rng() * LINE_STYLES.length)],
      dashed: rng() > 0.7,
      strokeWidth: 2 + Math.floor(rng() * 2),
    };
    const lineColor = COLORS[Math.floor(rng() * COLORS.length)];
    
    return {
      id: 100 + taskIndex,
      level: difficulty,
      exercise: taskIndex + 1,
      title: 'Kdo je kaj izgubil?',
      leftItems,
      rightItems,
      connections,
      lineStyle,
      lineColor,
    };
  } else {
    // Letter-number matching puzzle
    const uppercase = rng() > 0.5;
    const letters = uppercase 
      ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    const color = COLORS[Math.floor(rng() * COLORS.length)];
    const fontStyle = FONT_STYLES[Math.floor(rng() * FONT_STYLES.length)];
    
    const leftItems: LineItem[] = letters.slice(0, itemCount).map(value => ({
      type: 'text' as const,
      value,
      color,
      fontStyle,
    }));
    const rightItems: LineItem[] = numbers.slice(0, itemCount).map(value => ({
      type: 'text' as const,
      value,
      color,
      fontStyle,
    }));
    
    // Generate random connections
    const connections = shuffleArray([...Array(itemCount).keys()], rng);
    
    // Random line style
    const lineStyle: LineStyle = {
      type: LINE_STYLES[Math.floor(rng() * LINE_STYLES.length)],
      dashed: rng() > 0.8,
      strokeWidth: 2 + Math.floor(rng() * 2),
    };
    const lineColor = COLORS[Math.floor(rng() * COLORS.length)];
    
    return {
      id: 100 + taskIndex,
      level: difficulty,
      exercise: taskIndex + 1,
      title: 'Kdo je kaj izgubil?',
      leftItems,
      rightItems,
      connections,
      lineStyle,
      lineColor,
    };
  }
}

// Get config: use static for first few, then procedural
export function getLineTrackingConfig(taskIndex: number, sessionSeed: number): LineTrackingConfig {
  // First 10 tasks use static configs (reference images), rest are procedural
  if (taskIndex < LINE_TRACKING_CONFIGS.length) {
    return LINE_TRACKING_CONFIGS[taskIndex];
  }
  return generateLineTrackingConfig(taskIndex, sessionSeed);
}
