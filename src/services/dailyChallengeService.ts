import { DailyChallenge } from '../types/arcade';
import { storageService } from './storageService';

const DAILY_CHALLENGE_KEY = '@mini_arcade_daily_challenge';

const CHALLENGE_POOL: Omit<DailyChallenge, 'id' | 'date' | 'currentValue' | 'completed'>[] = [
  {
    title: 'Neon Serpent Harvest',
    description: 'Score 250+ points in Neon Snake to overload the power grid.',
    gameId: 'snake',
    targetMetric: 'score',
    targetValue: 250,
    xpReward: 200,
  },
  {
    title: 'Breakout Matrix Surge',
    description: 'Shatter 300+ score in Neon Breakout with multi-ball combos.',
    gameId: 'breakout',
    targetMetric: 'score',
    targetValue: 300,
    xpReward: 250,
  },
  {
    title: 'Core Fusion Experiment',
    description: 'Fuse at least a 256 tile in 2048 Glow.',
    gameId: 'game2048',
    targetMetric: 'highestTile',
    targetValue: 256,
    xpReward: 250,
  },
  {
    title: 'Neural Reflex Mastery',
    description: 'Achieve a reaction time under 300ms in Speed Reflex.',
    gameId: 'reaction',
    targetMetric: 'reactionTime',
    targetValue: 300,
    xpReward: 200,
  },
  {
    title: 'Tactical Grid Extraction',
    description: 'Clear a tactical minefield in Minesweeper Tactical.',
    gameId: 'minesweeper',
    targetMetric: 'win',
    targetValue: 1,
    xpReward: 250,
  },
  {
    title: 'Cyber Duel Domination',
    description: 'Win a match against AI in Cyber Tic-Tac-Toe.',
    gameId: 'tictactoe',
    targetMetric: 'win',
    targetValue: 1,
    xpReward: 180,
  },
];

class DailyChallengeService {
  private currentChallenge: DailyChallenge | null = null;

  async getTodayChallenge(): Promise<DailyChallenge> {
    const todayStr = new Date().toISOString().split('T')[0];

    const saved = await storageService.getItem<DailyChallenge | null>(
      DAILY_CHALLENGE_KEY,
      null
    );

    if (saved && saved.date === todayStr) {
      this.currentChallenge = saved;
      return saved;
    }

    // Determine challenge deterministically by day
    const daySeed = todayStr
      .split('-')
      .reduce((acc, part) => acc + parseInt(part, 10), 0);
    const templateIndex = daySeed % CHALLENGE_POOL.length;
    const template = CHALLENGE_POOL[templateIndex];

    const newChallenge: DailyChallenge = {
      ...template,
      id: `challenge_${todayStr}`,
      date: todayStr,
      currentValue: 0,
      completed: false,
    };

    this.currentChallenge = newChallenge;
    await storageService.setItem(DAILY_CHALLENGE_KEY, newChallenge);
    return newChallenge;
  }

  async reportProgress(
    gameId: string,
    metric: string,
    value: number
  ): Promise<{ completedNow: boolean; challenge: DailyChallenge | null }> {
    const challenge = await this.getTodayChallenge();
    if (challenge.completed || challenge.gameId !== gameId) {
      return { completedNow: false, challenge };
    }

    let completedNow = false;

    if (challenge.targetMetric === metric) {
      if (metric === 'reactionTime') {
        // Lower is better
        if (value <= challenge.targetValue) {
          challenge.currentValue = value;
          challenge.completed = true;
          completedNow = true;
        } else {
          challenge.currentValue = Math.min(
            challenge.currentValue === 0 ? value : challenge.currentValue,
            value
          );
        }
      } else {
        challenge.currentValue = Math.max(challenge.currentValue, value);
        if (challenge.currentValue >= challenge.targetValue) {
          challenge.completed = true;
          completedNow = true;
        }
      }
    }

    await storageService.setItem(DAILY_CHALLENGE_KEY, challenge);
    this.currentChallenge = challenge;
    return { completedNow, challenge };
  }
}

export const dailyChallengeService = new DailyChallengeService();
