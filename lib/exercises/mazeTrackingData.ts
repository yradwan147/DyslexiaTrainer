// Maze Tracking Exercise Data - All 15 configurations based on EXACT reference images
// Each maze has a specific wall pattern, character type, and collectible type

export interface MazeConfig {
  id: number;
  gridSize: number; // 8 or 10
  characterType: 'pirate' | 'robot' | 'wizard' | 'bird' | 'none';
  characterPosition: 'top-left' | 'left' | 'bottom-right' | 'none';
  collectibleType: 'treasure' | 'treasure-blue' | 'coin' | 'sheep' | 'key' | 'none';
  collectibleCount: number;
  // Wall segments: array of [startRow, startCol, endRow, endCol] for horizontal/vertical walls
  // Walls are encoded as line segments within the grid
  walls: WallSegment[];
  // Collectible positions: [row, col, order]
  collectibles: CollectiblePosition[];
}

export interface WallSegment {
  type: 'h' | 'v'; // horizontal or vertical
  row: number;
  col: number;
  length: number;
}

export interface CollectiblePosition {
  row: number;
  col: number;
  order: number; // Collection order (1 = first, etc.)
}

// Helper to create wall segments more easily
function h(row: number, col: number, length: number): WallSegment {
  return { type: 'h', row, col, length };
}

function v(row: number, col: number, length: number): WallSegment {
  return { type: 'v', row, col, length };
}

export const MAZE_CONFIGS: MazeConfig[] = [
  // ============================================
  // Maze 1: Pirate with 6 treasure chests
  // ============================================
  {
    id: 1,
    gridSize: 8,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure',
    collectibleCount: 6,
    walls: [
      // Top border and internal walls
      h(0, 0, 8), // top border
      v(0, 0, 8), // left border
      h(8, 0, 8), // bottom border
      v(0, 8, 8), // right border
      // Internal walls - maze 1 pattern
      h(1, 1, 3), v(1, 4, 2), h(1, 5, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 3),
      h(4, 1, 2), v(4, 4, 2), h(4, 6, 2),
      v(5, 1, 2), h(5, 2, 2), v(5, 5, 2),
      h(6, 0, 3), h(6, 4, 2), v(6, 7, 2),
      h(7, 2, 4),
    ],
    collectibles: [
      { row: 0, col: 5, order: 1 },
      { row: 3, col: 4, order: 2 },
      { row: 3, col: 7, order: 3 },
      { row: 5, col: 1, order: 4 },
      { row: 5, col: 5, order: 5 },
      { row: 7, col: 7, order: 6 }, // Exit treasure (larger)
    ],
  },

  // ============================================
  // Maze 2: Pirate with 4 blue treasure chests
  // ============================================
  {
    id: 2,
    gridSize: 8,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure-blue',
    collectibleCount: 4,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      // Different internal pattern
      v(1, 1, 2), h(1, 2, 2), v(1, 5, 3), h(1, 6, 2),
      h(2, 1, 2), v(2, 4, 2), h(2, 5, 2),
      h(3, 0, 2), v(3, 3, 3), h(3, 4, 2), v(3, 7, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2),
      h(5, 1, 3), v(5, 5, 2), h(5, 6, 2),
      v(6, 2, 2), h(6, 3, 3), v(6, 7, 2),
      h(7, 1, 3), h(7, 5, 2),
    ],
    collectibles: [
      { row: 1, col: 4, order: 1 },
      { row: 2, col: 1, order: 2 },
      { row: 4, col: 4, order: 3 },
      { row: 7, col: 7, order: 4 },
    ],
  },

  // ============================================
  // Maze 3: Robot with 8 coins
  // ============================================
  {
    id: 3,
    gridSize: 8,
    characterType: 'robot',
    characterPosition: 'top-left',
    collectibleType: 'coin',
    collectibleCount: 8,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      // Maze 3 pattern
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2),
      v(2, 1, 3), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2),
      h(3, 3, 2), v(3, 6, 2),
      h(4, 0, 2), v(4, 2, 2), h(4, 3, 3), v(4, 7, 2),
      v(5, 1, 2), h(5, 2, 2), v(5, 5, 2),
      h(6, 1, 2), h(6, 4, 3),
      v(7, 3, 1), h(7, 4, 2),
    ],
    collectibles: [
      { row: 0, col: 3, order: 1 },
      { row: 1, col: 6, order: 2 },
      { row: 2, col: 2, order: 3 },
      { row: 3, col: 5, order: 4 },
      { row: 4, col: 1, order: 5 },
      { row: 5, col: 4, order: 6 },
      { row: 6, col: 2, order: 7 },
      { row: 6, col: 7, order: 8 },
    ],
  },

  // ============================================
  // Maze 4: Layout only (no character/collectibles in reference)
  // ============================================
  {
    id: 4,
    gridSize: 8,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure',
    collectibleCount: 5,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      h(1, 1, 1), v(1, 2, 2), h(1, 3, 2), v(1, 6, 2),
      v(2, 1, 2), h(2, 3, 1), v(2, 5, 2), h(2, 6, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2),
      h(5, 1, 2), v(5, 4, 2), h(5, 5, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2),
      h(7, 1, 3), h(7, 5, 2),
    ],
    collectibles: [
      { row: 1, col: 5, order: 1 },
      { row: 3, col: 2, order: 2 },
      { row: 4, col: 6, order: 3 },
      { row: 6, col: 1, order: 4 },
      { row: 7, col: 7, order: 5 },
    ],
  },

  // ============================================
  // Maze 5: Different layout
  // ============================================
  {
    id: 5,
    gridSize: 8,
    characterType: 'robot',
    characterPosition: 'top-left',
    collectibleType: 'coin',
    collectibleCount: 6,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      // Maze 5 pattern (from image)
      h(1, 0, 2), v(1, 3, 3), h(1, 4, 2), v(1, 7, 2),
      h(2, 1, 2), v(2, 5, 2),
      v(3, 1, 2), h(3, 2, 2), h(3, 5, 2),
      h(4, 0, 2), v(4, 3, 2), h(4, 4, 2), v(4, 7, 2),
      v(5, 1, 2), h(5, 2, 3), v(5, 6, 2),
      h(6, 1, 2), h(6, 4, 2),
      h(7, 2, 4),
    ],
    collectibles: [
      { row: 1, col: 2, order: 1 },
      { row: 2, col: 6, order: 2 },
      { row: 4, col: 2, order: 3 },
      { row: 5, col: 5, order: 4 },
      { row: 6, col: 1, order: 5 },
      { row: 7, col: 6, order: 6 },
    ],
  },

  // ============================================
  // Maze 6: Bird with 4 sheep
  // ============================================
  {
    id: 6,
    gridSize: 8,
    characterType: 'bird',
    characterPosition: 'bottom-right',
    collectibleType: 'sheep',
    collectibleCount: 4,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      // Maze 6 pattern
      h(1, 0, 3), v(1, 4, 2), h(1, 5, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 6, 2),
      h(3, 1, 2), v(3, 4, 2), h(3, 5, 2),
      h(4, 0, 2), h(4, 3, 2), v(4, 6, 2),
      v(5, 1, 2), h(5, 2, 3), v(5, 7, 2),
      h(6, 1, 2), v(6, 4, 2), h(6, 5, 2),
      h(7, 2, 3), h(7, 6, 2),
    ],
    collectibles: [
      { row: 1, col: 4, order: 1 },
      { row: 3, col: 2, order: 2 },
      { row: 5, col: 6, order: 3 },
      { row: 6, col: 3, order: 4 },
    ],
  },

  // ============================================
  // Maze 7: Wizard with 8 keys
  // ============================================
  {
    id: 7,
    gridSize: 10,
    characterType: 'wizard',
    characterPosition: 'left',
    collectibleType: 'key',
    collectibleCount: 8,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      // Larger maze pattern
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2), v(1, 8, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2), v(2, 9, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2), h(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2), v(4, 8, 2),
      h(5, 1, 2), v(5, 4, 2), h(5, 5, 3), v(5, 9, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), h(7, 3, 2), v(7, 6, 2), h(7, 7, 2),
      v(8, 1, 2), h(8, 2, 3), v(8, 6, 2), h(8, 7, 2),
      h(9, 2, 2), h(9, 5, 3),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 1, col: 7, order: 2 },
      { row: 3, col: 1, order: 3 },
      { row: 3, col: 6, order: 4 },
      { row: 5, col: 3, order: 5 },
      { row: 5, col: 8, order: 6 },
      { row: 7, col: 2, order: 7 },
      { row: 9, col: 9, order: 8 },
    ],
  },

  // ============================================
  // Mazes 8-15: Various layouts with default themes
  // ============================================
  {
    id: 8,
    gridSize: 10,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure',
    collectibleCount: 6,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 1, 2), v(1, 4, 3), h(1, 5, 2), v(1, 8, 2),
      v(2, 1, 2), h(2, 2, 2), h(2, 6, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 3), v(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), v(4, 5, 2), h(4, 6, 2),
      h(5, 1, 3), v(5, 5, 2), h(5, 6, 3),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), v(7, 3, 2), h(7, 4, 2), v(7, 7, 2),
      v(8, 1, 2), h(8, 2, 3), h(8, 6, 3),
      h(9, 2, 3), v(9, 6, 1), h(9, 7, 2),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 3, col: 7, order: 2 },
      { row: 5, col: 2, order: 3 },
      { row: 6, col: 8, order: 4 },
      { row: 8, col: 4, order: 5 },
      { row: 9, col: 9, order: 6 },
    ],
  },

  {
    id: 9,
    gridSize: 10,
    characterType: 'robot',
    characterPosition: 'top-left',
    collectibleType: 'coin',
    collectibleCount: 7,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 1, 3), v(1, 5, 2), h(1, 6, 2), v(1, 9, 2),
      v(2, 2, 2), h(2, 3, 2), v(2, 6, 2), h(2, 7, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2), h(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2), v(4, 8, 2),
      h(5, 1, 2), v(5, 4, 3), h(5, 5, 2), h(5, 8, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), h(7, 3, 3), v(7, 7, 2), h(7, 8, 2),
      v(8, 1, 2), h(8, 2, 2), h(8, 5, 2), v(8, 8, 2),
      h(9, 2, 3), h(9, 6, 3),
    ],
    collectibles: [
      { row: 1, col: 4, order: 1 },
      { row: 2, col: 8, order: 2 },
      { row: 4, col: 3, order: 3 },
      { row: 5, col: 7, order: 4 },
      { row: 7, col: 2, order: 5 },
      { row: 8, col: 6, order: 6 },
      { row: 9, col: 9, order: 7 },
    ],
  },

  {
    id: 10,
    gridSize: 8,
    characterType: 'wizard',
    characterPosition: 'top-left',
    collectibleType: 'key',
    collectibleCount: 5,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2),
      v(2, 1, 3), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2),
      h(3, 3, 2), v(3, 6, 2),
      h(4, 0, 2), v(4, 2, 2), h(4, 3, 3),
      v(5, 1, 2), h(5, 2, 2), v(5, 5, 2), h(5, 6, 2),
      h(6, 1, 2), h(6, 4, 3),
      h(7, 2, 4),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 3, col: 5, order: 2 },
      { row: 5, col: 1, order: 3 },
      { row: 6, col: 6, order: 4 },
      { row: 7, col: 7, order: 5 },
    ],
  },

  {
    id: 11,
    gridSize: 10,
    characterType: 'bird',
    characterPosition: 'bottom-right',
    collectibleType: 'sheep',
    collectibleCount: 6,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 3), v(1, 9, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2), h(3, 8, 2),
      v(4, 1, 2), h(4, 2, 3), h(4, 6, 2), v(4, 9, 2),
      h(5, 1, 2), v(5, 4, 2), h(5, 5, 2), v(5, 8, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), h(7, 3, 2), v(7, 6, 2), h(7, 7, 2),
      v(8, 1, 2), h(8, 2, 2), h(8, 5, 3),
      h(9, 2, 2), h(9, 5, 2), v(9, 8, 1),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 3, col: 6, order: 2 },
      { row: 5, col: 2, order: 3 },
      { row: 6, col: 8, order: 4 },
      { row: 8, col: 4, order: 5 },
      { row: 9, col: 7, order: 6 },
    ],
  },

  {
    id: 12,
    gridSize: 10,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure',
    collectibleCount: 7,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 0, 3), v(1, 4, 2), h(1, 5, 2), v(1, 8, 2),
      v(2, 2, 2), h(2, 3, 2), h(2, 6, 2), v(2, 9, 2),
      h(3, 1, 2), v(3, 4, 2), h(3, 5, 2), v(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), v(4, 5, 2), h(4, 6, 3),
      h(5, 0, 2), h(5, 3, 2), v(5, 6, 2), h(5, 7, 2),
      v(6, 1, 2), h(6, 2, 2), v(6, 5, 2), h(6, 6, 2), v(6, 9, 2),
      h(7, 1, 2), h(7, 4, 2), v(7, 7, 2), h(7, 8, 2),
      v(8, 2, 2), h(8, 3, 2), h(8, 6, 2),
      h(9, 1, 3), h(9, 5, 3),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 2, col: 7, order: 2 },
      { row: 4, col: 4, order: 3 },
      { row: 5, col: 8, order: 4 },
      { row: 7, col: 2, order: 5 },
      { row: 8, col: 5, order: 6 },
      { row: 9, col: 9, order: 7 },
    ],
  },

  {
    id: 13,
    gridSize: 8,
    characterType: 'robot',
    characterPosition: 'top-left',
    collectibleType: 'coin',
    collectibleCount: 5,
    walls: [
      h(0, 0, 8), v(0, 0, 8), h(8, 0, 8), v(0, 8, 8),
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2),
      h(5, 1, 3), v(5, 5, 2), h(5, 6, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2),
      h(7, 1, 2), h(7, 4, 3),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 3, col: 6, order: 2 },
      { row: 5, col: 2, order: 3 },
      { row: 6, col: 5, order: 4 },
      { row: 7, col: 7, order: 5 },
    ],
  },

  {
    id: 14,
    gridSize: 10,
    characterType: 'wizard',
    characterPosition: 'left',
    collectibleType: 'key',
    collectibleCount: 6,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2), v(1, 8, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2), v(2, 9, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2), h(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2), v(4, 8, 2),
      h(5, 1, 2), v(5, 4, 2), h(5, 5, 2), h(5, 8, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), h(7, 3, 3), v(7, 7, 2), h(7, 8, 2),
      v(8, 1, 2), h(8, 2, 2), h(8, 5, 2), v(8, 8, 2),
      h(9, 2, 3), h(9, 6, 3),
    ],
    collectibles: [
      { row: 1, col: 3, order: 1 },
      { row: 3, col: 6, order: 2 },
      { row: 5, col: 3, order: 3 },
      { row: 6, col: 8, order: 4 },
      { row: 8, col: 4, order: 5 },
      { row: 9, col: 9, order: 6 },
    ],
  },

  {
    id: 15,
    gridSize: 10,
    characterType: 'pirate',
    characterPosition: 'top-left',
    collectibleType: 'treasure',
    collectibleCount: 8,
    walls: [
      h(0, 0, 10), v(0, 0, 10), h(10, 0, 10), v(0, 10, 10),
      h(1, 1, 2), v(1, 4, 2), h(1, 5, 2), v(1, 8, 2),
      v(2, 1, 2), h(2, 2, 2), v(2, 5, 2), h(2, 6, 2), v(2, 9, 2),
      h(3, 0, 2), v(3, 3, 2), h(3, 4, 2), v(3, 7, 2), h(3, 8, 2),
      v(4, 1, 2), h(4, 2, 2), h(4, 5, 2), v(4, 8, 2),
      h(5, 1, 2), v(5, 4, 2), h(5, 5, 2), h(5, 8, 2),
      v(6, 2, 2), h(6, 3, 2), v(6, 6, 2), h(6, 7, 2),
      h(7, 0, 2), h(7, 3, 3), v(7, 7, 2), h(7, 8, 2),
      v(8, 1, 2), h(8, 2, 2), h(8, 5, 2), v(8, 8, 2),
      h(9, 2, 3), h(9, 6, 3),
    ],
    collectibles: [
      { row: 0, col: 5, order: 1 },
      { row: 2, col: 3, order: 2 },
      { row: 2, col: 8, order: 3 },
      { row: 4, col: 6, order: 4 },
      { row: 6, col: 2, order: 5 },
      { row: 6, col: 8, order: 6 },
      { row: 8, col: 4, order: 7 },
      { row: 9, col: 9, order: 8 },
    ],
  },
];

// Get emoji/icon for character type
export function getCharacterEmoji(type: MazeConfig['characterType']): string {
  switch (type) {
    case 'pirate': return '🏴‍☠️';
    case 'robot': return '🤖';
    case 'wizard': return '🧙';
    case 'bird': return '🦅';
    default: return '👤';
  }
}

// Get emoji/icon for collectible type
export function getCollectibleEmoji(type: MazeConfig['collectibleType'], isLast: boolean = false): string {
  switch (type) {
    case 'treasure': return isLast ? '🏆' : '📦';
    case 'treasure-blue': return isLast ? '🏆' : '💎';
    case 'coin': return '🪙';
    case 'sheep': return '🐑';
    case 'key': return '🔑';
    default: return '⭐';
  }
}

export function getMazeConfig(level: number): MazeConfig {
  const index = Math.max(0, Math.min(level - 1, MAZE_CONFIGS.length - 1));
  return MAZE_CONFIGS[index];
}

// ============================================
// PROCEDURAL GENERATION
// ============================================

// Seeded random number generator
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Character and collectible type options
const CHARACTER_TYPES: MazeConfig['characterType'][] = ['pirate', 'robot', 'wizard', 'bird'];
const CHARACTER_POSITIONS: MazeConfig['characterPosition'][] = ['top-left', 'left', 'bottom-right'];
const COLLECTIBLE_TYPES: MazeConfig['collectibleType'][] = ['treasure', 'treasure-blue', 'coin', 'sheep', 'key'];

// Generate random walls for a maze
function generateRandomWalls(gridSize: number, rng: () => number): WallSegment[] {
  const walls: WallSegment[] = [];
  
  // Border walls
  walls.push(h(0, 0, gridSize));
  walls.push(v(0, 0, gridSize));
  walls.push(h(gridSize, 0, gridSize));
  walls.push(v(0, gridSize, gridSize));
  
  // Add internal walls - random pattern
  const numWalls = 6 + Math.floor(rng() * 8);
  
  for (let i = 0; i < numWalls; i++) {
    const isHorizontal = rng() > 0.5;
    const row = 1 + Math.floor(rng() * (gridSize - 2));
    const col = Math.floor(rng() * (gridSize - 2));
    const length = 1 + Math.floor(rng() * 3);
    
    if (isHorizontal) {
      walls.push(h(row, col, Math.min(length, gridSize - col)));
    } else {
      walls.push(v(row, col, Math.min(length, gridSize - row)));
    }
  }
  
  return walls;
}

// Generate collectible positions
function generateCollectibles(gridSize: number, count: number, rng: () => number): CollectiblePosition[] {
  const collectibles: CollectiblePosition[] = [];
  const usedPositions = new Set<string>();
  
  for (let order = 1; order <= count; order++) {
    let attempts = 0;
    let row: number, col: number;
    
    do {
      row = Math.floor(rng() * gridSize);
      col = Math.floor(rng() * gridSize);
      attempts++;
    } while (usedPositions.has(`${row}-${col}`) && attempts < 50);
    
    usedPositions.add(`${row}-${col}`);
    collectibles.push({ row, col, order });
  }
  
  return collectibles;
}

// Generate a procedural maze configuration
// Difficulty affects grid size and collectible count
// Level 1: 6x6, 3-4 collectibles | Level 5: 12x12, 8-10 collectibles
export function generateMazeConfig(taskIndex: number, sessionSeed: number = Date.now(), difficulty: number = 1): MazeConfig {
  const rng = seededRandom(sessionSeed + taskIndex * 1000);
  
  // Grid size increases with difficulty: 6, 7, 8, 10, 12
  const gridSizes = [6, 7, 8, 10, 12];
  const gridSize = gridSizes[Math.min(difficulty - 1, 4)];
  
  // Collectible count increases with difficulty
  const baseCollectibles = 2 + difficulty; // 3, 4, 5, 6, 7
  const collectibleCount = baseCollectibles + Math.floor(rng() * 2); // +0-1 random
  
  const characterType = CHARACTER_TYPES[Math.floor(rng() * CHARACTER_TYPES.length)];
  const characterPosition = CHARACTER_POSITIONS[Math.floor(rng() * CHARACTER_POSITIONS.length)];
  const collectibleType = COLLECTIBLE_TYPES[Math.floor(rng() * COLLECTIBLE_TYPES.length)];
  
  return {
    id: 100 + taskIndex,
    gridSize,
    characterType,
    characterPosition,
    collectibleType,
    collectibleCount,
    walls: generateRandomWalls(gridSize, rng),
    collectibles: generateCollectibles(gridSize, collectibleCount, rng),
  };
}

// Get maze config: first 15 are static, then procedural
export function getMazeTrackingConfig(taskIndex: number, sessionSeed: number): MazeConfig {
  if (taskIndex < MAZE_CONFIGS.length) {
    return MAZE_CONFIGS[taskIndex];
  }
  return generateMazeConfig(taskIndex, sessionSeed);
}
