import { Ball, Paddle, Brick, PowerUp, BreakoutState } from '../types';
import { COLORS } from '../../../constants/theme';

export const CANVAS_WIDTH = 340;
export const CANVAS_HEIGHT = 440;
export const PADDLE_Y = 400;
export const PADDLE_HEIGHT = 12;
export const DEFAULT_PADDLE_WIDTH = 75;

export const createInitialBricks = (): Brick[] => {
  const bricks: Brick[] = [];
  const rows = 5;
  const cols = 6;
  const brickWidth = 48;
  const brickHeight = 16;
  const paddingX = 7;
  const paddingY = 8;
  const startX = 8;
  const startY = 30;

  const rowColors = [
    COLORS.magenta,
    COLORS.amber,
    COLORS.cyan,
    COLORS.lime,
    COLORS.purple,
  ];

  const rowPoints = [50, 40, 30, 20, 10];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        id: `brick-${r}-${c}`,
        x: startX + c * (brickWidth + paddingX),
        y: startY + r * (brickHeight + paddingY),
        width: brickWidth,
        height: brickHeight,
        color: rowColors[r],
        points: rowPoints[r],
        alive: true,
      });
    }
  }

  return bricks;
};

export const createInitialBreakoutState = (): BreakoutState => {
  return {
    paddle: {
      x: CANVAS_WIDTH / 2 - DEFAULT_PADDLE_WIDTH / 2,
      width: DEFAULT_PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      targetWidth: DEFAULT_PADDLE_WIDTH,
    },
    balls: [
      {
        x: CANVAS_WIDTH / 2,
        y: PADDLE_Y - 14,
        vx: 3 * (Math.random() > 0.5 ? 1 : -1),
        vy: -4,
        radius: 6,
      },
    ],
    bricks: createInitialBricks(),
    powerUps: [],
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    bricksDestroyed: 0,
    isGameOver: false,
    isWon: false,
  };
};

export function updateBreakout(
  state: BreakoutState
): {
  nextState: BreakoutState;
  brickHit: boolean;
  paddleHit: boolean;
  lostLife: boolean;
  won: boolean;
  powerUpCollected: boolean;
} {
  if (state.isGameOver || state.isWon) {
    return {
      nextState: state,
      brickHit: false,
      paddleHit: false,
      lostLife: false,
      won: false,
      powerUpCollected: false,
    };
  }

  let brickHit = false;
  let paddleHit = false;
  let lostLife = false;
  let powerUpCollected = false;

  let newScore = state.score;
  let newCombo = state.combo;
  let newMaxCombo = state.maxCombo;
  let newBricksDestroyed = state.bricksDestroyed;
  const currentBricks = state.bricks.map((b) => ({ ...b }));
  const spawnedPowerUps: PowerUp[] = [...state.powerUps];

  const updatedBalls: Ball[] = [];

  for (const ball of state.balls) {
    let bx = ball.x + ball.vx;
    let by = ball.y + ball.vy;
    let bvx = ball.vx;
    let bvy = ball.vy;

    // Left and Right wall collision
    if (bx - ball.radius <= 0) {
      bx = ball.radius;
      bvx = Math.abs(bvx);
    } else if (bx + ball.radius >= CANVAS_WIDTH) {
      bx = CANVAS_WIDTH - ball.radius;
      bvx = -Math.abs(bvx);
    }

    // Top wall collision
    if (by - ball.radius <= 0) {
      by = ball.radius;
      bvy = Math.abs(bvy);
    }

    // Paddle collision
    const paddle = state.paddle;
    if (
      by + ball.radius >= PADDLE_Y &&
      by - ball.radius <= PADDLE_Y + paddle.height &&
      bx >= paddle.x &&
      bx <= paddle.x + paddle.width
    ) {
      paddleHit = true;
      bvy = -Math.abs(bvy);
      by = PADDLE_Y - ball.radius;

      // Deflect angle based on where it hit the paddle
      const hitCenter = paddle.x + paddle.width / 2;
      const offset = (bx - hitCenter) / (paddle.width / 2);
      bvx = offset * 5.5;

      // Keep speed normalized
      if (Math.abs(bvx) < 1.5) bvx = bvx < 0 ? -1.5 : 1.5;
    }

    // Brick collisions
    for (const brick of currentBricks) {
      if (!brick.alive) continue;

      if (
        bx + ball.radius >= brick.x &&
        bx - ball.radius <= brick.x + brick.width &&
        by + ball.radius >= brick.y &&
        by - ball.radius <= brick.y + brick.height
      ) {
        brick.alive = false;
        brickHit = true;
        bvy = -bvy;
        newCombo += 1;
        newMaxCombo = Math.max(newMaxCombo, newCombo);
        newBricksDestroyed += 1;
        const comboMultiplier = Math.min(newCombo, 5);
        newScore += brick.points * comboMultiplier;

        // 20% Chance of dropping a power-up
        if (Math.random() < 0.22) {
          const types: ('widePaddle' | 'multiBall' | 'bonusPoints')[] = [
            'widePaddle',
            'multiBall',
            'bonusPoints',
          ];
          const selected = types[Math.floor(Math.random() * types.length)];
          spawnedPowerUps.push({
            id: `pow-${Date.now()}-${Math.random()}`,
            type: selected,
            x: brick.x + brick.width / 2,
            y: brick.y + brick.height,
            vy: 2.2,
            color:
              selected === 'multiBall'
                ? COLORS.cyan
                : selected === 'widePaddle'
                ? COLORS.amber
                : COLORS.lime,
          });
        }
        break;
      }
    }

    // Ball out of bottom
    if (by - ball.radius < CANVAS_HEIGHT) {
      updatedBalls.push({
        x: bx,
        y: by,
        vx: bvx,
        vy: bvy,
        radius: ball.radius,
      });
    }
  }

  // Check lives lost if all balls drop
  let currentLives = state.lives;
  let isGameOver = false;

  if (updatedBalls.length === 0) {
    lostLife = true;
    currentLives -= 1;
    newCombo = 0;

    if (currentLives <= 0) {
      isGameOver = true;
    } else {
      // Respawn 1 ball
      updatedBalls.push({
        x: state.paddle.x + state.paddle.width / 2,
        y: PADDLE_Y - 14,
        vx: 3 * (Math.random() > 0.5 ? 1 : -1),
        vy: -4,
        radius: 6,
      });
    }
  }

  // Update Falling Power-ups
  const activePowerUps: PowerUp[] = [];
  let newPaddleWidth = state.paddle.width;

  for (const pow of spawnedPowerUps) {
    const nextY = pow.y + pow.vy;

    // Collect power-up with paddle
    if (
      nextY >= PADDLE_Y &&
      nextY <= PADDLE_Y + state.paddle.height + 8 &&
      pow.x >= state.paddle.x &&
      pow.x <= state.paddle.x + state.paddle.width
    ) {
      powerUpCollected = true;
      if (pow.type === 'widePaddle') {
        newPaddleWidth = Math.min(newPaddleWidth + 24, 130);
      } else if (pow.type === 'multiBall') {
        if (updatedBalls.length > 0) {
          const lead = updatedBalls[0];
          updatedBalls.push(
            { x: lead.x, y: lead.y, vx: lead.vx * -0.8, vy: lead.vy, radius: 6 },
            { x: lead.x, y: lead.y, vx: lead.vx * 1.2, vy: lead.vy * 0.9, radius: 6 }
          );
        }
      } else if (pow.type === 'bonusPoints') {
        newScore += 100;
      }
    } else if (nextY < CANVAS_HEIGHT) {
      activePowerUps.push({ ...pow, y: nextY });
    }
  }

  // Check Win condition: All bricks destroyed
  const aliveCount = currentBricks.filter((b) => b.alive).length;
  const won = aliveCount === 0;

  return {
    nextState: {
      paddle: {
        ...state.paddle,
        width: newPaddleWidth,
      },
      balls: updatedBalls,
      bricks: currentBricks,
      powerUps: activePowerUps,
      score: newScore,
      lives: currentLives,
      combo: newCombo,
      maxCombo: newMaxCombo,
      bricksDestroyed: newBricksDestroyed,
      isGameOver,
      isWon: won,
    },
    brickHit,
    paddleHit,
    lostLife,
    won,
    powerUpCollected,
  };
}
