import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, shadows } from '../../../src/theme';
import { SolarIcon } from '../../../src/components/ui/SolarIcon';
import { CHALLENGES } from '../../../src/data/challenges';
import { useChallenges } from '../../../src/hooks/useChallenges';
import { getCurrentDayIndex } from '../../../src/lib/challenges';

// Map challenge categories/icons to SolarIcon names and accent colours
const CHALLENGE_ICON_MAP: Record<string, { icon: string; bg: string }> = {
  'soft-reset':        { icon: 'leaf-bold',            bg: 'rgba(184,206,172,0.25)' },
  'evening-wind-down': { icon: 'moon-sleep-bold',      bg: 'rgba(212,201,248,0.25)' },
  'gentle-mornings':   { icon: 'cup-star-bold',        bg: 'rgba(244,198,204,0.20)' },
  'glow-from-within':  { icon: 'star-bold-duotone',    bg: 'rgba(212,144,154,0.18)' },
  'calm-challenge':    { icon: 'leaf-bold',            bg: 'rgba(184,206,172,0.25)' },
  'future-self':       { icon: 'star-bold-duotone',    bg: 'rgba(212,201,248,0.25)' },
  'digital-detox':     { icon: 'moon-sleep-bold',      bg: 'rgba(212,201,248,0.20)' },
  'nourish-challenge': { icon: 'water-bold',           bg: 'rgba(184,206,172,0.22)' },
  'movement-joy':      { icon: 'walking-bold',         bg: 'rgba(244,198,204,0.20)' },
  'gratitude-glow':    { icon: 'star-bold-duotone',    bg: 'rgba(212,144,154,0.18)' },
  'boundary-setting':  { icon: 'leaf-bold',            bg: 'rgba(184,206,172,0.25)' },
  'creative-spark':    { icon: 'star-bold-duotone',    bg: 'rgba(212,201,248,0.22)' },
  'sleep-sanctuary':   { icon: 'moon-sleep-bold',      bg: 'rgba(212,201,248,0.25)' },
  'self-love-letters': { icon: 'pen-new-square-bold',  bg: 'rgba(244,198,204,0.20)' },
  'nature-reconnect':  { icon: 'leaf-bold',            bg: 'rgba(184,206,172,0.25)' },
  'mindful-connections':{ icon: 'cup-star-bold',       bg: 'rgba(244,198,204,0.20)' },
  'declutter-mind':    { icon: 'leaf-bold',            bg: 'rgba(184,206,172,0.22)' },
  'hydration-hero':    { icon: 'water-bold',           bg: 'rgba(184,206,172,0.22)' },
  'confidence-boost':  { icon: 'star-bold-duotone',    bg: 'rgba(212,144,154,0.18)' },
};

function getChallengeIconMeta(id: string) {
  return CHALLENGE_ICON_MAP[id] ?? { icon: 'star-bold-duotone', bg: 'rgba(212,144,154,0.18)' };
}

export default function ChallengesCatalogScreen() {
  const router = useRouter();
  const { activeChallenges, completedIds, isLoading } = useChallenges();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C45A82" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </View>
    );
  }

  const activeIds = new Set(activeChallenges.map((a) => a.catalog.id));
  const discoverChallenges = CHALLENGES.filter(
    (c) => !activeIds.has(c.id) && !completedIds.includes(c.id),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>WELLNESS QUESTS</Text>
          <Text style={styles.title}>Wellness Quests</Text>
          <Text style={styles.subtitle}>Embark on journeys for a better you</Text>
        </View>

        {/* ── Active Section ── */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>ACTIVE</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{activeChallenges.length} of 3</Text>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              {activeChallenges.map((info) => {
                const dayIdx = getCurrentDayIndex(info.userChallenge);
                const dayNum = dayIdx + 1;
                const dur = info.catalog.duration;
                const prog = dur > 0 ? Math.round((dayNum / dur) * 100) : 0;
                const left = dur - dayNum;
                return (
                  <Pressable
                    key={info.userChallenge.id}
                    style={({ pressed }) => [
                      styles.activeCardCompact,
                      pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                    ]}
                    onPress={() =>
                      router.push(
                        `/(tabs)/challenges/active?id=${info.userChallenge.id}`,
                      )
                    }
                  >
                    <View style={styles.activeCompactRow}>
                      <View style={styles.activeCompactIcon}>
                        <Text style={{ fontSize: 26 }}>{info.catalog.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activeCompactName} numberOfLines={1}>
                          {info.catalog.name}
                        </Text>
                        <Text style={styles.activeCompactMeta}>
                          Day {dayNum} of {dur} · {prog}%
                        </Text>
                      </View>
                      <SolarIcon name="alt-arrow-right-linear" size={18} color="#C45A82" />
                    </View>
                    <View style={styles.activeCompactTrack}>
                      <View
                        style={[
                          styles.activeCompactFill,
                          { width: `${prog}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.activeCompactDays}>
                      {left > 0
                        ? `Ends in ${left} day${left !== 1 ? 's' : ''}`
                        : 'Last day!'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Discover New ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISCOVER NEW</Text>

          <View style={styles.discoverGrid}>
            {discoverChallenges.map((challenge) => {
              const meta = getChallengeIconMeta(challenge.id);
              const isCompleted = completedIds.includes(challenge.id);
              return (
                <Pressable
                  key={challenge.id}
                  style={({ pressed }) => [
                    styles.discoverCard,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => router.push(`/(tabs)/challenges/${challenge.id}`)}
                >
                  <View style={[styles.discoverIconBox, { backgroundColor: meta.bg }]}>
                    <Text style={{ fontSize: 24 }}>{challenge.icon}</Text>
                  </View>

                  <Text style={styles.discoverName} numberOfLines={2}>
                    {challenge.name}
                  </Text>

                  <View style={styles.discoverMeta}>
                    <Text style={styles.discoverInfo}>
                      {challenge.duration}d
                    </Text>
                    {isCompleted && (
                      <View style={styles.completedPill}>
                        <Text style={styles.completedPillText}>Done</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDD5CB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'DMSans', color: '#5C3D2E' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 60 },

  // ── Header ──
  header: { marginBottom: 28 },
  headerLabel: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#5C3D2E', letterSpacing: 1.2, marginBottom: 6 },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#1A0A06',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, fontFamily: 'DMSans', color: '#5C3D2E' },

  // ── Sections ──
  section: { marginBottom: 28 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#5C3D2E',
    letterSpacing: 1.2,
  },
  countPill: {
    backgroundColor: 'rgba(212,144,154,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  countPillText: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 0.3,
  },

  // ── Compact active card (one per active challenge, up to 3) ──
  activeCardCompact: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    ...shadows.sm,
  },
  activeCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  activeCompactIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(212,144,154,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCompactName: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#1A0A06',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  activeCompactMeta: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#5C3D2E',
  },
  activeCompactTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(196,90,130,0.10)',
    marginBottom: 8,
  },
  activeCompactFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#C45A82',
  },
  activeCompactDays: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: '#8C7670',
    letterSpacing: 0.1,
  },

  // ── Legacy big active card (kept for fallback / future use) ──
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.md,
  },
  activeBanner: {
    height: 110,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 21, 48, 0.2)',
  },
  bannerTextBlock: { flex: 1, zIndex: 1 },
  bannerEmoji: { position: 'absolute', top: 16, right: 20, fontSize: 32, opacity: 0.6 },
  activeName: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  activeDesc: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: 'rgba(254,250,249,0.82)',
    lineHeight: 17,
  },

  activeFooter: { padding: 16 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#5C3D2E',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#C45A82',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F4E8E0',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C45A82',
    borderRadius: 9999,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  continueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C45A82',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  continueChipText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
  },
  daysLeft: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#5C3D2E',
  },

  // ── Discover grid ──
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  discoverCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0CCBF',
    ...shadows.sm,
  },
  discoverIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  discoverName: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#1A0A06',
    lineHeight: 20,
    marginBottom: 8,
  },
  discoverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discoverInfo: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#5C3D2E',
  },
  completedPill: {
    backgroundColor: 'rgba(184,206,172,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  completedPillText: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#8FA886',
    letterSpacing: 0.3,
  },
});
