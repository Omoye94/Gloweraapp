import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SolarIcon } from '../ui/SolarIcon';
import { useChallenges } from '../../hooks/useChallenges';
import { getCurrentDayIndex } from '../../lib/challenges';
import { spacing, shadows } from '../../theme';

export const ChallengePreviewCard: React.FC = () => {
  const router = useRouter();
  const { activeChallenge, isLoading } = useChallenges();

  if (isLoading || !activeChallenge) return null;

  const { catalog, userChallenge } = activeChallenge;
  const dayIndex = getCurrentDayIndex(userChallenge);
  const dayNumber = dayIndex + 1;
  const daysLeft = catalog.duration - dayNumber;

  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Challenge</Text>
        <Pressable onPress={() => router.push('/(tabs)/challenges')}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cardWrap,
          pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push('/(tabs)/challenges/active')}
      >
        <LinearGradient
          colors={['#D8C9EC', '#F2B4CC', '#F4A888']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{catalog.icon}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{catalog.name}</Text>
            <Text style={styles.detail}>
              Day {dayNumber} · {daysLeft > 0 ? `${daysLeft} days left` : 'Last day!'}
            </Text>
          </View>
          <SolarIcon name="alt-arrow-right-linear" size={16} color="#3A2E2B" />
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#C45A82',
  },
  cardWrap: {
    borderRadius: 18,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  card: {
    borderRadius: 18,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,251,245,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  detail: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6B5752',
  },
});
