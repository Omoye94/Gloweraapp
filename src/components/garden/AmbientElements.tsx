import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GrowthStage } from '../../types/plant';
import { TimeOfDay } from './tree/TreeScene';

interface AmbientElementsProps {
  stage: GrowthStage;
  timeOfDay: TimeOfDay;
}

const easeInOut = Easing.inOut(Easing.ease);

// Butterfly — day/evening, sprout+ stage
const Butterfly: React.FC = () => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const wingFlap = useSharedValue(0);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 4000, easing: easeInOut }),
        withTiming(-30, { duration: 4000, easing: easeInOut }),
        withTiming(10, { duration: 4000, easing: easeInOut }),
      ),
      -1,
      true,
    );
    y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: easeInOut }),
        withTiming(10, { duration: 3000, easing: easeInOut }),
        withTiming(-30, { duration: 3000, easing: easeInOut }),
        withTiming(5, { duration: 3000, easing: easeInOut }),
      ),
      -1,
      true,
    );
    wingFlap.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300, easing: easeInOut }),
        withTiming(0, { duration: 300, easing: easeInOut }),
      ),
      -1,
      true,
    );
  }, []);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 0.4 + wingFlap.value * 0.6 }, { rotate: '-15deg' }],
  }));

  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: 0.4 + wingFlap.value * 0.6 }, { rotate: '15deg' }],
  }));

  return (
    <Animated.View style={[styles.butterflyContainer, bodyStyle]}>
      <Animated.View style={[styles.wing, styles.leftWing, leftWingStyle]} />
      <View style={styles.butterflyBody} />
      <Animated.View style={[styles.wing, styles.rightWing, rightWingStyle]} />
    </Animated.View>
  );
};

// Firefly — night only
const Firefly: React.FC<{ delay: number; startX: number; startY: number }> = ({
  delay,
  startX,
  startY,
}) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: 4000, easing: easeInOut }),
          withTiming(-15, { duration: 5000, easing: easeInOut }),
        ),
        -1,
        true,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 3500, easing: easeInOut }),
          withTiming(12, { duration: 4500, easing: easeInOut }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1500, easing: easeInOut }),
          withTiming(0.2, { duration: 1500, easing: easeInOut }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    left: startX,
    top: startY,
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.firefly, style]}>
      <View style={styles.fireflyGlow} />
      <View style={styles.fireflyCore} />
    </Animated.View>
  );
};

// Floating petal — bloom/glow stages
const FloatingPetal: React.FC<{ delay: number; startX: number }> = ({ delay, startX }) => {
  const y = useSharedValue(-10);
  const x = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withTiming(180, { duration: 15000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 4000, easing: easeInOut }),
          withTiming(-10, { duration: 3500, easing: easeInOut }),
        ),
        -1,
        true,
      ),
    );
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 12000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.6, { duration: 10000 }),
          withTiming(0, { duration: 3000 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    left: startX,
    top: 20,
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.petal, style]} />;
};

export const AmbientElements: React.FC<AmbientElementsProps> = ({ stage, timeOfDay }) => {
  const stageIndex = ['seed', 'sprout', 'bud', 'bloom', 'glow'].indexOf(stage);

  const showButterfly = (timeOfDay === 'day' || timeOfDay === 'evening') && stageIndex >= 1;
  const showFireflies = timeOfDay === 'night';
  const showPetals = stageIndex >= 3; // bloom or glow

  if (!showButterfly && !showFireflies && !showPetals) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {showButterfly && <Butterfly />}

      {showFireflies && (
        <>
          <Firefly delay={0} startX={60} startY={40} />
          <Firefly delay={2000} startX={150} startY={80} />
          <Firefly delay={4000} startX={100} startY={20} />
        </>
      )}

      {showPetals && (
        <>
          <FloatingPetal delay={0} startX={80} />
          {stageIndex >= 4 && <FloatingPetal delay={5000} startX={140} />}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  // Butterfly
  butterflyContainer: {
    position: 'absolute',
    top: 50,
    left: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  butterflyBody: {
    width: 3,
    height: 10,
    backgroundColor: '#8B7355',
    borderRadius: 1.5,
  },
  wing: {
    width: 10,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(200, 170, 220, 0.6)',
  },
  leftWing: {
    marginRight: -1,
  },
  rightWing: {
    marginLeft: -1,
  },
  // Firefly
  firefly: {
    position: 'absolute',
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireflyGlow: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 220, 130, 0.3)',
  },
  fireflyCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F5DC82',
  },
  // Petal
  petal: {
    position: 'absolute',
    width: 8,
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(232, 180, 200, 0.5)',
  },
});
