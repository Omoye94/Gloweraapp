import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Image, Pressable, Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const STAGES = ['seed', 'sprout', 'bud', 'bloom', 'glow'] as const;

const STAGE_LABELS: Record<string, string> = {
  seed:   'Seed',
  sprout: 'Sprout',
  bud:    'Bud',
  bloom:  'Bloom',
  glow:   'Glow',
};

const STAGE_COLORS: Record<string, [string, string]> = {
  seed:   ['rgba(155,134,212,0.3)', 'rgba(155,134,212,0.05)'],
  sprout: ['rgba(184,207,177,0.4)', 'rgba(184,207,177,0.08)'],
  bud:    ['rgba(242,180,204,0.35)', 'rgba(242,180,204,0.06)'],
  bloom:  ['rgba(232,127,166,0.4)', 'rgba(232,127,166,0.07)'],
  glow:   ['rgba(251,212,191,0.5)', 'rgba(251,212,191,0.1)'],
};

const FALLBACK_HABITS = ['Drink water', 'Morning skincare', 'Reflect & journal', 'Gratitude practice'];

const PLANT_ASSETS: Record<string, any> = {
  seed:   require('../../assets/plants/seed.png'),
  sprout: require('../../assets/plants/sprout.png'),
  bud:    require('../../assets/plants/bud.png'),
  bloom:  require('../../assets/plants/bloom.png'),
  glow:   require('../../assets/plants/glow.png'),
};

export default function FirstGrowthScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const mounted = useRef(true);
  const { selected_rituals } = useOnboardingStore();

  const habits = useMemo<(string | null)[]>(() => {
    const source = selected_rituals.length > 0 ? selected_rituals : FALLBACK_HABITS;
    return [null, ...Array.from({ length: 4 }, (_, i) => `${source[i % source.length]} ✓`)];
  }, [selected_rituals]);

  const [stageIdx, setStageIdx]     = useState(0);
  const [habitLabel, setHabitLabel] = useState<string | null>(null);

  const plantOpacity  = useRef(new Animated.Value(1)).current;
  const habitOpacity  = useRef(new Animated.Value(0)).current;
  const habitTransY   = useRef(new Animated.Value(10)).current;
  const glowScale     = useRef(new Animated.Value(1)).current;
  const ctaOpacity    = useRef(new Animated.Value(0)).current;
  const titleOpacity  = useRef(new Animated.Value(0)).current;
  const titleTransY   = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 600, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleTransY,  { toValue: 0, duration: 600, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => runSequence(0), 1200);
    return () => {
      mounted.current = false;
      clearTimeout(t);
    };
  }, []);

  const showHabit = (label: string, cb: () => void) => {
    if (!mounted.current) return;
    setHabitLabel(label);
    habitOpacity.setValue(0);
    habitTransY.setValue(10);
    Animated.parallel([
      Animated.timing(habitOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(habitTransY,  { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => setTimeout(cb, 500));
  };

  const hideHabit = (cb: () => void) => {
    Animated.timing(habitOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      if (mounted.current) setHabitLabel(null);
      cb();
    });
  };

  const transitionPlant = (nextIdx: number, cb: () => void) => {
    // Pulse glow
    Animated.sequence([
      Animated.timing(glowScale, { toValue: 1.15, duration: 300, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1,    duration: 300, useNativeDriver: true }),
    ]).start();

    // Fade plant out, swap, fade in
    Animated.timing(plantOpacity, { toValue: 0, duration: 380, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      if (mounted.current) setStageIdx(nextIdx);
      Animated.timing(plantOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => cb());
    });
  };

  const runSequence = (from: number) => {
    if (!mounted.current) return;

    const next = from + 1;
    if (next >= STAGES.length) {
      // All stages shown — reveal CTA
      if (!mounted.current) return;
      Animated.timing(ctaOpacity, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }).start();
      return;
    }

    const habit = habits[next]!;
    showHabit(habit, () => {
      transitionPlant(next, () => {
        hideHabit(() => {
          setTimeout(() => runSequence(next), 900);
        });
      });
    });
  };

  const currentStage = STAGES[stageIdx];
  const glowColors = STAGE_COLORS[currentStage];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>

      {/* Ambient background gradient shifts with stage */}
      <LinearGradient
        colors={['#1A1028', '#1A1028', glowColors[0]]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Title */}
      <Animated.View style={[styles.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleTransY }] }]}>
        <Text style={styles.eyebrow}>YOUR GARDEN</Text>
        <Text style={styles.title}>Watch yourself bloom</Text>
        <Text style={styles.subtitle}>Every ritual you keep grows your plant through five stages.</Text>
      </Animated.View>

      {/* Plant orb */}
      <View style={styles.orbArea}>
        {/* Glow ring */}
        <Animated.View style={[styles.glowRing, { transform: [{ scale: glowScale }], backgroundColor: glowColors[0] }]} />
        <Animated.View style={[styles.glowRingOuter, { backgroundColor: glowColors[1] }]} />

        {/* Plant image */}
        <Animated.View style={[styles.plantBox, { opacity: plantOpacity }]}>
          <Image
            source={PLANT_ASSETS[currentStage]}
            style={styles.plantImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Habit label */}
        {habitLabel && (
          <Animated.View style={[styles.habitPill, { opacity: habitOpacity, transform: [{ translateY: habitTransY }] }]}>
            <LinearGradient
              colors={['rgba(242,180,204,0.25)', 'rgba(155,134,212,0.2)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.habitPillGradient}
            >
              <Text style={styles.habitPillText}>{habitLabel}</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </View>

      {/* Stage label */}
      <Text style={styles.stageLabel}>{STAGE_LABELS[currentStage]}</Text>

      {/* Stage dots */}
      <View style={styles.dots}>
        {STAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === stageIdx && styles.dotActive,
              i < stageIdx && styles.dotDone,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <Animated.View style={[styles.ctaBlock, { opacity: ctaOpacity }]}>
        <Text style={styles.ctaCaption}>Your garden is ready to grow 🌿</Text>
        <Pressable
          onPress={() => router.push('/(onboarding)/yourname')}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={['#E87FA6', '#C45A82']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtnGradient}
          >
            <Text style={styles.ctaBtnText}>Make it yours</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  titleBlock: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  eyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: 'rgba(242,180,204,0.55)',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 30,
    fontWeight: '600',
    color: '#FEFAF9',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'DMSans',
    fontSize: 15,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Orb
  orbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    marginVertical: 16,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    shadowColor: '#E87FA6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  plantBox: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },

  // Habit pill
  habitPill: {
    position: 'absolute',
    bottom: -10,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#E87FA6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  habitPillGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.3)',
  },
  habitPillText: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '600',
    color: '#F2B4CC',
  },

  // Stage label
  stageLabel: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
    letterSpacing: 0.2,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#E87FA6',
  },
  dotDone: {
    backgroundColor: 'rgba(242,180,204,0.45)',
  },

  // CTA
  ctaBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 0,
  },
  ctaCaption: {
    fontFamily: 'DMSans',
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E87FA6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  ctaBtnGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 18,
  },
  ctaBtnText: {
    fontFamily: 'DMSans',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1028',
    letterSpacing: 0.2,
  },
});
