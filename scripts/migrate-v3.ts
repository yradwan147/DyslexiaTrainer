/**
 * Migration script: v2.0.0 → v3.0.0
 * Adds: session_templates, session_template_exercises tables
 * Adds: sessions_per_day column to studies
 * Migrates: existing study_exercises into session_templates
 *
 * Usage: npx tsx scripts/migrate-v3.ts
 */

import Database from 'better-sqlite3';

const DB_PATH = process.env.DATABASE_PATH || './data/database.sqlite';

function migrate() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('[Migration] Starting v3.0.0 migration...');

  const transaction = db.transaction(() => {
    // 1. Add sessions_per_day column to studies if not exists
    const studyCols = db.prepare("PRAGMA table_info(studies)").all() as { name: string }[];
    if (!studyCols.some(c => c.name === 'sessions_per_day')) {
      db.exec(`ALTER TABLE studies ADD COLUMN sessions_per_day INTEGER DEFAULT 1;`);
      console.log('[Migration] sessions_per_day column added to studies');
    } else {
      console.log('[Migration] sessions_per_day column already exists');
    }

    // 2. Create session_templates table
    db.exec(`
      CREATE TABLE IF NOT EXISTS session_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_id INTEGER NOT NULL,
        template_number INTEGER NOT NULL,
        label TEXT,
        UNIQUE(study_id, template_number),
        FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] session_templates table created');

    // 3. Create session_template_exercises table
    db.exec(`
      CREATE TABLE IF NOT EXISTS session_template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        exercise_version TEXT DEFAULT '1.0.0',
        trial_count INTEGER DEFAULT 10,
        display_order INTEGER NOT NULL,
        FOREIGN KEY (template_id) REFERENCES session_templates(id) ON DELETE CASCADE
      );
    `);
    console.log('[Migration] session_template_exercises table created');

    // 4. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_session_templates_study ON session_templates(study_id);
      CREATE INDEX IF NOT EXISTS idx_session_template_exercises_template ON session_template_exercises(template_id);
    `);
    console.log('[Migration] indexes created');

    // 5. Migrate existing study_exercises into session_templates
    const studies = db.prepare('SELECT id FROM studies').all() as { id: number }[];

    for (const study of studies) {
      // Check if template already exists for this study
      const existingTemplate = db.prepare(
        'SELECT id FROM session_templates WHERE study_id = ? AND template_number = 1'
      ).get(study.id) as { id: number } | undefined;

      if (existingTemplate) {
        console.log(`[Migration] Template already exists for study ${study.id}, skipping`);
        continue;
      }

      // Create default template
      const result = db.prepare(`
        INSERT INTO session_templates (study_id, template_number, label)
        VALUES (?, 1, 'Default')
      `).run(study.id);

      const templateId = result.lastInsertRowid;

      // Copy study_exercises into session_template_exercises
      const exercises = db.prepare(
        'SELECT exercise_id, exercise_version, trial_count, display_order FROM study_exercises WHERE study_id = ? ORDER BY display_order'
      ).all(study.id) as { exercise_id: string; exercise_version: string; trial_count: number; display_order: number }[];

      const insertExercise = db.prepare(`
        INSERT INTO session_template_exercises (template_id, exercise_id, exercise_version, trial_count, display_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const ex of exercises) {
        insertExercise.run(templateId, ex.exercise_id, ex.exercise_version, ex.trial_count, ex.display_order);
      }

      console.log(`[Migration] Created template for study ${study.id} with ${exercises.length} exercises`);
    }
  });

  try {
    transaction();
    console.log('[Migration] v3.0.0 migration completed successfully!');
  } catch (error) {
    console.error('[Migration] Error:', error);
    process.exit(1);
  }

  db.close();
}

migrate();
