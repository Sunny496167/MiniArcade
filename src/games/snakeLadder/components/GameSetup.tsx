import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bot, Users } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
import { getLevelsForGrid } from '../engine/levels';
import { GridSize, MatchSetup } from '../types';

interface Props { onStart?: (setup: MatchSetup) => void; onChange?: (setup: MatchSetup) => void; initialSetup?: MatchSetup; }
const grids: GridSize[] = [8, 10, 12];

export function GameSetup({ onStart, onChange, initialSetup }: Props) {
  const [gridSize, setGridSize] = useState<GridSize>(initialSetup?.gridSize || 10);
  const [humanCount, setHumanCount] = useState(initialSetup?.humanCount || 1);
  const [computerCount, setComputerCount] = useState(initialSetup?.computerCount || 1);
  const levels = useMemo(() => getLevelsForGrid(gridSize), [gridSize]);
  const [levelId, setLevelId] = useState(initialSetup?.levelId || '10-beginner');
  const totalPlayers = humanCount + computerCount;

  React.useEffect(() => {
    if (onChange) {
      onChange({ gridSize, levelId, humanCount, computerCount });
    }
  }, [gridSize, levelId, humanCount, computerCount]);

  const selectGrid = (size: GridSize) => { setGridSize(size); setLevelId(getLevelsForGrid(size)[0].id); };
  const setHumans = (count: number) => { if (count + computerCount >= 2 && count + computerCount <= 4) setHumanCount(count); };
  const setComputers = (count: number) => { if (humanCount + count >= 2 && humanCount + count <= 4) setComputerCount(count); };
  return <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}><Text style={styles.kicker}>ARCADE TABLETOP</Text><Text style={styles.title}>Snake & Ladder</Text><Text style={styles.subtitle}>Choose your board, level, and challengers.</Text></View>
    <Section title="Board size"><View style={styles.options}>{grids.map((size) => <Option key={size} active={size === gridSize} label={`${size} x ${size}`} detail={`${size * size} squares`} onPress={() => selectGrid(size)} />)}</View></Section>
    <Section title="Game level"><View style={styles.options}>{levels.map((level) => <Option key={level.id} active={level.id === levelId} label={level.name} detail={level.difficulty} onPress={() => setLevelId(level.id)} />)}</View></Section>
    <Section title="Human players"><View style={styles.options}>{[1, 2, 3, 4].map((count) => <Option key={count} active={humanCount === count} disabled={count + computerCount > 4 || count + computerCount < 2} label={`${count}`} detail={count === 1 ? 'Human' : 'Humans'} icon={<Users size={16} color={COLORS.cyan} />} onPress={() => setHumans(count)} />)}</View></Section>
    <Section title="Computer players"><View style={styles.options}>{[0, 1, 2, 3].map((count) => <Option key={count} active={computerCount === count} disabled={humanCount + count > 4 || humanCount + count < 2} label={`${count}`} detail={count === 1 ? 'Computer' : 'Computers'} icon={<Bot size={16} color={COLORS.purple} />} onPress={() => setComputers(count)} />)}</View></Section>
    <Text style={styles.summary}>{totalPlayers} players - {humanCount} human - {computerCount} computer</Text>
    {onStart && <Pressable style={styles.start} onPress={() => onStart({ gridSize, levelId, humanCount, computerCount })}><Text style={styles.startText}>Start Game</Text></Pressable>}
  </ScrollView>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>{children}</View>; }
function Option({ active, disabled, label, detail, icon, onPress }: { active: boolean; disabled?: boolean; label: string; detail: string; icon?: React.ReactNode; onPress: () => void }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.option, active && styles.optionActive, disabled && styles.optionDisabled]}><View style={styles.optionTitle}>{icon}<Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text></View><Text style={styles.optionDetail}>{detail}</Text></Pressable>; }
const styles = StyleSheet.create({ screen:{ padding:20, gap:22, backgroundColor:COLORS.bgPrimary, flexGrow:1 }, hero:{ paddingTop:34, gap:6 }, kicker:{ color:COLORS.lime, fontSize:11, fontWeight:'800', letterSpacing:2 }, title:{ color:COLORS.textPrimary, fontSize:36, fontWeight:'900' }, subtitle:{ color:COLORS.textSecondary, fontSize:15 }, section:{ gap:9 }, sectionTitle:{ color:COLORS.textMuted, fontSize:11, fontWeight:'800', letterSpacing:1.2 }, options:{ flexDirection:'row', gap:8 }, option:{ flex:1, minHeight:68, borderRadius:14, padding:10, justifyContent:'center', backgroundColor:COLORS.bgCard, borderWidth:1, borderColor:COLORS.border }, optionActive:{ borderColor:COLORS.cyan, backgroundColor:'rgba(0,240,255,0.1)' }, optionDisabled:{ opacity:0.3 }, optionTitle:{ flexDirection:'row', alignItems:'center', gap:5 }, optionLabel:{ color:COLORS.textPrimary, fontSize:16, fontWeight:'800' }, optionLabelActive:{ color:COLORS.cyan }, optionDetail:{ color:COLORS.textMuted, fontSize:10, marginTop:4 }, summary:{ color:COLORS.textSecondary, textAlign:'center', fontSize:13 }, start:{ backgroundColor:COLORS.cyan, borderRadius:15, alignItems:'center', paddingVertical:16, marginTop:2 }, startText:{ color:COLORS.bgPrimary, fontSize:16, fontWeight:'900' } });
