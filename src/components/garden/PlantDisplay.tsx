import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { GrowthStage, STAGE_NAMES, STAGE_DESCRIPTIONS } from '../../types/plant';
import { theme, typography, spacing, borderRadius } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';

interface PlantDisplayProps {
  stage: GrowthStage;
  progressToNext: number;
  pointsToNext: number;
  totalPoints: number;
  compact?: boolean;
}

// Plant emoji representations for each stage
const PLANT_EMOJIS: Record<GrowthStage, string> = {
  seed: '🌰',
  sprout: '🌱',
  bud: '🌿',
  bloom: '🌸',
  glow: '🌺',
};

// Particle positions for floating sparkles
const PARTICLES = [
  { x: -65, y: -70, delay: 0 },
  { x: 60, y: -55, delay: 400 },
  { x: -55, y: 30, delay: 800 },
  { x: 70, y: 20, delay: 1200 },
  { x: -30, y: -50, delay: 600 },
  { x: 40, y: -70, delay: 1000 },
];

const FloatingParticle: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      floatAnim.setValue(0);
      opacityAnim.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(floatAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(floatAnim, {
                toValue: 0,
                duration: 3000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.5,
                duration: 1200,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();
    };

    startAnimation();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          left: 80 + x,
          top: 80 + y,
          opacity: opacityAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      ✨
    </Animated.Text>
  );
};

export const PlantDisplay: React.FC<PlantDisplayProps> = ({
  stage,
  progressToNext,
  pointsToNext,
  totalPoints,
  compact = false,
}) => {
  const emoji = PLANT_EMOJIS[stage];
  const stageName = STAGE_NAMES[stage];
  const stageDescription = STAGE_DESCRIPTIONS[stage];
  const isMaxStage = stage === 'glow';

  // Animation values
  const swayAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation - bounce in
    Animated.spring(entryAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Gentle swaying animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow ring animation (for bloom and glow stages)
    if (stage === 'bloom' || stage === 'glow') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [stage]);

  // Interpolations
  const rotate = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  const entryScale = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Animated.Text
          style={[
            styles.compactEmoji,
            {
              transform: [
                { rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          {emoji}
        </Animated.Text>
        <View style={styles.compactInfo}>
          <Text style={styles.compactStage}>{stageName}</Text>
          <Text style={styles.compactPoints}>{totalPoints} pts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.plantContainer,
          {
            transform: [{ scale: entryScale }],
          },
        ]}
      >
        {/* Glow ring for bloom/glow stages */}
        {(stage === 'bloom' || stage === 'glow') && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />
        )}

        {/* Floating particles for higher stages */}
        {(stage === 'bud' || stage === 'bloom' || stage === 'glow') &&
          PARTICLES.slice(0, stage === 'glow' ? 6 : stage === 'bloom' ? 4 : 2).map((p, i) => (
            <FloatingParticle key={i} x={p.x} y={p.y} delay={p.delay} />
          ))
        }

        {/* Main plant emoji */}
        <Animated.Text
          style={[
            styles.emoji,
            {
              transform: [
                { rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          {emoji}
        </Animated.Text>
      </Animated.View>

      <Text style={styles.stageName}>{stageName}</Text>
      <Text style={styles.description}>{stageDescription}</Text>

      <View style={styles.progressSection}>
        <View style={styles.pointsRow}>
          <Text style={styles.totalPoints}>{totalPoints} points</Text>
          {!isMaxStage && (
            <Text style={styles.nextStagePoints}>{pointsToNext} to next stage</Text>
          )}
        </View>

        {!isMaxStage && (
          <ProgressBar
            progress={progressToNext}
            height={6}
            color={theme.accent}
          />
        )}

        {isMaxStage && (
          <Text style={styles.maxStageText}>You've reached full bloom!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  plantContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'visible',
  },
  glowRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 153, 181, 0.15)',
    borderWidth: 4,
    borderColor: '#FF6B9D',
    shadowColor: '#FF99B5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  emoji: {
    fontSize: 80,
  },
  stageName: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  progressSection: {
    width: '100%',
    maxWidth: 280,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalPoints: {
    ...typography.label,
    color: theme.text,
  },
  nextStagePoints: {
    ...typography.caption,
    color: theme.textMuted,
  },
  maxStageText: {
    ...typography.body,
    color: theme.accent,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  compactEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactStage: {
    ...typography.label,
    color: theme.text,
  },
  compactPoints: {
    ...typography.caption,
    color: theme.textSecondary,
  },
});
