export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  merged?: boolean;
}

export interface State2048 {
  board: (number | null)[][];
  score: number;
  moves: number;
  highestTile: number;
  isGameOver: boolean;
  hasWon: boolean;
  history?: {
    board: (number | null)[][];
    score: number;
    moves: number;
  };
}
