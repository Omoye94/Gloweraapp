import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ChevronLeft } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { useTheme } from '../../../src/context';
import { getChallengeById } from '../../../src/data/challenges';
import { useChallenges } from '../../../src/hooks/useChallenges';
import { startChallenge } from '../../../src/lib/challenges';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark, gradients } = useTheme();
  const { activeChallenge, userId, refresh } = useChallenges();

  const challenge = getChallengeById(id ?? '');
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  if (!challenge) {
    return (
      <View style={[styles.container, { backgroundColor: '#FBF7F7' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: '#6B5B52' }]}>
            Challenge not found.
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.linkText, { color: '#F2B4CC' }]}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hasActiveOther =
    activeChallenge !== null && activeChallenge.catalog.id !== challenge.id;

  const handleBegin = async () => {
    if (hasActiveOther) {
      setShowSwitchModal(true);
      return;
    }
    await doStart();
  };

  const doStart = async () => {
    setIsStarting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const uc = await startChallenge(userId, challenge.id);
    if (uc) {
      await refresh();
      router.replace('/(tabs)/challenges/active');
    }
    setIsStarting(false);
  };

  const handleSwitch = async () => {
    setShowSwitchModal(false);
    await doStart();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FBF7F7' }]}>
      <LinearGradient
        colors={isDark ? gradients.lavenderBloom as [string, string, ...string[]] : ['#FFF6F2', '#EADBD4']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.backRow}>
            <ChevronLeft size={18} color={'#F2B4CC'} />
            <Text style={[styles.backText, { color: '#F2B4CC' }]}>Back</Text>
          </View>
        </Pressable>

        {/* Hero */}
        <View style={styles.heroContainer}>
          <View style={[styles.heroIcon, isDark && { backgroundColor: 'rgba(244, 198, 204, 0.15)' }]}>
            <Text style={styles.heroEmoji}>{challenge.icon}</Text>
          </View>
          <Text style={[styles.heroName, { color: '#3A2E2B' }]}>{challenge.name}</Text>
          <Text style={[styles.heroDuration, { color: '#6B5B52' }]}>
            {challenge.duration} days
          </Text>
        </View>

        {/* Description */}
        <View style={[styles.card, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
          <Text style={[styles.cardLabel, { color: '#6B5B52' }]}>About this challenge</Text>
          <Text style={[styles.descriptionText, { color: '#3A2E2B' }]}>
            {challenge.description}
          </Text>
        </View>

        {/* Daily Tasks Preview */}
        <View style={[styles.card, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
          <Text style={[styles.cardLabel, { color: '#6B5B52' }]}>Daily rituals</Text>
          {challenge.tasks.map((task, i) => (
            <View key={i} style={styles.taskRow}>
              <View style={[styles.taskBullet, { backgroundColor: '#F2B4CC' }]} />
              <Text style={[styles.taskText, { color: '#3A2E2B' }]}>{task}</Text>
            </View>
          ))}
        </View>

        {/* Reflection Prompt Preview */}
        <View style={[styles.promptCard, {
          backgroundColor: isDark ? 'rgba(244, 198, 204, 0.08)' : 'rgba(244, 198, 204, 0.08)',
          borderColor: isDark ? 'rgba(244, 198, 204, 0.2)' : 'rgba(244, 198, 204, 0.2)',
        }]}>
          <Text style={[styles.promptLabel, { color: '#F2B4CC' }]}>Daily Reflection</Text>
          <Text style={[styles.promptText, { color: '#3A2E2B' }]}>
            {challenge.reflectionPrompt}
          </Text>
        </View>

        {/* Begin Button */}
        <Pressable
          style={({ pressed }) => [
            styles.beginButton,
            { backgroundColor: '#F2B4CC' },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            isStarting && { opacity: 0.7 },
          ]}
          onPress={handleBegin}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.beginButtonText}>Begin gently</Text>
          )}
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Switch Modal */}
      <Modal visible={showSwitchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: '#3A2E2B' }]}>Switch challenge?</Text>
            <Text style={[styles.modalBody, { color: '#6B5B52' }]}>
              You're already in a gentle challenge. Start this one instead?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { borderColor: '#EDE4DC', borderWidth: 1 }]}
                onPress={() => setShowSwitchModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#6B5B52' }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#F2B4CC' }]}
                onPress={handleSwitch}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Switch</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { fontSize: 16, fontWeight: '500' },
  linkText: { fontSize: 15, fontWeight: '600', marginTop: spacing.sm },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 60 },
  backButton: { marginBottom: spacing.md },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 15, fontWeight: '600' },
  // Hero
  heroContainer: { alignItems: 'center', marginBottom: spacing.xl },
  heroIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  heroEmoji: { fontSize: 40 },
  heroName: { fontSize: 24, fontWeight: '600', letterSpacing: -0.3, textAlign: 'center' },
  heroDuration: { fontSize: 14, marginTop: spacing.xs },
  // Cards
  card: {
    borderRadius: 12, padding: spacing.lg,
    marginBottom: spacing.md, ...shadows.sm,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  descriptionText: { fontSize: 16, lineHeight: 24 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  taskBullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  taskText: { fontSize: 15, lineHeight: 22, flex: 1 },
  // Prompt
  promptCard: { borderRadius: 12, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1 },
  promptLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  promptText: { fontSize: 16, fontStyle: 'italic', lineHeight: 24 },
  // Button
  beginButton: {
    paddingVertical: spacing.md + 2, borderRadius: borderRadius.button,
    alignItems: 'center', justifyContent: 'center', ...shadows.glow,
  },
  beginButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  bottomSpacer: { height: 120 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl,
  },
  modalCard: { borderRadius: 12, padding: spacing.xl, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm },
  modalBody: { fontSize: 15, lineHeight: 22, marginBottom: spacing.lg },
  modalButtons: { flexDirection: 'row', gap: spacing.sm },
  modalButton: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.button, alignItems: 'center',
  },
  modalButtonText: { fontSize: 15, fontWeight: '600' },
});
