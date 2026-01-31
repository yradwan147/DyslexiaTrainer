# Visual Processing Training Platform

A web-based visual processing training platform designed for 12-year-old children, supporting research on the connection between visual processing and reading.

## Features

- **9 Visual Processing Exercises** (in session order)
  1. **Static Eye Tracking - Lines**: Follow tangled lines to match pairs (cow→milk, letters→numbers)
  2. **Coherent Motion Detection**: Identify which side has coherently moving dots (staircase difficulty)
  3. **Visual Discrimination - Pairs**: Find the exact matching geometric shape among variants
  4. **Static Eye Tracking - Maze**: Trace maze path and click treasures in order
  5. **Visual Memory**: Remember sequences of images shown simultaneously for 10 seconds
  6. **Dynamic Eye Tracking - Football**: Click when bouncing ball enters the goal
  7. **Dynamic Eye Tracking - Tennis**: Use arrow keys to catch bouncing ball with paddle
  8. **Saccades**: Click circles as they appear at random positions
  9. **Visual Search**: Find different silhouettes hidden among identical ones

- **Research-Grade Data Collection**
  - Deterministic, reproducible stimuli
  - Trial-level logging with precise timing
  - CSV/JSON data export

- **Child-Friendly Interface**
  - Large buttons and clear visuals
  - Positive feedback and gamification
  - Simple navigation

- **Researcher Admin Panel**
  - Study configuration
  - Participant management
  - Progress monitoring
  - Data export

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Initialize the database (creates demo users)
npm run db:init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

**Child Login:**
- Code: `DEMO01`
- PIN: `1234`

**Admin Login:**
- Email: `admin@research.edu`
- Password: `admin123`

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login pages
│   ├── (child)/           # Child dashboard & sessions
│   ├── (admin)/           # Researcher admin panel
│   └── api/               # API routes
├── components/
│   ├── exercises/         # Exercise components
│   │   ├── LineTracking.tsx
│   │   ├── CoherentMotion.tsx
│   │   ├── VisualDiscrimination.tsx
│   │   ├── MazeTracking.tsx
│   │   ├── VisualMemory.tsx
│   │   ├── DynamicFootball.tsx
│   │   ├── DynamicTennis.tsx
│   │   ├── VisualSaccades.tsx
│   │   └── VisualSearch.tsx
│   └── ui/                # Reusable UI components
├── lib/
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Authentication config
│   └── exercises/         # Exercise configs & types
│       ├── types.ts
│       ├── lineTrackingData.ts
│       ├── visualDiscriminationData.ts
│       ├── visualDiscriminationPairsData.ts
│       ├── mazeTrackingData.ts
│       ├── visualMemoryData.ts
│       └── visualSearchData.ts
├── public/
│   └── assets/            # Exercise assets
│       ├── line-tracking/ # SVG icons for line tracking (8 files)
│       └── visual-search/ # Black silhouette SVGs (18 files)
├── scripts/
│   └── init-db.ts         # Database initialization
└── data/                  # SQLite database (gitignored)
```

## Exercise Details

### Static Eye Tracking - Lines
- 17 configurations matching reference images
- Themed pairs: cow/milk, lion/zebra, bunny/basket, hen/chick
- Letter-number matching with various fonts
- Eye icon on right, click answer on left

### Coherent Motion Detection
- Fullscreen mode support
- Staircase method: starts at 30%, adjusts ±1%
- 300 dots per field, 225ms lifetime
- 10 trials per session

### Visual Discrimination
- 15 geometric shape configurations
- Target at top, 4 options below
- Wrong options crossed out
- 4 items per session

### Maze Tracking
- 15 maze layouts
- Click treasures in correct order along path
- Multiple collectible types

### Visual Memory
- 75 exact combinations from documentation
- All images shown simultaneously for 10 seconds
- 3 difficulty levels (visually different → similar)
- 5 examples per session, max 5 retries

### Dynamic Football
- Goal at bottom center
- 2-3 edge bounces before goal
- 10 goals per trial
- 7/10 threshold for 3% speed increase

### Dynamic Tennis
- Arrow key paddle control
- 2-3 bounces before approaching paddle
- Speed increases with success

### Saccades
- 10 movements × 5 trials per session
- Circle size decreases with level:
  - Levels 1-5: 3cm diameter
  - Levels 6-10: 2cm diameter
  - Levels 11-15: 1cm diameter

### Visual Search
- 10 configurations from reference images (15 total with advanced levels)
- BLACK SILHOUETTES: All animals/objects rendered as pure black silhouettes
- 18 custom SVG assets (dogs, cats, mice, rabbits, horses, birds, penguins, owls, wolves, fruits)
- Click to find the different item among identical silhouettes
- Grid sizes from 4×4 to 6×6
- Includes "all same" challenge (level 10)
- Max 20 attempts per session

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local` for local development:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_PATH=./data/database.sqlite
```

### Railway Deployment

1. **Connect your repo** to Railway
2. **Set environment variables** in Railway dashboard:
   ```
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=generate-a-secure-random-string
   ```
3. **Add a volume** (optional but recommended for persistent data):
   - Mount path: `/app/data`
   - Set env: `DATABASE_PATH=/app/data/database.sqlite`

**Note:** The database auto-initializes with demo users on first run.

### Other Deployment Platforms

Compatible with:
- Railway ✓
- Render
- DigitalOcean App Platform
- Any Node.js host with persistent storage

## Database

Uses SQLite for simplicity. Key tables:
- `users` - Children and researchers
- `studies` - Research study definitions
- `participants` - Study enrollment
- `sessions` - Training sessions
- `exercise_runs` - Exercise attempts
- `trials` - Individual trial data

## API Endpoints

- `POST /api/sessions` - Create/manage sessions
- `POST /api/exercise-runs` - Log exercise runs
- `POST /api/trials` - Log individual trials
- `GET /api/export` - Export data (CSV/JSON)
- `GET/POST /api/studies` - Manage studies
- `GET/POST /api/participants` - Manage participants

## Research Features

### Deterministic Stimuli
All exercises use seeded pseudo-random number generators to ensure reproducibility. The same exercise at the same difficulty level produces identical stimuli for all participants.

### Adaptive Difficulty
Several exercises implement adaptive difficulty:
- Coherent Motion: Staircase method
- Football/Tennis: Speed increases with success
- Saccades: Circle size decreases with level

### Data Logging
Each trial logs:
- Stimulus configuration
- Correct answer
- User response
- Response time (ms)
- Accuracy flags
- Timestamps

### Versioning
Exercise configurations are versioned to ensure data integrity across study phases.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes.

## License

MIT
