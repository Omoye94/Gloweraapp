import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useJournalStore, usePlantStore, useHabitStore } from '../../src/stores';
import { spacing, shadows } from '../../src/theme';
import { getDailyPrompt, getMoodPrompt, REFLECTION_PROMPTS } from '../../src/constants/reflectionPrompts';
import { MOOD_INFO, Mood } from '../../src/types/journal';
import { POINT_VALUES } from '../../src/utils/pointsCalculator';
import { useVoiceRecorder } from '../../src/hooks/useVoiceRecorder';
import { AudioMemoPlayer } from '../../src/components/journal/AudioMemoPlayer';
import { formatDateKey } from '../../src/utils/dateUtils';

const TODAY = formatDateKey();
type EntryMode = 'one-line' | 'voice' | 'guided';

const MOOD_LEVEL: Record<Mood, number> = {
  radiant: 5, calm: 4, neutral: 3, low: 2, struggling: 1,
};
const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  radiant: "You're glowing today",
  calm: "A gentle, peaceful energy",
  neutral: "Steady and grounded",
  low: "It's okay to have quieter days",
  struggling: "You're not alone. Be gentle with yourself",
};

const MOOD_PILL_BG: Record<Mood, string> = {
  radiant:    'rgba(255,214,153,0.35)',
  calm:       'rgba(201,173,255,0.35)',
  neutral:    'rgba(102,239,199,0.35)',
  low:        'rgba(153,214,255,0.35)',
  struggling: 'rgba(219,201,255,0.35)',
};

const MOOD_CARD_BG: Record<Mood, string> = {
  radiant:    'rgba(255,214,153,0.22)',
  calm:       'rgba(201,173,255,0.22)',
  neutral:    'rgba(102,239,199,0.18)',
  low:        'rgba(153,214,255,0.22)',
  struggling: 'rgba(219,201,255,0.22)',
};

export default function JournalScreen() {
  const {
    addEntry,
    updateEntry,
    deleteEntry,
    getRecentEntries,
    getMoodForDate,
    setMoodForDate,
    moodByDate,
    entries,
  } = useJournalStore();
  const { addPoints, recordDailyActivity, plant } = usePlantStore();
  const { habits } = useHabitStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [currentPrompt, setCurrentPrompt] = useState(getDailyPrompt());
  const [todayMood, setTodayMoodState] = useState<Mood | undefined>(() => getMoodForDate(TODAY));
  const [entryMode, setEntryMode] = useState<EntryMode>('guided');
  const [showGardenSaved, setShowGardenSaved] = useState(false);

  // View-all / search state
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit entry state
  const [editingEntry, setEditingEntry] = useState<ReturnType<typeof getRecentEntries>[number] | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<Mood | undefined>();

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
  const reflectedThisWeek = useMemo(() => {
    const dates = new Set<string>();
    entries.forEach((entry) => {
      const entryDate = new Date(entry.date + 'T12:00:00');
      const daysAgo = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) dates.add(entry.date);
    });
    return dates.size;
  }, [entries]);

  // Filtered entries for "view all" modal
  const allFilteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.content.toLowerCase().includes(q) ||
      (e.mood && MOOD_INFO[e.mood].label.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  // 7-day mood trend — prefer explicit check-in, fall back to entry mood for the day
  const moodTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = formatDateKey(d);
      const dayLabel = d.toLocaleString('en-US', { weekday: 'short' }).slice(0, 1);
      const mood = (moodByDate[key] as Mood | undefined) ?? entries.find(e => e.date === key)?.mood;
      return { key, dayLabel, mood, isToday: key === TODAY };
    });
  }, [moodByDate, entries]);

  const weekStats = useMemo(() => {
    if (entries.length === 0) return null;
    const weekMoods = moodTrend.filter(d => d.mood).map(d => d.mood as Mood);
    const dominantMood = weekMoods.length > 0
      ? weekMoods.reduce((acc, m) =>
          weekMoods.filter(x => x === m).length >= weekMoods.filter(x => x === acc).length ? m : acc
        )
      : null;
    const parts: string[] = [`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`];
    if (reflectedThisWeek > 0) parts.push(`${reflectedThisWeek} day${reflectedThisWeek !== 1 ? 's' : ''} this week`);
    if (dominantMood) parts.push(`Mostly ${MOOD_INFO[dominantMood].label.toLowerCase()}`);
    return parts.join(' · ');
  }, [entries, reflectedThisWeek, moodTrend]);

  // Cross-prompt: supplements the user said aren't working
  const negativeCheckIns = useMemo(() => {
    return habits.filter(
      h => h.category === 'supplements' && h.isActive && h.supplementMeta?.checkInRating === 'negative'
    );
  }, [habits]);

  const openEntryFlow = (mode: EntryMode) => {
    setEntryMode(mode);
    setSelectedMood(todayMood);
    setCurrentPrompt(todayMood ? getMoodPrompt(todayMood) : getDailyPrompt());
    setIsModalVisible(true);
  };

  const handleNewEntry = () => openEntryFlow('guided');

  const handleSaveEntry = () => {
    if (entryContent.trim() || audioUri) {
      addEntry(entryContent.trim(), selectedMood, currentPrompt.id, audioUri ?? undefined);
      recordDailyActivity();
      addPoints(POINT_VALUES.journalEntry, true);
      setEntryContent('');
      setSelectedMood(undefined);
      clearRecording();
      setIsModalVisible(false);
      setShowGardenSaved(true);
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
      setEntryMode('voice');
      await startRecording();
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setTodayMoodState(mood);
    setMoodForDate(TODAY, mood);
    setCurrentPrompt(getMoodPrompt(mood));
  };

  const handleOpenEdit = (entry: ReturnType<typeof getRecentEntries>[number]) => {
    setEditContent(entry.content);
    setEditMood(entry.mood);
    setEditingEntry(entry);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    updateEntry(editingEntry.id, { content: editContent.trim(), mood: editMood });
    setEditingEntry(null);
  };

  const handleDeleteEntry = () => {
    if (!editingEntry) return;
    Alert.alert('Delete Entry', 'Remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteEntry(editingEntry.id); setEditingEntry(null); },
      },
    ]);
  };

  const formatRecordingTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const renderHeroEntryCard = (entry: ReturnType<typeof getRecentEntries>[number]) => {
    const d = new Date(entry.date);
    const isToday = entry.date === TODAY;
    const dateLabel = isToday ? 'Today' : d.toLocaleString('en-US', { weekday: 'long' });
    const dayNum = `${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()}`;
    const savedPrompt = REFLECTION_PROMPTS.find(p => p.id === entry.promptUsed);
    return (
      <Pressable
        key={entry.id}
        style={({ pressed }) => [styles.heroEntryCard, pressed && { opacity: 0.95 }]}
        onPress={() => handleOpenEdit(entry)}
      >
        <LinearGradient
          colors={entry.mood ? [MOOD_CARD_BG[entry.mood], '#FFFFFF'] : ['#FFFFFF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.8 }}
          style={styles.heroEntryInner}
        >
          <View style={styles.heroEntryHeader}>
            <View>
              <Text style={styles.heroEntryDateLabel}>{dateLabel}</Text>
              <Text style={styles.heroEntryDayNum}>{dayNum}</Text>
            </View>
            {entry.mood && (
              <View style={[styles.heroEntryMoodChip, { backgroundColor: MOOD_PILL_BG[entry.mood] }]}>
                <Text style={styles.heroEntryMoodText}>
                  {MOOD_INFO[entry.mood].emoji} {MOOD_INFO[entry.mood].label}
                </Text>
              </View>
            )}
          </View>
          {savedPrompt ? (
            <Text style={styles.heroEntryPrompt} numberOfLines={2}>{savedPrompt.text}</Text>
          ) : null}
          {entry.content ? (
            <Text style={styles.heroEntryContent} numberOfLines={3}>{entry.content}</Text>
          ) : null}
          {entry.audioUri ? (
            <View style={{ marginTop: 8, marginBottom: 4 }}>
              <AudioMemoPlayer uri={entry.audioUri} />
            </View>
          ) : null}
          <Text style={styles.heroEntryEditHint}>Edit ›</Text>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderEntryCard = (entry: ReturnType<typeof getRecentEntries>[number]) => {
    const d = new Date(entry.date);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const savedPrompt = REFLECTION_PROMPTS.find(p => p.id === entry.promptUsed);
    return (
      <Pressable
        key={entry.id}
        style={({ pressed }) => [
          styles.entryCard,
          entry.mood && { borderLeftWidth: 3, borderLeftColor: MOOD_INFO[entry.mood].color },
          pressed && { opacity: 0.92 },
        ]}
        onPress={() => handleOpenEdit(entry)}
      >
        <View style={styles.entryHeader}>
          <View style={[styles.dateBox, entry.mood && { backgroundColor: MOOD_PILL_BG[entry.mood] }]}>
            <Text style={styles.dateBoxMonth}>{month}</Text>
            <Text style={styles.dateBoxDay}>{day}</Text>
          </View>
          <View style={{ flex: 1 }}>
            {savedPrompt ? (
              <Text style={styles.entryPrompt} numberOfLines={1}>
                {savedPrompt.text}
              </Text>
            ) : null}
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
          <Text style={styles.entryEditHint}>›</Text>
        </View>
        {entry.audioUri ? (
          <View style={{ marginTop: 8 }}>
            <AudioMemoPlayer uri={entry.audioUri} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5E6E0', '#EDD5CB', '#E8C9BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Hero: Daily check-in + action buttons */}
        <View style={styles.promptCardWrap}>
          <LinearGradient
            colors={['#D8C9EC', '#F2B4CC', '#FBD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promptCard}
          >
            <Text style={styles.heroJournalEyebrow}>JOURNAL RITUAL</Text>
            <Text style={styles.heroJournalTitle}>Let your garden{'\n'}hear you</Text>
            <Text style={styles.heroJournalSub}>
              {todayMood
                ? `Feeling ${MOOD_INFO[todayMood].label.toLowerCase()}. Your next prompt will meet you there.`
                : 'One line, one voice note, or one honest page.'}
            </Text>
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.85 }]}
                onPress={() => openEntryFlow('one-line')}
              >
                <Text style={styles.actionButtonIcon}>✦</Text>
                <Text style={styles.actionButtonText}>One line</Text>
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
            <Pressable
              style={({ pressed }) => [styles.guidedButton, pressed && { opacity: 0.82 }]}
              onPress={() => openEntryFlow('guided')}
            >
              <Text style={styles.guidedButtonText}>Open a guided prompt</Text>
            </Pressable>
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
                  setShowGardenSaved(true);
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

        {/* Mood Ritual Card */}
        <View style={styles.moodRitualCard}>
          <LinearGradient
            colors={todayMood ? [MOOD_CARD_BG[todayMood], '#FFFFFF'] : ['#FEFCFB', '#FEFCFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.65 }}
            style={styles.moodRitualInner}
          >
            <Text style={styles.moodRitualLabel}>MOOD RITUAL</Text>

            {/* Mood display */}
            <View style={styles.moodDisplayArea}>
              {todayMood ? (
                <View style={styles.moodDisplayInner}>
                  <View style={[styles.moodDisplayOrb, { shadowColor: MOOD_INFO[todayMood].color }]}>
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MOOD_INFO[todayMood].color, opacity: 0.5, borderRadius: 40 }]} />
                    <Text style={styles.moodDisplayEmoji}>{MOOD_INFO[todayMood].emoji}</Text>
                  </View>
                  <View style={styles.moodDisplayText}>
                    <Text style={styles.moodDisplayName}>{MOOD_INFO[todayMood].label}</Text>
                    <Text style={styles.moodDisplayDesc}>{MOOD_DESCRIPTIONS[todayMood]}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.moodEmptyArea}>
                  <Text style={styles.moodEmptyEmoji}>🌸</Text>
                  <Text style={styles.moodEmptyTitle}>How are you today?</Text>
                  <Text style={styles.moodEmptyHint}>Select a mood below to begin</Text>
                </View>
              )}
            </View>

            {/* 7-day bar chart */}
            <View style={styles.moodChartHeader}>
              <Text style={styles.moodChartLabel}>THIS WEEK</Text>
            </View>
            <View style={styles.moodBarChart}>
              {moodTrend.map(({ key, dayLabel, mood, isToday }) => {
                const barHeight = mood ? Math.max(10, (MOOD_LEVEL[mood] / 5) * 52) : 0;
                return (
                  <View key={key} style={styles.moodBarCol}>
                    <View style={[styles.moodBarTrack, isToday && styles.moodBarTrackToday]}>
                      {mood && (
                        <View style={[styles.moodBarFill, { height: barHeight, backgroundColor: MOOD_INFO[mood].color }]} />
                      )}
                    </View>
                    <Text style={[styles.moodBarDayLabel, isToday && { color: '#C45A82' }]}>
                      {dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Mood selector */}
            <View style={styles.moodSelectorRow}>
              {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
                <Pressable
                  key={mood}
                  style={[styles.moodSelectorPill, todayMood === mood && { backgroundColor: MOOD_PILL_BG[mood] }]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <View style={[styles.moodIndicatorDot, { backgroundColor: todayMood === mood ? MOOD_INFO[mood].color : 'transparent' }]} />
                  <Text style={styles.moodSelectorEmoji}>{MOOD_INFO[mood].emoji}</Text>
                  <Text style={[styles.moodSelectorLabel, todayMood === mood && styles.moodSelectorLabelSelected]}>
                    {MOOD_INFO[mood].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Journal × GlowStack cross-prompt */}
        {negativeCheckIns.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.crossPromptCard, pressed && { opacity: 0.9 }]}
            onPress={() => {
              const name = negativeCheckIns[0].name;
              setCurrentPrompt({
                id: 'cross-glowstack',
                text: `You noted ${name} isn't feeling effective yet — how are you feeling about your wellness journey?`,
                category: 'daily',
              });
              setIsModalVisible(true);
            }}
          >
            <LinearGradient
              colors={['#EDE8FF', '#F6E8F5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.crossPromptInner}
            >
              <Text style={styles.crossPromptEmoji}>💊✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.crossPromptTitle}>A reflection for you</Text>
                <Text style={styles.crossPromptSub} numberOfLines={2}>
                  You noted {negativeCheckIns[0].name} isn't feeling effective yet — write about it
                </Text>
              </View>
              <Text style={styles.crossPromptArrow}>›</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              {weekStats ? <Text style={styles.sectionSubtitle}>{weekStats}</Text> : null}
            </View>
            <Pressable onPress={() => setShowAllEntries(true)}>
              <Text style={styles.viewAllLink}>View all</Text>
            </Pressable>
          </View>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={40} strokeWidth={1.5} color="#F2B4CC" />
              <Text style={styles.emptyTitle}>Your garden is listening</Text>
              <Text style={styles.emptySubtext}>Begin with one honest line or a quiet voice note</Text>
            </View>
          ) : (
            <>
              {renderHeroEntryCard(recentEntries[0])}
              {recentEntries.slice(1).map(renderEntryCard)}
            </>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating write button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
        onPress={handleNewEntry}
      >
        <Text style={styles.fabIcon}>✦</Text>
        <Text style={styles.fabLabel}>Write</Text>
      </Pressable>

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
            <Text style={styles.modalTitle}>
              {entryMode === 'one-line' ? 'One-Line Check-In' : entryMode === 'voice' ? 'Voice Reflection' : 'Guided Reflection'}
            </Text>
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
              style={[styles.textInput, entryMode === 'one-line' && styles.oneLineInput]}
              placeholder={entryMode === 'one-line' ? 'Today I feel...' : 'Write what wants to be witnessed...'}
              placeholderTextColor="#B8A99E"
              value={entryContent}
              onChangeText={setEntryContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            {/* Word count */}
            {entryContent.length > 0 && (
              <Text style={styles.wordCount}>
                {entryContent.trim().split(/\s+/).filter(Boolean).length} words
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Garden completion moment */}
      <Modal
        visible={showGardenSaved}
        animationType="fade"
        transparent
        onRequestClose={() => setShowGardenSaved(false)}
      >
        <Pressable style={styles.savedOverlay} onPress={() => setShowGardenSaved(false)}>
          <Pressable style={styles.savedCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.savedEmoji}>🌿</Text>
            <Text style={styles.savedTitle}>Your garden heard you</Text>
            <Text style={styles.savedBody}>
              This reflection became a quiet part of your glow-up. Your {plant.currentStage} is still growing.
            </Text>
            <Pressable
              onPress={() => setShowGardenSaved(false)}
              style={({ pressed }) => [styles.savedButton, pressed && { opacity: 0.86 }]}
            >
              <Text style={styles.savedButtonText}>Return softly</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Entry Modal */}
      <Modal
        visible={!!editingEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingEntry(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditingEntry(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edit Entry</Text>
            <Pressable onPress={handleSaveEdit}>
              <Text style={styles.modalSave}>Save</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent}>
            {editingEntry && (() => {
              const savedPrompt = REFLECTION_PROMPTS.find(p => p.id === editingEntry.promptUsed);
              return savedPrompt ? (
                <View style={styles.modalPromptBox}>
                  <Text style={styles.promptLabel}>PROMPT</Text>
                  <Text style={styles.promptText}>{savedPrompt.text}</Text>
                </View>
              ) : null;
            })()}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.modalLabel}>How were you feeling?</Text>
              <View style={styles.moodRow}>
                {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
                  <Pressable
                    key={mood}
                    style={[styles.moodPill, editMood === mood && styles.moodPillSelected]}
                    onPress={() => setEditMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_INFO[mood].emoji}</Text>
                    <Text style={[styles.moodLabel, editMood === mood && styles.moodLabelSelected]}>
                      {MOOD_INFO[mood].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Write your thoughts..."
              placeholderTextColor="#B8A99E"
              value={editContent}
              onChangeText={setEditContent}
              multiline
              textAlignVertical="top"
            />
            {editContent.length > 0 && (
              <Text style={styles.wordCount}>
                {editContent.trim().split(/\s+/).filter(Boolean).length} words
              </Text>
            )}
            <Pressable style={styles.deleteEntryBtn} onPress={handleDeleteEntry}>
              <Text style={styles.deleteEntryText}>Delete Entry</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* View All / Search Modal */}
      <Modal
        visible={showAllEntries}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowAllEntries(false); setSearchQuery(''); }}
      >
        <View style={styles.allEntriesModal}>
          <View style={styles.allEntriesHeader}>
            <Text style={styles.allEntriesTitle}>All Entries</Text>
            <Pressable onPress={() => { setShowAllEntries(false); setSearchQuery(''); }}>
              <Text style={styles.modalCancel}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search entries..."
              placeholderTextColor="#B8A9A5"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <ScrollView
            style={styles.allEntriesScroll}
            contentContainerStyle={styles.allEntriesContent}
            showsVerticalScrollIndicator={false}
          >
            {allFilteredEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'No entries found' : 'No entries yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try a different search term' : 'Start writing to capture your thoughts'}
                </Text>
              </View>
            ) : (
              allFilteredEntries.map(renderEntryCard)
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 70 },

  // Hero journal title (inside prompt card)
  heroJournalEyebrow: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(58,46,43,0.6)', letterSpacing: 1.4, marginBottom: 10 },
  heroJournalTitle: { fontSize: 30, fontFamily: 'Raleway-SemiBold', color: '#1A0A06', lineHeight: 36, letterSpacing: -0.4, marginBottom: 8 },
  heroJournalSub: { fontSize: 13, fontFamily: 'DMSans', color: 'rgba(58,26,16,0.66)', lineHeight: 19, marginBottom: 4 },

  // Floating write button
  fab: {
    position: 'absolute',
    bottom: 106,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C45A82',
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    shadowColor: '#C45A82',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  fabIcon: { fontSize: 14, color: '#FEFAF9' },
  fabLabel: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#FEFAF9' },

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
  guidedButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(58,46,43,0.10)',
  },
  guidedButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#5C3D2E',
  },

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

  // Mood trend chart
  trendCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    marginBottom: spacing.lg, ...shadows.sm,
  },
  trendTitle: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#5C3D2E',
    letterSpacing: 1.2, marginBottom: 14,
  },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trendDayCol: { alignItems: 'center', gap: 6 },
  trendDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  trendDotEmpty: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  trendDotToday: {
    borderWidth: 2, borderColor: '#C45A82',
  },
  trendEmoji: { fontSize: 16 },
  trendDayLabel: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold', color: '#B8A9A5',
  },

  // Prompt — gradient hero
  promptCardWrap: {
    borderRadius: 28, marginBottom: spacing.xl,
    shadowColor: 'rgba(155,134,212,1)', shadowOpacity: 0.2,
    shadowRadius: 24, shadowOffset: { width: 0, height: 4 },
  },
  promptCard: { borderRadius: 28, padding: 28, overflow: 'hidden' },
  promptLabel: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#6B5B52', letterSpacing: 0.8, marginBottom: 8 },
  promptText: { fontSize: 15, fontFamily: 'DMSans', color: '#1A0A06', fontStyle: 'italic', lineHeight: 22 },

  // Entries
  entriesSection: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sectionTitleBlock: { flex: 1 },
  sectionTitle: { fontSize: 20, fontFamily: 'Raleway-SemiBold', fontWeight: '600', color: '#1A0A06' },
  sectionSubtitle: { fontSize: 12, fontFamily: 'DMSans', color: '#B8A9A5', marginTop: 3 },
  viewAllLink: { fontSize: 13, fontFamily: 'DMSans', color: '#C45A82', paddingTop: 4 },

  // Hero entry card
  heroEntryCard: { borderRadius: 20, marginBottom: 10, overflow: 'hidden', ...shadows.md },
  heroEntryInner: { borderRadius: 20, padding: 20 },
  heroEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroEntryDateLabel: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#5C3D2E', letterSpacing: 0.8, marginBottom: 2, textTransform: 'uppercase' },
  heroEntryDayNum: { fontSize: 13, fontFamily: 'DMSans', fontWeight: '600', color: '#1A0A06' },
  heroEntryMoodChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  heroEntryMoodText: { fontSize: 12, fontFamily: 'DMSans', fontWeight: '600', color: '#3A2E2B' },
  heroEntryPrompt: { fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 13, color: '#5C3D2E', lineHeight: 19, marginBottom: 8 },
  heroEntryContent: { fontSize: 15, fontFamily: 'DMSans', color: '#1A0A06', lineHeight: 22, marginBottom: 10 },
  heroEntryEditHint: { fontSize: 12, fontFamily: 'DMSans', color: '#C45A82', textAlign: 'right' },

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

  entryEditHint: { fontSize: 20, color: '#EADBD4', marginLeft: 4, alignSelf: 'center' as const },

  // Cross-prompt card
  crossPromptCard: { borderRadius: 16, overflow: 'hidden', marginBottom: spacing.lg },
  crossPromptInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
  },
  crossPromptEmoji: { fontSize: 22 },
  crossPromptTitle: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '600', color: '#1A0A06', marginBottom: 2 },
  crossPromptSub: { fontFamily: 'DMSans', fontSize: 12, color: '#5C3D2E', lineHeight: 17 },
  crossPromptArrow: { fontSize: 20, color: '#9B86D4', marginLeft: 4 },

  // Delete entry
  deleteEntryBtn: {
    marginTop: 28, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(196,90,130,0.3)',
  },
  deleteEntryText: { fontFamily: 'DMSans', fontSize: 14, fontWeight: '600', color: '#C45A82' },

  // Word count
  wordCount: {
    fontSize: 12, fontFamily: 'DMSans', color: '#B8A9A5',
    textAlign: 'right', marginTop: 8,
  },

  // New entry modal
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
  oneLineInput: { minHeight: 112 },

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

  // View all / search modal
  allEntriesModal: { flex: 1, backgroundColor: '#EDD5CB' },
  allEntriesHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#EADBD4',
  },
  allEntriesTitle: { fontSize: 18, fontFamily: 'Raleway-SemiBold', fontWeight: '600', color: '#1A0A06' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: spacing.lg, marginBottom: 4,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    ...shadows.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1, fontFamily: 'DMSans', fontSize: 15, color: '#1A0A06',
  },
  allEntriesScroll: { flex: 1 },
  allEntriesContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  // Mood Ritual Card
  moodRitualCard: {
    borderRadius: 24,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  moodRitualInner: {
    borderRadius: 24,
    padding: 22,
  },
  moodRitualLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#5C3D2E',
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  moodDisplayArea: {
    marginBottom: 20,
  },
  moodDisplayInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moodDisplayOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  moodDisplayEmoji: { fontSize: 38 },
  moodDisplayText: { flex: 1 },
  moodDisplayName: {
    fontSize: 22,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#1A0A06',
    marginBottom: 4,
  },
  moodDisplayDesc: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6B5B52',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  moodEmptyArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  moodEmptyEmoji: { fontSize: 40, marginBottom: 8 },
  moodEmptyTitle: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 18,
    color: '#1A0A06',
    marginBottom: 3,
  },
  moodEmptyHint: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: '#B8A9A5',
    fontStyle: 'italic',
  },
  moodChartHeader: { marginBottom: 10 },
  moodChartLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#B8A9A5',
    letterSpacing: 0.8,
  },
  moodBarChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  moodBarTrack: {
    height: 56,
    width: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  moodBarTrackToday: {
    borderWidth: 1.5,
    borderColor: '#C45A82',
  },
  moodBarFill: {
    width: 22,
    borderRadius: 8,
  },
  moodBarDayLabel: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: '#B8A9A5',
  },
  moodSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodSelectorPill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  moodIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  moodSelectorEmoji: { fontSize: 24 },
  moodSelectorLabel: {
    fontSize: 9,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#B8A9A5',
  },
  moodSelectorLabelSelected: {
    color: '#C45A82',
  },

  // Garden saved modal
  savedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,10,6,0.36)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  savedCard: {
    backgroundColor: '#FFFAF8',
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,90,130,0.16)',
    shadowColor: '#3A1A10',
    shadowOpacity: 0.16,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
  },
  savedEmoji: { fontSize: 42, marginBottom: 12 },
  savedTitle: {
    fontSize: 27,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A1A10',
    textAlign: 'center',
    marginBottom: 10,
  },
  savedBody: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#7A6258',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  savedButton: {
    backgroundColor: '#C45A82',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 28,
  },
  savedButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
