import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Animated, Image, Easing, Modal, TextInput, KeyboardAvoidingView, Platform,
  Share,
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
  if (h < 12) return 'Good morning,';
  if (h < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function formatHeaderDate(): string {
  const d = new Date();
  const day = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${day} · ${month} ${d.getDate()}`.toUpperCase();
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
    route: '/(tabs)/beauty' as const,
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
  habit, done, catColor, reordering, isFirst, isLast, onTap, onMoveUp, onMoveDown,
}: {
  habit: any; done: boolean; catColor: string; reordering: boolean;
  isFirst: boolean; isLast: boolean;
  onTap: () => void; onMoveUp: () => void; onMoveDown: () => void;
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

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={renderLeftAction}
      overshootLeft={false}
      friction={2}
      leftThreshold={60}
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
  const glowPct = activeHabits.length > 0
    ? Math.round((completedCount / activeHabits.length) * 100)
    : 0;

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
          <View style={styles.headerTopRow}>
            <Text style={styles.dateLine}>{formatHeaderDate()}</Text>
            {streak > 0 && (
              <View style={styles.streakPill}>
                <View style={styles.streakDot} />
                <Text style={styles.streakPillText}>Day {streak}</Text>
              </View>
            )}
          </View>

          <Text style={styles.greetingLine}>
            {getGreeting()}{' '}
            <Text style={styles.greetingLineItalic}>{storedFirstName || userName || 'friend'}</Text>.
          </Text>
          <Text style={styles.welcomeLine}>
            Welcome back to{' '}
            <Text style={styles.welcomeLineItalic}>{gardenName || 'your garden'}</Text>.
          </Text>
        </View>

        {/* ── Daily Affirmation ── */}
        <DailyAffirmation />

        {/* ── Plant Hero ── */}
        <View style={styles.plantSection}>
          <View style={styles.plantCard}>
            {/* Plant illustration */}
            <View style={styles.plantImageHero}>
              <AnimatedPlant stage={stage} />
            </View>

            {/* Stage label */}
            <Text style={styles.plantStageLabel}>{STAGE_LABELS[stage]}</Text>

            {/* Glow meter */}
            <View style={styles.glowSection}>
              <View style={styles.glowRow}>
                <Text style={styles.glowMono}>GLOW METER</Text>
                <Text style={styles.glowPct}>{glowPct}%</Text>
              </View>
              <View style={styles.glowTrack}>
                <LinearGradient
                  colors={['#E8A0B8', '#C45A82']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.glowFill, { width: `${glowPct}%` as any }]}
                />
              </View>
              <Text style={styles.glowComplete}>{completedCount} of {activeHabits.length} rituals complete</Text>
            </View>
          </View>
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

        {/* ── Week Strip ── */}
        <View style={styles.weekStrip}>
          {weekDays.map(day => {
            const completions = dailySummaries[day.dateKey]
              ? Object.keys(dailySummaries[day.dateKey].completions).length
              : 0;
            const pct = activeHabits.length > 0 ? completions / activeHabits.length : 0;
            return (
              <View key={day.dateKey} style={styles.weekDayCol}>
                <Text style={[styles.weekDayLabel, day.isToday && styles.weekDayLabelToday]}>
                  {day.label}
                </Text>
                <View style={[styles.weekDayBubble, day.isToday && styles.weekDayBubbleToday]}>
                  <Text style={[styles.weekDayNum, day.isToday && styles.weekDayNumToday]}>
                    {day.date}
                  </Text>
                </View>
                <View style={[
                  styles.weekDot,
                  !day.isFuture && pct >= 1 && { backgroundColor: '#C45A82' },
                  !day.isFuture && pct > 0 && pct < 1 && { backgroundColor: '#F2B4CC' },
                ]} />
              </View>
            );
          })}
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
                    {reordering ? 'Done' : '⇅'}
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
          <Text style={styles.exploreTitle}>Explore</Text>
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
              <TextInput
                style={styles.modalInput}
                value={newHabitName}
                onChangeText={setNewHabitName}
                placeholder="e.g. Morning walk"
                placeholderTextColor="#B8A9A5"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddRitual}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={handleAddRitual}
                  style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.85 }]}
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  dateLine: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    color: '#A89A93',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(196,90,130,0.10)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C45A82',
  },
  streakPillText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#C45A82',
    textTransform: 'uppercase',
  },
  greetingLine: {
    fontFamily: 'PlayfairDisplay', fontSize: 30,
    color: '#3A2E2B', letterSpacing: -0.5, lineHeight: 38,
  },
  greetingLineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
  },
  welcomeLine: {
    fontFamily: 'PlayfairDisplay', fontSize: 16,
    color: '#9A857C', letterSpacing: 0.1, lineHeight: 22, marginTop: 8,
  },
  welcomeLineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#7A6258',
  },

  // Plant card
  plantSection: { marginTop: 24, paddingHorizontal: 20 },
  plantCard: {
    backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden',
    shadowColor: '#3A1A10', shadowOpacity: 0.10, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
  },
  plantImageHero: { width: '100%', height: 220, overflow: 'hidden', backgroundColor: '#E8CABA' },
  plantStageLabel: {
    fontFamily: 'Raleway-SemiBold', fontSize: 18,
    color: '#1A0A06', textAlign: 'center', marginTop: 14, letterSpacing: 0.2,
  },
  glowSection:  { paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 },
  glowRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  glowMono:     { fontFamily: 'SpaceMono-Bold', fontSize: 10, letterSpacing: 1.2, color: '#5C3D2E' },
  glowPct:      { fontFamily: 'SpaceMono-Bold', fontSize: 10, color: '#C45A82' },
  glowTrack:    { height: 5, borderRadius: 999, backgroundColor: 'rgba(196,90,130,0.12)', overflow: 'hidden' },
  glowFill:     { height: '100%', borderRadius: 999 },
  glowComplete: { fontFamily: 'DMSans', fontSize: 12, color: '#5C3D2E', marginTop: 8 },

  // Mood
  moodSection: { marginTop: 28, paddingHorizontal: 28 },
  moodQuestion: {
    fontFamily: 'DMSans', fontSize: 14, color: '#5C3D2E', marginBottom: 14,
  },
  moodRow:           { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem:          { alignItems: 'center', flex: 1, paddingVertical: 8, borderRadius: 14, gap: 5 },
  moodItemSelected:  { backgroundColor: 'rgba(196,90,130,0.12)' },
  moodEmoji:         { fontSize: 28 },
  moodLabel:         { fontFamily: 'DMSans', fontSize: 10, fontWeight: '500', color: '#6B4A38' },
  moodLabelSelected: { color: '#C45A82' },

  // Week strip
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#C4A99A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  weekDayCol: { flex: 1, alignItems: 'center', gap: 5 },
  weekDayLabel: { fontFamily: 'DMSans', fontSize: 11, fontWeight: '500', color: '#9A8278', letterSpacing: 0.2 },
  weekDayLabelToday: { color: '#C45A82', fontWeight: '700' },
  weekDayBubble: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  weekDayBubbleToday: { backgroundColor: '#C45A82' },
  weekDayNum: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '500', color: '#3A1A10' },
  weekDayNumToday: { color: '#FFFFFF', fontWeight: '700' },
  weekDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(0,0,0,0.1)' },

  // Rituals
  ritualsSection: { marginTop: 20, paddingHorizontal: 24 },
  ritualsHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  ritualsTitle: { fontFamily: 'PlayfairDisplay', fontSize: 22, color: '#3A2E2B', letterSpacing: -0.3 },
  ritualsHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(196,90,130,0.10)' },
  addBtnText:   { fontFamily: 'DMSans', fontSize: 13, fontWeight: '600', color: '#C45A82' },
  reorderBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(196,90,130,0.08)' },
  reorderBtnActive: { backgroundColor: '#C45A82' },
  reorderBtnText:   { fontFamily: 'DMSans', fontSize: 14, fontWeight: '600', color: '#C45A82' },
  reorderBtnTextActive: { color: '#FFFFFF' },

  // Progress pill
  progressPill: {
    backgroundColor: 'rgba(196,90,130,0.08)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
    alignSelf: 'flex-start', marginBottom: 16,
  },
  progressPillText: { fontFamily: 'DMSans', fontSize: 13, fontWeight: '500', color: '#C45A82' },

  // Category divider
  catDivider: {
    fontFamily: 'DMSans', fontSize: 10, fontWeight: '400',
    color: '#A89A93', letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: 10, marginTop: 20,
  },

  // Swipe action
  swipeAction: {
    width: 70, borderRadius: 18, marginBottom: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  swipeActionIcon: { fontSize: 20, color: '#FFFFFF', fontWeight: '700' },

  // Reorder controls
  reorderControls: { flexDirection: 'row', gap: 4, marginLeft: 'auto' as any },
  reorderArrow:    { width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(196,90,130,0.08)' },
  reorderArrowText: { fontSize: 14, color: '#C45A82', fontWeight: '700' },

  // Habit rows
  habitsList: { gap: 0 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,246,242,0.75)', borderRadius: 22, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(58,46,43,0.07)',
  },
  habitRowDone: { opacity: 0.45 },
  habitIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  habitEmoji: { fontSize: 20 },
  habitCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#C9BDB6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  habitCheckFilled: { backgroundColor: '#9CBFA0', borderColor: '#9CBFA0' },
  habitCheckmark: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  habitName:      { fontFamily: 'PlayfairDisplay', fontSize: 16, color: '#3A2E2B', flex: 1 },
  habitNameDone:  { color: '#A89A93' },

  // Empty state
  emptyCard: {
    alignItems: 'center', paddingVertical: 36,
    backgroundColor: '#FFFFFF', borderRadius: 20,
    shadowColor: '#3A1A10', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
  },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontFamily: 'Raleway-SemiBold', fontSize: 17, color: '#1A0A06', marginBottom: 6 },
  emptySub:   { fontFamily: 'DMSans', fontSize: 13, color: '#C45A82', textAlign: 'center', paddingHorizontal: 24 },

  // Share glow banner
  shareBanner: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#C4A99A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
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
    backgroundColor: 'rgba(255,255,255,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  shareBannerPlant: { width: 84, height: 84 },
  shareBannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
  },
  shareBannerBadgeText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#5C3D2E',
    textTransform: 'uppercase',
  },
  shareBannerTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    color: '#3A1A10',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
  },
  shareBannerSub: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: '#6B4A38',
    textAlign: 'center',
    marginBottom: 22,
  },
  shareBannerBtn: {
    backgroundColor: '#3A2E2B',
    borderRadius: 100,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  shareBannerBtnText: {
    fontFamily: 'DMSans',
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF6F2',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },

  // Explore
  exploreSection: { marginTop: 28, paddingBottom: 8 },
  exploreTitle: {
    fontFamily: 'Raleway-SemiBold', fontSize: 22,
    color: '#1A0A06', letterSpacing: -0.2, marginBottom: 14, paddingHorizontal: 24,
  },
  exploreScroll:       { paddingHorizontal: 24, gap: 12 },
  exploreCard:         { borderRadius: 24, overflow: 'hidden', width: 148 },
  exploreCardGradient: { padding: 18, height: 158, justifyContent: 'flex-end' },
  exploreEmoji:        { fontSize: 30, marginBottom: 'auto' as any },
  exploreCardTitle: {
    fontFamily: 'Raleway-SemiBold', fontSize: 14,
    color: '#1A0A06', marginBottom: 3,
  },
  exploreCardSub: {
    fontFamily: 'DMSans', fontSize: 11, color: '#4A2E1E',
    fontStyle: 'italic', lineHeight: 15,
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
