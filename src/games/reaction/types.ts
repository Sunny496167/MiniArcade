export type ReflexPhase = 'READY' | 'WAITING' | 'REACT_NOW' | 'TOO_EARLY' | 'ROUND_RESULT' | 'FINAL_COMPLETE';

export interface ReactionTrial {
  trialNumber: number;
  timeMs: number;
}

export interface ReactionState {
  phase: ReflexPhase;
  currentTrial: number;
  totalTrials: number;
  trials: ReactionTrial[];
  lastTimeMs: number | null;
  bestTimeMs: number | null;
  averageTimeMs: number | null;
  startTime: number;
  falseStarts: number;
}
