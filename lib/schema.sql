-- Visual Training Platform Database Schema
-- Version: 2.0.0 (with sessions, exercise progress, and metrics)

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
  sessions_per_day INTEGER DEFAULT 1,
  sessions_per_week INTEGER DEFAULT NULL,
  min_days_between_sessions INTEGER DEFAULT NULL,
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

-- Training sessions (one per visit/day)
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

-- Exercise runs (each exercise attempt within a session)
CREATE TABLE IF NOT EXISTS exercise_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id INTEGER,
  exercise_id TEXT NOT NULL,
  exercise_version TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  started_at DATETIME,
  ended_at DATETIME,
  total_trials INTEGER,
  correct_count INTEGER,
  avg_reaction_time_ms REAL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
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

-- Server-side exercise progress (replaces localStorage level tracking)
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

-- Exercise-specific aggregate metrics per run (key-value store)
CREATE TABLE IF NOT EXISTS exercise_run_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_run_id INTEGER NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value REAL NOT NULL,
  UNIQUE(exercise_run_id, metric_key),
  FOREIGN KEY (exercise_run_id) REFERENCES exercise_runs(id) ON DELETE CASCADE
);

-- Transition rules: configurable per study/exercise
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

-- Session templates (configurable exercise sets per study)
CREATE TABLE IF NOT EXISTS session_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  study_id INTEGER NOT NULL,
  template_number INTEGER NOT NULL,
  label TEXT,
  UNIQUE(study_id, template_number),
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Exercises within a session template
CREATE TABLE IF NOT EXISTS session_template_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_version TEXT DEFAULT '1.0.0',
  trial_count INTEGER DEFAULT 10,
  display_order INTEGER NOT NULL,
  FOREIGN KEY (template_id) REFERENCES session_templates(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_child_code ON users(child_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_study ON participants(study_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participant ON sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_exercise_runs_user ON exercise_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_runs_session ON exercise_runs(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_runs_started ON exercise_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_trials_exercise_run ON trials(exercise_run_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_user ON exercise_progress(user_id, study_id);
CREATE INDEX IF NOT EXISTS idx_exercise_run_metrics_run ON exercise_run_metrics(exercise_run_id);
CREATE INDEX IF NOT EXISTS idx_transition_rules_study ON transition_rules(study_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_study ON session_templates(study_id);
CREATE INDEX IF NOT EXISTS idx_session_template_exercises_template ON session_template_exercises(template_id);
