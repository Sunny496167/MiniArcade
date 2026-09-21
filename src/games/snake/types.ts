export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface FoodItem extends Position {
  isBonus?: boolean;
  points: number;
}

export type BorderMode = 'full' | 'none' | 'mixed';

export interface SnakePalette {
  id: string;
  name: string;
  headColor: string;
  bodyColor: string;
  glowColor: string;
  eyeColor?: string;
}

export interface SnakeState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: FoodItem;
  bonusFood: FoodItem | null;
  score: number;
  applesEaten: number;
  bonusEaten: number;
  isGameOver: boolean;
  speed: number;
  borderMode: BorderMode;
  palette?: SnakePalette;
}

