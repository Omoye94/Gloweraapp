import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const STEPS = [
  'Gathering your scattered glow habits...',
  'Turning each habit into a seed...',
  'Designing the garden you will tend...',
  'Preparing your first bloom path...',
];

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
      <Animated.Text style={[styles.stepLabel, { color: checkOpacity.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255,255,255,0.7)', '#F2B4CC'] }) }]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

export default function AnalyzingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/(onboarding)/results');
    }, STEPS.length * STEP_DELAY + 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: 'center' },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(232,127,166,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#E87FA6', shadowOpacity: 0.2, shadowRadius: 40, shadowOffset: { width: 0, height: 0 },
  },
  logoText: { fontSize: 48 },
  kicker: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.58)', letterSpacing: 1.4, marginBottom: 10 },
  headline: { fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', textAlign: 'center', lineHeight: 37, marginBottom: 40 },
  steps: { width: '100%', gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 4 },
  iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  spinnerWrap: { position: 'absolute' },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(232,127,166,0.2)',
    borderWidth: 1.5, borderColor: '#E87FA6',
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute',
  },
  checkmark: { color: '#E87FA6', fontSize: 13, fontWeight: '700' },
  stepLabel: { fontSize: 16, fontFamily: 'DMSans', flex: 1 },
});
