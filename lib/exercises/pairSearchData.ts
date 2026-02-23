// Pair Search Exercise Data
// 15 groups, each with 4 single object images
// Each session: 4 rounds using the 4 singles from that group
// Round: show one single as target, all 4 as options, child clicks matching one

export interface PairSearchGroup {
  groupId: number;
  singles: string[];  // 4 single image filenames, e.g. ['1_1.png', '1_2.png', '1_3.png', '1_4.png']
}

// Generate groups 1-15, each with 4 singles
export const PAIR_SEARCH_GROUPS: PairSearchGroup[] = Array.from({ length: 15 }, (_, i) => ({
  groupId: i + 1,
  singles: [
    `${i + 1}_1.png`,
    `${i + 1}_2.png`,
    `${i + 1}_3.png`,
    `${i + 1}_4.png`,
  ],
}));

export function getPairSearchGroup(level: number): PairSearchGroup {
  const idx = Math.max(0, Math.min(level - 1, PAIR_SEARCH_GROUPS.length - 1));
  return PAIR_SEARCH_GROUPS[idx];
}

export function getSingleImagePath(filename: string): string {
  return `/assets/pair-search/singles/${filename}`;
}

// Shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
