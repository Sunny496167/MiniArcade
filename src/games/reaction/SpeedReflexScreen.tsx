import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { ReactionState, ReflexPhase, ReactionTrial, ChallengeType } from './types';
import {
  createInitialReactionState,
  getLevelConfig,
  generateChallenge,
  scoreForTrial,
  TOTAL_LEVELS,
  HOLD_DURATION_MS,
  DOUBLE_TAP_WINDOW_MS,
} from './engine/reactionEngine';
import { LevelBadge } from './components/LevelBadge';
import { ChallengeArena } from './components/ChallengeArena';
import { StreakBanner } from './components/StreakBanner';
import { LevelCompleteOverlay } from './components/LevelCompleteOverlay';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

// ── Inner Component to handle React hooks safely inside the render prop ─────
interface SpeedReflexGameInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  state: ReactionState;
  setState: React.Dispatch<React.SetStateAction<ReactionState>>;
  startNextTrial: () => void;
  clearAllTimers: () => void;
  timerRef: React.MutableRefObject<any>;
  windowTimerRef: React.MutableRefObject<any>;
  holdTimerRef: React.MutableRefObject<any>;
  doubleTapTimerRef: React.MutableRefObject<any>;
  doubleTapCountRef: React.MutableRefObject<number>;
  stateRef: React.MutableRefObject<ReactionState>;
}

const SpeedReflexGameInner: React.FC<SpeedReflexGameInnerProps> = ({
  gameState,
  triggerGameOver,
  state,
  setState,
  startNextTrial,
  clearAllTimers,
  windowTimerRef,
  holdTimerRef,
  doubleTapTimerRef,
  doubleTapCountRef,
  stateRef,
}) => {
  // Auto-start next trial
  useEffect(() => {
    if (gameState === 'PLAYING' && (state.phase === 'READY' || state.phase === 'ROUND_RESULT')) {
      if (state.phase === 'READY') {
        startNextTrial();
      }
    }
    if (gameState !== 'PLAYING') {
      clearAllTimers();
    }
  }, [gameState, state.phase]);

  const failTrial = (phase: ReflexPhase) => {
    clearAllTimers();
    audioService.play('gameOver');
    hapticsService.heavy();
    
    setState(prev => ({
      ...prev,
      phase,
      streakCount: 0,
      missCount: prev.missCount + 1,
      levelScore: Math.max(0, prev.levelScore - 50),
      totalScore: Math.max(0, prev.totalScore - 50),
    }));
  };

  const completeTrial = (timeMs: number) => {
    clearAllTimers();
    audioService.play('win');
    hapticsService.success();

    const cur = stateRef.current;
    const streak = cur.streakCount + 1;
    const maxStreak = Math.max(cur.maxStreak, streak);
    const score = scoreForTrial(timeMs, cur.challengeType, cur.currentLevel, streak);

    const trialObj: ReactionTrial = {
      trialNumber: cur.currentLevelTrial,
      timeMs,
      challengeType: cur.challengeType,
      correct: true,
    };

    const newLevelTrials = [...cur.levelTrials, trialObj];
    const newTrials = [...cur.trials, trialObj];
    const best = cur.bestTimeMs === null ? timeMs : Math.min(cur.bestTimeMs, timeMs);
    const avg = Math.round(newTrials.reduce((s, t) => s + t.timeMs, 0) / newTrials.length);

    const config = getLevelConfig(cur.currentLevel);

    if (cur.currentLevelTrial >= config.trialsCount) {
      // Level Complete
      setState(prev => ({
        ...prev,
        phase: 'LEVEL_COMPLETE',
        streakCount: streak,
        maxStreak,
        lastTimeMs: timeMs,
        bestTimeMs: best,
        averageTimeMs: avg,
        levelTrials: newLevelTrials,
        trials: newTrials,
        levelScore: prev.levelScore + score,
        totalScore: prev.totalScore + score,
      }));
    } else {
      // Next Trial in level
      setState(prev => ({
        ...prev,
        phase: 'ROUND_RESULT',
        streakCount: streak,
        maxStreak,
        lastTimeMs: timeMs,
        bestTimeMs: best,
        averageTimeMs: avg,
        levelTrials: newLevelTrials,
        trials: newTrials,
        levelScore: prev.levelScore + score,
        totalScore: prev.totalScore + score,
      }));
    }
  };

  const handlePressIn = () => {
    const cur = stateRef.current;
    
    if (cur.phase === 'WAITING') {
      return failTrial('TOO_EARLY');
    }
    
    if (cur.phase === 'DECOY') {
      return failTrial('WRONG_COLOR');
    }

    if (cur.phase === 'REACT_NOW' || cur.phase === 'HOLD_NOW') {
      const reactionTime = Date.now() - cur.startTime;

      if (cur.challengeType === 'HOLD') {
        // Start holding
        if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
        holdTimerRef.current = setTimeout(() => {
          // Successfully held for duration
          completeTrial(reactionTime); // using initial reaction time for score
        }, HOLD_DURATION_MS);
        return;
      }

      if (cur.challengeType === 'DOUBLE_TAP') {
        if (doubleTapCountRef.current === 0) {
          // First tap
          if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
          doubleTapCountRef.current = 1;
          
          doubleTapTimerRef.current = setTimeout(() => {
            failTrial('MISSED');
          }, DOUBLE_TAP_WINDOW_MS);
        } else {
          // Second tap
          if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
          completeTrial(reactionTime); // time of second tap
        }
        return;
      }

      // Standard tap or color match
      if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
      completeTrial(reactionTime);
    }
  };

  const handlePressOut = () => {
    const cur = stateRef.current;
    if (cur.phase === 'HOLD_NOW' && cur.challengeType === 'HOLD') {
      // Released early!
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        failTrial('TOO_EARLY');
      }
    }
  };

  const nextLevel = () => {
    setState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      currentLevelTrial: 1,
      levelTrials: [],
      levelScore: 0,
      phase: 'READY',
    }));
  };

  const handleFinishGame = () => {
    triggerGameOver(state.totalScore, true, [
      { label: 'Best Reaction', value: `${state.bestTimeMs || 0} ms`, isHighlight: true },
      { label: 'Average Reflex', value: `${state.averageTimeMs || 0} ms` },
      { label: 'Max Streak', value: `${state.maxStreak}x` },
      { label: 'False Starts', value: state.missCount },
    ]);
  };

  const handleNextTrialBtn = () => {
    setState(prev => ({ ...prev, currentLevelTrial: prev.currentLevelTrial + 1 }));
    startNextTrial();
  };

  const nextLevelConfig = state.currentLevel < TOTAL_LEVELS ? getLevelConfig(state.currentLevel + 1) : null;
  const config = getLevelConfig(state.currentLevel);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LevelBadge 
          currentLevel={state.currentLevel}
          currentTrial={state.currentLevelTrial}
          totalTrials={config.trialsCount}
          totalScore={state.totalScore}
        />
      </View>

      <View style={styles.arenaContainer}>
        <ChallengeArena 
          state={state}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onRetry={startNextTrial}
          onNextTrial={handleNextTrialBtn}
        />
      </View>

      <View style={styles.footer}>
         <StreakBanner 
           streak={state.streakCount} 
           multiplier={state.streakCount > 0 ? getLevelConfig(state.currentLevel).level * (state.streakCount > 6 ? 2.0 : state.streakCount > 4 ? 1.5 : state.streakCount > 2 ? 1.25 : 1.0) : 1}
         />
      </View>

      <LevelCompleteOverlay 
        visible={state.phase === 'LEVEL_COMPLETE'}
        level={state.currentLevel}
        scoreEarned={state.levelScore}
        trials={state.levelTrials}
        nextLevelConfig={nextLevelConfig}
        onNextLevel={nextLevel}
        onFinishGame={handleFinishGame}
      />
    </View>
  );
};

export const SpeedReflexScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'reaction')!;

  const [state, setState] = useState<ReactionState>(createInitialReactionState());
  
  const timerRef = useRef<any>(null);
  const windowTimerRef = useRef<any>(null);
  const holdTimerRef = useRef<any>(null);
  const doubleTapTimerRef = useRef<any>(null);
  const doubleTapCountRef = useRef<number>(0);
  
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (doubleTapTimerRef.current) clearTimeout(doubleTapTimerRef.current);
  };

  const resetGame = () => {
    clearAllTimers();
    setState(createInitialReactionState());
  };

  const showSignal = (challenge: ChallengeType, windowMs: number | null) => {
    audioService.play('pointScore');
    hapticsService.heavy();
    
    setState(prev => ({
      ...prev,
      phase: challenge === 'HOLD' ? 'HOLD_NOW' : 'REACT_NOW',
      isDecoy: false,
      startTime: Date.now(),
    }));

    if (windowMs) {
      windowTimerRef.current = setTimeout(() => {
        // Fail via MISSED - directly mutate state since we are inside timeout
        clearAllTimers();
        audioService.play('gameOver');
        hapticsService.heavy();
        
        setState(prev => ({
          ...prev,
          phase: 'MISSED',
          streakCount: 0,
          missCount: prev.missCount + 1,
          levelScore: Math.max(0, prev.levelScore - 50),
          totalScore: Math.max(0, prev.totalScore - 50),
        }));
      }, windowMs);
    }
  };

  const startNextTrial = () => {
    clearAllTimers();
    doubleTapCountRef.current = 0;

    const config = getLevelConfig(stateRef.current.currentLevel);
    const challenge = generateChallenge(config);
    
    setState(prev => ({
      ...prev,
      phase: 'WAITING',
      challengeType: challenge,
      isDecoy: false,
    }));

    const delay = config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs);

    timerRef.current = setTimeout(() => {
      // 50% chance for decoy on color match
      if (challenge === 'COLOR_MATCH' && Math.random() > 0.5) {
        setState(prev => ({ ...prev, phase: 'DECOY', isDecoy: true }));
        
        // Decoy lasts 400-600ms, then switch to real signal
        timerRef.current = setTimeout(() => {
          showSignal(challenge, config.windowMs);
        }, 400 + Math.random() * 200);
      } else {
        showSignal(challenge, config.windowMs);
      }
    }, delay);
  };

  return (
    <GameContainer
      game={gameMetadata}
      score={state.totalScore}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => (
        <SpeedReflexGameInner
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          state={state}
          setState={setState}
          startNextTrial={startNextTrial}
          clearAllTimers={clearAllTimers}
          timerRef={timerRef}
          windowTimerRef={windowTimerRef}
          holdTimerRef={holdTimerRef}
          doubleTapTimerRef={doubleTapTimerRef}
          doubleTapCountRef={doubleTapCountRef}
          stateRef={stateRef}
        />
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    zIndex: 10,
  },
  arenaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  footer: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  }
});
