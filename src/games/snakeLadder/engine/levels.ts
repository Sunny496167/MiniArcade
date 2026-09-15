import { BoardLevel, GridSize } from '../types';

const LEVELS: BoardLevel[] = [
  { id: '8-beginner', name: 'Sunny Steps', gridSize: 8, difficulty: 'Beginner', snakes: { 31: 14, 48: 26, 61: 42 }, ladders: { 3: 18, 11: 29, 22: 45, 36: 55 } },
  { id: '8-standard', name: 'Jungle Run', gridSize: 8, difficulty: 'Standard', snakes: { 24: 8, 39: 17, 54: 33, 62: 41 }, ladders: { 4: 20, 13: 31, 27: 47, 43: 59 } },
  { id: '8-challenge', name: 'Cobra Climb', gridSize: 8, difficulty: 'Challenge', snakes: { 21: 5, 34: 12, 46: 25, 58: 30, 63: 44 }, ladders: { 7: 23, 16: 35, 38: 52 } },
  { id: '10-beginner', name: 'Meadow Trail', gridSize: 10, difficulty: 'Beginner', snakes: { 32: 12, 57: 37, 88: 65, 97: 76 }, ladders: { 2: 23, 8: 30, 21: 42, 44: 67, 52: 74, 71: 91 } },
  { id: '10-standard', name: 'Temple Trek', gridSize: 10, difficulty: 'Standard', snakes: { 25: 6, 47: 19, 64: 39, 86: 53, 98: 78 }, ladders: { 4: 18, 14: 36, 28: 50, 41: 62, 59: 82 } },
  { id: '10-challenge', name: 'Volcano Rush', gridSize: 10, difficulty: 'Challenge', snakes: { 19: 3, 35: 11, 56: 29, 72: 48, 89: 61, 96: 75 }, ladders: { 9: 31, 24: 45, 43: 66, 68: 84 } },
  { id: '12-beginner', name: 'Crystal Coast', gridSize: 12, difficulty: 'Beginner', snakes: { 46: 22, 79: 51, 113: 89, 138: 117 }, ladders: { 3: 28, 15: 40, 32: 58, 61: 86, 74: 103, 98: 126 } },
  { id: '12-standard', name: 'Sky Kingdom', gridSize: 12, difficulty: 'Standard', snakes: { 29: 9, 54: 26, 83: 49, 109: 77, 135: 108 }, ladders: { 6: 25, 18: 45, 37: 65, 57: 81, 92: 119 } },
  { id: '12-challenge', name: 'Dragon Summit', gridSize: 12, difficulty: 'Challenge', snakes: { 26: 4, 48: 20, 69: 38, 94: 63, 118: 84, 141: 111 }, ladders: { 11: 34, 30: 55, 52: 78, 87: 106 } },
];

export const getLevelsForGrid = (gridSize: GridSize) => LEVELS.filter((level) => level.gridSize === gridSize);
export const getLevel = (id: string) => LEVELS.find((level) => level.id === id) ?? LEVELS[0];
