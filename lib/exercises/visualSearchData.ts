// Visual Search Exercise Data - PROCEDURALLY GENERATED configurations
// Based on the 10 reference image TYPES but with randomized positions
// All items are BLACK SILHOUETTES
// User must find the one different item among identical silhouettes

export interface VisualSearchConfig {
  id: number;
  gridSize: number; // Grid dimensions (e.g., 4 for 4x4)
  gridRows?: number; // Optional different row count (defaults to gridSize)
  mainItem: string; // SVG asset name for main silhouette
  differentItems: { row: number; col: number; item: string }[]; // Position and type of different items
  totalDifferent: number; // How many to find
  description: string; // Description for hint
}

// Puzzle types based on reference images - defines main/different pairs
export interface PuzzleType {
  mainItem: string;
  differentItem: string;
  description: string;
  gridSize: number;
  gridRows?: number;
}

// All puzzle types derived from the 10 reference images
export const PUZZLE_TYPES: PuzzleType[] = [
  { mainItem: 'dog-sitting', differentItem: 'cat-sitting', description: 'Find the cat among dogs', gridSize: 4 },
  { mainItem: 'mouse-sitting', differentItem: 'mouse-lying', description: 'Find the mouse with different pose', gridSize: 4 },
  { mainItem: 'rabbit-running', differentItem: 'dog-running', description: 'Find the dog among rabbits', gridSize: 4 },
  { mainItem: 'rabbit-standing', differentItem: 'rabbit-sitting', description: 'Find the rabbit with different pose', gridSize: 4 },
  { mainItem: 'horse-standing', differentItem: 'dog-sitting', description: 'Find the dog among horses', gridSize: 4, gridRows: 5 },
  { mainItem: 'apple', differentItem: 'strawberry', description: 'Find the different fruit', gridSize: 4 },
  { mainItem: 'pear', differentItem: 'pear-no-leaf', description: 'Find the pear without a leaf', gridSize: 4 },
  { mainItem: 'bird-small', differentItem: 'bird-tall', description: 'Find the different bird', gridSize: 4 },
  { mainItem: 'penguin', differentItem: 'owl', description: 'Find the owl among penguins', gridSize: 4 },
  { mainItem: 'wolf-howling', differentItem: 'dog-sitting', description: 'Find the dog among wolves', gridSize: 4 },
  // Additional puzzle types for more variety
  { mainItem: 'cat-sitting', differentItem: 'dog-sitting', description: 'Find the dog among cats', gridSize: 4 },
  { mainItem: 'owl', differentItem: 'penguin', description: 'Find the penguin among owls', gridSize: 4 },
  { mainItem: 'strawberry', differentItem: 'apple', description: 'Find the apple among strawberries', gridSize: 4 },
  { mainItem: 'dog-running', differentItem: 'rabbit-running', description: 'Find the rabbit among dogs', gridSize: 4 },
  { mainItem: 'bird-tall', differentItem: 'bird-small', description: 'Find the small bird', gridSize: 4 },
];

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate a unique puzzle configuration with random position
// Difficulty affects grid size: 1=4x4, 2=5x5, 3=6x6, 4=7x7, 5=8x8
export function generateVisualSearchConfig(taskIndex: number, sessionSeed: number = Date.now(), difficulty: number = 1): VisualSearchConfig {
  const rng = seededRandom(sessionSeed + taskIndex * 1000);
  
  // Pick a puzzle type (cycling through all types)
  const puzzleType = PUZZLE_TYPES[taskIndex % PUZZLE_TYPES.length];
  const { mainItem, differentItem, description } = puzzleType;
  
  // Grid size increases with difficulty
  const gridSize = 3 + difficulty; // 4, 5, 6, 7, 8
  const actualRows = gridSize;
  
  // Generate random position for the different item
  const row = Math.floor(rng() * actualRows);
  const col = Math.floor(rng() * gridSize);
  
  return {
    id: taskIndex + 1,
    gridSize,
    gridRows: actualRows,
    mainItem,
    differentItems: [{ row, col, item: differentItem }],
    totalDifferent: 1,
    description,
  };
}

// SVG asset paths for silhouettes
export const SILHOUETTE_ASSETS: Record<string, string> = {
  'dog-sitting': '/assets/visual-search/dog-sitting.svg',
  'cat-sitting': '/assets/visual-search/cat-sitting.svg',
  'mouse-sitting': '/assets/visual-search/mouse-sitting.svg',
  'mouse-lying': '/assets/visual-search/mouse-lying.svg',
  'rabbit-running': '/assets/visual-search/rabbit-running.svg',
  'rabbit-standing': '/assets/visual-search/rabbit-standing.svg',
  'rabbit-sitting': '/assets/visual-search/rabbit-sitting.svg',
  'dog-running': '/assets/visual-search/dog-running.svg',
  'horse-standing': '/assets/visual-search/horse-standing.svg',
  'apple': '/assets/visual-search/apple.svg',
  'strawberry': '/assets/visual-search/strawberry.svg',
  'pear': '/assets/visual-search/pear.svg',
  'pear-no-leaf': '/assets/visual-search/pear-no-leaf.svg',
  'bird-small': '/assets/visual-search/bird-small.svg',
  'bird-tall': '/assets/visual-search/bird-tall.svg',
  'penguin': '/assets/visual-search/penguin.svg',
  'owl': '/assets/visual-search/owl.svg',
  'wolf-howling': '/assets/visual-search/wolf-howling.svg',
};

// Fallback emoji representations (used if SVG not available)
export const SILHOUETTE_EMOJI: Record<string, string> = {
  'dog-sitting': '🐕',
  'cat-sitting': '🐱',
  'mouse-sitting': '🐭',
  'mouse-lying': '🐀',
  'rabbit-running': '🐇',
  'rabbit-standing': '🐰',
  'rabbit-sitting': '🐰',
  'dog-running': '🐕',
  'horse-standing': '🐎',
  'apple': '🍎',
  'strawberry': '🍓',
  'pear': '🍐',
  'pear-no-leaf': '🍐',
  'bird-small': '🐦',
  'bird-tall': '🐧',
  'penguin': '🐧',
  'owl': '🦉',
  'wolf-howling': '🐺',
};

// All 10 configurations based on EXACT reference images
export const VISUAL_SEARCH_CONFIGS: VisualSearchConfig[] = [
  // ============================================
  // Image 1: Dogs (sitting) with 1 Cat
  // Grid: 4x4, Cat at row 2 (0-indexed), col 2
  // ============================================
  {
    id: 1,
    gridSize: 4,
    mainItem: 'dog-sitting',
    differentItems: [{ row: 2, col: 1, item: 'cat-sitting' }],
    totalDifferent: 1,
    description: 'Find the cat among dogs',
  },

  // ============================================
  // Image 2: Mice (sitting) with 1 Mouse (lying flat)
  // Grid: 4x4, Different mouse at row 2, col 3
  // ============================================
  {
    id: 2,
    gridSize: 4,
    mainItem: 'mouse-sitting',
    differentItems: [{ row: 2, col: 3, item: 'mouse-lying' }],
    totalDifferent: 1,
    description: 'Find the mouse with different pose',
  },

  // ============================================
  // Image 3: Rabbits (running) with 1 Dog (running)
  // Grid: 4x4, Dog at row 0, col 3
  // ============================================
  {
    id: 3,
    gridSize: 4,
    mainItem: 'rabbit-running',
    differentItems: [{ row: 0, col: 3, item: 'dog-running' }],
    totalDifferent: 1,
    description: 'Find the dog among rabbits',
  },

  // ============================================
  // Image 4: Rabbits (standing upright) with 1 Rabbit (sitting)
  // Grid: 4x4, Sitting rabbit at row 2, col 0
  // ============================================
  {
    id: 4,
    gridSize: 4,
    mainItem: 'rabbit-standing',
    differentItems: [{ row: 2, col: 0, item: 'rabbit-sitting' }],
    totalDifferent: 1,
    description: 'Find the rabbit with different pose',
  },

  // ============================================
  // Image 5: Horses (standing) with 1 Dog
  // Grid: 5x4 (5 cols, 4 rows), Dog at row 0, col 1
  // ============================================
  {
    id: 5,
    gridSize: 4,
    gridRows: 5,
    mainItem: 'horse-standing',
    differentItems: [{ row: 0, col: 1, item: 'dog-sitting' }],
    totalDifferent: 1,
    description: 'Find the dog among horses',
  },

  // ============================================
  // Image 6: Apples with 1 Strawberry (different leaf pattern)
  // Grid: 4x4, Strawberry at row 1, col 0
  // ============================================
  {
    id: 6,
    gridSize: 4,
    mainItem: 'apple',
    differentItems: [{ row: 1, col: 0, item: 'strawberry' }],
    totalDifferent: 1,
    description: 'Find the different fruit',
  },

  // ============================================
  // Image 7: Pears (with leaf) with 1 Pear (no leaf, just stem)
  // Grid: 4x4, Different pear at row 1, col 2
  // ============================================
  {
    id: 7,
    gridSize: 4,
    mainItem: 'pear',
    differentItems: [{ row: 1, col: 2, item: 'pear-no-leaf' }],
    totalDifferent: 1,
    description: 'Find the pear without a leaf',
  },

  // ============================================
  // Image 8: Small birds (sparrows) with 1 Tall bird
  // Grid: 4x4, Tall bird at row 2, col 3
  // ============================================
  {
    id: 8,
    gridSize: 4,
    mainItem: 'bird-small',
    differentItems: [{ row: 2, col: 3, item: 'bird-tall' }],
    totalDifferent: 1,
    description: 'Find the different bird',
  },

  // ============================================
  // Image 9: Penguins with 1 Owl
  // Grid: 4x4, Owl at row 0, col 2
  // ============================================
  {
    id: 9,
    gridSize: 4,
    mainItem: 'penguin',
    differentItems: [{ row: 0, col: 2, item: 'owl' }],
    totalDifferent: 1,
    description: 'Find the owl among penguins',
  },

  // ============================================
  // Image 10: Wolves (howling) - all same (practice recognition)
  // Grid: 4x4, No different item (all wolves)
  // Note: This appears to be a "no difference" challenge
  // ============================================
  {
    id: 10,
    gridSize: 4,
    mainItem: 'wolf-howling',
    differentItems: [], // All same - this is intentional
    totalDifferent: 0,
    description: 'All wolves are the same - click anywhere to continue',
  },

  // ============================================
  // Additional levels (11-15) for increased difficulty
  // ============================================
  {
    id: 11,
    gridSize: 5,
    mainItem: 'dog-sitting',
    differentItems: [{ row: 3, col: 4, item: 'cat-sitting' }],
    totalDifferent: 1,
    description: 'Find the cat among dogs (larger grid)',
  },
  {
    id: 12,
    gridSize: 5,
    mainItem: 'rabbit-running',
    differentItems: [
      { row: 1, col: 2, item: 'dog-running' },
      { row: 4, col: 0, item: 'dog-running' },
    ],
    totalDifferent: 2,
    description: 'Find 2 dogs among rabbits',
  },
  {
    id: 13,
    gridSize: 6,
    mainItem: 'penguin',
    differentItems: [
      { row: 2, col: 4, item: 'owl' },
      { row: 5, col: 1, item: 'owl' },
    ],
    totalDifferent: 2,
    description: 'Find 2 owls among penguins',
  },
  {
    id: 14,
    gridSize: 6,
    mainItem: 'apple',
    differentItems: [
      { row: 0, col: 3, item: 'strawberry' },
      { row: 3, col: 5, item: 'pear' },
      { row: 5, col: 2, item: 'strawberry' },
    ],
    totalDifferent: 3,
    description: 'Find 3 different fruits',
  },
  {
    id: 15,
    gridSize: 6,
    mainItem: 'mouse-sitting',
    differentItems: [
      { row: 1, col: 1, item: 'mouse-lying' },
      { row: 2, col: 4, item: 'cat-sitting' },
      { row: 4, col: 2, item: 'mouse-lying' },
      { row: 5, col: 5, item: 'cat-sitting' },
    ],
    totalDifferent: 4,
    description: 'Find all different animals',
  },
];

export function getVisualSearchConfig(level: number): VisualSearchConfig {
  const index = Math.max(0, Math.min(level - 1, VISUAL_SEARCH_CONFIGS.length - 1));
  return VISUAL_SEARCH_CONFIGS[index];
}

export function getSilhouetteAsset(name: string): string {
  return SILHOUETTE_ASSETS[name] || '';
}

export function getSilhouetteEmoji(name: string): string {
  return SILHOUETTE_EMOJI[name] || '❓';
}
