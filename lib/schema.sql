-- Visual Training Platform Database Schema
-- Version: 1.1.0 (simplified - no sessions)

-- Users table (children + researchers)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_code TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('child', 'researcher', 'admin')),
  first_name TEXT,
  age INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Studies (for researcher organization)
CREATE TABLE IF NOT EXISTS studies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  target_sessions INTEGER DEFAULT 15,
  session_duration_minutes INTEGER DEFAULT 30,
  is_locked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Study exercise configuration
CREATE TABLE IF NOT EXISTS study_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_version TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  trial_count INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Participant assignment to studies
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  study_id INTEGER NOT NULL,
  group_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, study_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Exercise runs (direct user activity - no session required)
CREATE TABLE IF NOT EXISTS exercise_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_version TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  started_at DATETIME,
  ended_at DATETIME,
  total_trials INTEGER,
  correct_count INTEGER,
  avg_reaction_time_ms REAL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Individual trial logs
CREATE TABLE IF NOT EXISTS trials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_run_id INTEGER NOT NULL,
  trial_index INTEGER NOT NULL,
  trial_config TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_response TEXT,
  response_time_ms INTEGER,
  is_correct INTEGER,
  is_timed_out INTEGER DEFAULT 0,
  is_skipped INTEGER DEFAULT 0,
  started_at DATETIME,
  responded_at DATETIME,
  FOREIGN KEY (exercise_run_id) REFERENCES exercise_runs(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_child_code ON users(child_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_study ON participants(study_id);
CREATE INDEX IF NOT EXISTS idx_exercise_runs_user ON exercise_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_runs_started ON exercise_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_trials_exercise_run ON trials(exercise_run_id);
