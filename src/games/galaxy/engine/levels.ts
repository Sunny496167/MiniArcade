import { GalaxyLevel, EnemyType } from '../types';

export const TOTAL_GALAXY_LEVELS = 30;

export const GALAXY_LEVELS: GalaxyLevel[] = [
  // Sector 1: Orion Perimeter (Levels 1 to 5)
  {
    level: 1,
    name: 'Patrol Outpost',
    sector: 'Sector 1: Orion Perimeter',
    totalEnemies: 12,
    spawnRate: 1400,
    enemyTypes: ['drone'],
    preview: 'Scout drone patrol ahead. Test blasters and ship maneuvering.',
  },
  {
    level: 2,
    name: 'Asteroid Belt',
    sector: 'Sector 1: Orion Perimeter',
    totalEnemies: 15,
    spawnRate: 1300,
    enemyTypes: ['drone', 'asteroid'],
    preview: 'Asteroid hazards detected! Blast them before collision.',
  },
  {
    level: 3,
    name: 'Interceptor Skirmish',
    sector: 'Sector 1: Orion Perimeter',
    totalEnemies: 18,
    spawnRate: 1200,
    enemyTypes: ['drone', 'interceptor'],
    preview: 'Fast kamikaze interceptors diving from upper quadrant.',
  },
  {
    level: 4,
    name: 'Vanguard Squadron',
    sector: 'Sector 1: Orion Perimeter',
    totalEnemies: 22,
    spawnRate: 1100,
    enemyTypes: ['drone', 'interceptor', 'cruiser'],
    preview: 'Cruisers with 3-way spread plasma blasters entering.',
  },
  {
    level: 5,
    name: 'BOSS: Viper Dreadnought',
    sector: 'Sector 1: Orion Perimeter',
    totalEnemies: 25,
    isBossLevel: true,
    bossName: 'Viper Dreadnought',
    spawnRate: 1000,
    enemyTypes: ['drone', 'interceptor', 'boss'],
    preview: 'SECTOR BOSS: Viper Dreadnought! Defeat the flagship to advance.',
  },

  // Sector 2: Nebula Veil (Levels 6 to 10)
  ...Array.from({ length: 5 }, (_, i): GalaxyLevel => {
    const lvl = 6 + i;
    const isBoss = lvl === 10;
    return {
      level: lvl,
      name: isBoss ? 'BOSS: Titan Carrier' : `Nebula Corridor ${lvl - 5}`,
      sector: 'Sector 2: Nebula Veil',
      totalEnemies: 20 + (lvl - 5) * 4,
      isBossLevel: isBoss,
      bossName: isBoss ? 'Titan Carrier' : undefined,
      spawnRate: Math.max(850, 1100 - (lvl - 5) * 50),
      enemyTypes: isBoss
        ? (['interceptor', 'cruiser', 'boss'] as EnemyType[])
        : (['drone', 'interceptor', 'cruiser', 'asteroid'] as EnemyType[]),
      preview: isBoss
        ? 'SECTOR BOSS: Titan Carrier with dual drone deployment!'
        : `Sector 2 wave ${lvl - 5}: Dense nebula dust with reinforced cruisers.`,
    };
  }),

  // Sector 3: Solar Flare Zone (Levels 11 to 15)
  ...Array.from({ length: 5 }, (_, i): GalaxyLevel => {
    const lvl = 11 + i;
    const isBoss = lvl === 15;
    return {
      level: lvl,
      name: isBoss ? 'BOSS: Solar Destroyer' : `Solar Expanse ${lvl - 10}`,
      sector: 'Sector 3: Solar Flare',
      totalEnemies: 26 + (lvl - 10) * 4,
      isBossLevel: isBoss,
      bossName: isBoss ? 'Solar Destroyer' : undefined,
      spawnRate: Math.max(750, 950 - (lvl - 10) * 45),
      enemyTypes: isBoss
        ? (['interceptor', 'cruiser', 'boss'] as EnemyType[])
        : (['interceptor', 'cruiser', 'asteroid'] as EnemyType[]),
      preview: isBoss
        ? 'SECTOR BOSS: Solar Destroyer firing scorching laser sweeps!'
        : `Sector 3 wave ${lvl - 10}: High speed interceptor barrages!`,
    };
  }),

  // Sector 4: Cyber Void (Levels 16 to 20)
  ...Array.from({ length: 5 }, (_, i): GalaxyLevel => {
    const lvl = 16 + i;
    const isBoss = lvl === 20;
    return {
      level: lvl,
      name: isBoss ? 'BOSS: Quantum Cruiser' : `Void Gate ${lvl - 15}`,
      sector: 'Sector 4: Cyber Void',
      totalEnemies: 30 + (lvl - 15) * 4,
      isBossLevel: isBoss,
      bossName: isBoss ? 'Quantum Cruiser' : undefined,
      spawnRate: Math.max(680, 850 - (lvl - 15) * 40),
      enemyTypes: isBoss
        ? (['interceptor', 'cruiser', 'boss'] as EnemyType[])
        : (['drone', 'interceptor', 'cruiser'] as EnemyType[]),
      preview: isBoss
        ? 'SECTOR BOSS: Quantum Cruiser featuring bullet hell spirals!'
        : `Sector 4 wave ${lvl - 15}: Stealth cruisers with rapid laser arrays.`,
    };
  }),

  // Sector 5: Event Horizon (Levels 21 to 25)
  ...Array.from({ length: 5 }, (_, i): GalaxyLevel => {
    const lvl = 21 + i;
    const isBoss = lvl === 25;
    return {
      level: lvl,
      name: isBoss ? 'BOSS: Void Colossus' : `Horizon Breach ${lvl - 20}`,
      sector: 'Sector 5: Event Horizon',
      totalEnemies: 36 + (lvl - 20) * 4,
      isBossLevel: isBoss,
      bossName: isBoss ? 'Void Colossus' : undefined,
      spawnRate: Math.max(620, 750 - (lvl - 20) * 30),
      enemyTypes: isBoss
        ? (['interceptor', 'cruiser', 'boss'] as EnemyType[])
        : (['drone', 'interceptor', 'cruiser', 'asteroid'] as EnemyType[]),
      preview: isBoss
        ? 'SECTOR BOSS: Void Colossus! High-gravity bullet storm.'
        : `Sector 5 wave ${lvl - 20}: Heavy enemy formations closing in.`,
    };
  }),

  // Sector 6: Mainframe Core (Levels 26 to 30)
  ...Array.from({ length: 5 }, (_, i): GalaxyLevel => {
    const lvl = 26 + i;
    const isBoss = lvl === 30;
    return {
      level: lvl,
      name: isBoss ? 'FINAL BOSS: Cyber Mother Ship' : `Core Corridor ${lvl - 25}`,
      sector: 'Sector 6: Mainframe Core',
      totalEnemies: isBoss ? 45 : 38 + (lvl - 25) * 3,
      isBossLevel: isBoss,
      bossName: isBoss ? 'Cyber Mother Ship' : undefined,
      spawnRate: Math.max(550, 680 - (lvl - 25) * 30),
      enemyTypes: isBoss
        ? (['interceptor', 'cruiser', 'boss'] as EnemyType[])
        : (['drone', 'interceptor', 'cruiser'] as EnemyType[]),
      preview: isBoss
        ? 'FINAL LEVEL: Destroy the Cyber Mother Ship and liberate the galaxy!'
        : `Final sector wave ${lvl - 25}: Relentless enemy offensive!`,
    };
  }),
];

export const getGalaxyLevel = (levelNum: number): GalaxyLevel => {
  const clamped = Math.max(1, Math.min(TOTAL_GALAXY_LEVELS, levelNum));
  return GALAXY_LEVELS[clamped - 1] || GALAXY_LEVELS[0];
};
