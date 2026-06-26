import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

type Milestone = {
  day: string;
  badge: string;
  title: string;
  achievement: string;
  outcome: string;
  highlight?: boolean;
};

const MILESTONES: Milestone[] = [
  {
    day: 'DAY 7',
    badge: '🌱',
    title: 'First Bloom',
    achievement: 'Your hardest week is over',
    outcome:
      "The rhythm starts to feel natural. Most people who reach day 7 keep going.",
  },
  {
    day: 'DAY 21',
    badge: '🌿',
    title: 'Rooted',
    achievement: 'You notice the change',
    outcome:
      'Three weeks in, your energy and clarity start to compound — quietly, daily.',
  },
  {
    day: 'DAY 30',
    badge: '🌸',
    title: 'Visible Glow',
    achievement: 'Your garden blooms',
    outcome:
      "Re-read your first reflection. You'll see how much you've grown without trying.",
  },
  {
    day: 'DAY 66',
    badge: '✨',
    title: 'Habit Complete',
    achievement: 'It becomes who you are',
    outcome:
      "Research-backed: 66 days is when a new habit becomes automatic. You're here for good.",
    highlight: true,
  },
];

export default function VisionScreen() {
  const router = useRouter();
  const { selected_rituals, garden_name } = useOnboardingStore();
  const gardenName = garden_name?.trim() || 'Your garden';
  const ritualCount = selected_rituals.length || 1;
  const totalActs = ritualCount * 66;

  return (
    <OnboardingScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <Text style={styles.label}>YOUR 66-DAY JOURNEY</Text>
          <Text style={styles.title}>
            Imagine <Text style={styles.titleItalic}>66 days</Text> from now.
          </Text>
          <Text style={styles.subhead}>
            Here&apos;s what {gardenName} blooms into when you tend it gently — day by day.
          </Text>

          <View style={styles.timeline}>
            {MILESTONES.map((m, index) => (
              <View key={m.day} style={styles.timelineItem}>
                {/* Vertical connector line */}
                {index < MILESTONES.length - 1 && <View style={styles.timelineLine} />}

                {/* Badge circle */}
                <View
                  style={[
                    styles.badgeCircle,
                    m.highlight && styles.badgeCircleHighlight,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>{m.badge}</Text>
                </View>

                {/* Content card */}
                <View
                  style={[
                    styles.milestoneCard,
                    m.highlight && styles.milestoneCardHighlight,
                  ]}
                >
                  <View style={styles.milestoneHeader}>
                    <Text
                      style={[
                        styles.milestoneDay,
                        m.highlight && styles.milestoneDayHighlight,
                      ]}
                    >
                      {m.day}
                    </Text>
                    <View style={styles.milestoneBadgeChip}>
                      <Text style={styles.milestoneBadgeChipText}>
                        {m.highlight ? '🏆 EARNED' : 'BADGE'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.milestoneTitle}>{m.title}</Text>
                  <Text style={styles.milestoneAchievement}>{m.achievement}</Text>
                  <Text style={styles.milestoneOutcome}>{m.outcome}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Total achievement card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalEyebrow}>BY THE END</Text>
            <View style={styles.totalRow}>
              <View style={styles.totalCol}>
                <Text style={styles.totalNumber}>{totalActs}</Text>
                <Text style={styles.totalLabel}>acts of{'\n'}self-care</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalCol}>
                <Text style={styles.totalNumber}>4</Text>
                <Text style={styles.totalLabel}>milestone{'\n'}badges</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalCol}>
                <Text style={styles.totalNumber}>1</Text>
                <Text style={styles.totalLabel}>fully bloomed{'\n'}garden</Text>
              </View>
            </View>
          </View>

          {/* Research citation strip */}
          <View style={styles.citationStrip}>
            <Text style={styles.citationSource}>
              Based on habit-formation research by University College London (Lally et al., 2009).
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title="Show me how to start"
            onPress={() => router.push('/(onboarding)/dailyglow')}
          />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  main: { flex: 1, paddingTop: 8 },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  titleItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 24,
    marginBottom: 28,
  },

  // Timeline
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 21,
    top: 44,
    bottom: -14,
    width: 2.5,
    backgroundColor: 'rgba(196,90,130,0.45)',
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#C45A82',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C45A82',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    zIndex: 1,
  },
  badgeCircleHighlight: {
    backgroundColor: '#FFF5F8',
    borderColor: '#9B86D4',
    borderWidth: 3,
    shadowColor: '#9B86D4',
    shadowOpacity: 0.55,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  badgeEmoji: { fontSize: 22 },
  milestoneCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.26)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.26,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
  milestoneCardHighlight: {
    borderColor: '#9B86D4',
    borderWidth: 3,
    shadowColor: '#9B86D4',
    shadowOpacity: 0.42,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneDay: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.4,
  },
  milestoneDayHighlight: {
    color: '#9B86D4',
  },
  milestoneBadgeChip: {
    backgroundColor: 'rgba(247,232,218,0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  milestoneBadgeChipText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 8,
    color: 'rgba(58,46,43,0.65)',
    letterSpacing: 0.8,
  },
  milestoneTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  milestoneAchievement: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
    marginBottom: 6,
  },
  milestoneOutcome: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 19,
  },

  // Total achievement card
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.28)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#C45A82',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  totalEyebrow: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  totalCol: {
    flex: 1,
    alignItems: 'center',
  },
  totalDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(58,46,43,0.12)',
  },
  totalNumber: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '700',
    color: '#3A2E2B',
    letterSpacing: -0.6,
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(58,46,43,0.6)',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Citation
  citationStrip: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  citationSource: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.5)',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  bottom: { paddingTop: 24 },
});
