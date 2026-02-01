// Visual Memory Exercise Data - 75 combinations organized by level
// Based on EXACT reference images from Visual memory folder
// Each combination defines the sequence of images to remember

export interface MemorySequence {
  id: number;
  level: number; // 1 = visually different, 2 = visually similar/categorically different, 3 = visually similar
  itemCount: number; // 3, 4, 5, 6, or 7 images
  sequence: string[]; // Array of image identifiers
}

// Using emojis that match the reference images exactly
export const MEMORY_ITEMS: Record<string, string> = {
  // Animals
  cat: '🐱',           // Gray sitting cat
  dog: '🐕',           // Golden/yellow dog
  fish: '🐟',          // Blue fish
  crab: '🦀',          // Orange/red crab
  snail: '🐌',         // Yellow/brown snail
  lion: '🦁',          // Orange roaring lion
  giraffe: '🦒',       // Giraffe
  turtle: '🐢',        // Green sea turtle
  frog: '🐸',          // Green frog
  lizard: '🦎',        // Green alligator/crocodile
  tiger: '🐯',         // Orange tiger
  caterpillar: '🐛',   // Green caterpillar
  butterfly: '🦋',     // Blue butterfly
  
  // Fruits
  apple: '🍎',         // Red apple
  greenapple: '🍏',    // Green apple
  pear: '🍐',          // Green/yellow pear
  orange: '🍊',        // Orange fruit
  strawberry: '🍓',    // Strawberry
  cherry: '🍒',        // Cherries
  watermelon: '🍉',    // Watermelon slice
  banana: '🍌',        // Banana
  lemon: '🍋',         // Lemon
  pineapple: '🍍',     // Pineapple
  grapes: '🍇',        // Grapes
  kiwi: '🥝',          // Kiwi
  
  // Vegetables
  carrot: '🥕',        // Orange carrot
  cucumber: '🥒',      // Cucumber
  broccoli: '🥦',      // Broccoli
  lettuce: '🥬',       // Lettuce/cabbage
  corn: '🌽',          // Corn
  
  // Vehicles
  car: '🚗',           // Blue car
  bicycle: '🚲',       // Bicycle
  scooter: '🛴',       // Kick scooter
  airplane: '✈️',      // Airplane
  ship: '🚢',          // Cruise ship/boat
  bus: '🚌',           // Blue bus
  train: '🚂',         // Red train
  
  // Nature
  tree: '🌳',          // Green tree
  sun: '☀️',           // Sun with rays (sunglasses in image)
  moon: '🌙',          // Gray crescent moon with stars
  flower: '🌸',        // Flower (pink/orange)
  cactus: '🌵',        // Green cactus
  leaf: '🍃',          // Green leaf
  palm: '🌴',          // Palm tree
  grass: '🌿',         // Grass/herbs
  bush: '🌲',          // Bush/tree
  rainbow: '🌈',       // Rainbow
  cloud: '☁️',         // White cloud
  
  // Objects
  chair: '🪑',         // Wooden chair
  house: '🏠',         // House with red roof
  ball: '🏀',          // Basketball (orange)
  balloon: '🎈',       // Balloon (various colors)
  pencil: '✏️',        // Yellow pencil
  ring: '💍',          // Gold ring
  racket: '🏸',        // Badminton/tennis racket
  umbrella: '☂️',      // Rainbow umbrella
  frisbee: '🥏',       // Flying disc
  candy: '🍬',         // Wrapped candy
  cheese: '🧀',        // Cheese wedge
  cup: '☕',           // Cup/mug
  sneakers: '👟',      // Sneakers/shoes
  tennisball: '🎾',    // Tennis ball (yellow-green)
};

export function getItemEmoji(name: string): string {
  return MEMORY_ITEMS[name] || '❓';
}

// All 75 combinations based on the reference document
// Structure: 5 exercises per level per item count
// Level 1: Visually different, categorically different
// Level 2: Visually similar, categorically different  
// Level 3: Visually similar, categorically similar

export const MEMORY_SEQUENCES: MemorySequence[] = [
  // ============================================
  // 3 IMAGES
  // ============================================
  
  // 3 images - LEVEL 1 (exercises 1-5)
  { id: 1, level: 1, itemCount: 3, sequence: ['cat', 'apple', 'car'] },
  { id: 2, level: 1, itemCount: 3, sequence: ['fish', 'tree', 'crab'] },
  { id: 3, level: 1, itemCount: 3, sequence: ['sun', 'pear', 'dog'] },
  { id: 4, level: 1, itemCount: 3, sequence: ['snail', 'balloon', 'chair'] },
  { id: 5, level: 1, itemCount: 3, sequence: ['house', 'ball', 'moon'] },
  
  // 3 images - LEVEL 2 (exercises 6-10)
  { id: 6, level: 2, itemCount: 3, sequence: ['snail', 'lion', 'pencil'] },
  { id: 7, level: 2, itemCount: 3, sequence: ['pear', 'chair', 'tree'] },
  { id: 8, level: 2, itemCount: 3, sequence: ['sun', 'balloon', 'ring'] },
  { id: 9, level: 2, itemCount: 3, sequence: ['crab', 'apple', 'bicycle'] },
  { id: 10, level: 2, itemCount: 3, sequence: ['fish', 'car', 'cat'] },
  
  // 3 images - LEVEL 3 (exercises 11-15)
  { id: 11, level: 3, itemCount: 3, sequence: ['cat', 'lion', 'giraffe'] },
  { id: 12, level: 3, itemCount: 3, sequence: ['turtle', 'frog', 'lizard'] },
  { id: 13, level: 3, itemCount: 3, sequence: ['ball', 'balloon', 'racket'] },
  { id: 14, level: 3, itemCount: 3, sequence: ['bicycle', 'car', 'scooter'] },
  { id: 15, level: 3, itemCount: 3, sequence: ['cactus', 'tree', 'leaf'] },

  // ============================================
  // 4 IMAGES
  // ============================================
  
  // 4 images - LEVEL 1 (exercises 16-20)
  { id: 16, level: 1, itemCount: 4, sequence: ['pencil', 'car', 'ring', 'tree'] },
  { id: 17, level: 1, itemCount: 4, sequence: ['cat', 'house', 'sun', 'fish'] },
  { id: 18, level: 1, itemCount: 4, sequence: ['car', 'crab', 'balloon', 'dog'] },
  { id: 19, level: 1, itemCount: 4, sequence: ['snail', 'apple', 'chair', 'balloon'] },
  { id: 20, level: 1, itemCount: 4, sequence: ['moon', 'house', 'dog', 'fish'] },
  
  // 4 images - LEVEL 2 (exercises 21-25)
  { id: 21, level: 2, itemCount: 4, sequence: ['snail', 'lion', 'pencil', 'giraffe'] },
  { id: 22, level: 2, itemCount: 4, sequence: ['pear', 'chair', 'tree', 'greenapple'] },
  { id: 23, level: 2, itemCount: 4, sequence: ['sun', 'balloon', 'ring', 'ball'] },
  { id: 24, level: 2, itemCount: 4, sequence: ['moon', 'car', 'cat', 'fish'] },
  { id: 25, level: 2, itemCount: 4, sequence: ['apple', 'crab', 'ball', 'balloon'] },
  
  // 4 images - LEVEL 3 (exercises 26-30)
  { id: 26, level: 3, itemCount: 4, sequence: ['cat', 'tiger', 'lion', 'giraffe'] },
  { id: 27, level: 3, itemCount: 4, sequence: ['caterpillar', 'frog', 'turtle', 'lizard'] },
  { id: 28, level: 3, itemCount: 4, sequence: ['ball', 'balloon', 'racket', 'frisbee'] },
  { id: 29, level: 3, itemCount: 4, sequence: ['bicycle', 'airplane', 'ship', 'car'] },
  { id: 30, level: 3, itemCount: 4, sequence: ['cactus', 'leaf', 'flower', 'tree'] },

  // ============================================
  // 5 IMAGES
  // ============================================
  
  // 5 images - LEVEL 1 (exercises 31-35)
  { id: 31, level: 1, itemCount: 5, sequence: ['cat', 'car', 'house', 'fish', 'snail'] },
  { id: 32, level: 1, itemCount: 5, sequence: ['orange', 'tree', 'crab', 'moon', 'pear'] },
  { id: 33, level: 1, itemCount: 5, sequence: ['fish', 'sun', 'lion', 'apple', 'ring'] },
  { id: 34, level: 1, itemCount: 5, sequence: ['pear', 'ball', 'bicycle', 'chair', 'giraffe'] },
  { id: 35, level: 1, itemCount: 5, sequence: ['balloon', 'car', 'tree', 'cat'] },
  
  // 5 images - LEVEL 2 (exercises 36-40)
  { id: 36, level: 2, itemCount: 5, sequence: ['snail', 'balloon', 'lion', 'ball', 'giraffe'] },
  { id: 37, level: 2, itemCount: 5, sequence: ['pear', 'tree', 'greenapple', 'umbrella', 'house'] },
  { id: 38, level: 2, itemCount: 5, sequence: ['sun', 'ball', 'apple', 'ring', 'crab'] },
  { id: 39, level: 2, itemCount: 5, sequence: ['moon', 'chair', 'cat', 'balloon', 'lion'] },
  { id: 40, level: 2, itemCount: 5, sequence: ['car', 'house', 'bicycle', 'pencil', 'fish'] },
  
  // 5 images - LEVEL 3 (exercises 41-45)
  { id: 41, level: 3, itemCount: 5, sequence: ['tiger', 'cat', 'lion', 'giraffe', 'dog'] },
  { id: 42, level: 3, itemCount: 5, sequence: ['frog', 'lizard', 'turtle', 'caterpillar', 'fish'] },
  { id: 43, level: 3, itemCount: 5, sequence: ['ball', 'racket', 'candy', 'balloon', 'frisbee'] },
  { id: 44, level: 3, itemCount: 5, sequence: ['scooter', 'bicycle', 'ship', 'airplane', 'car'] },
  { id: 45, level: 3, itemCount: 5, sequence: ['greenapple', 'flower', 'cactus', 'leaf', 'tree'] },

  // ============================================
  // 6 IMAGES
  // ============================================
  
  // 6 images - LEVEL 1 (exercises 46-50)
  { id: 46, level: 1, itemCount: 6, sequence: ['house', 'fish', 'snail', 'car', 'sun', 'moon'] },
  { id: 47, level: 1, itemCount: 6, sequence: ['chair', 'balloon', 'apple', 'crab', 'tree', 'ball'] },
  { id: 48, level: 1, itemCount: 6, sequence: ['ring', 'house', 'umbrella', 'pear', 'car', 'dog'] },
  { id: 49, level: 1, itemCount: 6, sequence: ['ball', 'chair', 'moon', 'tree', 'fish', 'bicycle'] },
  { id: 50, level: 1, itemCount: 6, sequence: ['cat', 'pear', 'snail', 'car', 'sun', 'house'] },
  
  // 6 images - LEVEL 2 (exercises 51-55)
  { id: 51, level: 2, itemCount: 6, sequence: ['sun', 'lion', 'snail', 'balloon', 'ball', 'cat'] },
  { id: 52, level: 2, itemCount: 6, sequence: ['pear', 'turtle', 'tennisball', 'tree', 'greenapple', 'leaf'] },
  { id: 53, level: 2, itemCount: 6, sequence: ['giraffe', 'chair', 'house', 'cat', 'flower', 'moon'] },
  { id: 54, level: 2, itemCount: 6, sequence: ['ball', 'ring', 'balloon', 'moon', 'apple', 'cat'] },
  { id: 55, level: 2, itemCount: 6, sequence: ['umbrella', 'rainbow', 'house', 'fish', 'bicycle', 'ship'] },
  
  // 6 images - LEVEL 3 (exercises 56-60)
  { id: 56, level: 3, itemCount: 6, sequence: ['apple', 'strawberry', 'cherry', 'orange', 'carrot', 'watermelon'] },
  { id: 57, level: 3, itemCount: 6, sequence: ['pear', 'greenapple', 'lettuce', 'kiwi', 'cucumber', 'broccoli'] },
  { id: 58, level: 3, itemCount: 6, sequence: ['banana', 'cheese', 'lemon', 'pineapple', 'orange', 'carrot'] },
  { id: 59, level: 3, itemCount: 6, sequence: ['scooter', 'bicycle', 'ship', 'bus', 'airplane', 'car'] },
  { id: 60, level: 3, itemCount: 6, sequence: ['palm', 'tree', 'leaf', 'flower', 'cactus', 'bush'] },

  // ============================================
  // 7 IMAGES
  // ============================================
  
  // 7 images - LEVEL 1 (exercises 61-65)
  { id: 61, level: 1, itemCount: 7, sequence: ['apple', 'fish', 'crab', 'car', 'sun', 'chair', 'ball'] },
  { id: 62, level: 1, itemCount: 7, sequence: ['dog', 'balloon', 'snail', 'house', 'tree', 'fish', 'pear'] },
  { id: 63, level: 1, itemCount: 7, sequence: ['house', 'ring', 'moon', 'car', 'lion', 'bicycle', 'giraffe'] },
  { id: 64, level: 1, itemCount: 7, sequence: ['ball', 'chair', 'moon', 'tree', 'fish', 'bicycle'] },
  { id: 65, level: 1, itemCount: 7, sequence: ['cat', 'pear', 'snail', 'car', 'orange', 'dog', 'pencil'] },
  
  // 7 images - LEVEL 2 (exercises 66-70)
  { id: 66, level: 2, itemCount: 7, sequence: ['sun', 'snail', 'ring', 'lion', 'balloon', 'ball', 'moon'] },
  { id: 67, level: 2, itemCount: 7, sequence: ['cactus', 'car', 'tree', 'greenapple', 'tennisball', 'turtle', 'pear'] },
  { id: 68, level: 2, itemCount: 7, sequence: ['chair', 'giraffe', 'flower', 'balloon', 'moon', 'ball', 'cat'] },
  { id: 69, level: 2, itemCount: 7, sequence: ['bicycle', 'fish', 'cloud', 'car', 'butterfly', 'house', 'flower'] },
  { id: 70, level: 2, itemCount: 7, sequence: ['umbrella', 'apple', 'house', 'sneakers', 'rainbow', 'scooter', 'cup'] },
  
  // 7 images - LEVEL 3 (exercises 71-75)
  { id: 71, level: 3, itemCount: 7, sequence: ['apple', 'orange', 'strawberry', 'carrot', 'cherry', 'watermelon', 'grapes'] },
  { id: 72, level: 3, itemCount: 7, sequence: ['pear', 'greenapple', 'lettuce', 'kiwi', 'cucumber', 'broccoli', 'watermelon'] },
  { id: 73, level: 3, itemCount: 7, sequence: ['banana', 'cheese', 'lemon', 'orange', 'pineapple', 'carrot', 'corn'] },
  { id: 74, level: 3, itemCount: 7, sequence: ['scooter', 'bicycle', 'ship', 'airplane', 'bus', 'train', 'car'] },
  { id: 75, level: 3, itemCount: 7, sequence: ['palm', 'cactus', 'leaf', 'grass', 'tree', 'flower', 'bush'] },
];

// Get sequences for a specific session (5 examples per session)
export function getSessionSequences(sessionNumber: number): MemorySequence[] {
  const startIndex = ((sessionNumber - 1) * 5) % MEMORY_SEQUENCES.length;
  const sequences: MemorySequence[] = [];
  for (let i = 0; i < 5; i++) {
    sequences.push(MEMORY_SEQUENCES[(startIndex + i) % MEMORY_SEQUENCES.length]);
  }
  return sequences;
}

// Get all unique items for the selection grid (sequence items + distractors)
export function getAllUniqueItems(sequence: MemorySequence): string[] {
  const allItems = new Set<string>();
  
  // Add sequence items
  sequence.sequence.forEach(item => allItems.add(item));
  
  // Add distractors from same level for increased difficulty
  const sameLevelItems = MEMORY_SEQUENCES
    .filter(s => s.level === sequence.level)
    .flatMap(s => s.sequence);
  
  const distractors = [...new Set(sameLevelItems)].filter(item => !sequence.sequence.includes(item));
  const shuffledDistractors = distractors.sort(() => Math.random() - 0.5);
  
  // Add enough distractors to fill a 4x3 grid (12 items)
  const neededDistractors = Math.max(0, 12 - allItems.size);
  shuffledDistractors.slice(0, neededDistractors).forEach(item => allItems.add(item));
  
  // If still not enough, add from other levels
  if (allItems.size < 12) {
    const otherItems = Object.keys(MEMORY_ITEMS).filter(item => !allItems.has(item));
    const shuffledOther = otherItems.sort(() => Math.random() - 0.5);
    const stillNeeded = 12 - allItems.size;
    shuffledOther.slice(0, stillNeeded).forEach(item => allItems.add(item));
  }
  
  // Shuffle and return
  return Array.from(allItems).sort(() => Math.random() - 0.5);
}

// Get sequences by difficulty level
export function getSequencesByLevel(level: number): MemorySequence[] {
  return MEMORY_SEQUENCES.filter(s => s.level === level);
}

// Get sequences by item count
export function getSequencesByItemCount(count: number): MemorySequence[] {
  return MEMORY_SEQUENCES.filter(s => s.itemCount === count);
}

// Get a specific sequence by ID
export function getSequenceById(id: number): MemorySequence | undefined {
  return MEMORY_SEQUENCES.find(s => s.id === id);
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

// Shuffle array using seeded RNG
function shuffleArraySeeded<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Item categories for generating diverse sequences
const ITEM_CATEGORIES: Record<string, string[]> = {
  animals: ['cat', 'dog', 'fish', 'crab', 'snail', 'lion', 'giraffe', 'turtle', 'frog', 'lizard', 'tiger', 'caterpillar', 'butterfly'],
  fruits: ['apple', 'greenapple', 'pear', 'orange', 'strawberry', 'cherry', 'watermelon', 'banana', 'lemon', 'pineapple', 'grapes', 'kiwi'],
  vegetables: ['carrot', 'cucumber', 'broccoli', 'lettuce', 'corn'],
  vehicles: ['car', 'bicycle', 'scooter', 'airplane', 'ship', 'bus', 'train'],
  nature: ['tree', 'sun', 'moon', 'flower', 'cactus', 'leaf', 'palm', 'grass', 'bush', 'rainbow', 'cloud'],
  objects: ['chair', 'house', 'ball', 'balloon', 'pencil', 'ring', 'racket', 'umbrella', 'frisbee', 'candy', 'cheese', 'cup', 'sneakers', 'tennisball'],
};

// All items for procedural selection
const ALL_ITEMS = Object.values(ITEM_CATEGORIES).flat();

// Generate a procedural memory sequence
export function generateMemorySequence(taskIndex: number, sessionSeed: number = Date.now()): MemorySequence {
  const rng = seededRandom(sessionSeed + taskIndex * 1000);
  
  // Determine sequence length (3-7 items)
  const itemCount = 3 + Math.floor(rng() * 5);
  
  // Determine difficulty level based on selection strategy
  const level = 1 + Math.floor(rng() * 3);
  
  let sequence: string[];
  
  if (level === 1) {
    // Level 1: Visually different - pick from DIFFERENT categories
    const shuffledCategories = shuffleArraySeeded(Object.keys(ITEM_CATEGORIES), rng);
    sequence = [];
    for (let i = 0; i < itemCount; i++) {
      const category = shuffledCategories[i % shuffledCategories.length];
      const items = ITEM_CATEGORIES[category];
      sequence.push(items[Math.floor(rng() * items.length)]);
    }
  } else if (level === 2) {
    // Level 2: Mix - some from same category, some from different
    const primaryCategory = Object.keys(ITEM_CATEGORIES)[Math.floor(rng() * Object.keys(ITEM_CATEGORIES).length)];
    const primaryItems = shuffleArraySeeded(ITEM_CATEGORIES[primaryCategory], rng);
    const otherItems = shuffleArraySeeded(ALL_ITEMS.filter(i => !ITEM_CATEGORIES[primaryCategory].includes(i)), rng);
    
    sequence = [];
    for (let i = 0; i < itemCount; i++) {
      if (i < itemCount / 2) {
        sequence.push(primaryItems[i % primaryItems.length]);
      } else {
        sequence.push(otherItems[i % otherItems.length]);
      }
    }
    sequence = shuffleArraySeeded(sequence, rng);
  } else {
    // Level 3: Visually similar - pick from SAME category
    const category = Object.keys(ITEM_CATEGORIES)[Math.floor(rng() * Object.keys(ITEM_CATEGORIES).length)];
    const items = shuffleArraySeeded(ITEM_CATEGORIES[category], rng);
    sequence = items.slice(0, Math.min(itemCount, items.length));
    
    // If not enough items in category, add from all
    while (sequence.length < itemCount) {
      const additional = ALL_ITEMS[Math.floor(rng() * ALL_ITEMS.length)];
      if (!sequence.includes(additional)) {
        sequence.push(additional);
      }
    }
  }
  
  return {
    id: 100 + taskIndex,
    level,
    itemCount,
    sequence,
  };
}

// Get sequence: first 75 are static, then procedural
export function getMemorySequenceConfig(taskIndex: number, sessionSeed: number): MemorySequence {
  if (taskIndex < MEMORY_SEQUENCES.length) {
    return MEMORY_SEQUENCES[taskIndex];
  }
  return generateMemorySequence(taskIndex, sessionSeed);
}
