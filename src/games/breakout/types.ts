export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isSticky?: boolean; // If caught by sticky paddle
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
  type: number; // 0=Empty, 1=Standard, 2=Hard, 3=Titanium, 4=Unbreakable, 5=Explosive, 6=Surprise
  hp: number;
}

export type PowerUpType = 'widePaddle' | 'multiBall' | 'laser' | 'sticky';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  color: string;
}

export interface Laser {
  x: number;
  y: number;
  vy: number;
}

export interface BreakoutState {
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  lasers: Laser[];
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  bricksDestroyed: number;
  isGameOver: boolean;
  isWon: boolean;
  difficulty: 'Novice' | 'Advanced' | 'Expert';
  stage: number; // 1 to 10
  powerUpActive: {
    laser: number; // Duration left
    sticky: number; // Duration left
  };
}
