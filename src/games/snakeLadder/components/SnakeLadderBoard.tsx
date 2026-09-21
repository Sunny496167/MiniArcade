import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../../../constants/theme';
import { BoardLevel, SnakeLadderPlayer } from '../types';
import { audioService } from '../../../services/audioService';
import { hapticsService } from '../../../services/hapticsService';

interface Props {
  level: BoardLevel;
  players: SnakeLadderPlayer[];
  boardSize?: number;
  highlightElements?: boolean;
}

function playStepSound() {
  audioService.play('pointScore');
  hapticsService.light();
}

function AnimatedToken({
  player,
  getCoordinates,
  cellSize,
}: {
  player: SnakeLadderPlayer;
  getCoordinates: (c: number) => { x: number; y: number };
  cellSize: number;
}) {
  const posX = useSharedValue(getCoordinates(Math.max(1, player.position)).x);
  const posY = useSharedValue(getCoordinates(Math.max(1, player.position)).y);
  const hopY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (player.path && player.path.length > 0) {
      const animateStep = (index: number) => {
        if (index >= player.path!.length) return;
        const coord = getCoordinates(player.path![index]);
        const isSlideOrClimb = index === player.path!.length - 1 && player.path!.length > 1;
        const duration = isSlideOrClimb ? 450 : 180;
        const hopHeight = isSlideOrClimb ? 0 : cellSize * 0.45;

        runOnJS(playStepSound)();

        posX.value = withTiming(coord.x, { duration });
        posY.value = withTiming(coord.y, { duration }, (finished) => {
          if (finished && index + 1 < player.path!.length) {
            runOnJS(animateStep)(index + 1);
          }
        });

        if (hopHeight > 0) {
          hopY.value = withSequence(
            withTiming(-hopHeight, { duration: duration * 0.45 }),
            withTiming(0, { duration: duration * 0.55 })
          );
          scale.value = withSequence(
            withTiming(1.3, { duration: duration * 0.45 }),
            withTiming(1.0, { duration: duration * 0.55 })
          );
        }
      };
      animateStep(0);
    } else {
      const coord = getCoordinates(Math.max(1, player.position));
      posX.value = withTiming(coord.x, { duration: 250 });
      posY.value = withTiming(coord.y, { duration: 250 });
    }
  }, [player.path, player.position]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - (cellSize * 0.4) / 2 },
      { translateY: posY.value - (cellSize * 0.4) / 2 + hopY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.token,
        {
          backgroundColor: player.color,
          width: cellSize * 0.4,
          height: cellSize * 0.4,
          borderRadius: (cellSize * 0.4) / 2,
          borderColor: '#FFFFFF',
        },
        style,
      ]}
    >
      <View style={styles.tokenCenterDot} />
    </Animated.View>
  );
}

export function SnakeLadderBoard({
  level,
  players,
  boardSize: propBoardSize,
  highlightElements = false,
}: Props) {
  const { width } = useWindowDimensions();
  const boardSize = propBoardSize || Math.min(width - 32, 420);
  const borderWidth = 6;
  const innerBoardSize = boardSize - borderWidth * 2;
  const cellSize = innerBoardSize / level.gridSize;

  const getCoordinates = (cell: number) => {
    if (cell < 1) cell = 1;
    if (cell > level.gridSize * level.gridSize) cell = level.gridSize * level.gridSize;
    const rowFromBottom = Math.floor((cell - 1) / level.gridSize);
    const rowFromTop = level.gridSize - 1 - rowFromBottom;
    const isEvenRow = rowFromBottom % 2 === 0;
    const offset = (cell - 1) % level.gridSize;
    const col = isEvenRow ? offset : level.gridSize - 1 - offset;
    return {
      x: col * cellSize + cellSize / 2,
      y: rowFromTop * cellSize + cellSize / 2,
    };
  };

  const cells = Array.from({ length: level.gridSize * level.gridSize }, (_, index) => {
    const rowFromTop = Math.floor(index / level.gridSize);
    const rowFromBottom = level.gridSize - 1 - rowFromTop;
    const col = index % level.gridSize;
    const base = rowFromBottom * level.gridSize;
    const offset = rowFromBottom % 2 === 0 ? col + 1 : level.gridSize - col;
    return base + offset;
  });

  const snakeHeadSet = new Set(Object.keys(level.snakes).map(Number));
  const ladderBaseSet = new Set(Object.keys(level.ladders).map(Number));

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {cells.map((cell, index) => {
        const isLight = (Math.floor(index / level.gridSize) + index) % 2 === 0;
        const isStart = cell === 1;
        const isFinish = cell === level.gridSize * level.gridSize;
        const fontSize = level.gridSize === 12 ? 9 : level.gridSize === 10 ? 10 : 12;
        const isSnakeHead = snakeHeadSet.has(cell);
        const isLadderBase = ladderBaseSet.has(cell);

        return (
          <View
            key={`cell-${cell}`}
            style={[
              styles.cell,
              { width: cellSize, height: cellSize },
              isLight ? styles.lightCell : styles.darkCell,
              (isStart || isFinish) && styles.specialCell,
              isSnakeHead && styles.snakeCellHighlight,
              isLadderBase && styles.ladderCellHighlight,
            ]}
          >
            {isSnakeHead && <Text style={styles.cellBadge}>🐍</Text>}
            {isLadderBase && <Text style={styles.cellBadge}>🪜</Text>}
            <Text
              style={[
                styles.number,
                { fontSize },
                isStart || isFinish ? styles.specialNumber : undefined,
                isSnakeHead && { color: '#F87171' },
                isLadderBase && { color: '#4ADE80' },
              ]}
            >
              {cell === 1 ? 'START' : cell === level.gridSize * level.gridSize ? 'END' : cell}
            </Text>
          </View>
        );
      })}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={innerBoardSize} height={innerBoardSize}>
          {/* Draw Ladders */}
          {Object.entries(level.ladders).map(([start, end]) => {
            const p1 = getCoordinates(parseInt(start)); // Bottom of ladder
            const p2 = getCoordinates(end); // Top of ladder
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;
            const width = 10;
            const leftRail = {
              x1: p1.x + nx * width,
              y1: p1.y + ny * width,
              x2: p2.x + nx * width,
              y2: p2.y + ny * width,
            };
            const rightRail = {
              x1: p1.x - nx * width,
              y1: p1.y - ny * width,
              x2: p2.x - nx * width,
              y2: p2.y - ny * width,
            };
            const numRungs = Math.max(3, Math.floor(len / 16));
            const rungs = Array.from({ length: numRungs }, (_, i) => {
              const t = (i + 1) / (numRungs + 1);
              const cx = p1.x + dx * t;
              const cy = p1.y + dy * t;
              return {
                x1: cx + nx * width,
                y1: cy + ny * width,
                x2: cx - nx * width,
                y2: cy - ny * width,
              };
            });

            return (
              <React.Fragment key={`ladder-${start}`}>
                <Line
                  x1={leftRail.x1}
                  y1={leftRail.y1}
                  x2={leftRail.x2}
                  y2={leftRail.y2}
                  stroke={COLORS.lime}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0.9}
                />
                <Line
                  x1={rightRail.x1}
                  y1={rightRail.y1}
                  x2={rightRail.x2}
                  y2={rightRail.y2}
                  stroke={COLORS.lime}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0.9}
                />
                {rungs.map((r, i) => (
                  <Line
                    key={i}
                    x1={r.x1}
                    y1={r.y1}
                    x2={r.x2}
                    y2={r.y2}
                    stroke={COLORS.lime}
                    strokeWidth={4}
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* Draw Snakes - FIXED HEAD AND TAIL DIRECTION */}
          {Object.entries(level.snakes).map(([start, end]) => {
            // start is the HEAD (higher number where player gets bitten)
            // end is the TAIL (lower number where player slides down)
            const pHead = getCoordinates(parseInt(start));
            const pTail = getCoordinates(end);

            const dx = pHead.x - pTail.x;
            const dy = pHead.y - pTail.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;

            // Build a smooth sine wave path from tail to head
            const numPoints = 26;
            let pathStr = `M ${pTail.x} ${pTail.y}`;
            for (let i = 1; i <= numPoints; i++) {
              const t = i / numPoints;
              const px = pTail.x + dx * t;
              const py = pTail.y + dy * t;
              const wave = Math.sin(t * Math.PI * 5) * 14;
              const cx = px + nx * wave;
              const cy = py + ny * wave;
              pathStr += ` L ${cx} ${cy}`;
            }

            return (
              <React.Fragment key={`snake-${start}`}>
                {/* Snake body */}
                <Path
                  d={pathStr}
                  stroke="#DC2626"
                  strokeWidth={9}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.95}
                />
                {/* Snake body inner neon spine */}
                <Path
                  d={pathStr}
                  stroke="#FCA5A5"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.8}
                />
                {/* Snake head at pHead */}
                <Circle cx={pHead.x} cy={pHead.y} r={10} fill="#B91C1C" stroke="#FEF08A" strokeWidth={2} />
                {/* Snake eyes */}
                <Circle cx={pHead.x - 3} cy={pHead.y - 2} r={2} fill="#FEF08A" />
                <Circle cx={pHead.x + 3} cy={pHead.y - 2} r={2} fill="#FEF08A" />
                <Circle cx={pHead.x - 3} cy={pHead.y - 2} r={1} fill="#111827" />
                <Circle cx={pHead.x + 3} cy={pHead.y - 2} r={1} fill="#111827" />
                {/* Tapered tail at pTail */}
                <Circle cx={pTail.x} cy={pTail.y} r={4} fill="#991B1B" />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Render Animated Tokens over the board */}
      <View style={StyleSheet.absoluteFill}>
        {players.map((player) => (
          <AnimatedToken
            key={`token-${player.id}`}
            player={player}
            getCoordinates={getCoordinates}
            cellSize={cellSize}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 4,
    borderColor: '#1F3A2E',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#16241C',
    position: 'relative',
    alignSelf: 'center',
  },
  cell: {
    borderWidth: 0,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightCell: { backgroundColor: '#23352A' },
  darkCell: { backgroundColor: '#16241C' },
  specialCell: { backgroundColor: '#2C4234' },
  snakeCellHighlight: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  ladderCellHighlight: {
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  cellBadge: {
    position: 'absolute',
    top: 1,
    right: 2,
    fontSize: 8,
  },
  number: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '900',
  },
  specialNumber: {
    color: COLORS.amber,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  token: {
    borderWidth: 2,
    position: 'absolute',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
});
