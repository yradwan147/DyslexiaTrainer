'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EXERCISE_NAMES, ExerciseId } from '@/lib/exercises/types';

interface StudyExercise {
  exercise_id: string;
  difficulty_level: number;
  trial_count: number;
  display_order: number;
}

interface Study {
  id: number;
  name: string;
  description: string | null;
  target_sessions: number;
  session_duration_minutes: number;
  is_locked: boolean;
  participant_count: number;
  completed_sessions: number;
  exercises: StudyExercise[];
}

const ALL_EXERCISES = Object.keys(EXERCISE_NAMES) as ExerciseId[];

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_sessions: '15',
    session_duration_minutes: '30',
  });
  const [selectedExercises, setSelectedExercises] = useState<{
    exercise_id: string;
    difficulty: number;
    trials: number;
  }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/studies');
      const data = await res.json();
      setStudies(data.studies || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    if (selectedExercises.some(e => e.exercise_id === exerciseId)) return;
    setSelectedExercises([
      ...selectedExercises,
      { exercise_id: exerciseId, difficulty: 1, trials: 10 }
    ]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.exercise_id !== exerciseId));
  };

  const handleExerciseChange = (exerciseId: string, field: 'difficulty' | 'trials', value: number) => {
    setSelectedExercises(selectedExercises.map(e => 
      e.exercise_id === exerciseId ? { ...e, [field]: value } : e
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const exercises = selectedExercises.map((ex, idx) => ({
        exercise_id: ex.exercise_id,
        exercise_version: '1.0.0',
        difficulty_level: ex.difficulty,
        trial_count: ex.trials,
        display_order: idx + 1,
      }));

      const res = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target_sessions: parseInt(formData.target_sessions),
          session_duration_minutes: parseInt(formData.session_duration_minutes),
          exercises,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
          target_sessions: '15',
          session_duration_minutes: '30',
        });
        setSelectedExercises([]);
        fetchData();
      } else {
        alert('Error creating study');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (id: number, currentState: boolean) => {
    try {
      await fetch('/api/studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_locked: !currentState }),
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Studies</h1>
          <p className="text-slate-600">Configure research studies and exercise protocols</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Create Study
        </Button>
      </div>

      {studies.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-slate-700 mb-2">No studies yet</h3>
          <p className="text-slate-500 mb-6">Create your first study to get started</p>
          <Button onClick={() => setShowModal(true)}>Create Study</Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {studies.map((study) => (
            <Card key={study.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{study.name}</h3>
                    {study.is_locked && (
                      <span className="px-2 py-1 bg-warning-100 text-warning-600 text-sm rounded-full">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{study.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => toggleLock(study.id, study.is_locked)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    study.is_locked
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      : 'bg-warning-100 hover:bg-warning-200 text-warning-600'
                  }`}
                >
                  {study.is_locked ? 'Unlock' : 'Lock Study'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-800">{study.participant_count}</div>
                  <div className="text-sm text-slate-500">Participants</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-800">{study.completed_sessions}</div>
                  <div className="text-sm text-slate-500">Completed Sessions</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-slate-800">{study.target_sessions}</div>
                  <div className="text-sm text-slate-500">Target Sessions</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-700 mb-2">Exercises:</h4>
                <div className="flex flex-wrap gap-2">
                  {study.exercises.map((ex) => (
                    <span
                      key={ex.exercise_id}
                      className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm"
                    >
                      {EXERCISE_NAMES[ex.exercise_id as ExerciseId] || ex.exercise_id}
                      <span className="text-primary-400 ml-1">L{ex.difficulty_level}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Study Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Study"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Study Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Spring 2024 Study"
            required
          />
          <div>
            <label className="block text-lg font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
              rows={3}
              placeholder="Study description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Sessions"
              type="number"
              value={formData.target_sessions}
              onChange={(e) => setFormData({ ...formData, target_sessions: e.target.value })}
            />
            <Input
              label="Duration (min)"
              type="number"
              value={formData.session_duration_minutes}
              onChange={(e) => setFormData({ ...formData, session_duration_minutes: e.target.value })}
            />
          </div>

          {/* Exercise Selection */}
          <div>
            <label className="block text-lg font-medium text-slate-700 mb-2">Exercises</label>
            <div className="space-y-2 mb-4">
              {selectedExercises.map((ex) => (
                <div key={ex.exercise_id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <span className="flex-1 font-medium">{EXERCISE_NAMES[ex.exercise_id as ExerciseId]}</span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">Level:</label>
                    <select
                      value={ex.difficulty}
                      onChange={(e) => handleExerciseChange(ex.exercise_id, 'difficulty', parseInt(e.target.value))}
                      className="px-2 py-1 border rounded"
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">Trials:</label>
                    <input
                      type="number"
                      value={ex.trials}
                      onChange={(e) => handleExerciseChange(ex.exercise_id, 'trials', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded"
                      min="1"
                      max="100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(ex.exercise_id)}
                    className="text-danger-500 hover:text-danger-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_EXERCISES.filter(id => !selectedExercises.some(e => e.exercise_id === id)).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleAddExercise(id)}
                  className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
                >
                  + {EXERCISE_NAMES[id]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} className="flex-1">
              Create Study
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

