import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';

const FRIENDS = [
  { initial: 'M', color: '#F2B4CC', name: 'Maya', activity: 'Tended 3 rituals today' },
  { initial: 'L', color: '#D8C9EC', name: 'Liana', activity: '14-day Glow streak ✦' },
  { initial: 'A', color: '#FBD4BF', name: 'Ava', activity: 'Just bloomed Morning Reset' },
];

export default function GlowWithFriendsScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.main}>
          <Text style={styles.kicker}>GLOW WITH FRIENDS</Text>
          <Text style={styles.headline}>
            Glow up <Text style={styles.italic}>together</Text>.
          </Text>
          <Text style={styles.subhead}>
            Invite a friend. Cheer each other on. Watch your gardens grow side by side.
          </Text>

          <View style={styles.mockupCard}>
            <View style={styles.mockHeader}>
              <Text style={styles.mockTitle}>Your circle</Text>
              <View style={styles.mockBadge}>
                <Text style={styles.mockBadgeText}>3 GLOWING</Text>
              </View>
            </View>

            {FRIENDS.map((f) => (
              <View key={f.name} style={styles.friendRow}>
                <View style={[styles.avatar, { backgroundColor: f.color }]}>
                  <Text style={styles.avatarInitial}>{f.initial}</Text>
                </View>
                <View style={styles.friendBody}>
                  <Text style={styles.friendName}>{f.name}</Text>
                  <Text style={styles.friendActivity}>{f.activity}</Text>
                </View>
                <Text style={styles.cheer}>✦</Text>
              </View>
            ))}

            <View style={styles.shareSheet}>
              <Text style={styles.shareEyebrow}>SHARE YOUR GLOW-UP</Text>
              <Text style={styles.shareTitle}>Let someone see what you&apos;re growing</Text>
              <View style={styles.shareCtaRow}>
                <View style={styles.sharePrimary}>
                  <Text style={styles.sharePrimaryText}>Share today&apos;s glow</Text>
                </View>
                <View style={styles.shareSecondary}>
                  <Text style={styles.shareSecondaryText}>Invite a friend to grow with me</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.proofStrip}>
            <Text style={styles.proofText}>
              Better when shared — softer when shared.
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/socialproof')} />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  headline: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  italic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 24,
    marginBottom: 24,
  },

  mockupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.12)',
    shadowColor: '#3A2E2B',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 9,
    marginBottom: 18,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mockTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.2,
  },
  mockBadge: {
    backgroundColor: 'rgba(196,90,130,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mockBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#C45A82',
    letterSpacing: 1.2,
  },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(247,232,218,0.55)',
    borderRadius: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2E2B',
  },
  friendBody: { flex: 1 },
  friendName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 15,
    fontWeight: '600',
    color: '#3A2E2B',
  },
  friendActivity: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: 'rgba(58,46,43,0.62)',
    marginTop: 1,
  },
  cheer: {
    fontSize: 16,
    color: '#C45A82',
    opacity: 0.7,
  },

  shareSheet: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58,46,43,0.08)',
    alignItems: 'center',
  },
  shareEyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#C45A82',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  shareTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 16,
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  shareCtaRow: {
    width: '100%',
    gap: 8,
  },
  sharePrimary: {
    backgroundColor: '#C45A82',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sharePrimaryText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  shareSecondary: {
    backgroundColor: 'rgba(143,168,134,0.18)',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareSecondaryText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '500',
    color: '#5C7158',
    letterSpacing: 0.3,
  },

  proofStrip: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(143,168,134,0.55)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignSelf: 'center',
  },
  proofText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 19,
  },
  bottom: { paddingTop: 24 },
});
