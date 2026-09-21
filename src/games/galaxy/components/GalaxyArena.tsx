import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Path, Circle, Rect } from 'react-native-svg';
import {
  Enemy,
  PlayerBullet,
  EnemyBullet,
  GalaxyPowerUp,
  GalaxyParticle,
} from '../types';
import {
  GALAXY_WIDTH,
  GALAXY_HEIGHT,
  SHIP_WIDTH,
  SHIP_HEIGHT,
} from '../engine/galaxyEngine';
import { COLORS } from '../../../constants/theme';

interface GalaxyArenaProps {
  playerX: number;
  playerY: number;
  playerHp: number;
  shieldHp: number;
  bombs: number;
  weaponLevel: number;
  laserActive: number;
  bullets: PlayerBullet[];
  enemyBullets: EnemyBullet[];
  enemies: Enemy[];
  powerUps: GalaxyPowerUp[];
  particles: GalaxyParticle[];
  onTriggerBomb: () => void;
}

export const GalaxyArena: React.FC<GalaxyArenaProps> = ({
  playerX,
  playerY,
  playerHp,
  shieldHp,
  bombs,
  weaponLevel,
  laserActive,
  bullets,
  enemyBullets,
  enemies,
  powerUps,
  particles,
  onTriggerBomb,
}) => {
  return (
    <View style={styles.arena}>
      {/* Background Deep Space Starfield */}
      <View style={styles.starfield} />

      {/* Enemies */}
      {enemies.map((enemy) => (
        <View
          key={enemy.id}
          style={[
            styles.enemyWrapper,
            {
              left: enemy.x - enemy.width / 2,
              top: enemy.y - enemy.height / 2,
              width: enemy.width,
              height: enemy.height,
            },
          ]}
        >
          {/* Boss HP Bar */}
          {enemy.isBoss && (
            <View style={styles.bossHpContainer}>
              <View style={styles.bossHpBg}>
                <View
                  style={[
                    styles.bossHpFill,
                    { width: `${(enemy.hp / enemy.maxHp) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Enemy Sprite SVG */}
          <Svg width={enemy.width} height={enemy.height} viewBox="0 0 40 40">
            {enemy.isBoss ? (
              <>
                <Polygon points="20,40 2,15 8,2 32,2 38,15" fill={enemy.color} stroke="#FFFFFF" strokeWidth="2" />
                <Circle cx="20" cy="18" r="6" fill="#FACC15" />
              </>
            ) : enemy.type === 'cruiser' ? (
              <>
                <Polygon points="20,38 4,10 12,2 28,2 36,10" fill={enemy.color} />
                <Circle cx="20" cy="16" r="4" fill="#00F0FF" />
              </>
            ) : enemy.type === 'interceptor' ? (
              <Polygon points="20,38 5,6 20,12 35,6" fill={enemy.color} />
            ) : enemy.type === 'asteroid' ? (
              <Polygon points="10,2 32,5 38,24 24,38 6,32 2,16" fill="#64748B" stroke="#94A3B8" strokeWidth="1.5" />
            ) : (
              // Drone
              <Polygon points="20,34 6,8 20,14 34,8" fill={enemy.color} />
            )}
          </Svg>
        </View>
      ))}

      {/* Player Bullets */}
      {bullets.map((b) => (
        <View
          key={b.id}
          style={[
            b.isLaser ? styles.laserBullet : styles.playerBullet,
            {
              left: b.x - (b.isLaser ? 3 : 2),
              top: b.y,
            },
          ]}
        />
      ))}

      {/* Enemy Bullets */}
      {enemyBullets.map((eb) => (
        <View
          key={eb.id}
          style={[
            styles.enemyBullet,
            {
              left: eb.x - 3,
              top: eb.y - 3,
              backgroundColor: eb.color,
              shadowColor: eb.color,
            },
          ]}
        />
      ))}

      {/* Power-Ups */}
      {powerUps.map((pow) => (
        <View
          key={pow.id}
          style={[
            styles.powerUpBox,
            {
              left: pow.x - 10,
              top: pow.y - 10,
            },
          ]}
        >
          <Text style={styles.powerUpText}>
            {pow.type === 'spread' ? 'P' : pow.type === 'shield' ? 'S' : pow.type === 'laser' ? 'L' : 'B'}
          </Text>
        </View>
      ))}

      {/* Particles */}
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

      {/* Player Starship */}
      <View
        style={[
          styles.playerShipWrapper,
          {
            left: playerX - SHIP_WIDTH / 2,
            top: playerY - SHIP_HEIGHT / 2,
          },
        ]}
      >
        {/* Shield Aura */}
        {shieldHp > 0 && (
          <View
            style={[
              styles.shieldBubble,
              { borderColor: shieldHp >= 2 ? COLORS.cyan : COLORS.amber },
            ]}
          />
        )}

        {/* Thruster Flame */}
        <View style={styles.thrusterFlame} />

        {/* Ship SVG Body */}
        <Svg width={SHIP_WIDTH} height={SHIP_HEIGHT} viewBox="0 0 34 38">
          <Polygon points="17,0 0,34 17,26 34,34" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
          <Polygon points="17,6 8,28 17,22 26,28" fill="#0284C7" />
          <Circle cx="17" cy="15" r="3" fill="#FFFFFF" />
        </Svg>
      </View>

      {/* Smart Bomb Button */}
      <TouchableOpacity
        disabled={bombs <= 0}
        style={[styles.bombBtn, bombs <= 0 && styles.bombBtnDisabled]}
        onPress={onTriggerBomb}
        activeOpacity={0.8}
      >
        <Text style={styles.bombIcon}>💣</Text>
        <Text style={styles.bombCountText}>{bombs}</Text>
      </TouchableOpacity>

      {/* Weapon & Shield Status Overlays */}
      <View style={styles.topStatusRow}>
        <View style={styles.hudPill}>
          <Text style={styles.hudPillLabel}>WEAPON</Text>
          <Text style={styles.hudPillVal}>
            {laserActive > 0 ? 'LASER' : `LVL ${weaponLevel}`}
          </Text>
        </View>

        {shieldHp > 0 && (
          <View style={[styles.hudPill, { borderColor: COLORS.cyan }]}>
            <Text style={[styles.hudPillLabel, { color: COLORS.cyan }]}>SHIELD</Text>
            <Text style={[styles.hudPillVal, { color: COLORS.cyan }]}>{shieldHp}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  arena: {
    width: GALAXY_WIDTH,
    height: GALAXY_HEIGHT,
    backgroundColor: '#040711',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  playerShipWrapper: {
    position: 'absolute',
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  shieldBubble: {
    position: 'absolute',
    width: SHIP_WIDTH + 18,
    height: SHIP_HEIGHT + 18,
    borderRadius: 99,
    borderWidth: 2,
    backgroundColor: 'rgba(0,240,255,0.12)',
  },
  thrusterFlame: {
    position: 'absolute',
    bottom: -6,
    width: 8,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F97316',
    opacity: 0.9,
  },
  playerBullet: {
    position: 'absolute',
    width: 4,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    zIndex: 15,
  },
  laserBullet: {
    position: 'absolute',
    width: 6,
    height: 24,
    borderRadius: 3,
    backgroundColor: '#F43F5E',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    zIndex: 15,
  },
  enemyWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bossHpContainer: {
    position: 'absolute',
    top: -12,
    width: '100%',
    alignItems: 'center',
  },
  bossHpBg: {
    width: 50,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bossHpFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  enemyBullet: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    zIndex: 12,
  },
  powerUpBox: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 18,
  },
  powerUpText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  particle: {
    position: 'absolute',
    borderRadius: 99,
  },
  bombBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 30,
  },
  bombBtnDisabled: {
    opacity: 0.35,
  },
  bombIcon: {
    fontSize: 16,
  },
  bombCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -2,
  },
  topStatusRow: {
    position: 'absolute',
    top: 8,
    left: 10,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  hudPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudPillLabel: {
    color: COLORS.textMuted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudPillVal: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
});
