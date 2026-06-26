import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useHabitStore, useUserStore } from '../../src/stores';
import { supabase } from '../../lib/supabase';

const LOCAL_ONBOARDING_KEY = 'glowera-onboarding-complete';
const PREVIEW_ONBOARDING_KEY = 'glowera-onboarding-preview';

export default function WelcomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    selected_rituals, selected_supplements, first_reflection,
    preferred_name, garden_name, morning_reminder, evening_reminder, resetOnboarding,
  } = useOnboardingStore();
  const { addHabit } = useHabitStore();
  const { initializeUser } = useUserStore();

  const seedOpacity = useRef(new Animated.Value(0)).current;
  const seedScale = useRef(new Animated.Value(0.7)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const displayName = garden_name || 'My Garden';

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(seedOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(seedScale, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(labelOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(btnOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(seedScale, { toValue: 1.04, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(seedScale, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const t = setTimeout(() => pulse.start(), 2400);
    return () => { clearTimeout(t); pulse.stop(); };
  }, []);

  const handleEnterGarden = async () => {
    setIsLoading(true);
    try {
      const isPreview = await AsyncStorage.getItem(PREVIEW_ONBOARDING_KEY);
      if (isPreview === 'true') {
        await AsyncStorage.removeItem(PREVIEW_ONBOARDING_KEY);
        router.replace('/(tabs)');
        return;
      }

      await AsyncStorage.setItem(LOCAL_ONBOARDING_KEY, 'true');

      const iconMap: Record<string, string> = {
        'Morning skincare': '🌸',
        'Drink water': '💧',
        'Move my body': '🏃‍♀️',
        'Move your body': '🏃‍♀️',
        'Reflect & journal': '📝',
        'Take supplements': '💊',
        'Read or learn': '📚',
        'Mindful breathing': '🧘‍♀️',
        'Gratitude practice': '🙏',
      };
      const categoryMap: Record<string, string> = {
        'Morning skincare': 'self-care',
        'Drink water': 'nutrition',
        'Move my body': 'movement',
        'Move your body': 'movement',
        'Reflect & journal': 'self-care',
        'Take supplements': 'supplements',
        'Read or learn': 'hobbies',
        'Mindful breathing': 'movement',
        'Gratitude practice': 'self-care',
      };

      selected_rituals.forEach((ritual) => {
        addHabit({
          name: ritual,
          icon: iconMap[ritual] || '✨',
          category: (categoryMap[ritual] || 'self-care') as any,
          isCustom: false,
        });
      });

      const supplementIconMap: Record<string, string> = {
        'Multivitamin': '💊', 'Vitamin D': '☀️', 'Magnesium': '✨',
        'Iron': '🔴', 'Probiotic': '🦠', 'Omega-3': '🐟',
      };
      selected_supplements.forEach((supp) => {
        addHabit({
          name: supp,
          icon: supplementIconMap[supp] || '💊',
          category: 'supplements' as any,
          isCustom: false,
        });
      });

      initializeUser(displayName, preferred_name);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('users').upsert({
          id: session.user.id,
          onboarding_completed: true,
          reminders_enabled: morning_reminder || evening_reminder,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (first_reflection) {
          await supabase.from('daily_reflections').insert({
            user_id: session.user.id,
            reflection_date: new Date().toISOString().split('T')[0],
            prompt_text: 'How are you arriving today?',
            content: first_reflection,
          });
        }

        const habitRows = selected_rituals.map((name) => ({ user_id: session.user.id, name }));
        if (habitRows.length > 0) await supabase.from('habits').insert(habitRows);

        const suppRows = selected_supplements.map((name) => ({ user_id: session.user.id, name, frequency: 'daily' }));
        if (suppRows.length > 0) await supabase.from('supplements').insert(suppRows);
      }

      resetOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Welcome] Error completing onboarding:', error);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingScreen variant="warm" tone="transformation">
      <View style={styles.content}>
        <View style={styles.main}>
          {/* Seed image with glow */}
          <View style={styles.seedWrap}>
            <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.glowRingOuter, { opacity: glowOpacity }]} />
            <Animated.View style={{ opacity: seedOpacity, transform: [{ scale: seedScale }] }}>
              <Image
                source={require('../../assets/plants/seed.png')}
                style={styles.seedImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
            YOUR GARDEN AWAITS
          </Animated.Text>
          <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
            Start glowing up by{'\n'}growing your garden
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            {displayName} is ready for its first seeds.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.bottom, { opacity: btnOpacity }]}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#E87FA6" />
              <Text style={styles.loadingText}>Preparing your garden...</Text>
            </View>
          ) : (
            <PrimaryButton title="Enter your garden" onPress={handleEnterGarden} />
          )}
        </Animated.View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  seedWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  glowRing: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(232,127,166,0.18)',
  },
  glowRingOuter: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(254,201,180,0.22)',
  },
  seedImage: { width: 200, height: 200, borderRadius: 40 },
  label: {
    fontSize: 11, fontFamily: 'SpaceMono-Bold',
    color: '#C45A82', letterSpacing: 1.6, marginBottom: 16,
  },
  title: {
    fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#3A2E2B', textAlign: 'center', lineHeight: 40, letterSpacing: -0.3, marginBottom: 12,
  },
  subtitle: {
    fontSize: 18, fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(58,46,43,0.72)', textAlign: 'center',
  },
  bottom: { paddingTop: 24 },
  loadingWrap: { alignItems: 'center', paddingVertical: 20 },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.7)' },
});
