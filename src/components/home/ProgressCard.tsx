import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, shadows } from '../../theme';
import { gradients } from '../../theme/colors';

interface ProgressCardProps {
  completed: number;
  total: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const size = 128;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={gradients.softBloom as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Text style={styles.label}>Daily Glow</Text>

        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <Defs>
              <SvgGradient id="progressArc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#9B86D4" />
                <Stop offset="0.6" stopColor="#E87FA6" />
                <Stop offset="1" stopColor="#F4A888" />
              </SvgGradient>
            </Defs>
            {/* Background track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progressArc)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.percentText}>{percentage}%</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {completed} of {total} rituals complete
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 24,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  container: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#6B5752',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  ringContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 28,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#6B5752',
    textAlign: 'center',
  },
});
