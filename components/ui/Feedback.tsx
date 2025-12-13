'use client';

import { useEffect, useState } from 'react';

interface FeedbackProps {
  type: 'correct' | 'incorrect' | null;
  duration?: number;
  onComplete?: () => void;
}

export function Feedback({ type, duration = 1000, onComplete }: FeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onComplete]);

  if (!visible || !type) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className={`
        text-9xl transform transition-all duration-300
        ${type === 'correct' ? 'text-success-500 animate-bounce' : 'text-danger-500 animate-shake'}
      `}>
        {type === 'correct' ? '✓' : '✗'}
      </div>
    </div>
  );
}

// Simple star rating display for session completion
export function StarRating({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100;
  const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : percentage > 0 ? 1 : 0;
  
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3].map((star) => (
        <span
          key={star}
          className={`text-5xl transition-all duration-500 ${
            star <= stars 
              ? 'text-warning-400 scale-100' 
              : 'text-slate-300 scale-75'
          }`}
          style={{ animationDelay: `${star * 200}ms` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

