import { getDb, initializeDatabase } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Initializing database...');
  
  // Initialize schema
  initializeDatabase();
  console.log('Schema created.');
  
  const db = getDb();
  
  // Check if admin user exists
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@research.edu');
  
  if (!existingAdmin) {
    // Create default admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, role, first_name)
      VALUES (?, ?, 'admin', 'Admin')
    `).run('admin@research.edu', passwordHash);
    console.log('Default admin user created: admin@research.edu / admin123');
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
    
    console.log('Demo study created with all exercises.');
  }
  
  // Create demo child user
  const existingChild = db.prepare('SELECT id FROM users WHERE child_code = ?').get('DEMO01');
  
  if (!existingChild) {
    const childPasswordHash = await bcrypt.hash('1234', 10);
    const childResult = db.prepare(`
      INSERT INTO users (child_code, password_hash, role, first_name, age)
      VALUES (?, ?, 'child', 'Demo Child', 12)
    `).run('DEMO01', childPasswordHash);
    
    const childUserId = childResult.lastInsertRowid;
    const demoStudy = db.prepare('SELECT id FROM studies WHERE name = ?').get('Demo Study') as { id: number };
    
    // Assign child to demo study
    db.prepare(`
      INSERT INTO participants (user_id, study_id, group_name)
      VALUES (?, ?, 'training')
    `).run(childUserId, demoStudy.id);
    
    console.log('Demo child user created: DEMO01 / 1234');
  }
  
  console.log('Database initialization complete!');
}

main().catch(console.error);

