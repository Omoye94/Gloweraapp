import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Pressable, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlantStore, useHabitStore } from '../../../src/stores';
import { getDailyGardenMessage } from '../../../src/constants/gardenMessages';
import { STAGE_ORDER, GROWTH_THRESHOLDS, GrowthStage, COSMETIC_UNLOCKS } from '../../../src/types/plant';
import { getPrestigePoints } from '../../../src/utils/pointsCalculator';

const PLANT_STAGE_ASSETS: Record<string, any> = {
  seed:   require('../../../assets/plants/seed.png'),
  sprout: require('../../../assets/plants/sprout.png'),
  bud:    require('../../../assets/plants/bud.png'),
  bloom:  require('../../../assets/plants/bloom.png'),
  glow:   require('../../../assets/plants/glow.png'),
};

const STAGE_LABELS: Record<string, string> = {
  seed: 'Seed', sprout: 'Sprout', bud: 'Bud', bloom: 'Bloom', glow: 'Glow',
};
const STAGE_MSGS: Record<string, string> = {
  seed:   'A tiny beginning holds infinite potential.',
  sprout: 'Your first steps are already remarkable.',
  bud:    'You are quietly becoming something beautiful.',
  bloom:  'Your consistency is in full flower.',
  glow:   "You radiate the glow you've tended so carefully.",
};

const STAGE_COLORS: Record<string, string> = {
  seed: '#D8C9EC', sprout: '#B8CFB1', bud: '#F2B4CC', bloom: '#E87FA6', glow: '#C45A82',
};

function StageChip({ stageName, asset, reached, isCurrent }: {
  stageName: string; asset: any; reached: boolean; isCurrent: boolean;
}) {
  const pulse   = useRef(new Animated.Value(1)).current;
  const glowOp  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!isCurrent) return;
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(pulse,  { toValue: 1.07, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 1,    duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse,  { toValue: 1,    duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.5,  duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ])).start();
  }, [isCurrent]);

  const accentColor = STAGE_COLORS[stageName] ?? '#C45A82';
  const size = isCurrent ? 90 : 68;
  const radius = isCurrent ? 26 : 20;

  return (
    <View style={chipStyles.col}>
      {/* Glow halo behind current stage */}
      {isCurrent && (
        <Animated.View style={[chipStyles.halo, { opacity: glowOp, backgroundColor: accentColor, width: size + 24, height: size + 24, borderRadius: (size + 24) / 2 }]} />
      )}

      <Animated.View style={[
        chipStyles.wrap,
        { width: size, height: size, borderRadius: radius },
        isCurrent && { borderColor: accentColor, borderWidth: 3, transform: [{ scale: pulse }] },
        reached && !isCurrent && { borderColor: '#F2B4CC', borderWidth: 2 },
        !reached && chipStyles.wrapLocked,
      ]}>
        <Image source={asset} style={chipStyles.img} resizeMode="cover" />

        {/* Dim overlay for locked stages */}
        {!reached && <View style={chipStyles.dimOverlay} />}

        {/* Lock badge */}
        {!reached && (
          <View style={chipStyles.badge}>
            <Text style={chipStyles.badgeLock}>🔒</Text>
          </View>
        )}

        {/* Done badge */}
        {reached && !isCurrent && (
          <View style={[chipStyles.badge, { backgroundColor: '#C45A82' }]}>
            <Text style={chipStyles.badgeCheck}>✓</Text>
          </View>
        )}
      </Animated.View>

      <Text style={[chipStyles.label, isCurrent && { color: accentColor, fontWeight: '700' }, reached && !isCurrent && { color: '#C45A82' }]}>
        {stageName.toUpperCase()}
      </Text>

      {isCurrent && (
        <View style={[chipStyles.nowPill, { backgroundColor: accentColor }]}>
          <Text style={chipStyles.nowText}>NOW</Text>
        </View>
      )}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  col:        { alignItems: 'center', gap: 6, width: 96 },
  halo:       { position: 'absolute', top: -12, opacity: 0.2 },
  wrap: {
    overflow: 'hidden',
    borderWidth: 2, borderColor: '#EADBD4',
    shadowColor: '#C4A99A', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  wrapLocked: { borderColor: '#EADBD4' },
  img:        { width: '100%', height: '100%' },
  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(237,213,203,0.55)' },
  badge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(200,200,200,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeLock:  { fontSize: 9 },
  badgeCheck: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  label:      { fontFamily: 'SpaceMono-Bold', fontSize: 9, color: '#B8A9A5', letterSpacing: 0.5 },
  nowPill:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  nowText:    { fontFamily: 'SpaceMono-Bold', fontSize: 8, color: '#FFFFFF', letterSpacing: 0.5 },
});

function getProgressPercent(stage: string, points: number): number {
  const stageIdx = STAGE_ORDER.indexOf(stage as any);
  const nextStage = STAGE_ORDER[stageIdx + 1];
  if (!nextStage) return 100;
  const current = GROWTH_THRESHOLDS[stage as GrowthStage] ?? 0;
  const next = GROWTH_THRESHOLDS[nextStage];
  if (next <= current) return 100;
  return Math.min(100, Math.round(((points - current) / (next - current)) * 100));
}

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const plant = usePlantStore(s => s.plant);
  const dailySummaries = useHabitStore(s => s.dailySummaries);

  const stage = plant.currentStage;
  const streak = plant.streak.currentStreak;
  const longestStreak = plant.streak.longestStreak;
  const progressPercent = getProgressPercent(stage, plant.totalLifetimePoints);
  const dailyMessage = getDailyGardenMessage(stage);

  const prestigePts = getPrestigePoints(plant.totalLifetimePoints);
  const unlockedIds = plant.unlockedCosmetics ?? [];
  const nextReward  = COSMETIC_UNLOCKS.find(r => !unlockedIds.includes(r.id));
  const prevReward  = [...COSMETIC_UNLOCKS].reverse().find(r => unlockedIds.includes(r.id));
  const prestigeBarFrom = prevReward?.prestigePointsRequired ?? 0;
  const prestigeBarTo   = nextReward?.prestigePointsRequired ?? prestigePts;
  const prestigeBarPct  = prestigeBarTo > prestigeBarFrom
    ? Math.min(100, Math.round(((prestigePts - prestigeBarFrom) / (prestigeBarTo - prestigeBarFrom)) * 100))
    : 100;

  const thisWeekCount = (() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dailySummaries[key] && Object.keys(dailySummaries[key].completions).length > 0) count++;
    }
    return count;
  })();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>INNER GARDEN</Text>
          <Text style={styles.headerTitle}>Nurturing your ritual</Text>
        </View>

        {/* Plant area */}
        <View style={styles.plantArea}>
          <View style={styles.glowBlob} />
          <View style={styles.plantCard}>
            <Image
              source={PLANT_STAGE_ASSETS[stage] || PLANT_STAGE_ASSETS.seed}
              style={styles.plantImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.stageMeta}>
            <Text style={styles.stageName}>{STAGE_LABELS[stage]} Stage</Text>
            <Text style={styles.stageMsg}>{STAGE_MSGS[stage]}</Text>
          </View>
        </View>

        {/* Glow Meter Card */}
        <View style={styles.sectionPad}>
          <View style={styles.card}>
            <View style={styles.glowHeader}>
              <View>
                <Text style={styles.monoLabel}>GLOW METER</Text>
                <Text style={styles.glowStageName}>{STAGE_LABELS[stage]} Stage</Text>
              </View>
              <Text style={styles.glowPct}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#F2B4CC', '#E87FA6', '#9B86D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPercent}%` as any }]}
              />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.monoLabelSm}>STREAK</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.monoLabelSm}>THIS WEEK</Text>
            <Text style={styles.statValue}>{thisWeekCount}/7</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.monoLabelSm}>BEST</Text>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
        </View>

        {/* Growth Journey */}
        <View style={styles.journeySection}>
          <Text style={styles.journeyLabel}>GROWTH JOURNEY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.journeyScroll}>
            {STAGE_ORDER.map((s, idx) => {
              const reached    = plant.totalLifetimePoints >= GROWTH_THRESHOLDS[s];
              const isCurrent  = stage === s;
              const nextReached = idx < STAGE_ORDER.length - 1
                && plant.totalLifetimePoints >= GROWTH_THRESHOLDS[STAGE_ORDER[idx + 1]];
              return (
                <React.Fragment key={s}>
                  <StageChip
                    stageName={s}
                    asset={PLANT_STAGE_ASSETS[s]}
                    reached={reached}
                    isCurrent={isCurrent}
                  />
                  {idx < STAGE_ORDER.length - 1 && (
                    <View style={styles.connector}>
                      <View style={[styles.connectorLine, reached && nextReached && styles.connectorLineDone]} />
                      <View style={[styles.connectorDot, reached && styles.connectorDotDone]} />
                      <View style={[styles.connectorLine, reached && nextReached && styles.connectorLineDone]} />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>

        {/* Prestige Rewards — visible at Glow stage */}
        {stage === 'glow' && (
          <View style={styles.prestigeSection}>
            <View style={styles.prestigeHeader}>
              <Text style={styles.journeyLabel}>GLOW ERA · PRESTIGE REWARDS</Text>
              <View style={styles.prestigePtsPill}>
                <Text style={styles.prestigePtsPillText}>✦ {prestigePts.toLocaleString()} pts</Text>
              </View>
            </View>

            {/* Progress toward next reward */}
            <View style={[styles.card, styles.prestigeProgressCard]}>
              {nextReward ? (
                <>
                  <View style={styles.prestigeProgressRow}>
                    <Text style={styles.prestigeProgressLabel}>Next: {nextReward.emoji} {nextReward.name}</Text>
                    <Text style={styles.prestigeProgressPct}>{prestigeBarPct}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={['#F2B4CC', '#C45A82', '#9B86D4']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${prestigeBarPct}%` as any }]}
                    />
                  </View>
                  <Text style={styles.prestigeHint}>
                    {(nextReward.prestigePointsRequired - prestigePts).toLocaleString()} more pts to unlock
                  </Text>
                </>
              ) : (
                <Text style={styles.prestigeAllDone}>You've unlocked every reward. You are glowing at full power ✦</Text>
              )}
            </View>

            {/* Reward tiles */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rewardScroll}
            >
              {COSMETIC_UNLOCKS.map(reward => {
                const unlocked = unlockedIds.includes(reward.id);
                return (
                  <View
                    key={reward.id}
                    style={[styles.rewardTile, unlocked && styles.rewardTileUnlocked]}
                  >
                    <View style={[styles.rewardEmojiWrap, unlocked && styles.rewardEmojiWrapUnlocked]}>
                      <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                      {!unlocked && <View style={styles.rewardDimOverlay} />}
                    </View>
                    <Text style={[styles.rewardName, unlocked && styles.rewardNameUnlocked]} numberOfLines={1}>
                      {reward.name}
                    </Text>
                    <Text style={styles.rewardType}>{reward.type.replace('_', ' ')}</Text>
                    {unlocked ? (
                      <View style={styles.rewardUnlockedBadge}>
                        <Text style={styles.rewardUnlockedText}>Unlocked ✓</Text>
                      </View>
                    ) : (
                      <Text style={styles.rewardPtsNeeded}>
                        {reward.prestigePointsRequired.toLocaleString()} pts
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quote gradient card */}
        <View style={styles.sectionPad}>
          <LinearGradient
            colors={['rgba(216,201,236,0.5)', 'rgba(251,212,191,0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteCard}
          >
            <Text style={styles.quoteText}>"{dailyMessage}"</Text>
          </LinearGradient>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDD5CB' },

  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 8 },
  headerLabel: { fontFamily: 'SpaceMono-Bold', fontSize: 10, color: '#5C3D2E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  headerTitle: { fontFamily: 'Raleway-SemiBold', fontSize: 28, fontWeight: '500', color: '#1A0A06', letterSpacing: -0.3, textAlign: 'center' },

  plantArea: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 0, position: 'relative' },
  glowBlob: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(242,180,204,0.3)', top: 20,
  },
  plantCard: {
    width: 240, height: 240, borderRadius: 40, overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#C4A99A', shadowOpacity: 0.14,
    shadowRadius: 60, shadowOffset: { width: 0, height: 20 },
  },
  plantImage: { width: '100%', height: '100%' },
  stageMeta: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  stageName: { fontFamily: 'Raleway-SemiBold', fontSize: 22, fontWeight: '600', color: '#1A0A06' },
  stageMsg: { fontFamily: 'DMSans', fontSize: 14, color: '#5C3D2E', fontStyle: 'italic', marginTop: 4, lineHeight: 20, textAlign: 'center' },

  sectionPad: { paddingHorizontal: 24, paddingTop: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    shadowColor: '#C4A99A', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 2 },
  },
  monoLabel: { fontFamily: 'SpaceMono-Bold', fontSize: 10, color: '#5C3D2E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  monoLabelSm: { fontFamily: 'SpaceMono-Bold', fontSize: 8, color: '#5C3D2E', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  glowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  glowStageName: { fontFamily: 'Raleway-SemiBold', fontSize: 17, fontWeight: '500', color: '#C45A82' },
  glowPct: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '500', color: '#5C3D2E' },
  progressTrack: { height: 10, backgroundColor: 'rgba(242,180,204,0.2)', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 12 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12,
    backgroundColor: '#FFFFFF', borderRadius: 24,
    shadowColor: '#C4A99A', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontFamily: 'Raleway-SemiBold', fontSize: 22, fontWeight: '600', color: '#1A0A06', lineHeight: 26 },
  statUnit: { fontFamily: 'DMSans', fontSize: 11, color: '#5C3D2E', marginTop: 2 },

  journeySection: { paddingHorizontal: 24, paddingTop: 20 },
  journeyLabel: { fontFamily: 'SpaceMono-Bold', fontSize: 10, color: '#5C3D2E', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20 },
  journeyScroll: { alignItems: 'center', paddingBottom: 12, paddingHorizontal: 4 },
  connector: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 28 },
  connectorLine: { width: 10, height: 2, backgroundColor: '#EADBD4', borderRadius: 1 },
  connectorLineDone: { backgroundColor: '#F2B4CC' },
  connectorDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#EADBD4' },
  connectorDotDone: { backgroundColor: '#C45A82' },

  quoteCard: { borderRadius: 20, padding: 20, alignItems: 'center' },
  quoteText: { fontFamily: 'Raleway-SemiBold', fontSize: 15, color: '#5C3D2E', textAlign: 'center', lineHeight: 24 },

  // Prestige
  prestigeSection: { paddingHorizontal: 24, paddingTop: 20 },
  prestigeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  prestigePtsPill: {
    backgroundColor: '#C45A82', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  prestigePtsPillText: { fontFamily: 'SpaceMono-Bold', fontSize: 10, color: '#FFFFFF', letterSpacing: 0.3 },
  prestigeProgressCard: { marginBottom: 14 },
  prestigeProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  prestigeProgressLabel: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '600', color: '#1A0A06' },
  prestigeProgressPct: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '600', color: '#C45A82' },
  prestigeHint: { fontFamily: 'DMSans', fontSize: 12, color: '#5C3D2E', marginTop: 8 },
  prestigeAllDone: { fontFamily: 'DMSans', fontSize: 14, color: '#C45A82', fontWeight: '600', textAlign: 'center', paddingVertical: 4 },

  rewardScroll: { gap: 10, paddingBottom: 4 },
  rewardTile: {
    width: 120, padding: 14, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E0CCBF',
    alignItems: 'center', gap: 6,
    shadowColor: '#C4A99A', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  rewardTileUnlocked: { borderColor: '#C45A82', backgroundColor: '#FFF5F9' },
  rewardEmojiWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(196,90,130,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  rewardEmojiWrapUnlocked: { backgroundColor: 'rgba(196,90,130,0.15)' },
  rewardEmoji: { fontSize: 26 },
  rewardDimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(237,213,203,0.6)', borderRadius: 16 },
  rewardName: { fontFamily: 'DMSans', fontSize: 12, fontWeight: '600', color: '#6B4A38', textAlign: 'center' },
  rewardNameUnlocked: { color: '#1A0A06' },
  rewardType: { fontFamily: 'SpaceMono-Bold', fontSize: 8, color: '#B8A9A5', letterSpacing: 0.4, textTransform: 'uppercase' },
  rewardUnlockedBadge: {
    backgroundColor: '#C45A82', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  rewardUnlockedText: { fontFamily: 'DMSans', fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  rewardPtsNeeded: { fontFamily: 'DMSans', fontSize: 11, color: '#6B4A38' },
});
