'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ExerciseProgressChart } from '@/components/charts/ExerciseProgressChart';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { CoherenceStaircaseChart } from '@/components/charts/CoherenceStaircaseChart';
import { EXERCISE_NAMES, ExerciseId } from '@/lib/exercises/types';

interface UserInfo {
  id: number;
  child_code: string;
  first_name: string;
  age: number;
  created_at: string;
}

interface RunData {
  id: number;
  exercise_id: string;
  difficulty_level: number;
  started_at: string;
  total_trials: number;
  correct_count: number;
  avg_reaction_time_ms: number;
  metrics: Record<string, number>;
}

interface ProgressData {
  exercise_id: string;
  current_level: number;
  total_sessions_completed: number;
}

interface SessionData {
  id: number;
  session_number: number;
  started_at: string | null;
  ended_at: string | null;
  status: string;
  exercises_completed: number;
}

interface StudyInfo {
  study_name: string;
  target_sessions: number;
}

export default function ParticipantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserInfo | null>(null);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [coherenceTrials, setCoherenceTrials] = useState<Record<string, unknown>[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [studyInfo, setStudyInfo] = useState<StudyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/progress?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setRuns(data.runs || []);
        setProgress(data.progress || []);
        setCoherenceTrials(data.coherenceTrials || []);
        setSessions(data.sessions || []);
        setStudyInfo(data.studyInfo || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-slate-500">Participant not found.</p>;
  }

  // Group runs by exercise
  const runsByExercise: Record<string, RunData[]> = {};
  for (const run of runs) {
    if (!runsByExercise[run.exercise_id]) runsByExercise[run.exercise_id] = [];
    runsByExercise[run.exercise_id].push(run);
  }

  // Build coherence staircase data
  const coherenceData = coherenceTrials.map((t, i) => ({
    trial: i + 1,
    coherence: 30,
    correct: t.is_correct === 1,
  }));

  // Build accuracy chart data per exercise
  const buildAccuracyData = (exerciseRuns: RunData[]) => {
    return exerciseRuns.map((r, i) => ({
      session: i + 1,
      value: r.total_trials > 0 ? Math.round((r.correct_count / r.total_trials) * 100) : 0,
    }));
  };

  // Build score data for football/tennis
  const buildScoreData = (exerciseRuns: RunData[], hitKey: string, missKey: string) => {
    return exerciseRuns.map((r, i) => ({
      session: i + 1,
      hits: r.metrics[hitKey] ?? r.correct_count ?? 0,
      misses: r.metrics[missKey] ?? 0,
    }));
  };

  // Build reaction time data
  const buildReactionTimeData = (exerciseRuns: RunData[]) => {
    return exerciseRuns
      .filter(r => r.avg_reaction_time_ms > 0)
      .map((r, i) => ({
        session: i + 1,
        value: Math.round(r.avg_reaction_time_ms),
      }));
  };

  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/participants')}
          className="text-sm text-primary-500 hover:text-primary-600 mb-2 inline-block"
        >
          &larr; Back to Participants
        </button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {user.first_name || user.child_code}
        </h1>
        <div className="flex gap-4 text-slate-500">
          <span>Code: {user.child_code}</span>
          {user.age && <span>Age: {user.age}</span>}
          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Study Progress */}
      {studyInfo && (
        <Card>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{studyInfo.study_name}</h2>
          <p className="text-slate-600 mb-3">
            {completedSessions} of {studyInfo.target_sessions} sessions completed
          </p>
          <ProgressBar
            value={completedSessions}
            max={studyInfo.target_sessions}
            color="primary"
          />
        </Card>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Session History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-medium text-slate-600">Session #</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Date</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Status</th>
                  <th className="py-2 pr-4 font-medium text-slate-600">Exercises</th>
                  <th className="py-2 font-medium text-slate-600">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const duration = s.started_at && s.ended_at
                    ? Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)
                    : null;

                  return (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 pr-4">{s.session_number}</td>
                      <td className="py-2 pr-4 text-slate-500">
                        {s.started_at ? new Date(s.started_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === 'completed' ? 'bg-success-100 text-success-600' :
                          s.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                          s.status === 'incomplete' ? 'bg-warning-100 text-warning-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{s.exercises_completed}</td>
                      <td className="py-2 text-slate-500">
                        {duration !== null ? `${duration} min` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Progress Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(EXERCISE_NAMES).map(([id, name]) => {
            const exerciseRuns = runsByExercise[id] || [];
            // Researcher-set fixed level: show the level the child actually trained at
            // most recently (= the difficulty configured on the study's session template).
            const latestLevel = exerciseRuns.length > 0
              ? exerciseRuns[exerciseRuns.length - 1].difficulty_level
              : null;
            return (
              <div key={id} className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-slate-600">{name}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {latestLevel !== null ? `Lv ${latestLevel}` : '—'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {exerciseRuns.length} runs
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Coherence Staircase */}
      {coherenceData.length > 0 && (
        <CoherenceStaircaseChart data={coherenceData} />
      )}

      {/* Per-exercise charts */}
      {Object.entries(runsByExercise).map(([exerciseId, exerciseRuns]) => {
        const name = EXERCISE_NAMES[exerciseId as ExerciseId] || exerciseId;

        return (
          <div key={exerciseId} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700">{name}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Accuracy over sessions */}
              <ExerciseProgressChart
                data={buildAccuracyData(exerciseRuns)}
                title={`${name} - Accuracy`}
                yAxisLabel="Accuracy %"
                color="#6366f1"
              />

              {/* Reaction time */}
              <ExerciseProgressChart
                data={buildReactionTimeData(exerciseRuns)}
                title={`${name} - Reaction Time`}
                yAxisLabel="Avg RT (ms)"
                color="#f59e0b"
              />

              {/* Score chart for football/tennis */}
              {exerciseId === 'dynamic_football' && (
                <ScoreChart
                  data={buildScoreData(exerciseRuns, 'goals_scored', 'misses')}
                  title="Football - Goals vs Misses"
                  hitLabel="Goals"
                  missLabel="Misses"
                />
              )}

              {exerciseId === 'dynamic_tennis' && (
                <ScoreChart
                  data={buildScoreData(exerciseRuns, 'hits', 'misses')}
                  title="Tennis - Hits vs Misses"
                />
              )}

              {/* Difficulty progression */}
              <ExerciseProgressChart
                data={exerciseRuns.map((r, i) => ({
                  session: i + 1,
                  value: r.difficulty_level,
                }))}
                title={`${name} - Difficulty Level`}
                yAxisLabel="Level"
                color="#22c55e"
              />
            </div>
          </div>
        );
      })}

      {runs.length === 0 && (
        <Card>
          <p className="text-slate-400 text-center py-8">
            No exercise data recorded yet for this participant.
          </p>
        </Card>
      )}
    </div>
  );
}
