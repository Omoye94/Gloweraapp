import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface RitualCompletionCardProps {
  durationMinutes: number;
  pointsEarned: number;
  onReturn: () => void;
}

const MESSAGES = [
  'You gave yourself a quiet moment.',
  'Small pauses create clarity.',
  'You chose rest.',
  'Rest supports growth.',
];

function getMessage(minutes: number): string {
  if (minutes <= 5) return MESSAGES[0];
  if (minutes <= 10) return MESSAGES[1];
  if (minutes <= 15) return MESSAGES[2];
  return MESSAGES[3];
}

export const RitualCompletionCard: React.FC<RitualCompletionCardProps> = ({
  durationMinutes,
  pointsEarned,
  onReturn,
}) => {
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);
  const pointsScale = useSharedValue(0.6);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    slideUp.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
    pointsScale.value = withDelay(
      500,
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const pointsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pointsScale.value }],
  }));

  const message = getMessage(durationMinutes);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Orb */}
      <View style={styles.orb}>
        <Text style={styles.orbEmoji}>✨</Text>
      </View>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>You are allowed to pause.</Text>

      {/* Points pill */}
      {pointsEarned > 0 && (
        <Animated.View style={[styles.pointsPill, pointsStyle]}>
          <Text style={styles.pointsText}>+{pointsEarned} glow points</Text>
        </Animated.View>
      )}

      {/* Return button */}
      <Pressable
        onPress={onReturn}
        style={({ pressed }) => [
          styles.returnButton,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={styles.returnButtonText}>Return to garden</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(244,198,204,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  orbEmoji: {
    fontSize: 40,
  },
  message: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#7A6668',
    textAlign: 'center',
    marginBottom: 32,
  },
  pointsPill: {
    backgroundColor: 'rgba(212,201,248,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(212,201,248,0.5)',
  },
  pointsText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#7A6668',
    letterSpacing: 0.5,
  },
  returnButton: {
    backgroundColor: '#C45A82',
    borderRadius: 9999,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  returnButtonText: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    color: '#FEFAF9',
    letterSpacing: 0.3,
  },
});
