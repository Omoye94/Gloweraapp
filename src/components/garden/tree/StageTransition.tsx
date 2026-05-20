import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GrowthStage, STAGE_NAMES } from '../../../types/plant';

interface StageTransitionProps {
  newStage: GrowthStage;
  onComplete: () => void;
}

const SPARKLE_COUNT = 7;
const GOLDEN_ANGLE = 137.508;

const SparkleOrb: React.FC<{ index: number; color: string }> = ({ index, color }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 60,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const angle = index * GOLDEN_ANGLE;
  const rad = (angle * Math.PI) / 180;

  const style = useAnimatedStyle(() => {
    const dist = progress.value * 80;
    return {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: color,
      opacity: 1 - progress.value,
      transform: [
        { translateX: Math.cos(rad) * dist - 4 },
        { translateY: Math.sin(rad) * dist - 4 },
        { scale: 1 - progress.value * 0.5 },
      ],
    };
  });

  return <Animated.View style={style} />;
};

const STAGE_SPARKLE_COLORS: Record<GrowthStage, string> = {
  seed: '#E2CBB2',
  sprout: '#D4D1AA',
  bud: '#F9C4B7',
  bloom: '#F2B4CC',
  glow: '#FFD700',
};

export const StageTransition: React.FC<StageTransitionProps> = ({
  newStage,
  onComplete,
}) => {
  const flash = useSharedValue(0);
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const treeScale = useSharedValue(1);

  const sparkleColor = STAGE_SPARKLE_COLORS[newStage];

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Flash in -> text appears -> fade out
    flash.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
      withTiming(0.3, { duration: 300 }),
      withDelay(1200, withTiming(0, { duration: 400 })),
    );

    textScale.value = withDelay(
      200,
      withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0.8, { duration: 300 })),
      ),
    );

    textOpacity.value = withDelay(
      200,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1000, withTiming(0, { duration: 400 })),
      ),
    );

    // Subtle scale bounce on tree behind overlay
    treeScale.value = withSequence(
      withTiming(1.06, { duration: 250, easing: Easing.out(Easing.ease) }),
      withTiming(0.97, { duration: 200 }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
    );

    const timeout = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timeout);
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: treeScale.value }],
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.flash, flashStyle]} />

      {/* Sparkle burst */}
      <View style={styles.sparkleContainer}>
        {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
          <SparkleOrb key={`s-${i}`} index={i} color={sparkleColor} />
        ))}
      </View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.emoji}>
          {newStage === 'sprout' ? '\u{1F331}' :
           newStage === 'bud' ? '\u{1F33F}' :
           newStage === 'bloom' ? '\u{1F338}' :
           newStage === 'glow' ? '\u{2728}' : '\u{1F330}'}
        </Text>
        <Text style={styles.stageText}>{STAGE_NAMES[newStage]}!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  sparkleContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 48,
  },
  stageText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#3A2E2B',
    letterSpacing: 2,
  },
});
