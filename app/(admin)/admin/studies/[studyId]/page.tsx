'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EXERCISE_NAMES, ExerciseId } from '@/lib/exercises/types';

const ALL_EXERCISE_IDS = Object.keys(EXERCISE_NAMES) as ExerciseId[];

interface TemplateExercise {
  id?: number;
  exercise_id: string;
  exercise_version: string;
  trial_count: number;
  difficulty_level: number;
  display_order: number;
}

interface SessionTemplate {
  id: number;
  study_id: number;
  template_number: number;
  label: string | null;
  exercises: TemplateExercise[];
}

interface ParticipantRow {
  id: number;
  user_id: number;
  child_code: string;
  first_name: string;
  group_name: string | null;
  created_at: string;
}

interface StudyData {
  id: number;
  name: string;
  description: string | null;
  target_sessions: number;
  sessions_per_day: number;
  sessions_per_week: number | null;
  min_days_between_sessions: number | null;
  session_duration_minutes: number;
  is_locked: number;
}

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studyId = Number(params.studyId);

  const [study, setStudy] = useState<StudyData | null>(null);
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);

  // Editable study fields
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetSessions, setEditTargetSessions] = useState('15');
  const [editSessionsPerDay, setEditSessionsPerDay] = useState('1');
  const [editSessionsPerWeek, setEditSessionsPerWeek] = useState('');
  const [editMinDaysBetween, setEditMinDaysBetween] = useState('');
  const [editDuration, setEditDuration] = useState('30');

  const fetchAll = useCallback(async () => {
    try {
      const [studiesRes, templatesRes, participantsRes] = await Promise.all([
        fetch('/api/studies'),
        fetch(`/api/session-templates?studyId=${studyId}`),
        fetch(`/api/participants?studyId=${studyId}`),
      ]);

      const studiesData = await studiesRes.json();
      const studyRecord = (studiesData.studies || []).find((s: StudyData) => s.id === studyId);
      if (studyRecord) {
        setStudy(studyRecord);
        setEditName(studyRecord.name);
        setEditDescription(studyRecord.description || '');
        setEditTargetSessions(String(studyRecord.target_sessions));
        setEditSessionsPerDay(String(studyRecord.sessions_per_day || 1));
        setEditSessionsPerWeek(studyRecord.sessions_per_week ? String(studyRecord.sessions_per_week) : '');
        setEditMinDaysBetween(studyRecord.min_days_between_sessions ? String(studyRecord.min_days_between_sessions) : '');
        setEditDuration(String(studyRecord.session_duration_minutes));
      }

      const templatesData = await templatesRes.json();
      setTemplates(templatesData.templates || []);

      const participantsData = await participantsRes.json();
      setParticipants(participantsData.participants || []);
    } catch (error) {
      console.error('Error fetching study data:', error);
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Save study settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studyId,
          name: editName,
          description: editDescription,
          target_sessions: parseInt(editTargetSessions),
          sessions_per_day: parseInt(editSessionsPerDay),
          sessions_per_week: editSessionsPerWeek ? parseInt(editSessionsPerWeek) : null,
          min_days_between_sessions: editMinDaysBetween ? parseInt(editMinDaysBetween) : null,
          session_duration_minutes: parseInt(editDuration),
        }),
      });
      await fetchAll();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle lock
  const toggleLock = async () => {
    await fetch('/api/studies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: studyId, is_locked: !study?.is_locked }),
    });
    await fetchAll();
  };

  // Add new template
  const addTemplate = async () => {
    await fetch('/api/session-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ study_id: studyId }),
    });
    await fetchAll();
  };

  // Delete template
  const deleteTemplate = async (templateId: number) => {
    await fetch(`/api/session-templates?id=${templateId}`, { method: 'DELETE' });
    setActiveTemplateIdx(0);
    await fetchAll();
  };

  // Add exercise to template
  const addExerciseToTemplate = async (templateId: number, exerciseId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newExercises = [
      ...template.exercises.map(e => ({
        exercise_id: e.exercise_id,
        exercise_version: e.exercise_version,
        trial_count: e.trial_count,
        difficulty_level: e.difficulty_level,
        display_order: e.display_order,
      })),
      {
        exercise_id: exerciseId,
        exercise_version: '1.0.0',
        trial_count: 10,
        difficulty_level: 1,
        display_order: template.exercises.length + 1,
      },
    ];

    await fetch('/api/session-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId, exercises: newExercises }),
    });
    await fetchAll();
  };

  // Remove exercise from template
  const removeExerciseFromTemplate = async (templateId: number, exerciseId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newExercises = template.exercises
      .filter(e => e.exercise_id !== exerciseId)
      .map((e, idx) => ({
        exercise_id: e.exercise_id,
        exercise_version: e.exercise_version,
        trial_count: e.trial_count,
        difficulty_level: e.difficulty_level,
        display_order: idx + 1,
      }));

    await fetch('/api/session-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId, exercises: newExercises }),
    });
    await fetchAll();
  };

  // Update exercise trial count in template
  const updateExerciseTrials = async (templateId: number, exerciseId: string, trials: number) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newExercises = template.exercises.map(e => ({
      exercise_id: e.exercise_id,
      exercise_version: e.exercise_version,
      trial_count: e.exercise_id === exerciseId ? trials : e.trial_count,
      difficulty_level: e.difficulty_level,
      display_order: e.display_order,
    }));

    await fetch('/api/session-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId, exercises: newExercises }),
    });
    await fetchAll();
  };

  // Move exercise up/down in template
  const moveExercise = async (templateId: number, exerciseId: string, direction: 'up' | 'down') => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const sorted = [...template.exercises].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(e => e.exercise_id === exerciseId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];

    const newExercises = sorted.map((e, i) => ({
      exercise_id: e.exercise_id,
      exercise_version: e.exercise_version,
      trial_count: e.trial_count,
      difficulty_level: e.difficulty_level,
      display_order: i + 1,
    }));

    await fetch('/api/session-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId, exercises: newExercises }),
    });
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!study) {
    return <p className="text-slate-500">Study not found.</p>;
  }

  const activeTemplate = templates[activeTemplateIdx] || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/studies')}
            className="text-sm text-primary-500 hover:text-primary-600 mb-2 inline-block"
          >
            &larr; Back to Studies
          </button>
          <h1 className="text-3xl font-bold text-slate-800">{study.name}</h1>
        </div>
        <button
          onClick={toggleLock}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            study.is_locked
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              : 'bg-warning-100 hover:bg-warning-200 text-warning-600'
          }`}
        >
          {study.is_locked ? 'Unlock Study' : 'Lock Study'}
        </button>
      </div>

      {/* Section 1: Study Settings */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Study Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Study Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div>
            <label className="block text-lg font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
              rows={2}
            />
          </div>
          <Input
            label="Target Sessions"
            type="number"
            value={editTargetSessions}
            onChange={(e) => setEditTargetSessions(e.target.value)}
          />
          <Input
            label="Sessions Per Day"
            type="number"
            value={editSessionsPerDay}
            onChange={(e) => setEditSessionsPerDay(e.target.value)}
          />
          <Input
            label="Sessions Per Week (optional)"
            type="number"
            value={editSessionsPerWeek}
            onChange={(e) => setEditSessionsPerWeek(e.target.value)}
            placeholder="No limit"
          />
          <Input
            label="Min Days Between Sessions (optional)"
            type="number"
            value={editMinDaysBetween}
            onChange={(e) => setEditMinDaysBetween(e.target.value)}
            placeholder="No minimum"
          />
          <Input
            label="Session Duration (min)"
            type="number"
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Button onClick={saveSettings} isLoading={saving}>Save Settings</Button>
        </div>
      </Card>

      {/* Section 2: Session Templates */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Session Templates</h2>
          <Button onClick={addTemplate} variant="secondary">
            + Add Session Type
          </Button>
        </div>

        {templates.length > 1 && (
          <p className="text-sm text-slate-500 mb-4">
            Children will cycle through these session types:{' '}
            {templates.map(t => t.template_number).join(' → ')} → {templates[0]?.template_number} → ...
          </p>
        )}

        {/* Template tabs */}
        {templates.length > 0 && (
          <div className="flex gap-2 mb-4 border-b pb-2">
            {templates.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplateIdx(idx)}
                className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-colors ${
                  idx === activeTemplateIdx
                    ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label || `Template ${t.template_number}`}
              </button>
            ))}
          </div>
        )}

        {/* Active template exercises */}
        {activeTemplate && (
          <div>
            <div className="space-y-2 mb-4">
              {activeTemplate.exercises
                .sort((a, b) => a.display_order - b.display_order)
                .map((ex, idx) => (
                  <div key={ex.exercise_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 text-sm w-6">{idx + 1}.</span>
                    <span className="flex-1 font-medium">
                      {EXERCISE_NAMES[ex.exercise_id as ExerciseId] || ex.exercise_id}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-500">Trials:</label>
                      <input
                        type="number"
                        value={ex.trial_count}
                        onChange={(e) => updateExerciseTrials(activeTemplate.id, ex.exercise_id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveExercise(activeTemplate.id, ex.exercise_id, 'up')}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-sm"
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveExercise(activeTemplate.id, ex.exercise_id, 'down')}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-sm"
                        disabled={idx === activeTemplate.exercises.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={() => removeExerciseFromTemplate(activeTemplate.id, ex.exercise_id)}
                      className="text-danger-500 hover:text-danger-600 text-sm px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {activeTemplate.exercises.length === 0 && (
                <p className="text-slate-400 text-center py-4">No exercises in this template yet</p>
              )}
            </div>

            {/* Add exercise dropdown */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ALL_EXERCISE_IDS
                .filter(id => !activeTemplate.exercises.some(e => e.exercise_id === id))
                .map(id => (
                  <button
                    key={id}
                    onClick={() => addExerciseToTemplate(activeTemplate.id, id)}
                    className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
                  >
                    + {EXERCISE_NAMES[id]}
                  </button>
                ))}
            </div>

            {/* Delete template button */}
            {templates.length > 1 && (
              <button
                onClick={() => deleteTemplate(activeTemplate.id)}
                className="text-sm text-danger-500 hover:text-danger-600"
              >
                Delete this session type
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Section 3: Difficulty Levels (automatic progression) */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Difficulty Levels</h2>
        <p className="text-slate-500">
          Difficulty <span className="font-medium">advances automatically</span>, tracked per child per exercise.
          Every exercise starts at <span className="font-medium">Level 1</span>, and moves up one level in the next
          session whenever the child scores <span className="font-medium">70% or higher</span> that session. A lower
          score keeps the same level (it never drops). Levels are capped at 15.
        </p>
        <p className="text-slate-500 mt-2">
          <span className="font-medium">Coherent Motion Detection</span> is the exception: it has no fixed levels —
          each session resumes at the coherence the child reached at the end of the previous session.
        </p>
      </Card>

      {/* Section 4: Participants */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Participants ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No participants enrolled yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium text-slate-600">Code</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Name</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Group</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Enrolled</th>
                  <th className="py-2 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 pr-4 font-mono">{p.child_code}</td>
                    <td className="py-2 pr-4">{p.first_name || '-'}</td>
                    <td className="py-2 pr-4">{p.group_name || '-'}</td>
                    <td className="py-2 pr-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => router.push(`/admin/participants/${p.user_id}`)}
                        className="text-primary-500 hover:text-primary-600 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
