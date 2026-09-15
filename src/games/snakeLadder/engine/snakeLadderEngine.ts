import { getLevel } from './levels';
import { MatchSetup, SnakeLadderPlayer, SnakeLadderState } from '../types';

const PLAYER_COLORS = ['#00F0FF', '#FF007A', '#F59E0B', '#8B5CF6'];
const COMPUTER_NAMES = ['Nova', 'Bolt', 'Pixel'];

export const createPlayers = (setup: MatchSetup): SnakeLadderPlayer[] => {
  const humans = Array.from({ length: setup.humanCount }, (_, index) => ({
    id: `human-${index + 1}`, name: setup.humanCount === 1 ? 'You' : `Player ${index + 1}`,
    kind: 'human' as const, color: PLAYER_COLORS[index], position: 0,
  }));
  const computers = Array.from({ length: setup.computerCount }, (_, index) => ({
    id: `computer-${index + 1}`, name: COMPUTER_NAMES[index], kind: 'computer' as const,
    color: PLAYER_COLORS[humans.length + index], position: 0,
  }));
  return [...humans, ...computers];
};

export const createGameState = (setup: MatchSetup): SnakeLadderState => ({
  players: createPlayers(setup), currentPlayerIndex: 0, diceValue: null, phase: 'awaiting-roll',
  winnerId: null, message: 'Roll the dice to begin!', moveCount: 0,
});

export const rollDice = () => Math.floor(Math.random() * 6) + 1;

export const resolveTurn = (state: SnakeLadderState, roll: number, levelId: string): SnakeLadderState => {
  const level = getLevel(levelId);
  const finish = level.gridSize * level.gridSize;
  const player = state.players[state.currentPlayerIndex];
  const attemptedPosition = player.position + roll;
  const canMove = attemptedPosition <= finish;
  let position = canMove ? attemptedPosition : player.position;
  let event = canMove ? `${player.name} moved ${roll} spaces.` : `${player.name} needs an exact roll to finish.`;
  
  const path: number[] = [player.position];
  if (canMove) {
    for (let i = player.position + 1; i <= attemptedPosition; i++) {
      path.push(i);
    }
  }

  if (position !== finish && level.ladders[position]) {
    position = level.ladders[position]; event = `${player.name} climbed a ladder to ${position}!`;
    path.push(position);
  } else if (position !== finish && level.snakes[position]) {
    position = level.snakes[position]; event = `${player.name} slid down a snake to ${position}.`;
    path.push(position);
  }

  const players = state.players.map((item, index) => index === state.currentPlayerIndex ? { ...item, position, path } : { ...item, path: undefined });
  const winnerId = position === finish ? player.id : null;
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
  return {
    ...state, players, diceValue: roll, winnerId, moveCount: state.moveCount + 1,
    currentPlayerIndex: winnerId ? state.currentPlayerIndex : nextPlayerIndex,
    phase: winnerId ? 'game-over' : 'awaiting-roll',
    message: winnerId ? `${player.name} wins the game!` : event,
  };
};
