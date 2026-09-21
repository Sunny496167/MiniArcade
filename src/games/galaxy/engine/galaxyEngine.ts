import {
  GalaxyState,
  Enemy,
  PlayerBullet,
  EnemyBullet,
  GalaxyPowerUp,
  GalaxyParticle,
  EnemyType,
  GalaxyPowerUpType,
} from '../types';
import { getGalaxyLevel } from './levels';
import { COLORS } from '../../../constants/theme';

export const GALAXY_WIDTH = 340;
export const GALAXY_HEIGHT = 460;
export const SHIP_WIDTH = 34;
export const SHIP_HEIGHT = 38;

let entityCounter = 0;
const nextId = (prefix: string) => `${prefix}_${++entityCounter}`;

export const createInitialGalaxyState = (levelNumber: number = 1): GalaxyState => {
  return {
    currentLevel: levelNumber,
    score: 0,
    playerX: GALAXY_WIDTH / 2,
    playerY: GALAXY_HEIGHT - 65,
    playerHp: 3,
    maxPlayerHp: 3,
    shieldHp: 1,
    bombs: 2,
    weaponLevel: 1,
    laserActive: 0,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    powerUps: [],
    particles: [],
    enemiesSpawned: 0,
    enemiesDefeated: 0,
    lastSpawnTime: 0,
    lastPlayerShootTime: 0,
    levelCompleted: false,
    isGameOver: false,
  };
};

export const triggerSmartBomb = (state: GalaxyState): GalaxyState => {
  if (state.bombs <= 0 || state.isGameOver || state.levelCompleted) return state;

  const particles: GalaxyParticle[] = [...state.particles];
  // Screen-wide flash particles
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    particles.push({
      id: nextId('bomb'),
      x: GALAXY_WIDTH / 2,
      y: GALAXY_HEIGHT / 2,
      vx: Math.cos(angle) * 7,
      vy: Math.sin(angle) * 7,
      color: COLORS.cyan,
      radius: 5,
      alpha: 1,
    });
  }

  // Clear all enemy bullets and deal massive damage to all enemies
  const updatedEnemies: Enemy[] = [];
  let scoreGain = 0;
  let defeatedCount = state.enemiesDefeated;

  for (const enemy of state.enemies) {
    const nextHp = enemy.hp - 20;
    if (nextHp <= 0) {
      scoreGain += enemy.scoreValue;
      defeatedCount += 1;
    } else {
      updatedEnemies.push({ ...enemy, hp: nextHp });
    }
  }

  return {
    ...state,
    bombs: state.bombs - 1,
    enemyBullets: [],
    enemies: updatedEnemies,
    particles: particles.slice(-25),
    score: state.score + scoreGain,
    enemiesDefeated: defeatedCount,
  };
};

export function updateGalaxy(
  state: GalaxyState,
  now: number
): {
  nextState: GalaxyState;
  playerHit: boolean;
  enemyDestroyed: boolean;
  levelFinished: boolean;
} {
  if (state.levelCompleted || state.isGameOver) {
    return { nextState: state, playerHit: false, enemyDestroyed: false, levelFinished: false };
  }

  const levelData = getGalaxyLevel(state.currentLevel);
  let playerHit = false;
  let enemyDestroyed = false;
  let levelFinished = false;

  let newScore = state.score;
  let currentHp = state.playerHp;
  let currentShield = state.shieldHp;
  let defeatedCount = state.enemiesDefeated;
  let spawnedCount = state.enemiesSpawned;
  let weaponLvl = state.weaponLevel;
  let newBombs = state.bombs;
  let laserRemaining = Math.max(0, state.laserActive - 16);

  let nextShootTime = state.lastPlayerShootTime;
  let nextSpawnTime = state.lastSpawnTime;

  const newPlayerBullets: PlayerBullet[] = [];
  const newEnemyBullets: EnemyBullet[] = [];
  const newPowerUps: GalaxyPowerUp[] = [];
  const newParticles: GalaxyParticle[] = [];

  // 1. Auto Player Fire
  const fireInterval = laserRemaining > 0 ? 80 : 160;
  if (now - nextShootTime >= fireInterval) {
    nextShootTime = now;
    const px = state.playerX;
    const py = state.playerY - SHIP_HEIGHT / 2;

    if (laserRemaining > 0) {
      newPlayerBullets.push({ id: nextId('b'), x: px, y: py, vx: 0, vy: -12, isLaser: true });
    } else if (weaponLvl === 1) {
      newPlayerBullets.push(
        { id: nextId('b'), x: px - 8, y: py, vx: 0, vy: -9 },
        { id: nextId('b'), x: px + 8, y: py, vx: 0, vy: -9 }
      );
    } else if (weaponLvl === 2) {
      newPlayerBullets.push(
        { id: nextId('b'), x: px - 10, y: py, vx: -1.4, vy: -9 },
        { id: nextId('b'), x: px, y: py, vx: 0, vy: -9.5 },
        { id: nextId('b'), x: px + 10, y: py, vx: 1.4, vy: -9 }
      );
    } else {
      newPlayerBullets.push(
        { id: nextId('b'), x: px - 12, y: py, vx: -2.2, vy: -8.8 },
        { id: nextId('b'), x: px - 6, y: py, vx: -1.0, vy: -9.2 },
        { id: nextId('b'), x: px, y: py, vx: 0, vy: -9.5 },
        { id: nextId('b'), x: px + 6, y: py, vx: 1.0, vy: -9.2 },
        { id: nextId('b'), x: px + 12, y: py, vx: 2.2, vy: -8.8 }
      );
    }
  }

  // 2. Enemy Spawning
  const activeEnemies = [...state.enemies];
  if (
    spawnedCount < levelData.totalEnemies &&
    now - nextSpawnTime >= levelData.spawnRate &&
    activeEnemies.length < 6
  ) {
    nextSpawnTime = now;
    spawnedCount += 1;

    const isLastEnemy = spawnedCount === levelData.totalEnemies;
    const spawnType: EnemyType =
      isLastEnemy && levelData.isBossLevel
        ? 'boss'
        : levelData.enemyTypes[Math.floor(Math.random() * levelData.enemyTypes.length)];

    let width = 28;
    let height = 28;
    let hp = 1;
    let color = COLORS.rose;
    let vy = 1.6;
    let vx = (Math.random() - 0.5) * 1.5;
    let scoreVal = 100;

    if (spawnType === 'interceptor') {
      width = 24;
      height = 32;
      hp = 2;
      color = COLORS.amber;
      vy = 2.8;
      scoreVal = 150;
    } else if (spawnType === 'cruiser') {
      width = 44;
      height = 36;
      hp = 5;
      color = COLORS.purple;
      vy = 0.9;
      scoreVal = 300;
    } else if (spawnType === 'asteroid') {
      width = 32;
      height = 32;
      hp = 3;
      color = '#94A3B8';
      vy = 1.8;
      vx = (Math.random() - 0.5) * 2;
      scoreVal = 120;
    } else if (spawnType === 'boss') {
      width = 72;
      height = 54;
      hp = 35 + state.currentLevel * 5;
      color = COLORS.rose;
      vy = 0.5;
      vx = 1.0;
      scoreVal = 1500;
    }

    activeEnemies.push({
      id: nextId('e'),
      type: spawnType,
      x: 30 + Math.random() * (GALAXY_WIDTH - 60),
      y: -height,
      vx,
      vy,
      width,
      height,
      hp,
      maxHp: hp,
      shootCooldown: 60 + Math.floor(Math.random() * 80),
      isBoss: spawnType === 'boss',
      color,
      scoreValue: scoreVal,
    });
  }

  // 3. Advance Player Bullets
  const allPlayerBullets = [...state.bullets, ...newPlayerBullets];
  const survivingBullets: PlayerBullet[] = [];
  for (const b of allPlayerBullets) {
    const ny = b.y + b.vy;
    const nx = b.x + b.vx;
    if (ny > -20 && nx > 0 && nx < GALAXY_WIDTH) {
      survivingBullets.push({ ...b, x: nx, y: ny });
    }
  }

  // 4. Update Enemies & Enemy Collisions with Player Bullets
  const survivingEnemies: Enemy[] = [];

  for (const enemy of activeEnemies) {
    let nx = enemy.x + enemy.vx;
    let ny = enemy.y + enemy.vy;

    // Bounce off walls for certain enemies
    if (enemy.isBoss || enemy.type === 'cruiser' || enemy.type === 'asteroid') {
      if (nx <= enemy.width / 2 || nx >= GALAXY_WIDTH - enemy.width / 2) {
        enemy.vx = -enemy.vx;
        nx = Math.max(enemy.width / 2, Math.min(GALAXY_WIDTH - enemy.width / 2, nx));
      }
      if (enemy.isBoss && (ny > 140 || ny < 30)) {
        enemy.vy = -enemy.vy;
      }
    }

    // Enemy Shooting
    let nextCooldown = enemy.shootCooldown - 1;
    if (nextCooldown <= 0 && ny > 20 && ny < GALAXY_HEIGHT - 60) {
      nextCooldown = enemy.isBoss ? 45 : enemy.type === 'cruiser' ? 75 : 110;

      if (enemy.isBoss) {
        // 3-way boss spread
        newEnemyBullets.push(
          { id: nextId('eb'), x: nx - 16, y: ny + enemy.height / 2, vx: -1.2, vy: 4, color: COLORS.rose },
          { id: nextId('eb'), x: nx, y: ny + enemy.height / 2, vx: 0, vy: 4.5, color: COLORS.rose },
          { id: nextId('eb'), x: nx + 16, y: ny + enemy.height / 2, vx: 1.2, vy: 4, color: COLORS.rose }
        );
      } else if (enemy.type === 'cruiser') {
        newEnemyBullets.push(
          { id: nextId('eb'), x: nx - 8, y: ny + enemy.height / 2, vx: -1, vy: 3.5, color: COLORS.amber },
          { id: nextId('eb'), x: nx + 8, y: ny + enemy.height / 2, vx: 1, vy: 3.5, color: COLORS.amber }
        );
      } else if (enemy.type === 'drone') {
        newEnemyBullets.push({
          id: nextId('eb'),
          x: nx,
          y: ny + enemy.height / 2,
          vx: 0,
          vy: 3.8,
          color: COLORS.rose,
        });
      }
    }

    // Check collisions with Player Bullets
    let enemyAlive = true;
    let curHp = enemy.hp;

    for (let i = survivingBullets.length - 1; i >= 0; i--) {
      const bullet = survivingBullets[i];
      const hit =
        bullet.x >= nx - enemy.width / 2 &&
        bullet.x <= nx + enemy.width / 2 &&
        bullet.y >= ny - enemy.height / 2 &&
        bullet.y <= ny + enemy.height / 2;

      if (hit) {
        curHp -= bullet.isLaser ? 3 : 1;
        if (!bullet.isLaser) {
          survivingBullets.splice(i, 1);
        }

        // Hit spark
        newParticles.push({
          id: nextId('part'),
          x: bullet.x,
          y: bullet.y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: COLORS.cyan,
          radius: 3,
          alpha: 1,
        });

        if (curHp <= 0) {
          enemyAlive = false;
          enemyDestroyed = true;
          defeatedCount += 1;
          newScore += enemy.scoreValue;

          // Explosion particles
          for (let p = 0; p < 6; p++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 3;
            newParticles.push({
              id: nextId('exp'),
              x: nx,
              y: ny,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: enemy.color,
              radius: 4,
              alpha: 1,
            });
          }

          // Drop power-up chance
          if (Math.random() < 0.22 || enemy.isBoss) {
            const types: GalaxyPowerUpType[] = ['spread', 'shield', 'bomb', 'laser'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            newPowerUps.push({
              id: nextId('pow'),
              type: chosen,
              x: nx,
              y: ny,
              vy: 1.8,
            });
          }
          break;
        }
      }
    }

    if (enemyAlive && ny < GALAXY_HEIGHT + 30) {
      survivingEnemies.push({
        ...enemy,
        x: nx,
        y: ny,
        hp: curHp,
        shootCooldown: nextCooldown,
      });
    }
  }

  // 5. Update Enemy Bullets & Player Collisions
  const survivingEnemyBullets: EnemyBullet[] = [];
  const allEnemyBullets = [...state.enemyBullets, ...newEnemyBullets].slice(-24);

  for (const eb of allEnemyBullets) {
    const ny = eb.y + eb.vy;
    const nx = eb.x + eb.vx;

    // Check hit on player ship
    const distToShip = Math.hypot(nx - state.playerX, ny - state.playerY);
    if (distToShip < (SHIP_WIDTH / 2 + 5)) {
      playerHit = true;
      if (currentShield > 0) {
        currentShield -= 1;
      } else {
        currentHp -= 1;
      }
    } else if (ny < GALAXY_HEIGHT + 10 && nx > 0 && nx < GALAXY_WIDTH) {
      survivingEnemyBullets.push({ ...eb, x: nx, y: ny });
    }
  }

  // 6. Update Falling Power-ups
  const survivingPowerUps: GalaxyPowerUp[] = [];
  for (const pow of [...state.powerUps, ...newPowerUps]) {
    const ny = pow.y + pow.vy;
    const distToShip = Math.hypot(pow.x - state.playerX, ny - state.playerY);
    if (distToShip < SHIP_WIDTH / 2 + 14) {
      // Collect power-up
      if (pow.type === 'spread') {
        weaponLvl = Math.min(3, weaponLvl + 1);
      } else if (pow.type === 'shield') {
        currentShield = Math.min(3, currentShield + 1);
      } else if (pow.type === 'bomb') {
        newBombs = Math.min(4, newBombs + 1);
      } else if (pow.type === 'laser') {
        laserRemaining = 7000;
      }
      newScore += 200;
    } else if (ny < GALAXY_HEIGHT + 20) {
      survivingPowerUps.push({ ...pow, y: ny });
    }
  }

  // 7. Update Particles (capped at 25)
  const survivingParticles: GalaxyParticle[] = [];
  for (const p of [...state.particles, ...newParticles].slice(-25)) {
    const nAlpha = p.alpha - 0.04;
    if (nAlpha > 0) {
      survivingParticles.push({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: nAlpha,
      });
    }
  }

  // Check Win Condition: all enemies defeated
  if (spawnedCount >= levelData.totalEnemies && survivingEnemies.length === 0) {
    levelFinished = true;
    newScore += currentHp * 300 + currentShield * 150;
  }

  // Check Loss Condition: HP <= 0
  const isGameOver = currentHp <= 0;

  return {
    nextState: {
      ...state,
      score: newScore,
      playerHp: currentHp,
      shieldHp: currentShield,
      bombs: newBombs,
      weaponLevel: weaponLvl,
      laserActive: laserRemaining,
      bullets: survivingBullets.slice(-30),
      enemyBullets: survivingEnemyBullets,
      enemies: survivingEnemies,
      powerUps: survivingPowerUps,
      particles: survivingParticles,
      enemiesSpawned: spawnedCount,
      enemiesDefeated: defeatedCount,
      lastSpawnTime: nextSpawnTime,
      lastPlayerShootTime: nextShootTime,
      levelCompleted: levelFinished,
      isGameOver,
    },
    playerHit,
    enemyDestroyed,
    levelFinished,
  };
}
