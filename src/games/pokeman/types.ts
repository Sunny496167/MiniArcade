export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten';

export interface Ghost {
  name: GhostName;
  x: number; // grid float coordinates
  y: number;
  dir: Direction;
  targetX: number;
  targetY: number;
  mode: GhostMode;
  color: string;
  inHouse: boolean;
  houseExitTimer: number; // seconds until exit
  speed: number; // tiles per second
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  text: string;
  timer: number;
}

export interface PacmanState {
  currentLevel: number;
  score: number;
  lives: number;
  pacmanX: number; // grid float coordinates
  pacmanY: number;
  pacmanDir: Direction;
  nextDir: Direction;
  mouthAngle: number; // 0 to 45 deg
  chompIncreasing: boolean;
  ghosts: Ghost[];
  dotsGrid: boolean[][]; // true = dot present
  energizersGrid: boolean[][]; // true = energizer present
  dotsRemaining: number;
  totalDots: number;
  frightenedTimeRemaining: number; // ms
  ghostsEatenStreak: number; // 1, 2, 3, 4 (200, 400, 800, 1600 pts)
  fruitActive: boolean;
  fruitX: number;
  fruitY: number;
  fruitType: string;
  fruitPoints: number;
  fruitTimer: number; // ms
  scorePopups: ScorePopup[];
  isDying: boolean;
  deathAnimTimer: number;
  levelCompleted: boolean;
  isGameOver: boolean;
}

export interface PacmanMazeTheme {
  wallColor: string;
  wallGlow: string;
  gateColor: string;
  dotColor: string;
  energizerColor: string;
  bg: string;
}

export interface PacmanLevel {
  level: number;
  name: string;
  theme: PacmanMazeTheme;
  ghostSpeed: number;
  pacmanSpeed: number;
  frightenedDurationMs: number;
  fruitType: string;
  fruitPoints: number;
  preview: string;
}
