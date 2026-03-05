'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface CoherenceDataPoint {
  trial: number;
  coherence: number;
  correct: boolean;
}

interface CoherenceStaircaseChartProps {
  data: CoherenceDataPoint[];
  title?: string;
}

export function CoherenceStaircaseChart({
  data,
  title = 'Coherence Staircase',
}: CoherenceStaircaseChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-400 text-center py-8">No data available</p>
      </div>
    );
  }

  // Calculate threshold (average of last 5 reversals)
  const reversals: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const prevDirection = data[i - 1].coherence > (i >= 2 ? data[i - 2].coherence : 30);
    const currDirection = data[i].coherence > data[i - 1].coherence;
    if (prevDirection !== currDirection) {
      reversals.push(data[i].coherence);
    }
  }
  const threshold = reversals.length >= 5
    ? reversals.slice(-5).reduce((s, v) => s + v, 0) / Math.min(5, reversals.length)
    : null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {threshold !== null && (
        <p className="text-sm text-slate-500 mb-4">
          Estimated threshold: {threshold.toFixed(1)}% coherence
        </p>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="trial" label={{ value: 'Trial', position: 'insideBottom', offset: -5 }} />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Coherence %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Coherence']}
            labelFormatter={(label) => `Trial ${label}`}
          />
          {threshold !== null && (
            <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="5 5" label="Threshold" />
          )}
          <Line
            type="stepAfter"
            dataKey="coherence"
            name="Coherence"
            stroke="#6366f1"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: CoherenceDataPoint };
              if (cx == null || cy == null) return <circle r={0} />;
              return (
                <circle
                  key={`dot-${payload.trial}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.correct ? '#22c55e' : '#ef4444'}
                  stroke="none"
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
