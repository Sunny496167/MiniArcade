import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { COLORS } from '../../../constants/theme';
import { BoardLevel, SnakeLadderPlayer } from '../types';

interface Props { level: BoardLevel; players: SnakeLadderPlayer[]; boardSize?: number; }

function AnimatedToken({ player, getCoordinates, cellSize }: { player: SnakeLadderPlayer; getCoordinates: (c: number) => {x: number, y: number}; cellSize: number; }) {
  const posX = useSharedValue(getCoordinates(Math.max(1, player.position)).x);
  const posY = useSharedValue(getCoordinates(Math.max(1, player.position)).y);

  useEffect(() => {
    if (player.path && player.path.length > 0) {
      const animateStep = (index: number) => {
        if (index >= player.path!.length) return;
        const coord = getCoordinates(player.path![index]);
        // Quicker animation for hop, slower for slide/climb
        const duration = index === player.path!.length - 1 && player.path!.length > 1 ? 500 : 200;
        
        posX.value = withTiming(coord.x, { duration });
        posY.value = withTiming(coord.y, { duration }, (finished) => {
          if (finished && index + 1 < player.path!.length) {
            runOnJS(animateStep)(index + 1);
          }
        });
      };
      animateStep(0);
    } else {
      const coord = getCoordinates(Math.max(1, player.position));
      posX.value = withTiming(coord.x, { duration: 300 });
      posY.value = withTiming(coord.y, { duration: 300 });
    }
  }, [player.path, player.position]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - (cellSize * 0.35) / 2 },
      { translateY: posY.value - (cellSize * 0.35) / 2 }
    ]
  }));

  return (
    <Animated.View style={[
      styles.token,
      { backgroundColor: player.color, width: cellSize * 0.35, height: cellSize * 0.35, borderRadius: cellSize },
      style
    ]} />
  );
}

export function SnakeLadderBoard({ level, players, boardSize: propBoardSize }: Props) {
  const { width } = useWindowDimensions();
  const boardSize = propBoardSize || Math.min(width - 32, 420);
  const borderWidth = 6;
  const innerBoardSize = boardSize - (borderWidth * 2);
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
    const offset = (rowFromBottom % 2 === 0) ? (col + 1) : (level.gridSize - col);
    return base + offset;
  });

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {cells.map((cell, index) => {
        const isLight = (Math.floor(index / level.gridSize) + index) % 2 === 0;
        const isStart = cell === 1;
        const isFinish = cell === level.gridSize * level.gridSize;
        const fontSize = level.gridSize === 12 ? 10 : level.gridSize === 10 ? 11 : 13;
        
        return (
          <View key={`cell-${cell}`} style={[styles.cell, { width: cellSize, height: cellSize }, isLight ? styles.lightCell : styles.darkCell, (isStart || isFinish) && styles.specialCell]}>
            <Text style={[styles.number, { fontSize }, (isStart || isFinish) ? styles.specialNumber : undefined]}>
              {cell === 1 ? 'START' : cell === level.gridSize * level.gridSize ? 'END' : cell}
            </Text>
          </View>
        );
      })}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={innerBoardSize} height={innerBoardSize}>
          {/* Draw Ladders */}
          {Object.entries(level.ladders).map(([start, end]) => {
            const p1 = getCoordinates(parseInt(start));
            const p2 = getCoordinates(end);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;
            const width = 10; // Ladder half-width
            const leftRail = { x1: p1.x + nx * width, y1: p1.y + ny * width, x2: p2.x + nx * width, y2: p2.y + ny * width };
            const rightRail = { x1: p1.x - nx * width, y1: p1.y - ny * width, x2: p2.x - nx * width, y2: p2.y - ny * width };
            const numRungs = Math.max(3, Math.floor(len / 16));
            const rungs = Array.from({ length: numRungs }, (_, i) => {
              const t = (i + 1) / (numRungs + 1);
              const cx = p1.x + dx * t;
              const cy = p1.y + dy * t;
              return { x1: cx + nx * width, y1: cy + ny * width, x2: cx - nx * width, y2: cy - ny * width };
            });

            return (
              <React.Fragment key={`ladder-${start}`}>
                <Line x1={leftRail.x1} y1={leftRail.y1} x2={leftRail.x2} y2={leftRail.y2} stroke={COLORS.lime} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
                <Line x1={rightRail.x1} y1={rightRail.y1} x2={rightRail.x2} y2={rightRail.y2} stroke={COLORS.lime} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
                {rungs.map((r, i) => <Line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={COLORS.lime} strokeWidth={4} strokeLinecap="round" opacity={0.9} />)}
              </React.Fragment>
            );
          })}
          {/* Draw Snakes */}
          {Object.entries(level.snakes).map(([start, end]) => {
            const p1 = getCoordinates(parseInt(start)); // Tail
            const p2 = getCoordinates(end); // Head
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;
            
            // Build a smooth sine wave path for the snake
            const numPoints = 24;
            let pathStr = `M ${p1.x} ${p1.y}`;
            for (let i = 1; i <= numPoints; i++) {
              const t = i / numPoints;
              const px = p1.x + dx * t;
              const py = p1.y + dy * t;
              const wave = Math.sin(t * Math.PI * 5) * 14; // 2.5 full waves, 14px amplitude
              const cx = px + nx * wave;
              const cy = py + ny * wave;
              pathStr += ` L ${cx} ${cy}`;
            }
            return (
              <React.Fragment key={`snake-${start}`}>
                <Path d={pathStr} stroke="#D32F2F" strokeWidth={8} strokeLinejoin="round" fill="none" opacity={0.95} />
                {/* Snake head */}
                <Path d={`M ${p2.x - 8} ${p2.y} A 8 8 0 1 1 ${p2.x + 8} ${p2.y} A 8 8 0 1 1 ${p2.x - 8} ${p2.y}`} fill="#B71C1C" />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Render Animated Tokens over the board */}
      <View style={StyleSheet.absoluteFill}>
        {players.map((player) => (
          <AnimatedToken key={`token-${player.id}`} player={player} getCoordinates={getCoordinates} cellSize={cellSize} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ 
  board: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 4, borderColor: '#1F3A2E', borderRadius: 10, overflow: 'hidden', backgroundColor: '#16241C', position: 'relative' }, 
  cell: { borderWidth: 0, padding: 0, justifyContent: 'center', alignItems: 'center' }, 
  lightCell: { backgroundColor: '#23352A' }, 
  darkCell: { backgroundColor: '#16241C' }, 
  specialCell: { backgroundColor: '#2C4234' },
  number: { color: 'rgba(255,255,255,0.3)', fontWeight: '900' }, 
  specialNumber: { color: COLORS.amber, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 2 }, 
  token: { borderWidth: 2, borderColor: '#fff', position: 'absolute', elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.4, shadowRadius: 3, zIndex: 5 } 
});
