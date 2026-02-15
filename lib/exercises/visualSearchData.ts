// Visual Search Exercise Data
// Uses actual PNG images from /assets/visual-search/
// 10 puzzle types (main item + different item) derived from reference config
// 15-level progression: grid size increases, number of different items increases

export interface VisualSearchConfig {
  id: number;
  gridSize: number; // Grid columns (= rows, always square)
  mainItem: string; // PNG filename without extension
  differentItems: { row: number; col: number; item: string }[];
  totalDifferent: number;
  description: string;
}

// 10 puzzle types from config_images.txt
// Each defines a main item, a different item, and a description
export interface PuzzleType {
  mainItem: string;
  differentItem: string;
  description: string;
}

export const PUZZLE_TYPES: PuzzleType[] = [
  { mainItem: 'sitting_dog', differentItem: 'sitting_cat', description: 'Find the cat among dogs' },
  { mainItem: 'sitting_rat', differentItem: 'rat', description: 'Find the different rat' },
  { mainItem: 'jumping_bunny', differentItem: 'dog', description: 'Find the dog among bunnies' },
  { mainItem: 'front_bunny', differentItem: 'sitting_bunny', description: 'Find the bunny with different pose' },
  { mainItem: 'horse', differentItem: 'standing_dog', description: 'Find the dog among horses' },
  { mainItem: 'orange', differentItem: 'apple', description: 'Find the apple among oranges' },
  { mainItem: 'pear_leaf', differentItem: 'pear_no_leaf', description: 'Find the pear without a leaf' },
  { mainItem: 'bird', differentItem: 'sitting_bird', description: 'Find the different bird' },
  { mainItem: 'penguin', differentItem: 'owl', description: 'Find the owl among penguins' },
  { mainItem: 'wolf', differentItem: 'sitting_wolf', description: 'Find the different wolf' },
];

// 15-level progression table
// Level -> { gridSize, differentCount }
export const LEVEL_TABLE: { gridSize: number; differentCount: number }[] = [
  { gridSize: 4, differentCount: 1 },  // Level 1
  { gridSize: 5, differentCount: 1 },  // Level 2
  { gridSize: 5, differentCount: 2 },  // Level 3
  { gridSize: 6, differentCount: 1 },  // Level 4
  { gridSize: 6, differentCount: 2 },  // Level 5
  { gridSize: 6, differentCount: 3 },  // Level 6
  { gridSize: 7, differentCount: 1 },  // Level 7
  { gridSize: 7, differentCount: 2 },  // Level 8
  { gridSize: 7, differentCount: 3 },  // Level 9
  { gridSize: 7, differentCount: 4 },  // Level 10
  { gridSize: 8, differentCount: 1 },  // Level 11
  { gridSize: 8, differentCount: 2 },  // Level 12
  { gridSize: 8, differentCount: 3 },  // Level 13
  { gridSize: 8, differentCount: 4 },  // Level 14
  { gridSize: 8, differentCount: 5 },  // Level 15
];

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate a puzzle config for a given task index and level (1-15)
export function generateVisualSearchConfig(
  taskIndex: number,
  sessionSeed: number,
  level: number,
): VisualSearchConfig {
  const rng = seededRandom(sessionSeed + taskIndex * 1000);

  // Pick puzzle type (cycle through 10 types)
  const puzzleType = PUZZLE_TYPES[taskIndex % PUZZLE_TYPES.length];
  const { mainItem, differentItem, description } = puzzleType;

  // Look up level config (clamp to 1-15)
  const clampedLevel = Math.max(1, Math.min(15, level));
  const { gridSize, differentCount } = LEVEL_TABLE[clampedLevel - 1];

  // Place different items at unique random positions
  const totalCells = gridSize * gridSize;
  const differentItems: { row: number; col: number; item: string }[] = [];
  const usedPositions = new Set<number>();

  for (let i = 0; i < differentCount; i++) {
    let pos: number;
    do {
      pos = Math.floor(rng() * totalCells);
    } while (usedPositions.has(pos));
    usedPositions.add(pos);

    const row = Math.floor(pos / gridSize);
    const col = pos % gridSize;
    differentItems.push({ row, col, item: differentItem });
  }

  return {
    id: taskIndex + 1,
    gridSize,
    mainItem,
    differentItems,
    totalDifferent: differentCount,
    description,
  };
}

// Image path helper
export function getSearchImagePath(name: string): string {
  return `/assets/visual-search/${name}.png`;
}
