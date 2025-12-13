# Visual Processing Training Platform

A web-based visual processing training platform designed for 12-year-old children, supporting research on the connection between visual processing and reading.

## Features

- **7 Visual Processing Exercises**
  - Coherent Motion Detection
  - Visual Search
  - Line Tracking
  - Maze Tracking
  - Dynamic Eye Tracking (Football, Tennis, Two Circles)
  - Visual Saccades
  - Visual Memory
  - Pair Search

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
│   └── ui/                # Reusable UI components
├── lib/
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Authentication config
│   └── exercises/         # Exercise configs & types
├── scripts/
│   └── init-db.ts         # Database initialization
└── data/                  # SQLite database (gitignored)
```

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

**Note:** The database auto-initializes with demo users on first run. Demo credentials work immediately after deployment:
- Child: `DEMO01` / `1234`
- Admin: `admin@research.edu` / `admin123`

### Other Deployment Platforms

Compatible with:
- Vercel (requires external database)
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

## License

MIT

