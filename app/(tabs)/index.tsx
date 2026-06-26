import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, Image, Easing, Modal, TextInput, KeyboardAvoidingView, Platform,
  Share, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useHabitStore, usePlantStore, useUserStore } from '../../src/stores';
import { supabase } from '../../lib/supabase';
import { formatDateKey } from '../../src/utils/dateUtils';
import { DailyAffirmation } from '../../src/components/home/DailyAffirmation';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'good morning,';
  if (h < 18) return 'good afternoon,';
  return 'good evening,';
}

function formatHeaderDate(): string {
  const d = new Date();
  const day = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${day} · ${month} ${d.getDate()}`.toLowerCase();
}

const PLANT_STAGE_ASSETS: Record<string, any> = {
  seed:   require('../../assets/plants/seed.png'),
  sprout: require('../../assets/plants/sprout.png'),
  bud:    require('../../assets/plants/bud.png'),
  bloom:  require('../../assets/plants/bloom.png'),
  glow:   require('../../assets/plants/glow.png'),
};

const STAGE_LABELS: Record<string, string> = {
  seed: 'Seed', sprout: 'Sprout', bud: 'Bud', bloom: 'Bloom', glow: 'Glow',
};

const CAT_COLORS: Record<string, string> = {
  nutrition: '#B8CFB1', beauty: '#F2B4CC', supplements: '#D8C9EC',
  mind: '#9B86D4', 'self-care': '#F4A888', reflection: '#FBD4BF',
  movement: '#B8CFB1', hobbies: '#D8C9EC', default: '#F2B4CC',
};

function getWeekDays() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return ['Mo','Tu','We','Th','Fr','Sa','Su'].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { label, date: d.getDate(), dateKey, isToday: dateKey === todayKey, isFuture: d > today };
  });
}

const CAT_LABELS: Record<string, string> = {
  nutrition: 'Nutrition', movement: 'Movement', supplements: 'Supplements',
  hobbies: 'Hobbies', 'self-care': 'Self-Care', reflection: 'Reflection',
  beauty: 'Beauty', mind: 'Mind',
};

const RITUAL_SUGGESTIONS: { name: string; icon: string; category: string }[] = [
  { name: 'Morning walk',       icon: '🚶‍♀️', category: 'movement' },
  { name: 'Drink water',        icon: '💧',  category: 'nutrition' },
  { name: 'Skincare routine',   icon: '🧖‍♀️', category: 'beauty' },
  { name: 'Stretch session',    icon: '🧘‍♀️', category: 'movement' },
  { name: 'Gratitude moment',   icon: '🌷',  category: 'reflection' },
  { name: 'Meditate',           icon: '✨',  category: 'mind' },
  { name: 'Read 10 pages',      icon: '📖',  category: 'mind' },
  { name: 'Journal',            icon: '📓',  category: 'reflection' },
  { name: 'Tea ritual',         icon: '🍵',  category: 'self-care' },
  { name: 'Deep breaths',       icon: '🌬️', category: 'mind' },
  { name: 'Light a candle',     icon: '🕯️', category: 'self-care' },
  { name: 'Bath ritual',        icon: '🛁',  category: 'self-care' },
  { name: 'Eat breakfast',      icon: '🥣',  category: 'nutrition' },
  { name: 'No phone in bed',    icon: '📵',  category: 'mind' },
  { name: 'Sleep by 11',        icon: '🌙',  category: 'mind' },
  { name: 'Make my bed',        icon: '🛏️', category: 'self-care' },
];

const MOODS = [
  { id: 'low',      journalMood: 'low',       emoji: '🌙', label: 'Tired'   },
  { id: 'heavy',    journalMood: 'struggling', emoji: '🌧️', label: 'Heavy'   },
  { id: 'neutral',  journalMood: 'neutral',    emoji: '☁️',  label: 'Okay'    },
  { id: 'calm',     journalMood: 'calm',       emoji: '🌤️', label: 'Warm'    },
  { id: 'radiant',  journalMood: 'radiant',    emoji: '✨', label: 'Glowing' },
] as const;

const EXPLORE_CARDS = [
  {
    id: 'gratitude',
    emoji: '🫙',
    title: 'Gratitude Jar',
    sub: 'Capture a moment of beauty',
    colors: ['#F5C4B8', '#EDBBCA'] as const,
    route: '/(tabs)/gratitude' as const,
  },
  {
    id: 'phonedown',
    emoji: '📵',
    title: 'Phone Down',
    sub: 'A moment just for you',
    colors: ['#C8B8E2', '#D8CCEE'] as const,
    route: null,
  },
  {
    id: 'beauty',
    emoji: '✨',
    title: 'Beauty Rituals',
    sub: 'Glow from the outside in',
    colors: ['#EDBBCA', '#F5D4C4'] as const,
    route: '/beauty' as const,
  },
];

function ShareGlowBanner({ stage, completedCount, total, onPress }: {
  stage: string; completedCount: number; total: number; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shareBanner, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
    >
      <LinearGradient
        colors={['#FDF5F0', '#F4E0EC', '#EDD5CB']}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
        style={styles.shareBannerGradient}
      >
        <View style={styles.shareBannerPlantCircle}>
          <Image source={PLANT_STAGE_ASSETS[stage] || PLANT_STAGE_ASSETS.seed} style={styles.shareBannerPlant} resizeMode="contain" />
        </View>
        <View style={styles.shareBannerBadge}>
          <Text style={styles.shareBannerBadgeText}>{STAGE_LABELS[stage]}</Text>
        </View>
        <Text style={styles.shareBannerTitle}>Let someone see you bloom</Text>
        {total > 0 && (
          <Text style={styles.shareBannerSub}>{completedCount} of {total} rituals complete today</Text>
        )}
        <Pressable onPress={onPress} style={styles.shareBannerBtn}>
          <Text style={styles.shareBannerBtnText}>Share your glow</Text>
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}

function AnimatedPlant({ stage }: { stage: string }) {
  const breathe = useRef(new Animated.Value(1)).current;
  const float   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1.04, duration: 2200, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 1,    duration: 2200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -6, duration: 2800, useNativeDriver: true }),
      Animated.timing(float, { toValue: 0,  duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: breathe }, { translateY: float }] }]}>
      <Image
        source={PLANT_STAGE_ASSETS[stage] || PLANT_STAGE_ASSETS.seed}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

function FadeUpRow({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 380, delay: index * 60, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay: index * 60, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function BubbleParticle({ color, offsetX, delay, size = 9 }: {
  color: string; offsetX: number; delay: number; size?: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -140, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: offsetX, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0, duration: 700, delay: delay + 350, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 350, delay, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0,   duration: 550, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        bottom: 18, left: '50%', marginLeft: -(size / 2),
        zIndex: 100,
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
}

function HabitSwipeRow({
  habit, done, catColor, reordering, isFirst, isLast, onTap, onMoveUp, onMoveDown, onRemove,
}: {
  habit: any; done: boolean; catColor: string; reordering: boolean;
  isFirst: boolean; isLast: boolean;
  onTap: () => void; onMoveUp: () => void; onMoveDown: () => void;
  onRemove: () => void;
}) {
  const swipeRef    = useRef<any>(null);
  const prevDoneRef = useRef(done);
  const [bubbles, setBubbles] = useState<{ id: string; offsetX: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    if (!prevDoneRef.current && done) {
      const spawned = Array.from({ length: 8 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        offsetX: (i % 2 === 0 ? 1 : -1) * (14 + i * 9),
        delay: i * 55,
        size: 10 + (i % 4) * 3,
      }));
      setBubbles(spawned);
      setTimeout(() => setBubbles([]), 1400);
    }
    prevDoneRef.current = done;
  }, [done]);

  const renderLeftAction = () => (
    <Pressable
      style={[styles.swipeAction, { backgroundColor: done ? '#5C3D2E' : catColor }]}
      onPress={() => { swipeRef.current?.close(); onTap(); }}
    >
      <Text style={styles.swipeActionIcon}>{done ? '↩' : '✓'}</Text>
    </Pressable>
  );

  const renderRightAction = () => (
    <Pressable
      style={[styles.swipeAction, styles.swipeActionRemove]}
      onPress={() => { swipeRef.current?.close(); onRemove(); }}
    >
      <Text style={styles.swipeActionIcon}>🗑</Text>
    </Pressable>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={60}
      rightThreshold={60}
    >
      <View style={{ overflow: 'visible' }}>
        <Pressable
          onPress={onTap}
          style={({ pressed }) => [
            styles.habitRow,
            done && styles.habitRowDone,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={[styles.habitIconCircle, { backgroundColor: catColor + '40' }]}>
            <Text style={styles.habitEmoji}>{habit.icon}</Text>
          </View>
          <Text style={[styles.habitName, done && styles.habitNameDone]} numberOfLines={1}>
            {habit.name}
          </Text>
          {reordering ? (
            <View style={styles.reorderControls}>
              <Pressable onPress={onRemove} style={[styles.reorderArrow, styles.reorderRemove]}>
                <Text style={styles.reorderRemoveText}>×</Text>
              </Pressable>
              <Pressable onPress={onMoveUp} style={styles.reorderArrow} disabled={isFirst}>
                <Text style={[styles.reorderArrowText, isFirst && { opacity: 0.25 }]}>↑</Text>
              </Pressable>
              <Pressable onPress={onMoveDown} style={styles.reorderArrow} disabled={isLast}>
                <Text style={[styles.reorderArrowText, isLast && { opacity: 0.25 }]}>↓</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.habitCheck, done && styles.habitCheckFilled]}>
              {done && <Text style={styles.habitCheckmark}>✓</Text>}
            </View>
          )}
        </Pressable>
        {bubbles.map(b => (
          <BubbleParticle key={b.id} color={catColor} offsetX={b.offsetX} delay={b.delay} size={b.size} />
        ))}
      </View>
    </Swipeable>
  );
}

const PHONE_DOWN_PRESETS = [
  { label: '5m', mins: 5 },
  { label: '15m', mins: 15 },
  { label: '30m', mins: 30 },
  { label: '1h', mins: 60 },
  { label: '2h', mins: 120 },
  { label: '4h', mins: 240 },
];

const PHONE_DOWN_FACTS = [
  { stat: '23 min', body: 'It takes an average of 23 minutes to fully regain focus after a single phone check.' },
  { stat: '↓ Cortisol', body: 'Screen breaks measurably lower cortisol — your body\'s primary stress hormone.' },
  { stat: '30%', body: 'Just 30 minutes phone-free before bed can improve sleep quality by up to 30%.' },
  { stat: '↑ Creativity', body: 'Boredom and stillness activate the brain\'s default mode network — the seat of insight and creativity.' },
  { stat: '28%', body: 'People feel 28% more present and connected when their phone is out of sight.' },
  { stat: '↓ Anxiety', body: 'Even a 1-hour phone break is linked to reduced social anxiety and improved mood in studies.' },
];

function formatDuration(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function formatCountdown(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function PhoneDownModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selectedMins, setSelectedMins] = useState(5);
  const [started, setStarted]           = useState(false);
  const [secondsLeft, setSecondsLeft]   = useState(5 * 60);
  const [fact]                          = useState(() => PHONE_DOWN_FACTS[Math.floor(Math.random() * PHONE_DOWN_FACTS.length)]);
  const done = secondsLeft === 0;

  useEffect(() => {
    if (!visible) {
      setStarted(false);
      setSelectedMins(5);
      setSecondsLeft(5 * 60);
    }
  }, [visible]);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  const adjust = (delta: number) =>
    setSelectedMins(m => Math.min(240, Math.max(1, m + delta)));

  const handleStart = () => {
    setSecondsLeft(selectedMins * 60);
    setStarted(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, styles.phoneDownSheet]} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHandle} />
          <Text style={styles.phoneDownEmoji}>📵</Text>
          <Text style={styles.phoneDownTitle}>Phone Down Moment</Text>

          {!started ? (
            <>
              {/* Stepper */}
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => adjust(-5)}
                  style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{formatDuration(selectedMins)}</Text>
                <Pressable
                  onPress={() => adjust(5)}
                  style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
              </View>

              {/* Quick presets */}
              <View style={styles.durationRow}>
                {PHONE_DOWN_PRESETS.map(p => (
                  <Pressable
                    key={p.mins}
                    onPress={() => setSelectedMins(p.mins)}
                    style={[styles.durationPill, selectedMins === p.mins && styles.durationPillSelected]}
                  >
                    <Text style={[styles.durationPillText, selectedMins === p.mins && styles.durationPillTextSelected]}>
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Science fact */}
              <View style={styles.factCard}>
                <Text style={styles.factStat}>{fact.stat}</Text>
                <Text style={styles.factBody}>{fact.body}</Text>
              </View>

              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [styles.phoneDownStartBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.phoneDownStartBtnText}>Begin</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.phoneDownSub}>
                {done
                  ? 'Beautiful. Welcome back. 🌿'
                  : <>Put your phone face down and breathe.{'\n'}We'll be here when you return.</>}
              </Text>
              <Text style={styles.phoneDownTimer}>{formatCountdown(secondsLeft)}</Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.phoneDownBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.phoneDownBtnText}>{done ? 'Done' : 'End early'}</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomeScreen() {
  const router          = useRouter();
  const insets          = useSafeAreaInsets();
  const gardenName      = useUserStore(s => s.user?.gardenName ?? '');
  const storedFirstName = useUserStore(s => s.user?.firstName ?? '');
  const plant           = usePlantStore(s => s.plant);
  const addPoints       = usePlantStore(s => s.addPoints);
  const recordDaily     = usePlantStore(s => s.recordDailyActivity);
  const habits          = useHabitStore(s => s.habits);
  const dailySummaries  = useHabitStore(s => s.dailySummaries);
  const completeHabit   = useHabitStore(s => s.completeHabit);
  const uncompleteHabit = useHabitStore(s => s.uncompleteHabit);
  const getCompletion   = useHabitStore(s => s.getCompletionForDate);
  const addHabit        = useHabitStore(s => s.addHabit);
  const removeHabit     = useHabitStore(s => s.removeHabit);
  const reorderHabits   = useHabitStore(s => s.reorderHabits);

  const [userName, setUserName]           = useState('');
  const [reordering, setReordering]       = useState(false);
  const [selectedMood, setSelectedMood]   = useState<string | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showPhoneDown, setShowPhoneDown] = useState(false);
  const [showShareGlow, setShowShareGlow] = useState(false);
  const [newHabitName, setNewHabitName]   = useState('');
  const [toastMsg, setToastMsg]           = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (storedFirstName) return;
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const raw =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] || '';
          setUserName(raw.trim().split(/\s+/)[0] || '');
        }
      } catch { /* noop */ }
    })();
  }, [storedFirstName]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const displayName = storedFirstName || userName || gardenName || 'friend';
  const stage       = plant.currentStage;
  const streak      = plant.streak.currentStreak;
  const dateKey     = formatDateKey();

  const activeHabits = useMemo(
    () => habits.filter(h => h.isActive).sort((a, b) => a.order - b.order),
    [habits]
  );
  const completedCount = useMemo(
    () => activeHabits.filter(h => !!getCompletion(h.id, dateKey)).length,
    [activeHabits, dailySummaries, dateKey]
  );
  const groupedHabits = useMemo(() => {
    const groups: Record<string, typeof activeHabits> = {};
    activeHabits.forEach(h => {
      if (!groups[h.category]) groups[h.category] = [];
      groups[h.category].push(h);
    });
    return groups;
  }, [activeHabits]);

  const weekDays = useMemo(getWeekDays, [dateKey]);

  const moveHabit = (habitId: string, direction: 'up' | 'down') => {
    const idx = activeHabits.findIndex(h => h.id === habitId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= activeHabits.length) return;
    reorderHabits(habitId, activeHabits[swapIdx].id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveHabit = (habitId: string, name: string) => {
    Alert.alert(
      'Remove ritual?',
      `${name} will be removed from your garden.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeHabit(habitId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast('Ritual removed');
          },
        },
      ],
    );
  };

  const handleHabitTap = (habitId: string) => {
    if (!!getCompletion(habitId, dateKey)) {
      uncompleteHabit(habitId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    recordDaily();
    const pts = completeHabit(habitId, 'full');
    if (pts > 0) addPoints(pts, true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Ritual complete ✦  +${pts} pts`);
  };

  const handleAddRitual = () => {
    if (!newHabitName.trim()) return;
    addHabit({ name: newHabitName.trim(), icon: '✨', category: 'self-care', isCustom: true });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('New ritual added ✦');
    setNewHabitName('');
    setShowAddModal(false);
  };

  const handleQuickAddRitual = (suggestion: typeof RITUAL_SUGGESTIONS[number]) => {
    addHabit({
      name: suggestion.name,
      icon: suggestion.icon,
      category: suggestion.category as any,
      isCustom: false,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`${suggestion.name} added ✦`);
    setShowAddModal(false);
  };

  const availableSuggestions = useMemo(() => {
    const existing = new Set(habits.map(h => h.name.trim().toLowerCase()));
    return RITUAL_SUGGESTIONS.filter(s => !existing.has(s.name.toLowerCase()));
  }, [habits]);

  const handleExploreCard = (card: typeof EXPLORE_CARDS[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (card.id === 'phonedown') { setShowPhoneDown(true); return; }
    if (card.id === 'share' || card.id === 'invite') { setShowShareGlow(true); return; }
    if (card.route) router.push(card.route as any);
  };

  const shareGlowMessage = () => {
    const ritualLine = activeHabits.length > 0
      ? `${completedCount} of ${activeHabits.length} rituals tended`
      : 'my first rituals planted';
    const streakLine = streak > 0 ? `, day ${streak} of my soft rhythm` : '';
    return `My glow garden is at ${STAGE_LABELS[stage]} today: ${ritualLine}${streakLine}. Growing slowly, softly, and on purpose with Glowera.`;
  };

  const handleShareGlow = async () => {
    try {
      await Share.share({
        title: 'My Glowera garden',
        message: shareGlowMessage(),
      });
    } catch {
      showToast('Share was not available right now');
    }
  };

  const handleInviteFriend = async () => {
    try {
      await Share.share({
        title: 'Grow with me on Glowera',
        message: 'I am growing my glow garden in Glowera. Want to grow with me privately? A soft ritual check-in, no pressure.',
      });
    } catch {
      showToast('Invite was not available right now');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5E6E0', '#EDD5CB', '#E8C9BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Toast */}
      <Animated.View pointerEvents="none" style={[styles.toast, { top: insets.top + 12, opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        bounces
      >

        {/* ── Header ── */}
        <View style={[styles.headerSection, { paddingTop: insets.top + 18 }]}>
          <Text style={styles.dateLine}>{formatHeaderDate()}</Text>

          <Text style={styles.greetingLine}>
            {getGreeting()}{' '}
            <Text style={styles.greetingLineItalic}>{(storedFirstName || userName || 'friend').toLowerCase()}</Text>
          </Text>
          <Text style={styles.welcomeLine}>
            welcome back to your{' '}
            <Text style={styles.welcomeLineItalic}>{(gardenName || 'garden').toLowerCase()}</Text>
          </Text>
        </View>

        {/* ── Daily Affirmation ── */}
        <DailyAffirmation />

        {/* ── Plant Scene (no card chrome) ── */}
        <View style={styles.plantScene}>
          <View style={styles.plantBlob} />
          <View style={styles.plantImageHero}>
            <AnimatedPlant stage={stage} />
          </View>
          <Text style={styles.plantStageLine}>
            {activeHabits.length === 0
              ? <Text style={styles.plantStageLineItalic}>your garden awaits</Text>
              : completedCount === activeHabits.length
                ? <>all rituals tended today ✦ your garden is <Text style={styles.plantStageLineItalic}>{STAGE_LABELS[stage].toLowerCase()}</Text></>
                : completedCount === 0
                  ? <>ready when you are · your garden is <Text style={styles.plantStageLineItalic}>{STAGE_LABELS[stage].toLowerCase()}</Text></>
                  : <>{completedCount} {completedCount === 1 ? 'ritual' : 'rituals'} tended today · your garden is <Text style={styles.plantStageLineItalic}>{STAGE_LABELS[stage].toLowerCase()}</Text></>}
          </Text>
        </View>

        {/* ── Mood ── */}
        <View style={styles.moodSection}>
          <Text style={styles.moodQuestion}>How are you today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <Pressable
                key={m.id}
                onPress={() => {
                  setSelectedMood(m.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/(tabs)/journal?mood=${m.journalMood}&compose=${Date.now()}` as any);
                }}
                style={[styles.moodItem, selectedMood === m.id && styles.moodItemSelected]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === m.id && styles.moodLabelSelected]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Week Strip (mood dots only) ── */}
        <View style={styles.weekWrap}>
          <Text style={styles.weekEyebrow}>this week</Text>
          <View style={styles.weekStrip}>
            {weekDays.map(day => {
              const completions = dailySummaries[day.dateKey]
                ? Object.keys(dailySummaries[day.dateKey].completions).length
                : 0;
              const pct = activeHabits.length > 0 ? completions / activeHabits.length : 0;
              return (
                <View key={day.dateKey} style={styles.weekDayCol}>
                  <Text style={[styles.weekDayLabel, day.isToday && styles.weekDayLabelToday]}>
                    {day.label.toLowerCase()}
                  </Text>
                  <View style={[
                    styles.weekDot,
                    day.isFuture && styles.weekDotFuture,
                    !day.isFuture && pct >= 1 && styles.weekDotComplete,
                    !day.isFuture && pct > 0 && pct < 1 && styles.weekDotPartial,
                    day.isToday && styles.weekDotToday,
                  ]} />
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Today's Rituals ── */}
        <View style={styles.ritualsSection}>
          <View style={styles.ritualsHeader}>
            <Text style={styles.ritualsTitle}>Today's Rituals</Text>
            <View style={styles.ritualsHeaderActions}>
              {activeHabits.length > 1 && (
                <Pressable
                  onPress={() => { setReordering(r => !r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={({ pressed }) => [styles.reorderBtn, reordering && styles.reorderBtnActive, pressed && { opacity: 0.75 }]}
                >
                  <Text style={[styles.reorderBtnText, reordering && styles.reorderBtnTextActive]}>
                    {reordering ? 'done' : 'edit'}
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAddModal(true); }}
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.addBtnText}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Progress pill */}
          {activeHabits.length > 0 && (
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>
                {completedCount === activeHabits.length
                  ? `All ${activeHabits.length} rituals complete ✦`
                  : `${completedCount} of ${activeHabits.length} done today`}
              </Text>
            </View>
          )}

          {activeHabits.length === 0 ? (
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={({ pressed }) => [styles.emptyCard, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>Your garden awaits</Text>
              <Text style={styles.emptySub}>Add your first ritual to begin growing</Text>
            </Pressable>
          ) : (
            <View style={styles.habitsList}>
              {Object.entries(groupedHabits).map(([cat, catHabits]) => (
                <View key={cat}>
                  <Text style={styles.catDivider}>{CAT_LABELS[cat] || cat}</Text>
                  {catHabits.map(habit => {
                    const done      = !!getCompletion(habit.id, dateKey);
                    const catColor  = CAT_COLORS[habit.category] || CAT_COLORS.default;
                    const globalIdx = activeHabits.findIndex(h => h.id === habit.id);
                    return (
                      <FadeUpRow key={habit.id} index={globalIdx}>
                        <HabitSwipeRow
                          habit={habit}
                          done={done}
                          catColor={catColor}
                          reordering={reordering}
                          isFirst={globalIdx === 0}
                          isLast={globalIdx === activeHabits.length - 1}
                          onTap={() => handleHabitTap(habit.id)}
                          onMoveUp={() => moveHabit(habit.id, 'up')}
                          onMoveDown={() => moveHabit(habit.id, 'down')}
                          onRemove={() => handleRemoveHabit(habit.id, habit.name)}
                        />
                      </FadeUpRow>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Share Glow Banner ── */}
        <ShareGlowBanner
          stage={stage}
          completedCount={completedCount}
          total={activeHabits.length}
          onPress={() => setShowShareGlow(true)}
        />

        {/* ── Explore ── */}
        <View style={styles.exploreSection}>
          <View style={styles.exploreHeader}>
            <Text style={styles.exploreEyebrow}>more to try</Text>
            <Text style={styles.exploreTitle}>Explore</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreScroll}
          >
            {EXPLORE_CARDS.map(card => (
              <Pressable
                key={card.id}
                onPress={() => handleExploreCard(card)}
                style={({ pressed }) => [styles.exploreCard, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient
                  colors={card.colors}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.exploreCardGradient}
                >
                  <Text style={styles.exploreEmoji}>{card.emoji}</Text>
                  <Text style={styles.exploreCardTitle}>{card.title}</Text>
                  <Text style={styles.exploreCardSub}>{card.sub}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── Add Ritual Modal ── */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Add a ritual</Text>

              {availableSuggestions.length > 0 && (
                <>
                  <Text style={styles.suggestionsLabel}>tap to add ✦</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionsRow}
                  >
                    {availableSuggestions.map(s => (
                      <Pressable
                        key={s.name}
                        onPress={() => handleQuickAddRitual(s)}
                        style={({ pressed }) => [
                          styles.suggestionChip,
                          { borderLeftColor: CAT_COLORS[s.category] || CAT_COLORS.default },
                          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                        ]}
                      >
                        <Text style={styles.suggestionChipEmoji}>{s.icon}</Text>
                        <Text style={styles.suggestionChipText} numberOfLines={1}>{s.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Text style={styles.suggestionsDivider}>or write your own</Text>
                </>
              )}

              <TextInput
                style={styles.modalInput}
                value={newHabitName}
                onChangeText={setNewHabitName}
                placeholder="e.g. Morning walk"
                placeholderTextColor="#B8A9A5"
                returnKeyType="done"
                onSubmitEditing={handleAddRitual}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={handleAddRitual}
                  disabled={!newHabitName.trim()}
                  style={({ pressed }) => [
                    styles.modalPrimaryBtn,
                    !newHabitName.trim() && { opacity: 0.4 },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.modalPrimaryBtnText}>Add ritual</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setShowAddModal(false); setNewHabitName(''); }}
                  style={({ pressed }) => [styles.modalGhostBtn, pressed && { opacity: 0.75 }]}
                >
                  <Text style={styles.modalGhostBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* ── Phone Down Modal ── */}
      <PhoneDownModal visible={showPhoneDown} onClose={() => setShowPhoneDown(false)} />

      {/* ── Share Glow Modal ── */}
      <Modal visible={showShareGlow} animationType="slide" transparent onRequestClose={() => setShowShareGlow(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowShareGlow(false)}>
          <Pressable style={styles.shareSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.shareEyebrow}>SHARE YOUR GLOW-UP</Text>
            <Text style={styles.shareTitle}>Let someone see what you are growing</Text>

            <LinearGradient
              colors={['#FFF7F2', '#F6DFE8', '#E8E6DA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sharePreviewCard}
            >
              <Text style={styles.shareCardKicker}>TODAY'S GLOW GARDEN</Text>
              <Text style={styles.shareGardenName}>{gardenName || displayName}</Text>
              <View style={styles.sharePlantFrame}>
                <Image
                  source={PLANT_STAGE_ASSETS[stage] || PLANT_STAGE_ASSETS.seed}
                  style={styles.sharePlantImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.shareStage}>{STAGE_LABELS[stage]}</Text>
              <Text style={styles.shareProgress}>
                {activeHabits.length > 0
                  ? `${completedCount} of ${activeHabits.length} rituals tended today`
                  : 'First rituals planted'}
              </Text>
              {streak > 0 && <Text style={styles.shareStreak}>Day {streak} of my soft rhythm</Text>}
            </LinearGradient>

            <View style={styles.shareActions}>
              <Pressable
                onPress={handleShareGlow}
                style={({ pressed }) => [styles.sharePrimaryBtn, pressed && { opacity: 0.86 }]}
              >
                <Text style={styles.sharePrimaryText}>Share today's glow</Text>
              </Pressable>
              <Pressable
                onPress={handleInviteFriend}
                style={({ pressed }) => [styles.shareSecondaryBtn, pressed && { opacity: 0.72 }]}
              >
                <Text style={styles.shareSecondaryText}>Invite a friend to grow with me</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flex: 1 },

  // Toast
  toast: {
    position: 'absolute', left: 20, right: 20, zIndex: 200,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 12, alignItems: 'center',
    shadowColor: '#3A1A10', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  toastText: { fontFamily: 'DMSans', fontSize: 14, color: '#1A0A06' },

  // Header
  headerSection: { paddingHorizontal: 28 },
  dateLine: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 13,
    letterSpacing: 0.2,
    color: 'rgba(196,90,130,0.85)',
    marginBottom: 14,
  },
  greetingLine: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '500',
    fontSize: 22,
    color: 'rgba(58,46,43,0.85)',
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  greetingLineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
  },
  welcomeLine: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(58,46,43,0.6)',
    letterSpacing: 0.1,
    lineHeight: 24,
    marginTop: 8,
  },
  welcomeLineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
  },

  // Plant scene (no card chrome — plant breathes on the warm peach bg)
  plantScene: {
    marginTop: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  plantBlob: {
    position: 'absolute',
    top: 10,
    left: '18%',
    right: '18%',
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,228,213,0.55)',
    opacity: 0.9,
  },
  plantImageHero: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantStageLine: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '500',
    fontSize: 16,
    color: 'rgba(58,46,43,0.78)',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: -0.1,
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  plantStageLineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },

  // Mood
  moodSection: { marginTop: 28, paddingHorizontal: 24 },
  moodQuestion: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 22,
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 18,
    gap: 6,
    backgroundColor: 'rgba(247,232,218,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.1)',
  },
  moodItemSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C45A82',
    borderWidth: 2,
    shadowColor: '#C45A82',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    transform: [{ scale: 1.04 }],
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: {
    fontFamily: 'DMSans',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(58,46,43,0.7)',
    letterSpacing: 0.2,
  },
  moodLabelSelected: {
    color: '#C45A82',
    fontWeight: '700',
  },

  // Week strip (mood dots only — no calendar bubbles)
  weekWrap: {
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 4,
  },
  weekEyebrow: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 14,
    marginLeft: 2,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  weekDayCol: { flex: 1, alignItems: 'center', gap: 10 },
  weekDayLabel: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(58,46,43,0.5)',
    letterSpacing: 0.2,
  },
  weekDayLabelToday: { color: '#C45A82' },
  weekDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.22)',
  },
  weekDotFuture: {
    borderColor: 'rgba(58,46,43,0.12)',
  },
  weekDotPartial: {
    backgroundColor: '#F2B4CC',
    borderColor: '#F2B4CC',
  },
  weekDotComplete: {
    backgroundColor: '#C45A82',
    borderColor: '#C45A82',
  },
  weekDotToday: {
    borderColor: '#C45A82',
    borderWidth: 2,
    shadowColor: '#C45A82',
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  // Rituals
  ritualsSection: { marginTop: 24, paddingHorizontal: 24 },
  ritualsHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  ritualsTitle: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 28,
    color: '#3A2E2B',
    letterSpacing: -0.4,
  },
  ritualsHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.32)',
    shadowColor: '#C45A82',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  addBtnText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '700',
    color: '#C45A82',
    letterSpacing: 0.2,
  },
  reorderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.16)',
    minWidth: 40,
    alignItems: 'center',
  },
  reorderBtnActive: {
    backgroundColor: '#1A1028',
    borderColor: '#1A1028',
  },
  reorderBtnText: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: '#C45A82',
    letterSpacing: 0.2,
  },
  reorderBtnTextActive: { color: '#FFFFFF' },

  // Progress pill
  progressPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.32)',
    shadowColor: '#C45A82',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  progressPillText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '700',
    color: '#C45A82',
    letterSpacing: 0.2,
  },

  // Category divider
  catDivider: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#C45A82',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 22,
  },

  // Swipe action
  swipeAction: {
    width: 70, borderRadius: 18, marginBottom: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  swipeActionRemove: {
    backgroundColor: '#C45A82',
    marginLeft: 8,
  },
  swipeActionIcon: { fontSize: 20, color: '#FFFFFF', fontWeight: '700' },

  // Reorder controls
  reorderControls: { flexDirection: 'row', gap: 4, marginLeft: 'auto' as any },
  reorderArrow:    { width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(196,90,130,0.08)' },
  reorderArrowText: { fontSize: 14, color: '#C45A82', fontWeight: '700' },
  reorderRemove: { backgroundColor: 'rgba(196,90,130,0.95)' },
  reorderRemoveText: { fontSize: 18, color: '#FFFFFF', fontWeight: '700', lineHeight: 20 },

  // Habit rows
  habitsList: { gap: 12 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  habitRowDone: {
    opacity: 0.7,
    backgroundColor: 'rgba(255,250,247,0.95)',
    shadowOpacity: 0.12,
  },
  habitIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  habitEmoji: { fontSize: 22 },
  habitCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: 'rgba(58,46,43,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
  },
  habitCheckFilled: {
    backgroundColor: '#C45A82',
    borderColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOpacity: 0.36,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  habitCheckmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  habitName: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 17,
    color: '#3A2E2B',
    flex: 1,
    letterSpacing: -0.2,
  },
  habitNameDone: {
    color: 'rgba(58,46,43,0.5)',
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(196,90,130,0.55)',
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    borderLeftWidth: 6,
    borderLeftColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 14 },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 22,
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: 'DMSans',
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(58,46,43,0.75)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // Share glow banner
  shareBanner: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 28,
    overflow: 'hidden',
    borderLeftWidth: 6,
    borderLeftColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 32,
    elevation: 10,
  },
  shareBannerGradient: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  shareBannerPlantCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#C45A82',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  shareBannerPlant: { width: 84, height: 84 },
  shareBannerBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(196,90,130,0.32)',
  },
  shareBannerBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#C45A82',
    textTransform: 'uppercase',
  },
  shareBannerTitle: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 24,
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  shareBannerSub: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(58,46,43,0.72)',
    textAlign: 'center',
    marginBottom: 22,
  },
  shareBannerBtn: {
    backgroundColor: '#1A1028',
    borderRadius: 100,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#1A1028',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  shareBannerBtnText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },

  // Explore
  exploreSection: { marginTop: 32, paddingBottom: 8 },
  exploreHeader: {
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  exploreEyebrow: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  exploreTitle: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 28,
    color: '#3A2E2B',
    letterSpacing: -0.4,
  },
  exploreScroll: { paddingHorizontal: 24, gap: 12 },
  exploreCard: {
    borderRadius: 22,
    overflow: 'hidden',
    width: 158,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.16)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.26,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  exploreCardGradient: { padding: 18, height: 168, justifyContent: 'flex-end' },
  exploreEmoji: { fontSize: 32, marginBottom: 'auto' as any },
  exploreCardTitle: {
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    fontSize: 15,
    color: '#1A0A06',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  exploreCardSub: {
    fontFamily: 'DMSans',
    fontSize: 11,
    fontWeight: '500',
    color: '#4A2E1E',
    fontStyle: 'italic',
    lineHeight: 15,
  },

  // Modals (shared)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(30,10,6,0.40)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 24, paddingHorizontal: 24, paddingBottom: 44,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D8C0B8',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontFamily: 'Raleway-SemiBold', fontSize: 22, color: '#1A0A06', marginBottom: 16 },
  // Suggestion chips inside the add-ritual modal
  suggestionsLabel: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(196,90,130,0.85)',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  suggestionsRow: {
    gap: 8,
    paddingBottom: 6,
    paddingRight: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.12)',
    borderLeftWidth: 5,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  suggestionChipEmoji: { fontSize: 18 },
  suggestionChipText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: 0.2,
  },
  suggestionsDivider: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(58,46,43,0.5)',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 10,
  },

  modalInput: {
    backgroundColor: '#F5EAE5', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: 'DMSans', fontSize: 15, color: '#1A0A06',
    borderWidth: 1.5, borderColor: 'rgba(196,90,130,0.15)', marginBottom: 14,
  },
  modalButtons:        { flexDirection: 'row', gap: 10 },
  modalPrimaryBtn:     {
    flex: 1, paddingVertical: 17, borderRadius: 18,
    backgroundColor: '#C45A82', alignItems: 'center',
    shadowColor: '#C45A82', shadowOpacity: 0.30, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
  },
  modalPrimaryBtnText: { fontFamily: 'DMSans', fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  modalGhostBtn:       { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#D8C0B8' },
  modalGhostBtnText:   { fontFamily: 'DMSans', fontSize: 15, color: '#5C3D2E' },

  // Share glow
  shareSheet: {
    backgroundColor: '#FFFAF8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 42,
  },
  shareEyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#C45A82',
    textAlign: 'center',
    marginBottom: 8,
  },
  shareTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 26,
    fontWeight: '600',
    color: '#3A1A10',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 18,
  },
  sharePreviewCard: {
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,90,130,0.12)',
    shadowColor: '#3A1A10',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  shareCardKicker: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    letterSpacing: 1.1,
    color: '#A98A79',
    marginBottom: 8,
  },
  shareGardenName: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 30,
    fontWeight: '600',
    color: '#3A1A10',
    textAlign: 'center',
    marginBottom: 14,
  },
  sharePlantFrame: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255,255,255,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sharePlantImage: {
    width: 136,
    height: 136,
  },
  shareStage: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 17,
    color: '#C45A82',
    marginBottom: 5,
  },
  shareProgress: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: '#4A2E1E',
    textAlign: 'center',
  },
  shareStreak: {
    fontFamily: 'DMSans',
    fontSize: 12,
    color: '#5C3D2E',
    marginTop: 6,
  },
  shareActions: {
    gap: 10,
    marginTop: 18,
  },
  sharePrimaryBtn: {
    backgroundColor: '#C45A82',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#C45A82',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 5 },
  },
  sharePrimaryText: {
    fontFamily: 'DMSans',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareSecondaryBtn: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(184,207,177,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(105,123,94,0.16)',
  },
  shareSecondaryText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: '#697B5E',
  },

  // Phone Down modal
  phoneDownSheet:  { alignItems: 'center', paddingBottom: 52 },
  phoneDownEmoji:  { fontSize: 44, marginBottom: 12 },
  phoneDownTitle: {
    fontFamily: 'Raleway-SemiBold', fontSize: 22,
    color: '#1A0A06', marginBottom: 10, textAlign: 'center',
  },
  phoneDownSub: {
    fontFamily: 'DMSans', fontSize: 15, color: '#5C3D2E',
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  phoneDownTimer: {
    fontFamily: 'Raleway-Bold', fontSize: 52,
    color: '#C45A82', letterSpacing: 2, marginBottom: 28,
  },
  // Duration stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20, marginTop: 4 },
  stepperBtn: {
    width: 44, height: 44, borderRadius: 999,
    backgroundColor: 'rgba(196,90,130,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperBtnText: { fontSize: 22, color: '#C45A82', lineHeight: 26 },
  stepperValue: { fontFamily: 'Raleway-Bold', fontSize: 26, color: '#1A0A06', minWidth: 110, textAlign: 'center' },

  // Quick presets
  durationRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginBottom: 20,
  },
  durationPill: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
    backgroundColor: 'rgba(196,90,130,0.07)',
    borderWidth: 1.5, borderColor: 'rgba(196,90,130,0.15)',
  },
  durationPillSelected: { backgroundColor: '#C45A82', borderColor: '#C45A82' },
  durationPillText: { fontFamily: 'Raleway-SemiBold', fontSize: 13, color: '#5C3D2E' },
  durationPillTextSelected: { color: '#FFFFFF' },

  // Science fact card
  factCard: {
    backgroundColor: 'rgba(196,90,130,0.07)', borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 18,
    marginBottom: 22, width: '100%',
    borderWidth: 1, borderColor: 'rgba(196,90,130,0.12)',
  },
  factStat: { fontFamily: 'Raleway-Bold', fontSize: 18, color: '#C45A82', marginBottom: 4 },
  factBody: { fontFamily: 'DMSans', fontSize: 13, color: '#4A2E1E', lineHeight: 19 },

  // Begin button
  phoneDownStartBtn: {
    backgroundColor: '#C45A82', paddingHorizontal: 52, paddingVertical: 16,
    borderRadius: 999,
    shadowColor: '#C45A82', shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  phoneDownStartBtnText: { fontFamily: 'DMSans', fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // Active countdown
  phoneDownBtn: {
    paddingHorizontal: 36, paddingVertical: 14, borderRadius: 999,
    backgroundColor: 'rgba(196,90,130,0.10)',
  },
  phoneDownBtnText: { fontFamily: 'DMSans', fontSize: 15, fontWeight: '600', color: '#C45A82' },
});
