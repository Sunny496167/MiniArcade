import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import {
  PacmanState,
  Ghost,
  Direction,
  PacmanMazeTheme,
} from '../types';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  ARENA_WIDTH,
  ARENA_HEIGHT,
  MAZE_TEMPLATE,
} from '../engine/pacmanEngine';

interface PacmanBoardProps {
  state: PacmanState;
  theme: PacmanMazeTheme;
}

export const PacmanBoard: React.FC<PacmanBoardProps> = React.memo(({ state, theme }) => {
  const {
    pacmanX,
    pacmanY,
    pacmanDir,
    mouthAngle,
    ghosts,
    dotsGrid,
    energizersGrid,
    frightenedTimeRemaining,
    fruitActive,
    fruitX,
    fruitY,
    fruitType,
    scorePopups,
    isDying,
  } = state;

  // Render Maze Walls & Door
  const renderWalls = () => {
    const wallElements: React.ReactNode[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const char = MAZE_TEMPLATE[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (char === '#') {
          wallElements.push(
            <Rect
              key={`w_${r}_${c}`}
              x={x + 1}
              y={y + 1}
              width={TILE_SIZE - 2}
              height={TILE_SIZE - 2}
              rx={3}
              fill={theme.wallColor}
              stroke={theme.wallGlow}
              strokeWidth={1}
            />
          );
        } else if (char === '-') {
          // Ghost House Door
          wallElements.push(
            <Rect
              key={`d_${r}_${c}`}
              x={x}
              y={y + TILE_SIZE / 2 - 2}
              width={TILE_SIZE}
              height={4}
              fill={theme.gateColor}
              rx={2}
            />
          );
        } else if (char === '=') {
          // Teleportation Warp Portals
          if (r === 0 || r === 20) {
            // Vertical Warp Portals (Top & Bottom edges)
            wallElements.push(
              <G key={`warp_${r}_${c}`}>
                <Rect
                  x={x + 1}
                  y={y + 1}
                  width={TILE_SIZE - 2}
                  height={TILE_SIZE - 2}
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  strokeDasharray="3,2"
                  rx={3}
                />
                <Circle
                  cx={x + TILE_SIZE / 2}
                  cy={y + TILE_SIZE / 2}
                  r={3}
                  fill="#38BDF8"
                  opacity={0.8}
                />
              </G>
            );
          } else {
            // Horizontal Warp Corridor (Row 10 left & right edges)
            wallElements.push(
              <Rect
                key={`warp_${r}_${c}`}
                x={x}
                y={y + TILE_SIZE / 2 - 1}
                width={TILE_SIZE}
                height={2}
                fill="#38BDF8"
                opacity={0.35}
              />
            );
          }
        }
      }
    }
    return wallElements;
  };

  // Render Dots & Energizers
  const renderDots = () => {
    const elements: React.ReactNode[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cx = c * TILE_SIZE + TILE_SIZE / 2;
        const cy = r * TILE_SIZE + TILE_SIZE / 2;

        if (dotsGrid[r]?.[c]) {
          elements.push(
            <Circle
              key={`dot_${r}_${c}`}
              cx={cx}
              cy={cy}
              r={2.5}
              fill={theme.dotColor}
            />
          );
        } else if (energizersGrid[r]?.[c]) {
          // Glowing Energizer Power Pellet
          elements.push(
            <G key={`eng_${r}_${c}`}>
              <Circle
                cx={cx}
                cy={cy}
                r={6}
                fill={theme.energizerColor}
                opacity={0.35}
              />
              <Circle
                cx={cx}
                cy={cy}
                r={4}
                fill={theme.energizerColor}
              />
            </G>
          );
        }
      }
    }
    return elements;
  };

  // Render Pac-Man Sprite with Mouth Chomping Wedge
  const renderPacman = () => {
    if (isDying) {
      // Spinning / shrinking death
      return (
        <Circle
          cx={pacmanX * TILE_SIZE + TILE_SIZE / 2}
          cy={pacmanY * TILE_SIZE + TILE_SIZE / 2}
          r={TILE_SIZE / 2 - 2}
          fill="#FACC15"
          opacity={0.5}
        />
      );
    }

    const cx = pacmanX * TILE_SIZE + TILE_SIZE / 2;
    const cy = pacmanY * TILE_SIZE + TILE_SIZE / 2;
    const r = TILE_SIZE / 2 - 1.5;

    // Rotation angle based on direction
    let rot = 0;
    if (pacmanDir === 'UP') rot = -90;
    else if (pacmanDir === 'DOWN') rot = 90;
    else if (pacmanDir === 'LEFT') rot = 180;
    else if (pacmanDir === 'RIGHT') rot = 0;

    // Mouth angle in radians
    const angleRad = (mouthAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(-angleRad);
    const y1 = cy + r * Math.sin(-angleRad);
    const x2 = cx + r * Math.cos(angleRad);
    const y2 = cy + r * Math.sin(angleRad);

    const pathData =
      mouthAngle < 2
        ? `M ${cx} ${cy} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2} Z`;

    return (
      <G transform={`rotate(${rot}, ${cx}, ${cy})`}>
        <Path d={pathData} fill="#FACC15" />
      </G>
    );
  };

  // Render Ghost Sprite
  const renderGhost = (ghost: Ghost) => {
    const gx = ghost.x * TILE_SIZE;
    const gy = ghost.y * TILE_SIZE;
    const w = TILE_SIZE;
    const h = TILE_SIZE;

    // Frightened flashing warning in last 2.5 seconds
    const isFlashing = frightenedTimeRemaining > 0 && frightenedTimeRemaining < 2500 && Math.floor(frightenedTimeRemaining / 200) % 2 === 0;

    let bodyColor = ghost.color;
    if (ghost.mode === 'frightened') {
      bodyColor = isFlashing ? '#FFFFFF' : '#1D4ED8';
    }

    // Pupils offset based on direction
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (ghost.dir === 'LEFT') eyeOffsetX = -1.5;
    else if (ghost.dir === 'RIGHT') eyeOffsetX = 1.5;
    else if (ghost.dir === 'UP') eyeOffsetY = -1.5;
    else if (ghost.dir === 'DOWN') eyeOffsetY = 1.5;

    if (ghost.mode === 'eaten') {
      // Just floating eyes
      return (
        <G key={ghost.name}>
          <Circle cx={gx + 5} cy={gy + 8} r={3} fill="#FFFFFF" />
          <Circle cx={gx + 13} cy={gy + 8} r={3} fill="#FFFFFF" />
          <Circle cx={gx + 5 + eyeOffsetX} cy={gy + 8 + eyeOffsetY} r={1.5} fill="#1E3A8A" />
          <Circle cx={gx + 13 + eyeOffsetX} cy={gy + 8 + eyeOffsetY} r={1.5} fill="#1E3A8A" />
        </G>
      );
    }

    // Classic arched dome with wavy skirt bottom
    const skirtPath = `
      M ${gx + 2} ${gy + 15}
      L ${gx + 2} ${gy + 8}
      A ${w / 2 - 2} ${h / 2 - 2} 0 0 1 ${gx + w - 2} ${gy + 8}
      L ${gx + w - 2} ${gy + 15}
      Q ${gx + 13} ${gy + 13}, ${gx + 11} ${gy + 15}
      Q ${gx + 9} ${gy + 17}, ${gx + 7} ${gy + 15}
      Q ${gx + 4} ${gy + 13}, ${gx + 2} ${gy + 15}
      Z
    `;

    return (
      <G key={ghost.name}>
        {/* Ghost Body */}
        <Path d={skirtPath} fill={bodyColor} />

        {/* Eyes */}
        {ghost.mode === 'frightened' ? (
          // Frightened face (small eyes + wavy mouth)
          <>
            <Circle cx={gx + 5.5} cy={gy + 7} r={1.2} fill={isFlashing ? '#EF4444' : '#FDE047'} />
            <Circle cx={gx + 12.5} cy={gy + 7} r={1.2} fill={isFlashing ? '#EF4444' : '#FDE047'} />
            <Path
              d={`M ${gx + 4} ${gy + 11} Q ${gx + 6} ${gy + 9.5}, ${gx + 9} ${gy + 11} Q ${gx + 12} ${gy + 12.5}, ${gx + 14} ${gy + 11}`}
              stroke={isFlashing ? '#EF4444' : '#FDE047'}
              strokeWidth={1}
              fill="none"
            />
          </>
        ) : (
          // Normal Eyes
          <>
            <Circle cx={gx + 5.5} cy={gy + 7} r={2.5} fill="#FFFFFF" />
            <Circle cx={gx + 12.5} cy={gy + 7} r={2.5} fill="#FFFFFF" />
            <Circle cx={gx + 5.5 + eyeOffsetX} cy={gy + 7 + eyeOffsetY} r={1.2} fill="#1E3A8A" />
            <Circle cx={gx + 12.5 + eyeOffsetX} cy={gy + 7 + eyeOffsetY} r={1.2} fill="#1E3A8A" />
          </>
        )}
      </G>
    );
  };

  return (
    <View style={[styles.boardContainer, { backgroundColor: theme.bg }]}>
      <Svg width={ARENA_WIDTH} height={ARENA_HEIGHT}>
        {/* Walls */}
        {renderWalls()}

        {/* Dots & Energizers */}
        {renderDots()}

        {/* Fruit Bonus */}
        {fruitActive && (
          <G>
            <Circle
              cx={fruitX * TILE_SIZE + TILE_SIZE / 2}
              cy={fruitY * TILE_SIZE + TILE_SIZE / 2}
              r={6}
              fill="#EF4444"
            />
            <Circle
              cx={fruitX * TILE_SIZE + TILE_SIZE / 2 + 2}
              cy={fruitY * TILE_SIZE + TILE_SIZE / 2 - 2}
              r={1.5}
              fill="#FFFFFF"
            />
          </G>
        )}

        {/* Pac-Man */}
        {renderPacman()}

        {/* Ghosts */}
        {ghosts.map(renderGhost)}
      </Svg>

      {/* Floating Score Popups (+200, +400, etc.) */}
      {scorePopups.map((p) => (
        <View
          key={p.id}
          style={[styles.popupBadge, { left: p.x - 10, top: p.y - 12 }]}
        >
          <Text style={styles.popupText}>{p.text}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  boardContainer: {
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    alignSelf: 'center',
  },
  popupBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  popupText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '900',
  },
});
