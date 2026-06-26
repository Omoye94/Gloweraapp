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
  // null means "auto-select today's day"; tapping a dot sets it explicitly.
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Reset day selection when switching between active challenges.
  useEffect(() => {
    setSelectedDayIndex(null);
  }, [selectedIdx]);

  // Clamp selection when the actives array shrinks (e.g. one completes).
  useEffect(() => {
    if (selectedIdx >= activeChallenges.length && activeChallenges.length > 0) {
      setSelectedIdx(activeChallenges.length - 1);
    }
  }, [activeChallenges.length, selectedIdx]);

  const activeChallenge = activeChallenges[selectedIdx] ?? null;
  const days = activeChallenge ? getDaysFor(activeChallenge.userChallenge.id) : [];
  const todayDay = activeChallenge ? getTodayDayFor(activeChallenge.userChallenge.id) : null;

  // Day index the user is currently viewing — defaults to today.
  const currentDayIndex = activeChallenge ? getCurrentDayIndex(activeChallenge.userChallenge) : 0;
  const effectiveDayIndex = selectedDayIndex ?? currentDayIndex;
  const viewedDay = days[effectiveDayIndex] ?? todayDay;

  useEffect(() => {
    if (viewedDay) {
      setLocalDay(viewedDay);
      setReflectionText(viewedDay.reflection_text ?? '');
    }
  }, [viewedDay?.id]);

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
              {activeChallenges.length} active
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
          <Text style={styles.cardLabel}>your journey</Text>
          <View style={styles.dayDotsRow}>
            {days.map((d, i) => {
              const isCurrent = i === dayIndex;
              const isSelected = i === effectiveDayIndex;
              const isFuture = i > dayIndex;
              const isDone = allTasksDone(d);
              const isPartial = someTasksDone(d) && !isDone;
              return (
                <Pressable
                  key={i}
                  style={styles.dayDotWrapper}
                  onPress={() => {
                    if (isFuture) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDayIndex(i);
                  }}
                  disabled={isFuture}
                  hitSlop={6}
                >
                  <View
                    style={[
                      styles.dayDot,
                      isDone && { backgroundColor: '#F2B4CC' },
                      isPartial && { backgroundColor: 'rgba(244, 198, 204, 0.4)' },
                      !isDone && !isPartial && { backgroundColor: 'rgba(0,0,0,0.06)' },
                      isFuture && { backgroundColor: 'rgba(0,0,0,0.04)' },
                      isCurrent && styles.dayDotCurrent,
                      isSelected && !isCurrent && styles.dayDotSelected,
                    ]}
                  />
                  <Text style={[
                    styles.dayDotLabel,
                    { color: isSelected ? '#F2B4CC' : isFuture ? '#D4C7BF' : '#9E8880' },
                    isSelected && { fontWeight: '700' },
                  ]}>
                    {i + 1}
                  </Text>
                </Pressable>
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

        {/* Past-day banner */}
        {effectiveDayIndex !== dayIndex && (
          <Pressable
            style={styles.pastDayBanner}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDayIndex(null);
            }}
            hitSlop={6}
          >
            <Text style={styles.pastDayBannerText}>
              Viewing Day {effectiveDayIndex + 1} · tap to jump back to today
            </Text>
          </Pressable>
        )}

        {/* Tasks Card */}
        {localDay && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              {effectiveDayIndex === dayIndex
                ? "today's rituals"
                : `day ${effectiveDayIndex + 1} rituals`}
            </Text>

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
            <Text style={styles.cardLabel}>reflect (optional)</Text>
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
  container: { flex: 1, backgroundColor: '#F5E6E0' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: 60 },

  backButton: { marginBottom: spacing.md },
  // Active-challenge switcher
  switcherWrap: { marginBottom: spacing.md },
  switcherLabel: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    color: 'rgba(196,90,130,0.85)',
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
  title: { fontSize: 28, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#3A2E2B', letterSpacing: -0.4 },
  subtitle: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '500', color: 'rgba(58,46,43,0.75)', marginTop: 4 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.lg + 2,
    marginBottom: spacing.md,
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
    marginBottom: 14,
  },

  dayDotsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, marginBottom: 18, justifyContent: 'center',
  },
  dayDotWrapper: { alignItems: 'center', width: 32, paddingVertical: 4 },
  dayDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayDotCurrent: {
    borderWidth: 3,
    borderColor: '#C45A82',
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: '#C45A82',
    shadowOpacity: 0.36,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  dayDotSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#C45A82',
  },
  dayDotLabel: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#3A2E2B',
  },

  pastDayBanner: {
    backgroundColor: 'rgba(232,127,166,0.12)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,127,166,0.28)',
  },
  pastDayBannerText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#C45A82',
    letterSpacing: 0.2,
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel: { fontSize: 12, fontFamily: 'SpaceMono-Bold', color: '#6B5B52', minWidth: 30, textAlign: 'right' },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(247,232,218,0.55)',
    borderRadius: 14,
  },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  taskText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    lineHeight: 22,
    flex: 1,
  },

  doneBadge: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 999, alignItems: 'center', marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#6F8B6A',
    shadowColor: '#6F8B6A',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  doneBadgeText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#6F8B6A',
    letterSpacing: 0.3,
  },

  reflectionPrompt: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#3A2E2B',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  reflectionInput: {
    minHeight: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.16)',
    padding: spacing.lg,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 22,
    backgroundColor: 'rgba(247,232,218,0.4)',
  },
  reflectionFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  charCount: { fontSize: 12, fontFamily: 'DMSans', fontWeight: '500', color: 'rgba(58,46,43,0.55)' },
  saveReflectionButton: {
    paddingVertical: 9, paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: '#1A1028',
    shadowColor: '#1A1028',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveReflectionText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#FEFAF9',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  finishButton: {
    backgroundColor: '#1A1028',
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#1A1028',
    shadowOpacity: 0.32,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  finishButtonText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },

  encouragement: { alignItems: 'center', marginTop: spacing.md },
  encouragementText: { fontSize: 14, fontFamily: 'DMSans', fontStyle: 'italic', color: '#9E8880' },

  bottomSpacer: { height: 120 },
});
