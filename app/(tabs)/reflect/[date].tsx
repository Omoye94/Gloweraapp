import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Search } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { useTheme } from '../../../src/context';
import { supabase } from '../../../lib/supabase';
import { DailyReflection, REFLECTION_MOODS, ReflectionMood } from '../../../src/lib/reflections';
import {
  fetchReflectionByDate,
  updateReflection,
  deleteReflection,
  formatDateDisplay,
} from '../../../src/lib/reflectionHistory';

export default function ReflectionDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { theme, isDark, gradients } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState<string>('local');
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMood, setEditMood] = useState<ReflectionMood | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadReflection();
  }, [date]);

  const loadReflection = async () => {
    if (!date) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || 'local';
      setUserId(uid);

      const data = await fetchReflectionByDate(uid, date);
      if (data) {
        setReflection(data);
        setEditMood(data.mood as ReflectionMood | null);
        setEditContent(data.content || '');
      }
    } catch (error) {
      console.error('[Detail] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(false);
    // Reset to original values
    setEditMood(reflection?.mood as ReflectionMood | null);
    setEditContent(reflection?.content || '');
  };

  const handleMoodSelect = (mood: ReflectionMood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMood(mood === editMood ? null : mood);
  };

  const handleSave = async () => {
    if (!date || isSaving) return;

    setIsSaving(true);
    try {
      const updated = await updateReflection(userId, date, {
        mood: editMood,
        content: editContent.trim() || null,
      });

      if (updated) {
        setReflection(updated);
        setIsEditing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('Saved ✓');
      }
    } catch (error) {
      console.error('[Detail] Error saving:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this reflection? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!date || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteReflection(userId, date);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('[Detail] Error deleting:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDeleting(false);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={isDark ? gradients.lavenderBloom as [string, string, ...string[]] : ['#FFF6F2', '#EADBD4']}
          style={styles.gradientBackground}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading reflection...
          </Text>
        </View>
      </View>
    );
  }

  if (!reflection) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={isDark ? gradients.lavenderBloom as [string, string, ...string[]] : ['#FFF6F2', '#EADBD4']}
          style={styles.gradientBackground}
        />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={18} color={theme.primary} />
              <Text style={[styles.backButtonText, { color: theme.primary }]}>Back</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Reflection not found
          </Text>
          <Text style={[styles.notFoundSubtitle, { color: theme.textSecondary }]}>
            This reflection may have been deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDark ? gradients.lavenderBloom as [string, string, ...string[]] : ['#FFF6F2', '#EADBD4']}
        style={styles.gradientBackground}
      />

      {/* Toast */}
      {showToast && (
        <View style={[styles.toast, { backgroundColor: isDark ? 'rgba(158, 207, 176, 0.9)' : 'rgba(158, 207, 176, 0.95)' }]}>
          <Text style={[styles.toastText, { color: theme.text }]}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            {formatDateDisplay(reflection.reflection_date)}
          </Text>
        </View>

        {/* Action Buttons */}
        {!isEditing && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleEdit}
            >
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>Edit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: isDark ? 'rgba(255,100,100,0.15)' : 'rgba(255,100,100,0.1)' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>Delete</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Prompt Card */}
        <View style={[styles.promptCard, {
          backgroundColor: isDark ? 'rgba(244, 198, 204, 0.08)' : 'rgba(244, 198, 204, 0.08)',
          borderColor: isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.15)',
        }]}>
          <Text style={[styles.promptLabel, { color: theme.primary }]}>Prompt</Text>
          <Text style={[styles.promptText, { color: theme.text }]}>
            {reflection.prompt_text}
          </Text>
        </View>

        {/* Mood */}
        {isEditing ? (
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Mood</Text>
            <View style={styles.moodGrid}>
              {REFLECTION_MOODS.map((mood) => (
                <Pressable
                  key={mood.id}
                  style={({ pressed }) => [
                    styles.moodChip,
                    {
                      backgroundColor: editMood === mood.id
                        ? (isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.12)')
                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)'),
                      borderColor: editMood === mood.id ? theme.primary : theme.borderLight,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { color: editMood === mood.id ? theme.primary : theme.textSecondary },
                  ]}>
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : reflection.mood ? (
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Mood</Text>
            <View style={styles.displayMoodRow}>
              {(() => {
                const moodInfo = REFLECTION_MOODS.find(m => m.id === reflection.mood);
                return moodInfo ? (
                  <>
                    <Text style={styles.displayMoodEmoji}>{moodInfo.emoji}</Text>
                    <Text style={[styles.displayMoodLabel, { color: theme.text }]}>
                      {moodInfo.label}
                    </Text>
                  </>
                ) : null;
              })()}
            </View>
          </View>
        ) : null}

        {/* Content */}
        {isEditing ? (
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Your reflection</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  borderColor: theme.borderLight,
                  color: theme.text,
                },
              ]}
              placeholder="Write your reflection..."
              placeholderTextColor={theme.textMuted}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: theme.textMuted }]}>
              {editContent.length}/500
            </Text>
          </View>
        ) : reflection.content ? (
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Your reflection</Text>
            <Text style={[styles.contentText, { color: theme.text }]}>
              {reflection.content}
            </Text>
          </View>
        ) : null}

        {/* Edit Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                isSaving && { opacity: 0.7 },
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save changes</Text>
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
                  borderColor: theme.borderLight,
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleCancelEdit}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notFoundSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promptCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  displayMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  displayMoodEmoji: {
    fontSize: 28,
  },
  displayMoodLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  textInput: {
    minHeight: 120,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  buttonContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.card,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
});
