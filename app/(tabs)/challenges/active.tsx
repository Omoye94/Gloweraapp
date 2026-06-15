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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Check } from 'lucide-react-native';
import { spacing, shadows } from '../../../src/theme';
import { ProgressBar } from '../../../src/components/ui';
import { useChallenges } from '../../../src/hooks/useChallenges';
import { usePlantStore } from '../../../src/stores';
import { POINT_VALUES } from '../../../src/utils/pointsCalculator';
import {
  toggleTask,
  saveReflection,
  completeChallenge,
  getCurrentDayIndex,
  formatDateISO,
  allTasksDone,
  someTasksDone,
  UserChallengeDay,
} from '../../../src/lib/challenges';

export default function ActiveChallengeScreen() {
  const router = useRouter();
  const { id: paramId } = useLocalSearchParams<{ id?: string }>();
  const {
    activeChallenges,
    getDaysFor,
    getTodayDayFor,
    isLoading,
    userId,
    refresh,
  } = useChallenges();
  const { addPoints, recordDailyActivity } = usePlantStore();

  const [selectedIdx, setSelectedIdx] = useState(0);

  // If a specific user_challenge_id was passed in the URL, select that one.
  useEffect(() => {
    if (!paramId || activeChallenges.length === 0) return;
    const idx = activeChallenges.findIndex((a) => a.userChallenge.id === paramId);
    if (idx >= 0) setSelectedIdx(idx);
  }, [paramId, activeChallenges]);
  const [localDay, setLocalDay] = useState<UserChallengeDay | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [showReflectionSaved, setShowReflectionSaved] = useState(false);

  // Clamp selection when the actives array shrinks (e.g. one completes).
  useEffect(() => {
    if (selectedIdx >= activeChallenges.length && activeChallenges.length > 0) {
      setSelectedIdx(activeChallenges.length - 1);
    }
  }, [activeChallenges.length, selectedIdx]);

  const activeChallenge = activeChallenges[selectedIdx] ?? null;
  const days = activeChallenge ? getDaysFor(activeChallenge.userChallenge.id) : [];
  const todayDay = activeChallenge ? getTodayDayFor(activeChallenge.userChallenge.id) : null;

  useEffect(() => {
    if (todayDay) {
      setLocalDay(todayDay);
      setReflectionText(todayDay.reflection_text ?? '');
    }
  }, [todayDay]);

  useEffect(() => {
    if (!isLoading && activeChallenges.length === 0) {
      router.replace('/(tabs)/challenges');
    }
  }, [isLoading, activeChallenges.length]);

  if (isLoading || !activeChallenge) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F2B4CC" />
        </View>
      </View>
    );
  }

  const { catalog, userChallenge } = activeChallenge;
  const dayIndex = getCurrentDayIndex(userChallenge);
  const dayNumber = dayIndex + 1;
  const progress = Math.round((dayNumber / catalog.duration) * 100);
  const today = formatDateISO();
  const pastEnd = today > userChallenge.end_date;

  const completedDayCount = days.filter(allTasksDone).length;
  const completionRatio = catalog.duration > 0 ? completedDayCount / catalog.duration : 0;
  const completionPercent = Math.round(completionRatio * 100);

  const handleToggleTask = async (taskIndex: number) => {
    if (!localDay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = await toggleTask(userId, localDay.id, taskIndex, localDay);
    setLocalDay(updated);

    if (allTasksDone(updated)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      recordDailyActivity();
      addPoints(POINT_VALUES.challengeDayComplete, true);
    }
  };

  const handleSaveReflection = async () => {
    if (!localDay) return;
    setIsSavingReflection(true);
    await saveReflection(userId, localDay.id, reflectionText, userChallenge.id);
    setIsSavingReflection(false);
    setShowReflectionSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setShowReflectionSaved(false), 2000);
  };

  const handleFinish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const challengeId = userChallenge.challenge_id;
    await completeChallenge(userId, userChallenge.id);
    recordDailyActivity();
    addPoints(POINT_VALUES.challengeFullComplete, true);
    await refresh();
    if (completionRatio >= 0.6) {
      router.replace(`/(tabs)/challenges/complete?challengeId=${challengeId}`);
    } else {
      router.replace('/(tabs)/challenges');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <Pressable style={styles.backButton} onPress={() => router.push('/(tabs)/challenges')}>
          <View style={styles.backRow}>
            <ChevronLeft size={18} color="#F2B4CC" />
            <Text style={styles.backText}>Challenges</Text>
          </View>
        </Pressable>

        {/* Active-challenge switcher — visible when 2+ active */}
        {activeChallenges.length > 1 && (
          <View style={styles.switcherWrap}>
            <Text style={styles.switcherLabel}>
              {activeChallenges.length} ACTIVE
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.switcherRow}
            >
              {activeChallenges.map((info, i) => {
                const isSelected = i === selectedIdx;
                return (
                  <Pressable
                    key={info.userChallenge.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedIdx(i);
                    }}
                    style={[styles.switcherPill, isSelected && styles.switcherPillActive]}
                  >
                    <Text style={styles.switcherEmoji}>{info.catalog.icon}</Text>
                    <Text
                      style={[styles.switcherPillText, isSelected && styles.switcherPillTextActive]}
                      numberOfLines={1}
                    >
                      {info.catalog.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{catalog.name}</Text>
          <Text style={styles.subtitle}>
            Today: Day {dayNumber} of {catalog.duration}
          </Text>
        </View>

        {/* Day-by-day progress */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR JOURNEY</Text>
          <View style={styles.dayDotsRow}>
            {days.map((d, i) => {
              const isCurrent = i === dayIndex;
              const isDone = allTasksDone(d);
              const isPartial = someTasksDone(d) && !isDone;
              return (
                <View key={i} style={styles.dayDotWrapper}>
                  <View
                    style={[
                      styles.dayDot,
                      isDone && { backgroundColor: '#F2B4CC' },
                      isPartial && { backgroundColor: 'rgba(244, 198, 204, 0.4)' },
                      !isDone && !isPartial && { backgroundColor: 'rgba(0,0,0,0.06)' },
                      isCurrent && styles.dayDotCurrent,
                    ]}
                  />
                  <Text style={[
                    styles.dayDotLabel,
                    { color: isCurrent ? '#F2B4CC' : '#9E8880' },
                  ]}>
                    {i + 1}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={completionPercent} height={4} color="#F2B4CC" />
            </View>
            <Text style={styles.progressLabel}>
              {completedDayCount}/{catalog.duration}
            </Text>
          </View>
        </View>

        {/* Tasks Card */}
        {localDay && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TODAY'S RITUALS</Text>

            {catalog.tasks.map((label, i) => {
              const done = localDay.tasks_done[i];
              return (
                <Pressable
                  key={i}
                  style={styles.taskRow}
                  onPress={() => handleToggleTask(i)}
                >
                  <View style={[
                    styles.checkbox,
                    { borderColor: done ? '#F2B4CC' : '#EADBD4' },
                    done && { backgroundColor: '#F2B4CC' },
                  ]}>
                    {done && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[
                    styles.taskText,
                    done && { textDecorationLine: 'line-through', opacity: 0.6 },
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            {allTasksDone(localDay) && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>
                  All done — you showed up today
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reflection Card */}
        {localDay && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>REFLECT (OPTIONAL)</Text>
            <Text style={styles.reflectionPrompt}>
              {catalog.reflectionPrompt}
            </Text>
            <TextInput
              style={styles.reflectionInput}
              placeholder="Write a few words..."
              placeholderTextColor="#B8A99E"
              value={reflectionText}
              onChangeText={setReflectionText}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.reflectionFooter}>
              <Text style={styles.charCount}>
                {reflectionText.length}/500
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.saveReflectionButton,
                  pressed && { opacity: 0.8 },
                  isSavingReflection && { opacity: 0.6 },
                ]}
                onPress={handleSaveReflection}
                disabled={isSavingReflection}
              >
                {isSavingReflection ? (
                  <ActivityIndicator size="small" color="#F2B4CC" />
                ) : (
                  <Text style={styles.saveReflectionText}>
                    {showReflectionSaved ? 'Saved' : 'Save'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Past end date — finish */}
        {pastEnd && (
          <Pressable
            style={({ pressed }) => [
              styles.finishButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleFinish}
          >
            <Text style={styles.finishButtonText}>Finish gently</Text>
          </Pressable>
        )}

        {/* Encouragement */}
        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            You showed up — that matters.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6F2' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 60 },

  backButton: { marginBottom: spacing.md },
  // Active-challenge switcher
  switcherWrap: { marginBottom: spacing.md },
  switcherLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    letterSpacing: 1.6,
    color: '#A89A93',
    marginBottom: 10,
    marginLeft: 4,
  },
  switcherRow: { gap: 8, paddingRight: 16 },
  switcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(58,46,43,0.08)',
    maxWidth: 220,
  },
  switcherPillActive: {
    backgroundColor: '#F2B4CC',
    borderColor: '#F2B4CC',
  },
  switcherEmoji: { fontSize: 16 },
  switcherPillText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#6B5B52',
  },
  switcherPillTextActive: {
    color: '#FFFFFF',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 15, fontFamily: 'DMSans', color: '#F2B4CC' },

  header: { marginBottom: spacing.lg },
  title: { fontSize: 24, fontFamily: 'Satoshi-Medium', color: '#3A2E2B', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontFamily: 'DMSans', color: '#6B5B52', marginTop: 4 },

  card: {
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#6B5B52',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  dayDotsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 4, marginBottom: spacing.md, justifyContent: 'center',
  },
  dayDotWrapper: { alignItems: 'center', width: 28 },
  dayDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 2 },
  dayDotCurrent: { borderWidth: 2.5, borderColor: '#F2B4CC', width: 16, height: 16, borderRadius: 8 },
  dayDotLabel: { fontSize: 9, fontFamily: 'DMSans' },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel: { fontSize: 12, fontFamily: 'SpaceMono-Bold', color: '#6B5B52', minWidth: 30, textAlign: 'right' },

  taskRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: 8 },
  checkbox: {
    width: 24, height: 24, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  taskText: { fontSize: 15, fontFamily: 'DMSans', color: '#3A2E2B', lineHeight: 22, flex: 1 },

  doneBadge: {
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, alignItems: 'center', marginTop: 4,
    backgroundColor: 'rgba(168, 185, 154, 0.15)',
  },
  doneBadgeText: { fontSize: 14, fontFamily: 'DMSans', color: '#A8B99A' },

  reflectionPrompt: { fontSize: 16, fontFamily: 'DMSans', fontStyle: 'italic', color: '#3A2E2B', lineHeight: 24, marginBottom: spacing.md },
  reflectionInput: {
    minHeight: 100, borderRadius: 12, borderWidth: 1, borderColor: '#EADBD4',
    padding: spacing.lg, fontSize: 15, fontFamily: 'DMSans', color: '#3A2E2B', lineHeight: 22,
    backgroundColor: '#FFF6F2',
  },
  reflectionFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  charCount: { fontSize: 12, fontFamily: 'DMSans', color: '#9E8880' },
  saveReflectionButton: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 9999, borderWidth: 1.5, borderColor: '#F2B4CC',
  },
  saveReflectionText: { fontSize: 13, fontFamily: 'DMSans', color: '#F2B4CC' },

  finishButton: {
    backgroundColor: '#3A2E2B', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: spacing.md,
  },
  finishButtonText: { fontSize: 16, fontFamily: 'DMSans', color: '#F2B4CC' },

  encouragement: { alignItems: 'center', marginTop: spacing.md },
  encouragementText: { fontSize: 14, fontFamily: 'DMSans', fontStyle: 'italic', color: '#9E8880' },

  bottomSpacer: { height: 120 },
});
