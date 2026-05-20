import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme, typography, spacing, shadows } from '../../theme';

interface GlowMeterProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  streak?: number;
}

export const GlowMeter: React.FC<GlowMeterProps> = ({
  progress,
  size = 160,
  strokeWidth = 14,
  streak = 0,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* Outer glow effect */}
      <View style={[styles.glowRing, { width: size + 24, height: size + 24 }]} />

      <Svg width={size} height={size}>
        <Defs>
          {/* Terracotta gradient for progress ring */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F2B4CC" />
            <Stop offset="50%" stopColor="#C45A82" />
            <Stop offset="100%" stopColor="#F9C4B7" />
          </LinearGradient>
          {/* Subtle background gradient */}
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EADBD4" />
            <Stop offset="100%" stopColor="#EADBD4" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#bgGradient)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle with gradient */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      <View style={[styles.labelContainer, { width: size, height: size }]}>
        <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
        <Text style={styles.label}>today's glow</Text>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{streak}d streak</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(244, 198, 204, 0.08)',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 36,
    fontFamily: 'Satoshi-Medium',
    letterSpacing: -1,
    color: '#3A2E2B',
  },
  label: {
    fontSize: 13,
    fontFamily: 'DMSans',
    letterSpacing: 0.5,
    color: '#9E8880',
    marginTop: spacing.xs,
    textTransform: 'lowercase',
  },
  streakBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(244, 198, 204, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
  },
});
