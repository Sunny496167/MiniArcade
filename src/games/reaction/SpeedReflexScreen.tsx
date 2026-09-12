import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { ZoomIn, FadeIn, BounceIn } from 'react-native-reanimated';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { ReactionState, ReflexPhase } from './types';
import {
  createInitialReactionState,
  getReflexTier,
  calculateReflexScore,
  TOTAL_TRIALS,
} from './engine/reactionEngine';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

interface SpeedReflexGameInnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  state: ReactionState;
  setState: React.Dispatch<React.SetStateAction<ReactionState>>;
  timerRef: React.MutableRefObject<any>;
  stateRef: React.MutableRefObject<ReactionState>;
  startNextRound: () => void;
}

const SpeedReflexGameInner: React.FC<SpeedReflexGameInnerProps> = ({
  gameState,
  triggerGameOver,
  state,
  setState,
  timerRef,
  stateRef,
  startNextRound,
}) => {
  // Auto-start round 1 when entering PLAYING
  useEffect(() => {
    if (gameState === 'PLAYING' && state.phase === 'READY') {
      startNextRound();
    }
    if (gameState !== 'PLAYING' && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, state.phase, startNextRound, timerRef]);

  const handleScreenTap = () => {
    if (gameState !== 'PLAYING') return;

    const current = stateRef.current;

    // Case 1: Tapped while WAITING -> Too early / False start!
    if (current.phase === 'WAITING') {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioService.play('gameOver');
      hapticsService.heavy();

      setState((prev) => ({
        ...prev,
        phase: 'TOO_EARLY',
        falseStarts: prev.falseStarts + 1,
      }));
      return;
    }

    // Case 2: Tapped when REACT_NOW -> Record reaction time!
    if (current.phase === 'REACT_NOW') {
      const reactionTime = Date.now() - current.startTime;
      audioService.play('win');
      hapticsService.success();

      const updatedTrials = [
        ...current.trials,
        { trialNumber: current.currentTrial, timeMs: reactionTime },
      ];

      const best =
        current.bestTimeMs === null
          ? reactionTime
          : Math.min(current.bestTimeMs, reactionTime);

      const avg = Math.round(
        updatedTrials.reduce((sum, t) => sum + t.timeMs, 0) /
          updatedTrials.length
      );

      // Check if completed 5 rounds
      if (current.currentTrial >= TOTAL_TRIALS) {
        const finalScore = calculateReflexScore(
          updatedTrials,
          current.falseStarts
        );
        const tier = getReflexTier(best);

        setState((prev) => ({
          ...prev,
          phase: 'FINAL_COMPLETE',
          trials: updatedTrials,
          lastTimeMs: reactionTime,
          bestTimeMs: best,
          averageTimeMs: avg,
        }));

        triggerGameOver(finalScore, true, [
          { label: 'Best Reaction', value: `${best} ms`, isHighlight: true },
          { label: 'Average Reflex', value: `${avg} ms` },
          { label: 'Neural Rank', value: tier.badge },
          { label: 'False Starts', value: current.falseStarts },
        ]);
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'ROUND_RESULT',
          currentTrial: prev.currentTrial + 1,
          trials: updatedTrials,
          lastTimeMs: reactionTime,
          bestTimeMs: best,
          averageTimeMs: avg,
        }));
      }
    }
  };

  const renderContent = () => {
    switch (state.phase) {
      case 'WAITING':
        return (
          <Animated.View entering={ZoomIn.duration(300)} style={[styles.feedbackBox, styles.waitingBox]}>
            <Zap size={48} color={COLORS.amber} />
            <Text style={styles.waitingTitle}>WAIT FOR GREEN...</Text>
            <Text style={styles.subInstruction}>Do not tap yet!</Text>
          </Animated.View>
        );

      case 'REACT_NOW':
        return (
          <Animated.View entering={ZoomIn.duration(200).springify().damping(12)} style={[styles.feedbackBox, styles.reactBox]}>
            <Text style={styles.reactTitle}>TAP NOW!</Text>
          </Animated.View>
        );

      case 'TOO_EARLY':
        return (
          <Animated.View entering={BounceIn.duration(400)} style={[styles.feedbackBox, styles.errorBox]}>
            <AlertTriangle size={48} color={COLORS.rose} />
            <Text style={styles.errorTitle}>TOO EARLY!</Text>
            <Text style={styles.subInstruction}>Wait for the green signal.</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={startNextRound}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color="#0B0E14" />
              <Text style={styles.retryBtnText}>RETRY ROUND</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'ROUND_RESULT':
        const lastTier = getReflexTier(state.lastTimeMs || 300);
        return (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.feedbackBox, styles.resultBox]}>
            <CheckCircle2 size={44} color={lastTier.color} />
            <Text style={[styles.resultTime, { color: lastTier.color }]}>
              {state.lastTimeMs} ms
            </Text>
            <Text style={styles.tierTitle}>{lastTier.title}</Text>
            <TouchableOpacity
              style={styles.nextRoundBtn}
              onPress={startNextRound}
              activeOpacity={0.85}
            >
              <Text style={styles.nextRoundText}>
                NEXT TRIAL ({state.currentTrial}/{TOTAL_TRIALS})
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return (
          <Animated.View entering={FadeIn} style={styles.feedbackBox}>
            <Text style={styles.waitingTitle}>INITIALIZING...</Text>
          </Animated.View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.fullScreenTouch}
      activeOpacity={1}
      onPress={handleScreenTap}
    >
      {/* Round progress dots */}
      <View style={styles.roundTracker}>
        {Array.from({ length: TOTAL_TRIALS }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.roundDot,
              idx + 1 < state.currentTrial && styles.roundDotCompleted,
              idx + 1 === state.currentTrial && styles.roundDotActive,
            ]}
          />
        ))}
      </View>

      {renderContent()}

      <View style={styles.bottomInfo}>
        <Text style={styles.bottomInfoText}>
          Trial {Math.min(state.currentTrial, TOTAL_TRIALS)} of {TOTAL_TRIALS}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const SpeedReflexScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'reaction')!;

  const [state, setState] = useState<ReactionState>(createInitialReactionState());
  const timerRef = useRef<any>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const resetGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(createInitialReactionState());
  };

  const startNextRound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setState((prev) => ({
      ...prev,
      phase: 'WAITING',
    }));

    // Random delay between 1.5s and 4.0s
    const randomDelay = 1500 + Math.random() * 2500;

    timerRef.current = setTimeout(() => {
      audioService.play('pointScore');
      hapticsService.heavy();
      setState((prev) => ({
        ...prev,
        phase: 'REACT_NOW',
        startTime: Date.now(),
      }));
    }, randomDelay);
  };

  return (
    <GameContainer
      game={gameMetadata}
      score={calculateReflexScore(state.trials, state.falseStarts)}
      onResetGame={resetGame}
    >
      {({ gameState, triggerGameOver }) => (
        <SpeedReflexGameInner
          gameState={gameState}
          triggerGameOver={triggerGameOver}
          state={state}
          setState={setState}
          timerRef={timerRef}
          stateRef={stateRef}
          startNextRound={startNextRound}
        />
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  fullScreenTouch: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  roundTracker: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  roundDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  roundDotCompleted: {
    backgroundColor: COLORS.cyan,
  },
  roundDotActive: {
    backgroundColor: COLORS.amber,
    width: 20,
  },
  feedbackBox: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginVertical: 20,
    padding: 20,
  },
  waitingBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  waitingTitle: {
    color: COLORS.amber,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 16,
  },
  subInstruction: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  reactBox: {
    backgroundColor: COLORS.lime,
  },
  reactTitle: {
    color: '#0B0E14',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.rose,
  },
  errorTitle: {
    color: COLORS.rose,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.rose,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  retryBtnText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '900',
  },
  resultBox: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  resultTime: {
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 6,
  },
  tierTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextRoundBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
  },
  nextRoundText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bottomInfo: {
    marginBottom: 8,
  },
  bottomInfoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
