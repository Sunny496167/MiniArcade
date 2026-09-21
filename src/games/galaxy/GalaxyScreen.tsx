import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Grid, Sparkles, Rocket } from 'lucide-react-native';
import { GameContainer } from '../../components/shared/GameContainer';
import { GAMES_REGISTRY } from '../../constants/gamesRegistry';
import { GalaxyState } from './types';
import {
  createInitialGalaxyState,
  triggerSmartBomb,
  updateGalaxy,
  GALAXY_WIDTH,
  GALAXY_HEIGHT,
  SHIP_WIDTH,
  SHIP_HEIGHT,
} from './engine/galaxyEngine';
import { getGalaxyLevel, TOTAL_GALAXY_LEVELS } from './engine/levels';
import { GalaxyArena } from './components/GalaxyArena';
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
  state: GalaxyState;
  setState: React.Dispatch<React.SetStateAction<GalaxyState>>;
  stateRef: React.MutableRefObject<GalaxyState>;
  onLevelCompleted: () => void;
}

const GalaxyGameInner: React.FC<InnerProps> = ({
  gameState,
  triggerGameOver,
  triggerShake,
  state,
  setState,
  stateRef,
  onLevelCompleted,
}) => {
  const animationFrameRef = useRef<number | null>(null);
  const targetShipPos = useRef<{ x: number; y: number }>({
    x: GALAXY_WIDTH / 2,
    y: GALAXY_HEIGHT - 65,
  });

  useEffect(() => {
    targetShipPos.current = { x: state.playerX, y: state.playerY };
  }, [state.currentLevel]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const loop = () => {
      const current = stateRef.current;
      const now = Date.now();
      const currentWithShipPos = {
        ...current,
        playerX: targetShipPos.current.x,
        playerY: targetShipPos.current.y,
      };
      const { nextState, playerHit, enemyDestroyed, levelFinished } = updateGalaxy(currentWithShipPos, now);

      if (playerHit) {
        audioService.play('gameOver');
        hapticsService.heavy();
        triggerShake('heavy');
      }

      if (enemyDestroyed) {
        audioService.play('pointScore');
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
          { label: 'Sector Reached', value: nextState.currentLevel, isHighlight: true },
          { label: 'Enemies Destroyed', value: nextState.enemiesDefeated },
          { label: 'Final Score', value: nextState.score },
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

  // 1:1 Smooth Ship Drag Movement
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      const clampedX = Math.max(SHIP_WIDTH / 2, Math.min(GALAXY_WIDTH - SHIP_WIDTH / 2, e.x));
      const clampedY = Math.max(SHIP_HEIGHT / 2, Math.min(GALAXY_HEIGHT - SHIP_HEIGHT / 2, e.y));
      targetShipPos.current = { x: clampedX, y: clampedY };
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <GalaxyArena
          playerX={state.playerX}
          playerY={state.playerY}
          playerHp={state.playerHp}
          shieldHp={state.shieldHp}
          bombs={state.bombs}
          weaponLevel={state.weaponLevel}
          laserActive={state.laserActive}
          bullets={state.bullets}
          enemyBullets={state.enemyBullets}
          enemies={state.enemies}
          powerUps={state.powerUps}
          particles={state.particles}
          onTriggerBomb={() => {
            hapticsService.heavy();
            audioService.play('win');
            triggerShake('medium');
            setState((prev) => triggerSmartBomb(prev));
          }}
        />
      </View>
    </GestureDetector>
  );
};

export const GalaxyScreen: React.FC = () => {
  const gameMetadata = GAMES_REGISTRY.find((g) => g.id === 'galaxy') || {
    id: 'galaxy',
    title: 'Galaxy Sky Shooting',
    tagline: 'Retro space shooter and bullet-hell warfare',
    description: 'Pilot your neon starship through 30 hostile galaxy sectors with 6 dreadnought bosses.',
    category: 'arcade' as const,
    difficulty: 'Hard' as const,
    iconName: 'Rocket',
    accentColor: COLORS.cyan,
    secondaryColor: COLORS.rose,
    baseXp: 180,
    howToPlay: [
      'Touch and drag anywhere to maneuver your starship.',
      'Auto-fire blasters engage automatically when targets approach.',
      'Collect glowing power-ups: Spread (P), Shield (S), Bomb (B), Laser (L).',
      'Deploy Smart Bombs to vaporize enemy bullet hell barrages!'
    ],
    controlsDescription: '1:1 finger drag to steer, tap bomb to detonate',
  };

  const [currentLevelNum, setCurrentLevelNum] = useState(1);
  const [state, setState] = useState<GalaxyState>(() => createInitialGalaxyState(1));
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
    progressionService.getCampaignProgress('galaxy').then((res) => {
      setMaxUnlocked(res.maxUnlockedLevel);
      setLevelStars(res.stars);
      setLevelScores(res.levelScores);
    });
  }, []);

  const resetGame = () => {
    setState(createInitialGalaxyState(currentLevelNum));
    setProgressionModalVisible(false);
  };

  const handleLevelCompleted = useCallback(async () => {
    const cur = stateRef.current;
    const earnedStars = cur.playerHp >= 3 ? 3 : cur.playerHp >= 2 ? 2 : 1;
    setStarsEarnedThisLevel(earnedStars);

    const updated = await progressionService.saveCampaignLevelResult(
      'galaxy',
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
    setState(createInitialGalaxyState(next));
    setProgressionModalVisible(false);
  };

  const handleSelectLevel = (lvl: number) => {
    setCurrentLevelNum(lvl);
    setState(createInitialGalaxyState(lvl));
    setProgressionModalVisible(false);
  };

  const currentLevelData = getGalaxyLevel(currentLevelNum);

  return (
    <GameContainer
      game={gameMetadata as any}
      score={state.score}
      lives={state.playerHp}
      onResetGame={resetGame}
      settingsUI={
        <View style={styles.settingsBox}>
          <TouchableOpacity
            style={styles.levelSelectTrigger}
            onPress={() => setLevelSelectVisible(true)}
          >
            <Grid size={16} color={COLORS.cyan} />
            <Text style={styles.levelSelectTriggerText}>
              GALAXY SECTOR MAP ({maxUnlocked}/30 UNLOCKED)
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
              <Text style={styles.sectorKicker}>
                {currentLevelData.sector.toUpperCase()}
              </Text>
              <Text style={styles.levelTitleText}>
                LVL {currentLevelNum}: {currentLevelData.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={() => setLevelSelectVisible(true)}
            >
              <Grid size={16} color={COLORS.cyan} />
              <Text style={styles.mapIconText}>MAP</Text>
            </TouchableOpacity>
          </View>

          <GalaxyGameInner
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
            totalLevels={TOTAL_GALAXY_LEVELS}
            score={state.score}
            starsEarned={starsEarnedThisLevel}
            xpEarned={120 + currentLevelNum * 15}
            nextLevelPreview={
              currentLevelNum < TOTAL_GALAXY_LEVELS
                ? getGalaxyLevel(currentLevelNum + 1).preview
                : undefined
            }
            stats={[
              { label: 'Sector Cleared', value: currentLevelData.name },
              { label: 'Enemies Vaporized', value: state.enemiesDefeated },
              { label: 'Hull Integrity', value: `${state.playerHp} / 3 HP` },
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
            gameTitle="Galaxy Sky Shooting"
            totalLevels={TOTAL_GALAXY_LEVELS}
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
  sectorKicker: {
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
  container: {
    flex: 1,
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
