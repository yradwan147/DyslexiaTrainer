// Visual Discrimination Exercise Data - 15 configurations based on exact reference images
// Each image shows a target shape and 4 options with subtle differences

export interface ShapeElement {
  type: 'circle' | 'triangle' | 'rectangle' | 'arc' | 'pentagon' | 'octagon' | 'arrow' | 'line';
  x: number; // 0-100 position
  y: number;
  size: number; // 0-100
  rotation: number; // degrees
  filled?: boolean;
  strokeWidth?: number;
}

export interface CompositeShape {
  elements: ShapeElement[];
}

export interface VisualDiscriminationConfig {
  id: number;
  description: string;
  target: CompositeShape;
  options: CompositeShape[];
  correctIndex: number;
}

// Helper to create common shapes
function circle(x: number, y: number, size: number): ShapeElement {
  return { type: 'circle', x, y, size, rotation: 0 };
}

function triangle(x: number, y: number, size: number, rotation: number = 0): ShapeElement {
  return { type: 'triangle', x, y, size, rotation };
}

function rectangle(x: number, y: number, width: number, height: number = 40, rotation: number = 0): ShapeElement {
  return { type: 'rectangle', x, y, size: width, rotation, strokeWidth: height };
}

function arc(x: number, y: number, size: number, rotation: number = 0): ShapeElement {
  return { type: 'arc', x, y, size, rotation };
}

function pentagon(x: number, y: number, size: number): ShapeElement {
  return { type: 'pentagon', x, y, size, rotation: 0 };
}

function octagon(x: number, y: number, size: number): ShapeElement {
  return { type: 'octagon', x, y, size, rotation: 0 };
}

function arrow(x: number, y: number, size: number, rotation: number = 0): ShapeElement {
  return { type: 'arrow', x, y, size, rotation };
}

function line(x: number, y: number, size: number, rotation: number = 0): ShapeElement {
  return { type: 'line', x, y, size, rotation };
}

export const VISUAL_DISCRIMINATION_CONFIGS: VisualDiscriminationConfig[] = [
  // Image 1: Circle with rectangle inside (varying positions)
  {
    id: 1,
    description: 'Circle with horizontal rectangle',
    target: { elements: [circle(50, 50, 80), rectangle(50, 55, 70, 25)] },
    options: [
      { elements: [circle(50, 50, 80), rectangle(50, 35, 60, 20)] }, // Rect at top, smaller
      { elements: [circle(50, 50, 80), rectangle(50, 55, 70, 25)] }, // Correct
      { elements: [circle(50, 50, 80), rectangle(50, 65, 55, 20)] }, // Rect at bottom, smaller
      { elements: [circle(50, 50, 80), rectangle(50, 50, 45, 15)] }, // Small rect centered
    ],
    correctIndex: 1,
  },
  // Image 2: Triangle down with rectangle
  {
    id: 2,
    description: 'Triangle pointing down with horizontal rectangle',
    target: { elements: [triangle(50, 50, 70, 180), rectangle(50, 25, 70, 15)] },
    options: [
      { elements: [triangle(50, 50, 70, 180), rectangle(50, 25, 50, 10)] }, // Smaller rect
      { elements: [triangle(50, 50, 60, 90), rectangle(50, 25, 50, 15)] }, // Triangle pointing left
      { elements: [triangle(50, 50, 70, 0), rectangle(50, 75, 70, 15)] }, // Triangle up
      { elements: [triangle(50, 50, 70, 180), rectangle(50, 25, 70, 15)] }, // Correct
    ],
    correctIndex: 3,
  },
  // Image 3: Triangle with circle (various orientations)
  {
    id: 3,
    description: 'Large triangle with circle overlap',
    target: { elements: [triangle(50, 45, 75, 180), circle(50, 30, 45)] },
    options: [
      { elements: [triangle(50, 50, 75, 90), circle(35, 50, 45)] }, // Triangle left
      { elements: [triangle(50, 45, 60, 180), circle(50, 35, 50)] }, // Smaller triangle, larger circle
      { elements: [triangle(50, 45, 75, 180), circle(50, 30, 45)] }, // Correct
      { elements: [triangle(50, 55, 75, 0), circle(50, 70, 45)] }, // Triangle up, circle at bottom
    ],
    correctIndex: 2,
  },
  // Image 4: Triangle with arrow inside pointing down
  {
    id: 4,
    description: 'Triangle with arrow inside',
    target: { elements: [triangle(50, 50, 80, 180), arrow(50, 50, 40, 180)] },
    options: [
      { elements: [triangle(50, 50, 80, 180), arrow(50, 50, 30, 180)] }, // Smaller arrow
      { elements: [triangle(50, 50, 70, 180), arrow(50, 50, 35, 180)] }, // Wider arrow head
      { elements: [triangle(50, 50, 80, 90), arrow(50, 50, 40, 90)] }, // Pointing right
      { elements: [triangle(50, 50, 80, 0), arrow(50, 50, 40, 0)] }, // Pointing up
    ],
    correctIndex: 0, // First option is correct (closest match)
  },
  // Image 5: Circle with triangle down, overlapping
  {
    id: 5,
    description: 'Triangle overlapping circle',
    target: { elements: [circle(50, 45, 55), triangle(50, 60, 80, 180)] },
    options: [
      { elements: [circle(50, 55, 55), triangle(50, 40, 80, 0)] }, // Triangle up
      { elements: [circle(35, 50, 45), triangle(45, 55, 70, 90)] }, // Triangle right
      { elements: [circle(50, 50, 60), triangle(50, 55, 70, 180)] }, // Different proportions
      { elements: [circle(50, 45, 55), triangle(50, 60, 80, 180)] }, // Correct
    ],
    correctIndex: 3,
  },
  // Image 6: Circle with line and triangle in bottom half
  {
    id: 6,
    description: 'Circle with horizontal line and small triangle below',
    target: { elements: [circle(50, 50, 80), line(50, 35, 70, 0), triangle(50, 65, 40, 180)] },
    options: [
      { elements: [circle(50, 50, 80), line(50, 65, 70, 0), triangle(50, 35, 40, 0)] }, // Triangle up at top
      { elements: [circle(50, 50, 80), triangle(50, 50, 50, 180)] }, // Just triangle, larger, no line
      { elements: [circle(50, 50, 80), line(50, 35, 70, 0), triangle(50, 65, 40, 180)] }, // Correct
      { elements: [circle(50, 50, 70), line(50, 35, 60, 0), triangle(50, 65, 35, 180)] }, // Smaller overall
    ],
    correctIndex: 2,
  },
  // Image 7: Semicircle on rectangle with triangle
  {
    id: 7,
    description: 'Semicircle above rectangle with triangle inside',
    target: { elements: [arc(50, 30, 70, 0), rectangle(50, 60, 70, 40), triangle(50, 55, 60, 0)] },
    options: [
      { elements: [arc(50, 70, 60, 180), rectangle(50, 40, 60, 35), triangle(50, 45, 40, 0)] }, // Arc at bottom, small
      { elements: [arc(50, 30, 70, 0), rectangle(50, 60, 70, 40), triangle(50, 55, 60, 0)] }, // Correct
      { elements: [arc(50, 30, 70, 0), rectangle(50, 60, 70, 40), triangle(50, 55, 60, 180)] }, // Triangle down
      { elements: [arc(50, 70, 70, 180), rectangle(50, 40, 70, 40), triangle(50, 45, 50, 180)] }, // Arc at bottom, triangle down
    ],
    correctIndex: 1,
  },
  // Image 8: Pentagon with triangle and arc
  {
    id: 8,
    description: 'Pentagon with triangle and arc inside',
    target: { elements: [pentagon(50, 50, 85), arc(50, 40, 40, 180), triangle(50, 65, 45, 0)] },
    options: [
      { elements: [pentagon(50, 50, 85), arc(50, 60, 40, 0), triangle(50, 35, 45, 180)] }, // Arc/triangle flipped
      { elements: [triangle(50, 50, 85, 0), arc(50, 40, 40, 180), triangle(50, 65, 30, 0)] }, // Outer is triangle
      { elements: [pentagon(50, 50, 85), arc(50, 40, 40, 180), triangle(50, 65, 45, 0)] }, // Correct
      { elements: [pentagon(50, 50, 75), arc(50, 35, 35, 180), triangle(50, 60, 40, 0)] }, // Smaller
    ],
    correctIndex: 2,
  },
  // Image 9: Diamond with circle and lines
  {
    id: 9,
    description: 'Diamond with internal patterns',
    target: { elements: [rectangle(50, 50, 75, 75, 45), circle(50, 50, 30), line(50, 30, 40, 0), line(50, 70, 40, 0)] },
    options: [
      { elements: [rectangle(50, 50, 75, 75, 45), circle(50, 50, 30), line(50, 30, 40, 0), line(50, 70, 40, 0)] }, // Correct
      { elements: [rectangle(50, 50, 75, 75, 45), circle(50, 50, 40), line(50, 30, 40, 0), line(50, 70, 40, 0)] }, // Larger circle
      { elements: [rectangle(50, 50, 75, 75, 0), circle(50, 50, 30), line(50, 30, 40, 0), line(50, 70, 40, 0)] }, // Not rotated
      { elements: [rectangle(50, 50, 65, 65, 45), circle(50, 50, 25), line(50, 35, 35, 0), line(50, 65, 35, 0)] }, // Smaller
    ],
    correctIndex: 0,
  },
  // Image 10: Octagon with cross arrows
  {
    id: 10,
    description: 'Octagon with cross arrows and center circle',
    target: { elements: [octagon(50, 50, 80), circle(50, 50, 25), arrow(50, 25, 20, 0), arrow(50, 75, 20, 180), arrow(25, 50, 20, 270), arrow(75, 50, 20, 90)] },
    options: [
      { elements: [octagon(50, 50, 80), circle(50, 50, 25), arrow(35, 35, 20, 315), arrow(65, 65, 20, 135), arrow(35, 65, 20, 225), arrow(65, 35, 20, 45)] }, // Diagonal arrows
      { elements: [octagon(50, 50, 70), circle(50, 50, 20), arrow(50, 25, 20, 0), arrow(50, 75, 20, 180), arrow(25, 50, 20, 270), arrow(75, 50, 20, 90)] }, // Smaller
      { elements: [octagon(50, 50, 80), circle(50, 50, 25), arrow(50, 25, 20, 0), arrow(50, 75, 20, 180), arrow(25, 50, 20, 270), arrow(75, 50, 20, 90)] }, // Correct
      { elements: [circle(50, 50, 80), circle(50, 50, 25), arrow(50, 25, 20, 0), arrow(50, 75, 20, 180), arrow(25, 50, 20, 270), arrow(75, 50, 20, 90)] }, // Circle instead of octagon
    ],
    correctIndex: 2,
  },
  // Images 11-15: Star of David and complex patterns
  {
    id: 11,
    description: 'Star of David with rectangle and center circle',
    target: { elements: [triangle(50, 35, 70, 0), triangle(50, 65, 70, 180), rectangle(50, 50, 80, 35), circle(50, 50, 20)] },
    options: [
      { elements: [triangle(50, 35, 70, 0), triangle(50, 65, 70, 180), rectangle(50, 65, 70, 30), circle(50, 50, 18)] }, // Rectangle lower, smaller circle
      { elements: [circle(50, 50, 85), triangle(50, 35, 65, 0), triangle(50, 65, 65, 180), rectangle(50, 50, 70, 35), circle(50, 50, 20)] }, // Extra enclosing circle
      { elements: [triangle(50, 35, 70, 0), triangle(50, 65, 70, 180), rectangle(50, 50, 80, 35), circle(50, 50, 20)] }, // Correct
      { elements: [triangle(50, 35, 70, 0), triangle(50, 65, 70, 180), rectangle(50, 50, 80, 35), circle(50, 50, 30)] }, // Larger center circle
    ],
    correctIndex: 2,
  },
  {
    id: 12,
    description: 'Overlapping rectangles',
    target: { elements: [rectangle(50, 50, 80, 50), rectangle(50, 50, 50, 80, 0)] },
    options: [
      { elements: [rectangle(50, 50, 80, 50), rectangle(50, 50, 50, 80, 0)] }, // Correct
      { elements: [rectangle(50, 50, 70, 45), rectangle(50, 50, 45, 70, 0)] }, // Smaller
      { elements: [rectangle(50, 50, 80, 50), rectangle(50, 50, 80, 50, 90)] }, // Same size rotated
      { elements: [rectangle(50, 50, 80, 80), rectangle(50, 50, 40, 40, 45)] }, // Square + diamond
    ],
    correctIndex: 0,
  },
  {
    id: 13,
    description: 'Star pattern',
    target: { elements: [triangle(50, 35, 50, 0), triangle(50, 65, 50, 180)] },
    options: [
      { elements: [triangle(50, 35, 50, 0), triangle(50, 65, 50, 180)] }, // Correct
      { elements: [triangle(50, 40, 45, 0), triangle(50, 60, 45, 180)] }, // Smaller, closer
      { elements: [triangle(50, 30, 55, 0), triangle(50, 70, 55, 180)] }, // Larger, further apart
      { elements: [triangle(35, 50, 50, 270), triangle(65, 50, 50, 90)] }, // Horizontal
    ],
    correctIndex: 0,
  },
  {
    id: 14,
    description: 'Hexagon with inner shapes',
    target: { elements: [pentagon(50, 50, 85), circle(50, 50, 35), triangle(50, 50, 25, 0)] },
    options: [
      { elements: [pentagon(50, 50, 85), circle(50, 50, 35), triangle(50, 50, 25, 0)] }, // Correct
      { elements: [pentagon(50, 50, 85), circle(50, 50, 35), triangle(50, 50, 25, 180)] }, // Triangle down
      { elements: [pentagon(50, 50, 75), circle(50, 50, 30), triangle(50, 50, 20, 0)] }, // Smaller
      { elements: [octagon(50, 50, 85), circle(50, 50, 35), triangle(50, 50, 25, 0)] }, // Octagon
    ],
    correctIndex: 0,
  },
  {
    id: 15,
    description: 'Circle with Star of David and small center circle',
    target: { elements: [circle(50, 50, 85), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), circle(50, 50, 18)] },
    options: [
      { elements: [circle(50, 50, 85), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), circle(50, 35, 18)] }, // Center circle offset up
      { elements: [circle(50, 50, 85), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), circle(50, 70, 18)] }, // Center circle at bottom
      { elements: [circle(50, 50, 85), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), circle(50, 50, 35)] }, // Larger center circle
      { elements: [circle(50, 50, 85), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), circle(50, 50, 18)] }, // Correct
    ],
    correctIndex: 3,
  },
];

export function getDiscriminationConfig(sessionNumber: number): VisualDiscriminationConfig {
  const index = Math.max(0, Math.min(sessionNumber - 1, VISUAL_DISCRIMINATION_CONFIGS.length - 1));
  return VISUAL_DISCRIMINATION_CONFIGS[index];
}
