'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ExerciseProps, LineTrackingTrialConfig } from '@/lib/exercises/types';

const END_SHAPES = ['🏠', '⭐', '🌙', '🔔', '🎈', '🌸', '🦋'];
const START_SHAPE = '👁️';

export function LineTracking({ config, currentTrialIndex, onTrialComplete }: ExerciseProps) {
  const [hasResponded, setHasResponded] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const svgRef = useRef<SVGSVGElement>(null);

  const trial = config.trials[currentTrialIndex] as LineTrackingTrialConfig;
  const { line_count, correct_end, line_paths, stimulus_duration_ms } = trial;

  // Reset on trial change
  useEffect(() => {
    setHasResponded(false);
    startTimeRef.current = Date.now();
  }, [currentTrialIndex]);

  // Handle response
  const handleResponse = useCallback((endIndex: number) => {
    if (hasResponded) return;
    setHasResponded(true);

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = endIndex === correct_end;

    onTrialComplete({
      trial_index: currentTrialIndex,
      user_response: String(endIndex),
      response_time_ms: responseTime,
      is_correct: isCorrect,
      is_timed_out: false,
      is_skipped: false,
      started_at: new Date(startTimeRef.current).toISOString(),
      responded_at: new Date().toISOString(),
    });
  }, [hasResponded, correct_end, currentTrialIndex, onTrialComplete]);

  // Timeout handler
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasResponded) {
        onTrialComplete({
          trial_index: currentTrialIndex,
          user_response: '',
          response_time_ms: stimulus_duration_ms,
          is_correct: false,
          is_timed_out: true,
          is_skipped: false,
          started_at: new Date(startTimeRef.current).toISOString(),
          responded_at: new Date().toISOString(),
        });
      }
    }, stimulus_duration_ms);

    return () => clearTimeout(timeout);
  }, [stimulus_duration_ms, hasResponded, currentTrialIndex, onTrialComplete]);

  // Generate path string from control points
  const generatePath = (linePath: typeof line_paths[0], width: number, height: number): string => {
    const startX = linePath.start[0] * width;
    const startY = linePath.start[1] * height;
    const endX = linePath.end[0] * width;
    const endY = linePath.end[1] * height;
    
    if (linePath.control_points.length === 0) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    let path = `M ${startX} ${startY}`;
    const points = linePath.control_points.map(cp => [cp[0] * width, cp[1] * height]);
    
    // Create smooth curve through control points
    for (let i = 0; i < points.length; i++) {
      const cp = points[i];
      path += ` Q ${cp[0]} ${cp[1]}`;
      if (i < points.length - 1) {
        const nextCp = points[i + 1];
        const midX = (cp[0] + nextCp[0]) / 2;
        const midY = (cp[1] + nextCp[1]) / 2;
        path += ` ${midX} ${midY}`;
      } else {
        path += ` ${endX} ${endY}`;
      }
    }

    return path;
  };

  const width = 800;
  const height = 500;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-2xl font-bold">Follow the line from {START_SHAPE} and click the shape it leads to</h2>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-slate-800 rounded-2xl"
      >
        {/* Draw lines */}
        {line_paths.map((linePath, idx) => (
          <path
            key={idx}
            d={generatePath(linePath, width, height)}
            stroke="#64748b"
            strokeWidth="3"
            fill="none"
          />
        ))}

        {/* Start marker (for the correct line) */}
        <text
          x={line_paths[correct_end].start[0] * width}
          y={line_paths[correct_end].start[1] * height}
          fontSize="32"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {START_SHAPE}
        </text>

        {/* End markers - clickable */}
        {line_paths.map((linePath, idx) => (
          <g key={`end-${idx}`}>
            <circle
              cx={linePath.end[0] * width}
              cy={linePath.end[1] * height}
              r="30"
              fill="transparent"
              className={`cursor-pointer ${hasResponded ? '' : 'hover:fill-primary-500/20'}`}
              onClick={() => handleResponse(idx)}
            />
            <text
              x={linePath.end[0] * width}
              y={linePath.end[1] * height}
              fontSize="32"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
            >
              {END_SHAPES[idx % END_SHAPES.length]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

