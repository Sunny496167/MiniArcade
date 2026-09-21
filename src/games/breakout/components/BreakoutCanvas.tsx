import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ball, Paddle, Brick, PowerUp, Laser } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_Y } from '../engine/breakoutEngine';
import { COLORS } from '../../../constants/theme';

interface BreakoutCanvasProps {
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  lasers?: Laser[];
  paddleLaserActive?: boolean;
  paddleHitCount?: number;
  hasSafetyShield?: boolean;
}

export const BreakoutCanvas: React.FC<BreakoutCanvasProps> = ({
  paddle,
  balls,
  bricks,
  powerUps,
  lasers = [],
  paddleLaserActive = false,
  paddleHitCount = 0,
  hasSafetyShield = false,
}) => {
  const paddleShakeX = useSharedValue(0);

  useEffect(() => {
    if (paddleHitCount === 0) return;
    paddleShakeX.value = withSequence(
      withTiming(-6, { duration: 35 }),
      withTiming(6, { duration: 35 }),
      withTiming(-4, { duration: 30 }),
      withTiming(4, { duration: 30 }),
      withTiming(0, { duration: 25 })
    );
  }, [paddleHitCount]);

  const paddleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: paddleShakeX.value }],
  }));

  const getPowerUpLabel = (type: string) => {
    switch (type) {
      case 'fireball': return '🔥';
      case 'megaBall': return '⚡';
      case 'laser': return '✦';
      case 'sticky': return 'S';
      case 'multiBall': return '3x';
      case 'widePaddle': return 'W';
      case 'shield': return '🛡';
      case 'slowMo': return '⏱';
      default: return '★';
    }
  };

  return (
    <View style={styles.canvas}>
      {/* Safety Floor Shield Barrier */}
      {hasSafetyShield && (
        <View style={styles.safetyShieldFloor} />
      )}

      {/* Bricks */}
      {bricks.map((brick) => {
        if (!brick.alive) return null;
        return (
          <View
            key={brick.id}
            style={[
              styles.brick,
              {
                left: brick.x,
                top: brick.y,
                width: brick.width,
                height: brick.height,
                backgroundColor: brick.type === 4 ? 'transparent' : brick.color,
                borderColor: brick.color,
                borderWidth: brick.type === 4 ? 2 : 0,
                shadowColor: brick.color,
                opacity: Math.max(0.4, brick.hp / 3),
              },
            ]}
          >
            {brick.type === 5 && (
              <View style={styles.explosiveCore} />
            )}
          </View>
        );
      })}

      {/* Falling Power-Ups */}
      {powerUps.map((pow) => (
        <View
          key={pow.id}
          style={[
            styles.powerUp,
            {
              left: pow.x - 9,
              top: pow.y - 9,
              backgroundColor: pow.color,
              shadowColor: pow.color,
            },
          ]}
        >
          <View style={styles.powerUpInner}>
            <View style={styles.powerUpGlowDot} />
          </View>
        </View>
      ))}

      {/* Paddle */}
      <Animated.View
        style={[
          styles.paddle,
          {
            left: paddle.x,
            top: PADDLE_Y,
            width: paddle.width,
            height: paddle.height,
          },
          paddleAnimStyle,
        ]}
      >
        {paddleLaserActive && (
          <>
            <View style={[styles.paddleLaserTip, { left: 4 }]} />
            <View style={[styles.paddleLaserTip, { right: 4 }]} />
          </>
        )}
      </Animated.View>

      {/* Lasers */}
      {lasers.map((laser, idx) => (
        <View
          key={`laser-${idx}`}
          style={[
            styles.laser,
            { left: laser.x - 2, top: laser.y, width: 4, height: 12 }
          ]}
        />
      ))}

      {/* Balls */}
      {balls.map((ball, idx) => {
        const isFire = ball.isFireball;
        const isMega = ball.isMegaBall;
        return (
          <View
            key={`ball-${idx}`}
            style={[
              styles.ball,
              {
                left: ball.x - ball.radius,
                top: ball.y - ball.radius,
                width: ball.radius * 2,
                height: ball.radius * 2,
                borderRadius: ball.radius,
                backgroundColor: isFire ? '#FF4500' : isMega ? '#D8B4FE' : '#FFFFFF',
                shadowColor: isFire ? '#F97316' : isMega ? '#A855F7' : '#00F0FF',
                shadowRadius: isFire ? 14 : isMega ? 16 : 8,
              },
            ]}
          >
            {isFire && <View style={styles.fireballCore} />}
            {isMega && <View style={styles.megaBallRing} />}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#070C16',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 122, 0.4)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: COLORS.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  brick: {
    position: 'absolute',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  paddle: {
    position: 'absolute',
    backgroundColor: '#00F0FF',
    borderRadius: 6,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  powerUp: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  explosiveCore: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  laser: {
    position: 'absolute',
    backgroundColor: '#FF0055',
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  paddleLaserTip: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 8,
    backgroundColor: '#FF0055',
    borderRadius: 2,
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  safetyShieldFloor: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#06B6D4',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  powerUpInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUpGlowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  fireballCore: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 8,
    backgroundColor: '#FEF08A',
    alignSelf: 'center',
    top: '20%',
  },
  megaBallRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    opacity: 0.6,
  },
});
