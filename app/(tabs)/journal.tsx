import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useJournalStore, usePlantStore } from '../../src/stores';
import { spacing, shadows } from '../../src/theme';
import { gradients } from '../../src/theme/colors';
import { formatShortDate } from '../../src/utils/dateUtils';
import { getDailyPrompt, getMoodPrompt } from '../../src/constants/reflectionPrompts';
import { MOOD_INFO, Mood } from '../../src/types/journal';
import { POINT_VALUES } from '../../src/utils/pointsCalculator';
import { useVoiceRecorder } from '../../src/hooks/useVoiceRecorder';
import { AudioMemoPlayer } from '../../src/components/journal/AudioMemoPlayer';

export default function JournalScreen() {
  const {
    addEntry,
    getRecentEntries,
    shouldShowWeeklyPrompt,
    markWeeklyPromptShown,
  } = useJournalStore();
  const { addPoints, recordDailyActivity } = usePlantStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [currentPrompt, setCurrentPrompt] = useState(getDailyPrompt());
  const [todayMood, setTodayMood] = useState<Mood | undefined>();

  const { recordingState, audioUri, durationMs, startRecording, stopRecording, clearRecording } = useVoiceRecorder();

  const params = useLocalSearchParams<{ mood?: Mood; compose?: string }>();

  useEffect(() => {
    if (params.compose && params.mood) {
      setSelectedMood(params.mood);
      setCurrentPrompt(getMoodPrompt(params.mood));
      setIsModalVisible(true);
    }
  }, [params.compose]);

  const recentEntries = getRecentEntries(10);

  const handleNewEntry = () => {
    setCurrentPrompt(getDailyPrompt());
    setIsModalVisible(true);
  };

  const handleSaveEntry = () => {
    if (entryContent.trim() || audioUri) {
      addEntry(entryContent.trim(), selectedMood, currentPrompt.id, audioUri ?? undefined);
      recordDailyActivity();
      addPoints(POINT_VALUES.journalEntry, true);
      setEntryContent('');
      setSelectedMood(undefined);
      clearRecording();
      setIsModalVisible(false);
    }
  };

  const closeModal = () => {
    setEntryContent('');
    setSelectedMood(undefined);
    clearRecording();
    setIsModalVisible(false);
  };

  const handleMicPress = async () => {
    if (recordingState === 'recording') {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const formatRecordingTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>REFLECTIONS</Text>
          <Text style={styles.title}>Capture your inner glow</Text>
        </View>

        {/* Hero: Daily Prompt + action buttons */}
        <View style={styles.promptCardWrap}>
          <LinearGradient
            colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promptCard}
          >
            <Text style={styles.promptLabelOnGradient}>TODAY'S PROMPT</Text>
            <Text style={styles.promptTextOnGradient}>{currentPrompt.text}</Text>
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.85 }]}
                onPress={handleNewEntry}
              >
                <Text style={styles.actionButtonIcon}>✏️</Text>
                <Text style={styles.actionButtonText}>Write</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonRecord,
                  recordingState === 'recording' && styles.actionButtonRecording,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleMicPress}
              >
                <Text style={styles.actionButtonIcon}>
                  {recordingState === 'recording' ? '⏹' : '🎙'}
                </Text>
                <Text style={[styles.actionButtonText, styles.actionButtonTextRecord]}>
                  {recordingState === 'recording'
                    ? `Stop  ${formatRecordingTime(durationMs)}`
                    : 'Record'}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Recording preview — shown on main screen after stopping */}
        {audioUri && recordingState === 'stopped' && (
          <View style={styles.recordingPreview}>
            <AudioMemoPlayer uri={audioUri} />
            <View style={styles.recordingPreviewActions}>
              <Pressable
                onPress={() => {
                  addEntry('', undefined, currentPrompt.id, audioUri ?? undefined);
                  recordDailyActivity();
                  addPoints(POINT_VALUES.journalEntry, true);
                  clearRecording();
                }}
                style={styles.saveVoiceButton}
              >
                <Text style={styles.saveVoiceButtonText}>Save voice note</Text>
              </Pressable>
              <Pressable onPress={clearRecording} style={styles.discardButton}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Mood Check-in */}
        <View style={styles.moodCard}>
          <Text style={styles.moodQuestion}>TODAY'S MOOD</Text>
          <View style={styles.moodRow}>
            {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
              <Pressable
                key={mood}
                style={[
                  styles.moodPill,
                  todayMood === mood && styles.moodPillSelected,
                ]}
                onPress={() => setTodayMood(mood)}
              >
                <Text style={styles.moodEmoji}>{MOOD_INFO[mood].emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  todayMood === mood && styles.moodLabelSelected,
                ]}>
                  {MOOD_INFO[mood].label}
                </Text>
              </Pressable>
            ))}
          </View>
          {todayMood && (
            <Text style={styles.moodFeedback}>
              Feeling {MOOD_INFO[todayMood].label.toLowerCase()} today
            </Text>
          )}
        </View>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <Text style={styles.viewAllLink}>View all</Text>
          </View>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={40} strokeWidth={1.5} color="#F2B4CC" />
              <Text style={styles.emptyTitle}>Your story begins here</Text>
              <Text style={styles.emptySubtext}>Start writing to capture your thoughts</Text>
            </View>
          ) : (
            recentEntries.map((entry) => {
              const d = new Date(entry.date);
              const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
              const day = d.getDate();
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateBoxMonth}>{month}</Text>
                      <Text style={styles.dateBoxDay}>{day}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryPrompt} numberOfLines={1}>
                        {currentPrompt.text}
                      </Text>
                      {entry.content ? (
                        <Text style={styles.entryContent} numberOfLines={2}>
                          {entry.content}
                        </Text>
                      ) : null}
                      {entry.mood && (
                        <Text style={styles.entryMoodLine}>
                          {MOOD_INFO[entry.mood].emoji} {MOOD_INFO[entry.mood].label}
                        </Text>
                      )}
                    </View>
                  </View>
                  {entry.audioUri ? (
                    <View style={{ marginTop: 8 }}>
                      <AudioMemoPlayer uri={entry.audioUri} />
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* New Entry Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>New Entry</Text>
            <View style={styles.modalHeaderRight}>
              <Pressable
                onPress={handleMicPress}
                style={[styles.micHeaderButton, recordingState === 'recording' && styles.micHeaderButtonActive]}
                hitSlop={8}
              >
                <Text style={styles.micHeaderIcon}>
                  {recordingState === 'recording' ? '⏹' : '🎙'}
                </Text>
              </Pressable>
              <Pressable onPress={handleSaveEntry}>
                <Text style={[styles.modalSave, (!entryContent.trim() && !audioUri) && { color: '#5C3D2E' }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Recording status bar */}
          {recordingState === 'recording' && (
            <View style={styles.recordingBar}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingBarText}>Recording {formatRecordingTime(durationMs)}</Text>
            </View>
          )}
          {audioUri && recordingState === 'stopped' && (
            <View style={styles.recordingBar}>
              <View style={{ flex: 1 }}>
                <AudioMemoPlayer uri={audioUri} />
              </View>
              <Pressable onPress={clearRecording} hitSlop={8} style={styles.clearMemo}>
                <Text style={styles.clearMemoText}>✕</Text>
              </Pressable>
            </View>
          )}

          <ScrollView style={styles.modalContent}>
            {/* Prompt */}
            <View style={styles.modalPromptBox}>
              <Text style={styles.promptLabel}>PROMPT</Text>
              <Text style={styles.promptText}>{currentPrompt.text}</Text>
            </View>

            {/* Mood Selector */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.modalLabel}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
                  <Pressable
                    key={mood}
                    style={[
                      styles.moodPill,
                      selectedMood === mood && styles.moodPillSelected,
                    ]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_INFO[mood].emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      selectedMood === mood && styles.moodLabelSelected,
                    ]}>
                      {MOOD_INFO[mood].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Write your thoughts..."
              placeholderTextColor="#B8A99E"
              value={entryContent}
              onChangeText={setEntryContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDD5CB' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 70 },

  header: { marginBottom: spacing.md },
  headerLabel: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#5C3D2E', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  title: { fontSize: 28, fontFamily: 'Raleway-SemiBold', color: '#1A0A06', letterSpacing: -0.3, fontWeight: '500' },
  subtitle: { fontSize: 18, fontFamily: 'Raleway-SemiBold', color: '#1A0A06', marginTop: 4 },

  // Action buttons row (inside prompt hero card)
  actionRow: {
    flexDirection: 'row', gap: 10, marginTop: 16,
  },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#C45A82', borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#C45A82',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  actionButtonRecord: {
    backgroundColor: 'rgba(58,46,43,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.18)',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  actionButtonRecording: {
    backgroundColor: 'rgba(212,144,154,0.15)', borderWidth: 1.5, borderColor: '#C45A82',
  },
  actionButtonIcon: { fontSize: 16 },
  actionButtonText: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#FEFAF9' },
  actionButtonTextRecord: { color: '#1A0A06' },

  // Recording preview
  recordingPreview: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: spacing.md,
    marginBottom: spacing.lg, ...shadows.sm,
  },
  recordingPreviewActions: {
    flexDirection: 'row', gap: 10, marginTop: spacing.sm,
  },
  saveVoiceButton: {
    flex: 1, backgroundColor: '#1A0A06', borderRadius: 9999,
    paddingVertical: 10, alignItems: 'center',
  },
  saveVoiceButtonText: { fontSize: 14, fontFamily: 'DMSans', fontWeight: '600', color: '#FEFAF9' },
  discardButton: {
    paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center',
  },
  discardButtonText: { fontSize: 14, fontFamily: 'DMSans', color: '#5C3D2E' },

  // Mood card
  moodCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: spacing.lg, ...shadows.sm },
  moodQuestion: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#5C3D2E', letterSpacing: 1.2, marginBottom: 14 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodPill: {
    flexDirection: 'column', alignItems: 'center', gap: 5,
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12,
  },
  moodPillSelected: { backgroundColor: 'rgba(242,180,204,0.25)' },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 9, fontFamily: 'DMSans', fontWeight: '500', color: '#B8A9A5' },
  moodLabelSelected: { color: '#C45A82' },
  moodFeedback: { fontSize: 13, fontFamily: 'DMSans', color: '#F2B4CC', marginTop: 12 },

  // Prompt — gradient hero
  promptCardWrap: {
    borderRadius: 28, marginBottom: spacing.xl,
    shadowColor: 'rgba(155,134,212,1)', shadowOpacity: 0.2,
    shadowRadius: 24, shadowOffset: { width: 0, height: 4 },
  },
  promptCard: { borderRadius: 28, padding: 28, overflow: 'hidden' },
  promptLabel: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#6B5B52', letterSpacing: 0.8, marginBottom: 8 },
  promptText: { fontSize: 15, fontFamily: 'DMSans', color: '#1A0A06', fontStyle: 'italic', lineHeight: 22 },
  promptLabelOnGradient: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#6B5752', letterSpacing: 1.2, marginBottom: 8 },
  promptTextOnGradient: { fontSize: 19, fontFamily: 'Raleway-SemiBold', color: '#1A0A06', lineHeight: 28, marginBottom: 4 },

  // Entries
  entriesSection: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontFamily: 'Raleway-SemiBold', fontWeight: '600', color: '#1A0A06' },
  viewAllLink: { fontSize: 13, fontFamily: 'DMSans', color: '#C45A82' },
  entryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: spacing.lg, marginBottom: 8, ...shadows.sm },
  entryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  dateBox: {
    width: 52, height: 52, backgroundColor: '#EDD5CB', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dateBoxMonth: { fontFamily: 'SpaceMono-Bold', fontSize: 9, color: '#5C3D2E', letterSpacing: 1 },
  dateBoxDay: { fontFamily: 'Raleway-SemiBold', fontSize: 20, color: '#1A0A06', lineHeight: 22 },
  entryPrompt: { fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 13, color: '#5C3D2E', marginBottom: 4 },
  entryContent: { fontSize: 14, fontFamily: 'DMSans', color: '#1A0A06', lineHeight: 20, marginBottom: 4 },
  entryMoodLine: { fontSize: 12, fontFamily: 'DMSans', color: '#5C3D2E' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 16, ...shadows.sm },
  emptyTitle: { fontSize: 17, fontFamily: 'DMSans', fontWeight: '500', color: '#1A0A06', marginTop: 12, marginBottom: 4 },
  emptySubtext: { fontSize: 14, fontFamily: 'DMSans', color: '#5C3D2E' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#EDD5CB' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingTop: spacing.xl,
    borderBottomWidth: 1, borderBottomColor: '#EADBD4',
  },
  modalCancel: { fontSize: 16, fontFamily: 'DMSans', color: '#6B5B52' },
  modalTitle: { fontSize: 17, fontFamily: 'Raleway-SemiBold', fontWeight: '600', color: '#1A0A06' },
  modalSave: { fontSize: 16, fontFamily: 'DMSans', color: '#C45A82' },
  modalContent: { flex: 1, padding: spacing.lg },
  modalPromptBox: { backgroundColor: '#FFFFFF', padding: spacing.lg, borderRadius: 16, marginBottom: spacing.lg, ...shadows.sm },
  modalLabel: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '500', color: '#1A0A06', marginBottom: 8 },
  textInput: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: spacing.lg, minHeight: 200,
    fontSize: 15, fontFamily: 'DMSans', color: '#1A0A06', lineHeight: 24, ...shadows.sm,
  },

  // Voice memo header
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  micHeaderButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(212,144,154,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  micHeaderButtonActive: { backgroundColor: '#C45A82' },
  micHeaderIcon: { fontSize: 15 },
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.lg, paddingVertical: 8,
    backgroundColor: 'rgba(212,144,154,0.1)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(212,144,154,0.2)',
  },
  recordingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#C45A82',
  },
  recordingBarText: { fontSize: 13, fontFamily: 'DMSans', color: '#C45A82', flex: 1 },
  clearMemo: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(212,144,154,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  clearMemoText: { fontSize: 12, color: '#5C3D2E' },
});
