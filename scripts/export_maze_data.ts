#!/usr/bin/env npx tsx
/**
 * Export processed maze data (with exits) to JSON for maze_marker.py.
 * Run from DyslexiaTrainer/: npx tsx scripts/export_maze_data.ts
 */

import { getMazeConfig } from '../lib/exercises/mazeTrackingData';
import * as fs from 'fs';
import * as path from 'path';

const output: Array<{
  maze_id: number;
  grid: string[];
  player: { row: number; col: number };
  objects: Array<{ row: number; col: number; order: number }>;
}> = [];

for (let level = 1; level <= 15; level++) {
  const config = getMazeConfig(level);
  output.push({
    maze_id: config.maze_id,
    grid: config.grid,
    player: config.player,
    objects: config.objects.map((o) => ({ row: o.row, col: o.col, order: o.order })),
  });
}

const outPath = path.join(__dirname, '..', '..', 'scripts', 'maze_data.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Exported ${output.length} mazes to ${outPath}`);
