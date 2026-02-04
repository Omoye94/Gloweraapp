import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useJournalStore, usePlantStore } from '../../src/stores';
import { Card, Button } from '../../src/components/ui';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';
import { formatShortDate, formatDisplayDate } from '../../src/utils/dateUtils';
import { getWeeklyPrompt, getDailyPrompt } from '../../src/constants/reflectionPrompts';
import { MOOD_INFO, Mood } from '../../src/types/journal';
import { POINT_VALUES } from '../../src/utils/pointsCalculator';

export default function JournalScreen() {
  const {
    entries,
    addEntry,
    getRecentEntries,
    shouldShowWeeklyPrompt,
    markWeeklyPromptShown,
  } = useJournalStore();
  const { addPoints } = usePlantStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [currentPrompt, setCurrentPrompt] = useState(getDailyPrompt());
  const [todayMood, setTodayMood] = useState<Mood | undefined>();

  const recentEntries = getRecentEntries(10);
  const showWeeklyPrompt = shouldShowWeeklyPrompt();

  const handleNewEntry = () => {
    setCurrentPrompt(getDailyPrompt());
    setIsModalVisible(true);
  };

  const handleWeeklyReflection = () => {
    setCurrentPrompt(getWeeklyPrompt());
    markWeeklyPromptShown();
    setIsModalVisible(true);
  };

  const handleSaveEntry = () => {
    if (entryContent.trim()) {
      addEntry(entryContent.trim(), selectedMood, currentPrompt.id);
      addPoints(POINT_VALUES.journalEntry);
      setEntryContent('');
      setSelectedMood(undefined);
      setIsModalVisible(false);
    }
  };

  const closeModal = () => {
    setEntryContent('');
    setSelectedMood(undefined);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF9F5', '#FFEDE5', '#FFF5F7']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reflections</Text>
            <Text style={styles.subtitle}>Your thoughts, your space</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.newButton, pressed && styles.newButtonPressed]}
            onPress={handleNewEntry}
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </Pressable>
        </View>

        {/* Mood Check-in */}
        <View style={styles.moodCheckin}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,249,245,0.95)']}
            style={styles.moodCheckinGradient}
          />
          <Text style={styles.moodCheckinLabel}>How are you feeling today?</Text>
          <View style={styles.moodCheckinOptions}>
            {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodCheckinOption,
                  todayMood === mood && styles.moodCheckinSelected,
                ]}
                onPress={() => setTodayMood(mood)}
              >
                <Text style={styles.moodCheckinEmoji}>{MOOD_INFO[mood].emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {todayMood && (
            <Text style={styles.moodCheckinFeedback}>
              Feeling {MOOD_INFO[todayMood].label.toLowerCase()} today ✨
            </Text>
          )}
        </View>

        {/* Weekly Prompt */}
        {showWeeklyPrompt && (
          <View style={styles.weeklyPromptCard}>
            <LinearGradient
              colors={['rgba(255,153,181,0.12)', 'rgba(255,177,153,0.12)']}
              style={styles.weeklyPromptGradient}
            />
            <Text style={styles.weeklyPromptLabel}>Weekly Reflection</Text>
            <Text style={styles.weeklyPromptText}>{getWeeklyPrompt().text}</Text>
            <Pressable
              style={({ pressed }) => [styles.reflectButton, pressed && { opacity: 0.8 }]}
              onPress={handleWeeklyReflection}
            >
              <Text style={styles.reflectButtonText}>Reflect Now</Text>
            </Pressable>
          </View>
        )}

        {/* Daily Prompt */}
        <View style={styles.dailyPromptCard}>
          <Text style={styles.dailyPromptLabel}>Today's Prompt</Text>
          <Text style={styles.dailyPromptText}>{currentPrompt.text}</Text>
        </View>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>Your story begins here</Text>
              <Text style={styles.emptySubtext}>
                Start writing to capture your thoughts
              </Text>
            </View>
          ) : (
            recentEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>{formatShortDate(entry.date)}</Text>
                  {entry.mood && (
                    <Text style={styles.entryMood}>{MOOD_INFO[entry.mood].emoji}</Text>
                  )}
                </View>
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* New Entry Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FFF9F5', '#FFEDE5']}
            style={styles.modalGradient}
          />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Entry</Text>
            <TouchableOpacity onPress={handleSaveEntry}>
              <Text style={[styles.modalSave, !entryContent.trim() && styles.modalSaveDisabled]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Prompt */}
            <View style={styles.promptBox}>
              <Text style={styles.promptLabel}>Prompt</Text>
              <Text style={styles.promptText}>{currentPrompt.text}</Text>
            </View>

            {/* Mood Selector */}
            <View style={styles.moodSection}>
              <Text style={styles.moodLabel}>How are you feeling?</Text>
              <View style={styles.moodOptions}>
                {(Object.keys(MOOD_INFO) as Mood[]).map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodOption,
                      selectedMood === mood && styles.moodOptionSelected,
                    ]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_INFO[mood].emoji}</Text>
                    <Text style={styles.moodName}>{MOOD_INFO[mood].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Write your thoughts..."
              placeholderTextColor={theme.textMuted}
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
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  newButton: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    ...shadows.glow,
  },
  newButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moodCheckin: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.md,
  },
  moodCheckinGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  moodCheckinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.md,
  },
  moodCheckinOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  moodCheckinOption: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCheckinSelected: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(255, 153, 181, 0.15)',
  },
  moodCheckinEmoji: {
    fontSize: 24,
  },
  moodCheckinFeedback: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
    marginTop: spacing.md,
  },
  weeklyPromptCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 181, 0.2)',
  },
  weeklyPromptGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  weeklyPromptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  weeklyPromptText: {
    fontSize: 15,
    color: theme.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  reflectButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
  reflectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  dailyPromptCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  dailyPromptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  dailyPromptText: {
    fontSize: 15,
    color: theme.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  entriesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    letterSpacing: 0.3,
  },
  entryMood: {
    fontSize: 18,
  },
  entryContent: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  modalCancel: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
  },
  modalSaveDisabled: {
    color: theme.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  promptBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  promptText: {
    fontSize: 15,
    color: theme.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  moodSection: {
    marginBottom: spacing.lg,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.sm,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.borderLight,
    backgroundColor: 'rgba(255,255,255,0.8)',
    minWidth: 64,
  },
  moodOptionSelected: {
    backgroundColor: 'rgba(255, 153, 181, 0.15)',
    borderColor: theme.primary,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodName: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 200,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.borderLight,
    lineHeight: 24,
  },
});
