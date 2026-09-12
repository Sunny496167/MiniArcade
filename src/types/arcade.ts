export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'strategy' | 'reaction' | 'classic';

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface GameMetadata {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  iconName: string;
  accentColor: string;
  secondaryColor: string;
  baseXp: number;
  featured?: boolean;
  isNew?: boolean;
  howToPlay: string[];
  controlsDescription: string;
}

export interface GameStats {
  timesPlayed: number;
  highScore: number;
  totalScore: number;
  lastPlayed?: number;
  contextualBest?: Record<string, number | string>;
}

export interface PlayerProfile {
  username: string;
  avatarSeed: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  dailyStreak: number;
  lastActiveDate: string;
  totalPlayTimeSeconds: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: GameCategory | 'general';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  targetProgress?: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  gameId: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  xpReward: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  vibrationIntensity: 'light' | 'medium' | 'heavy';
  reducedMotion: boolean;
}

export interface GameContextualStat {
  label: string;
  value: string | number;
  isHighlight?: boolean;
}

export interface GameResultData {
  score: number;
  isNewBest: boolean;
  xpEarned: number;
  stats: GameContextualStat[];
}

export type GameLifecycleState = 'INTRO' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'RESULT';
