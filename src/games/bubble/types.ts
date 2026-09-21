export type BubbleColor =
  | 'cyan'
  | 'magenta'
  | 'amber'
  | 'lime'
  | 'purple'
  | 'rose'
  | 'bomb'
  | 'rainbow'
  | 'lightning'
  | 'metal';

export interface GridBubble {
  id: string;
  row: number;
  col: number;
  color: BubbleColor;
  x: number;
  y: number;
  alive: boolean;
}

export interface FlyingBubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
  radius: number;
}

export interface FallingBubble {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
  radius: number;
}

export interface PopParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
}

export interface BubbleLevel {
  level: number;
  name: string;
  totalShots: number;
  availableColors: BubbleColor[];
  grid: (BubbleColor | null)[][];
  preview: string;
}

export interface BubbleState {
  currentLevel: number;
  score: number;
  grid: GridBubble[][];
  shotsLeft: number;
  currentBubble: BubbleColor;
  nextBubble: BubbleColor;
  flyingBubble: FlyingBubble | null;
  fallingBubbles: FallingBubble[];
  particles: PopParticle[];
  foulsUntilDrop: number;
  ceilingRowOffset: number;
  isGameOver: boolean;
  levelCompleted: boolean;
  bubblesPoppedTotal: number;
}
