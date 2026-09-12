import { ReactionState, ReactionTrial } from '../types';

export const TOTAL_TRIALS = 5;

export const createInitialReactionState = (): ReactionState => {
  return {
    phase: 'READY',
    currentTrial: 1,
    totalTrials: TOTAL_TRIALS,
    trials: [],
    lastTimeMs: null,
    bestTimeMs: null,
    averageTimeMs: null,
    startTime: 0,
    falseStarts: 0,
  };
};

export const getReflexTier = (
  timeMs: number
): { title: string; color: string; badge: string } => {
  if (timeMs < 190) {
    return { title: 'GODLIKE NEURAL', color: '#00F0FF', badge: 'SSS' };
  } else if (timeMs < 230) {
    return { title: 'CYBER RUNNER', color: '#10B981', badge: 'SS' };
  } else if (timeMs < 270) {
    return { title: 'PRO REFLEX', color: '#8B5CF6', badge: 'S' };
  } else if (timeMs < 330) {
    return { title: 'STANDARD HUMAN', color: '#F59E0B', badge: 'A' };
  } else {
    return { title: 'SLUGGISH SYNAPSE', color: '#F43F5E', badge: 'B' };
  }
};

export const calculateReflexScore = (
  trials: ReactionTrial[],
  falseStarts: number
): number => {
  if (trials.length === 0) return 0;
  const avg =
    trials.reduce((sum, t) => sum + t.timeMs, 0) / trials.length;

  // Faster = higher score
  // 200ms -> 800 pts, 300ms -> 500 pts, 400ms -> 300 pts
  const baseScore = Math.max(100, Math.floor(1000 - avg * 2));
  const penalty = falseStarts * 50;
  return Math.max(50, baseScore - penalty);
};
