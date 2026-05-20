import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const FOCUS_AREAS = [
  { label: 'Skincare',        detail: 'routine & glow', color: '#F2B4CC' },
  { label: 'Supplements',     detail: 'never forget', color: '#D8C9EC' },
  { label: 'Hydration',       detail: 'daily water', color: '#B8CFB1' },
  { label: 'Movement',        detail: 'soft body care', color: '#FBD4BF' },
  { label: 'Mind & mood',     detail: 'reflection & calm', color: '#9B86D4' },
  { label: 'Sleep & rest',    detail: 'evening reset', color: '#F4A888' },
];

export default function FocusScreen() {
  const router = useRouter();
  const { focus_areas, toggleFocusArea } = useOnboardingStore();

  const handleToggle = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFocusArea(label);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.main}>
        <Text style={styles.label}>WHAT ARE WE PLANTING?</Text>
        <Text style={styles.headline}>Which parts of your glow-up need a place to grow?</Text>
        <Text style={styles.body}>Pick the areas you want Glowera to turn into visible garden progress.</Text>

        <View style={styles.grid}>
          {FOCUS_AREAS.map((area) => {
            const isSelected = focus_areas.includes(area.label);
            return (
              <Pressable
                key={area.label}
                onPress={() => handleToggle(area.label)}
                style={({ pressed }) => [
                  styles.tile,
                  isSelected && { backgroundColor: `${area.color}22`, borderColor: area.color },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: area.color }]} />
                <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
                  {area.label}
                </Text>
                <Text style={styles.tileDetail}>{area.detail}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="Continue"
          onPress={() => router.push('/(onboarding)/rituals')}
          disabled={focus_areas.length === 0}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.6)', letterSpacing: 1.2, marginBottom: 12 },
  headline: { fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', lineHeight: 39, marginBottom: 10 },
  body: { fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.50)', lineHeight: 23, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.5%', paddingVertical: 20, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tileText: { fontSize: 14, fontFamily: 'DMSans', fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  tileTextSelected: { color: '#FEFAF9', fontWeight: '600' },
  tileDetail: { fontSize: 12, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.34)', lineHeight: 17 },
  bottom: { paddingTop: 28 },
});
