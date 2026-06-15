import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore, useSupplementStore } from '../../src/stores';
import {
  SupplementLibraryModal,
  SupplementDetailView,
} from '../../src/components/supplements';
import { SupplementInfo, WellnessGoal } from '../../src/types/supplement';
import { SUPPLEMENT_CATALOG } from '../../src/constants/supplements';
import { SolarIcon } from '../../src/components/ui/SolarIcon';
import { scheduleSupplementReminder, cancelSupplementReminder } from '../../src/lib/notifications';

const SUPP_COLORS = ['#F4A888', '#B8CFB1', '#D8C9EC', '#F2B4CC', '#FBD4BF'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getStreak(habitId: string, summaries: Record<string, any>): number {
  let streak = 0;
  const cur = new Date();
  if (summaries[toDateKey(cur)]?.completions[habitId]) streak++;
  cur.setDate(cur.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    if (summaries[toDateKey(cur)]?.completions[habitId]) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }
  return streak;
}

function getTotalDaysUsed(habitId: string, summaries: Record<string, any>): number {
  return Object.values(summaries).filter((s: any) => s?.completions[habitId] !== undefined).length;
}

function getAdherence30d(habitId: string, summaries: Record<string, any>): number {
  let taken = 0;
  const cur = new Date();
  for (let i = 0; i < 30; i++) {
    const dk = toDateKey(cur);
    if (summaries[dk]?.completions[habitId]) taken++;
    cur.setDate(cur.getDate() - 1);
  }
  return Math.round((taken / 30) * 100);
}

export default function GlowStackScreen() {
  const insets = useSafeAreaInsets();
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementInfo | null>(null);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<WellnessGoal | undefined>(undefined);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [editDosage, setEditDosage] = useState('');
  const [editTiming, setEditTiming] = useState('morning');
  const [editNotes, setEditNotes] = useState('');
  const [checkInHabit, setCheckInHabit] = useState<any>(null);
  const [checkInRating, setCheckInRating] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [checkInNote, setCheckInNote] = useState('');

  const { habits, dailySummaries, completeHabit, uncompleteHabit, getCompletionForToday, removeHabit, updateSupplementMeta } = useHabitStore();
  const { markSupplementAdded, markSupplementRemoved } = useSupplementStore();

  const supplementHabits = useMemo(
    () => habits.filter(h => h.category === 'supplements' && h.isActive).sort((a, b) => a.order - b.order),
    [habits]
  );

  const taken = supplementHabits.filter(h => getCompletionForToday(h.id) !== undefined).length;
  const total = supplementHabits.length;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  const morningSupps = supplementHabits.filter(h => {
    const timing = (h.supplementMeta?.timingPreference ?? '').toLowerCase();
    return !timing.includes('evening') && !timing.includes('night');
  });
  const eveningSupps = supplementHabits.filter(h => {
    const timing = (h.supplementMeta?.timingPreference ?? '').toLowerCase();
    return timing.includes('evening') || timing.includes('night');
  });

  const addedIds = useMemo(() => {
    return new Set(
      habits
        .filter(h => h.category === 'supplements' && h.supplementMeta?.supplementInfoId)
        .map(h => h.supplementMeta!.supplementInfoId!)
    );
  }, [habits]);

  // Week dates Mon–Sun
  const weekDates = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });
  }, []);
  const todayDayIdx = useMemo(() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }, []);

  // 7-day stack health score
  const healthScore = useMemo(() => {
    if (total === 0) return null;
    let possible = 0, done = 0;
    weekDates.forEach(dk => {
      supplementHabits.forEach(h => {
        possible++;
        if (dailySummaries[dk]?.completions[h.id]) done++;
      });
    });
    return possible > 0 ? Math.round((done / possible) * 100) : 0;
  }, [supplementHabits, dailySummaries, weekDates, total]);

  // Completion celebration animation
  const alreadyComplete = taken === total && total > 0;
  const celebScale   = useRef(new Animated.Value(alreadyComplete ? 1 : 0.94)).current;
  const celebOpacity = useRef(new Animated.Value(alreadyComplete ? 1 : 0)).current;
  const prevTakenRef = useRef(taken);

  useEffect(() => {
    const justCompleted = taken === total && total > 0 && prevTakenRef.current < total;
    if (justCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(celebScale,   { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(celebOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    if (taken < total) { celebScale.setValue(0.94); celebOpacity.setValue(0); }
    prevTakenRef.current = taken;
  }, [taken, total]);

  const handleToggle = (habitId: string) => {
    const completion = getCompletionForToday(habitId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (completion) {
      uncompleteHabit(habitId);
    } else {
      completeHabit(habitId, 'full');
    }
  };

  const handleBrowseSupplements = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoalFilter(undefined);
    setShowLibraryModal(true);
  };

  const handleRemoveSupplement = (habitId: string, supplementInfoId?: string) => {
    Alert.alert('Remove Supplement', 'Remove this supplement from your stack?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => {
          removeHabit(habitId);
          cancelSupplementReminder(habitId);
          if (supplementInfoId) markSupplementRemoved(supplementInfoId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleOpenEdit = (habit: any) => {
    const suppInfo = SUPPLEMENT_CATALOG.find((s: SupplementInfo) => s.id === habit.supplementMeta?.supplementInfoId);
    setEditDosage(habit.supplementMeta?.dosage || suppInfo?.typicalDosage || '');
    setEditTiming(habit.supplementMeta?.timingPreference || suppInfo?.timing || 'morning');
    setEditNotes(habit.supplementMeta?.notes || '');
    setEditingHabit(habit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveEdit = () => {
    if (!editingHabit) return;
    updateSupplementMeta(editingHabit.id, {
      dosage: editDosage,
      timingPreference: editTiming,
      notes: editNotes,
    });
    const suppInfo = SUPPLEMENT_CATALOG.find((s: SupplementInfo) => s.id === editingHabit.supplementMeta?.supplementInfoId);
    const displayName = suppInfo?.name ?? editingHabit.name;
    scheduleSupplementReminder(editingHabit.id, displayName, editTiming);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingHabit(null);
  };

  const handleSaveCheckIn = () => {
    if (!checkInHabit || !checkInRating) return;
    updateSupplementMeta(checkInHabit.id, {
      checkInRating,
      checkInNote: checkInNote.trim() || undefined,
      checkInCompletedAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCheckInHabit(null);
    setCheckInRating(null);
    setCheckInNote('');
  };

  const handleAddToHabits = (dosage: string, timing: string, notes: string) => {
    if (!selectedSupplement) return;
    const { addSupplementHabit } = useHabitStore.getState();
    const habitId = addSupplementHabit(selectedSupplement, { dosage, timingPreference: timing, notes });
    scheduleSupplementReminder(habitId, selectedSupplement.name, timing);
    markSupplementAdded(selectedSupplement.id);
    setSelectedSupplement(null);
  };

  const renderSupplementRow = (habit: any, colorIndex: number) => {
    const isTaken = getCompletionForToday(habit.id) !== undefined;
    const color = SUPP_COLORS[colorIndex % SUPP_COLORS.length];
    const suppInfo = habit.supplementMeta?.supplementInfoId
      ? SUPPLEMENT_CATALOG.find((s: SupplementInfo) => s.id === habit.supplementMeta!.supplementInfoId)
      : null;
    const displayName = suppInfo?.name ?? habit.name;
    const dose = habit.supplementMeta?.dosage || suppInfo?.typicalDosage || '';
    const timing = suppInfo?.timing ?? 'morning';
    const emoji = timing === 'evening' ? '🌙' : '💊';
    const streak = getStreak(habit.id, dailySummaries);
    const totalDays = getTotalDaysUsed(habit.id, dailySummaries);
    const needsCheckIn = totalDays >= 14 && !habit.supplementMeta?.checkInCompletedAt;
    const checkInDone = !!habit.supplementMeta?.checkInCompletedAt;
    const checkInRatingVal = habit.supplementMeta?.checkInRating;

    return (
      <View key={habit.id}>
        <Pressable
          style={[styles.suppRow, isTaken && { backgroundColor: `${color}20` }]}
          onPress={() => handleToggle(habit.id)}
          onLongPress={() => handleRemoveSupplement(habit.id, habit.supplementMeta?.supplementInfoId)}
        >
          <View style={[styles.suppIconBox, { backgroundColor: `${color}30` }]}>
            <Text style={styles.suppEmoji}>{habit.icon || emoji}</Text>
          </View>
          <View style={styles.suppInfo}>
            <Text style={[styles.suppName, isTaken && styles.suppNameTaken]} numberOfLines={1}>
              {displayName}
            </Text>
            {dose ? <Text style={styles.suppDose}>{dose}</Text> : null}
            {streak >= 2 && (
              <Text style={styles.streakRowText}>🔥 {streak}-day streak</Text>
            )}
            <Text style={styles.holdHint}>Hold to remove</Text>
            <View style={styles.weekDots}>
              {(['M','T','W','T','F','S','S']).map((label, i) => {
                const dk = weekDates[i];
                const done = dailySummaries[dk]?.completions[habit.id] !== undefined;
                const isToday = i === todayDayIdx;
                return (
                  <View key={i} style={styles.weekDotCol}>
                    <View
                      style={[
                        styles.weekDot,
                        done && { backgroundColor: color },
                        isToday && !done && styles.weekDotToday,
                      ]}
                    />
                    <Text style={[styles.weekDotLabel, isToday && { color: '#C45A82' }]}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <Pressable onPress={() => handleOpenEdit(habit)} hitSlop={8} style={styles.editBtn}>
            <SolarIcon name="pen-new-square-bold" size={15} color="#B8A9A5" />
          </Pressable>
          <Pressable
            onPress={() => handleToggle(habit.id)}
            hitSlop={6}
            style={[styles.checkBox, isTaken && { backgroundColor: color, borderColor: color }]}
          >
            {isTaken && <SolarIcon name="check-circle-bold" size={14} color="#FFFAF8" />}
          </Pressable>
        </Pressable>

        {/* Check-in prompt — appears after 14 days */}
        {needsCheckIn && (
          <Pressable
            onPress={() => { setCheckInHabit(habit); setCheckInRating(null); setCheckInNote(''); }}
            style={({ pressed }) => [styles.checkInCard, pressed && { opacity: 0.92 }]}
          >
            <LinearGradient
              colors={['#EDE8FF', '#F6E8F5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.checkInCardInner}
            >
              <Text style={styles.checkInCardEmoji}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkInCardTitle}>How is {displayName} feeling?</Text>
                <Text style={styles.checkInCardSub}>{totalDays} days in — time to reflect</Text>
              </View>
              <View style={styles.checkInCardBtn}>
                <Text style={styles.checkInCardBtnText}>Check in</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}

        {/* Previous check-in result */}
        {checkInDone && checkInRatingVal && (
          <View style={styles.checkInResult}>
            <Text style={styles.checkInResultText}>
              {checkInRatingVal === 'positive' ? '🌟 Loving it' : checkInRatingVal === 'neutral' ? '🤷‍♀️ Too early to tell' : '😕 Not feeling it yet'}
            </Text>
            <Pressable onPress={() => { setCheckInHabit(habit); setCheckInRating(checkInRatingVal); setCheckInNote(habit.supplementMeta?.checkInNote || ''); }} hitSlop={8}>
              <Text style={styles.checkInResultEdit}>Edit</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerLabel}>SUPPLEMENT STACK</Text>
            <Text style={styles.title}>Nourish from within</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            onPress={handleBrowseSupplements}
          >
            <SolarIcon name="add-circle-bold" color="#FFFFFF" size={16} />
            <Text style={styles.addButtonText}>Add Supplement</Text>
          </Pressable>
        </View>

        {/* TODAY'S STACK progress card / celebration */}
        {total > 0 && (
          taken === total ? (
            <Animated.View style={{ opacity: celebOpacity, transform: [{ scale: celebScale }], marginBottom: 20 }}>
              <LinearGradient
                colors={['#FFF0F5', '#F6DFE8', '#EDD5CB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.celebCard}
              >
                <Text style={styles.celebEmoji}>✦</Text>
                <View style={styles.celebBody}>
                  <Text style={styles.celebTitle}>Stack complete</Text>
                  <Text style={styles.celebSub}>You nourished yourself today · {total}/{total} taken</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <View style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <Text style={styles.progressCardLabel}>TODAY'S STACK</Text>
                <Text style={styles.progressCardCount}>{taken}/{total} taken</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#F2B4CC', '#E87FA6', '#9B86D4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress}%` as any }]}
                />
              </View>
            </View>
          )
        )}

        {/* Stack health score card */}
        {total > 0 && healthScore !== null && (
          <LinearGradient
            colors={['#9B86D4', '#C45A82']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.healthCard}
          >
            <View style={styles.healthCardLeft}>
              <Text style={styles.healthCardScore}>{healthScore}%</Text>
              <Text style={styles.healthCardLabel}>7-DAY CONSISTENCY</Text>
              <Text style={styles.healthCardDesc}>
                {healthScore >= 80 ? "You're on a roll 🌿" : healthScore >= 50 ? 'Building momentum ✨' : "Let's get consistent 💪"}
              </Text>
            </View>
            <View style={styles.healthCardDots}>
              {(['Mo','Tu','We','Th','Fr','Sa','Su']).map((lbl, i) => {
                const allTaken = supplementHabits.length > 0 &&
                  supplementHabits.every(h => dailySummaries[weekDates[i]]?.completions[h.id]);
                return (
                  <View key={i} style={styles.healthDotCol}>
                    <View style={[styles.healthDot, allTaken && styles.healthDotFilled]} />
                    <Text style={styles.healthDotLabel}>{lbl}</Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        )}

        {/* Empty state */}
        {total === 0 && (
          <Pressable
            style={({ pressed }) => [styles.emptyCard, pressed && { opacity: 0.85 }]}
            onPress={handleBrowseSupplements}
          >
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyTitle}>Build your stack</Text>
            <Text style={styles.emptySubtitle}>Add supplements to track your daily intake</Text>
            <View style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Browse Supplements</Text>
            </View>
          </Pressable>
        )}

        {/* Morning */}
        {morningSupps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MORNING</Text>
            <View style={styles.suppList}>
              {morningSupps.map((h, i) => renderSupplementRow(h, i))}
            </View>
          </View>
        )}

        {/* Evening */}
        {eveningSupps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EVENING</Text>
            <View style={styles.suppList}>
              {eveningSupps.map((h, i) => renderSupplementRow(h, morningSupps.length + i))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <SupplementLibraryModal
        visible={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        initialGoalFilter={selectedGoalFilter}
      />

      {selectedSupplement && (
        <View style={StyleSheet.absoluteFill}>
          <SupplementDetailView
            supplement={selectedSupplement}
            isAdded={addedIds.has(selectedSupplement.id)}
            onAddToHabits={handleAddToHabits}
            onClose={() => setSelectedSupplement(null)}
          />
        </View>
      )}

      {/* Check-in modal */}
      <Modal
        visible={!!checkInHabit}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setCheckInHabit(null)}
      >
        <KeyboardAvoidingView
          style={styles.editModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <LinearGradient
            colors={['#FFF0F5', '#F6DFE8', '#EDD5CB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.checkInModalHeader}
          >
            <Pressable onPress={() => setCheckInHabit(null)} hitSlop={8} style={{ alignSelf: 'flex-end' }}>
              <Text style={styles.editModalCancel}>Cancel</Text>
            </Pressable>
            {checkInHabit && (() => {
              const suppInfo = SUPPLEMENT_CATALOG.find((s: SupplementInfo) => s.id === checkInHabit.supplementMeta?.supplementInfoId);
              const name = suppInfo?.name ?? checkInHabit.name;
              const days = getTotalDaysUsed(checkInHabit.id, dailySummaries);
              return (
                <>
                  <Text style={styles.checkInModalEmoji}>{checkInHabit.icon || '💊'}</Text>
                  <Text style={styles.checkInModalTitle}>{days} days with {name}</Text>
                  <Text style={styles.checkInModalSub}>Are you noticing a difference?</Text>
                </>
              );
            })()}
          </LinearGradient>

          <ScrollView
            style={styles.editModalScroll}
            contentContainerStyle={[styles.editModalContent, { paddingTop: 28 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.checkInReactions}>
              {([
                { id: 'positive', emoji: '🌟', label: 'Yes, I feel it!' },
                { id: 'neutral',  emoji: '🤷‍♀️', label: 'Too early to tell' },
                { id: 'negative', emoji: '😕', label: 'Not really...' },
              ] as const).map(opt => (
                <Pressable
                  key={opt.id}
                  onPress={() => setCheckInRating(opt.id)}
                  style={[styles.checkInReactionBtn, checkInRating === opt.id && styles.checkInReactionBtnActive]}
                >
                  <Text style={styles.checkInReactionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.checkInReactionLabel, checkInRating === opt.id && { color: '#C45A82', fontWeight: '600' }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.editLabel}>ADD A NOTE (OPTIONAL)</Text>
            <TextInput
              style={[styles.editInput, styles.editNotesInput]}
              value={checkInNote}
              onChangeText={setCheckInNote}
              placeholder="What have you noticed?"
              placeholderTextColor="#B8A9A5"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.checkInSaveBtn, !checkInRating && { opacity: 0.4 }]}
              onPress={handleSaveCheckIn}
              disabled={!checkInRating}
            >
              <Text style={styles.checkInSaveBtnText}>Save my response</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit supplement modal */}
      <Modal
        visible={!!editingHabit}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setEditingHabit(null)}
      >
        <KeyboardAvoidingView
          style={styles.editModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Modal header */}
          <View style={styles.editModalHeader}>
            <Pressable onPress={() => setEditingHabit(null)} hitSlop={8}>
              <Text style={styles.editModalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.editModalTitle}>Edit Supplement</Text>
            <Pressable onPress={handleSaveEdit} hitSlop={8}>
              <Text style={styles.editModalSave}>Save</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.editModalScroll}
            contentContainerStyle={styles.editModalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Supplement name pill */}
            {editingHabit && (() => {
              const suppInfo = SUPPLEMENT_CATALOG.find((s: SupplementInfo) => s.id === editingHabit.supplementMeta?.supplementInfoId);
              const name = suppInfo?.name ?? editingHabit.name;
              return (
                <View style={styles.editNameRow}>
                  <Text style={styles.editNameEmoji}>{editingHabit.icon || '💊'}</Text>
                  <Text style={styles.editNameText}>{name}</Text>
                </View>
              );
            })()}

            <Text style={styles.editLabel}>DOSAGE</Text>
            <TextInput
              style={styles.editInput}
              value={editDosage}
              onChangeText={setEditDosage}
              placeholder="e.g. 500mg, 1 capsule"
              placeholderTextColor="#B8A9A5"
            />

            <Text style={styles.editLabel}>WHEN TO TAKE</Text>
            <View style={styles.editTimingRow}>
              {[
                { id: 'morning', label: 'Morning', icon: '🌅' },
                { id: 'with-food', label: 'With Food', icon: '🍽️' },
                { id: 'evening', label: 'Evening', icon: '🌙' },
                { id: 'any', label: 'Any Time', icon: '⏰' },
              ].map(opt => (
                <Pressable
                  key={opt.id}
                  onPress={() => setEditTiming(opt.id)}
                  style={[styles.editTimingChip, editTiming === opt.id && styles.editTimingChipActive]}
                >
                  <Text style={styles.editTimingIcon}>{opt.icon}</Text>
                  <Text style={[styles.editTimingLabel, editTiming === opt.id && styles.editTimingLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.editLabel}>NOTES</Text>
            <TextInput
              style={[styles.editInput, styles.editNotesInput]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Any reminders for yourself..."
              placeholderTextColor="#B8A9A5"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {editingHabit && (() => {
              const adherence = getAdherence30d(editingHabit.id, dailySummaries);
              const totalDays = getTotalDaysUsed(editingHabit.id, dailySummaries);
              if (totalDays < 2) return null;
              return (
                <View style={styles.adherenceSection}>
                  <View style={styles.adherenceHeader}>
                    <Text style={styles.editLabel}>30-DAY ADHERENCE</Text>
                    <Text style={styles.adherenceScore}>{adherence}%</Text>
                  </View>
                  <View style={styles.adherenceTrack}>
                    <View style={[styles.adherenceFill, { width: `${adherence}%` as any }]} />
                  </View>
                  <Text style={styles.adherenceSub}>{totalDays} days logged total</Text>
                </View>
              );
            })()}

            <Pressable
              style={styles.editRemoveBtn}
              onPress={() => {
                setEditingHabit(null);
                setTimeout(() => handleRemoveSupplement(editingHabit.id, editingHabit.supplementMeta?.supplementInfoId), 300);
              }}
            >
              <Text style={styles.editRemoveText}>Remove from Stack</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDD5CB' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTextBlock: { flex: 1, marginRight: 16 },
  headerLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#5C3D2E',
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Raleway-SemiBold',
    color: '#1A0A06',
    letterSpacing: -0.3,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#C45A82',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#C4A99A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressCardLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#5C3D2E',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressCardCount: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: '#C45A82',
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(242,180,204,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#C4A99A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Raleway-SemiBold', fontSize: 18, fontWeight: '600', color: '#1A0A06', marginBottom: 6 },
  emptySubtitle: { fontFamily: 'DMSans', fontSize: 13, color: '#5C3D2E', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  emptyButton: {
    backgroundColor: '#C45A82',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: { fontFamily: 'DMSans', fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#5C3D2E',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  suppList: { gap: 8 },

  suppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#C4A99A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  suppIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suppEmoji: { fontSize: 20 },
  suppInfo: { flex: 1 },
  suppName: {
    fontFamily: 'DMSans',
    fontSize: 15,
    fontWeight: '500',
    color: '#1A0A06',
  },
  suppNameTaken: {
    color: '#5C3D2E',
    textDecorationLine: 'line-through',
  },
  suppDose: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#7A6560',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EADBD4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  weekDotCol: {
    alignItems: 'center' as const,
    gap: 3,
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  weekDotToday: {
    borderWidth: 1.5,
    borderColor: '#C45A82',
    backgroundColor: 'transparent',
  },
  weekDotLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#8C7B76',
  },

  celebCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#C4A99A',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  celebEmoji: { fontSize: 28 },
  celebBody: { flex: 1 },
  celebTitle: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: '#1A0A06',
    marginBottom: 2,
  },
  celebSub: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: '#5C3D2E',
  },

  holdHint: {
    fontFamily: 'DMSans',
    fontSize: 11,
    color: '#8C7B76',
    marginTop: 3,
  },

  adherenceSection: { marginTop: 16, marginBottom: 8 },
  adherenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  adherenceScore: { fontFamily: 'Raleway-SemiBold', fontSize: 15, fontWeight: '600', color: '#C45A82' },
  adherenceTrack: { height: 6, backgroundColor: 'rgba(242,180,204,0.2)', borderRadius: 999, overflow: 'hidden' },
  adherenceFill: { height: '100%', backgroundColor: '#C45A82', borderRadius: 999 },
  adherenceSub: { fontFamily: 'DMSans', fontSize: 11, color: '#B8A9A5', marginTop: 5 },

  streakRowText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '600',
    color: '#C45A82',
    marginTop: 3,
    marginBottom: 4,
  },

  healthCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#9B86D4',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  healthCardLeft: { flex: 1 },
  healthCardScore: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  healthCardLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  healthCardDesc: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  healthCardDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    width: 120,
    justifyContent: 'flex-end',
  },
  healthDotCol: { alignItems: 'center', gap: 2 },
  healthDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  healthDotFilled: { backgroundColor: '#FFFFFF' },
  healthDotLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.9)',
  },

  checkInCard: {
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkInCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  checkInCardEmoji: { fontSize: 22 },
  checkInCardTitle: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#1A0A06',
    marginBottom: 2,
  },
  checkInCardSub: {
    fontFamily: 'DMSans',
    fontSize: 11,
    color: '#5C3D2E',
  },
  checkInCardBtn: {
    backgroundColor: '#C45A82',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  checkInCardBtnText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  checkInResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(184,207,177,0.18)',
    borderRadius: 12,
  },
  checkInResultText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: '#5C3D2E',
  },
  checkInResultEdit: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: '#C45A82',
    fontWeight: '600',
  },

  checkInModalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  checkInModalEmoji: { fontSize: 40, marginTop: 12, marginBottom: 8 },
  checkInModalTitle: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 20,
    fontWeight: '600',
    color: '#1A0A06',
    textAlign: 'center',
    marginBottom: 4,
  },
  checkInModalSub: {
    fontFamily: 'DMSans',
    fontSize: 14,
    color: '#5C3D2E',
    textAlign: 'center',
  },

  checkInReactions: {
    gap: 10,
    marginBottom: 24,
  },
  checkInReactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0CCBF',
  },
  checkInReactionBtnActive: {
    borderColor: '#C45A82',
    backgroundColor: '#FFF0F5',
  },
  checkInReactionEmoji: { fontSize: 22 },
  checkInReactionLabel: {
    fontFamily: 'DMSans',
    fontSize: 15,
    color: '#5C3D2E',
  },
  checkInSaveBtn: {
    backgroundColor: '#C45A82',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#C45A82',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  checkInSaveBtnText: {
    fontFamily: 'DMSans',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  editBtn: {
    padding: 6,
    marginRight: -4,
  },

  // Edit modal
  editModal: {
    flex: 1,
    backgroundColor: '#EDD5CB',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#FFFFFF',
  },
  editModalCancel: {
    fontFamily: 'DMSans',
    fontSize: 16,
    color: '#5C3D2E',
  },
  editModalTitle: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A0A06',
  },
  editModalSave: {
    fontFamily: 'DMSans',
    fontSize: 16,
    fontWeight: '600',
    color: '#C45A82',
  },
  editModalScroll: { flex: 1 },
  editModalContent: { padding: 24, gap: 6 },

  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  editNameEmoji: { fontSize: 22 },
  editNameText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A0A06',
    flex: 1,
  },

  editLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: '#5C3D2E',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMSans',
    fontSize: 15,
    color: '#1A0A06',
    borderWidth: 1,
    borderColor: '#E0CCBF',
  },
  editNotesInput: {
    minHeight: 90,
  },

  editTimingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editTimingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0CCBF',
  },
  editTimingChipActive: {
    backgroundColor: '#FFF0F5',
    borderColor: '#C45A82',
  },
  editTimingIcon: { fontSize: 14 },
  editTimingLabel: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: '#5C3D2E',
  },
  editTimingLabelActive: {
    color: '#C45A82',
    fontWeight: '600',
  },

  editRemoveBtn: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.3)',
  },
  editRemoveText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: '#C45A82',
  },
});
