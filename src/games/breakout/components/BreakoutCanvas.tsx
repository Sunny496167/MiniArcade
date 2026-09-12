import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ball, Paddle, Brick, PowerUp } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_Y } from '../engine/breakoutEngine';
import { COLORS } from '../../../constants/theme';

interface BreakoutCanvasProps {
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
}

export const BreakoutCanvas: React.FC<BreakoutCanvasProps> = ({
  paddle,
  balls,
  bricks,
  powerUps,
}) => {
  return (
    <View style={styles.canvas}>
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
                backgroundColor: brick.color,
                shadowColor: brick.color,
              },
            ]}
          />
        );
      })}

      {/* Falling Power-Ups */}
      {powerUps.map((pow) => (
        <View
          key={pow.id}
          style={[
            styles.powerUp,
            {
              left: pow.x - 7,
              top: pow.y - 7,
              backgroundColor: pow.color,
              shadowColor: pow.color,
            },
          ]}
        />
      ))}

      {/* Paddle */}
      <View
        style={[
          styles.paddle,
          {
            left: paddle.x,
            top: PADDLE_Y,
            width: paddle.width,
            height: paddle.height,
          },
        ]}
      />

      {/* Balls */}
      {balls.map((ball, idx) => (
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
            },
          ]}
        />
      ))}
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
});
