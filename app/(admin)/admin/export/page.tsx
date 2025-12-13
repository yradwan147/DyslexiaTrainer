'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Study {
  id: number;
  name: string;
}

export default function ExportPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<string>('');
  const [exportType, setExportType] = useState<'sessions' | 'trials' | 'exercise_runs'>('sessions');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
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

  const handlePreview = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        format: 'json',
      });
      if (selectedStudy) params.append('studyId', selectedStudy);

      const res = await fetch(`/api/export?${params}`);
      const data = await res.json();
      setPreviewData(data.data?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        type: exportType,
        format,
      });
      if (selectedStudy) params.append('studyId', selectedStudy);

      const res = await fetch(`/api/export?${params}`);
      
      if (format === 'csv') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error exporting data');
    } finally {
      setExporting(false);
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
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Export Data</h1>
        <p className="text-slate-600">Download research data in CSV or JSON format</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Export Options</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Data Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as typeof exportType)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            >
              <option value="sessions">Sessions (summary level)</option>
              <option value="exercise_runs">Exercise Runs (per exercise)</option>
              <option value="trials">Trials (detailed per-trial)</option>
            </select>
          </div>

          {/* Study Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Study (Optional)</label>
            <select
              value={selectedStudy}
              onChange={(e) => setSelectedStudy(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            >
              <option value="">All Studies</option>
              {studies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="w-5 h-5 text-primary-500"
                />
                <span className="font-medium">CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="w-5 h-5 text-primary-500"
                />
                <span className="font-medium">JSON</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={handleExport} isLoading={exporting}>
            📥 Download Export
          </Button>
          <Button onClick={handlePreview} variant="secondary" isLoading={exporting}>
            👁 Preview Data
          </Button>
        </div>
      </Card>

      {/* Data Preview */}
      {previewData && (
        <Card>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Data Preview (first 10 rows)
          </h2>
          {previewData.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No data found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="text-left py-2 px-3 font-medium text-slate-600 whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="py-2 px-3 whitespace-nowrap">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Data Description */}
      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Data Descriptions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">📋 Sessions Export</h3>
            <p className="text-slate-600 text-sm">
              One row per session. Includes: session_id, child_code, study_name, session_number, 
              start/end times, status, device info.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">📊 Exercise Runs Export</h3>
            <p className="text-slate-600 text-sm">
              One row per exercise attempt. Includes: exercise_id, version, difficulty, 
              start/end times, correct_count, avg_reaction_time, session info.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">📝 Trials Export</h3>
            <p className="text-slate-600 text-sm">
              One row per individual trial. Includes: trial_config (JSON), correct_answer, 
              user_response, response_time_ms, is_correct, is_timed_out, timestamps.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

