export type GridSize = 8 | 10 | 12;
export type PlayerKind = 'human' | 'computer';
export type GamePhase = 'setup' | 'awaiting-roll' | 'rolling' | 'moving' | 'game-over';

export interface BoardLevel {
  id: string;
  name: string;
  gridSize: GridSize;
  difficulty: 'Beginner' | 'Standard' | 'Challenge';
  snakes: Record<number, number>;
  ladders: Record<number, number>;
}

export interface SnakeLadderPlayer {
  id: string;
  name: string;
  kind: PlayerKind;
  color: string;
  position: number;
  path?: number[];
}

export interface MatchSetup {
  gridSize: GridSize;
  levelId: string;
  humanCount: number;
  computerCount: number;
}

export interface SnakeLadderState {
  players: SnakeLadderPlayer[];
  currentPlayerIndex: number;
  diceValue: number | null;
  phase: GamePhase;
  winnerId: string | null;
  message: string;
  moveCount: number;
}
