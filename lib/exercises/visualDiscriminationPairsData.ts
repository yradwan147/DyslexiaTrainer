// Visual Discrimination PAIRS Exercise Data - 15 configurations based on EXACT reference images
// Each configuration shows a target shape and 4 options, one of which matches exactly

export interface ShapeElement {
  type: 'circle' | 'triangle' | 'rectangle' | 'arc' | 'pentagon' | 'octagon' | 'arrow' | 'line' | 'diamond';
  x: number; // 0-100 position
  y: number;
  size: number; // 0-100
  rotation: number; // degrees
  height?: number; // For rectangles
  strokeWidth?: number;
}

export interface CompositeShape {
  elements: ShapeElement[];
}

export interface VisualDiscriminationPairsConfig {
  id: number;
  description: string;
  target: CompositeShape;
  options: CompositeShape[];
  correctIndex: number; // 0-based index
}

// Helper functions for creating common shapes
function circle(x: number, y: number, size: number): ShapeElement {
  return { type: 'circle', x, y, size, rotation: 0 };
}

function triangle(x: number, y: number, size: number, rotation: number = 0): ShapeElement {
  return { type: 'triangle', x, y, size, rotation };
}

function rectangle(x: number, y: number, width: number, height: number = 20, rotation: number = 0): ShapeElement {
  return { type: 'rectangle', x, y, size: width, height, rotation };
}

function diamond(x: number, y: number, size: number): ShapeElement {
  return { type: 'diamond', x, y, size, rotation: 45 };
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

function line(x: number, y: number, length: number, rotation: number = 0): ShapeElement {
  return { type: 'line', x, y, size: length, rotation };
}

export const VISUAL_DISCRIMINATION_PAIRS_CONFIGS: VisualDiscriminationPairsConfig[] = [
  // ============================================
  // Image 1: Circle with horizontal rectangle overlapping
  // Target: Circle with rectangle positioned in center-lower area
  // ============================================
  {
    id: 1,
    description: 'Circle with horizontal rectangle',
    target: {
      elements: [
        circle(50, 50, 80),
        rectangle(50, 55, 65, 22),
      ]
    },
    options: [
      // Option 1: Rectangle at left edge (circle line on left of rect)
      { elements: [circle(50, 50, 80), rectangle(50, 50, 55, 18)] },
      // Option 2: CORRECT - matches target
      { elements: [circle(50, 50, 80), rectangle(50, 55, 65, 22)] },
      // Option 3: Rectangle positioned higher, different size
      { elements: [circle(50, 50, 80), rectangle(50, 45, 55, 18)] },
      // Option 4: Smaller rectangle centered
      { elements: [circle(50, 50, 80), rectangle(50, 55, 45, 15)] },
    ],
    correctIndex: 1,
  },

  // ============================================
  // Image 2: Inverted triangle with horizontal double-line bar at top
  // ============================================
  {
    id: 2,
    description: 'Inverted triangle with horizontal bar',
    target: {
      elements: [
        triangle(50, 55, 70, 180), // Inverted triangle
        rectangle(50, 25, 70, 18), // Horizontal bar at top
      ]
    },
    options: [
      // Option 1: Smaller rectangle, no double lines
      { elements: [triangle(50, 55, 70, 180), rectangle(50, 25, 55, 12)] },
      // Option 2: Triangle pointing right with rectangle
      { elements: [triangle(50, 50, 55, 90), rectangle(30, 50, 40, 50, 90)] },
      // Option 3: Triangle pointing up with bar at bottom
      { elements: [triangle(50, 45, 70, 0), rectangle(50, 75, 70, 18)] },
      // Option 4: CORRECT - matches target
      { elements: [triangle(50, 55, 70, 180), rectangle(50, 25, 70, 18)] },
    ],
    correctIndex: 3,
  },

  // ============================================
  // Image 3: Circle with inverted triangle overlapping (triangle extends beyond)
  // ============================================
  {
    id: 3,
    description: 'Circle with inverted triangle overlapping',
    target: {
      elements: [
        circle(50, 35, 50), // Circle positioned higher
        triangle(50, 55, 75, 180), // Large inverted triangle extending down
      ]
    },
    options: [
      // Option 1: Left-pointing triangle with circle
      { elements: [triangle(45, 50, 70, 270), circle(30, 50, 45)] },
      // Option 2: Circle larger, triangle inside
      { elements: [circle(50, 50, 65), triangle(50, 55, 50, 180)] },
      // Option 3: CORRECT - matches target
      { elements: [circle(50, 35, 50), triangle(50, 55, 75, 180)] },
      // Option 4: Upward triangle with circle at bottom
      { elements: [triangle(50, 45, 75, 0), circle(50, 70, 45)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 4: Inverted triangle with down arrow inside
  // ============================================
  {
    id: 4,
    description: 'Inverted triangle with down arrow',
    target: {
      elements: [
        triangle(50, 50, 80, 180), // Large inverted triangle
        arrow(50, 50, 45, 180), // Down arrow inside
      ]
    },
    options: [
      // Option 1: CORRECT - arrow extends properly
      { elements: [triangle(50, 50, 80, 180), arrow(50, 50, 45, 180)] },
      // Option 2: Different arrow style (shorter, wider head)
      { elements: [triangle(50, 50, 75, 180), arrow(50, 45, 35, 180)] },
      // Option 3: Right-pointing triangle with right arrow
      { elements: [triangle(50, 50, 70, 90), arrow(50, 50, 40, 90)] },
      // Option 4: Upward triangle with up arrow
      { elements: [triangle(50, 50, 80, 0), arrow(50, 50, 45, 0)] },
    ],
    correctIndex: 0,
  },

  // ============================================
  // Image 5: Inverted triangle with circle overlapping at top
  // ============================================
  {
    id: 5,
    description: 'Inverted triangle with circle at top',
    target: {
      elements: [
        circle(50, 35, 50), // Circle at top
        triangle(50, 55, 80, 180), // Large inverted triangle
      ]
    },
    options: [
      // Option 1: Upward triangle with circle at bottom
      { elements: [triangle(50, 45, 80, 0), circle(50, 65, 50)] },
      // Option 2: Right-pointing triangle with circle
      { elements: [triangle(55, 50, 65, 90), circle(35, 50, 45)] },
      // Option 3: Smaller proportions
      { elements: [circle(50, 40, 55), triangle(50, 55, 65, 180)] },
      // Option 4: CORRECT
      { elements: [circle(50, 35, 50), triangle(50, 55, 80, 180)] },
    ],
    correctIndex: 3,
  },

  // ============================================
  // Image 6: Circle with horizontal line + inverted triangle below
  // ============================================
  {
    id: 6,
    description: 'Circle with line and inverted triangle',
    target: {
      elements: [
        circle(50, 50, 80),
        rectangle(50, 30, 75, 8), // Horizontal line at top
        triangle(50, 68, 45, 180), // Inverted triangle in bottom half
      ]
    },
    options: [
      // Option 1: Triangle pointing up at top
      { elements: [circle(50, 50, 80), rectangle(50, 70, 75, 8), triangle(50, 35, 40, 0)] },
      // Option 2: Larger inverted triangle, different proportions
      { elements: [circle(50, 50, 80), rectangle(50, 25, 75, 8), triangle(50, 60, 55, 180)] },
      // Option 3: CORRECT
      { elements: [circle(50, 50, 80), rectangle(50, 30, 75, 8), triangle(50, 68, 45, 180)] },
      // Option 4: Smaller circle and shapes
      { elements: [circle(50, 50, 70), rectangle(50, 32, 60, 6), triangle(50, 65, 35, 180)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 7: Semi-circle (dome) + horizontal line + upward triangle
  // ============================================
  {
    id: 7,
    description: 'Dome with rectangle and triangle',
    target: {
      elements: [
        arc(50, 35, 75, 180), // Dome at top (arc opening down)
        rectangle(50, 55, 75, 30), // Rectangle bar
        triangle(50, 65, 60, 0), // Upward triangle
      ]
    },
    options: [
      // Option 1: Smaller dome and triangle
      { elements: [arc(50, 40, 60, 180), rectangle(50, 60, 60, 25), triangle(50, 70, 40, 0)] },
      // Option 2: CORRECT
      { elements: [arc(50, 35, 75, 180), rectangle(50, 55, 75, 30), triangle(50, 65, 60, 0)] },
      // Option 3: Inverted triangle
      { elements: [arc(50, 35, 75, 180), rectangle(50, 55, 75, 30), triangle(50, 65, 60, 180)] },
      // Option 4: Dome at bottom
      { elements: [arc(50, 75, 75, 0), rectangle(50, 45, 75, 30), triangle(50, 35, 50, 180)] },
    ],
    correctIndex: 1,
  },

  // ============================================
  // Image 8: Pentagon with upward triangle + arc (frown) inside
  // ============================================
  {
    id: 8,
    description: 'Pentagon with triangle and arc',
    target: {
      elements: [
        pentagon(50, 50, 85),
        arc(50, 40, 45, 0), // Arc (frown) in upper area
        triangle(50, 65, 45, 0), // Upward triangle below
      ]
    },
    options: [
      // Option 1: Arc and triangle flipped
      { elements: [pentagon(50, 50, 85), arc(50, 65, 45, 180), triangle(50, 35, 45, 180)] },
      // Option 2: Triangle outer shape instead of pentagon
      { elements: [triangle(50, 50, 85, 0), arc(50, 40, 40, 0), triangle(50, 65, 30, 0)] },
      // Option 3: CORRECT
      { elements: [pentagon(50, 50, 85), arc(50, 40, 45, 0), triangle(50, 65, 45, 0)] },
      // Option 4: Smaller, arc opening down
      { elements: [pentagon(50, 50, 75), arc(50, 60, 40, 180), triangle(50, 40, 40, 0)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 9: Pentagon with diamond (rotated square) + circle inside
  // ============================================
  {
    id: 9,
    description: 'Pentagon with diamond and circle',
    target: {
      elements: [
        pentagon(50, 50, 85),
        diamond(50, 50, 55), // Rotated square (diamond)
        circle(50, 50, 25), // Small circle in center
      ]
    },
    options: [
      // Option 1: Square not rotated
      { elements: [pentagon(50, 50, 85), rectangle(50, 50, 50, 50), circle(50, 50, 25)] },
      // Option 2: Large outer circle instead of pentagon
      { elements: [circle(50, 50, 85), diamond(50, 50, 55), pentagon(50, 50, 35)] },
      // Option 3: CORRECT
      { elements: [pentagon(50, 50, 85), diamond(50, 50, 55), circle(50, 50, 25)] },
      // Option 4: Pentagon rotated differently
      { elements: [pentagon(50, 50, 80), diamond(50, 50, 50), circle(50, 50, 22)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 10: Octagon with 4-way arrows + circle center
  // ============================================
  {
    id: 10,
    description: 'Octagon with cross arrows',
    target: {
      elements: [
        octagon(50, 50, 85),
        circle(50, 50, 25),
        arrow(50, 22, 18, 0), // Up arrow
        arrow(50, 78, 18, 180), // Down arrow
        arrow(22, 50, 18, 270), // Left arrow
        arrow(78, 50, 18, 90), // Right arrow
      ]
    },
    options: [
      // Option 1: Diagonal arrows
      { elements: [octagon(50, 50, 85), circle(50, 50, 25), arrow(30, 30, 18, 315), arrow(70, 70, 18, 135), arrow(30, 70, 18, 225), arrow(70, 30, 18, 45)] },
      // Option 2: Heptagon (7 sides) - different polygon
      { elements: [octagon(50, 50, 75), circle(50, 50, 22), arrow(50, 22, 18, 0), arrow(50, 78, 18, 180), arrow(22, 50, 18, 270), arrow(78, 50, 18, 90)] },
      // Option 3: CORRECT
      { elements: [octagon(50, 50, 85), circle(50, 50, 25), arrow(50, 22, 18, 0), arrow(50, 78, 18, 180), arrow(22, 50, 18, 270), arrow(78, 50, 18, 90)] },
      // Option 4: Circle instead of octagon
      { elements: [circle(50, 50, 85), circle(50, 50, 25), arrow(50, 22, 18, 0), arrow(50, 78, 18, 180), arrow(22, 50, 18, 270), arrow(78, 50, 18, 90)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 11: Star of David + rectangle + small center circle
  // ============================================
  {
    id: 11,
    description: 'Star of David with rectangle and circle',
    target: {
      elements: [
        triangle(50, 38, 70, 0), // Upward triangle
        triangle(50, 62, 70, 180), // Downward triangle
        rectangle(50, 50, 80, 30), // Horizontal rectangle
        circle(50, 50, 20), // Small center circle
      ]
    },
    options: [
      // Option 1: Rectangle positioned lower
      { elements: [triangle(50, 38, 70, 0), triangle(50, 62, 70, 180), rectangle(50, 65, 70, 25), circle(50, 50, 18)] },
      // Option 2: Extra enclosing circle
      { elements: [circle(50, 50, 90), triangle(50, 38, 65, 0), triangle(50, 62, 65, 180), rectangle(50, 50, 75, 28), circle(50, 50, 18)] },
      // Option 3: CORRECT
      { elements: [triangle(50, 38, 70, 0), triangle(50, 62, 70, 180), rectangle(50, 50, 80, 30), circle(50, 50, 20)] },
      // Option 4: Larger center circle
      { elements: [triangle(50, 38, 70, 0), triangle(50, 62, 70, 180), rectangle(50, 50, 80, 30), circle(50, 50, 32)] },
    ],
    correctIndex: 2,
  },

  // ============================================
  // Image 12: Square + triangle inside + arc + small circle
  // ============================================
  {
    id: 12,
    description: 'Square with triangle, arc and circle',
    target: {
      elements: [
        rectangle(50, 50, 80, 80), // Square
        triangle(50, 55, 55, 0), // Upward triangle
        arc(50, 35, 55, 180), // Arc at top
        circle(50, 50, 20), // Small circle
      ]
    },
    options: [
      // Option 1: Larger arc wrapping around
      { elements: [rectangle(50, 50, 80, 80), triangle(50, 60, 50, 0), arc(50, 40, 65, 180), circle(50, 50, 18)] },
      // Option 2: CORRECT
      { elements: [rectangle(50, 50, 80, 80), triangle(50, 55, 55, 0), arc(50, 35, 55, 180), circle(50, 50, 20)] },
      // Option 3: Eye/vesica shape (two arcs)
      { elements: [rectangle(50, 50, 80, 80), triangle(50, 55, 55, 0), arc(50, 35, 55, 180), arc(50, 55, 55, 0), circle(50, 45, 18)] },
      // Option 4: Arc at bottom
      { elements: [rectangle(50, 50, 80, 80), triangle(50, 45, 50, 0), arc(50, 65, 50, 0), circle(50, 50, 18)] },
    ],
    correctIndex: 1,
  },

  // ============================================
  // Image 13: Circle + diamond + 4-way arrows
  // ============================================
  {
    id: 13,
    description: 'Circle with diamond and cross arrows',
    target: {
      elements: [
        circle(50, 50, 85),
        diamond(50, 50, 50),
        arrow(50, 25, 16, 0), // Up
        arrow(50, 75, 16, 180), // Down
        arrow(25, 50, 16, 270), // Left
        arrow(75, 50, 16, 90), // Right
      ]
    },
    options: [
      // Option 1: CORRECT
      { elements: [circle(50, 50, 85), diamond(50, 50, 50), arrow(50, 25, 16, 0), arrow(50, 75, 16, 180), arrow(25, 50, 16, 270), arrow(75, 50, 16, 90)] },
      // Option 2: Square instead of diamond, diagonal arrows
      { elements: [circle(50, 50, 85), rectangle(50, 50, 45, 45), arrow(30, 30, 16, 315), arrow(70, 70, 16, 135), arrow(30, 70, 16, 225), arrow(70, 30, 16, 45)] },
      // Option 3: Horizontal arrows only (no vertical)
      { elements: [circle(50, 50, 85), diamond(50, 50, 50), arrow(25, 50, 16, 270), arrow(75, 50, 16, 90)] },
      // Option 4: Only up arrow visible through diamond
      { elements: [circle(50, 50, 85), diamond(50, 50, 50), arrow(50, 25, 16, 0), arrow(75, 50, 16, 90)] },
    ],
    correctIndex: 0,
  },

  // ============================================
  // Image 14: Circle + overlapping diamonds + triangle at bottom
  // ============================================
  {
    id: 14,
    description: 'Circle with diamond pattern and triangle',
    target: {
      elements: [
        triangle(50, 75, 65, 0), // Triangle at bottom (pointing up)
        circle(50, 45, 70), // Circle above
        diamond(50, 45, 50), // Diamond inside circle
        diamond(50, 45, 30), // Smaller diamond inside
      ]
    },
    options: [
      // Option 1: No inner diamond
      { elements: [triangle(50, 75, 65, 0), circle(50, 45, 70), diamond(50, 45, 50)] },
      // Option 2: CORRECT
      { elements: [triangle(50, 75, 65, 0), circle(50, 45, 70), diamond(50, 45, 50), diamond(50, 45, 30)] },
      // Option 3: Different diamond sizes
      { elements: [triangle(50, 75, 65, 0), circle(50, 45, 70), diamond(50, 45, 55), diamond(50, 45, 25)] },
      // Option 4: Circle at center instead of diamonds
      { elements: [triangle(50, 75, 65, 0), circle(50, 45, 70), diamond(50, 45, 45), circle(50, 45, 20)] },
    ],
    correctIndex: 1,
  },

  // ============================================
  // Image 15: Circle + Star of David + small center circle
  // ============================================
  {
    id: 15,
    description: 'Circle with Star of David',
    target: {
      elements: [
        circle(50, 50, 85), // Large outer circle
        triangle(50, 38, 62, 0), // Upward triangle
        triangle(50, 62, 62, 180), // Downward triangle
        circle(50, 50, 18), // Small center circle
      ]
    },
    options: [
      // Option 1: Center circle offset up
      { elements: [circle(50, 50, 85), triangle(50, 38, 62, 0), triangle(50, 62, 62, 180), circle(50, 38, 18)] },
      // Option 2: Circle at bottom, triangles form different pattern
      { elements: [circle(50, 50, 85), triangle(50, 38, 62, 0), triangle(50, 62, 62, 180), circle(50, 68, 20)] },
      // Option 3: Larger center circle
      { elements: [circle(50, 50, 85), triangle(50, 38, 62, 0), triangle(50, 62, 62, 180), circle(50, 50, 35)] },
      // Option 4: CORRECT
      { elements: [circle(50, 50, 85), triangle(50, 38, 62, 0), triangle(50, 62, 62, 180), circle(50, 50, 18)] },
    ],
    correctIndex: 3,
  },
];

export function getVisualDiscriminationPairsConfig(level: number): VisualDiscriminationPairsConfig {
  const index = Math.max(0, Math.min(level - 1, VISUAL_DISCRIMINATION_PAIRS_CONFIGS.length - 1));
  return VISUAL_DISCRIMINATION_PAIRS_CONFIGS[index];
}
