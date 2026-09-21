import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Grid, Sparkles } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { BubbleState } from './types';
import {
  createInitialBubbleState,
  launchBubble,
  swapBubbles,
  updateBubbleGame,
  CANNON_X,
  CANNON_Y,
  ARENA_WIDTH,
  ARENA_HEIGHT,
} from './engine/bubbleEngine';
import { getBubbleLevel, TOTAL_BUBBLE_LEVELS } from './engine/levels';
import { BubbleBoard } from './components/BubbleBoard';
import { BubbleCannon } from './components/BubbleCannon';
import { LevelProgressionModal } from '../../components/shared/LevelProgressionModal';
import { LevelSelectModal } from '../../components/shared/LevelSelectModal';
import { COLORS } from '../../constants/theme';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';
import { progressionService } from '../../services/progressionService';

interface InnerProps {
  gameState: string;
  triggerGameOver: (finalScore: number, won?: boolean, contextualStats?: any[]) => void;
  triggerShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  state: BubbleState;
  setState: React.Dispatch<React.SetStateAction<BubbleState>>;
  stateRef: React.MutableRefObject<BubbleState>;
  onLevelCompleted: () => void;
}

const BubbleGameInner: React.FC<InnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  stateRef,
  onLevelCompleted,
}) => {
  const [aimAngle, setAimAngle] = useState<number | null>(-Math.PI / 2);
  const animationFrameRef = useRef<number | null>(null);
  const lastAimAngleRef = useRef<number>(-Math.PI / 2);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = () => {
      const current = stateRef.current;
      const isSimulating = Boolean(
        current.flyingBubble !== null ||
        current.fallingBubbles.length > 0 ||
        current.particles.length > 0
      );

      if (!isSimulating) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const { nextState, popped, bounced, levelFinished } = updateBubbleGame(current);

      if (popped) {
        audioService.play('pointScore');
        hapticsService.light();
      }

      if (bounced) {
        hapticsService.light();
      }

      if (levelFinished) {
        setState(nextState);
        onLevelCompleted();
        return;
      }

      if (nextState.isGameOver) {
        setState(nextState);
        audioService.play('gameOver');
        hapticsService.heavy();
        triggerGameOver(nextState.score, false, [
          { label: 'Level Reached', value: nextState.currentLevel, isHighlight: true },
          { label: 'Bubbles Cleared', value: nextState.bubblesPoppedTotal },
          { label: 'Shots Left', value: nextState.shotsLeft },
        ]);
        return;
      }

      setState(nextState);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, triggerGameOver, triggerShake, onLevelCompleted, setState, stateRef]);

  // Touch drag aiming & release to fire
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      const angle = Math.atan2(e.y - CANNON_Y, e.x - CANNON_X);
      // Clamp to upward hemisphere
      if (angle < -0.15 && angle > -Math.PI + 0.15) {
        if (Math.abs(angle - lastAimAngleRef.current) > 0.02) {
          lastAimAngleRef.current = angle;
          setAimAngle(angle);
        }
      }
    })
    .onEnd((e) => {
      const angle = Math.atan2(e.y - CANNON_Y, e.x - CANNON_X);
      if (angle < -0.15 && angle > -Math.PI + 0.15) {
        audioService.play('buttonPress');
        hapticsService.medium();
        setState((prev) => launchBubble(prev, angle));
      }
    });

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      const angle = Math.atan2(e.y - CANNON_Y, e.x - CANNON_X);
      if (angle < -0.15 && angle > -Math.PI + 0.15) {
        audioService.play('buttonPress');
        hapticsService.medium();
        setState((prev) => launchBubble(prev, angle));
      }
    });

  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  return (
    <View style={styles.innerRoot}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.boardWrapper}>
          <BubbleBoard
            grid={state.grid}
            flyingBubble={state.flyingBubble}
            fallingBubbles={state.fallingBubbles}
            particles={state.particles}
            ceilingRowOffset={state.ceilingRowOffset}
            aimAngle={aimAngle}
          />
        </View>
      </GestureDetector>

      {/* Cannon Controls */}
      <BubbleCannon
        currentBubble={state.currentBubble}
        nextBubble={state.nextBubble}
        shotsLeft={state.shotsLeft}
        aimAngle={aimAngle}
        onSwap={() => {
          hapticsService.light();
          setState((prev) => swapBubbles(prev));
        }}
      />
    </View>
  );
};

export const BubbleScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'bubble') || {
    id: 'bubble',
    title: 'Bubble Shooter Arcade',
    tagline: 'Hex-grid tactical bubble popping frenzy',
    description: 'Aim and burst clusters of 3+ bubbles across 30 progressive challenge stages.',
    category: 'puzzle' as const,
    difficulty: 'Medium' as const,
    iconName: 'Orbit',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.magenta,
    baseXp: 150,
    howToPlay: [
      'Touch and drag to aim the bubble cannon.',
      'Bounce bubbles off the side walls for tricky angles.',
      'Match 3 or more bubbles of the same color to burst them.',
      'Drop detached ceiling anchors for massive avalanche bonus scores!'
    ],
    controlsDescription: 'Touch & drag to aim, release to shoot',
  };

  const [currentLevelNum, setCurrentLevelNum] = useState(1);
  const [state, setState] = useState<BubbleState>(() => createInitialBubbleState(1));
  const stateRef = useRef(state);
  stateRef.current = state;

  // Campaign State
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [levelScores, setLevelScores] = useState<Record<number, number>>({});

  // Modals
  const [progressionModalVisible, setProgressionModalVisible] = useState(false);
  const [levelSelectVisible, setLevelSelectVisible] = useState(false);
  const [starsEarnedThisLevel, setStarsEarnedThisLevel] = useState(3);

  useEffect(() => {
    progressionService.getCampaignProgress('bubble').then((res) => {
      setMaxUnlocked(res.maxUnlockedLevel);
      setLevelStars(res.stars);
      setLevelScores(res.levelScores);
    });
  }, []);

  const resetGame = () => {
    setState(createInitialBubbleState(currentLevelNum));
    setProgressionModalVisible(false);
  };

  const handleLevelCompleted = useCallback(async () => {
    const cur = stateRef.current;
    const earnedStars = cur.shotsLeft >= 10 ? 3 : cur.shotsLeft >= 4 ? 2 : 1;
    setStarsEarnedThisLevel(earnedStars);

    const updated = await progressionService.saveCampaignLevelResult(
      'bubble',
      cur.currentLevel,
      earnedStars,
      cur.score
    );

    setMaxUnlocked(updated.maxUnlockedLevel);
    setLevelStars(updated.stars);
    setLevelScores(updated.levelScores);

    setProgressionModalVisible(true);
  }, []);

  const handleNextLevel = () => {
    const next = currentLevelNum + 1;
    setCurrentLevelNum(next);
    setState(createInitialBubbleState(next));
    setProgressionModalVisible(false);
  };

  const handleSelectLevel = (lvl: number) => {
    setCurrentLevelNum(lvl);
    setState(createInitialBubbleState(lvl));
    setProgressionModalVisible(false);
  };

  const currentLevelData = getBubbleLevel(currentLevelNum);

  return (
    <GameContainer
      game={gameMetadata as any}
      score={state.score}
      onResetGame={resetGame}
      settingsUI={
        <View style={styles.settingsBox}>
          <TouchableOpacity
            style={styles.levelSelectTrigger}
            onPress={() => setLevelSelectVisible(true)}
          >
            <Grid size={16} color={COLORS.cyan} />
            <Text style={styles.levelSelectTriggerText}>
              CAMPAIGN MAP ({maxUnlocked}/30 UNLOCKED)
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      {({ gameState, triggerGameOver, triggerShake }) => (
        <View style={styles.screenRoot}>
          {/* Level Header Info */}
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.stageKicker}>STAGE {currentLevelNum} OF 30</Text>
              <Text style={styles.levelTitleText}>{currentLevelData.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={() => setLevelSelectVisible(true)}
            >
              <Grid size={16} color={COLORS.cyan} />
              <Text style={styles.mapIconText}>MAP</Text>
            </TouchableOpacity>
          </View>

          <BubbleGameInner
            gameState={gameState}
            triggerGameOver={triggerGameOver}
            triggerShake={triggerShake}
            state={state}
            setState={setState}
            stateRef={stateRef}
            onLevelCompleted={handleLevelCompleted}
          />

          {/* Level Completion Progression Modal */}
          <LevelProgressionModal
            visible={progressionModalVisible}
            currentLevel={currentLevelNum}
            nextLevel={currentLevelNum + 1}
            totalLevels={TOTAL_BUBBLE_LEVELS}
            score={state.score}
            starsEarned={starsEarnedThisLevel}
            xpEarned={90 + currentLevelNum * 12}
            nextLevelPreview={
              currentLevelNum < TOTAL_BUBBLE_LEVELS
                ? getBubbleLevel(currentLevelNum + 1).preview
                : undefined
            }
            stats={[
              { label: 'Stage Cleared', value: currentLevelData.name },
              { label: 'Ammo Remaining', value: `${state.shotsLeft} Shots` },
              { label: 'Total Popped', value: state.bubblesPoppedTotal },
            ]}
            onNextLevel={handleNextLevel}
            onReplayLevel={resetGame}
            onOpenLevelSelect={() => {
              setProgressionModalVisible(false);
              setLevelSelectVisible(true);
            }}
          />

          {/* Level Select Modal */}
          <LevelSelectModal
            visible={levelSelectVisible}
            gameTitle="Bubble Shooter Arcade"
            totalLevels={TOTAL_BUBBLE_LEVELS}
            maxUnlockedLevel={maxUnlocked}
            currentLevel={currentLevelNum}
            levelStars={levelStars}
            levelHighScores={levelScores}
            onSelectLevel={handleSelectLevel}
            onClose={() => setLevelSelectVisible(false)}
          />
        </View>
      )}
    </GameContainer>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 2,
  },
  stageKicker: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  levelTitleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  mapIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
  mapIconText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '900',
  },
  innerRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBox: {
    paddingVertical: 8,
  },
  levelSelectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  levelSelectTriggerText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '800',
  },
});
