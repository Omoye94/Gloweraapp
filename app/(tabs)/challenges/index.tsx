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
  'glow-up-7':         { icon: 'star-bold-duotone',    bg: 'rgba(254,201,180,0.26)' },
  'glow-up-30':        { icon: 'star-bold-duotone',    bg: 'rgba(244,198,204,0.24)' },
  'glow-up-60':        { icon: 'star-bold-duotone',    bg: 'rgba(212,144,154,0.22)' },
  'glow-up-90':        { icon: 'star-bold-duotone',    bg: 'rgba(196,90,130,0.22)' },
};

function getChallengeIconMeta(id: string) {
  return CHALLENGE_ICON_MAP[id] ?? { icon: 'star-bold-duotone', bg: 'rgba(212,144,154,0.18)' };
}

// Rotating accent colors for discover-grid card edges + shadows.
const DISCOVER_ACCENTS = ['#C45A82', '#7C66B8', '#D17A4D', '#6F8B6A'];

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
  // Split into short (< 30 days) and multi-month (>= 30 days) journeys.
  const shortChallenges = discoverChallenges.filter((c) => c.duration < 30);
  const longChallenges = discoverChallenges.filter((c) => c.duration >= 30);

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
        {shortChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>discover new</Text>

            <View style={styles.discoverGrid}>
              {shortChallenges.map((challenge, idx) => {
                const meta = getChallengeIconMeta(challenge.id);
                const isCompleted = completedIds.includes(challenge.id);
                const accent = DISCOVER_ACCENTS[idx % DISCOVER_ACCENTS.length];
                return (
                  <Pressable
                    key={challenge.id}
                    style={({ pressed }) => [
                      styles.discoverCard,
                      { borderLeftWidth: 6, borderLeftColor: accent, shadowColor: accent },
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
        )}

        {/* ── Multi-Month Journeys ── */}
        {longChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>multi-month journeys</Text>
              <View style={styles.deepPill}>
                <Text style={styles.deepPillText}>for the long game</Text>
              </View>
            </View>
            <Text style={styles.sectionLead}>
              Deeper commitments. Habits become who you are by the end.
            </Text>

            <View style={styles.longList}>
              {longChallenges.map((challenge, idx) => {
                const meta = getChallengeIconMeta(challenge.id);
                const isCompleted = completedIds.includes(challenge.id);
                const accent = DISCOVER_ACCENTS[idx % DISCOVER_ACCENTS.length];
                return (
                  <Pressable
                    key={challenge.id}
                    style={({ pressed }) => [
                      styles.longCard,
                      { borderLeftColor: accent, shadowColor: accent },
                      pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                    ]}
                    onPress={() => router.push(`/(tabs)/challenges/${challenge.id}`)}
                  >
                    <View style={styles.longCardTop}>
                      <View style={[styles.longCardIconBox, { backgroundColor: meta.bg }]}>
                        <Text style={{ fontSize: 30 }}>{challenge.icon}</Text>
                      </View>
                      <View style={styles.longCardHead}>
                        <Text style={styles.longCardName}>{challenge.name}</Text>
                        <View style={styles.longCardMetaRow}>
                          <View style={[styles.longCardDayPill, { borderColor: accent }]}>
                            <Text style={[styles.longCardDayText, { color: accent }]}>
                              {challenge.duration} DAYS
                            </Text>
                          </View>
                          <Text style={styles.longCardSubmeta}>
                            {challenge.tasks.length} daily rituals
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.longCardDesc} numberOfLines={3}>
                      {challenge.description}
                    </Text>

                    <View style={styles.longCardFooter}>
                      {isCompleted ? (
                        <View style={styles.completedPill}>
                          <Text style={styles.completedPillText}>Completed</Text>
                        </View>
                      ) : (
                        <View style={[styles.longCardCta, { backgroundColor: accent }]}>
                          <Text style={styles.longCardCtaText}>Begin journey →</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

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
  headerLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.4,
    marginBottom: 4,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(58,46,43,0.75)',
  },

  // ── Sections ──
  section: { marginBottom: 28 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
  },
  countPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.32)',
    shadowColor: '#C45A82',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    borderLeftWidth: 6,
    borderLeftColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  activeCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  activeCompactIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(232,127,166,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,127,166,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCompactName: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  activeCompactMeta: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
  },
  activeCompactTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(196,90,130,0.14)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  activeCompactFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#C45A82',
  },
  activeCompactDays: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.7)',
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
    gap: 14,
  },
  discoverCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  discoverIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  discoverName: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 20,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  discoverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  discoverInfo: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
  },
  completedPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#6F8B6A',
  },
  completedPillText: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#6F8B6A',
    letterSpacing: 0.6,
  },

  // ── Multi-month section ──
  deepPill: {
    backgroundColor: '#1A1028',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    shadowColor: '#1A1028',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  deepPillText: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#FEFAF9',
    letterSpacing: 0.2,
  },
  sectionLead: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 20,
    marginBottom: 16,
    marginTop: -6,
  },
  longList: {
    gap: 14,
  },
  longCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    borderLeftWidth: 8,
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  longCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  longCardIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  longCardHead: { flex: 1 },
  longCardName: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  longCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  longCardDayPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  longCardDayText: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    letterSpacing: 1.4,
  },
  longCardSubmeta: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(58,46,43,0.6)',
    letterSpacing: 0.2,
  },
  longCardDesc: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 20,
    marginBottom: 14,
  },
  longCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  longCardCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  longCardCtaText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
