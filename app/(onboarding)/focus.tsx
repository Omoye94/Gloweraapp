import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const FOCUS_AREAS = [
  { label: 'Skincare',        detail: 'the one you keep', color: '#F2B4CC' },
  { label: 'Supplements',     detail: 'never forget', color: '#D8C9EC' },
  { label: 'Hydration',       detail: 'without thinking about it', color: '#B8CFB1' },
  { label: 'Movement',        detail: 'gentle body care', color: '#FBD4BF' },
  { label: 'Mind & mood',     detail: 'reflection & calm', color: '#9B86D4' },
  { label: 'Sleep & rest',    detail: 'evening reset', color: '#F4A888' },
];

type FocusArea = (typeof FOCUS_AREAS)[number];

function FocusTile({
  area,
  index,
  isSelected,
  onPress,
}: {
  area: FocusArea;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [entrance, index]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dotScale, {
        toValue: isSelected ? 1.4 : 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 10,
      }),
      Animated.timing(haloOpacity, {
        toValue: isSelected ? 0.45 : 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected, dotScale, haloOpacity]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(pressScale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 14,
      }),
    ]).start();
    onPress();
  };

  const entranceTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Animated.View
      style={[
        styles.tileWrap,
        {
          opacity: entrance,
          transform: [{ translateY: entranceTranslateY }, { scale: pressScale }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={[
          styles.tile,
          isSelected && {
            backgroundColor: '#FFFFFF',
            borderColor: area.color,
            borderWidth: 3,
            shadowColor: area.color,
            shadowOpacity: 0.5,
            shadowRadius: 32,
            shadowOffset: { width: 0, height: 16 },
            elevation: 14,
          },
        ]}
      >
        <View style={styles.dotWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.dotHalo,
              { backgroundColor: area.color, opacity: haloOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: area.color, transform: [{ scale: dotScale }] },
            ]}
          />
        </View>
        <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
          {area.label}
        </Text>
        <Text style={styles.tileDetail}>{area.detail}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function FocusScreen() {
  const router = useRouter();
  const { focus_areas, toggleFocusArea } = useOnboardingStore();

  const handleToggle = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFocusArea(label);
  };

  return (
    <OnboardingScreen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
        <Text style={styles.label}>WHAT ARE WE PLANTING?</Text>
        <Text style={styles.headline}>What do you want to start showing up for?</Text>
        <Text style={styles.body}>Pick a few. We&apos;ll start small.</Text>

        <View style={styles.grid}>
          {FOCUS_AREAS.map((area, index) => (
            <FocusTile
              key={area.label}
              area={area}
              index={index}
              isSelected={focus_areas.includes(area.label)}
              onPress={() => handleToggle(area.label)}
            />
          ))}
        </View>
      </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={focus_areas.length === 0 ? 'Pick at least one' : `Plant these (${focus_areas.length})`}
            onPress={() => router.push('/(onboarding)/yourname')}
            disabled={focus_areas.length === 0}
          />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#C45A82', letterSpacing: 1.6, marginBottom: 14 },
  headline: { fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#3A2E2B', lineHeight: 40, letterSpacing: -0.3, marginBottom: 12 },
  body: { fontSize: 16, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.75)', lineHeight: 24, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tileWrap: { width: '47.5%' },
  tile: {
    paddingVertical: 20, paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: 'rgba(58,46,43,0.28)',
    borderRadius: 20, gap: 8,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.32,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  dotWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tileText: { fontSize: 15, fontFamily: 'DMSans', fontWeight: '600', color: '#3A2E2B' },
  tileTextSelected: { color: '#3A2E2B', fontWeight: '700' },
  tileDetail: { fontSize: 13, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.62)', lineHeight: 18 },
  bottom: { paddingTop: 28 },
});
