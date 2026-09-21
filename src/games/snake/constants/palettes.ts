import { SnakePalette } from '../types';

export const SNAKE_PALETTES: SnakePalette[] = [
  {
    id: 'cyber_cyan',
    name: 'Cyber Cyan',
    headColor: '#00F0FF',
    bodyColor: '#10B981',
    glowColor: '#00F0FF',
    eyeColor: '#FFFFFF',
  },
  {
    id: 'electric_violet',
    name: 'Electric Violet',
    headColor: '#C084FC',
    bodyColor: '#EC4899',
    glowColor: '#A855F7',
    eyeColor: '#FFFFFF',
  },
  {
    id: 'solar_inferno',
    name: 'Solar Flare',
    headColor: '#FBBF24',
    bodyColor: '#EA580C',
    glowColor: '#F59E0B',
    eyeColor: '#111827',
  },
  {
    id: 'toxic_matrix',
    name: 'Toxic Matrix',
    headColor: '#4ADE80',
    bodyColor: '#15803D',
    glowColor: '#22C55E',
    eyeColor: '#FFFFFF',
  },
  {
    id: 'crimson_fury',
    name: 'Crimson Fury',
    headColor: '#EF4444',
    bodyColor: '#991B1B',
    glowColor: '#F87171',
    eyeColor: '#FEF08A',
  },
  {
    id: 'vaporwave_teal',
    name: 'Vapor Wave',
    headColor: '#2DD4BF',
    bodyColor: '#6366F1',
    glowColor: '#38BDF8',
    eyeColor: '#FFFFFF',
  },
  {
    id: 'golden_dragon',
    name: 'Golden Dragon',
    headColor: '#FDE047',
    bodyColor: '#CA8A04',
    glowColor: '#EAB308',
    eyeColor: '#1E1B4B',
  },
  {
    id: 'hyper_pink',
    name: 'Hyper Magenta',
    headColor: '#F43F5E',
    bodyColor: '#8B5CF6',
    glowColor: '#FB7185',
    eyeColor: '#FFFFFF',
  },
];

export function getRandomSnakePalette(): SnakePalette {
  const index = Math.floor(Math.random() * SNAKE_PALETTES.length);
  return SNAKE_PALETTES[index];
}
