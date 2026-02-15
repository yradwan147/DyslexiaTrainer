// Visual Memory Exercise Data
// 75 predefined sequences organized into 15 training sessions (5 sequences each)
// Uses actual PNG images from /assets/visual-memory/
// Structure: 3-picture sessions 1-3, 4-picture sessions 4-6, 5-picture sessions 7-9,
//            6-picture sessions 10-12, 7-picture sessions 13-15

export interface MemorySequence {
  id: number;
  itemCount: number;
  sequence: string[]; // PNG filenames without extension
}

export interface MemorySession {
  sessionNumber: number; // 1-15
  itemCount: number; // 3, 4, 5, 6, or 7
  level: number; // 1, 2, or 3 within each item-count group
  sequences: MemorySequence[];
}

// Helper: strip .png and replace orange_balloon with yellow_balloon
function img(name: string): string {
  const base = name.replace(/\.png$/, '');
  return base === 'orange_balloon' ? 'yellow_balloon' : base;
}

// All 75 sequences from config_images.txt, organized into 15 sessions of 5
export const MEMORY_SESSIONS: MemorySession[] = [
  // --- 3 pictures ---
  // Session 1: Level 1 (exercises 1-5)
  {
    sessionNumber: 1, itemCount: 3, level: 1,
    sequences: [
      { id: 1, itemCount: 3, sequence: [img('gray_cat'), img('red_apple'), img('blue_car')] },
      { id: 2, itemCount: 3, sequence: [img('blue_fish'), img('tree'), img('crab')] },
      { id: 3, itemCount: 3, sequence: [img('sun_sunglasses'), img('pear'), img('dog')] },
      { id: 4, itemCount: 3, sequence: [img('snail'), img('green_balloon'), img('chair')] },
      { id: 5, itemCount: 3, sequence: [img('house'), img('basketball'), img('gray_moon')] },
    ],
  },
  // Session 2: Level 2 (exercises 6-10)
  {
    sessionNumber: 2, itemCount: 3, level: 2,
    sequences: [
      { id: 6, itemCount: 3, sequence: [img('snail'), img('lion'), img('pencil')] },
      { id: 7, itemCount: 3, sequence: [img('pear'), img('chair'), img('tree')] },
      { id: 8, itemCount: 3, sequence: [img('sun_sunglasses'), img('yellow_balloon'), img('ring')] },
      { id: 9, itemCount: 3, sequence: [img('crab'), img('red_apple'), img('red_bicycle')] },
      { id: 10, itemCount: 3, sequence: [img('blue_fish'), img('blue_car'), img('blue_cat')] },
    ],
  },
  // Session 3: Level 3 (exercises 11-15)
  {
    sessionNumber: 3, itemCount: 3, level: 3,
    sequences: [
      { id: 11, itemCount: 3, sequence: [img('orange_cat'), img('lion'), img('giraffe')] },
      { id: 12, itemCount: 3, sequence: [img('turtle'), img('frog'), img('lizard')] },
      { id: 13, itemCount: 3, sequence: [img('basketball'), img('orange_balloon'), img('racket')] },
      { id: 14, itemCount: 3, sequence: [img('blue_bicycle'), img('blue_car'), img('blue_scooter')] },
      { id: 15, itemCount: 3, sequence: [img('cactus'), img('tree'), img('leaf')] },
    ],
  },

  // --- 4 pictures ---
  // Session 4: Level 1 (exercises 16-20)
  {
    sessionNumber: 4, itemCount: 4, level: 1,
    sequences: [
      { id: 16, itemCount: 4, sequence: [img('pencil'), img('blue_car'), img('ring'), img('tree')] },
      { id: 17, itemCount: 4, sequence: [img('gray_cat'), img('house'), img('sun_sunglasses'), img('blue_fish')] },
      { id: 18, itemCount: 4, sequence: [img('blue_car'), img('crab'), img('green_balloon'), img('dog')] },
      { id: 19, itemCount: 4, sequence: [img('snail'), img('red_apple'), img('chair'), img('green_balloon')] },
      { id: 20, itemCount: 4, sequence: [img('gray_moon'), img('house'), img('dog'), img('blue_fish')] },
    ],
  },
  // Session 5: Level 2 (exercises 21-25)
  {
    sessionNumber: 5, itemCount: 4, level: 2,
    sequences: [
      { id: 21, itemCount: 4, sequence: [img('snail'), img('lion'), img('pencil'), img('giraffe')] },
      { id: 22, itemCount: 4, sequence: [img('pear'), img('chair'), img('tree'), img('green_apple')] },
      { id: 23, itemCount: 4, sequence: [img('sun_sunglasses'), img('yellow_balloon'), img('ring'), img('basketball')] },
      { id: 24, itemCount: 4, sequence: [img('gray_moon'), img('blue_car'), img('gray_cat'), img('blue_fish')] },
      { id: 25, itemCount: 4, sequence: [img('red_apple'), img('crab'), img('basketball'), img('pink_balloon')] },
    ],
  },
  // Session 6: Level 3 (exercises 26-30)
  {
    sessionNumber: 6, itemCount: 4, level: 3,
    sequences: [
      { id: 26, itemCount: 4, sequence: [img('orange_cat'), img('tiger'), img('lion'), img('giraffe')] },
      { id: 27, itemCount: 4, sequence: [img('worm'), img('frog'), img('turtle'), img('lizard')] },
      { id: 28, itemCount: 4, sequence: [img('basketball'), img('orange_balloon'), img('racket'), img('frisbee')] },
      { id: 29, itemCount: 4, sequence: [img('blue_bicycle'), img('plane'), img('boat'), img('blue_car')] },
      { id: 30, itemCount: 4, sequence: [img('cactus'), img('leaf'), img('orange_flower'), img('tree')] },
    ],
  },

  // --- 5 pictures ---
  // Session 7: Level 1 (exercises 31-35)
  {
    sessionNumber: 7, itemCount: 5, level: 1,
    sequences: [
      { id: 31, itemCount: 5, sequence: [img('gray_cat'), img('blue_car'), img('house'), img('blue_fish'), img('snail')] },
      { id: 32, itemCount: 5, sequence: [img('orange'), img('tree'), img('crab'), img('gray_moon'), img('pear')] },
      { id: 33, itemCount: 5, sequence: [img('blue_fish'), img('sun_sunglasses'), img('lion'), img('red_apple'), img('ring')] },
      { id: 34, itemCount: 5, sequence: [img('pear'), img('basketball'), img('blue_bicycle'), img('chair'), img('giraffe')] },
      { id: 35, itemCount: 5, sequence: [img('umbrella'), img('green_balloon'), img('blue_car'), img('tree'), img('gray_cat')] },
    ],
  },
  // Session 8: Level 2 (exercises 36-40)
  {
    sessionNumber: 8, itemCount: 5, level: 2,
    sequences: [
      { id: 36, itemCount: 5, sequence: [img('snail'), img('yellow_balloon'), img('lion'), img('basketball'), img('giraffe')] },
      { id: 37, itemCount: 5, sequence: [img('pear'), img('tree'), img('green_apple'), img('umbrella'), img('house')] },
      { id: 38, itemCount: 5, sequence: [img('sun_sunglasses'), img('basketball'), img('red_apple'), img('ring'), img('crab')] },
      { id: 39, itemCount: 5, sequence: [img('orange_moon'), img('chair'), img('orange_cat'), img('yellow_balloon'), img('lion')] },
      { id: 40, itemCount: 5, sequence: [img('blue_car'), img('house'), img('blue_bicycle'), img('blue_pencil'), img('blue_fish')] },
    ],
  },
  // Session 9: Level 3 (exercises 41-45)
  {
    sessionNumber: 9, itemCount: 5, level: 3,
    sequences: [
      { id: 41, itemCount: 5, sequence: [img('tiger'), img('orange_cat'), img('lion'), img('giraffe'), img('dog')] },
      { id: 42, itemCount: 5, sequence: [img('frog'), img('lizard'), img('turtle'), img('worm'), img('pufferfish')] },
      { id: 43, itemCount: 5, sequence: [img('basketball'), img('racket'), img('candy'), img('orange_balloon'), img('frisbee')] },
      { id: 44, itemCount: 5, sequence: [img('blue_scooter'), img('blue_bicycle'), img('boat'), img('plane'), img('blue_car')] },
      { id: 45, itemCount: 5, sequence: [img('green_apple'), img('orange_flower'), img('cactus'), img('leaf'), img('tree')] },
    ],
  },

  // --- 6 pictures ---
  // Session 10: Level 1 (exercises 46-50)
  {
    sessionNumber: 10, itemCount: 6, level: 1,
    sequences: [
      { id: 46, itemCount: 6, sequence: [img('house'), img('blue_fish'), img('snail'), img('blue_car'), img('sun_sunglasses'), img('gray_moon')] },
      { id: 47, itemCount: 6, sequence: [img('chair'), img('green_balloon'), img('red_apple'), img('crab'), img('tree'), img('basketball')] },
      { id: 48, itemCount: 6, sequence: [img('ring'), img('house'), img('umbrella'), img('pear'), img('blue_car'), img('dog')] },
      { id: 49, itemCount: 6, sequence: [img('basketball'), img('chair'), img('gray_moon'), img('tree'), img('blue_fish'), img('red_bicycle')] },
      { id: 50, itemCount: 6, sequence: [img('gray_cat'), img('pear'), img('snail'), img('blue_car'), img('sun_sunglasses'), img('house')] },
    ],
  },
  // Session 11: Level 2 (exercises 51-55)
  {
    sessionNumber: 11, itemCount: 6, level: 2,
    sequences: [
      { id: 51, itemCount: 6, sequence: [img('sun_sunglasses'), img('lion'), img('snail'), img('yellow_balloon'), img('basketball'), img('orange_cat')] },
      { id: 52, itemCount: 6, sequence: [img('pear'), img('turtle'), img('tennis_ball'), img('tree'), img('green_apple'), img('leaf')] },
      { id: 53, itemCount: 6, sequence: [img('giraffe'), img('chair'), img('house'), img('orange_cat'), img('orange_flower'), img('orange_moon')] },
      { id: 54, itemCount: 6, sequence: [img('basketball'), img('ring'), img('yellow_balloon'), img('orange_moon'), img('red_apple'), img('orange_cat')] },
      { id: 55, itemCount: 6, sequence: [img('umbrella'), img('rainbow'), img('house'), img('blue_fish'), img('blue_bicycle'), img('boat_side')] },
    ],
  },
  // Session 12: Level 3 (exercises 56-60)
  {
    sessionNumber: 12, itemCount: 6, level: 3,
    sequences: [
      { id: 56, itemCount: 6, sequence: [img('apple_2'), img('strawberry'), img('cherry'), img('orange'), img('carrot'), img('watermelon')] },
      { id: 57, itemCount: 6, sequence: [img('pear_2'), img('green_apple_2'), img('lettuce'), img('kiwi'), img('pickle'), img('broccoli')] },
      { id: 58, itemCount: 6, sequence: [img('banana'), img('cheese'), img('lemon'), img('pineapple'), img('orange_3'), img('carrot')] },
      { id: 59, itemCount: 6, sequence: [img('blue_scooter'), img('blue_bicycle'), img('boat'), img('bus'), img('plane'), img('blue_car')] },
      { id: 60, itemCount: 6, sequence: [img('palm_tree'), img('tree'), img('leaf'), img('red_flower'), img('cactus'), img('bush')] },
    ],
  },

  // --- 7 pictures ---
  // Session 13: Level 1 (exercises 61-65)
  {
    sessionNumber: 13, itemCount: 7, level: 1,
    sequences: [
      { id: 61, itemCount: 7, sequence: [img('red_apple'), img('blue_fish'), img('crab'), img('blue_car'), img('sun_sunglasses'), img('chair'), img('basketball')] },
      { id: 62, itemCount: 7, sequence: [img('dog'), img('green_balloon'), img('snail'), img('house'), img('tree'), img('blue_fish'), img('pear')] },
      { id: 63, itemCount: 7, sequence: [img('house'), img('ring'), img('gray_moon'), img('blue_car'), img('lion'), img('red_bicycle'), img('giraffe')] },
      { id: 64, itemCount: 7, sequence: [img('basketball'), img('chair'), img('tree'), img('umbrella'), img('gray_cat'), img('sun_sunglasses'), img('house')] },
      { id: 65, itemCount: 7, sequence: [img('gray_cat'), img('pear'), img('snail'), img('blue_car'), img('orange'), img('dog'), img('pencil')] },
    ],
  },
  // Session 14: Level 2 (exercises 66-70)
  {
    sessionNumber: 14, itemCount: 7, level: 2,
    sequences: [
      { id: 66, itemCount: 7, sequence: [img('sun_sunglasses'), img('snail'), img('ring'), img('lion'), img('yellow_balloon'), img('basketball'), img('orange_moon')] },
      { id: 67, itemCount: 7, sequence: [img('cactus'), img('green_car'), img('tree'), img('green_apple'), img('tennis_ball'), img('turtle'), img('pear')] },
      { id: 68, itemCount: 7, sequence: [img('chair'), img('giraffe'), img('orange_flower'), img('yellow_balloon'), img('orange_moon'), img('basketball'), img('orange_cat')] },
      { id: 69, itemCount: 7, sequence: [img('blue_bicycle'), img('blue_fish'), img('cloud'), img('blue_car'), img('butterfly'), img('house'), img('blue_flower')] },
      { id: 70, itemCount: 7, sequence: [img('umbrella'), img('red_apple'), img('house'), img('sneaker'), img('rainbow'), img('red_scooter'), img('purple_mug')] },
    ],
  },
  // Session 15: Level 3 (exercises 71-75)
  {
    sessionNumber: 15, itemCount: 7, level: 3,
    sequences: [
      { id: 71, itemCount: 7, sequence: [img('apple_2'), img('orange_2'), img('strawberry'), img('carrot'), img('cherry'), img('watermelon'), img('grapes')] },
      { id: 72, itemCount: 7, sequence: [img('pear_2'), img('green_apple_2'), img('lettuce'), img('kiwi'), img('pickle'), img('broccoli'), img('watermelon_2')] },
      { id: 73, itemCount: 7, sequence: [img('banana'), img('cheese'), img('lemon'), img('orange_3'), img('pineapple'), img('carrot'), img('corn')] },
      { id: 74, itemCount: 7, sequence: [img('blue_scooter'), img('blue_bicycle'), img('boat'), img('plane'), img('bus'), img('train'), img('blue_car')] },
      { id: 75, itemCount: 7, sequence: [img('palm_tree'), img('cactus'), img('leaf'), img('grass'), img('tree'), img('red_flower'), img('bush')] },
    ],
  },
];

// Get a session by number (1-15)
export function getMemorySession(sessionNumber: number): MemorySession {
  const clamped = Math.max(1, Math.min(15, sessionNumber));
  return MEMORY_SESSIONS[clamped - 1];
}

// Image path helper
export function getMemoryImagePath(name: string): string {
  return `/assets/visual-memory/${name}.png`;
}

// Get all unique items for the selection grid (sequence items + distractors from same session)
export function getAllUniqueItems(sequence: MemorySequence, session: MemorySession): string[] {
  const allItems = new Set<string>();

  // Add sequence items
  sequence.sequence.forEach((item) => allItems.add(item));

  // Add distractors from other sequences in the same session
  for (const seq of session.sequences) {
    if (seq.id === sequence.id) continue;
    seq.sequence.forEach((item) => allItems.add(item));
  }

  // Shuffle using Fisher-Yates
  const arr = Array.from(allItems);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
