/**
 * Exercise transition logic
 *
 * Evaluates whether a participant should advance to the next level
 * of an exercise based on their performance in the current session.
 *
 * Default rules (can be overridden per-study via transition_rules table later):
 * - Advance if accuracy >= 80%
 * - Stay if accuracy >= 50% but < 80%
 * - Regress if accuracy < 50% (minimum level 1)
 */

export interface TransitionResult {
  shouldAdvance: boolean;
  shouldRegress: boolean;
  newLevel: number;
  reason: string;
}

export interface TransitionRule {
  advance_threshold: number;
  regress_threshold: number;
  min_trials_required: number;
  max_level: number;
}

export interface PerformanceData {
  correctCount: number;
  totalTrials: number;
  currentLevel: number;
  rule?: TransitionRule;
}

const DEFAULT_ADVANCE_THRESHOLD = 0.8;
const DEFAULT_REGRESS_THRESHOLD = 0.5;
const DEFAULT_MAX_LEVEL = 15;
const DEFAULT_MIN_TRIALS = 5;

export function evaluateTransition(performance: PerformanceData): TransitionResult {
  const { correctCount, totalTrials, currentLevel, rule } = performance;
  const advanceThreshold = rule?.advance_threshold ?? DEFAULT_ADVANCE_THRESHOLD;
  const regressThreshold = rule?.regress_threshold ?? DEFAULT_REGRESS_THRESHOLD;
  const maxLevel = rule?.max_level ?? DEFAULT_MAX_LEVEL;
  const minTrials = rule?.min_trials_required ?? DEFAULT_MIN_TRIALS;

  if (totalTrials === 0) {
    return {
      shouldAdvance: false,
      shouldRegress: false,
      newLevel: currentLevel,
      reason: 'No trials completed',
    };
  }

  if (totalTrials < minTrials) {
    return {
      shouldAdvance: false,
      shouldRegress: false,
      newLevel: currentLevel,
      reason: `Only ${totalTrials} trials completed (minimum ${minTrials} required)`,
    };
  }

  const accuracy = correctCount / totalTrials;

  if (accuracy >= advanceThreshold && currentLevel < maxLevel) {
    return {
      shouldAdvance: true,
      shouldRegress: false,
      newLevel: Math.min(maxLevel, currentLevel + 1),
      reason: `Accuracy ${(accuracy * 100).toFixed(0)}% >= ${(advanceThreshold * 100).toFixed(0)}% threshold`,
    };
  }

  if (accuracy < regressThreshold && currentLevel > 1) {
    return {
      shouldAdvance: false,
      shouldRegress: true,
      newLevel: Math.max(1, currentLevel - 1),
      reason: `Accuracy ${(accuracy * 100).toFixed(0)}% < ${(regressThreshold * 100).toFixed(0)}% threshold`,
    };
  }

  return {
    shouldAdvance: false,
    shouldRegress: false,
    newLevel: currentLevel,
    reason: `Accuracy ${(accuracy * 100).toFixed(0)}% - maintaining current level`,
  };
}

/**
 * Extract exercise-specific metrics from trial result user_response JSON.
 * Returns a flat object of metric_key -> numeric value.
 */
export function extractMetrics(
  exerciseId: string,
  userResponse: string,
  responseTimeMs: number
): Record<string, number> {
  const metrics: Record<string, number> = {};

  try {
    const data = JSON.parse(userResponse);

    switch (exerciseId) {
      case 'coherent_motion':
        if (data.coherence !== undefined) metrics.coherence_end = data.coherence;
        if (data.reversals !== undefined) metrics.reversals_count = data.reversals;
        break;

      case 'visual_search':
        metrics.total_duration_ms = responseTimeMs;
        if (data.wrongClicks !== undefined) metrics.incorrect_count = data.wrongClicks;
        break;

      case 'line_tracking':
        metrics.time_to_complete_ms = responseTimeMs;
        if (data.wrongAttempts !== undefined) metrics.incorrect_clicks = data.wrongAttempts;
        break;

      case 'maze_tracking':
        metrics.time_to_complete_ms = responseTimeMs;
        if (data.wrongClicks !== undefined) metrics.incorrect_clicks = data.wrongClicks;
        if (data.correctClicks !== undefined) metrics.correct_clicks = data.correctClicks;
        break;

      case 'dynamic_football':
        if (data.hits !== undefined) metrics.goals_scored = data.hits;
        if (data.misses !== undefined) metrics.misses = data.misses;
        break;

      case 'dynamic_tennis':
        if (data.hits !== undefined) metrics.hits = data.hits;
        if (data.misses !== undefined) metrics.misses = data.misses;
        break;

      case 'visual_saccades':
        if (data.totalHits !== undefined) metrics.total_hits = data.totalHits;
        if (data.trialTimes && Array.isArray(data.trialTimes)) {
          const avg = data.trialTimes.reduce((s: number, t: number) => s + t, 0) / data.trialTimes.length;
          metrics.time_per_10_movements_ms = avg;
          data.trialTimes.forEach((t: number, i: number) => {
            metrics[`trial_${i + 1}_time_ms`] = t;
          });
        }
        break;

      case 'visual_memory':
        if (data.totalRetries !== undefined) metrics.total_retries = data.totalRetries;
        if (data.sessionNumber !== undefined) metrics.difficulty_level_reached = data.sessionNumber;
        if (data.puzzlesCompleted !== undefined) metrics.max_sequence_correct = data.puzzlesCompleted;
        break;

      case 'pair_search':
        if (data.totalWrongAttempts !== undefined) metrics.wrong_attempts = data.totalWrongAttempts;
        if (data.roundsCompleted !== undefined) metrics.rounds_completed = data.roundsCompleted;
        break;
    }
  } catch {
    // If userResponse isn't valid JSON, skip metric extraction
  }

  return metrics;
}
