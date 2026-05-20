import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBeautyRituals } from '../../src/hooks/useBeautyRituals';
import { usePlantStore } from '../../src/stores';
import { BeautyTimeSection } from '../../src/components/beauty/BeautyTimeSection';
import { spacing } from '../../src/theme';
import { formatDateKey } from '../../src/utils/dateUtils';

const TIME_SECTIONS = ['morning', 'evening', 'anytime', 'weekly'] as const;

export default function BeautyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPoints } = usePlantStore();

  const {
    rituals,
    getRitualsForTime,
    isCompletedToday,
    handleComplete,
    handleUncomplete,
  } = useBeautyRituals();

  const hasRituals = rituals.length > 0;

  const onComplete = (ritualId: string) => {
    handleComplete(ritualId);
    addPoints(10, true);
  };

  return (
    <LinearGradient
      colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        {/* Header */}
        <Text style={styles.headline}>Beauty{'\n'}Rituals</Text>
        <Text style={styles.tagline}>Small rituals that help you feel cared for.</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {hasRituals ? (
          <View style={styles.sections}>
            {TIME_SECTIONS.map((time) => (
              <BeautyTimeSection
                key={time}
                timeOfDay={time}
                rituals={getRitualsForTime(time)}
                isCompletedToday={isCompletedToday}
                onComplete={onComplete}
                onUncomplete={handleUncomplete}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyTitle}>Start your beauty ritual</Text>
            <Text style={styles.emptySubtitle}>
              Add a few small rituals that make you feel good.
            </Text>
            <Pressable
              onPress={() => router.push('/beauty/new' as any)}
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.emptyButtonText}>Add my first ritual</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Floating add button */}
      {hasRituals && (
        <Pressable
          onPress={() => router.push('/beauty/new' as any)}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 90 },
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
          ]}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,250,249,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 18,
    color: '#7A6668',
    lineHeight: 20,
  },
  headline: {
    fontSize: 30,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#7A6668',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(212,144,154,0.35)',
    borderRadius: 9999,
    marginVertical: 14,
  },
  sections: {
    width: '100%',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#7A6668',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  emptyButton: {
    backgroundColor: '#3A2E2B',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 9999,
    marginTop: spacing.sm,
  },
  emptyButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C45A82',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FEFAF9',
    lineHeight: 32,
    fontWeight: '300',
  },
});
