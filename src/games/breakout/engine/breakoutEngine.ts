import { Ball, Paddle, Brick, PowerUp, BreakoutState, Laser, PowerUpType } from '../types';
import { COLORS } from '../../../constants/theme';
import { loadStage } from './levels';

export const CANVAS_WIDTH = 340;
export const CANVAS_HEIGHT = 440;
export const PADDLE_Y = 400;
export const PADDLE_HEIGHT = 12;
export const DEFAULT_PADDLE_WIDTH = 75;

export const createInitialBreakoutState = (
  difficulty: 'Novice' | 'Advanced' | 'Expert' = 'Novice',
  stage: number = 1
): BreakoutState => {
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
    bricks: loadStage(difficulty, stage),
    powerUps: [],
    lasers: [],
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    bricksDestroyed: 0,
    isGameOver: false,
    isWon: false,
    difficulty,
    stage,
    powerUpActive: {
      laser: 0,
      sticky: 0,
    },
  };
};

export const launchStickyBalls = (state: BreakoutState): BreakoutState => {
  return {
    ...state,
    balls: state.balls.map(b => 
      b.isSticky ? { ...b, isSticky: false, vy: -4, vx: 3 * (Math.random() > 0.5 ? 1 : -1) } : b
    )
  };
};

export const fireLaser = (state: BreakoutState): BreakoutState => {
  if (state.powerUpActive.laser <= 0) return state;
  const paddle = state.paddle;
  return {
    ...state,
    lasers: [
      ...state.lasers,
      { x: paddle.x + 8, y: PADDLE_Y, vy: -6 },
      { x: paddle.x + paddle.width - 8, y: PADDLE_Y, vy: -6 }
    ]
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
      brickHit: false, paddleHit: false, lostLife: false, won: false, powerUpCollected: false,
    };
  }

  let brickHit = false;
  let paddleHit = false;
  let lostLife = false;
  let powerUpCollected = false;
  let nextStageTriggered = false;

  let newScore = state.score;
  let newCombo = state.combo;
  let newMaxCombo = state.maxCombo;
  let newBricksDestroyed = state.bricksDestroyed;
  
  const currentBricks = state.bricks.map((b) => ({ ...b }));
  const spawnedPowerUps: PowerUp[] = [...state.powerUps];
  const updatedLasers: Laser[] = [];

  const updatedBalls: Ball[] = [];

  // Update Lasers
  for (const laser of state.lasers) {
    let ly = laser.y + laser.vy;
    let hit = false;
    for (const brick of currentBricks) {
      if (!brick.alive) continue;
      if (
        laser.x >= brick.x && laser.x <= brick.x + brick.width &&
        ly >= brick.y && ly <= brick.y + brick.height
      ) {
        hit = true;
        damageBrick(brick);
        break;
      }
    }
    if (!hit && ly > 0) {
      updatedLasers.push({ ...laser, y: ly });
    }
  }

  // Update Balls
  for (const ball of state.balls) {
    if (ball.isSticky) {
      // Follow paddle
      updatedBalls.push({
        ...ball,
        x: Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, state.paddle.x + state.paddle.width / 2))
      });
      continue;
    }

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
      bx <= paddle.x + paddle.width &&
      bvy > 0 // Only hit when going down
    ) {
      paddleHit = true;
      if (state.powerUpActive.sticky > 0) {
        updatedBalls.push({
          x: bx, y: PADDLE_Y - ball.radius, vx: 0, vy: 0, radius: ball.radius, isSticky: true
        });
        continue;
      }

      bvy = -Math.abs(bvy);
      by = PADDLE_Y - ball.radius;
      const hitCenter = paddle.x + paddle.width / 2;
      const offset = (bx - hitCenter) / (paddle.width / 2);
      bvx = offset * 5.5;
      if (Math.abs(bvx) < 1.5) bvx = bvx < 0 ? -1.5 : 1.5;
    }

    // Brick collisions
    let collisionOccurred = false;
    for (const brick of currentBricks) {
      if (!brick.alive) continue;

      if (
        bx + ball.radius >= brick.x &&
        bx - ball.radius <= brick.x + brick.width &&
        by + ball.radius >= brick.y &&
        by - ball.radius <= brick.y + brick.height
      ) {
        // Simple bounce based on center proximity
        const overlapX = Math.min(bx + ball.radius - brick.x, brick.x + brick.width - (bx - ball.radius));
        const overlapY = Math.min(by + ball.radius - brick.y, brick.y + brick.height - (by - ball.radius));
        
        if (overlapX < overlapY) bvx = -bvx;
        else bvy = -bvy;

        damageBrick(brick);
        collisionOccurred = true;
        break;
      }
    }

    // Ball out of bottom
    if (by - ball.radius < CANVAS_HEIGHT) {
      updatedBalls.push({
        x: bx, y: by, vx: bvx, vy: bvy, radius: ball.radius,
      });
    }
  }

  function damageBrick(brick: Brick) {
    if (brick.type === 4) return; // Unbreakable
    brickHit = true;
    brick.hp -= 1;
    if (brick.hp <= 0) {
      brick.alive = false;
      newCombo += 1;
      newMaxCombo = Math.max(newMaxCombo, newCombo);
      newBricksDestroyed += 1;
      newScore += brick.points * Math.min(newCombo, 5);

      if (brick.type === 5) triggerExplosion(brick);
      rollPowerUp(brick);
    }
  }

  function triggerExplosion(source: Brick) {
    const range = 60;
    const cx = source.x + source.width / 2;
    const cy = source.y + source.height / 2;

    for (const other of currentBricks) {
      if (!other.alive || other.id === source.id || other.type === 4) continue;
      const ox = other.x + other.width / 2;
      const oy = other.y + other.height / 2;
      const dist = Math.sqrt((cx - ox)**2 + (cy - oy)**2);
      if (dist < range) {
        other.hp = 0;
        other.alive = false;
        newBricksDestroyed += 1;
        newScore += other.points;
        rollPowerUp(other);
      }
    }
  }

  function rollPowerUp(brick: Brick) {
    const isSurprise = brick.type === 6;
    if (isSurprise || Math.random() < 0.15) {
      const types: PowerUpType[] = ['widePaddle', 'multiBall', 'laser', 'sticky'];
      const selected = types[Math.floor(Math.random() * types.length)];
      
      let color = COLORS.cyan;
      if (selected === 'widePaddle') color = COLORS.amber;
      if (selected === 'laser') color = COLORS.red;
      if (selected === 'sticky') color = COLORS.lime;

      spawnedPowerUps.push({
        id: `pow-${Date.now()}-${Math.random()}`,
        type: selected,
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height,
        vy: 2.2,
        color,
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
  let newLaserActive = Math.max(0, state.powerUpActive.laser - 16); // Decays per frame (~16ms)
  let newStickyActive = Math.max(0, state.powerUpActive.sticky - 16);

  for (const pow of spawnedPowerUps) {
    const nextY = pow.y + pow.vy;
    if (
      nextY >= PADDLE_Y &&
      nextY <= PADDLE_Y + state.paddle.height + 8 &&
      pow.x >= state.paddle.x &&
      pow.x <= state.paddle.x + state.paddle.width
    ) {
      powerUpCollected = true;
      if (pow.type === 'widePaddle') {
        newPaddleWidth = Math.min(newPaddleWidth + 30, 150);
      } else if (pow.type === 'multiBall') {
        if (updatedBalls.length > 0) {
          const lead = updatedBalls[0];
          updatedBalls.push(
            { x: lead.x, y: lead.y, vx: (lead.vx || 2) * -0.8, vy: (lead.vy || -4), radius: 6 },
            { x: lead.x, y: lead.y, vx: (lead.vx || -2) * 1.2, vy: (lead.vy || -4) * 0.9, radius: 6 }
          );
        } else {
           updatedBalls.push({ x: pow.x, y: PADDLE_Y - 14, vx: 2, vy: -4, radius: 6 });
        }
      } else if (pow.type === 'laser') {
        newLaserActive = 10000; // 10 seconds
      } else if (pow.type === 'sticky') {
        newStickyActive = 15000; // 15 seconds
      }
    } else if (nextY < CANVAS_HEIGHT) {
      activePowerUps.push({ ...pow, y: nextY });
    }
  }

  // Shrink paddle back slowly
  if (newPaddleWidth > DEFAULT_PADDLE_WIDTH) {
    newPaddleWidth -= 0.05;
  }

  // Check Win condition: All breakable bricks destroyed
  const breakableAlive = currentBricks.filter((b) => b.alive && b.type !== 4).length;
  let newStage = state.stage;
  let won = false;

  if (breakableAlive === 0 && !isGameOver) {
    if (state.stage >= 10) {
      won = true;
    } else {
      nextStageTriggered = true;
      newStage += 1;
      // Reset balls and paddle for new stage, clear powerups
      updatedBalls.length = 0;
      updatedBalls.push({
        x: CANVAS_WIDTH / 2, y: PADDLE_Y - 14, vx: 3, vy: -4, radius: 6
      });
      activePowerUps.length = 0;
      updatedLasers.length = 0;
      currentBricks.length = 0;
      currentBricks.push(...loadStage(state.difficulty, newStage));
    }
  }

  return {
    nextState: {
      paddle: {
        ...state.paddle,
        width: newPaddleWidth,
      },
      balls: updatedBalls,
      bricks: currentBricks,
      powerUps: activePowerUps,
      lasers: updatedLasers,
      score: newScore,
      lives: currentLives,
      combo: newCombo,
      maxCombo: newMaxCombo,
      bricksDestroyed: newBricksDestroyed,
      isGameOver,
      isWon: won,
      difficulty: state.difficulty,
      stage: newStage,
      powerUpActive: {
        laser: newLaserActive,
        sticky: newStickyActive,
      }
    },
    brickHit,
    paddleHit,
    lostLife,
    won,
    powerUpCollected,
  };
}
