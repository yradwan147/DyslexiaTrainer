import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/database.sqlite';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection (singleton)
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Initialize database with schema
export function initializeDatabase(): void {
  const database = getDb();
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  database.exec(schema);
}

// Helper types
export interface User {
  id: number;
  child_code: string | null;
  email: string | null;
  password_hash: string;
  role: 'child' | 'researcher' | 'admin';
  first_name: string | null;
  age: number | null;
  created_at: string;
}

export interface Study {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  target_sessions: number;
  session_duration_minutes: number;
  is_locked: number;
  created_at: string;
}

export interface StudyExercise {
  id: number;
  study_id: number;
  exercise_id: string;
  exercise_version: string;
  difficulty_level: number;
  trial_count: number;
  display_order: number;
}

export interface Participant {
  id: number;
  user_id: number;
  study_id: number;
  group_name: string | null;
  created_at: string;
}

export interface Session {
  id: number;
  participant_id: number;
  session_number: number;
  started_at: string | null;
  ended_at: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'incomplete';
  device_info: string | null;
  created_at: string;
}

export interface ExerciseRun {
  id: number;
  session_id: number;
  exercise_id: string;
  exercise_version: string;
  difficulty_level: number;
  display_order: number;
  started_at: string | null;
  ended_at: string | null;
  total_trials: number | null;
  correct_count: number | null;
  avg_reaction_time_ms: number | null;
}

export interface Trial {
  id: number;
  exercise_run_id: number;
  trial_index: number;
  trial_config: string;
  correct_answer: string;
  user_response: string | null;
  response_time_ms: number | null;
  is_correct: number | null;
  is_timed_out: number;
  is_skipped: number;
  started_at: string | null;
  responded_at: string | null;
}

