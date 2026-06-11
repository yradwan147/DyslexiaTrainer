import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DATABASE_PATH || './data/database.sqlite';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection (singleton)
let db: Database.Database | null = null;
let initialized = false;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Auto-initialize on first access
    if (!initialized) {
      initializeDatabase();
      seedDemoData();
      initialized = true;
    }
  }
  return db;
}

// Initialize database with schema
export function initializeDatabase(): void {
  if (!db) return;
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    // Execute each statement independently so that one failing object (e.g. an index
    // on a column an older DB hasn't gained yet) does NOT abort the rest of the schema
    // — critically, the column migrations below must always run. Strip full-line
    // comments first so leading "-- ..." lines don't get split off as their own chunks.
    const statements = schema
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    let failures = 0;
    for (const stmt of statements) {
      try {
        db.exec(stmt);
      } catch (err) {
        failures++;
        console.warn('[DB] Schema statement skipped:', (err as Error).message);
      }
    }
    console.log(`[DB] Schema initialized (${statements.length - failures}/${statements.length} statements)`);
  }

  // Migrations for new columns (safe to re-run; ALTER throws if column already exists)
  const migrations: [string, string][] = [
    ['sessions_per_week', 'ALTER TABLE studies ADD COLUMN sessions_per_week INTEGER DEFAULT NULL'],
    ['min_days_between_sessions', 'ALTER TABLE studies ADD COLUMN min_days_between_sessions INTEGER DEFAULT NULL'],
    ['template_exercise_level', 'ALTER TABLE session_template_exercises ADD COLUMN difficulty_level INTEGER DEFAULT 1'],
    ['exercise_runs_session_id', 'ALTER TABLE exercise_runs ADD COLUMN session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL'],
  ];
  for (const [name, sql] of migrations) {
    try {
      db.exec(sql);
      console.log(`[DB] Migration applied: ${name}`);
    } catch {
      // Column already exists — expected on subsequent runs
    }
  }
}

// Seed demo data if it doesn't exist
function seedDemoData(): void {
  if (!db) return;
  
  try {
    // Check if admin user exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@research.edu');
    
    if (!existingAdmin) {
      // Create default admin user
      const passwordHash = bcrypt.hashSync('admin123', 10);
      db.prepare(`
        INSERT INTO users (email, password_hash, role, first_name)
        VALUES (?, ?, 'admin', 'Admin')
      `).run('admin@research.edu', passwordHash);
      console.log('[DB] Default admin created: admin@research.edu / admin123');
    }
    
    // Check if demo study exists
    const existingStudy = db.prepare('SELECT id FROM studies WHERE name = ?').get('Demo Study');
    
    if (!existingStudy) {
      // Create demo study
      const result = db.prepare(`
        INSERT INTO studies (name, description, target_sessions, session_duration_minutes)
        VALUES (?, ?, ?, ?)
      `).run('Demo Study', 'A demonstration study for testing the platform', 15, 30);
      
      const studyId = result.lastInsertRowid;
      
      // Add exercises to demo study
      const exercises = [
        { id: 'coherent_motion', version: '1.0.0', difficulty: 1, trials: 20, order: 1 },
        { id: 'visual_search', version: '1.0.0', difficulty: 1, trials: 10, order: 2 },
        { id: 'line_tracking', version: '1.0.0', difficulty: 1, trials: 5, order: 3 },
        { id: 'maze_tracking', version: '1.0.0', difficulty: 1, trials: 3, order: 4 },
        { id: 'dynamic_football', version: '1.0.0', difficulty: 1, trials: 10, order: 5 },
        { id: 'dynamic_tennis', version: '1.0.0', difficulty: 1, trials: 10, order: 6 },
        { id: 'visual_saccades', version: '1.0.0', difficulty: 1, trials: 20, order: 7 },
        { id: 'visual_memory', version: '1.0.0', difficulty: 1, trials: 10, order: 8 },
        { id: 'pair_search', version: '1.0.0', difficulty: 1, trials: 1, order: 9 },
      ];
      
      const insertExercise = db.prepare(`
        INSERT INTO study_exercises (study_id, exercise_id, exercise_version, difficulty_level, trial_count, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const ex of exercises) {
        insertExercise.run(studyId, ex.id, ex.version, ex.difficulty, ex.trials, ex.order);
      }

      // Also create a session template (v3 schema)
      const templateResult = db.prepare(`
        INSERT OR IGNORE INTO session_templates (study_id, template_number, label)
        VALUES (?, 1, 'Default')
      `).run(studyId);

      if (templateResult.changes > 0) {
        const templateId = templateResult.lastInsertRowid;
        const insertTemplateEx = db.prepare(`
          INSERT INTO session_template_exercises (template_id, exercise_id, exercise_version, trial_count, display_order)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const ex of exercises) {
          insertTemplateEx.run(templateId, ex.id, ex.version, ex.trials, ex.order);
        }
      }

      console.log('[DB] Demo study created with all exercises');
    }
    
    // Create demo child user
    const existingChild = db.prepare('SELECT id FROM users WHERE child_code = ?').get('DEMO01');
    
    if (!existingChild) {
      const childPasswordHash = bcrypt.hashSync('1234', 10);
      const childResult = db.prepare(`
        INSERT INTO users (child_code, password_hash, role, first_name, age)
        VALUES (?, ?, 'child', 'Demo Child', 12)
      `).run('DEMO01', childPasswordHash);
      
      const childUserId = childResult.lastInsertRowid;
      const demoStudy = db.prepare('SELECT id FROM studies WHERE name = ?').get('Demo Study') as { id: number } | undefined;
      
      if (demoStudy) {
        // Assign child to demo study
        db.prepare(`
          INSERT INTO participants (user_id, study_id, group_name)
          VALUES (?, ?, 'training')
        `).run(childUserId, demoStudy.id);
      }
      
      console.log('[DB] Demo child created: DEMO01 / 1234');
    }
  } catch (error) {
    console.error('[DB] Error seeding data:', error);
  }
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
  sessions_per_day: number;
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
  user_id: number;
  session_id: number | null;
  exercise_id: string;
  exercise_version: string;
  difficulty_level: number;
  started_at: string | null;
  ended_at: string | null;
  total_trials: number | null;
  correct_count: number | null;
  avg_reaction_time_ms: number | null;
}

export interface ExerciseProgress {
  id: number;
  user_id: number;
  study_id: number;
  exercise_id: string;
  current_level: number;
  total_sessions_completed: number;
  last_completed_at: string | null;
}

export interface ExerciseRunMetric {
  id: number;
  exercise_run_id: number;
  metric_key: string;
  metric_value: number;
}

export interface TransitionRuleRecord {
  id: number;
  study_id: number;
  exercise_id: string;
  advance_threshold: number;
  regress_threshold: number;
  min_trials_required: number;
  max_level: number;
}

export interface SessionTemplate {
  id: number;
  study_id: number;
  template_number: number;
  label: string | null;
}

export interface SessionTemplateExercise {
  id: number;
  template_id: number;
  exercise_id: string;
  exercise_version: string;
  trial_count: number;
  difficulty_level: number;
  display_order: number;
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

