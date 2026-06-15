import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';

const MOODS = [
  { id: 'low',     emoji: '🌙', label: 'Tired',   prompt: 'What weighed on you today?' },
  { id: 'heavy',   emoji: '🌧️', label: 'Heavy',   prompt: 'What helped you carry it?' },
  { id: 'neutral', emoji: '☁️',  label: 'Okay',    prompt: 'What did today teach you?' },
  { id: 'calm',    emoji: '🌤️', label: 'Warm',    prompt: 'What small thing softened today?' },
  { id: 'radiant', emoji: '✨', label: 'Glowing', prompt: 'What lit you up today?' },
];

const DEFAULT_PROMPT = 'How is your heart right now?';

export default function HonestEveningScreen() {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);

  const handlePick = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPicked(id);
  };

  const prompt = picked ? (MOODS.find((m) => m.id === picked)?.prompt ?? DEFAULT_PROMPT) : DEFAULT_PROMPT;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(155,134,212,0.25)', 'rgba(242,180,204,0.10)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>JOURNAL</Text>
        <Text style={styles.headline}>Journal your feelings, anytime.</Text>
        <Text style={styles.subhead}>Pick a mood. Type a note, record your voice, or skip.</Text>

        <View style={styles.mockupCard}>
          <Text style={styles.mockTitle}>How do you feel right now?</Text>

          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const isPicked = picked === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => handlePick(m.id)}
                  style={[styles.moodItem, isPicked && styles.moodItemPicked]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, isPicked && styles.moodLabelPicked]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.promptCard}>
            <Text style={styles.promptEyebrow}>YOUR PROMPT</Text>
            <Text style={styles.promptText}>{prompt}</Text>
            <View style={styles.modeRow}>
              <View style={styles.modeChip}>
                <Text style={styles.modeIcon}>✏</Text>
                <Text style={styles.modeLabel}>Write</Text>
              </View>
              <View style={styles.modeChip}>
                <Text style={styles.modeIcon}>🎙</Text>
                <Text style={styles.modeLabel}>Voice</Text>
              </View>
              <View style={styles.modeChipGhost}>
                <Text style={styles.modeLabelGhost}>Skip</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/extras')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 500 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold',
    color: 'rgba(155,134,212,0.85)', letterSpacing: 1.4, marginBottom: 14,
  },
  headline: {
    fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#FEFAF9', lineHeight: 38, marginBottom: 12, letterSpacing: -0.4,
  },
  subhead: {
    fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.62)',
    lineHeight: 22, marginBottom: 24,
  },
  mockupCard: {
    backgroundColor: '#FFF7F2', borderRadius: 28,
    paddingVertical: 22, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30, shadowRadius: 28,
  },
  mockTitle: {
    fontFamily: 'PlayfairDisplay', fontSize: 17,
    color: '#3A2E2B', letterSpacing: -0.2, marginBottom: 14,
  },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  moodItem: { alignItems: 'center', flex: 1, paddingVertical: 6, borderRadius: 12, gap: 4 },
  moodItemPicked: { backgroundColor: 'rgba(196,90,130,0.12)' },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontFamily: 'DMSans', fontSize: 9, fontWeight: '500', color: '#6B4A38' },
  moodLabelPicked: { color: '#C45A82', fontWeight: '600' },
  promptCard: {
    backgroundColor: 'rgba(196,90,130,0.06)', borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(196,90,130,0.10)',
  },
  promptEyebrow: {
    fontFamily: 'SpaceMono-Bold', fontSize: 9,
    color: '#C45A82', letterSpacing: 1.1, marginBottom: 6,
  },
  promptText: {
    fontFamily: 'PlayfairDisplay-Italic', fontSize: 16,
    color: '#3A2E2B', lineHeight: 22, marginBottom: 12,
  },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFFFF', borderRadius: 999,
    paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(196,90,130,0.18)',
  },
  modeIcon: { fontSize: 11 },
  modeLabel: { fontFamily: 'DMSans', fontSize: 11, fontWeight: '600', color: '#C45A82' },
  modeChipGhost: {
    backgroundColor: 'transparent', borderRadius: 999,
    paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(58,46,43,0.18)',
  },
  modeLabelGhost: { fontFamily: 'DMSans', fontSize: 11, fontWeight: '500', color: '#8C7670' },
  bottom: { paddingTop: 24 },
});
