import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import {
  GridBubble,
  FlyingBubble,
  FallingBubble,
  PopParticle,
  BubbleColor,
} from '../types';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  BUBBLE_RADIUS,
  CANNON_Y,
  COLOR_MAP,
} from '../engine/bubbleEngine';
import { COLORS } from '../../../constants/theme';

interface BubbleBoardProps {
  grid: GridBubble[][];
  flyingBubble: FlyingBubble | null;
  fallingBubbles: FallingBubble[];
  particles: PopParticle[];
  ceilingRowOffset: number;
  aimAngle?: number | null;
}

const GridLayer = React.memo(({ grid }: { grid: GridBubble[][] }) => {
  return (
    <>
      {grid.map((row) =>
        row.map((bubble) => {
          if (!bubble.alive) return null;
          const bg = COLOR_MAP[bubble.color];
          const isSpecial =
            bubble.color === 'bomb' ||
            bubble.color === 'rainbow' ||
            bubble.color === 'lightning' ||
            bubble.color === 'metal';

          return (
            <View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  left: bubble.x - BUBBLE_RADIUS,
                  top: bubble.y - BUBBLE_RADIUS,
                  backgroundColor: bg,
                  borderColor: isSpecial ? '#FFFFFF' : `${bg}88`,
                },
              ]}
            >
              {bubble.color === 'bomb' && <Text style={styles.iconText}>💣</Text>}
              {bubble.color === 'rainbow' && <Text style={styles.iconText}>🌈</Text>}
              {bubble.color === 'lightning' && <Text style={styles.iconText}>⚡</Text>}
              {bubble.color === 'metal' && <Text style={styles.iconText}>🛡</Text>}
              {!isSpecial && <View style={styles.bubbleGloss} />}
            </View>
          );
        })
      )}
    </>
  );
});

export const BubbleBoard: React.FC<BubbleBoardProps> = ({
  grid,
  flyingBubble,
  fallingBubbles,
  particles,
  ceilingRowOffset,
  aimAngle,
}) => {
  // Trajectory Laser with Wall Bounce reflection
  const renderAimGuide = () => {
    if (aimAngle === undefined || aimAngle === null) return null;

    const startX = ARENA_WIDTH / 2;
    const startY = CANNON_Y;

    // Raycast reflection
    const dx = Math.cos(aimAngle);
    const dy = Math.sin(aimAngle);

    let x1 = startX;
    let y1 = startY;
    let x2 = startX;
    let y2 = startY;
    let bounceX2 = null;
    let bounceY2 = null;

    // Find intersection with side wall or top
    if (dx < 0) {
      // Hits left wall first?
      const tWall = (BUBBLE_RADIUS - startX) / dx;
      const yWall = startY + dy * tWall;
      if (yWall > ceilingRowOffset + BUBBLE_RADIUS) {
        x2 = BUBBLE_RADIUS;
        y2 = yWall;
        // Reflected ray
        const refDx = -dx;
        const refDy = dy;
        const tCeil = (ceilingRowOffset + BUBBLE_RADIUS - y2) / refDy;
        bounceX2 = x2 + refDx * tCeil;
        bounceY2 = ceilingRowOffset + BUBBLE_RADIUS;
      } else {
        x2 = startX + dx * ((ceilingRowOffset + BUBBLE_RADIUS - startY) / dy);
        y2 = ceilingRowOffset + BUBBLE_RADIUS;
      }
    } else {
      // Hits right wall first?
      const tWall = (ARENA_WIDTH - BUBBLE_RADIUS - startX) / dx;
      const yWall = startY + dy * tWall;
      if (yWall > ceilingRowOffset + BUBBLE_RADIUS) {
        x2 = ARENA_WIDTH - BUBBLE_RADIUS;
        y2 = yWall;
        // Reflected ray
        const refDx = -dx;
        const refDy = dy;
        const tCeil = (ceilingRowOffset + BUBBLE_RADIUS - y2) / refDy;
        bounceX2 = x2 + refDx * tCeil;
        bounceY2 = ceilingRowOffset + BUBBLE_RADIUS;
      } else {
        x2 = startX + dx * ((ceilingRowOffset + BUBBLE_RADIUS - startY) / dy);
        y2 = ceilingRowOffset + BUBBLE_RADIUS;
      }
    }

    return (
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={COLORS.cyan}
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity={0.8}
        />
        {bounceX2 !== null && bounceY2 !== null && (
          <Line
            x1={x2}
            y1={y2}
            x2={bounceX2}
            y2={bounceY2}
            stroke={COLORS.magenta}
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity={0.6}
          />
        )}
      </Svg>
    );
  };

  return (
    <View style={styles.board}>
      {/* Ceiling Bar */}
      <View style={[styles.ceilingBar, { top: ceilingRowOffset }]} />

      {/* Trajectory Guide */}
      {renderAimGuide()}

      {/* Memoized Grid Bubbles */}
      <GridLayer grid={grid} />

      {/* Flying Bubble */}
      {flyingBubble && (
        <View
          style={[
            styles.bubble,
            {
              left: flyingBubble.x - BUBBLE_RADIUS,
              top: flyingBubble.y - BUBBLE_RADIUS,
              backgroundColor: COLOR_MAP[flyingBubble.color],
              borderColor: '#FFFFFF',
              zIndex: 20,
            },
          ]}
        >
          <View style={styles.bubbleGloss} />
        </View>
      )}

      {/* Falling Avalanche Bubbles */}
      {fallingBubbles.map((fb) => (
        <View
          key={fb.id}
          style={[
            styles.bubble,
            {
              left: fb.x - BUBBLE_RADIUS,
              top: fb.y - BUBBLE_RADIUS,
              backgroundColor: COLOR_MAP[fb.color],
              opacity: 0.85,
              zIndex: 15,
            },
          ]}
        >
          <View style={styles.bubbleGloss} />
        </View>
      ))}

      {/* Pop Particles */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.x - p.radius,
              top: p.y - p.radius,
              width: p.radius * 2,
              height: p.radius * 2,
              backgroundColor: p.color,
              opacity: p.alpha,
            },
          ]}
        />
      ))}

      {/* Deadline warning line */}
      <View style={[styles.deadline, { top: CANNON_Y - 45 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    backgroundColor: '#090E17',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ceilingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    zIndex: 10,
  },
  deadline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderStyle: 'dashed',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_RADIUS * 2,
    height: BUBBLE_RADIUS * 2,
    borderRadius: BUBBLE_RADIUS,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bubbleGloss: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.55,
  },
  iconText: {
    fontSize: 14,
  },
  particle: {
    position: 'absolute',
    borderRadius: 99,
  },
});
