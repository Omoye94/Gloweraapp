import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Flame, Sparkles, Lock } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { POINT_VALUES, DAILY_ACTION_CAP, STREAK_MILESTONES, SHOW_UP_BONUS_TIERS } from '../../../src/utils/pointsCalculator';
import { GROWTH_THRESHOLDS, STAGE_ORDER, STAGE_NAMES, COSMETIC_UNLOCKS } from '../../../src/types/plant';

const STAGE_EMOJI: Record<string, string> = {
  seed: '\uD83C\uDF30',
  sprout: '\uD83C\uDF31',
  bud: '\uD83C\uDF3F',
  bloom: '\uD83C\uDF38',
  glow: '\uD83C\uDF3A',
};

const ACTION_ROWS = [
  { label: 'Gentle habit completion', points: POINT_VALUES.habitGentleCompletion },
  { label: 'Full habit completion', points: POINT_VALUES.habitFullCompletion },
  { label: 'All habits fully done', points: POINT_VALUES.fullDayBonus },
  { label: 'Journal entry', points: POINT_VALUES.journalEntry },
  { label: 'Daily reflection', points: POINT_VALUES.dailyReflection },
  { label: 'Weekly reflection', points: POINT_VALUES.weeklyReflection },
  { label: 'Challenge day complete', points: POINT_VALUES.challengeDayComplete },
  { label: 'Full challenge complete', points: POINT_VALUES.challengeFullComplete },
];

export default function PointsGuideScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF6F2', '#EADBD4']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Close Button */}
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
        onPress={() => router.back()}
      >
        <X size={20} color="#6B5B52" />
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How Points Work</Text>
          <Text style={styles.subtitle}>
            Your garden grows through daily consistency. Points accumulate over the year and reset each January.
          </Text>
        </View>

        {/* Action Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EARNING POINTS</Text>
          <View style={styles.card}>
            {ACTION_ROWS.map((row, i) => (
              <View
                key={row.label}
                style={[styles.pointRow, i < ACTION_ROWS.length - 1 && styles.pointRowBorder]}
              >
                <Text style={styles.pointLabel}>{row.label}</Text>
                <Text style={styles.pointValue}>+{row.points}</Text>
              </View>
            ))}
            <View style={styles.capBanner}>
              <Text style={styles.capText}>
                Daily cap: {DAILY_ACTION_CAP} action points per day
              </Text>
            </View>
          </View>
        </View>

        {/* Show-up Bonus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHOW-UP BONUS</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Complete any action to earn a daily show-up bonus. The longer your streak, the bigger the bonus.
            </Text>
            {SHOW_UP_BONUS_TIERS.slice().reverse().map((tier, i) => (
              <View
                key={tier.minStreak}
                style={[styles.pointRow, i < SHOW_UP_BONUS_TIERS.length - 1 && styles.pointRowBorder]}
              >
                <Text style={styles.pointLabel}>
                  {tier.minStreak === 0
                    ? 'Days 1\u20136'
                    : tier.minStreak === 7
                      ? 'Days 7\u201313'
                      : tier.minStreak === 14
                        ? 'Days 14\u201329'
                        : 'Days 30+'}
                </Text>
                <Text style={styles.pointValue}>+{tier.bonus}/day</Text>
              </View>
            ))}
            <View style={styles.noCap}>
              <Flame size={14} color="#E8946A" />
              <Text style={styles.noCapText}>Not subject to daily cap</Text>
            </View>
          </View>
        </View>

        {/* Streak Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STREAK MILESTONES</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Hit a streak milestone and earn a one-time bonus. Missing a full day resets your streak.
            </Text>
            {STREAK_MILESTONES.map((milestone, i) => (
              <View
                key={milestone.days}
                style={[styles.pointRow, i < STREAK_MILESTONES.length - 1 && styles.pointRowBorder]}
              >
                <View style={styles.milestoneLabel}>
                  <Flame size={14} color="#E8946A" />
                  <Text style={styles.pointLabel}>{milestone.days} day streak</Text>
                </View>
                <Text style={[styles.pointValue, styles.milestoneValue]}>+{milestone.bonus}</Text>
              </View>
            ))}
            <View style={styles.noCap}>
              <Flame size={14} color="#E8946A" />
              <Text style={styles.noCapText}>Not subject to daily cap</Text>
            </View>
          </View>
        </View>

        {/* Growth Stages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GROWTH STAGES</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              As you accumulate points, your plant grows through five stages over the year.
            </Text>
            {STAGE_ORDER.map((stage, i) => (
              <View
                key={stage}
                style={[styles.stageRow, i < STAGE_ORDER.length - 1 && styles.pointRowBorder]}
              >
                <Text style={styles.stageEmoji}>{STAGE_EMOJI[stage]}</Text>
                <View style={styles.stageInfo}>
                  <Text style={styles.stageName}>{STAGE_NAMES[stage]}</Text>
                  <Text style={styles.stageThreshold}>
                    {GROWTH_THRESHOLDS[stage].toLocaleString()} points
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Cosmetic Unlocks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COSMETIC UNLOCKS</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              After reaching Glow, keep earning to unlock cosmetics for your garden. Points above {GROWTH_THRESHOLDS.glow.toLocaleString()} are "prestige points."
            </Text>
            {COSMETIC_UNLOCKS.map((cosmetic, i) => (
              <View
                key={cosmetic.id}
                style={[styles.cosmeticRow, i < COSMETIC_UNLOCKS.length - 1 && styles.pointRowBorder]}
              >
                <Text style={styles.cosmeticEmoji}>{cosmetic.emoji}</Text>
                <View style={styles.cosmeticInfo}>
                  <Text style={styles.cosmeticName}>{cosmetic.name}</Text>
                  <Text style={styles.cosmeticDesc}>{cosmetic.description}</Text>
                </View>
                <Text style={styles.cosmeticPts}>
                  +{cosmetic.prestigePointsRequired.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <View style={styles.tipsCard}>
            <Sparkles size={18} color="#F2B4CC" />
            <Text style={styles.tipsText}>
              Consistency matters more than volume. Showing up daily builds your streak, which earns uncapped bonuses far exceeding the daily action cap.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F7',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 24,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: '#3A2E2B',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B5B52',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A2E2B',
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B5B52',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  pointRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDE4DC',
  },
  pointLabel: {
    fontSize: 14,
    color: '#3A2E2B',
    flex: 1,
  },
  pointValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F2B4CC',
    minWidth: 50,
    textAlign: 'right',
  },
  milestoneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  milestoneValue: {
    color: '#E8946A',
  },
  capBanner: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(244, 198, 204, 0.08)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  capText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B5B52',
  },
  noCap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  noCapText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E8946A',
  },
  // Stages
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  stageEmoji: {
    fontSize: 28,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A2E2B',
  },
  stageThreshold: {
    fontSize: 13,
    color: '#B8A99E',
    marginTop: 2,
  },
  // Cosmetics
  cosmeticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  cosmeticEmoji: {
    fontSize: 24,
  },
  cosmeticInfo: {
    flex: 1,
  },
  cosmeticName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2E2B',
  },
  cosmeticDesc: {
    fontSize: 12,
    color: '#B8A99E',
    marginTop: 2,
  },
  cosmeticPts: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F2B4CC',
  },
  // Tips
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 198, 204, 0.08)',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  tipsText: {
    fontSize: 14,
    color: '#6B5B52',
    lineHeight: 20,
    flex: 1,
  },
  bottomSpacer: {
    height: 60,
  },
});
