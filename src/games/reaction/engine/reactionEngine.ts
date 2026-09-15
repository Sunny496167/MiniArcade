import { ReactionState, ReactionTrial, ChallengeType, LevelConfig } from '../types';

// ── Constants ────────────────────────────────────────────────────────────────

export const HOLD_DURATION_MS = 500;
export const DOUBLE_TAP_WINDOW_MS = 380;
export const TOTAL_LEVELS = 5;

// Kept for backward compat with GameContainer score prop
export const TOTAL_TRIALS = 5;

// ── Level Definitions ────────────────────────────────────────────────────────

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    name: 'NOVICE',
    accentColor: '#00F0FF',
    trialsCount: 5,
    minDelayMs: 1500,
    maxDelayMs: 4000,
    windowMs: null,
    challenges: ['TAP'],
    description: 'Tap the moment it turns green!',
    mechanic: 'Pure reflex — tap when the signal turns green',
  },
  {
    level: 2,
    name: 'QUICK',
    accentColor: '#10B981',
    trialsCount: 6,
    minDelayMs: 1000,
    maxDelayMs: 3000,
    windowMs: 1500,
    challenges: ['TAP'],
    description: 'Faster signals — stay sharp!',
    mechanic: 'Tighter 1.5s tap window — no lagging!',
  },
  {
    level: 3,
    name: 'ADAPTIVE',
    accentColor: '#8B5CF6',
    trialsCount: 7,
    minDelayMs: 800,
    maxDelayMs: 2500,
    windowMs: 1200,
    challenges: ['TAP', 'TAP', 'TAP', 'COLOR_MATCH', 'COLOR_MATCH'],
    description: 'Tap CYAN — ignore red decoys!',
    mechanic: 'New: Color Match — red decoys will try to trick you',
  },
  {
    level: 4,
    name: 'PRECISION',
    accentColor: '#F59E0B',
    trialsCount: 7,
    minDelayMs: 600,
    maxDelayMs: 2000,
    windowMs: 1000,
    challenges: ['TAP', 'TAP', 'COLOR_MATCH', 'COLOR_MATCH', 'HOLD', 'HOLD'],
    description: 'Tap, match, and hold!',
    mechanic: 'New: Hold — press and keep finger down for 500 ms',
  },
  {
    level: 5,
    name: 'ELITE',
    accentColor: '#F43F5E',
    trialsCount: 8,
    minDelayMs: 500,
    maxDelayMs: 1800,
    windowMs: 800,
    challenges: ['TAP', 'COLOR_MATCH', 'HOLD', 'DOUBLE_TAP'],
    description: 'All challenge types — maximum speed!',
    mechanic: 'New: Double Tap — tap twice rapidly when shown "2×"',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export const getLevelConfig = (level: number): LevelConfig =>
  LEVEL_CONFIGS[Math.min(Math.max(level - 1, 0), LEVEL_CONFIGS.length - 1)];

export const generateChallenge = (config: LevelConfig): ChallengeType => {
  const pool = config.challenges;
  return pool[Math.floor(Math.random() * pool.length)];
};

export const LEVEL_MULTIPLIERS = [1.0, 1.2, 1.5, 1.8, 2.5];

export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 7) return 2.0;
  if (streak >= 5) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
};

export const scoreForTrial = (
  timeMs: number,
  challengeType: ChallengeType,
  level: number,
  streak: number
): number => {
  let base: number;
  switch (challengeType) {
    case 'TAP':
      base = Math.max(50, Math.floor(800 - timeMs * 1.5));
      break;
    case 'COLOR_MATCH':
      base = Math.max(80, Math.floor(1000 - timeMs * 1.8));
      break;
    case 'HOLD':
      base = 160; // fixed reward for holding exactly right
      break;
    case 'DOUBLE_TAP':
      base = Math.max(100, Math.floor(1200 - timeMs * 2.0));
      break;
    default:
      base = 50;
  }

  const levelMult = LEVEL_MULTIPLIERS[Math.min(level - 1, LEVEL_MULTIPLIERS.length - 1)];
  const streakMult = getStreakMultiplier(streak);

  return Math.round(base * levelMult * streakMult);
};

export const getReflexTier = (
  timeMs: number
): { title: string; color: string; badge: string } => {
  if (timeMs < 160) return { title: 'NEURAL GOD', color: '#00F0FF', badge: 'SSS' };
  if (timeMs < 200) return { title: 'CYBER RUNNER', color: '#10B981', badge: 'SS' };
  if (timeMs < 240) return { title: 'REFLEX PRO', color: '#8B5CF6', badge: 'S' };
  if (timeMs < 290) return { title: 'SHARP MIND', color: '#F59E0B', badge: 'A' };
  if (timeMs < 360) return { title: 'STANDARD', color: '#CBD5E1', badge: 'B' };
  return { title: 'SLOW SYNAPSE', color: '#F43F5E', badge: 'C' };
};

export const createInitialReactionState = (): ReactionState => ({
  phase: 'READY',
  currentLevel: 1,
  currentLevelTrial: 1,
  trials: [],
  levelTrials: [],
  lastTimeMs: null,
  bestTimeMs: null,
  averageTimeMs: null,
  startTime: 0,
  falseStarts: 0,
  missCount: 0,
  streakCount: 0,
  maxStreak: 0,
  challengeType: 'TAP',
  isDecoy: false,
  holdProgress: 0,
  levelScore: 0,
  totalScore: 0,
});

/** Kept for GameContainer live-score prop */
export const calculateReflexScore = (
  trials: ReactionTrial[],
  falseStarts: number
): number => {
  if (trials.length === 0) return 0;
  const correct = trials.filter((t) => t.correct && t.timeMs > 0);
  if (correct.length === 0) return 50;
  const avg = correct.reduce((s, t) => s + t.timeMs, 0) / correct.length;
  return Math.max(50, Math.floor(1000 - avg * 1.5) - falseStarts * 50);
};
