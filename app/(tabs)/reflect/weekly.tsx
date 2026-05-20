import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { spacing, borderRadius, shadows } from '../../../src/theme';
import { useTheme } from '../../../src/context';
import { supabase } from '../../../lib/supabase';
import {
  getWeekStart,
  getWeekEnd,
  formatDateISO,
  formatWeekRange,
  fetchDailyForWeek,
  computeWeeklyStats,
  getWeeklyPrompt,
  getWeeklyRecap,
  saveWeeklyRecap,
  WeeklyStats,
} from '../../../src/lib/weeklyRecap';
import { DailyReflection } from '../../../src/lib/reflections';

export default function WeeklyRecapScreen() {
  const router = useRouter();
  const { theme, isDark, gradients } = useTheme();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart());
  const [weekEnd, setWeekEnd] = useState<Date>(getWeekEnd(getWeekStart()));
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [content, setContent] = useState('');
  const [existingRecap, setExistingRecap] = useState<DailyReflection | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const prompt = getWeeklyPrompt();

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || 'local';
      setUserId(uid);

      // Calculate current week
      const start = getWeekStart();
      const end = getWeekEnd(start);
      setWeekStart(start);
      setWeekEnd(end);

      // Fetch daily reflections for this week
      const dailyEntries = await fetchDailyForWeek(uid, start, end);
      const weeklyStats = computeWeeklyStats(dailyEntries);
      setStats(weeklyStats);

      // Check for existing weekly recap
      const existing = await getWeeklyRecap(uid, start);
      if (existing) {
        setExistingRecap(existing);
        setContent(existing.content || '');
        setIsSaved(true);
      }
    } catch (error) {
      console.error('[WeeklyRecap] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await saveWeeklyRecap({
        user_id: userId || '',
        week_start: formatDateISO(weekStart),
        week_end: formatDateISO(weekEnd),
        prompt_text: prompt,
        content: content.trim() || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSaved(true);
      setShowToast(true);

      // Navigate back after showing toast
      setTimeout(() => {
        setShowToast(false);
        router.back();
      }, 1500);
    } catch (error) {
      console.error('[WeeklyRecap] Error saving:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
            Loading your week...
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
          <Text style={[styles.toastText, { color: theme.text }]}>
            Your week counts 🌱
          </Text>
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
          <Text style={[styles.title, { color: theme.text }]}>Weekly Recap</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            A gentle look back—no pressure.
          </Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>
            {formatWeekRange(weekStart, weekEnd)}
          </Text>
        </View>

        {/* Saved Badge */}
        {isSaved && (
          <View style={[styles.savedBadge, { backgroundColor: isDark ? 'rgba(158, 207, 176, 0.15)' : 'rgba(158, 207, 176, 0.2)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Check size={14} color={theme.accent} />
              <Text style={[styles.savedBadgeText, { color: theme.accent }]}>
                Saved
              </Text>
            </View>
          </View>
        )}

        {/* Card 1: Week at a Glance */}
        <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            This Week at a Glance
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {stats?.daysReflected || 0}/{stats?.totalDays || 7}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Days reflected
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {stats?.moodEmoji || '—'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stats?.mostCommonMood || 'No mood data'}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Snippets (only show if we have snippets) */}
        {stats && stats.snippets.length > 0 && (
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Your week in snippets
            </Text>
            <View style={styles.snippetsContainer}>
              {stats.snippets.map((snippet, index) => (
                <View
                  key={index}
                  style={[styles.snippetItem, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(244, 198, 204, 0.08)',
                  }]}
                >
                  <Text style={[styles.snippetText, { color: theme.textSecondary }]}>
                    "{snippet}"
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Card 3: Weekly Question */}
        <View style={[styles.promptCard, {
          backgroundColor: isDark ? 'rgba(244, 198, 204, 0.08)' : 'rgba(244, 198, 204, 0.08)',
          borderColor: isDark ? 'rgba(244, 198, 204, 0.2)' : 'rgba(244, 198, 204, 0.2)',
        }]}>
          <Text style={[styles.promptLabel, { color: theme.primary }]}>
            Weekly Question
          </Text>
          <Text style={[styles.promptText, { color: theme.text }]}>
            {prompt}
          </Text>
        </View>

        {/* Text Input */}
        <View style={[styles.inputCard, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.9)' }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: theme.borderLight,
                color: theme.text,
              },
            ]}
            placeholder="One thing that made it easier was…"
            placeholderTextColor={theme.textMuted}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              setIsSaved(false);
            }}
            multiline
            maxLength={800}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.textMuted }]}>
            {content.length}/800
          </Text>
        </View>

        {/* Buttons */}
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
              <Text style={styles.primaryButtonText}>
                {isSaved ? 'Update weekly recap' : 'Save weekly recap'}
              </Text>
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
            onPress={handleSkip}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
              Skip
            </Text>
          </Pressable>
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  savedBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.md,
  },
  savedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: spacing.md,
  },
  snippetsContainer: {
    gap: spacing.sm,
  },
  snippetItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  snippetText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
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
    fontSize: 17,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  inputCard: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
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
