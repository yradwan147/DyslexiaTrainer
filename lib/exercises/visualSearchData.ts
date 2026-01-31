// Visual Search Exercise Data - 10 configurations based on EXACT reference images
// All items are BLACK SILHOUETTES as shown in the reference images
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
