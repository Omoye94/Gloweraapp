import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  BackHandler,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { DurationSelector } from '../src/components/phone-down/DurationSelector';
import { PhoneDownTimer } from '../src/components/phone-down/PhoneDownTimer';
import { RitualCompletionCard } from '../src/components/phone-down/RitualCompletionCard';
import { usePlantStore } from '../src/stores';
import { supabase } from '../lib/supabase';

// ─── Constants ─────────────────────────────────────────────────────────────────

type ScreenState = 'select' | 'active' | 'complete';

// 6 pts per minute, minimum 10 pts
function calcPoints(minutes: number): number {
  return Math.max(10, Math.round(minutes * 6));
}

const ACTIVE_MESSAGES = [
  'Your mind deserves quiet.',
  'Breathe slowly.',
  'Rest your eyes.',
  'You are allowed to pause.',
  'Quiet is productive.',
  'Rest supports growth.',
];

// ─── Floating Particle ─────────────────────────────────────────────────────────

const PARTICLE_COLORS = ['rgba(244,198,204,0.5)', 'rgba(212,201,248,0.5)', 'rgba(246,227,180,0.5)'];

interface ParticleCfg {
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
}

const FloatingParticle: React.FC<{ cfg: ParticleCfg }> = ({ cfg }) => {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-60, { duration: cfg.duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.6, { duration: cfg.duration * 0.25, easing: Easing.in(Easing.ease) }),
          withTiming(0.4, { duration: cfg.duration * 0.5 }),
          withTiming(0, { duration: cfg.duration * 0.25, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: cfg.x,
          bottom: 80,
          width: cfg.size,
          height: cfg.size,
          borderRadius: cfg.size / 2,
          backgroundColor: cfg.color,
        },
        style,
      ]}
    />
  );
};

const PARTICLES: ParticleCfg[] = [
  { x: 60,  color: PARTICLE_COLORS[0], size: 6, duration: 6000, delay: 0 },
  { x: 140, color: PARTICLE_COLORS[1], size: 4, duration: 7500, delay: 2000 },
  { x: 230, color: PARTICLE_COLORS[2], size: 5, duration: 6800, delay: 1000 },
  { x: 300, color: PARTICLE_COLORS[0], size: 4, duration: 8000, delay: 3500 },
];

// ─── Message Cycler ────────────────────────────────────────────────────────────

const MessageCycler: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      fadeAnim.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }, () => {
        setIdx((i) => (i + 1) % ACTIVE_MESSAGES.length);
        fadeAnim.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) });
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));

  return (
    <Animated.Text style={[styles.activeMessage, style]}>
      {ACTIVE_MESSAGES[idx]}
    </Animated.Text>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PhoneDownScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPoints } = usePlantStore();

  const [screen, setScreen] = useState<ScreenState>('select');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer tick ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== 'active') return;

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setSecondsRemaining(Math.ceil(remaining));
      if (remaining <= 0) handleComplete();
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [screen, totalSeconds]);

  // ── Android back handler ───────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== 'active') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleBegin = useCallback(async () => {
    const secs = selectedDuration * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    startTimeRef.current = Date.now();
    setScreen('active');

    // Insert session record
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('phone_down_sessions')
          .insert({
            user_id: user.id,
            duration_minutes: selectedDuration,
            completed: false,
            started_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (data) sessionIdRef.current = data.id;
      }
    } catch {
      // Supabase optional — local timer still works
    }
  }, [selectedDuration]);

  const handleComplete = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const pts = calcPoints(selectedDuration);
    setPointsEarned(pts);
    addPoints(pts, false); // uncapped — ritual is a mindfulness reward
    setScreen('complete');

    // Mark session complete
    try {
      if (sessionIdRef.current) {
        await supabase
          .from('phone_down_sessions')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', sessionIdRef.current);
      }
    } catch {
      // ignore
    }
  }, [selectedDuration, addPoints]);

  const handleEndEarly = () => confirmExit();

  const confirmExit = () => {
    Alert.alert(
      'End ritual?',
      'Your quiet time will end early.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End now', style: 'destructive', onPress: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setScreen('select');
        }},
      ],
    );
  };

  const handleReturn = () => {
    router.replace('/(tabs)/garden');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const gradientColors: [string, string, string] =
    screen === 'active'
      ? ['#E8D5D0', '#F5ECE1', '#D6C0D4']
      : ['#EDE0DB', '#F5ECE1', '#D8D0E8'];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: screen !== 'active',
          animation: 'fade',
        }}
      />

      <LinearGradient colors={gradientColors} style={styles.root}>
        {/* Floating particles (active state only) */}
        {screen === 'active' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {PARTICLES.map((p, i) => (
              <FloatingParticle key={i} cfg={p} />
            ))}
          </View>
        )}

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={screen === 'select'}
        >
          {/* Back / close button */}
          {screen !== 'active' && (
            <Pressable
              onPress={() => screen === 'complete' ? handleReturn() : router.back()}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontSize: 18, color: '#7A6668', lineHeight: 20 }}>←</Text>
            </Pressable>
          )}

          {/* ── SELECT STATE ── */}
          {screen === 'select' && (
            <View style={styles.section}>
              <Text style={styles.headline}>Phone Down{'\n'}Ritual</Text>
              <Text style={styles.tagline}>Take a moment for yourself.</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>CHOOSE YOUR PAUSE</Text>
              <DurationSelector
                selected={selectedDuration}
                onSelect={setSelectedDuration}
              />

              <View style={styles.ritualInfo}>
                <Text style={styles.ritualInfoText}>
                  {selectedDuration} minutes of quiet earns you{' '}
                  <Text style={styles.ritualInfoHighlight}>+{calcPoints(selectedDuration)} glow points</Text>
                </Text>
              </View>

              <Pressable
                onPress={handleBegin}
                style={({ pressed }) => [
                  styles.beginButton,
                  pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.beginButtonText}>Begin</Text>
              </Pressable>

              <Text style={styles.quietNote}>
                You are allowed to pause.{'\n'}Rest supports growth.
              </Text>
            </View>
          )}

          {/* ── ACTIVE STATE ── */}
          {screen === 'active' && (
            <View style={[styles.section, styles.activeSection]}>
              <Text style={styles.activeTitle}>Quiet time</Text>

              <View style={styles.timerWrapper}>
                <PhoneDownTimer
                  secondsRemaining={secondsRemaining}
                  totalSeconds={totalSeconds}
                />
              </View>

              <MessageCycler />

              <Pressable
                onPress={handleEndEarly}
                style={({ pressed }) => [styles.endEarlyButton, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.endEarlyText}>End early</Text>
              </Pressable>
            </View>
          )}

          {/* ── COMPLETE STATE ── */}
          {screen === 'complete' && (
            <View style={[styles.section, { paddingTop: 40 }]}>
              <RitualCompletionCard
                durationMinutes={selectedDuration}
                pointsEarned={pointsEarned}
                onReturn={handleReturn}
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254,250,249,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  // Select
  section: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
  },
  headline: {
    fontSize: 36,
    fontFamily: 'Raleway-SemiBold',
    color: '#1F1530',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 44,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#7A6668',
    textAlign: 'center',
    marginBottom: 32,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(212,144,154,0.35)',
    borderRadius: 9999,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  ritualInfo: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(254,250,249,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(212,201,248,0.3)',
  },
  ritualInfoText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#7A6668',
    textAlign: 'center',
    lineHeight: 20,
  },
  ritualInfoHighlight: {
    color: '#C45A82',
    fontWeight: '700',
  },
  beginButton: {
    backgroundColor: '#1F1530',
    borderRadius: 9999,
    paddingHorizontal: 56,
    paddingVertical: 17,
    shadowColor: '#1F1530',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 24,
  },
  beginButtonText: {
    fontSize: 17,
    fontFamily: 'Raleway-SemiBold',
    color: '#FEFAF9',
    letterSpacing: 0.5,
  },
  quietNote: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: '#9E8880',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Active
  activeSection: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: 500,
  },
  activeTitle: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 48,
    textAlign: 'center',
  },
  timerWrapper: {
    marginBottom: 56,
  },
  activeMessage: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#4A3032',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  endEarlyButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  endEarlyText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#9E8880',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
