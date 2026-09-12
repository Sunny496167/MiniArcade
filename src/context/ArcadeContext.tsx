import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PlayerProfile, GameStats, Achievement, DailyChallenge, UserSettings } from '../types/arcade';
import { progressionService } from '../services/progressionService';
import { achievementService } from '../services/achievementService';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { audioService } from '../services/audioService';
import { hapticsService } from '../services/hapticsService';
import { storageService } from '../services/storageService';

const SETTINGS_KEY = '@mini_arcade_settings';

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,
  vibrationIntensity: 'medium',
  reducedMotion: false,
};

interface ArcadeContextType {
  profile: PlayerProfile;
  stats: Record<string, GameStats>;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  settings: UserSettings;
  isLoading: boolean;
  unlockedAchievementModal: Achievement | null;
  levelUpModalData: { level: number; xpReward: number } | null;
  dismissAchievementModal: () => void;
  dismissLevelUpModal: () => void;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  updateUsername: (name: string) => Promise<void>;
  recordGameResult: (
    gameId: string,
    score: number,
    baseXp: number,
    won?: boolean,
    contextualStats?: Record<string, any>
  ) => Promise<{
    earnedXp: number;
    isNewBest: boolean;
    leveledUp: boolean;
    newLevel: number;
    unlockedAchievements: Achievement[];
  }>;
  refreshDailyChallenge: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const ArcadeContext = createContext<ArcadeContextType | null>(null);

export const ArcadeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(progressionService.getProfile());
  const [stats, setStats] = useState<Record<string, GameStats>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [unlockedAchievementModal, setUnlockedAchievementModal] = useState<Achievement | null>(null);
  const [levelUpModalData, setLevelUpModalData] = useState<{ level: number; xpReward: number } | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const loadedProfile = await progressionService.init();
        setProfile(loadedProfile);
        setStats(progressionService.getAllStats());

        const loadedAchievements = await achievementService.init();
        setAchievements(loadedAchievements);

        const challenge = await dailyChallengeService.getTodayChallenge();
        setDailyChallenge(challenge);

        const loadedSettings = await storageService.getItem<UserSettings>(
          SETTINGS_KEY,
          DEFAULT_SETTINGS
        );
        setSettings(loadedSettings);
        audioService.setSoundEnabled(loadedSettings.soundEnabled);
        audioService.setMusicEnabled(loadedSettings.musicEnabled);
        hapticsService.setEnabled(loadedSettings.hapticsEnabled);
      } catch (err) {
        console.error('[ArcadeContext] Error bootstrapping arcade', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await storageService.setItem(SETTINGS_KEY, updated);

    if (partial.soundEnabled !== undefined) {
      audioService.setSoundEnabled(partial.soundEnabled);
    }
    if (partial.musicEnabled !== undefined) {
      audioService.setMusicEnabled(partial.musicEnabled);
    }
    if (partial.hapticsEnabled !== undefined) {
      hapticsService.setEnabled(partial.hapticsEnabled);
    }
  };

  const updateUsername = async (name: string) => {
    await progressionService.updateUsername(name);
    setProfile(progressionService.getProfile());
  };

  const recordGameResult = async (
    gameId: string,
    score: number,
    baseXp: number,
    won: boolean = false,
    contextualStats?: Record<string, any>
  ) => {
    const res = await progressionService.recordGameResult(
      gameId,
      score,
      baseXp,
      won,
      contextualStats
    );

    setProfile(res.updatedProfile);
    setStats(progressionService.getAllStats());

    // Check Daily Challenge progress
    await dailyChallengeService.reportProgress(gameId, 'score', score);
    if (won) {
      await dailyChallengeService.reportProgress(gameId, 'win', 1);
    }
    if (contextualStats?.highestTile) {
      await dailyChallengeService.reportProgress(gameId, 'highestTile', contextualStats.highestTile);
    }
    if (contextualStats?.bestReaction) {
      await dailyChallengeService.reportProgress(gameId, 'reactionTime', contextualStats.bestReaction);
    }
    const updatedChallenge = await dailyChallengeService.getTodayChallenge();
    setDailyChallenge(updatedChallenge);

    // Check Achievements
    const newAchievements = await achievementService.checkAchievements(
      res.updatedProfile,
      gameId,
      score,
      res.isNewBest,
      won,
      contextualStats
    );

    if (newAchievements.length > 0) {
      setAchievements(achievementService.getAchievements());
      // Queue modal celebration for first unlocked achievement
      setUnlockedAchievementModal(newAchievements[0]);
      audioService.play('achievementUnlock');
      hapticsService.success();
    } else if (res.leveledUp) {
      setLevelUpModalData({ level: res.newLevel, xpReward: res.newLevel * 50 });
      audioService.play('levelUp');
      hapticsService.success();
    }

    return {
      earnedXp: res.earnedXp,
      isNewBest: res.isNewBest,
      leveledUp: res.leveledUp,
      newLevel: res.newLevel,
      unlockedAchievements: newAchievements,
    };
  };

  const refreshDailyChallenge = async () => {
    const challenge = await dailyChallengeService.getTodayChallenge();
    setDailyChallenge(challenge);
  };

  const resetAllData = async () => {
    await progressionService.resetAllData();
    setProfile(progressionService.getProfile());
    setStats({});
    const reloadedAch = await achievementService.init();
    setAchievements(reloadedAch);
    const challenge = await dailyChallengeService.getTodayChallenge();
    setDailyChallenge(challenge);
  };

  return (
    <ArcadeContext.Provider
      value={{
        profile,
        stats,
        achievements,
        dailyChallenge,
        settings,
        isLoading,
        unlockedAchievementModal,
        levelUpModalData,
        dismissAchievementModal: () => setUnlockedAchievementModal(null),
        dismissLevelUpModal: () => setLevelUpModalData(null),
        updateSettings,
        updateUsername,
        recordGameResult,
        refreshDailyChallenge,
        resetAllData,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};

export const useArcade = () => {
  const context = useContext(ArcadeContext);
  if (!context) {
    throw new Error('useArcade must be used within an ArcadeProvider');
  }
  return context;
};
