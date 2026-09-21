export type EnemyType = 'drone' | 'interceptor' | 'cruiser' | 'asteroid' | 'boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  isBoss?: boolean;
  color: string;
  scoreValue: number;
}

export interface PlayerBullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isLaser?: boolean;
}

export interface EnemyBullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export type GalaxyPowerUpType = 'spread' | 'shield' | 'bomb' | 'laser';

export interface GalaxyPowerUp {
  id: string;
  type: GalaxyPowerUpType;
  x: number;
  y: number;
  vy: number;
}

export interface GalaxyParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
}

export interface GalaxyLevel {
  level: number;
  name: string;
  sector: string;
  totalEnemies: number;
  isBossLevel?: boolean;
  bossName?: string;
  spawnRate: number; // Interval ms
  enemyTypes: EnemyType[];
  preview: string;
}

export interface GalaxyState {
  currentLevel: number;
  score: number;
  playerX: number;
  playerY: number;
  playerHp: number;
  maxPlayerHp: number;
  shieldHp: number;
  bombs: number;
  weaponLevel: number; // 1 (dual), 2 (triple), 3 (5-way)
  laserActive: number; // Duration ms
  bullets: PlayerBullet[];
  enemyBullets: EnemyBullet[];
  enemies: Enemy[];
  powerUps: GalaxyPowerUp[];
  particles: GalaxyParticle[];
  enemiesSpawned: number;
  enemiesDefeated: number;
  lastSpawnTime: number;
  lastPlayerShootTime: number;
  levelCompleted: boolean;
  isGameOver: boolean;
}
