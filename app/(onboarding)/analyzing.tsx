import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const STEP_DELAY = 1100;

function AnimatedStep({ label, index }: { label: string; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const enterDelay = index * STEP_DELAY;
    const checkDelay = enterDelay + 800;

    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(spinnerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, enterDelay);

    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(spinnerOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, checkDelay);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <Animated.View style={[styles.stepRow, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.spinnerWrap, { opacity: spinnerOpacity }]}>
          <ActivityIndicator size="small" color="#E87FA6" />
        </Animated.View>
        <Animated.View style={[styles.checkCircle, { opacity: checkOpacity }]}>
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
      </View>
      <Animated.Text style={[styles.stepLabel, { color: checkOpacity.interpolate({ inputRange: [0, 1], outputRange: ['rgba(58,46,43,0.65)', '#C45A82'] }) }]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

export default function AnalyzingScreen() {
  const router = useRouter();
  const { garden_name } = useOnboardingStore();
  const gardenLabel = garden_name?.trim() || 'your garden';

  const STEPS = [
    'Gathering your scattered glow habits...',
    'Turning each habit into a seed...',
    `Designing ${gardenLabel}...`,
    'Watering the first seeds...',
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/(onboarding)/results');
    }, STEPS.length * STEP_DELAY + 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <OnboardingScreen variant="warm" tone="transformation">
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🌱</Text>
        </View>
        <Text style={styles.kicker}>PLANTING YOUR GLOW</Text>
        <Text style={styles.headline}>Your garden is{'\n'}taking shape</Text>
        <View style={styles.steps}>
          {STEPS.map((label, i) => (
            <AnimatedStep key={label} label={label} index={i} />
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: 'center' },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: 'rgba(196,90,130,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#C45A82', shadowOpacity: 0.32, shadowRadius: 36, shadowOffset: { width: 0, height: 14 }, elevation: 10,
  },
  logoText: { fontSize: 48 },
  kicker: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#C45A82', letterSpacing: 1.6, marginBottom: 10 },
  headline: { fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#3A2E2B', textAlign: 'center', lineHeight: 40, letterSpacing: -0.3, marginBottom: 40 },
  steps: { width: '100%', gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 4 },
  iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  spinnerWrap: { position: 'absolute' },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#C45A82',
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#C45A82', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  checkmark: { color: '#C45A82', fontSize: 13, fontWeight: '700' },
  stepLabel: { fontSize: 16, fontFamily: 'DMSans', fontWeight: '500', flex: 1 },
});
