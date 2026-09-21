import { PacmanLevel, PacmanMazeTheme } from '../types';

export const TOTAL_PACMAN_LEVELS = 30;

const THEMES: PacmanMazeTheme[] = [
  {
    wallColor: '#2563EB',
    wallGlow: '#60A5FA',
    gateColor: '#F472B6',
    dotColor: '#FDE047',
    energizerColor: '#F87171',
    bg: '#050B14',
  },
  {
    wallColor: '#D946EF',
    wallGlow: '#F472B6',
    gateColor: '#38BDF8',
    dotColor: '#A7F3D0',
    energizerColor: '#FBBF24',
    bg: '#0F071A',
  },
  {
    wallColor: '#10B981',
    wallGlow: '#34D399',
    gateColor: '#FBBF24',
    dotColor: '#FDE68A',
    energizerColor: '#F43F5E',
    bg: '#04120D',
  },
  {
    wallColor: '#F59E0B',
    wallGlow: '#FCD34D',
    gateColor: '#EC4899',
    dotColor: '#67E8F9',
    energizerColor: '#E11D48',
    bg: '#140D04',
  },
  {
    wallColor: '#8B5CF6',
    wallGlow: '#A78BFA',
    gateColor: '#10B981',
    dotColor: '#FEF08A',
    energizerColor: '#06B6D4',
    bg: '#0D081C',
  },
  {
    wallColor: '#EF4444',
    wallGlow: '#F87171',
    gateColor: '#FACC15',
    dotColor: '#FFFFFF',
    energizerColor: '#38BDF8',
    bg: '#140404',
  },
];

const FRUITS = [
  { name: 'Cherry', pts: 100 },
  { name: 'Strawberry', pts: 300 },
  { name: 'Orange', pts: 500 },
  { name: 'Apple', pts: 700 },
  { name: 'Melon', pts: 1000 },
  { name: 'Galaxian', pts: 2000 },
  { name: 'Bell', pts: 3000 },
  { name: 'Key', pts: 5000 },
];

export const PACMAN_LEVELS: PacmanLevel[] = Array.from({ length: TOTAL_PACMAN_LEVELS }, (_, i) => {
  const levelNum = i + 1;
  const themeIndex = Math.floor(i / 5) % THEMES.length;
  const fruit = FRUITS[Math.min(FRUITS.length - 1, Math.floor(i / 4))];

  // Progressive arcade difficulty
  // Pacman speed scales from 8.2 up to 10.2 tiles/sec for snappy classic arcade velocity
  const pacmanSpeed = Math.min(10.2, 8.2 + (levelNum - 1) * 0.07);
  // Ghost speed scales from 7.2 up to 9.6 tiles/sec
  const ghostSpeed = Math.min(9.6, 7.2 + (levelNum - 1) * 0.08);
  // Frightened duration drops from 8000ms to 2000ms
  const frightenedDurationMs = Math.max(2000, 8000 - (levelNum - 1) * 210);

  const isBossLevel = levelNum % 5 === 0;

  return {
    level: levelNum,
    name: isBossLevel ? `CHALLENGE: Sector ${Math.ceil(levelNum / 5)}` : `Maze ${levelNum}`,
    theme: THEMES[themeIndex],
    ghostSpeed,
    pacmanSpeed,
    frightenedDurationMs,
    fruitType: fruit.name,
    fruitPoints: fruit.pts,
    preview: isBossLevel
      ? `High-velocity ghosts with short ${Math.round(frightenedDurationMs / 1000)}s energizer windows!`
      : `Clear all dots and eat the ${fruit.name} (+${fruit.pts} pts)!`,
  };
});

export const getPacmanLevel = (lvl: number): PacmanLevel => {
  const clamped = Math.max(1, Math.min(TOTAL_PACMAN_LEVELS, lvl));
  return PACMAN_LEVELS[clamped - 1] || PACMAN_LEVELS[0];
};
