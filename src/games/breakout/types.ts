export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
  targetWidth: number;
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  alive: boolean;
}

export interface PowerUp {
  id: string;
  type: 'widePaddle' | 'multiBall' | 'bonusPoints';
  x: number;
  y: number;
  vy: number;
  color: string;
}

export interface BreakoutState {
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  bricksDestroyed: number;
  isGameOver: boolean;
  isWon: boolean;
}
