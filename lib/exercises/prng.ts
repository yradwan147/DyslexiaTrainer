/**
 * Seeded Pseudo-Random Number Generator
 * Uses a Linear Congruential Generator for reproducible randomness
 */
export function createSeededRandom(seed: number) {
  let state = seed;
  
  return {
    // Returns a number between 0 and 1
    next(): number {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    },
    
    // Returns an integer between min and max (inclusive)
    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    
    // Returns true with given probability (0-1)
    nextBool(probability = 0.5): boolean {
      return this.next() < probability;
    },
    
    // Shuffles array in place
    shuffle<T>(array: T[]): T[] {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = this.nextInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
    
    // Pick random element from array
    pick<T>(array: T[]): T {
      return array[this.nextInt(0, array.length - 1)];
    },
    
    // Generate n random numbers between 0 and 1
    nextArray(n: number): number[] {
      return Array.from({ length: n }, () => this.next());
    },
    
    // Returns a number from normal distribution (Box-Muller)
    nextGaussian(mean = 0, stdDev = 1): number {
      const u1 = this.next();
      const u2 = this.next();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z0 * stdDev + mean;
    },
  };
}

export type SeededRandom = ReturnType<typeof createSeededRandom>;

