import {
  BubbleState,
  BubbleColor,
  GridBubble,
  FlyingBubble,
  FallingBubble,
  PopParticle,
} from '../types';
import { getBubbleLevel, GRID_COLS, GRID_ROWS } from './levels';
import { COLORS } from '../../../constants/theme';

export const ARENA_WIDTH = 320;
export const ARENA_HEIGHT = 440;
export const BUBBLE_RADIUS = 20;
export const BUBBLE_DIAMETER = 40;
export const ROW_HEIGHT = 34.64; // 40 * sqrt(3)/2
export const CANNON_Y = ARENA_HEIGHT - 35;
export const CANNON_X = ARENA_WIDTH / 2;
export const PROJECTILE_SPEED = 12;

export const COLOR_MAP: Record<BubbleColor, string> = {
  cyan: COLORS.cyan,
  magenta: COLORS.magenta,
  amber: COLORS.amber,
  lime: COLORS.lime,
  purple: COLORS.purple,
  rose: COLORS.rose,
  bomb: '#EF4444',
  rainbow: '#FFFFFF',
  lightning: '#FACC15',
  metal: '#64748B',
};

export const getBubbleCoord = (row: number, col: number, ceilingOffset: number = 0) => {
  const isOdd = row % 2 !== 0;
  const xOffset = isOdd ? BUBBLE_DIAMETER : BUBBLE_RADIUS;
  return {
    x: col * BUBBLE_DIAMETER + xOffset,
    y: row * ROW_HEIGHT + BUBBLE_RADIUS + ceilingOffset,
  };
};

export const createInitialBubbleState = (levelNumber: number = 1): BubbleState => {
  const levelData = getBubbleLevel(levelNumber);
  const colors = levelData.availableColors;

  const grid: GridBubble[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const rowList: GridBubble[] = [];
    const colsInRow = r % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
    for (let c = 0; c < colsInRow; c++) {
      const colorAt = levelData.grid[r] ? levelData.grid[r][c] : null;
      const coord = getBubbleCoord(r, c, 0);
      rowList.push({
        id: `b_${r}_${c}`,
        row: r,
        col: c,
        color: colorAt || 'cyan',
        alive: colorAt !== null,
        x: coord.x,
        y: coord.y,
      });
    }
    grid.push(rowList);
  }

  const currentBubble = colors[Math.floor(Math.random() * colors.length)];
  const nextBubble = colors[Math.floor(Math.random() * colors.length)];

  return {
    currentLevel: levelNumber,
    score: 0,
    grid,
    shotsLeft: levelData.totalShots,
    currentBubble,
    nextBubble,
    flyingBubble: null,
    fallingBubbles: [],
    particles: [],
    foulsUntilDrop: 5,
    ceilingRowOffset: 0,
    isGameOver: false,
    levelCompleted: false,
    bubblesPoppedTotal: 0,
  };
};

export const launchBubble = (state: BubbleState, angle: number): BubbleState => {
  if (state.flyingBubble || state.shotsLeft <= 0 || state.isGameOver || state.levelCompleted) {
    return state;
  }

  // Clamped upward launch angle (from -165 to -15 degrees)
  const clampedAngle = Math.max(-Math.PI * 0.92, Math.min(-Math.PI * 0.08, angle));

  const vx = PROJECTILE_SPEED * Math.cos(clampedAngle);
  const vy = PROJECTILE_SPEED * Math.sin(clampedAngle);

  const colors = getBubbleLevel(state.currentLevel).availableColors;
  const newNext = colors[Math.floor(Math.random() * colors.length)];

  return {
    ...state,
    shotsLeft: state.shotsLeft - 1,
    flyingBubble: {
      id: `fly_${Date.now()}`,
      x: CANNON_X,
      y: CANNON_Y,
      vx,
      vy,
      color: state.currentBubble,
      radius: BUBBLE_RADIUS,
    },
    currentBubble: state.nextBubble,
    nextBubble: newNext,
  };
};

export const swapBubbles = (state: BubbleState): BubbleState => {
  if (state.flyingBubble) return state;
  return {
    ...state,
    currentBubble: state.nextBubble,
    nextBubble: state.currentBubble,
  };
};

export function updateBubbleGame(state: BubbleState): {
  nextState: BubbleState;
  popped: boolean;
  bounced: boolean;
  levelFinished: boolean;
} {
  if (state.levelCompleted || state.isGameOver) {
    return { nextState: state, popped: false, bounced: false, levelFinished: false };
  }

  let popped = false;
  let bounced = false;
  let levelFinished = false;

  let newScore = state.score;
  let totalPopped = state.bubblesPoppedTotal;
  let newFouls = state.foulsUntilDrop;
  let newCeilingOffset = state.ceilingRowOffset;

  // 1. Update Falling Bubbles
  const updatedFalling: FallingBubble[] = [];
  for (const fall of state.fallingBubbles) {
    const ny = fall.y + fall.vy;
    const nx = fall.x + fall.vx;
    const nvy = fall.vy + 0.5; // gravity
    if (ny < ARENA_HEIGHT + 30) {
      updatedFalling.push({ ...fall, x: nx, y: ny, vy: nvy });
    }
  }

  // 2. Update Particles
  const updatedParticles: PopParticle[] = [];
  for (const p of state.particles) {
    const nAlpha = p.alpha - 0.04;
    if (nAlpha > 0) {
      updatedParticles.push({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: nAlpha,
      });
    }
  }

  // 3. Update Flying Bubble
  let nextFlying: FlyingBubble | null = state.flyingBubble ? { ...state.flyingBubble } : null;
  const currentGrid = state.grid.map((row) => row.map((b) => ({ ...b })));

  if (nextFlying) {
    let nx = nextFlying.x + nextFlying.vx;
    let ny = nextFlying.y + nextFlying.vy;

    // Wall bounce
    if (nx - BUBBLE_RADIUS <= 0) {
      nx = BUBBLE_RADIUS;
      nextFlying.vx = Math.abs(nextFlying.vx);
      bounced = true;
    } else if (nx + BUBBLE_RADIUS >= ARENA_WIDTH) {
      nx = ARENA_WIDTH - BUBBLE_RADIUS;
      nextFlying.vx = -Math.abs(nextFlying.vx);
      bounced = true;
    }

    nextFlying.x = nx;
    nextFlying.y = ny;

    // Check collision with ceiling or other bubbles
    let hitDetected = false;
    if (ny - BUBBLE_RADIUS <= newCeilingOffset) {
      hitDetected = true;
    } else {
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < currentGrid[r].length; c++) {
          const target = currentGrid[r][c];
          if (!target.alive) continue;
          const dist = Math.hypot(nx - target.x, ny - target.y);
          if (dist < BUBBLE_DIAMETER * 0.92) {
            hitDetected = true;
            break;
          }
        }
        if (hitDetected) break;
      }
    }

    if (hitDetected) {
      // Find closest empty grid cell to snap into
      let bestDist = Infinity;
      let bestR = 0;
      let bestC = 0;

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < currentGrid[r].length; c++) {
          const cell = currentGrid[r][c];
          if (cell.alive) continue;
          const d = Math.hypot(nx - cell.x, ny - cell.y);
          if (d < bestDist) {
            bestDist = d;
            bestR = r;
            bestC = c;
          }
        }
      }

      // Snap bubble into best cell
      currentGrid[bestR][bestC].alive = true;
      currentGrid[bestR][bestC].color = nextFlying.color;
      const snappedColor = nextFlying.color;
      nextFlying = null; // flying finished

      // Match-3 Flood Fill
      const cluster = findCluster(currentGrid, bestR, bestC, snappedColor);

      if (
        cluster.length >= 3 ||
        snappedColor === 'bomb' ||
        snappedColor === 'rainbow' ||
        snappedColor === 'lightning'
      ) {
        popped = true;
        let toPop = cluster;

        if (snappedColor === 'bomb') {
          toPop = getBombArea(currentGrid, bestR, bestC);
        } else if (snappedColor === 'lightning') {
          toPop = getRowArea(currentGrid, bestR);
        }

        // Pop all identified bubbles
        for (const [pr, pc] of toPop) {
          const poppedBubble = currentGrid[pr][pc];
          if (poppedBubble.alive && poppedBubble.color !== 'metal') {
            poppedBubble.alive = false;
            totalPopped += 1;
            newScore += 50;

            // Spawn particles
            for (let i = 0; i < 4; i++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpd = 1.5 + Math.random() * 2.5;
              updatedParticles.push({
                id: `p_${Date.now()}_${Math.random()}`,
                x: poppedBubble.x,
                y: poppedBubble.y,
                vx: Math.cos(pAngle) * pSpd,
                vy: Math.sin(pAngle) * pSpd,
                color: COLOR_MAP[poppedBubble.color],
                radius: 4,
                alpha: 1,
              });
            }
          }
        }

        // Drop disconnected orphaned bubbles
        const dropped = dropFloatingBubbles(currentGrid);
        for (const d of dropped) {
          updatedFalling.push({
            id: `fall_${Date.now()}_${Math.random()}`,
            x: d.x,
            y: d.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -2,
            color: d.color,
            radius: BUBBLE_RADIUS,
          });
          newScore += 120; // Avalanche bonus!
          totalPopped += 1;
        }
      } else {
        // Foul - decrement ceiling drop counter
        newFouls -= 1;
        if (newFouls <= 0) {
          newFouls = 5;
          newCeilingOffset += ROW_HEIGHT;
          // Recalculate coordinates
          for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < currentGrid[r].length; c++) {
              const coord = getBubbleCoord(r, c, newCeilingOffset);
              currentGrid[r][c].x = coord.x;
              currentGrid[r][c].y = coord.y;
            }
          }
        }
      }
    }
  }

  // Check Win Condition: zero bubbles remaining on board
  const remainingCount = currentGrid.flat().filter((b) => b.alive).length;
  if (remainingCount === 0) {
    levelFinished = true;
    newScore += state.shotsLeft * 200; // Leftover ammo bonus!
  }

  // Check Loss Condition: any bubble crossed bottom line or out of shots
  let isGameOver = false;
  if (!levelFinished) {
    const bottomCrossed = currentGrid.flat().some((b) => b.alive && b.y >= CANNON_Y - 40);
    if (bottomCrossed || (state.shotsLeft <= 0 && !nextFlying)) {
      isGameOver = true;
    }
  }

  return {
    nextState: {
      ...state,
      grid: currentGrid,
      flyingBubble: nextFlying,
      fallingBubbles: updatedFalling,
      particles: updatedParticles,
      score: newScore,
      bubblesPoppedTotal: totalPopped,
      foulsUntilDrop: newFouls,
      ceilingRowOffset: newCeilingOffset,
      isGameOver,
      levelCompleted: levelFinished,
    },
    popped,
    bounced,
    levelFinished,
  };
}

function getNeighbors(r: number, c: number, grid: GridBubble[][]): [number, number][] {
  const isOdd = r % 2 !== 0;
  const deltas = isOdd
    ? [
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [-1, -1],
        [-1, 0],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
      ];

  const neighbors: [number, number][] = [];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < grid[nr].length) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

function findCluster(
  grid: GridBubble[][],
  startR: number,
  startC: number,
  targetColor: BubbleColor
): [number, number][] {
  const visited = new Set<string>();
  const cluster: [number, number][] = [];
  const queue: [number, number][] = [[startR, startC]];
  visited.add(`${startR},${startC}`);

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    cluster.push([cr, cc]);

    for (const [nr, nc] of getNeighbors(cr, cc, grid)) {
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const neighbor = grid[nr][nc];
      if (
        neighbor.alive &&
        (neighbor.color === targetColor ||
          neighbor.color === 'rainbow' ||
          targetColor === 'rainbow')
      ) {
        visited.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  return cluster;
}

function getBombArea(grid: GridBubble[][], r: number, c: number): [number, number][] {
  const toPop: [number, number][] = [[r, c]];
  const firstRing = getNeighbors(r, c, grid);
  for (const n of firstRing) {
    toPop.push(n);
    const secondRing = getNeighbors(n[0], n[1], grid);
    for (const s of secondRing) toPop.push(s);
  }
  return toPop;
}

function getRowArea(grid: GridBubble[][], r: number): [number, number][] {
  const toPop: [number, number][] = [];
  for (let c = 0; c < grid[r].length; c++) {
    toPop.push([r, c]);
  }
  return toPop;
}

function dropFloatingBubbles(grid: GridBubble[][]): GridBubble[] {
  // Flood fill from all alive bubbles connected to row 0
  const connected = new Set<string>();
  const queue: [number, number][] = [];

  for (let c = 0; c < grid[0].length; c++) {
    if (grid[0][c].alive) {
      connected.add(`0,${c}`);
      queue.push([0, c]);
    }
  }

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    for (const [nr, nc] of getNeighbors(cr, cc, grid)) {
      const key = `${nr},${nc}`;
      if (!connected.has(key) && grid[nr][nc].alive) {
        connected.add(key);
        queue.push([nr, nc]);
      }
    }
  }

  // Any alive bubble not connected must drop!
  const dropped: GridBubble[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].alive && !connected.has(`${r},${c}`)) {
        grid[r][c].alive = false;
        dropped.push(grid[r][c]);
      }
    }
  }

  return dropped;
}
