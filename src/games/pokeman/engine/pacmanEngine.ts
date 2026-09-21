import {
  PacmanState,
  Direction,
  Ghost,
  GhostName,
  ScorePopup,
} from '../types';
import { getPacmanLevel } from './levels';

export const GRID_COLS = 19;
export const GRID_ROWS = 21;
export const TILE_SIZE = 18;
export const ARENA_WIDTH = GRID_COLS * TILE_SIZE; // 342
export const ARENA_HEIGHT = GRID_ROWS * TILE_SIZE; // 378

// 19x21 classic maze layout:
// # = Wall, . = Dot, o = Energizer, - = Ghost door, = = Warp tunnel, space = empty path
export const MAZE_TEMPLATE = [
  '#########=#########', // 0: Col 9 vertical warp portal
  '#o.......#.......o#', // 1
  '#.###.##...##.###.#', // 2: Open col 9
  '#.# #.##.#.##.# #.#', // 3
  '#.###.##...##.###.#', // 4: Open col 9
  '#.................#', // 5: Wide open horizontal corridor
  '#.###.##.#.##.###.#', // 6
  '#.....#..#..#.....#', // 7
  '####.### # ###.####', // 8: Channel above ghost house
  '####.#  ---  #.####', // 9: Ghost door in center
  '====.#       #.====', // 10: Horizontal warp tunnels (cols 0..3 & 15..18)
  '####.#########.####', // 11: Base of ghost house
  '####.### # ###.####', // 12
  '#.................#', // 13: Wide open corridor
  '#.###.##...##.###.#', // 14: Col 9 is OPEN! Pac-Man can move straight UP from spawn!
  '#o..#.........#..o#', // 15: Pac-Man spawn at (9, 15), completely open in all directions!
  '###.#.###.###.#.###', // 16
  '#.....#..#..#.....#', // 17
  '#.######.#.######.#', // 18
  '#.................#', // 19: Wide open corridor
  '#########=#########', // 20: Col 9 vertical warp portal
];

export const isWall = (col: number, row: number, allowGhostDoor: boolean = false): boolean => {
  // Horizontal tunnel wrap on row 10
  if (row === 10 && (col < 0 || col >= GRID_COLS)) return false;
  // Vertical tunnel wrap on col 9
  if (col === 9 && (row < 0 || row >= GRID_ROWS)) return false;

  if (row < 0 || row >= GRID_ROWS) return true;
  if (col < 0 || col >= GRID_COLS) return true;

  const char = MAZE_TEMPLATE[row][col];
  if (char === '#') return true;
  if (char === '-' && !allowGhostDoor) return true;
  return false;
};

export const createInitialPacmanState = (levelNum: number = 1): PacmanState => {
  const levelData = getPacmanLevel(levelNum);
  const dotsGrid: boolean[][] = [];
  const energizersGrid: boolean[][] = [];
  let dotsRemaining = 0;

  for (let r = 0; r < GRID_ROWS; r++) {
    dotsGrid[r] = [];
    energizersGrid[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const char = MAZE_TEMPLATE[r][c];
      if (char === '.') {
        dotsGrid[r][c] = true;
        energizersGrid[r][c] = false;
        dotsRemaining++;
      } else if (char === 'o') {
        dotsGrid[r][c] = false;
        energizersGrid[r][c] = true;
        dotsRemaining++;
      } else {
        dotsGrid[r][c] = false;
        energizersGrid[r][c] = false;
      }
    }
  }

  const ghosts: Ghost[] = [
    {
      name: 'blinky',
      x: 9,
      y: 8,
      dir: 'LEFT',
      targetX: 18,
      targetY: 0,
      mode: 'scatter',
      color: '#EF4444',
      inHouse: false,
      houseExitTimer: 0,
      speed: levelData.ghostSpeed,
    },
    {
      name: 'pinky',
      x: 9,
      y: 10,
      dir: 'UP',
      targetX: 0,
      targetY: 0,
      mode: 'scatter',
      color: '#F472B6',
      inHouse: true,
      houseExitTimer: 1.8,
      speed: levelData.ghostSpeed * 0.95,
    },
    {
      name: 'inky',
      x: 8,
      y: 10,
      dir: 'UP',
      targetX: 18,
      targetY: 20,
      mode: 'scatter',
      color: '#38BDF8',
      inHouse: true,
      houseExitTimer: 3.5,
      speed: levelData.ghostSpeed * 0.92,
    },
    {
      name: 'clyde',
      x: 10,
      y: 10,
      dir: 'UP',
      targetX: 0,
      targetY: 20,
      mode: 'scatter',
      color: '#F97316',
      inHouse: true,
      houseExitTimer: 5.5,
      speed: levelData.ghostSpeed * 0.9,
    },
  ];

  return {
    currentLevel: levelNum,
    score: 0,
    lives: 3,
    pacmanX: 9,
    pacmanY: 15,
    pacmanDir: 'NONE',
    nextDir: 'NONE',
    mouthAngle: 0,
    chompIncreasing: true,
    ghosts,
    dotsGrid,
    energizersGrid,
    dotsRemaining,
    totalDots: dotsRemaining,
    frightenedTimeRemaining: 0,
    ghostsEatenStreak: 0,
    fruitActive: false,
    fruitX: 9,
    fruitY: 13,
    fruitType: levelData.fruitType,
    fruitPoints: levelData.fruitPoints,
    fruitTimer: 0,
    scorePopups: [],
    isDying: false,
    deathAnimTimer: 0,
    levelCompleted: false,
    isGameOver: false,
  };
};

const getDirVector = (dir: Direction): { dx: number; dy: number } => {
  switch (dir) {
    case 'UP':
      return { dx: 0, dy: -1 };
    case 'DOWN':
      return { dx: 0, dy: 1 };
    case 'LEFT':
      return { dx: -1, dy: 0 };
    case 'RIGHT':
      return { dx: 1, dy: 0 };
    default:
      return { dx: 0, dy: 0 };
  }
};

const getOppositeDir = (dir: Direction): Direction => {
  switch (dir) {
    case 'UP':
      return 'DOWN';
    case 'DOWN':
      return 'UP';
    case 'LEFT':
      return 'RIGHT';
    case 'RIGHT':
      return 'LEFT';
    default:
      return 'NONE';
  }
};

export function updatePacman(
  state: PacmanState,
  dt: number // in seconds
): {
  nextState: PacmanState;
  ateDot: boolean;
  ateEnergizer: boolean;
  ateGhost: boolean;
  ateFruit: boolean;
  pacmanDied: boolean;
  levelFinished: boolean;
} {
  if (state.levelCompleted || state.isGameOver) {
    return {
      nextState: state,
      ateDot: false,
      ateEnergizer: false,
      ateGhost: false,
      ateFruit: false,
      pacmanDied: false,
      levelFinished: false,
    };
  }

  const levelData = getPacmanLevel(state.currentLevel);
  let ateDot = false;
  let ateEnergizer = false;
  let ateGhost = false;
  let ateFruit = false;
  let pacmanDied = false;
  let levelFinished = false;

  let newScore = state.score;
  let dotsRemaining = state.dotsRemaining;
  let streak = state.ghostsEatenStreak;
  let frightenedMs = Math.max(0, state.frightenedTimeRemaining - dt * 1000);

  // Handle death animation
  if (state.isDying) {
    const nextDeathTimer = state.deathAnimTimer - dt;
    if (nextDeathTimer <= 0) {
      if (state.lives <= 0) {
        return {
          nextState: { ...state, isGameOver: true, isDying: false },
          ateDot: false,
          ateEnergizer: false,
          ateGhost: false,
          ateFruit: false,
          pacmanDied: true,
          levelFinished: false,
        };
      } else {
        // Reset positions
        const resetGhosts = state.ghosts.map((g, idx) => ({
          ...g,
          x: idx === 0 ? 9 : 8 + (idx - 1),
          y: idx === 0 ? 8 : 10,
          dir: 'UP' as Direction,
          mode: 'scatter' as const,
          inHouse: idx > 0,
          houseExitTimer: idx * 2.0,
        }));
        return {
          nextState: {
            ...state,
            pacmanX: 9,
            pacmanY: 15,
            pacmanDir: 'NONE',
            nextDir: 'NONE',
            ghosts: resetGhosts,
            isDying: false,
            frightenedTimeRemaining: 0,
          },
          ateDot: false,
          ateEnergizer: false,
          ateGhost: false,
          ateFruit: false,
          pacmanDied: false,
          levelFinished: false,
        };
      }
    }
    return {
      nextState: { ...state, deathAnimTimer: nextDeathTimer },
      ateDot: false,
      ateEnergizer: false,
      ateGhost: false,
      ateFruit: false,
      pacmanDied: false,
      levelFinished: false,
    };
  }

  // Fruit Spawn check: Spawns when 70 or 170 dots eaten
  let fruitActive = state.fruitActive;
  let fruitTimer = Math.max(0, state.fruitTimer - dt * 1000);
  const dotsEaten = state.totalDots - dotsRemaining;
  if (!fruitActive && (dotsEaten === 70 || dotsEaten === 170)) {
    fruitActive = true;
    fruitTimer = 10000; // 10 seconds active
  }
  if (fruitActive && fruitTimer <= 0) {
    fruitActive = false;
  }

  // Update Score Popups
  const nextPopups: ScorePopup[] = state.scorePopups
    .map((p) => ({ ...p, timer: p.timer - dt }))
    .filter((p) => p.timer > 0);

  // 1. Move Pac-Man
  let px = state.pacmanX;
  let py = state.pacmanY;
  let pDir = state.pacmanDir;
  let nextDir = state.nextDir;

  const pacSpeed = levelData.pacmanSpeed;
  const moveDist = pacSpeed * dt;

  // Try to turn to nextDir if queued
  if (nextDir !== 'NONE') {
    if (nextDir === getOppositeDir(pDir)) {
      // 180 reverse is instant anywhere in a corridor
      pDir = nextDir;
      nextDir = 'NONE';
    } else {
      const { dx: ndx, dy: ndy } = getDirVector(nextDir);

      if (pDir === 'NONE') {
        // Stopped: check if nextDir is open
        const checkX = Math.round(px) + ndx;
        const checkY = Math.round(py) + ndy;
        if (!isWall(checkX, checkY)) {
          px = Math.round(px);
          py = Math.round(py);
          pDir = nextDir;
          nextDir = 'NONE';
        }
      } else if (ndx !== 0) {
        // Turning horizontally (LEFT/RIGHT) while moving vertically:
        const targetRow = Math.round(py);
        if (Math.abs(py - targetRow) <= 0.48) {
          const colCheck = Math.round(px) + ndx;
          if (!isWall(colCheck, targetRow)) {
            py = targetRow;
            px = Math.round(px);
            pDir = nextDir;
            nextDir = 'NONE';
          }
        }
      } else if (ndy !== 0) {
        // Turning vertically (UP/DOWN) while moving horizontally:
        const targetCol = Math.round(px);
        if (Math.abs(px - targetCol) <= 0.48) {
          const rowCheck = Math.round(py) + ndy;
          if (!isWall(targetCol, rowCheck)) {
            px = targetCol;
            py = Math.round(py);
            pDir = nextDir;
            nextDir = 'NONE';
          }
        }
      }
    }
  }

  // Execute movement in pDir with precise wall bounds
  if (pDir !== 'NONE') {
    const { dx, dy } = getDirVector(pDir);
    const targetX = px + dx * moveDist;
    const targetY = py + dy * moveDist;

    // 1. Horizontal Warp Tunnel on Row 10
    if (Math.round(py) === 10 && dx !== 0) {
      if (targetX < -0.5) {
        px = GRID_COLS - 0.5;
      } else if (targetX > GRID_COLS - 0.5) {
        px = -0.5;
      } else {
        px = targetX;
      }
      py = 10;
    }
    // 2. Vertical Warp Tunnel on Col 9
    else if (Math.round(px) === 9 && dy !== 0) {
      if (targetY < -0.5) {
        py = GRID_ROWS - 0.5;
      } else if (targetY > GRID_ROWS - 0.5) {
        py = -0.5;
      } else {
        py = targetY;
      }
      px = 9;
    }
    // 3. Normal Corridor Wall Checking
    else {
      let blocked = false;

      if (dx > 0) {
        // Moving RIGHT
        const ceilTile = Math.ceil(px);
        const curRow = Math.round(py);
        if (isWall(ceilTile + 1, curRow) && targetX > ceilTile) {
          px = ceilTile;
          blocked = true;
        } else {
          px = targetX;
        }
      } else if (dx < 0) {
        // Moving LEFT
        const floorTile = Math.floor(px);
        const curRow = Math.round(py);
        if (isWall(floorTile - 1, curRow) && targetX < floorTile) {
          px = floorTile;
          blocked = true;
        } else {
          px = targetX;
        }
      } else if (dy > 0) {
        // Moving DOWN
        const ceilTile = Math.ceil(py);
        const curCol = Math.round(px);
        if (isWall(curCol, ceilTile + 1) && targetY > ceilTile) {
          py = ceilTile;
          blocked = true;
        } else {
          py = targetY;
        }
      } else if (dy < 0) {
        // Moving UP (bulletproof boundary clamping: never snaps into walls, stops at tile edge)
        const floorTile = Math.floor(py);
        const curCol = Math.round(px);
        if (isWall(curCol, floorTile - 1) && targetY < floorTile) {
          py = floorTile;
          blocked = true;
        } else {
          py = targetY;
        }
      }

      if (blocked) {
        pDir = 'NONE';
      }
    }
  }

  // Mouth chomp animation
  let mouthAngle = state.mouthAngle;
  let chompIncreasing = state.chompIncreasing;
  if (pDir !== 'NONE') {
    if (chompIncreasing) {
      mouthAngle += dt * 380;
      if (mouthAngle >= 45) {
        mouthAngle = 45;
        chompIncreasing = false;
      }
    } else {
      mouthAngle -= dt * 380;
      if (mouthAngle <= 5) {
        mouthAngle = 5;
        chompIncreasing = true;
      }
    }
  }

  // Eat Dot / Energizer at current tile
  const tileX = Math.round(px);
  const tileY = Math.round(py);

  const dotsGrid = state.dotsGrid.map((row) => [...row]);
  const energizersGrid = state.energizersGrid.map((row) => [...row]);

  if (tileY >= 0 && tileY < GRID_ROWS && tileX >= 0 && tileX < GRID_COLS) {
    if (dotsGrid[tileY][tileX]) {
      dotsGrid[tileY][tileX] = false;
      newScore += 10;
      dotsRemaining--;
      ateDot = true;
    } else if (energizersGrid[tileY][tileX]) {
      energizersGrid[tileY][tileX] = false;
      newScore += 50;
      dotsRemaining--;
      ateEnergizer = true;
      frightenedMs = levelData.frightenedDurationMs;
      streak = 0;
    }

    // Eat Fruit
    if (fruitActive && tileX === state.fruitX && tileY === state.fruitY) {
      fruitActive = false;
      newScore += state.fruitPoints;
      ateFruit = true;
      nextPopups.push({
        id: `fruit_${Date.now()}`,
        x: state.fruitX * TILE_SIZE,
        y: state.fruitY * TILE_SIZE,
        text: `+${state.fruitPoints}`,
        timer: 1.5,
      });
    }
  }

  // Check Level Complete
  if (dotsRemaining <= 0) {
    levelFinished = true;
  }

  // 2. Move & Update Ghosts
  const updatedGhosts: Ghost[] = [];
  let pacDiedThisFrame = false;
  let livesLeft = state.lives;

  for (const ghost of state.ghosts) {
    let gx = ghost.x;
    let gy = ghost.y;
    let gDir = ghost.dir;
    let mode = ghost.mode;
    let inHouse = ghost.inHouse;
    let houseExitTimer = ghost.houseExitTimer;

    // Mode transitions
    if (frightenedMs > 0 && mode !== 'eaten') {
      mode = 'frightened';
    } else if (frightenedMs === 0 && mode === 'frightened') {
      mode = 'chase';
    }

    // Ghost in house timer
    if (inHouse) {
      houseExitTimer -= dt;
      if (houseExitTimer <= 0) {
        inHouse = false;
        gx = 9;
        gy = 8; // Step outside ghost door into row 8
        gDir = 'LEFT';
      } else {
        // Bob up and down inside house (row 10)
        gy = 10 + Math.sin(Date.now() / 200) * 0.25;
        updatedGhosts.push({
          ...ghost,
          x: gx,
          y: gy,
          inHouse,
          houseExitTimer,
        });
        continue;
      }
    }

    // Ghost speed
    let gSpeed = ghost.speed;
    if (mode === 'frightened') gSpeed *= 0.6;
    if (mode === 'eaten') gSpeed *= 1.8;

    const gDist = gSpeed * dt;

    // AI Target calculation
    let tx = 9;
    let ty = 8;

    if (mode === 'eaten') {
      tx = 9;
      ty = 8; // Target ghost door entrance to revive
      if (Math.hypot(gx - 9, gy - 8) < 0.5) {
        mode = 'chase';
        inHouse = false;
      }
    } else if (mode === 'frightened') {
      // Random wandering
      tx = Math.floor(Math.random() * GRID_COLS);
      ty = Math.floor(Math.random() * GRID_ROWS);
    } else if (mode === 'scatter') {
      tx = ghost.targetX;
      ty = ghost.targetY;
    } else {
      // Chase mode
      if (ghost.name === 'blinky') {
        tx = px;
        ty = py;
      } else if (ghost.name === 'pinky') {
        const { dx: pdx, dy: pdy } = getDirVector(pDir);
        tx = px + pdx * 4;
        ty = py + pdy * 4;
      } else if (ghost.name === 'inky') {
        const blinky = state.ghosts.find((g) => g.name === 'blinky') || ghost;
        tx = px * 2 - blinky.x;
        ty = py * 2 - blinky.y;
      } else {
        // Clyde
        const distToPac = Math.hypot(gx - px, gy - py);
        if (distToPac > 8) {
          tx = px;
          ty = py;
        } else {
          tx = 0;
          ty = 20;
        }
      }
    }

    // Direction Decision at tile center
    const gRoundX = Math.round(gx);
    const gRoundY = Math.round(gy);
    const distFromCenter = Math.abs(gx - gRoundX) + Math.abs(gy - gRoundY);

    if (distFromCenter < 0.2) {
      gx = gRoundX;
      gy = gRoundY;

      // Evaluate available directions (cannot reverse direction unless entering frightened mode)
      const possibleDirs: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
      const opposite = getOppositeDir(gDir);

      let bestDir = gDir;
      let minTargetDist = Infinity;

      for (const dir of possibleDirs) {
        if (dir === opposite && mode !== 'frightened') continue;
        const { dx, dy } = getDirVector(dir);
        const nextCol = gRoundX + dx;
        const nextRow = gRoundY + dy;

        // Ghosts can use ghost door (-) only when eaten
        const allowDoor = mode === 'eaten';
        if (!isWall(nextCol, nextRow, allowDoor)) {
          const distToTgt = Math.hypot(nextCol - tx, nextRow - ty);
          if (distToTgt < minTargetDist) {
            minTargetDist = distToTgt;
            bestDir = dir;
          }
        }
      }

      gDir = bestDir;
    }

    // Move ghost forward
    const { dx: gdx, dy: gdy } = getDirVector(gDir);
    gx += gdx * gDist;
    gy += gdy * gDist;

    // Horizontal Wrap tunnel on row 10
    if (Math.round(gy) === 10) {
      if (gx < -0.5) gx = GRID_COLS - 0.5;
      else if (gx > GRID_COLS - 0.5) gx = -0.5;
    }
    // Vertical Wrap tunnel on col 9
    if (Math.round(gx) === 9) {
      if (gy < -0.5) gy = GRID_ROWS - 0.5;
      else if (gy > GRID_ROWS - 0.5) gy = -0.5;
    }

    // Check collision with Pac-Man
    const pacDist = Math.hypot(gx - px, gy - py);
    if (pacDist < 0.75) {
      if (mode === 'frightened') {
        mode = 'eaten';
        ateGhost = true;
        streak = Math.min(4, streak + 1);
        const pts = 200 * Math.pow(2, streak - 1);
        newScore += pts;
        nextPopups.push({
          id: `ghost_${Date.now()}_${streak}`,
          x: gx * TILE_SIZE,
          y: gy * TILE_SIZE,
          text: `+${pts}`,
          timer: 1.5,
        });
      } else if (mode !== 'eaten' && !state.isDying) {
        pacDiedThisFrame = true;
        livesLeft -= 1;
      }
    }

    updatedGhosts.push({
      ...ghost,
      x: gx,
      y: gy,
      dir: gDir,
      mode,
      inHouse,
      houseExitTimer,
    });
  }

  return {
    nextState: {
      ...state,
      score: newScore,
      lives: livesLeft,
      pacmanX: px,
      pacmanY: py,
      pacmanDir: pDir,
      nextDir,
      mouthAngle,
      chompIncreasing,
      ghosts: updatedGhosts,
      dotsGrid,
      energizersGrid,
      dotsRemaining,
      frightenedTimeRemaining: frightenedMs,
      ghostsEatenStreak: streak,
      fruitActive,
      fruitTimer,
      scorePopups: nextPopups,
      isDying: pacDiedThisFrame ? true : state.isDying,
      deathAnimTimer: pacDiedThisFrame ? 1.5 : state.deathAnimTimer,
      levelCompleted: levelFinished,
      isGameOver: livesLeft <= 0 && pacDiedThisFrame,
    },
    ateDot,
    ateEnergizer,
    ateGhost,
    ateFruit,
    pacmanDied: pacDiedThisFrame,
    levelFinished,
  };
}
