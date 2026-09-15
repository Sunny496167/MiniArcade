export type ReflexPhase =
  | 'READY'
  | 'WAITING'
  | 'REACT_NOW'
  | 'DECOY'
  | 'HOLD_NOW'
  | 'TOO_EARLY'
  | 'WRONG_COLOR'
  | 'MISSED'
  | 'ROUND_RESULT'
  | 'LEVEL_COMPLETE'
  | 'FINAL_COMPLETE';

export type ChallengeType = 'TAP' | 'COLOR_MATCH' | 'HOLD' | 'DOUBLE_TAP';

export interface ReactionTrial {
  trialNumber: number;
  timeMs: number;
  challengeType: ChallengeType;
  correct: boolean;
}

export interface LevelConfig {
  level: number;
  name: string;
  accentColor: string;
  trialsCount: number;
  minDelayMs: number;
  maxDelayMs: number;
  windowMs: number | null; // null = unlimited window
  challenges: ChallengeType[];
  description: string;
  mechanic: string; // short blurb for next-level preview
}

export interface ReactionState {
  phase: ReflexPhase;
  currentLevel: number;
  currentLevelTrial: number;      // 1-based within current level
  trials: ReactionTrial[];        // all trials across all levels
  levelTrials: ReactionTrial[];   // trials for current level only
  lastTimeMs: number | null;
  bestTimeMs: number | null;
  averageTimeMs: number | null;
  startTime: number;
  falseStarts: number;
  missCount: number;
  streakCount: number;
  maxStreak: number;
  challengeType: ChallengeType;
  isDecoy: boolean;               // COLOR_MATCH: is this a red decoy?
  holdProgress: number;           // 0-1 reference (animation handled by SharedValue)
  levelScore: number;
  totalScore: number;
}
