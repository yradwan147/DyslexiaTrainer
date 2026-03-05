/**
 * Migration script: v1.x → v2.0.0
 * Adds: sessions, exercise_progress, exercise_run_metrics tables
 * Adds: session_id column to exercise_runs
 *
 * Usage: npx tsx scripts/migrate-v2.ts
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/database.sqlite';

function migrate() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('[Migration] Starting v2.0.0 migration...');

  // Wrap everything in a transaction
  const transaction = db.transaction(() => {
    // 1. Create sessions table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER NOT NULL,
        session_number INTEGER NOT NULL,
        started_at DATETIME,
        ended_at DATETIME,
        status TEXT DEFAULT 'pending',
        device_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] sessions table created');

    // 2. Add session_id column to exercise_runs if it doesn't exist
    const columns = db.prepare("PRAGMA table_info(exercise_runs)").all() as { name: string }[];
    const hasSessionId = columns.some(c => c.name === 'session_id');
    if (!hasSessionId) {
      db.exec(`ALTER TABLE exercise_runs ADD COLUMN session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL;`);
      console.log('[Migration] session_id column added to exercise_runs');
    } else {
      console.log('[Migration] session_id column already exists in exercise_runs');
    }

    // 3. Create exercise_progress table
    db.exec(`
      CREATE TABLE IF NOT EXISTS exercise_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        study_id INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        current_level INTEGER DEFAULT 1,
        total_sessions_completed INTEGER DEFAULT 0,
        last_completed_at DATETIME,
        UNIQUE(user_id, study_id, exercise_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] exercise_progress table created');

    // 4. Create exercise_run_metrics table
    db.exec(`
      CREATE TABLE IF NOT EXISTS exercise_run_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_run_id INTEGER NOT NULL,
        metric_key TEXT NOT NULL,
        metric_value REAL NOT NULL,
        UNIQUE(exercise_run_id, metric_key),
        FOREIGN KEY (exercise_run_id) REFERENCES exercise_runs(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] exercise_run_metrics table created');

    // 5. Create transition_rules table
    db.exec(`
      CREATE TABLE IF NOT EXISTS transition_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_id INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        advance_threshold REAL DEFAULT 0.8,
        regress_threshold REAL DEFAULT 0.5,
        min_trials_required INTEGER DEFAULT 5,
        max_level INTEGER DEFAULT 15,
        UNIQUE(study_id, exercise_id),
        FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] transition_rules table created');

    // 6. Create new indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_participant ON sessions(participant_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
      CREATE INDEX IF NOT EXISTS idx_exercise_runs_session ON exercise_runs(session_id);
      CREATE INDEX IF NOT EXISTS idx_exercise_progress_user ON exercise_progress(user_id, study_id);
      CREATE INDEX IF NOT EXISTS idx_exercise_run_metrics_run ON exercise_run_metrics(exercise_run_id);
      CREATE INDEX IF NOT EXISTS idx_transition_rules_study ON transition_rules(study_id);
    `);
    console.log('[Migration] indexes created');
  });

  try {
    transaction();
    console.log('[Migration] v2.0.0 migration completed successfully!');
  } catch (error) {
    console.error('[Migration] Error:', error);
    process.exit(1);
  }

  db.close();
}

migrate();
