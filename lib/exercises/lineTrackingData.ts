// Line Tracking Exercise Data
// 16 puzzles using actual PNG screenshot images from /assets/line-tracking/
// Each puzzle has an image with items on left, answers on right, and lines connecting them.
// The child sees an eye on the left item and must click the correct right answer.

export interface LineTrackingConfig {
  id: number;
  imageFile: string;         // e.g. '1.png'
  itemCount: number;         // 3, 4, or 5
  connections: number[];     // left[i] connects to right[connections[i]]
  // Normalized Y positions (0-1) for left and right items in the image
  leftYPositions: number[];
  rightYPositions: number[];
}

// Standard Y positions by item count (derived from reference images)
// These approximate where the letters/numbers/images appear vertically
const Y3 = [0.22, 0.52, 0.82];           // 3 items: A, B, C
const Y4 = [0.14, 0.38, 0.62, 0.86];     // 4 items
const Y5 = [0.10, 0.30, 0.50, 0.70, 0.90]; // 5 items

// All 16 puzzles in training session order
export const LINE_TRACKING_CONFIGS: LineTrackingConfig[] = [
  // --- 3-item letter puzzles (ABC -> 123) ---
  // Image 1: ABC gold serif, pink/red curved lines
  { id: 1, imageFile: '1.png', itemCount: 3, connections: [1, 0, 2], leftYPositions: Y3, rightYPositions: Y3 },
  // Image 2: ABC red cursive, red curved lines
  { id: 2, imageFile: '2.png', itemCount: 3, connections: [2, 0, 1], leftYPositions: Y3, rightYPositions: Y3 },
  // Image 3: ABC dark blue sans, blue angular lines
  { id: 3, imageFile: '3.png', itemCount: 3, connections: [1, 0, 2], leftYPositions: Y3, rightYPositions: Y3 },
  // Image 4: ABC purple cursive, blue angular lines
  { id: 4, imageFile: '4.png', itemCount: 3, connections: [1, 0, 2], leftYPositions: Y3, rightYPositions: Y3 },

  // --- 4-item image puzzles ---
  // Image 5: Cows -> Milk, gray curved lines
  { id: 5, imageFile: '5.png', itemCount: 4, connections: [1, 0, 2, 3], leftYPositions: Y4, rightYPositions: Y4 },
  // Image 6: Lions -> Zebras, gray curved lines
  { id: 6, imageFile: '6.png', itemCount: 4, connections: [0, 3, 2, 1], leftYPositions: [0.12, 0.35, 0.58, 0.82], rightYPositions: [0.10, 0.33, 0.57, 0.82] },
  // Image 7: Bunnies -> Baskets, green dashed curved lines
  { id: 7, imageFile: '7.png', itemCount: 4, connections: [2, 1, 0, 3], leftYPositions: [0.10, 0.33, 0.57, 0.82], rightYPositions: [0.10, 0.33, 0.57, 0.82] },
  // Image 8: Hens -> Chicks, 5 items, black curved lines
  { id: 8, imageFile: '8.png', itemCount: 4, connections: [1, 0, 2, 3], leftYPositions: Y4, rightYPositions: Y4 },

  // --- 4-item letter puzzles (ABCD -> 1234) ---
  // Image 9: ABCD green cursive, green curved lines
  { id: 9, imageFile: '9.png', itemCount: 4, connections: [1, 2, 0, 3], leftYPositions: Y4, rightYPositions: Y4 },
  // Image 10: ABCD blue sans, blue curved lines
  { id: 10, imageFile: '10.png', itemCount: 4, connections: [2, 0, 1, 3], leftYPositions: Y4, rightYPositions: Y4 },
  // Image 11: abcd orange cursive, blue angular lines
  { id: 11, imageFile: '11.png', itemCount: 4, connections: [1, 2, 0, 3], leftYPositions: Y4, rightYPositions: Y4 },
  // Image 12: ABCD blue gothic, blue angular lines
  { id: 12, imageFile: '12.png', itemCount: 4, connections: [3, 2, 1, 0], leftYPositions: Y4, rightYPositions: Y4 },

  // --- 5-item letter puzzles (ABCDE -> 12345) ---
  // Image 13: ABCDE blue sans, blue curved lines
  { id: 13, imageFile: '13.png', itemCount: 5, connections: [3, 0, 1, 4, 2], leftYPositions: Y5, rightYPositions: Y5 },
  // Image 14: ABCDE pink italic, purple curved lines
  { id: 14, imageFile: '14.png', itemCount: 5, connections: [2, 0, 1, 3, 4], leftYPositions: Y5, rightYPositions: Y5 },
  // Image 15: ABCDE green gothic, blue angular lines
  { id: 15, imageFile: '15.png', itemCount: 5, connections: [0, 2, 1, 3, 4], leftYPositions: Y5, rightYPositions: Y5 },
  // Image 16: ABCDE orange handwritten, red angular lines
  { id: 16, imageFile: '16.png', itemCount: 5, connections: [1, 3, 2, 4, 0], leftYPositions: Y5, rightYPositions: Y5 },
];

// Get config by training level (1-15, level 16 wraps)
export function getLineTrackingConfigForLevel(level: number): LineTrackingConfig {
  const idx = Math.max(0, Math.min(level - 1, LINE_TRACKING_CONFIGS.length - 1));
  return LINE_TRACKING_CONFIGS[idx];
}

// Image path helper
export function getLineTrackingImagePath(imageFile: string): string {
  return `/assets/line-tracking/${imageFile}`;
}
