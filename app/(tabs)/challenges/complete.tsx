import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { useTheme } from '../../../src/context';
import { getChallengeById } from '../../../src/data/challenges';

export default function ChallengeCompleteScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { challengeId } = useLocalSearchParams<{ challengeId?: string }>();

  const catalog = challengeId ? getChallengeById(challengeId) : null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/challenges');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FBF7F7' }]}>
      <LinearGradient
        colors={isDark
          ? ['rgba(244, 198, 204, 0.15)', 'rgba(244, 198, 204, 0.08)']
          : ['#FFF6F2', '#EADBD4']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Icon */}
        {catalog && (
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(158, 207, 176, 0.15)' : 'rgba(158, 207, 176, 0.2)' }]}>
            <Text style={styles.iconEmoji}>{catalog.icon}</Text>
          </View>
        )}

        {!catalog && <Sparkles size={64} color={'#F2B4CC'} style={{ marginBottom: spacing.lg }} />}

        <Text style={[styles.title, { color: '#3A2E2B' }]}>
          Beautifully done
        </Text>

        {catalog && (
          <Text style={[styles.challengeName, { color: '#F2B4CC' }]}>
            {catalog.name}
          </Text>
        )}

        {catalog ? (
          <Text style={[styles.message, { color: '#6B5B52' }]}>
            {catalog.completionMessage}
          </Text>
        ) : (
          <Text style={[styles.message, { color: '#6B5B52' }]}>
            You completed a challenge with grace. Be proud of yourself.
          </Text>
        )}

        {/* Stats card */}
        {catalog && (
          <View style={[styles.statsCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
            borderColor: '#EDE4DC',
          }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F2B4CC' }]}>{catalog.duration}</Text>
              <Text style={[styles.statLabel, { color: '#B8A99E' }]}>days</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: '#EDE4DC' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F2B4CC' }]}>2</Text>
              <Text style={[styles.statLabel, { color: '#B8A99E' }]}>daily rituals</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: '#EDE4DC' }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.accent }]}>1</Text>
              <Text style={[styles.statLabel, { color: '#B8A99E' }]}>challenge done</Text>
            </View>
          </View>
        )}

        <View style={[styles.glowCard, {
          backgroundColor: isDark ? 'rgba(158, 207, 176, 0.12)' : 'rgba(158, 207, 176, 0.15)',
          borderColor: isDark ? 'rgba(158, 207, 176, 0.25)' : 'rgba(158, 207, 176, 0.3)',
        }]}>
          <Sparkles size={20} color={'#F2B4CC'} />
          <Text style={[styles.glowText, { color: '#3A2E2B' }]}>
            Your consistency is your glow.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: '#F2B4CC' },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleBack}
        >
          <Text style={styles.ctaText}>Back to Challenges</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { ...StyleSheet.absoluteFillObject },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  iconEmoji: { fontSize: 44 },
  title: { fontSize: 28, fontWeight: '300', letterSpacing: -0.5, marginBottom: spacing.xs, textAlign: 'center' },
  challengeName: { fontSize: 16, fontWeight: '600', marginBottom: spacing.md, textAlign: 'center' },
  message: { fontSize: 17, lineHeight: 26, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  // Stats
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl, width: '100%',
    ...shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, height: 32 },
  // Glow card
  glowCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg, borderRadius: 12,
    borderWidth: 1, marginBottom: spacing.xl, gap: spacing.sm,
  },
  glowText: { fontSize: 15, fontWeight: '500' },
  ctaButton: {
    paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.button, ...shadows.glow,
  },
  ctaText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
