import { PlayerProfile, GameStats } from '../types/arcade';
import { storageService } from './storageService';

const PROFILE_STORAGE_KEY = '@mini_arcade_player_profile';
const STATS_STORAGE_KEY = '@mini_arcade_game_stats';

const DEFAULT_PROFILE: PlayerProfile = {
  username: '',
  avatarSeed: 'neon_rider',
  level: 1,
  currentXp: 0,
  xpToNextLevel: 250,
  totalXp: 0,
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalPlayTimeSeconds: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  hasOnboarded: false,
};

class ProgressionService {
  private profile: PlayerProfile = { ...DEFAULT_PROFILE };
  private statsMap: Record<string, GameStats> = {};
  private initialized: boolean = false;

  async init(): Promise<PlayerProfile> {
    if (this.initialized) return this.profile;

    const loadedProfile = await storageService.getItem<PlayerProfile>(
      PROFILE_STORAGE_KEY,
      DEFAULT_PROFILE
    );

    // Backwards compatibility: if it's an existing profile without hasOnboarded, they are already onboarded.
    if (loadedProfile.username && loadedProfile.hasOnboarded === undefined) {
      loadedProfile.hasOnboarded = true;
    }
    
    this.profile = loadedProfile;

    this.statsMap = await storageService.getItem<Record<string, GameStats>>(
      STATS_STORAGE_KEY,
      {}
    );

    // Check daily streak
    this.updateDailyStreak();

    this.initialized = true;
    return this.profile;
  }

  private updateDailyStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.profile.lastActiveDate !== today) {
      const lastDate = new Date(this.profile.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        this.profile.dailyStreak += 1;
      } else if (diffDays > 1) {
        this.profile.dailyStreak = 1;
      }
      this.profile.lastActiveDate = today;
      this.saveProfile();
    }
  }

  getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  async completeOnboarding(username: string): Promise<void> {
    this.profile.username = username;
    this.profile.hasOnboarded = true;
    await this.saveProfile();
  }

  getGameStats(gameId: string): GameStats {
    return (
      this.statsMap[gameId] || {
        timesPlayed: 0,
        highScore: 0,
        totalScore: 0,
      }
    );
  }

  getAllStats(): Record<string, GameStats> {
    return { ...this.statsMap };
  }

  calculateXpForGame(baseXp: number, score: number, won: boolean = false): number {
    const scoreBonus = Math.min(Math.floor(score / 15), 150);
    const winBonus = won ? 50 : 0;
    return baseXp + scoreBonus + winBonus;
  }

  async recordGameResult(
    gameId: string,
    score: number,
    baseXp: number,
    won: boolean = false,
    contextualBest?: Record<string, number | string>
  ): Promise<{
    earnedXp: number;
    isNewBest: boolean;
    leveledUp: boolean;
    newLevel: number;
    prevProfile: PlayerProfile;
    updatedProfile: PlayerProfile;
  }> {
    const prevProfile = { ...this.profile };

    // Update game-specific stats
    const currentStats = this.getGameStats(gameId);
    const isNewBest = score > currentStats.highScore;
    const newHighScore = Math.max(currentStats.highScore, score);

    const updatedGameStats: GameStats = {
      timesPlayed: currentStats.timesPlayed + 1,
      highScore: newHighScore,
      totalScore: currentStats.totalScore + score,
      lastPlayed: Date.now(),
      contextualBest: {
        ...currentStats.contextualBest,
        ...contextualBest,
      },
    };
    this.statsMap[gameId] = updatedGameStats;
    await storageService.setItem(STATS_STORAGE_KEY, this.statsMap);

    // Calculate XP
    const earnedXp = this.calculateXpForGame(baseXp, score, won);

    // Progression math
    let leveledUp = false;
    let newLevel = this.profile.level;
    let newCurrentXp = this.profile.currentXp + earnedXp;
    let xpNeeded = this.profile.xpToNextLevel;

    while (newCurrentXp >= xpNeeded) {
      newCurrentXp -= xpNeeded;
      newLevel += 1;
      xpNeeded = newLevel * 250;
      leveledUp = true;
    }

    this.profile = {
      ...this.profile,
      level: newLevel,
      currentXp: newCurrentXp,
      xpToNextLevel: xpNeeded,
      totalXp: this.profile.totalXp + earnedXp,
      gamesPlayed: this.profile.gamesPlayed + 1,
      gamesWon: won ? this.profile.gamesWon + 1 : this.profile.gamesWon,
    };

    await this.saveProfile();

    return {
      earnedXp,
      isNewBest,
      leveledUp,
      newLevel,
      prevProfile,
      updatedProfile: { ...this.profile },
    };
  }

  async addPlayTime(seconds: number) {
    this.profile.totalPlayTimeSeconds += seconds;
    await this.saveProfile();
  }

  async updateUsername(newUsername: string) {
    this.profile.username = newUsername.trim() || 'CyberRunner';
    await this.saveProfile();
  }

  private async saveProfile() {
    await storageService.setItem(PROFILE_STORAGE_KEY, this.profile);
  }

  async resetAllData() {
    this.profile = { ...DEFAULT_PROFILE };
    this.statsMap = {};
    await storageService.clear();
  }
}

export const progressionService = new ProgressionService();
