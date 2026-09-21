import { Ball, Paddle, Brick, PowerUp, BreakoutState, Laser, PowerUpType } from '../types';
import { COLORS } from '../../../constants/theme';
import { loadStage } from './levels';

export const CANVAS_WIDTH = 340;
export const CANVAS_HEIGHT = 440;
export const PADDLE_Y = 400;
export const PADDLE_HEIGHT = 12;
export const DEFAULT_PADDLE_WIDTH = 75;
export const BASE_BALL_SPEED = 5.2;

export const createInitialBreakoutState = (
  difficulty: 'Novice' | 'Advanced' | 'Expert' = 'Novice',
  stage: number = 1
): BreakoutState => {
  const initialSpeed = BASE_BALL_SPEED;
  const initialAngle = (Math.random() > 0.5 ? 1 : -1) * 0.5; // ~28 degrees
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
        vx: initialSpeed * Math.sin(initialAngle),
        vy: -initialSpeed * Math.cos(initialAngle),
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
      fireball: 0,
      megaBall: 0,
      slowMo: 0,
    },
    hasSafetyShield: false,
  };
};

export const launchStickyBalls = (state: BreakoutState): BreakoutState => {
  const targetSpeed = getTargetBallSpeed(state);
  return {
    ...state,
    balls: state.balls.map((b) => {
      if (!b.isSticky) return b;
      const angle = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3);
      return {
        ...b,
        isSticky: false,
        vx: targetSpeed * Math.sin(angle),
        vy: -targetSpeed * Math.cos(angle),
      };
    }),
  };
};

export const fireLaser = (state: BreakoutState): BreakoutState => {
  if (state.powerUpActive.laser <= 0) return state;
  const paddle = state.paddle;
  return {
    ...state,
    lasers: [
      ...state.lasers,
      { x: paddle.x + 8, y: PADDLE_Y, vy: -7 },
      { x: paddle.x + paddle.width - 8, y: PADDLE_Y, vy: -7 },
    ],
  };
};

function getTargetBallSpeed(state: BreakoutState): number {
  let speed = BASE_BALL_SPEED + (state.stage - 1) * 0.12;
  if (state.powerUpActive.slowMo > 0) {
    speed *= 0.68; // 32% slower for slow-mo
  }
  return speed;
}

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
  let nextStageTriggered = false;

  let newScore = state.score;
  let newCombo = state.combo;
  let newMaxCombo = state.maxCombo;
  let newBricksDestroyed = state.bricksDestroyed;
  let hasShield = state.hasSafetyShield;

  const currentBricks = state.bricks.map((b) => ({ ...b }));
  const spawnedPowerUps: PowerUp[] = [...state.powerUps];
  const updatedLasers: Laser[] = [];
  const updatedBalls: Ball[] = [];

  const targetSpeed = getTargetBallSpeed(state);
  const isFireballActive = state.powerUpActive.fireball > 0;
  const isMegaBallActive = state.powerUpActive.megaBall > 0;

  // Update Lasers
  for (const laser of state.lasers) {
    const ly = laser.y + laser.vy;
    let hit = false;
    for (const brick of currentBricks) {
      if (!brick.alive) continue;
      if (
        laser.x >= brick.x &&
        laser.x <= brick.x + brick.width &&
        ly >= brick.y &&
        ly <= brick.y + brick.height
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
    const effectiveRadius = isMegaBallActive ? 14 : 6;

    if (ball.isSticky) {
      // Follow paddle
      updatedBalls.push({
        ...ball,
        radius: effectiveRadius,
        isFireball: isFireballActive,
        isMegaBall: isMegaBallActive,
        x: Math.max(
          effectiveRadius,
          Math.min(CANVAS_WIDTH - effectiveRadius, state.paddle.x + state.paddle.width / 2)
        ),
      });
      continue;
    }

    let bx = ball.x + ball.vx;
    let by = ball.y + ball.vy;
    let bvx = ball.vx;
    let bvy = ball.vy;

    // Left and Right wall collision
    if (bx - effectiveRadius <= 0) {
      bx = effectiveRadius;
      bvx = Math.abs(bvx);
    } else if (bx + effectiveRadius >= CANVAS_WIDTH) {
      bx = CANVAS_WIDTH - effectiveRadius;
      bvx = -Math.abs(bvx);
    }

    // Top wall collision
    if (by - effectiveRadius <= 0) {
      by = effectiveRadius;
      bvy = Math.abs(bvy);
    }

    // Paddle collision
    const paddle = state.paddle;
    if (
      by + effectiveRadius >= PADDLE_Y &&
      by - effectiveRadius <= PADDLE_Y + paddle.height &&
      bx >= paddle.x &&
      bx <= paddle.x + paddle.width &&
      bvy > 0 // Only hit when moving downwards
    ) {
      paddleHit = true;
      if (state.powerUpActive.sticky > 0) {
        updatedBalls.push({
          x: bx,
          y: PADDLE_Y - effectiveRadius,
          vx: 0,
          vy: 0,
          radius: effectiveRadius,
          isSticky: true,
          isFireball: isFireballActive,
          isMegaBall: isMegaBallActive,
        });
        continue;
      }

      by = PADDLE_Y - effectiveRadius;
      const hitCenter = paddle.x + paddle.width / 2;
      // Normal offset from -0.85 to +0.85
      const offset = Math.max(-0.85, Math.min(0.85, (bx - hitCenter) / (paddle.width / 2)));
      const bounceAngle = offset * (Math.PI * 0.32); // Max ~57 degrees

      // STRICT SPEED NORMALIZATION
      bvx = targetSpeed * Math.sin(bounceAngle);
      bvy = -targetSpeed * Math.cos(bounceAngle);
    }

    // Brick collisions
    for (const brick of currentBricks) {
      if (!brick.alive) continue;

      if (
        bx + effectiveRadius >= brick.x &&
        bx - effectiveRadius <= brick.x + brick.width &&
        by + effectiveRadius >= brick.y &&
        by - effectiveRadius <= brick.y + brick.height
      ) {
        damageBrick(brick);

        // If Mega Ball, do area-of-effect damage to neighbors
        if (isMegaBallActive) {
          triggerMegaShockwave(brick);
        }

        // Fireball passes straight through without bouncing!
        if (!isFireballActive) {
          const overlapX = Math.min(
            bx + effectiveRadius - brick.x,
            brick.x + brick.width - (bx - effectiveRadius)
          );
          const overlapY = Math.min(
            by + effectiveRadius - brick.y,
            brick.y + brick.height - (by - effectiveRadius)
          );

          if (overlapX < overlapY) {
            bvx = -bvx;
          } else {
            bvy = -bvy;
          }
          break; // Single brick bounce if not fireball
        }
      }
    }

    // Wall bounce normalization & angle protection
    // Prevent purely horizontal trapped bouncing
    if (Math.abs(bvy) < targetSpeed * 0.32) {
      bvy = (bvy < 0 ? -1 : 1) * targetSpeed * 0.32;
    }

    // Normalize velocity vector to exactly targetSpeed
    const currentSpeed = Math.sqrt(bvx * bvx + bvy * bvy);
    if (currentSpeed > 0.001) {
      bvx = (bvx / currentSpeed) * targetSpeed;
      bvy = (bvy / currentSpeed) * targetSpeed;
    }

    // Bottom safety shield bounce
    if (by + effectiveRadius >= CANVAS_HEIGHT - 4 && hasShield) {
      hasShield = false; // Consumed shield
      by = CANVAS_HEIGHT - effectiveRadius - 6;
      bvy = -Math.abs(bvy);
      paddleHit = true;
    }

    // Ball out of bottom
    if (by - effectiveRadius < CANVAS_HEIGHT) {
      updatedBalls.push({
        x: bx,
        y: by,
        vx: bvx,
        vy: bvy,
        radius: effectiveRadius,
        isFireball: isFireballActive,
        isMegaBall: isMegaBallActive,
      });
    }
  }

  function damageBrick(brick: Brick) {
    if (brick.type === 4) return; // Unbreakable
    brickHit = true;

    // Fireball deals double damage / instant destruction to basic bricks
    const damage = isFireballActive ? 2 : 1;
    brick.hp -= damage;

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

  function triggerMegaShockwave(source: Brick) {
    const range = 50;
    const cx = source.x + source.width / 2;
    const cy = source.y + source.height / 2;

    for (const other of currentBricks) {
      if (!other.alive || other.id === source.id || other.type === 4) continue;
      const ox = other.x + other.width / 2;
      const oy = other.y + other.height / 2;
      const dist = Math.sqrt((cx - ox) ** 2 + (cy - oy) ** 2);
      if (dist < range) {
        other.hp -= 1;
        if (other.hp <= 0) {
          other.alive = false;
          newBricksDestroyed += 1;
          newScore += other.points;
        }
      }
    }
  }

  function triggerExplosion(source: Brick) {
    const range = 65;
    const cx = source.x + source.width / 2;
    const cy = source.y + source.height / 2;

    for (const other of currentBricks) {
      if (!other.alive || other.id === source.id || other.type === 4) continue;
      const ox = other.x + other.width / 2;
      const oy = other.y + other.height / 2;
      const dist = Math.sqrt((cx - ox) ** 2 + (cy - oy) ** 2);
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
    if (isSurprise || Math.random() < 0.22) {
      const types: PowerUpType[] = [
        'widePaddle',
        'multiBall',
        'laser',
        'sticky',
        'fireball',
        'megaBall',
        'shield',
        'slowMo',
      ];
      const selected = types[Math.floor(Math.random() * types.length)];

      let color = COLORS.cyan;
      if (selected === 'widePaddle') color = COLORS.amber;
      if (selected === 'laser') color = '#EF4444';
      if (selected === 'sticky') color = COLORS.lime;
      if (selected === 'fireball') color = '#F97316'; // Blazing orange
      if (selected === 'megaBall') color = '#A855F7'; // Mega purple
      if (selected === 'shield') color = '#06B6D4'; // Cyan shield
      if (selected === 'slowMo') color = '#3B82F6'; // Blue clock

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
      const angle = (Math.random() > 0.5 ? 1 : -1) * 0.4;
      updatedBalls.push({
        x: state.paddle.x + state.paddle.width / 2,
        y: PADDLE_Y - 14,
        vx: targetSpeed * Math.sin(angle),
        vy: -targetSpeed * Math.cos(angle),
        radius: 6,
      });
    }
  }

  // Update Falling Power-ups & Timers
  const activePowerUps: PowerUp[] = [];
  let newPaddleWidth = state.paddle.width;
  let newLaserActive = Math.max(0, state.powerUpActive.laser - 16);
  let newStickyActive = Math.max(0, state.powerUpActive.sticky - 16);
  let newFireballActive = Math.max(0, state.powerUpActive.fireball - 16);
  let newMegaBallActive = Math.max(0, state.powerUpActive.megaBall - 16);
  let newSlowMoActive = Math.max(0, state.powerUpActive.slowMo - 16);

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
            {
              x: lead.x,
              y: lead.y,
              vx: lead.vx * -0.9 + 1,
              vy: lead.vy,
              radius: lead.radius,
              isFireball: isFireballActive,
              isMegaBall: isMegaBallActive,
            },
            {
              x: lead.x,
              y: lead.y,
              vx: lead.vx * 0.9 - 1,
              vy: lead.vy,
              radius: lead.radius,
              isFireball: isFireballActive,
              isMegaBall: isMegaBallActive,
            }
          );
        } else {
          updatedBalls.push({
            x: pow.x,
            y: PADDLE_Y - 14,
            vx: 2,
            vy: -targetSpeed,
            radius: 6,
          });
        }
      } else if (pow.type === 'laser') {
        newLaserActive = 10000; // 10s
      } else if (pow.type === 'sticky') {
        newStickyActive = 12000; // 12s
      } else if (pow.type === 'fireball') {
        newFireballActive = 8000; // 8s
      } else if (pow.type === 'megaBall') {
        newMegaBallActive = 9000; // 9s
      } else if (pow.type === 'shield') {
        hasShield = true; // Bottom safety floor
      } else if (pow.type === 'slowMo') {
        newSlowMoActive = 8000; // 8s
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
      const angle = (Math.random() > 0.5 ? 1 : -1) * 0.4;
      updatedBalls.length = 0;
      updatedBalls.push({
        x: CANVAS_WIDTH / 2,
        y: PADDLE_Y - 14,
        vx: targetSpeed * Math.sin(angle),
        vy: -targetSpeed * Math.cos(angle),
        radius: 6,
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
        fireball: newFireballActive,
        megaBall: newMegaBallActive,
        slowMo: newSlowMoActive,
      },
      hasSafetyShield: hasShield,
    },
    brickHit,
    paddleHit,
    lostLife,
    won,
    powerUpCollected,
  };
}
