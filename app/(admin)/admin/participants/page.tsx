'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface Participant {
  id: number;
  user_id: number;
  child_code: string;
  first_name: string | null;
  age: number | null;
  study_id: number;
  study_name: string;
  group_name: string | null;
  completed_sessions: number;
  target_sessions: number;
}

interface Study {
  id: number;
  name: string;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    child_code: '',
    password: '',
    first_name: '',
    age: '',
    study_id: '',
    group_name: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [participantsRes, studiesRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/studies'),
      ]);
      const [participantsData, studiesData] = await Promise.all([
        participantsRes.json(),
        studiesRes.json(),
      ]);
      setParticipants(participantsData.participants || []);
      setStudies(studiesData.studies || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          study_id: parseInt(formData.study_id),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          child_code: '',
          password: '',
          first_name: '',
          age: '',
          study_id: '',
          group_name: '',
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Error creating participant');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating participant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this participant? This will delete all their data.')) {
      return;
    }

    try {
      await fetch(`/api/participants?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Participants</h1>
          <p className="text-slate-600">Manage child participants in your studies</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Add Participant
        </Button>
      </div>

      <Card>
        {participants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-medium text-slate-700 mb-2">No participants yet</h3>
            <p className="text-slate-500 mb-6">Create your first participant to get started</p>
            <Button onClick={() => setShowModal(true)}>Add Participant</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Study</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Group</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium">{p.child_code}</td>
                    <td className="py-3 px-4">{p.first_name || '-'}</td>
                    <td className="py-3 px-4">{p.age || '-'}</td>
                    <td className="py-3 px-4">{p.study_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-sm">
                        {p.group_name || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success-500 rounded-full"
                            style={{ width: `${(p.completed_sessions / p.target_sessions) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500">
                          {p.completed_sessions}/{p.target_sessions}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-danger-500 hover:text-danger-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Participant Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Participant"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Child Code"
            value={formData.child_code}
            onChange={(e) => setFormData({ ...formData, child_code: e.target.value.toUpperCase() })}
            placeholder="e.g., C1234"
            required
          />
          <Input
            label="PIN (Password)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="4+ characters"
            required
          />
          <Input
            label="First Name (Optional)"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
          <Input
            label="Age (Optional)"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          <div>
            <label className="block text-lg font-medium text-slate-700 mb-2">Study</label>
            <select
              value={formData.study_id}
              onChange={(e) => setFormData({ ...formData, study_id: e.target.value })}
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
              required
            >
              <option value="">Select a study</option>
              {studies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Group (Optional)"
            value={formData.group_name}
            onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
            placeholder="e.g., control, training"
          />
          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={saving} className="flex-1">
              Create Participant
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

