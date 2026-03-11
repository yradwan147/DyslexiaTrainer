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
  display_order: number;
}

interface SessionTemplate {
  id: number;
  study_id: number;
  template_number: number;
  label: string | null;
  exercises: TemplateExercise[];
}

interface TransitionRule {
  id?: number;
  study_id: number;
  exercise_id: string;
  advance_threshold: number;
  regress_threshold: number;
  min_trials_required: number;
  max_level: number;
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
  const [rules, setRules] = useState<TransitionRule[]>([]);
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
      const [studiesRes, templatesRes, rulesRes, participantsRes] = await Promise.all([
        fetch('/api/studies'),
        fetch(`/api/session-templates?studyId=${studyId}`),
        fetch(`/api/transition-rules?studyId=${studyId}`),
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

      const rulesData = await rulesRes.json();
      setRules(rulesData.rules || []);

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
        display_order: e.display_order,
      })),
      {
        exercise_id: exerciseId,
        exercise_version: '1.0.0',
        trial_count: 10,
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
      display_order: i + 1,
    }));

    await fetch('/api/session-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: templateId, exercises: newExercises }),
    });
    await fetchAll();
  };

  // Save transition rules
  const saveRules = async () => {
    setSaving(true);
    try {
      // Get all unique exercises across all templates
      const allExerciseIds = new Set<string>();
      for (const t of templates) {
        for (const e of t.exercises) {
          allExerciseIds.add(e.exercise_id);
        }
      }

      for (const exerciseId of Array.from(allExerciseIds)) {
        const existing = rules.find(r => r.exercise_id === exerciseId);
        await fetch('/api/transition-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            study_id: studyId,
            exercise_id: exerciseId,
            advance_threshold: existing?.advance_threshold ?? 0.8,
            regress_threshold: existing?.regress_threshold ?? 0.5,
            min_trials_required: existing?.min_trials_required ?? 5,
            max_level: existing?.max_level ?? 15,
          }),
        });
      }
      await fetchAll();
    } catch (error) {
      console.error('Error saving rules:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateRuleLocal = (exerciseId: string, field: keyof TransitionRule, value: number) => {
    setRules(prev => {
      const existing = prev.find(r => r.exercise_id === exerciseId);
      if (existing) {
        return prev.map(r => r.exercise_id === exerciseId ? { ...r, [field]: value } : r);
      }
      return [...prev, {
        study_id: studyId,
        exercise_id: exerciseId,
        advance_threshold: 0.8,
        regress_threshold: 0.5,
        min_trials_required: 5,
        max_level: 15,
        [field]: value,
      }];
    });
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

  // Collect all unique exercises across templates for transition rules
  const allExerciseIds = new Set<string>();
  for (const t of templates) {
    for (const e of t.exercises) {
      allExerciseIds.add(e.exercise_id);
    }
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

      {/* Section 3: Transition Rules */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Transition Rules</h2>
        {allExerciseIds.size === 0 ? (
          <p className="text-slate-400">Add exercises to templates first</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-slate-600">Exercise</th>
                    <th className="py-2 px-2 font-medium text-slate-600">Advance %</th>
                    <th className="py-2 px-2 font-medium text-slate-600">Regress %</th>
                    <th className="py-2 px-2 font-medium text-slate-600">Min Trials</th>
                    <th className="py-2 px-2 font-medium text-slate-600">Max Level</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(allExerciseIds).map(exerciseId => {
                    const rule = rules.find(r => r.exercise_id === exerciseId);
                    return (
                      <tr key={exerciseId} className="border-b">
                        <td className="py-2 pr-4 font-medium">
                          {EXERCISE_NAMES[exerciseId as ExerciseId] || exerciseId}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={Math.round((rule?.advance_threshold ?? 0.8) * 100)}
                            onChange={(e) => updateRuleLocal(exerciseId, 'advance_threshold', parseInt(e.target.value) / 100)}
                            className="w-16 px-2 py-1 border rounded"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={Math.round((rule?.regress_threshold ?? 0.5) * 100)}
                            onChange={(e) => updateRuleLocal(exerciseId, 'regress_threshold', parseInt(e.target.value) / 100)}
                            className="w-16 px-2 py-1 border rounded"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={rule?.min_trials_required ?? 5}
                            onChange={(e) => updateRuleLocal(exerciseId, 'min_trials_required', parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded"
                            min="1"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={rule?.max_level ?? 15}
                            onChange={(e) => updateRuleLocal(exerciseId, 'max_level', parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded"
                            min="1"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button onClick={saveRules} isLoading={saving}>Save Transition Rules</Button>
            </div>
          </>
        )}
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
