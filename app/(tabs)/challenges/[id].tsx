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
  const { activeChallenges, isAtCap, userId, refresh } = useChallenges();

  const challenge = getChallengeById(id ?? '');
  const [showCapModal, setShowCapModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const alreadyActive = activeChallenges.some(
    (a) => a.catalog.id === (challenge?.id ?? '')
  );

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

  const handleBegin = async () => {
    if (alreadyActive) {
      // Already in this exact challenge — drop into the active view.
      router.replace('/(tabs)/challenges/active');
      return;
    }
    if (isAtCap) {
      setShowCapModal(true);
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
          <Text style={[styles.cardLabel, { color: '#6B5B52' }]}>about this challenge</Text>
          <Text style={[styles.descriptionText, { color: '#3A2E2B' }]}>
            {challenge.description}
          </Text>
        </View>

        {/* Daily Tasks Preview */}
        <View style={[styles.card, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
          <Text style={[styles.cardLabel, { color: '#6B5B52' }]}>daily rituals</Text>
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
          <Text style={[styles.promptLabel, { color: '#F2B4CC' }]}>daily reflection</Text>
          <Text style={[styles.promptText, { color: '#3A2E2B' }]}>
            {challenge.reflectionPrompt}
          </Text>
        </View>

        {/* Begin Button */}
        <Pressable
          style={({ pressed }) => [
            styles.beginButton,
            { backgroundColor: '#1A1028' },
            pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
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

      {/* At-cap modal */}
      <Modal visible={showCapModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: '#3A2E2B' }]}>Three feels just right.</Text>
            <Text style={[styles.modalBody, { color: '#6B5B52' }]}>
              You already have three challenges growing. Finish or pause one before starting another — it'll keep them gentle.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#F2B4CC' }]}
                onPress={() => setShowCapModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Got it</Text>
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
    borderRadius: 22,
    padding: spacing.lg + 2,
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    borderLeftWidth: 6,
    borderLeftColor: '#C45A82',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 24,
    fontWeight: '500',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    paddingVertical: 6,
  },
  taskBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C45A82',
  },
  taskText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    lineHeight: 22,
    flex: 1,
  },
  // Prompt — sage accent
  promptCard: {
    borderRadius: 22,
    padding: spacing.lg + 2,
    marginBottom: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.16)',
    borderLeftWidth: 6,
    borderLeftColor: '#6F8B6A',
    shadowColor: '#6F8B6A',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#6F8B6A',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#3A2E2B',
    lineHeight: 24,
  },
  // Button
  beginButton: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    shadowColor: '#1A1028',
    shadowOpacity: 0.32,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  beginButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
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
