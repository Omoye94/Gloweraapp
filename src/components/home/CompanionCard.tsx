import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GloweraPlant } from '../garden/GloweraPlant';
import { useHabitStore, usePlantStore, useUserStore } from '../../stores';
import { getPlantMood } from '../../utils/plantMood';
import { getCompanionSpeech } from '../../constants/companionSpeech';
import { formatDateKey } from '../../utils/dateUtils';
import { spacing, shadows, borderRadius } from '../../theme/spacing';
import { gradients } from '../../theme/colors';

export function CompanionCard() {
  const router = useRouter();
  const plant = usePlantStore(s => s.plant);
  const getProgressToNext = usePlantStore(s => s.getProgressToNext);
  const getProgressForDate = useHabitStore(s => s.getProgressForDate);
  const gardenName = useUserStore(s => s.user?.gardenName ?? '');

  const todaysProgress = getProgressForDate(formatDateKey());
  const mood = useMemo(
    () =>
      getPlantMood({
        streak: plant.streak,
        todaysProgressPercent: todaysProgress.percentage,
      }),
    [plant.streak, todaysProgress.percentage],
  );

  const speech = useMemo(
    () => getCompanionSpeech(mood, gardenName, plant.streak.currentStreak),
    [mood, gardenName, plant.streak.currentStreak],
  );

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/garden')}
      style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.96 }]}
    >
      <LinearGradient
        colors={gradients.heroBloom as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.plantWrap} pointerEvents="none">
          <GloweraPlant
            stage={plant.currentStage}
            progressToNext={getProgressToNext()}
            size={140}
            mood={mood}
          />
        </View>

        <View style={styles.bubble}>
          {gardenName ? <Text style={styles.nameplate}>{gardenName}</Text> : null}
          <Text style={styles.bubbleText}>{speech}</Text>
          <Text style={styles.bubbleMeta}>
            {plant.streak.currentStreak > 0
              ? `Day ${plant.streak.currentStreak} · ${moodLabel(mood)}`
              : moodLabel(mood)}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function moodLabel(m: ReturnType<typeof getPlantMood>): string {
  switch (m) {
    case 'glowing': return 'glowing';
    case 'happy':   return 'happy';
    case 'sleepy':  return 'resting';
    case 'wilting': return 'missing you';
  }
}

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.hero,
    ...shadows.md,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.hero,
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
    overflow: 'hidden',
  },
  plantWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,251,245,0.92)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  nameplate: {
    fontSize: 13,
    fontFamily: 'Raleway-SemiBold',
    color: '#C45A82',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#3A2E2B',
    lineHeight: 22,
  },
  bubbleMeta: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    letterSpacing: 0.8,
    color: '#9E8880',
    textTransform: 'uppercase',
  },
});
