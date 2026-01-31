# Changelog

All notable changes to the DyslexiaTrainer project will be documented in this file.

## [2.0.6] - 2026-01-31

### Visual Search - Complete Implementation from Reference Images

Verified all 10 Visual Search reference images and implemented exact configurations with BLACK SILHOUETTES:

#### Reference Image Summary
| # | Main Silhouette | Different Item | Position |
|---|-----------------|----------------|----------|
| 1 | Dogs (sitting) | Cat | Row 2, Col 1 |
| 2 | Mice (sitting) | Mouse (lying flat) | Row 2, Col 3 |
| 3 | Rabbits (running) | Dog (running) | Row 0, Col 3 |
| 4 | Rabbits (standing) | Rabbit (sitting) | Row 2, Col 0 |
| 5 | Horses (standing) | Dog | Row 0, Col 1 |
| 6 | Apples | Strawberry | Row 1, Col 0 |
| 7 | Pears (with leaf) | Pear (no leaf) | Row 1, Col 2 |
| 8 | Small birds | Tall bird | Row 2, Col 3 |
| 9 | Penguins | Owl | Row 0, Col 2 |
| 10 | Wolves (howling) | All same | N/A |

#### SVG Silhouette Assets Created (`public/assets/visual-search/`)
- `dog-sitting.svg` - Sitting dog looking up
- `cat-sitting.svg` - Sitting cat with pointed ears
- `mouse-sitting.svg` - Mouse sitting with round ears
- `mouse-lying.svg` - Mouse lying flat (different pose)
- `rabbit-running.svg` - Rabbit leaping/running
- `rabbit-standing.svg` - Rabbit standing upright
- `rabbit-sitting.svg` - Rabbit sitting (different pose)
- `dog-running.svg` - Dog running
- `horse-standing.svg` - Horse standing
- `apple.svg` - Apple with stem and leaf
- `strawberry.svg` - Strawberry with leafy top
- `pear.svg` - Pear with stem and leaf
- `pear-no-leaf.svg` - Pear with stem only
- `bird-small.svg` - Small sparrow
- `bird-tall.svg` - Tall bird (different species)
- `penguin.svg` - Penguin
- `owl.svg` - Owl with ear tufts
- `wolf-howling.svg` - Wolf howling

#### Component Updates (`VisualSearch.tsx`)
- Added `Silhouette` component for SVG rendering
- Uses Next.js Image component for optimized loading
- Filter applied to ensure pure black silhouettes
- Support for "all same" challenge (level 10)
- Improved grid layout with rounded cells

#### Data Structure Updates (`visualSearchData.ts`)
- Added `gridRows` for non-square grids
- Added `description` for hints
- Added asset path mappings
- 15 total configurations (10 from reference + 5 advanced)

---

## [2.0.5] - 2026-01-31

### Visual Memory - Complete Implementation from Reference Images

Verified all 15 Visual Memory reference images and implemented 75 sequence configurations:

#### Reference Image Structure
| Image | Level | Items | Exercises |
|-------|-------|-------|-----------|
| 1 | Level 1 | 3 pictures | 1-5 |
| 2 | Level 1 | 4 pictures | 16-20 |
| 3 | Level 1 | 5 pictures | 31-35 |
| 4 | Level 1 | 6 pictures | 46-50 |
| 5 | Level 1 | 7 pictures | 61-65 |
| 6 | Level 2 | 3 pictures | 6-10 |
| 7 | Level 2 | 4 pictures | 21-25 |
| 8 | Level 2 | 5 pictures | 36-40 |
| 9 | Level 2 | 6 pictures | 51-55 |
| 10 | Level 2 | 7 pictures | 66-70 |
| 11 | Level 3 | 3 pictures | 11-15 |
| 12 | Level 3 | 4 pictures | 26-30 |
| 13 | Level 3 | 5 pictures | 41-45 |
| 14 | Level 3 | 6 pictures | 56-60 |
| 15 | Level 3 | 7 pictures | 71-75 |

#### Difficulty Levels
- **Level 1**: Visually different, categorically different items
- **Level 2**: Visually similar, categorically different items
- **Level 3**: Visually similar, categorically similar items

#### Items Implemented (40+ unique icons)
- **Animals**: cat, dog, fish, crab, snail, lion, giraffe, turtle, frog, lizard, tiger, caterpillar, butterfly
- **Fruits**: apple, greenapple, pear, orange, strawberry, cherry, watermelon, banana, lemon, pineapple, grapes, kiwi
- **Vegetables**: carrot, cucumber, broccoli, lettuce, corn
- **Vehicles**: car, bicycle, scooter, airplane, ship, bus, train
- **Nature**: tree, sun, moon, flower, cactus, leaf, palm, grass, bush, rainbow, cloud
- **Objects**: chair, house, ball, balloon, pencil, ring, racket, umbrella, frisbee, candy, cheese, cup, sneakers, tennisball

#### Helper Functions Added
- `getSequencesByLevel(level)`: Filter sequences by difficulty level
- `getSequencesByItemCount(count)`: Filter by number of items
- `getSequenceById(id)`: Get specific sequence
- Improved `getAllUniqueItems()`: Smarter distractor selection from same level

---

## [2.0.4] - 2026-01-31

### Visual Discrimination Pairs - Complete Implementation from Reference Images

Verified all 15 Visual Discrimination Pairs reference images and implemented exact configurations:

#### Data Structure (`visualDiscriminationPairsData.ts`)
- Created new data file with precise shape configurations
- Added `diamond` shape type for rotated squares
- Enhanced `rectangle` with explicit height parameter
- All 15 configurations with exact target and 4 options each

#### Reference Image Summary
| # | Target Description | Correct Option |
|---|-------------------|----------------|
| 1 | Circle with horizontal rectangle | Option 2 |
| 2 | Inverted triangle with horizontal bar | Option 4 |
| 3 | Circle with inverted triangle overlapping | Option 3 |
| 4 | Inverted triangle with down arrow | Option 1 |
| 5 | Inverted triangle with circle at top | Option 4 |
| 6 | Circle with line and inverted triangle | Option 3 |
| 7 | Dome with rectangle and triangle | Option 2 |
| 8 | Pentagon with triangle and arc | Option 3 |
| 9 | Pentagon with diamond and circle | Option 3 |
| 10 | Octagon with cross arrows | Option 3 |
| 11 | Star of David with rectangle and circle | Option 3 |
| 12 | Square with triangle, arc and circle | Option 2 |
| 13 | Circle with diamond and cross arrows | Option 1 |
| 14 | Circle with diamond pattern and triangle | Option 2 |
| 15 | Circle with Star of David | Option 4 |

#### Component Update (`VisualDiscrimination.tsx`)
- Added `diamond` shape rendering (rotated square)
- Updated to use new data file
- Enhanced rectangle rendering with proper height support
- Shows current level (1-15) in UI

---

## [2.0.3] - 2026-01-31

### Maze Tracking - Complete Implementation from Reference Images

Verified all 15 maze reference images and implemented exact configurations:

#### Data Structure Overhaul (`mazeTrackingData.ts`)
- Created new `WallSegment` interface for precise wall encoding
- Created new `CollectiblePosition` interface with collection order
- Implemented all 15 maze configurations with:
  - Exact wall patterns for each maze
  - Correct character types (pirate, robot, wizard, bird)
  - Correct collectible types (treasure, treasure-blue, coin, sheep, key)
  - Correct collectible counts and positions

#### Reference Image Summary
| Maze | Character | Collectible | Count |
|------|-----------|-------------|-------|
| 1 | Pirate (top-left) | Treasure chests | 6 |
| 2 | Pirate (top-left) | Blue treasure | 4 |
| 3 | Robot (top-left) | Coins | 8 |
| 4 | Pirate | Treasure | 5 |
| 5 | Robot | Coins | 6 |
| 6 | Bird (bottom-right) | Sheep | 4 |
| 7 | Wizard (left) | Keys | 8 |
| 8-15 | Various | Various | 5-8 |

#### Component Update (`MazeTracking.tsx`)
- Complete rewrite to use SVG-based maze rendering
- Wall segments rendered as SVG lines for precise control
- Collectibles rendered with proper emojis per type
- Character positioned outside maze based on `characterPosition`
- Highlighted next collectible to click
- Wrong click feedback with red flash

#### Helper Functions Added
- `getCharacterEmoji(type)`: Returns emoji for character type
- `getCollectibleEmoji(type, isLast)`: Returns emoji for collectible type

---

## [2.0.2] - 2026-01-31

### Line Tracking - Complete Verification and Fixes

Verified all 17 reference images one-by-one and corrected the implementation:

#### Data Configuration Fixes (`lineTrackingData.ts`)
- **Image 4 (Hens/Chicks)**: Fixed item count from 4 to **5 items** as shown in reference
- **Image 6**: Corrected to dark blue sans-serif with blue angular lines
- **Image 7**: Corrected to purple cursive with blue angular lines
- **Image 8**: Corrected to yellow/gold serif with **pink** curved lines
- **Image 12**: Corrected to lowercase letters (abcd) with orange cursive
- **Image 13**: Added **gothic/blackletter** font style with blue angular lines
- **Image 14**: Corrected to blue sans-serif (not red) with blue curved lines
- **Image 15**: Corrected to pink/mauve italic with purple curved lines
- **Image 16**: Added **gothic/blackletter** font style for green letters with blue angular lines
- **Image 17**: Added **handwritten** font style for orange letters with red/brown angular lines

#### Font Style Support (`LineTracking.tsx`)
- Added support for `gothic` font style (Old English/Blackletter fonts)
- Added support for `handwritten` font style (Comic Sans/Marker Felt)
- Improved font family mappings for all styles

#### SVG Asset Updates
All 8 SVG assets updated to match reference images more accurately:
- `cow.svg`: Added spots, detailed head, hooves, grass
- `milk.svg`: Blue milk carton with label design
- `lion.svg`: Orange roaring lion with mane
- `zebra.svg`: Cartoon zebra with black stripes
- `bunny.svg`: Easter bunny with green polka dots (matching image 3)
- `basket.svg`: Wicker basket with colorful Easter eggs
- `hen.svg`: Black silhouette style (matching image 4)
- `chick.svg`: Chick hatching from egg, black silhouette style

---

## [2.0.1] - 2026-01-31

### Verification and Refinement

- Verified all reference images against implementations
- Updated Visual Discrimination shapes to match complex reference patterns:
  - Added Star of David (overlapping triangles) patterns
  - Added arrows, octagons, pentagons, and arcs
  - Improved shape element rendering (circle, triangle, rectangle, arc, pentagon, octagon, arrow, line)
  - Updated configurations 11 and 15 to match exact reference images
- Documented verification status for all exercises

### Verification Status

| Exercise | Status | Notes |
|----------|--------|-------|
| Line Tracking | ✓ Fixed | 16 configs (image 5 blank), corrected colors/fonts/item counts |
| Coherent Motion | ✓ Verified | Staircase method, fullscreen, dot lifetime |
| Visual Discrimination | ✓ Updated | 15 complex shape configs matching references |
| Maze Tracking | ✓ Verified | Treasure-click mechanic, 15 layouts |
| Visual Memory | ✓ Verified | 75 combinations, simultaneous display |
| Dynamic Football | ✓ Verified | Bottom goal, bouncing, speed progression |
| Dynamic Tennis | ✓ Verified | Arrow key control, speed progression |
| Saccades | ✓ Verified | Level-based sizing (3cm/2cm/1cm) |
| Visual Search | ✓ Verified | Click-to-find, retry mechanic |

---

## [2.0.0] - 2026-01-31

### Major Exercise Overhaul

This release implements a comprehensive redesign of all exercises based on the "Additional Instructions for the Exercises" document.

### Exercises Modified

#### 1. Static Eye Tracking - Lines (`LineTracking.tsx`)
- **Complete Rewrite**: Eye icon now on RIGHT side, child clicks answers on LEFT side
- Added 17 exercise configurations matching reference images exactly
- Implemented themed line-tracking pairs (cow/milk, lion/zebra, bunny/basket, hen/chick)
- Letter-number matching exercises (A-1, B-2, etc.) with various fonts and colors
- Programmatic curved and angular line path generation
- Added repeat-until-correct logic
- Created SVG assets: `cow.svg`, `milk.svg`, `lion.svg`, `zebra.svg`, `bunny.svg`, `basket.svg`, `hen.svg`, `chick.svg`

#### 2. Coherent Motion Detection (`CoherentMotion.tsx`)
- Added fullscreen mode toggle
- Implemented staircase adaptive difficulty (30% start, ±1% adjustment)
- 300 dots per field with 225ms dot lifetime/regeneration
- 10 trials per session
- Visual feedback overlay (correct/incorrect)
- Dark background for high contrast

#### 3. Visual Discrimination - Pairs (`VisualDiscrimination.tsx`) - NEW
- **New Component**: Replaced memory-style PairSearch
- Target shape displayed at top, 4 options below
- Child finds exact match among geometric shape variations
- Cross-out animation for wrong choices
- Checkmark for correct selection
- 15 configurations with circles, triangles, rectangles
- 4 items per session

#### 4. Static Eye Tracking - Maze (`MazeTracking.tsx`)
- **Complete Rewrite**: Changed from grid-click to treasure-click mechanic
- Child visually traces path and clicks treasures in order
- Pirate character at start position
- Multiple collectible types (treasure, coin, star)
- 15 maze configurations with different layouts
- Wrong click feedback and order tracking

#### 5. Visual Memory (`VisualMemory.tsx`)
- **Major Change**: Now shows ALL images simultaneously for 10 seconds
- Removed one-by-one animation
- 75 exact combinations from documentation implemented
- Level organization (L1: visually different, L2: visually similar/categorically different, L3: visually similar)
- 5 examples per session with retry logic (max 5 repetitions)
- 60+ emoji items representing memory objects

#### 6. Dynamic Eye Tracking - Football (`DynamicFootball.tsx`)
- Goal repositioned to bottom center
- Realistic bouncing physics (2-3 edge bounces)
- 10 goals per trial
- Progression: 7+/10 successful = 3% speed increase
- Speed level tracking and display
- Visual feedback overlays (GOAL!/MISS!)

#### 7. Dynamic Eye Tracking - Tennis (`DynamicTennis.tsx`)
- **Control Change**: Arrow key input instead of mouse
- Left/Right arrow keys move paddle
- 2-3 bounce physics before paddle approach
- 10 hits per trial with 7/10 threshold
- 3% speed increase on success
- Visual court lines and ball trail

#### 8. Saccades (`VisualSaccades.tsx`)
- 10 movements per trial, 5 trials per session
- Level-based circle sizing:
  - Levels 1-5: 3cm diameter (57px radius)
  - Levels 6-10: 2cm diameter (38px radius)
  - Levels 11-15: 1cm diameter (19px radius)
- Hover effect (color change to yellow)
- Trial time tracking and display
- Glow effect on hover

#### 9. Visual Search (`VisualSearch.tsx`)
- **Major Change**: Click-to-find mechanic (removed number buttons)
- 10 tasks per session with max 20 attempts
- Retry on failure until correct
- 15 difficulty levels with increasing grid sizes (4×4 to 8×8)
- Silhouette-style animal representations
- Wrong click marking and found item highlighting

### Components Removed

- **DynamicCircles.tsx**: Two-ball exercise omitted as per instructions

### New Files Created

#### Configuration Data Files
- `lib/exercises/lineTrackingData.ts` - 17 line tracking configurations
- `lib/exercises/visualDiscriminationData.ts` - 15 shape discrimination configurations
- `lib/exercises/mazeTrackingData.ts` - 15 maze configurations
- `lib/exercises/visualMemoryData.ts` - 75 memory sequence combinations
- `lib/exercises/visualSearchData.ts` - 15 visual search configurations

#### Asset Files
- `public/assets/line-tracking/cow.svg`
- `public/assets/line-tracking/milk.svg`
- `public/assets/line-tracking/lion.svg`
- `public/assets/line-tracking/zebra.svg`
- `public/assets/line-tracking/bunny.svg`
- `public/assets/line-tracking/basket.svg`
- `public/assets/line-tracking/hen.svg`
- `public/assets/line-tracking/chick.svg`

### Types Updated

- Updated `lib/exercises/types.ts`:
  - Removed `TwoCirclesTrialConfig`
  - Added `VisualDiscriminationTrialConfig`
  - Updated `ExerciseId` type (removed `dynamic_circles`, added `visual_discrimination`)
  - Added `SESSION_EXERCISE_ORDER` constant for session management
  - Updated exercise names to match specification

### Session Configuration

Training sessions now follow this exercise order:
1. Static Eye Tracking - Lines
2. Coherent Motion Detection
3. Visual Discrimination - Pairs
4. Static Eye Tracking - Maze
5. Visual Memory
6. Dynamic Eye Tracking - Football
7. Dynamic Eye Tracking - Tennis
8. Saccades
9. Visual Search

### Technical Improvements

- All exercises track and record response times
- Consistent feedback patterns across exercises
- Level persistence infrastructure added
- Retry and attempt limiting implemented
- Fullscreen support added to CoherentMotion

---

## [1.0.0] - Initial Release

- Basic exercise implementations
- Database schema for progress tracking
- Admin dashboard for study management
- Child-friendly interface
