import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Direction } from '../types';
import { COLORS } from '../../../constants/theme';
import { hapticsService } from '../../../services/hapticsService';

interface PacmanDPadProps {
  currentDir: Direction;
  onPressDir: (dir: Direction) => void;
}

export const PacmanDPad: React.FC<PacmanDPadProps> = ({ currentDir, onPressDir }) => {
  const handlePress = (dir: Direction) => {
    hapticsService.light();
    onPressDir(dir);
  };

  return (
    <View style={styles.dpadContainer}>
      {/* UP */}
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handlePress('UP')}
          style={[styles.dpadBtn, currentDir === 'UP' && styles.dpadBtnActive]}
        >
          <ChevronUp size={30} color={currentDir === 'UP' ? COLORS.cyan : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* LEFT, CENTER HUB, RIGHT */}
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handlePress('LEFT')}
          style={[styles.dpadBtn, currentDir === 'LEFT' && styles.dpadBtnActive]}
        >
          <ChevronLeft size={30} color={currentDir === 'LEFT' ? COLORS.cyan : COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.centerHub} />

        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handlePress('RIGHT')}
          style={[styles.dpadBtn, currentDir === 'RIGHT' && styles.dpadBtnActive]}
        >
          <ChevronRight size={30} color={currentDir === 'RIGHT' ? COLORS.cyan : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* DOWN */}
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handlePress('DOWN')}
          style={[styles.dpadBtn, currentDir === 'DOWN' && styles.dpadBtnActive]}
        >
          <ChevronDown size={30} color={currentDir === 'DOWN' ? COLORS.cyan : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dpadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 58,
    height: 50,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    margin: 3,
  },
  dpadBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  centerHub: {
    width: 44,
    height: 44,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    margin: 2,
  },
});
