import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Direction } from '../types';
import { COLORS } from '../../../constants/theme';
import { hapticsService } from '../../../services/hapticsService';

interface SnakeControlsProps {
  onDirectionPress: (dir: Direction) => void;
}

export const SnakeControls: React.FC<SnakeControlsProps> = ({
  onDirectionPress,
}) => {
  const handlePress = (dir: Direction) => {
    hapticsService.light();
    onDirectionPress(dir);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dpad}>
        {/* UP */}
        <TouchableOpacity
          style={[styles.dpadBtn, styles.btnUp]}
          onPress={() => handlePress('UP')}
          activeOpacity={0.7}
        >
          <ChevronUp size={28} color={COLORS.cyan} />
        </TouchableOpacity>

        <View style={styles.middleRow}>
          {/* LEFT */}
          <TouchableOpacity
            style={[styles.dpadBtn, styles.btnLeft]}
            onPress={() => handlePress('LEFT')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color={COLORS.cyan} />
          </TouchableOpacity>

          <View style={styles.centerNode} />

          {/* RIGHT */}
          <TouchableOpacity
            style={[styles.dpadBtn, styles.btnRight]}
            onPress={() => handlePress('RIGHT')}
            activeOpacity={0.7}
          >
            <ChevronRight size={28} color={COLORS.cyan} />
          </TouchableOpacity>
        </View>

        {/* DOWN */}
        <TouchableOpacity
          style={[styles.dpadBtn, styles.btnDown]}
          onPress={() => handlePress('DOWN')}
          activeOpacity={0.7}
        >
          <ChevronDown size={28} color={COLORS.cyan} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingBottom: 8,
  },
  dpad: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  centerNode: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F1626',
  },
  dpadBtn: {
    width: 54,
    height: 54,
    backgroundColor: '#162238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnUp: {
    marginBottom: 6,
  },
  btnDown: {
    marginTop: 6,
  },
  btnLeft: {},
  btnRight: {},
});
