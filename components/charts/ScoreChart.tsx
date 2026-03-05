'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ScoreDataPoint {
  session: number;
  hits: number;
  misses: number;
}

interface ScoreChartProps {
  data: ScoreDataPoint[];
  title: string;
  hitLabel?: string;
  missLabel?: string;
}

export function ScoreChart({
  data,
  title,
  hitLabel = 'Hits',
  missLabel = 'Misses',
}: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="session" label={{ value: 'Session', position: 'insideBottom', offset: -5 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="hits" name={hitLabel} fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="misses" name={missLabel} fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
