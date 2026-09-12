import { Achievement, PlayerProfile, GameStats } from '../types/arcade';
import { storageService } from './storageService';

const ACHIEVEMENTS_STORAGE_KEY = '@mini_arcade_achievements';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Blood',
    description: 'Complete your first arcade match in any game mode.',
    icon: 'Sword',
    category: 'general',
    xpReward: 100,
    unlocked: false,
    progress: 0,
    targetProgress: 1,
  },
  {
    id: 'score_hunter',
    title: 'Score Hunter',
    description: 'Set a new personal high score in any game.',
    icon: 'Crosshair',
    category: 'general',
    xpReward: 150,
    unlocked: false,
    progress: 0,
    targetProgress: 1,
  },
  {
    id: 'arcade_addict',
    title: 'Arcade Addict',
    description: 'Play a total of 10 matches across the arcade.',
    icon: 'Flame',
    category: 'general',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    targetProgress: 10,
  },
  {
    id: 'level_5_master',
    title: 'Rising Star',
    description: 'Reach Player Level 5 in the global arcade rankings.',
    icon: 'Star',
    category: 'general',
    xpReward: 300,
    unlocked: false,
    progress: 1,
    targetProgress: 5,
  },
  {
    id: 'snake_viper',
    title: 'Cyber Viper',
    description: 'Score 300 or higher in Neon Snake.',
    icon: 'Zap',
    category: 'classic',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    targetProgress: 300,
  },
  {
    id: 'breakout_master',
    title: 'Matrix Shatterer',
    description: 'Score 500 or higher in Neon Breakout.',
    icon: 'Layers',
    category: 'arcade',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    targetProgress: 500,
  },
  {
    id: 'tile_fusion_512',
    title: 'Core Fusion',
    description: 'Fuse a 512 tile or higher in 2048 Glow.',
    icon: 'Grid',
    category: 'puzzle',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    targetProgress: 512,
  },
  {
    id: 'minesweeper_cleared',
    title: 'Bomb Specialist',
    description: 'Successfully clear a tactical minefield without detonation.',
    icon: 'ShieldAlert',
    category: 'strategy',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    targetProgress: 1,
  },
  {
    id: 'speed_demon',
    title: 'Synapse Surge',
    description: 'Register a reaction time under 260ms in Speed Reflex.',
    icon: 'Activity',
    category: 'reaction',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    targetProgress: 1,
  },
  {
    id: 'tactician_unbeatable',
    title: 'Neural Overlord',
    description: 'Defeat or tie the Unbeatable Minimax AI in Cyber Tic-Tac-Toe.',
    icon: 'Cpu',
    category: 'strategy',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    targetProgress: 1,
  },
];

class AchievementService {
  private achievements: Achievement[] = [...INITIAL_ACHIEVEMENTS];
  private initialized: boolean = false;

  async init(): Promise<Achievement[]> {
    if (this.initialized) return this.achievements;

    const saved = await storageService.getItem<Achievement[]>(
      ACHIEVEMENTS_STORAGE_KEY,
      INITIAL_ACHIEVEMENTS
    );

    // Merge saved status with initial list to handle newly added achievements
    this.achievements = INITIAL_ACHIEVEMENTS.map((initial) => {
      const existing = saved.find((s) => s.id === initial.id);
      return existing || initial;
    });

    this.initialized = true;
    return this.achievements;
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  async checkAchievements(
    profile: PlayerProfile,
    gameId: string,
    score: number,
    isNewBest: boolean,
    won: boolean,
    contextualStats?: Record<string, any>
  ): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    const unlock = (ach: Achievement) => {
      if (!ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = Date.now();
        ach.progress = ach.targetProgress;
        newlyUnlocked.push(ach);
      }
    };

    for (const ach of this.achievements) {
      if (ach.unlocked) continue;

      switch (ach.id) {
        case 'first_game':
          if (profile.gamesPlayed >= 1) unlock(ach);
          break;

        case 'score_hunter':
          if (isNewBest) unlock(ach);
          break;

        case 'arcade_addict':
          ach.progress = Math.min(profile.gamesPlayed, 10);
          if (profile.gamesPlayed >= 10) unlock(ach);
          break;

        case 'level_5_master':
          ach.progress = Math.min(profile.level, 5);
          if (profile.level >= 5) unlock(ach);
          break;

        case 'snake_viper':
          if (gameId === 'snake') {
            ach.progress = Math.max(ach.progress || 0, score);
            if (score >= 300) unlock(ach);
          }
          break;

        case 'breakout_master':
          if (gameId === 'breakout') {
            ach.progress = Math.max(ach.progress || 0, score);
            if (score >= 500) unlock(ach);
          }
          break;

        case 'tile_fusion_512':
          if (gameId === 'game2048' && contextualStats?.highestTile >= 512) {
            unlock(ach);
          }
          break;

        case 'minesweeper_cleared':
          if (gameId === 'minesweeper' && won) {
            unlock(ach);
          }
          break;

        case 'speed_demon':
          if (
            gameId === 'reaction' &&
            contextualStats?.bestReaction &&
            contextualStats.bestReaction <= 260
          ) {
            unlock(ach);
          }
          break;

        case 'tactician_unbeatable':
          if (
            gameId === 'tictactoe' &&
            (won || contextualStats?.isTie) &&
            contextualStats?.difficulty === 'Unbeatable'
          ) {
            unlock(ach);
          }
          break;
      }
    }

    if (newlyUnlocked.length > 0) {
      await storageService.setItem(ACHIEVEMENTS_STORAGE_KEY, this.achievements);
    }

    return newlyUnlocked;
  }
}

export const achievementService = new AchievementService();
