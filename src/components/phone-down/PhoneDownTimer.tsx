import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PhoneDownTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
}

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, '0');
}

const easeInOut = Easing.inOut(Easing.ease);

export const PhoneDownTimer: React.FC<PhoneDownTimerProps> = ({
  secondsRemaining,
  totalSeconds,
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progress = totalSeconds > 0 ? 1 - secondsRemaining / totalSeconds : 0;

  // Breathing glow orb
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3500, easing: easeInOut }),
        withTiming(1.0, { duration: 3500, easing: easeInOut }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 3500, easing: easeInOut }),
        withTiming(0.45, { duration: 3500, easing: easeInOut }),
      ),
      -1,
      false,
    );
  }, []);

  const outerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const midGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + glowScale.value * 0.3 }],
    opacity: glowOpacity.value * 0.8,
  }));

  return (
    <View style={styles.container}>
      {/* Breathing glow rings */}
      <Animated.View style={[styles.glowOuter, outerGlowStyle]} />
      <Animated.View style={[styles.glowMid, midGlowStyle]} />

      {/* Timer display */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>
          {pad(minutes)}:{pad(seconds)}
        </Text>
        <Text style={styles.timerLabel}>remaining</Text>
      </View>

      {/* Subtle arc progress — just a thin blush line */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244,198,204,0.12)',
  },
  glowMid: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(212,201,248,0.12)',
  },
  timerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(254,250,249,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.2)',
  },
  timerText: {
    fontSize: 44,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#9E8880',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  progressTrack: {
    marginTop: 32,
    width: 160,
    height: 3,
    borderRadius: 9999,
    backgroundColor: 'rgba(212,144,154,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: '#C45A82',
    opacity: 0.7,
  },
});
