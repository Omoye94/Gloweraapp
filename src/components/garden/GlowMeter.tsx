import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme, typography, spacing, shadows } from '../../theme';

interface GlowMeterProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export const GlowMeter: React.FC<GlowMeterProps> = ({
  progress,
  size = 160,
  strokeWidth = 14,
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
          {/* Warm gradient for progress ring */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFB199" />
            <Stop offset="50%" stopColor="#FF99B5" />
            <Stop offset="100%" stopColor="#FFBDCC" />
          </LinearGradient>
          {/* Subtle background gradient */}
          <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFF3EB" />
            <Stop offset="100%" stopColor="#FFE8ED" />
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
    backgroundColor: 'rgba(255, 153, 181, 0.08)',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
    color: theme.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: theme.textMuted,
    marginTop: spacing.xs,
    textTransform: 'lowercase',
  },
});
