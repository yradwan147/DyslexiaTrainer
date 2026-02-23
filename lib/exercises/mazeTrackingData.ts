// Maze Tracking Exercise Data
// 15 hand-crafted mazes with wall grids, player position, and object positions
// Uses PNG sprites from /assets/maze/

export interface MazeConfig {
  maze_id: number;
  grid_size: number;       // 19 or 25
  corridors: number;       // 9 or 12
  grid: string[];          // text grid lines (# = wall, . = path)
  player: { row: number; col: number };
  objects: { row: number; col: number; order: number; reachable: boolean }[];
  object_count: number;
  reachable_count: number; // number of "correct" objects on path to exit
}

// Image path helpers
export function getPlayerImagePath(): string {
  return '/assets/maze/player.png';
}

export function getObjectImagePath(mazeId: number): string {
  return `/assets/maze/${mazeId}.png`;
}

// Expected reachable object counts per maze (from info.txt)
const EXPECTED_REACHABLE: Record<number, number> = {
  1: 4, 2: 4,                   // Mazes 1-2: 4 correct
  3: 5, 4: 5, 5: 5,             // Mazes 3-5: 5 correct
  6: 5, 7: 5, 8: 5, 9: 5, 10: 5, // Mazes 6-10: 5 correct
  11: 5, 12: 5, 13: 5, 14: 5, 15: 5, // Mazes 11-15: 5 correct
};

// BFS to find the shortest path from start to the nearest exit.
// Returns the set of cells on that shortest path (including start and exit).
function bfsShortestPathToExit(
  grid: string[][],
  startRow: number,
  startCol: number,
  exitCells: [number, number][]
): Set<string> {
  const key = (r: number, c: number) => `${r},${c}`;
  const exitSet = new Set(exitCells.map(([r, c]) => key(r, c)));

  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]] as const;

  const parent = new Map<string, string>();
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];
  visited.add(key(startRow, startCol));

  let exitReached: string | null = null;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cellKey = key(r, c);

    if (exitSet.has(cellKey)) {
      exitReached = cellKey;
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const nextKey = key(nr, nc);
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        grid[nr][nc] !== '#' && !visited.has(nextKey)
      ) {
        visited.add(nextKey);
        parent.set(nextKey, cellKey);
        queue.push([nr, nc]);
      }
    }
  }

  if (!exitReached) return new Set();

  // Backtrack from exit to start to get the shortest path
  const pathCells = new Set<string>();
  let current: string | undefined = exitReached;
  while (current) {
    pathCells.add(current);
    current = parent.get(current);
  }
  pathCells.add(key(startRow, startCol));
  return pathCells;
}

// Get the border cells that ensureBorderOpening would open for a given position.
// These are the "exit" cells for that opening - we use this for the last object's exit
// so we target the real exit, not the entrance (player's opening).
function getOpeningBorderCells(row: number, col: number, gs: number, w: number): [number, number][] {
  const distTop = row;
  const distBottom = gs - 1 - row;
  const distLeft = col;
  const distRight = w - 1 - col;
  const minDist = Math.min(distTop, distBottom, distLeft, distRight);
  const cells: [number, number][] = [];

  if (minDist === distTop && row > 0) {
    cells.push([0, col]);
  } else if (minDist === distBottom && row < gs - 1) {
    cells.push([gs - 1, col]);
  } else if (minDist === distLeft && col > 0) {
    cells.push([row, 0]);
  } else if (minDist === distRight && col < w - 1) {
    cells.push([row, w - 1]);
  }
  return cells;
}

// Parse a text grid to extract player, objects, and clean wall grid.
// Also ensures an exit opening exists on the outer border.
function parseMaze(id: number, lines: string[]): MazeConfig {
  let player = { row: 0, col: 0 };
  const objects: { row: number; col: number; order: number; reachable: boolean }[] = [];
  const gridRows: string[][] = []; // mutable char grid
  let objectOrder = 1;

  for (let r = 0; r < lines.length; r++) {
    const row: string[] = [];
    for (let c = 0; c < lines[r].length; c++) {
      const ch = lines[r][c];
      if (ch === 'P') {
        player = { row: r, col: c };
        row.push('.');
      } else if (ch === 'O') {
        objects.push({ row: r, col: c, order: objectOrder++, reachable: false });
        row.push('.');
      } else {
        row.push(ch);
      }
    }
    gridRows.push(row);
  }

  const gs = lines.length;
  const w = lines[0].length;

  // Ensure an entrance opening on the border next to the player
  ensureBorderOpening(gridRows, player.row, player.col, gs, w);

  // Ensure an exit opening on the border near the last object
  if (objects.length > 0) {
    const lastObj = objects[objects.length - 1];
    ensureBorderOpening(gridRows, lastObj.row, lastObj.col, gs, w);
  }

  const cleanGrid = gridRows.map(row => row.join(''));

  // Use only the exit opening (near last object), not the entrance (near player).
  // Otherwise when player is on the edge, BFS finds the adjacent entrance and path is empty.
  let exitCells: [number, number][] = [];
  if (objects.length > 0) {
    const lastObj = objects[objects.length - 1];
    exitCells = getOpeningBorderCells(lastObj.row, lastObj.col, gs, w);
  }
  let shortestPath = bfsShortestPathToExit(gridRows, player.row, player.col, exitCells);
  // Fallback: if no path to targeted exit (e.g. disconnected maze), use any reachable border cell
  if (shortestPath.size === 0) {
    const allBorderExits: [number, number][] = [];
    for (let c = 0; c < w; c++) {
      if (gridRows[0][c] !== '#' && !(0 === player.row && c === player.col)) allBorderExits.push([0, c]);
      if (gridRows[gs - 1][c] !== '#' && !(gs - 1 === player.row && c === player.col)) allBorderExits.push([gs - 1, c]);
    }
    for (let r = 1; r < gs - 1; r++) {
      if (gridRows[r][0] !== '#' && !(r === player.row && 0 === player.col)) allBorderExits.push([r, 0]);
      if (gridRows[r][w - 1] !== '#' && !(r === player.row && w - 1 === player.col)) allBorderExits.push([r, w - 1]);
    }
    shortestPath = bfsShortestPathToExit(gridRows, player.row, player.col, allBorderExits);
  }

  // Mark objects on the shortest path as correct, all others as incorrect
  for (const obj of objects) {
    obj.reachable = shortestPath.has(`${obj.row},${obj.col}`);
  }
  
  const reachableCount = objects.filter(o => o.reachable).length;
  const expectedCount = EXPECTED_REACHABLE[id] ?? reachableCount;

  // Sanity check: verify reachable count matches expected
  if (reachableCount !== expectedCount) {
    console.warn(
      `Maze ${id}: Expected ${expectedCount} reachable objects, but found ${reachableCount}. ` +
      `Objects: ${objects.map(o => `(${o.row},${o.col}):${o.reachable}`).join(', ')}`
    );
  }

  return {
    maze_id: id,
    grid_size: gs,
    corridors: (gs - 1) / 2,
    grid: cleanGrid,
    player,
    objects,
    object_count: objects.length,
    reachable_count: reachableCount,
  };
}

// Punch an opening in the nearest outer border wall for a given interior cell.
function ensureBorderOpening(grid: string[][], row: number, col: number, gs: number, w: number): void {
  // Find the closest border edge
  const distTop = row;
  const distBottom = gs - 1 - row;
  const distLeft = col;
  const distRight = w - 1 - col;
  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  if (minDist === distTop) {
    // Open path from row up to row 0
    for (let r = row - 1; r >= 0; r--) {
      if (grid[r][col] === '#') grid[r][col] = '.';
    }
  } else if (minDist === distBottom) {
    // Open path from row down to last row
    for (let r = row + 1; r < gs; r++) {
      if (grid[r][col] === '#') grid[r][col] = '.';
    }
  } else if (minDist === distLeft) {
    // Open path from col left to col 0
    for (let c = col - 1; c >= 0; c--) {
      if (grid[row][c] === '#') grid[row][c] = '.';
    }
  } else {
    // Open path from col right to last col
    for (let c = col + 1; c < w; c++) {
      if (grid[row][c] === '#') grid[row][c] = '.';
    }
  }
}

// All 15 mazes from reference images
export const MAZE_CONFIGS: MazeConfig[] = [
  // Maze 1: 9 corridors, 19x19, 5 chests
  parseMaze(1, [
    '###################',
    'P.......#....O....#',
    '###.#####.###.###.#',
    '#...........#...#.#',
    '#.#######.#####.#.#',
    '#...#.....#.....#.#',
    '###.#######.#####.#',
    '#.#...#.......#..O#',
    '#.#####.###.#.#.###',
    '#.....O...#.#.#...#',
    '#.#.#####.#.#.###.#',
    '#.#.#.....#.#...#.#',
    '###.#######.###.#.#',
    '#O........#.#...#.#',
    '#.#######.#######.#',
    '#...#...#.......#.#',
    '###.#.#.#######.###',
    '#.....#.......#..O#',
    '###################',
  ]),

  // Maze 2: 9 corridors, 19x19, 5 purple chests
  parseMaze(2, [
    '###################',
    'P.....#..O......#.#',
    '###.#.#...#####.#.#',
    '#...#...#.#...#...#',
    '#.#.#####.#.#######',
    '#.#.#.....#.....#.#',
    '###.#.#######.#.#.#',
    '#..O#.....#...#...#',
    '#.#.#####.#.#######',
    '#.......#.#.....#.#',
    '#.###.###.#.#.#.#.#',
    '#...#...#.#.#.#...#',
    '###.#.#.###...###.#',
    '#..O#.#....O#...#.#',
    '#.###.#########.#.#',
    '#...#...#...#.#.#.#',
    '###.#####.#.#.#.###',
    '#.........#...#..O#',
    '###################',
  ]),

  // Maze 3: 9 corridors, 19x19, 7 coins
  parseMaze(3, [
    '###################',
    '#..O..#...#.......#',
    '#####.#.#.###.###.#',
    'P.....#.#.#..O#...#',
    '###.###.#.#.#######',
    '#....O..#.#...#...#',
    '#.#.#####.###.#.#.#',
    '#.#.#...#.#...#.#.#',
    '#.#.#.###.#.###.###',
    '#.#...#..O..#...#.#',
    '#.###.#.#.###.###.#',
    '#O..#.#.#.....#...#',
    '#######.#######.#.#',
    '#.#.......#.....#.#',
    '#.#.#.#####.#.#####',
    '#...#.O.....#....O.',
    '#.#######.#########',
    '#.......#.........#',
    '###################',
  ]),

  // Maze 4: 9 corridors, 19x19, 7 frogs
  parseMaze(4, [
    '###################',
    'P..O....#...#...#.#',
    '###.###.#.#.#.#.#.#',
    '#.#...#..O....#.#.#',
    '#.#.#.#########.#.#',
    '#...#.#.......#...#',
    '#.###O#.#.#########',
    '#...#.#.#.#.....#.#',
    '###.#.#.#.#.#.#.#.#',
    '#.O.....#.#.#.#...#',
    '#...#.#####.#.###.#',
    '#.#.#...#...#.#...#',
    '#.#.#####.###.###.#',
    '#.#....O....#.O.#.#',
    '#.#####.###.#.#.###',
    '#O..#.......#.#...#',
    '###.#.#######.###.#',
    '#...#...........#.#',
    '###################',
  ]),

  // Maze 5: 9 corridors, 19x19, 7 diamonds
  parseMaze(5, [
    '###################',
    '#.....#.......O...#',
    '#.#####.#####.#.#.#',
    '#.....#...O.#...#.#',
    '#####.#.###.#######',
    '#...#.#.#.#...#...#',
    '#.###.#.#.#.#.#.#.#',
    '#....O..#.#.#.#.#.#',
    '###.#####.#.#.#.#.#',
    '#.#.#.....#.#...#.#',
    '#.#.#.#.###.#######',
    '#.#...#.#.......#.#',
    '#.#.#.#.#.#####.#.#',
    '#...#.O.#...O.#...#',
    '#####.#######.#####',
    'P.O.....O.#.#.....#',
    '#####.###.#.#######',
    '#.......#.........#',
    '###################',
  ]),

  // Maze 6: 12 corridors, 25x25, 8 sheep
  parseMaze(6, [
    '#########################',
    '#.....O.....#...........#',
    '#.#########.###.#########',
    '#.#.....O.....#.....O..P',
    '###.#####.#######.#######',
    '#.#.....#.O.......O.#...#',
    '#.#####.#.#########.#.#.#',
    '#.......#...#...#.#...#.#',
    '#.#######.#.#.#.#.#######',
    '#.#.......#.#.#...#...#.#',
    '###########.#.###.#.#.#.#',
    '#.#.......O...#.#...#.#.#',
    '#.#.########.##.#######.#',
    '#.#.#...#.......#...#...#',
    '#.#.#.#.#.#######.#.#.###',
    '#.#...#.#.........#.....#',
    '#.###.#.###############.#',
    '#...#.#...#.............#',
    '###.#.###.#.###########.#',
    '#...#...#...#.......#...#',
    '#.#####.#####.#####...#.#',
    '#O#...#.#.....#...#.O.#.#',
    '#.#.#.#.#.#####.#.#.#.#.#',
    '#...#.....#.....#...#.#.#',
    '#####################.###',
  ]),

  // Maze 7: 12 corridors, 25x25, 8 keys (from all_mazes.txt reference)
  parseMaze(7, [
    '#########################',
    '#.......#...........#.O.#',
    '#########.###############',
    '#.#.........#.#...#.#.#.#',
    '###.#.###.#.###.#.#.#####',
    '#.#.O##.#.#..#..#.#.#####',
    '#####.#.#########.#.#####',
    '#.....#.#.#...#...#.#####',
    '#######.#.#.#############',
    '#.#..O..#.#...#.....#####',
    '#####.###.#####.#.#.#####',
    '###.O.#.......#.#.#.#.#.#',
    '###.#.#.#..####.#.###.#.#',
    'P...#.#.#.#.#..O#....#.#.',
    '.######.###.#####.#######',
    '..#...#.#.O.#...#...#.#.#',
    '.#.##.###.#######.###.#####',
    '.#.#.#...#.....#.#.#.#.#.#',
    '.#.#.#.#.#.#####.#.#.#####',
    '.#.#.#.#.#.#.....#.#.#####',
    '.#.#.#.#.#.#.#####.#.#####',
    '#O#...#...#.#.....#.#####',
    '###.#######.#######.#####',
    '#...........#......##.#.#',
    '#########################',
  ]),

  // Maze 8: 12 corridors, 25x25, 8 stars (from all_mazes.txt reference)
  parseMaze(8, [
    '#########################',
    '#.......#.........O.#.#.#',
    '#########.#########.#####',
    '#.#.O.......#.#...#.#.#.#',
    '###.#.###.#.###.#.#.#####',
    '#.#.#.#.#.#..#..#.#.#####',
    '#####.#.#.#######.#.#####',
    '#.....#.#.#...#...#.#####',
    '#######.#.#.#############',
    '#.#..O..#.#...#.....#####',
    '#####.###.#####.#.#.#####',
    '###...#.......#.#.#.#.#.#',
    '#.#.#.#.#..####.#.###.#.#',
    'P...#.#.#.#.#...#..O.#.#.',
    '.######.#.#.#####.#######',
    '..#...#.#...#...#...#.#.#',
    '.#.##.###.#######.###.#####',
    '.#.#.#.O.#.....#.#.#.#.#.#',
    '.#.#.#.#.#.#####.#.#.#####',
    '.#.#.#.#.#.#.....#.#.#####',
    '.#.#.#.#.#.#.#####.#.#####',
    '.#O#...#...#.#.....#.#####',
    '.##.#######.#######.#####',
    '..#.........#..O....#.#.#',
    '#########################',
  ]),

  // Maze 9: 12 corridors, 25x25, 8 clouds (from all_mazes.txt reference)
  parseMaze(9, [
    '#########################',
    '#O......#...O.......#.#.#',
    '#.#######.#########.#####',
    '#.#..O......#.#...#.#.#.#',
    '###.#.###.#.###.#.#.#####',
    '#.#.#.#.#.#..#..#.#.#####',
    '#####.#.#.#######.#.#####',
    '#.....#.#.#...#...#.#####',
    '#######.#.#.#############',
    '#.#.....#.#...#.....#####',
    '#####.###.#####.#.#.#####',
    '###...#.......#.#.#.#.#.#',
    '###.#.#.#..####.#.###.#.#',
    'P...#.#.#.#.#.O.#..O.#.#.',
    '.#####.#.#.#####.#######',
    '..#...#.#...#...#...#.#.#',
    '.#.##.###.#######.###.#####',
    '.#.#.#...#.....#.#.#.#.#.#',
    '.#.#.#.#.#.#####.#.#.#####',
    '.#.#.#.#.#.#.....#.#.#####',
    '.#.#.#.#.#.#.#####.#.#####',
    '.#.#...#...#.#.....#.#####',
    '.##.#######.###.###.#####',
    '..#..O......#..O....#.#.#',
    '#########################',
  ]),

  // Maze 10: 12 corridors, 25x25, 8 cars
  parseMaze(10, [
    '#########################',
    '#...........#...........#',
    '#.#########.###.#########',
    '#.#..O......#.......O...#',
    '###.#####.#######.#######',
    '#.#.....#.#.#.....#.#.O.#',
    '#.#####.#.#.#####.#.#.#.#',
    '#.......#...#...#.#...#.#',
    '#.#######.#.#.#.#.#######',
    '#.#.......#.#.#...#...#.#',
    '###########.#.###.#.#.#.#',
    '#.#..O........#.#...#.#.#',
    '#.#.########.##.#######.#',
    '#.#.#...#..O....#...#...#',
    '#.#.#.#.#.#######.#.#.###',
    '#.#...#.#.........#.....#',
    '#.###.#.###############.#',
    '#.O.#.#...#.............#',
    '###.#.###.#.###########.#',
    '#...#...#...#.......#...#',
    '#.#####.#####.#####...#.#',
    '#.#...#.#.....#...#.O.#.#',
    '#.#.#.#.#.#####.#.#.#.#.#',
    'P.O.#...........#...#.#.#',
    '#####################.###',
  ]),

  // Maze 11: 12 corridors, 25x25, 9 chickens
  parseMaze(11, [
    '#############P###########',
    '#.#...#.....#.#.........#',
    '#.#.#.#.###.#.#########.#',
    '#...#O..#...O.....#...#.#',
    '#####.###.#.#.#.#.##..#.#',
    '#...#.....#.#...#.....#.#',
    '#.#.#.#####.###.#######.#',
    '#.#...#.....#...#...#...#',
    '#.#####.#####.#####.#.###',
    '#.#.......O.#.....#.#..O#',
    '#.#.###.#.#.###.#.#.###.#',
    '#.#...#.#.#.....#...#.#.#',
    '#.#####.#.##.#####.##.#.#',
    '#...#...#...#.....O...#.#',
    '###.#.#####.#.####..#.#.#',
    '#.#.#.#.....#.#...#.#.#.#',
    '#.#.#..O#####.###.#.###.#',
    '#.#.#.O...........#.#...#',
    '#.################..#.###',
    '#O....#...#...#.....#...#',
    '#####.#.#.#.#.#.#######.#',
    '#.....#.#.#.#.....#...#.#',
    '#.#####.#.#.#.###.#.#.#.#',
    '#.......#.O...#.....#...#',
    '###########.#.###########',
  ]),

  // Maze 12: 12 corridors, 25x25, 9 monkeys
  parseMaze(12, [
    '#########################',
    '#.....O.....#...........#',
    '#.########..###.######.##',
    '#.#.....O.....#.......O.P',
    '###.#####.#######.####.##',
    '#.#.....#.O.........#...#',
    '#.O####.#.#########.#.#.#',
    '#.......#...#...#.#...#.#',
    '#..######.#.#.#.#.#######',
    '#.#.......#.#.#...#...#.#',
    '###########.#.##..#.#.#.#',
    '#.#...........#.#...#.#.#',
    '#.#.########.#..#######.#',
    '#.#.#...#..O....#...#...#',
    '#.#.#.#.#.#######.#.#.###',
    '#.#...#.#.........#.....#',
    '#.###.#.###############.#',
    '#...#.#...#.............#',
    '###.#..##.#.###########.#',
    '#...#.O.#...#.......#...#',
    '#.#####.#####.#####.#.#.#',
    '#.#...#.#.....#...#.O..#.',
    '#.#.#.#.#.#####.#.#..#.#',
    '#...#..O........#...#.#.#',
    '#########.###########.###',
  ]),

  // Maze 13: 12 corridors, 25x25, 9 wands
  parseMaze(13, [
    '#########################',
    '#...............#.......#',
    '#.#########.###.#.#####O#',
    '#...O.#....O..#...#...#.#',
    '#####.#.#####.#####.#.#.#',
    '#.....#.#...#.#.....#.#.#',
    '#.#####.#.###.#.#######.#',
    '#.......#.#...#...#...#.#',
    '#.#######.#.#.###.#.#.#.#',
    '#...#..O..#.#.....#.#.#.#',
    '#.#.#####.#.#######.#.#.#',
    '#.#.#.....#...#.....#.#.#',
    '###.#.#####...#.#####.###',
    'P.O...#.#...#.#.....#.O.#',
    '###.###.#.#####.###.#.###',
    '#.#.....#.#...#.O.#.#...#',
    '#.###.##..#.#.##..#.###.#',
    '#...#.#.O.#.#...#.#...#.#',
    '#.#.#.#.#.#.#####.#.###.#',
    '#.#...#.#...#.....#...#.#',
    '#.#####.#####.##.####.#.#',
    '#...O.#.......#...#...#.#',
    '#####.#########.#.#.###.#',
    '#...............#.#.....#',
    '#########################',
  ]),

  // Maze 14: 12 corridors, 25x25, 9 trees
  parseMaze(14, [
    '#########################',
    '#.O.....#..O..#.......#.#',
    'P.#..#.#.###.#.######.##',
    '#.....#.....#...#...#.###',
    '###.#############.#######',
    '#..O........#.......#.###',
    '#.#####.###.#.#####.#####',
    '#.....#.#...#.#.O.#.#.###',
    '#####.#.#.###.#.#.#.#####',
    '#.....#.#...#...#.#.#.###',
    '#.#####.###.###.#.#.#####',
    '#.#.......#...#.#.#.#.#.#',
    '#.#.###.####.##.#.#.###.#',
    '#.#.#.#.#..O....#.#.#.#.#',
    '#.#.#.#.#.#######.#.#####',
    '#.#.#...#...#.....#.#.###',
    '###.#.#####.#.#####.#####',
    '#...#.#...#.#...#...#.###',
    '#.###.#.#.#.###.#.#######',
    '#.#..O..#.#...#.#..O.##.#',
    '#.#######.###.###########',
    '#O......#...#.#...#.#..#.',
    '#.#####.#####.#.#.#.#####',
    '#..O..#.........#.....#.#',
    '#########################',
  ]),

  // Maze 15: 12 corridors, 25x25, 9 moons
  parseMaze(15, [
    '#########################',
    '#.......#...#.#...#...#.#',
    '#####.#.#.#O..#.#.#.#.#.#',
    'P..O..#...#...#.#...#...#',
    '###.###########.#########',
    '#.......#..O..#.......#.#',
    '#.#.###.#####.#.###.#.#.#',
    '#.#...#.#.....#.#.#.#...#',
    '###.###.#.#####.#.#.###.#',
    '#...#..O#.....#.#..O..#.#',
    '#.###.#######.#.###.#.#.#',
    '#...#.#.#.....#.#...#.#.#',
    '###.#.#.#.##.##.#####.###',
    '#...#.#.........#...#....',
    '#.###.#.#.#######.#.#####',
    '#.#.O.#.#.#.......#.....#',
    '#.#.#.###.#.#############',
    '#.#.#...#.O...#...#.....#',
    '###.###.###.#.#.#.#.###.#',
    '#.#.#.....#.#...#O..#...#',
    '#O#.#######.#########.###',
    '............#...#...#...#',
    '#.#.#########.#.#...###.#',
    '#.#...........#...#.#...#',
    '#########################',
  ]),
];

// Get maze config by level (1-15)
export function getMazeConfig(level: number): MazeConfig {
  const idx = Math.max(0, Math.min(14, level - 1));
  return MAZE_CONFIGS[idx];
}
