// Pair Search (Visual Discrimination) Exercise Data
// 15 puzzles using actual PNG images from /assets/pair-search/
// Each puzzle: 1 target at top, 4 options below. Child picks the matching one.

export interface PairSearchConfig {
  id: number;
  imageFile: string;       // e.g. '1.png'
  correctAnswer: number;   // 0-3 index (0=leftmost option)
}

// Correct answers traced from the 15 reference images (0-indexed)
export const PAIR_SEARCH_CONFIGS: PairSearchConfig[] = [
  { id: 1,  imageFile: '1.png',  correctAnswer: 2 },
  { id: 2,  imageFile: '2.png',  correctAnswer: 3 },
  { id: 3,  imageFile: '3.png',  correctAnswer: 2 },
  { id: 4,  imageFile: '4.png',  correctAnswer: 0 },
  { id: 5,  imageFile: '5.png',  correctAnswer: 3 },
  { id: 6,  imageFile: '6.png',  correctAnswer: 3 },
  { id: 7,  imageFile: '7.png',  correctAnswer: 1 },
  { id: 8,  imageFile: '8.png',  correctAnswer: 2 },
  { id: 9,  imageFile: '9.png',  correctAnswer: 2 },
  { id: 10, imageFile: '10.png', correctAnswer: 2 },
  { id: 11, imageFile: '11.png', correctAnswer: 2 },
  { id: 12, imageFile: '12.png', correctAnswer: 3 },
  { id: 13, imageFile: '13.png', correctAnswer: 0 },
  { id: 14, imageFile: '14.png', correctAnswer: 0 },
  { id: 15, imageFile: '15.png', correctAnswer: 0 },
];

export function getPairSearchConfigForLevel(level: number): PairSearchConfig {
  const idx = Math.max(0, Math.min(level - 1, PAIR_SEARCH_CONFIGS.length - 1));
  return PAIR_SEARCH_CONFIGS[idx];
}

export function getPairSearchImagePath(imageFile: string): string {
  return `/assets/pair-search/${imageFile}`;
}
