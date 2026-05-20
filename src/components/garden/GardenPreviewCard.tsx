import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { GrowthStage, STAGE_NAMES } from '../../types/plant';
import { TreeScene } from './tree';
import { getDailyGardenMessage } from '../../constants/gardenMessages';
import { spacing, shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

interface GardenPreviewCardProps {
  stage: GrowthStage;
  progressToNext: number;
  totalPoints: number;
  particleColorId?: string;
}

export const GardenPreviewCard: React.FC<GardenPreviewCardProps> = ({
  stage,
  progressToNext,
  totalPoints,
  particleColorId,
}) => {
  const router = useRouter();
  const glowBorder = useSharedValue(0.3);
  const message = getDailyGardenMessage(stage);

  useEffect(() => {
    glowBorder.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(244, 198, 204, ${glowBorder.value})`,
  }));

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/garden')}
      style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
    >
      <Animated.View style={[styles.card, borderStyle]}>
        <View style={styles.content}>
          <View style={styles.treeContainer}>
            <TreeScene
              stage={stage}
              progressToNext={progressToNext}
              compact
              particleColorId={particleColorId}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.stageName}>{STAGE_NAMES[stage]}</Text>
            <Text style={styles.points}>{totalPoints.toLocaleString()} pts</Text>
          </View>
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#C45A82',
    borderRadius: 20,
    padding: spacing.lg,
    minHeight: 160,
    justifyContent: 'flex-end',
    borderWidth: 2,
    borderColor: 'rgba(244, 198, 204, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  treeContainer: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  stageName: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  points: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.85)',
  },
  message: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
});
