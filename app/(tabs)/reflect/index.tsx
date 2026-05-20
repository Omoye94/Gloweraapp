import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVoiceRecorder } from '../../../src/hooks/useVoiceRecorder';
import { AudioMemoPlayer } from '../../../src/components/journal/AudioMemoPlayer';
import { spacing, shadows } from '../../../src/theme';
import { SolarIcon } from '../../../src/components/ui/SolarIcon';
import { usePlantStore, useJourneyStore } from '../../../src/stores';
import { supabase } from '../../../lib/supabase';
import {
  getLocalDateISO,
  getPromptForDate,
  getRecentReflections,
  saveDailyReflection,
  REFLECTION_MOODS,
  ReflectionMood,
  DailyReflection,
} from '../../../src/lib/reflections';
import { POINT_VALUES } from '../../../src/utils/pointsCalculator';

const JOURNAL_KEY = 'glowera_journal_entries_v1';

const POINT_VALUE = POINT_VALUES.dailyReflection;

// Map mood id → pill colour
const MOOD_COLORS: Record<string, string> = {
  calm:        'rgba(184,206,172,0.30)',
  proud:       'rgba(212,144,154,0.18)',
  content:     'rgba(244,198,204,0.25)',
  tired:       'rgba(212,201,248,0.28)',
  overwhelmed: 'rgba(229,207,203,0.40)',
  hopeful:     'rgba(212,144,154,0.18)',
};
const MOOD_TEXT: Record<string, string> = {
  calm: '#6B9E6C', proud: '#C45A82', content: '#C45A82',
  tired: '#9B8BD6', overwhelmed: '#7A6668', hopeful: '#C45A82',
};

function formatDateParts(dateISO: string): { month: string; day: string } {
  const d = new Date(dateISO + 'T12:00:00');
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()),
  };
}

function formatRecordingTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ReflectScreen() {
  const router = useRouter();
  const { addPoints, recordDailyActivity } = usePlantStore();

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [todayDate, setTodayDate] = useState(getLocalDateISO());
  const [prompt, setPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState<ReflectionMood | null>(null);
  const [journalText, setJournalText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [entries, setEntries] = useState<DailyReflection[]>([]);
  const [showWriting, setShowWriting] = useState(false);
  const { recordingState, audioUri, durationMs, startRecording, stopRecording, clearRecording } =
    useVoiceRecorder();

  const hasReflectedToday = entries.some((e) => e.reflection_date === todayDate);
  const todayCount = entries.filter((e) => e.reflection_date === todayDate).length;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = getLocalDateISO();
      setTodayDate(today);
      setPrompt(getPromptForDate(today));
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Load from local storage first (fast)
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      const local: DailyReflection[] = raw ? JSON.parse(raw) : [];
      setEntries(local);

      // Merge remote entries in background
      if (user?.id) {
        getRecentReflections(user.id, 10).then((remote) => {
          setEntries((prev) => {
            const localIds = new Set(prev.map((e) => e.id));
            const merged = [...prev, ...remote.filter((r) => !localIds.has(r.id))];
            merged.sort((a, b) => b.created_at?.localeCompare(a.created_at ?? '') ?? 0);
            return merged.slice(0, 30);
          });
        }).catch(() => {});
      }
    } catch (error) {
      console.error('[Reflect] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood: ReflectionMood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood === selectedMood ? null : mood);
  };

  const commitReflection = (content: string | null, isVoice = false, voiceUri?: string) => {
    console.log('[Reflect] commitReflection, isVoice:', isVoice, 'voiceUri:', voiceUri, 'content:', content);
    const now = new Date().toISOString();
    const newEntry: DailyReflection = {
      id: `local_${Date.now()}`,
      user_id: userId || 'local',
      reflection_date: todayDate,
      prompt_text: prompt,
      mood: selectedMood,
      content,
      ...(voiceUri ? { audioUri: voiceUri } : {}),
      created_at: now,
      updated_at: now,
    };

    setEntries((prev) => {
      const updated = [newEntry, ...prev].slice(0, 30);
      console.log('[Reflect] entries updated, count:', updated.length, 'entry audioUri:', newEntry.audioUri);
      AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Reset form for next entry
    setJournalText('');
    setSelectedMood(null);

    // Points only on first reflection of the day
    if (!hasReflectedToday) {
      recordDailyActivity();
      addPoints(POINT_VALUE, true);
      useJourneyStore.getState().addEvent({
        user_id: userId || '',
        event_type: 'reflection_written',
        title: isVoice ? 'You recorded a voice reflection' : 'You wrote a reflection',
        description: prompt || null,
        icon: isVoice ? '🎙' : '📝',
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);

    // Background cloud sync (best-effort)
    saveDailyReflection({
      user_id: userId || '',
      reflection_date: todayDate,
      prompt_text: prompt,
      mood: selectedMood,
      content,
    }).catch(() => {});
  };

  const handleSaveVoiceMemo = () => {
    const uri = audioUri; // capture before clearRecording nulls it
    console.log('[Reflect] handleSaveVoiceMemo, uri:', uri);
    clearRecording();      // reset recorder state first
    if (!uri) return;
    commitReflection(null, true, uri); // then commit — entries update triggers re-render
  };

  const handleSave = () => {
    commitReflection(journalText.trim() || null);
    setShowWriting(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C45A82" />
          <Text style={styles.loadingText}>Loading your reflection...</Text>
        </View>
      </View>
    );
  }

  // ── Writing view (full journal input) ──
  if (showWriting) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reflection</Text>
            <Text style={styles.subtitle}>Capture your inner glow</Text>
          </View>

          {/* Mood */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {REFLECTION_MOODS.map((mood) => (
                <Pressable
                  key={mood.id}
                  style={({ pressed }) => [
                    styles.moodChip,
                    selectedMood === mood.id && styles.moodChipSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <Text style={{ fontSize: 18 }}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodChipLabel,
                      selectedMood === mood.id && { color: '#C45A82' },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Prompt + journal */}
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>TODAY'S PROMPT</Text>
            <Text style={styles.promptText}>{prompt}</Text>
            <TextInput
              style={styles.journalInput}
              value={journalText}
              onChangeText={(text) => {
                if (text.length <= 2000) setJournalText(text);
              }}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#B8A99E"
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={styles.charCount}>{journalText.length}/2000</Text>
          </View>

          {/* Actions */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.8 }]}
            onPress={() => setShowWriting(false)}
          >
            <Text style={styles.skipButtonText}>Back</Text>
          </Pressable>

          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* Toast */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Your glow counts ✨</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Reflection</Text>
          <Text style={styles.subtitle}>Capture your inner glow</Text>
        </View>

        {/* ── Daily Prompt card ── */}
        <View style={styles.promptFeatureCard}>
          {/* Decorative blur blobs */}
          <View style={styles.blobTopRight} />
          <View style={styles.blobBottomLeft} />

          {/* Star icon */}
          <View style={styles.promptIconWrapper}>
            <SolarIcon name="star-bold-duotone" size={32} color="#C45A82" />
          </View>

          <Text style={styles.promptFeatureLabel}>Daily Prompt</Text>
          <Text style={styles.promptFeatureText}>"{prompt}"</Text>

          {hasReflectedToday && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>
                ✓ {todayCount} {todayCount === 1 ? 'entry' : 'entries'} today
              </Text>
            </View>
          )}

          <View style={styles.actionButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  styles.actionButtonHalf,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setShowWriting(true)}
              >
                <SolarIcon name="pen-new-square-bold" size={16} color="#FEFAF9" />
                <Text style={styles.startButtonText}>Write</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  styles.actionButtonHalf,
                  styles.recordButton,
                  recordingState === 'recording' && styles.recordButtonActive,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  if (recordingState === 'idle') startRecording();
                  else if (recordingState === 'recording') stopRecording();
                  else clearRecording(); // 'stopped' → discard and go back to idle
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {recordingState === 'recording' ? '⏹' : '🎙'}
                </Text>
                <Text style={[styles.startButtonText, styles.recordButtonText]}>
                  {recordingState === 'recording'
                    ? formatRecordingTime(durationMs)
                    : 'Record'}
                </Text>
              </Pressable>
            </View>
        </View>

        {/* ── Voice memo recording state ── */}
        {recordingState === 'stopped' && audioUri && (
          <View style={styles.voiceMemoCard}>
            <Text style={styles.voiceMemoLabel}>Voice Reflection</Text>
            <AudioMemoPlayer uri={audioUri} />
            <View style={styles.voiceMemoActions}>
              <Pressable
                style={({ pressed }) => [styles.voiceSaveBtn, pressed && { opacity: 0.8 }]}
                onPress={handleSaveVoiceMemo}
              >
                <Text style={styles.voiceSaveBtnText}>Save Reflection</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.voiceDiscardBtn, pressed && { opacity: 0.8 }]}
                onPress={clearRecording}
              >
                <Text style={styles.voiceDiscardBtnText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Quick Links ── */}
        <View style={styles.quickLinksRow}>
          <Pressable
            style={({ pressed }) => [styles.quickLinkCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/(tabs)/reflect/weekly')}
          >
            <SolarIcon name="cup-star-bold" size={22} color="#C45A82" />
            <Text style={styles.quickLinkTitle}>Weekly Recap</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickLinkCard, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/(tabs)/reflect/history')}
          >
            <SolarIcon name="pen-new-square-bold" size={22} color="#C45A82" />
            <Text style={styles.quickLinkTitle}>History</Text>
          </Pressable>
        </View>

        {/* ── Your Journey ── */}
        {entries.length > 0 && (
          <View style={styles.journeySection}>
            <View style={styles.journeySectionHeader}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              <Pressable onPress={() => router.push('/(tabs)/reflect/history')}>
                <Text style={styles.viewArchiveLink}>View Archive</Text>
              </Pressable>
            </View>

            {entries.map((entry) => {
              const { month, day } = formatDateParts(entry.reflection_date);
              const moodObj = REFLECTION_MOODS.find((m) => m.id === entry.mood);
              return (
                <Pressable
                  key={entry.id ?? entry.reflection_date}
                  style={({ pressed }) => [
                    styles.journeyCard,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                  ]}
                  onPress={() => router.push(`/(tabs)/reflect/${entry.reflection_date}`)}
                >
                  {/* Date box */}
                  <View style={styles.dateBox}>
                    <Text style={styles.dateMonth}>{month}</Text>
                    <Text style={styles.dateDay}>{day}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.journeyContent}>
                    <Text style={styles.journeyEntryTitle} numberOfLines={1}>
                      {entry.prompt_text || 'Reflection'}
                    </Text>
                    {entry.content ? (
                      <Text style={styles.journeyPreview} numberOfLines={1}>
                        {entry.content}
                      </Text>
                    ) : null}
                    {entry.audioUri ? (
                      <AudioMemoPlayer uri={entry.audioUri} />
                    ) : null}
                    {/* Mood tag */}
                    {moodObj && (
                      <View style={styles.journeyTagsRow}>
                        <View
                          style={[
                            styles.moodPill,
                            { backgroundColor: MOOD_COLORS[moodObj.id] ?? 'rgba(212,144,154,0.15)' },
                          ]}
                        >
                          <Text style={{ fontSize: 11 }}>{moodObj.emoji}</Text>
                          <Text
                            style={[
                              styles.moodPillText,
                              { color: MOOD_TEXT[moodObj.id] ?? '#C45A82' },
                            ]}
                          >
                            {moodObj.label}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Arrow */}
                  <SolarIcon name="alt-arrow-right-linear" size={16} color="#D6C5C2" />
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6F2' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'DMSans', color: '#7A6668' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 60 },

  // ── Header ──
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontFamily: 'Raleway-SemiBold', color: '#3A2E2B', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'DMSans', color: '#7A6668' },

  // ── Daily Prompt feature card ──
  promptFeatureCard: {
    backgroundColor: '#FEFAF9',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.md,
  },
  blobTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244,198,204,0.15)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212,201,248,0.12)',
  },
  promptIconWrapper: { marginBottom: 12 },
  promptFeatureLabel: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: 12,
  },
  promptFeatureText: {
    fontSize: 17,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: '#3A2E2B',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 24,
  },

  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184,206,172,0.30)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  savedBadgeText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#6B9E6C',
  },

  startButton: {
    width: '100%',
    backgroundColor: '#C45A82',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    color: '#FEFAF9',
  },

  // ── Quick links ──
  quickLinksRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  quickLinkCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.lg,
    backgroundColor: '#FEFAF9',
    borderRadius: 20,
    ...shadows.sm,
  },
  quickLinkTitle: { fontSize: 14, fontFamily: 'Raleway-SemiBold', color: '#3A2E2B' },

  // ── Journey section ──
  journeySection: { marginBottom: 8 },
  journeySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Raleway-SemiBold', color: '#3A2E2B' },
  viewArchiveLink: { fontSize: 14, fontFamily: 'DMSans', color: '#C45A82' },

  journeyCard: {
    backgroundColor: '#FEFAF9',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
    ...shadows.sm,
  },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F4E8E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#7A6668',
    letterSpacing: 0.3,
  },
  dateDay: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    lineHeight: 22,
  },
  journeyContent: { flex: 1 },
  journeyEntryTitle: {
    fontSize: 15,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  journeyPreview: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#7A6668',
    lineHeight: 18,
    marginBottom: 6,
  },
  journeyTagsRow: { flexDirection: 'row', gap: 6 },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  moodPillText: { fontSize: 11, fontFamily: 'DMSans' },

  // ── Writing view ──
  card: {
    backgroundColor: '#FEFAF9',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: 12,
    ...shadows.sm,
  },
  cardLabel: { fontSize: 15, fontFamily: 'Raleway-SemiBold', color: '#3A2E2B', marginBottom: 12 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#D6C5C2',
    backgroundColor: '#FEFAF9',
    gap: 4,
  },
  moodChipSelected: { backgroundColor: 'rgba(212,144,154,0.10)', borderColor: '#C45A82' },
  moodChipLabel: { fontSize: 13, fontFamily: 'DMSans', color: '#7A6668' },

  promptCard: {
    backgroundColor: '#FEFAF9',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: 12,
    ...shadows.sm,
  },
  promptLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  journalInput: {
    marginTop: 12,
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6C5C2',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 22,
    backgroundColor: '#FFF6F2',
  },
  charCount: { fontSize: 12, fontFamily: 'DMSans', color: '#7A6668', textAlign: 'right', marginTop: 4 },

  saveButton: {
    backgroundColor: '#C45A82',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonText: { fontSize: 16, fontFamily: 'Raleway-SemiBold', color: '#FEFAF9' },

  skipButton: {
    backgroundColor: '#FEFAF9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6C5C2',
  },
  skipButtonText: { fontSize: 15, fontFamily: 'DMSans', color: '#7A6668' },

  // ── Action buttons row (Write + Record) ──
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionButtonHalf: {
    flex: 1,
  },
  recordButton: {
    backgroundColor: '#3A2E2B',
    shadowColor: '#3A2E2B',
  },
  recordButtonActive: {
    backgroundColor: '#C0434F',
    shadowColor: '#C0434F',
  },
  recordButtonText: {
    color: '#FEFAF9',
  },

  // ── Voice memo card ──
  voiceMemoCard: {
    backgroundColor: '#FEFAF9',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: 16,
    ...shadows.sm,
  },
  voiceMemoLabel: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  voiceMemoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  voiceSaveBtn: {
    flex: 1,
    backgroundColor: '#C45A82',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  voiceSaveBtnText: {
    fontSize: 15,
    fontFamily: 'Raleway-SemiBold',
    color: '#FEFAF9',
  },
  voiceDiscardBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D6C5C2',
    backgroundColor: '#FEFAF9',
  },
  voiceDiscardBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#7A6668',
  },

  // ── Toast ──
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(184,206,172,0.95)',
    ...shadows.sm,
  },
  toastText: { fontSize: 15, fontFamily: 'DMSans', color: '#3A2E2B' },
});
