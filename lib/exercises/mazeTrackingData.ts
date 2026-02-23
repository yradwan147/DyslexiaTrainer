// Maze Tracking Exercise Data
// 15 randomly generated mazes with wall grids, player position, and object positions
// Uses PNG sprites from /assets/maze/

import { createSeededRandom } from './prng';

export interface MazeConfig {
  maze_id: number;
  grid_size: number;       // 19 or 25
  corridors: number;       // 9 or 12
  grid: string[];
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

// Object and reachable counts per maze: [total, correct]
const MAZE_OBJECT_RULES: Record<number, [number, number]> = {
  1: [12, 7], 2: [12, 7], 3: [12, 7], 4: [12, 7], 5: [12, 7],   // smaller mazes (19x19)
  6: [14, 8], 7: [14, 8], 8: [14, 8], 9: [14, 8], 10: [14, 8],  // larger mazes (25x25)
  11: [14, 8], 12: [14, 8], 13: [14, 8], 14: [14, 8], 15: [14, 8],
};

// BFS to get shortest path as ordered list from start to exit.
function getPathOrdered(
  grid: string[][],
  startRow: number,
  startCol: number,
  exitRow: number,
  exitCol: number
): [number, number][] {
  const pathSet = bfsShortestPath(grid, startRow, startCol, [[exitRow, exitCol]]);
  if (pathSet.size === 0) return [];

  // Reconstruct path order by BFS from start
  const key = (r: number, c: number) => `${r},${c}`;
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]] as const;
  const parent = new Map<string, string>();
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];
  visited.add(key(startRow, startCol));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === exitRow && c === exitCol) break;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const nextKey = key(nr, nc);
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        grid[nr][nc] !== '#' && !visited.has(nextKey) && pathSet.has(nextKey)
      ) {
        visited.add(nextKey);
        parent.set(nextKey, key(r, c));
        queue.push([nr, nc]);
      }
    }
  }

  const result: [number, number][] = [];
  let current = key(exitRow, exitCol);
  while (current) {
    const [r, c] = current.split(',').map(Number);
    result.unshift([r, c]);
    current = parent.get(current)!;
  }
  return result;
}

// Pick n indices spread evenly across length, with slight random jitter.
function pickSpreadIndices(length: number, n: number, rng: ReturnType<typeof createSeededRandom>): number[] {
  if (n >= length) return Array.from({ length }, (_, i) => i);
  if (n <= 0) return [];
  const step = (length - 1) / (n + 1);
  const indices: number[] = [];
  for (let i = 0; i < n; i++) {
    const ideal = Math.round(step * (i + 1));
    const jitter = rng.nextInt(-1, 1);
    const idx = Math.max(0, Math.min(length - 1, ideal + jitter));
    indices.push(idx);
  }
  return Array.from(new Set(indices)).sort((a, b) => a - b).slice(0, n);
}

// BFS to find the shortest path from start to target cells.
function bfsShortestPath(
  grid: string[][],
  startRow: number,
  startCol: number,
  targetCells: [number, number][]
): Set<string> {
  const key = (r: number, c: number) => `${r},${c}`;
  const targetSet = new Set(targetCells.map(([r, c]) => key(r, c)));
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]] as const;

  const parent = new Map<string, string>();
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];
  visited.add(key(startRow, startCol));

  let reached: string | null = null;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cellKey = key(r, c);

    if (targetSet.has(cellKey)) {
      reached = cellKey;
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

  if (!reached) return new Set();

  const pathCells = new Set<string>();
  let current: string | undefined = reached;
  while (current) {
    pathCells.add(current);
    current = parent.get(current);
  }
  pathCells.add(key(startRow, startCol));
  return pathCells;
}

// Get all reachable cells from start (BFS flood fill)
function bfsReachable(grid: string[][], startRow: number, startCol: number): Set<string> {
  const key = (r: number, c: number) => `${r},${c}`;
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]] as const;
  const visited = new Set<string>();
  const queue: [number, number][] = [[startRow, startCol]];
  visited.add(key(startRow, startCol));

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      const nextKey = key(nr, nc);
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        grid[nr][nc] !== '#' && !visited.has(nextKey)
      ) {
        visited.add(nextKey);
        queue.push([nr, nc]);
      }
    }
  }
  return visited;
}

// Ensure border opening from interior cell to edge
function ensureBorderOpening(grid: string[][], row: number, col: number, gs: number, w: number): void {
  const distTop = row;
  const distBottom = gs - 1 - row;
  const distLeft = col;
  const distRight = w - 1 - col;
  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  if (minDist === distTop) {
    for (let r = row - 1; r >= 0; r--) if (grid[r][col] === '#') grid[r][col] = '.';
  } else if (minDist === distBottom) {
    for (let r = row + 1; r < gs; r++) if (grid[r][col] === '#') grid[r][col] = '.';
  } else if (minDist === distLeft) {
    for (let c = col - 1; c >= 0; c--) if (grid[row][c] === '#') grid[row][c] = '.';
  } else {
    for (let c = col + 1; c < w; c++) if (grid[row][c] === '#') grid[row][c] = '.';
  }
}

/**
 * Randomized Prim's algorithm - classic maze generator.
 * Produces mazes with many short dead ends and branches (more "maze-like" than recursive backtracking).
 * See: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_Prim's_algorithm
 */
function generateMazeGrid(corridors: number, seed: number): string[][] {
  const size = 2 * corridors + 1;
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill('#'));

  const rng = createSeededRandom(seed);

  // Cells at odd indices (1,3,5,...); walls between them at even indices
  const inMaze = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  // Frontier: walls that border the maze. Each is [wallRow, wallCol, newCellRow, newCellCol]
  const frontier: [number, number, number, number][] = [];

  // Start from random interior cell (odd indices only)
  const startR = 1 + 2 * rng.nextInt(0, corridors - 1);
  const startC = 1 + 2 * rng.nextInt(0, corridors - 1);
  grid[startR][startC] = '.';
  inMaze.add(key(startR, startC));

  const addWalls = (r: number, c: number) => {
    // Walls to N, S, E, W - wall is between (r,c) and neighbor cell
    const dirs: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 1 && nr <= size - 2 && nc >= 1 && nc <= size - 2) {
        const wallR = r + dr / 2;
        const wallC = c + dc / 2;
        frontier.push([wallR, wallC, nr, nc]);
      }
    }
  };
  addWalls(startR, startC);

  while (frontier.length > 0) {
    const idx = rng.nextInt(0, frontier.length - 1);
    const [wallR, wallC, cellR, cellC] = frontier[idx];
    frontier[idx] = frontier[frontier.length - 1];
    frontier.pop();

    if (inMaze.has(key(cellR, cellC))) continue; // Already in maze

    grid[wallR][wallC] = '.';
    grid[cellR][cellC] = '.';
    inMaze.add(key(cellR, cellC));
    addWalls(cellR, cellC);
  }

  return grid;
}

// Generate full maze config for a given level
function generateMazeConfig(id: number): MazeConfig {
  const [totalObjects, correctCount] = MAZE_OBJECT_RULES[id] ?? [5, 4];

  // Size: mazes 1-5 use 19x19 (9 corridors), mazes 6-15 use 25x25 (12 corridors)
  const corridors = id <= 5 ? 9 : 12;
  const size = 2 * corridors + 1;

  const seed = 42 + id * 1000; // Deterministic per maze
  const rng = createSeededRandom(seed);

  const grid = generateMazeGrid(corridors, seed);

  // Passage cells in Prim's maze are only at odd indices (1, 3, 5, ...)
  const cellIndices = Array.from({ length: corridors }, (_, i) => 1 + 2 * i);

  // Pick entrance and exit on different sides - must use passage cells (odd indices)
  const topInterior = (): [number, number] => [1, rng.pick(cellIndices)];
  const bottomInterior = (): [number, number] => [size - 2, rng.pick(cellIndices)];
  const leftInterior = (): [number, number] => [rng.pick(cellIndices), 1];
  const rightInterior = (): [number, number] => [rng.pick(cellIndices), size - 2];

  const sides: Array<{ interior: () => [number, number]; playerCell: (ir: number, ic: number) => [number, number] }> = [
    { interior: topInterior, playerCell: (_, ic) => [0, ic] },
    { interior: bottomInterior, playerCell: (_, ic) => [size - 1, ic] },
    { interior: leftInterior, playerCell: (ir) => [ir, 0] },
    { interior: rightInterior, playerCell: (ir, ic) => [ir, size - 1] },
  ];
  rng.shuffle(sides);
  const entranceSide = sides[0];
  const exitSide = sides[1];

  const [entranceIR, entranceIC] = entranceSide.interior();
  const [exitIR, exitIC] = exitSide.interior();

  ensureBorderOpening(grid, entranceIR, entranceIC, size, size);
  ensureBorderOpening(grid, exitIR, exitIC, size, size);

  let [entranceRow, entranceCol] = entranceSide.playerCell(entranceIR, entranceIC);
  let [exitRow, exitCol] = exitSide.playerCell(exitIR, exitIC);

  const openEntranceExit = () => {
    grid[entranceRow][entranceCol] = '.';
    if (entranceRow === 0 && grid[1][entranceCol] === '#') grid[1][entranceCol] = '.';
    if (entranceRow === size - 1 && grid[size - 2][entranceCol] === '#') grid[size - 2][entranceCol] = '.';
    if (entranceCol === 0 && grid[entranceRow][1] === '#') grid[entranceRow][1] = '.';
    if (entranceCol === size - 1 && grid[entranceRow][size - 2] === '#') grid[entranceRow][size - 2] = '.';
    if (exitRow === 0 && grid[1][exitCol] === '#') grid[1][exitCol] = '.';
    if (exitRow === size - 1 && grid[size - 2][exitCol] === '#') grid[size - 2][exitCol] = '.';
    if (exitCol === 0 && grid[exitRow][1] === '#') grid[exitRow][1] = '.';
    if (exitCol === size - 1 && grid[exitRow][size - 2] === '#') grid[exitRow][size - 2] = '.';
  };
  openEntranceExit();

  let pathOrdered = getPathOrdered(grid, entranceRow, entranceCol, exitRow, exitCol);
  for (let retry = 0; pathOrdered.length === 0 && retry < 15; retry++) {
    const [eir, eic] = entranceSide.interior();
    const [xir, xic] = exitSide.interior();
    ensureBorderOpening(grid, eir, eic, size, size);
    ensureBorderOpening(grid, xir, xic, size, size);
    entranceRow = entranceSide.playerCell(eir, eic)[0];
    entranceCol = entranceSide.playerCell(eir, eic)[1];
    exitRow = exitSide.playerCell(xir, xic)[0];
    exitCol = exitSide.playerCell(xir, xic)[1];
    openEntranceExit();
    pathOrdered = getPathOrdered(grid, entranceRow, entranceCol, exitRow, exitCol);
  }

  const pathSet = new Set(pathOrdered.map(([r, c]) => `${r},${c}`));

  // Path cells for correct objects - exclude entrance/exit, get evenly spread along path
  const pathForObjects = pathOrdered.filter(
    ([r, c]) => !(r === entranceRow && c === entranceCol) && !(r === exitRow && c === exitCol)
  );

  // Get all reachable cells
  const reachable = bfsReachable(grid, entranceRow, entranceCol);
  const offPathCellsList = Array.from(reachable)
    .filter(k => !pathSet.has(k))
    .map(k => {
      const [r, c] = k.split(',').map(Number);
      return [r, c] as [number, number];
    });

  const used = new Set<string>();
  // Larger min distance to prevent clumping; bigger mazes get more spacing
  const minDist = size <= 19 ? 7 : 9;

  const satisfiesMinDist = (r: number, c: number) => {
    for (const k of Array.from(used)) {
      const [or, oc] = k.split(',').map(Number);
      if (Math.abs(r - or) + Math.abs(c - oc) < minDist) return false;
    }
    return true;
  };

  const objects: { row: number; col: number; order: number; reachable: boolean }[] = [];

  // Place correct objects: evenly distributed along the path (not clustered at start/end)
  if (pathForObjects.length > 0 && correctCount > 0) {
    const indices = pickSpreadIndices(pathForObjects.length, correctCount, rng);
    for (const i of indices) {
      const [r, c] = pathForObjects[i];
      const key = `${r},${c}`;
      if (!used.has(key) && satisfiesMinDist(r, c)) {
        used.add(key);
        objects.push({ row: r, col: c, order: objects.length + 1, reachable: true });
      }
    }
  }

  // Fill remaining correct objects from path if needed
  if (objects.filter(o => o.reachable).length < correctCount) {
    for (let i = 0; objects.filter(o => o.reachable).length < correctCount && i < pathForObjects.length; i++) {
      const [r, c] = pathForObjects[i];
      const key = `${r},${c}`;
      if (!used.has(key) && satisfiesMinDist(r, c)) {
        used.add(key);
        objects.push({ row: r, col: c, order: objects.length + 1, reachable: true });
      }
    }
  }

  // Place incorrect objects: round-robin across spatial regions so each area gets objects before any gets a second
  const incorrectCount = totalObjects - correctCount;
  if (offPathCellsList.length > 0 && incorrectCount > 0) {
    const keyStr = (r: number, c: number) => `${r},${c}`;
    const gridDivs = Math.max(4, Math.ceil(Math.sqrt(incorrectCount * 2))); // More regions for uniform spread
    const byRegion = new Map<string, [number, number][]>();
    for (const [r, c] of offPathCellsList) {
      const gr = Math.min(gridDivs - 1, Math.floor((r / size) * gridDivs));
      const gc = Math.min(gridDivs - 1, Math.floor((c / size) * gridDivs));
      const region = `${gr},${gc}`;
      if (!byRegion.has(region)) byRegion.set(region, []);
      byRegion.get(region)!.push([r, c]);
    }
    const regionEntries = Array.from(byRegion.entries()).filter(([, cells]) => cells.length > 0);
    rng.shuffle(regionEntries);
    // Round-robin: each round place at most one per region, cycling through all regions before any get a second
    while (objects.filter(o => !o.reachable).length < incorrectCount) {
      let placedAny = false;
      for (const [, cells] of regionEntries) {
        if (objects.filter(o => !o.reachable).length >= incorrectCount) break;
        rng.shuffle(cells);
        for (const [r, c] of cells) {
          const key = keyStr(r, c);
          if (!used.has(key) && satisfiesMinDist(r, c)) {
            used.add(key);
            objects.push({ row: r, col: c, order: objects.length + 1, reachable: false });
            placedAny = true;
            break; // one per region per round
          }
        }
      }
      if (!placedAny) break;
    }
  }

  // Fallback: place any remaining objects
  while (objects.length < totalObjects) {
    const allReachable = Array.from(reachable).filter(k => !used.has(k));
    if (allReachable.length === 0) break;
    const k = rng.pick(allReachable);
    const [r, c] = k.split(',').map(Number);
    if (satisfiesMinDist(r, c)) {
      used.add(k);
      objects.push({
        row: r,
        col: c,
        order: objects.length + 1,
        reachable: pathSet.has(k),
      });
    } else {
      used.add(k); // Accept to avoid infinite loop
      objects.push({ row: r, col: c, order: objects.length + 1, reachable: pathSet.has(k) });
    }
  }

  rng.shuffle(objects);
  objects.forEach((o, i) => o.order = i + 1);

  const cleanGrid = grid.map(row => row.join(''));

  return {
    maze_id: id,
    grid_size: size,
    corridors,
    grid: cleanGrid,
    player: { row: entranceRow, col: entranceCol },
    objects,
    object_count: objects.length,
    reachable_count: objects.filter(o => o.reachable).length,
  };
}

// Generate all 15 mazes (cached at module load)
const MAZE_CONFIGS: MazeConfig[] = Array.from({ length: 15 }, (_, i) => generateMazeConfig(i + 1));

// Get maze config by level (1-15)
export function getMazeConfig(level: number): MazeConfig {
  const idx = Math.max(0, Math.min(14, level - 1));
  return MAZE_CONFIGS[idx];
}
