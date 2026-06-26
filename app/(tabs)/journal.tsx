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
import { Sparkles, ChevronDown } from 'lucide-react-native';
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
  const [entriesExpanded, setEntriesExpanded] = useState(true);

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
    setSelectedMood(mood);
    setCurrentPrompt(getMoodPrompt(mood));
    setEntryMode('guided');
    setIsModalVisible(true);
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
        {/* Hero: Daily check-in + primary CTA */}
        <View style={styles.heroCardWrap}>
          <View style={styles.heroCardEdge} />
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>journal</Text>
            <Text style={styles.heroTitle}>
              Let your garden{'\n'}
              <Text style={styles.heroTitleItalic}>hear you</Text>
            </Text>
            <Text style={styles.heroSub}>
              {todayMood
                ? `Feeling ${MOOD_INFO[todayMood].label.toLowerCase()}. Your prompt will meet you there.`
                : "One honest line. That's all today needs."}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryCTA, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => openEntryFlow('guided')}
            >
              <Text style={styles.primaryCTAText}>WRITE TODAY</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryCTA,
                recordingState === 'recording' && styles.secondaryCTARecording,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleMicPress}
            >
              <Text style={styles.secondaryCTAIcon}>
                {recordingState === 'recording' ? '⏹' : '🎙'}
              </Text>
              <Text style={styles.secondaryCTAText}>
                {recordingState === 'recording'
                  ? `Stop  ${formatRecordingTime(durationMs)}`
                  : 'Or talk it out'}
              </Text>
            </Pressable>
          </View>
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

        {/* How You Feel Card */}
        <View style={styles.feelCardWrap}>
          <View style={styles.feelCardEdge} />
          <View style={styles.feelCard}>
            <Text style={styles.feelEyebrow}>how you feel</Text>

            {/* Mood display */}
            {todayMood ? (
              <View style={styles.feelDisplayRow}>
                <View style={[styles.feelDisplayOrb, { backgroundColor: MOOD_INFO[todayMood].color, shadowColor: MOOD_INFO[todayMood].color }]}>
                  <Text style={styles.feelDisplayEmoji}>{MOOD_INFO[todayMood].emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feelDisplayName}>{MOOD_INFO[todayMood].label}</Text>
                  <Text style={styles.feelDisplayDesc}>{MOOD_DESCRIPTIONS[todayMood]}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.feelPrompt}>How are you today?</Text>
            )}

            {/* 7-day mood dots */}
            <Text style={styles.feelWeekLabel}>this week</Text>
            <View style={styles.feelDotRow}>
              {moodTrend.map(({ key, dayLabel, mood, isToday }) => (
                <View key={key} style={styles.feelDotCol}>
                  <View
                    style={[
                      styles.feelDot,
                      mood ? { backgroundColor: MOOD_INFO[mood].color } : styles.feelDotEmpty,
                      isToday && styles.feelDotToday,
                    ]}
                  />
                  <Text style={[styles.feelDotLabel, isToday && { color: '#C45A82' }]}>
                    {dayLabel}
                  </Text>
                </View>
              ))}
            </View>

            {/* Mood selector */}
            <Text style={styles.feelSelectorHint}>
              Tap how you feel — <Text style={styles.feelSelectorHintAccent}>a prompt will meet you there</Text>
            </Text>
            <View style={styles.feelSelectorRow}>
              {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
                <Pressable
                  key={mood}
                  style={[
                    styles.feelSelectorPill,
                    todayMood === mood && styles.feelSelectorPillActive,
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Text style={styles.feelSelectorEmoji}>{MOOD_INFO[mood].emoji}</Text>
                  <Text
                    style={[
                      styles.feelSelectorLabel,
                      todayMood === mood && styles.feelSelectorLabelActive,
                    ]}
                  >
                    {MOOD_INFO[mood].label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
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
          <Pressable
            style={styles.sectionHeaderRow}
            onPress={() => recentEntries.length > 0 && setEntriesExpanded((e) => !e)}
            disabled={recentEntries.length === 0}
          >
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              {weekStats ? <Text style={styles.sectionSubtitle}>{weekStats}</Text> : null}
            </View>
            {recentEntries.length > 0 && (
              <View
                style={[
                  styles.sectionChevron,
                  entriesExpanded && styles.sectionChevronOpen,
                ]}
              >
                <ChevronDown size={18} color="#C45A82" strokeWidth={2.4} />
              </View>
            )}
          </Pressable>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Sparkles size={40} strokeWidth={1.5} color="#F2B4CC" />
              <Text style={styles.emptyTitle}>Your garden is listening</Text>
              <Text style={styles.emptySubtext}>Begin with one honest line or a quiet voice note</Text>
            </View>
          ) : entriesExpanded ? (
            <>
              {recentEntries.map(renderEntryCard)}
              <Pressable
                onPress={() => setShowAllEntries(true)}
                style={({ pressed }) => [styles.viewAllInline, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.viewAllInlineText}>View all entries  ›</Text>
              </Pressable>
            </>
          ) : null}
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

  // Hero card (deck grammar: white + rose edge + plum shadow)
  heroCardWrap: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    borderRadius: 22,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  heroCardEdge: {
    width: 6,
    backgroundColor: '#C45A82',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  heroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: 'rgba(58,46,43,0.18)',
    padding: 24,
  },
  heroEyebrow: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#1A0A06',
    lineHeight: 36,
    marginBottom: 12,
  },
  heroTitleItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.7)',
    lineHeight: 21,
    marginBottom: 22,
  },
  primaryCTA: {
    backgroundColor: '#1A1028',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1A1028',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryCTAText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
  secondaryCTA: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.22)',
  },
  secondaryCTARecording: {
    backgroundColor: 'rgba(196,90,130,0.10)',
    borderColor: '#C45A82',
  },
  secondaryCTAIcon: { fontSize: 15 },
  secondaryCTAText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: 0.4,
  },

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

  // Prompt label (still used by edit modal)
  promptLabel: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#6B5B52', letterSpacing: 0.8, marginBottom: 8 },
  promptText: { fontSize: 15, fontFamily: 'DMSans', color: '#1A0A06', fontStyle: 'italic', lineHeight: 22 },

  // Entries
  entriesSection: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sectionTitleBlock: { flex: 1 },
  sectionTitle: { fontSize: 20, fontFamily: 'Raleway-SemiBold', fontWeight: '600', color: '#1A0A06' },
  sectionSubtitle: { fontSize: 12, fontFamily: 'DMSans', color: '#B8A9A5', marginTop: 3 },
  sectionChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C45A82',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  viewAllInline: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.18)',
  },
  viewAllInlineText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#C45A82',
    letterSpacing: 0.4,
  },

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

  // "How You Feel" Card (deck grammar)
  feelCardWrap: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderRadius: 22,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  feelCardEdge: {
    width: 6,
    backgroundColor: '#C45A82',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  feelCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: 'rgba(58,46,43,0.18)',
    padding: 22,
  },
  feelEyebrow: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  feelDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  feelDisplayOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  feelDisplayEmoji: { fontSize: 28 },
  feelDisplayName: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#1A0A06',
    marginBottom: 2,
  },
  feelDisplayDesc: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.66)',
    lineHeight: 18,
  },
  feelPrompt: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#1A0A06',
    marginBottom: 22,
    lineHeight: 28,
  },
  feelWeekLabel: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  feelDotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingHorizontal: 2,
  },
  feelDotCol: { alignItems: 'center', gap: 6 },
  feelDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  feelDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.22)',
  },
  feelDotToday: {
    borderWidth: 2,
    borderColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  feelDotLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.5)',
    letterSpacing: 0.4,
  },
  feelSelectorHint: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.62)',
    lineHeight: 19,
    marginBottom: 12,
    textAlign: 'center',
  },
  feelSelectorHintAccent: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  feelSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  feelSelectorPill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.12)',
  },
  feelSelectorPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C45A82',
    borderWidth: 2,
    shadowColor: '#C45A82',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  feelSelectorEmoji: { fontSize: 22 },
  feelSelectorLabel: {
    fontSize: 9,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 0.3,
  },
  feelSelectorLabelActive: {
    color: '#C45A82',
    fontWeight: '700',
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
