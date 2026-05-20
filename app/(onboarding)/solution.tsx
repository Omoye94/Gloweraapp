import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const GLOW_TYPES = [
  {
    id: 'glow-organizer',
    title: 'Glow Organizer',
    line: 'Turn skincare, supplements, water, movement, and reflection into seeds in one garden.',
    palette: ['rgba(242,180,204,0.30)', 'rgba(216,201,236,0.10)'],
  },
  {
    id: 'consistency-reset',
    title: 'Consistency Reset',
    line: 'Tend a small loop each day so your glow can grow back into rhythm.',
    palette: ['rgba(184,207,177,0.30)', 'rgba(242,180,204,0.10)'],
  },
  {
    id: 'soft-accountability',
    title: 'Soft Accountability',
    line: 'Let your garden gently show what needs care, with no guilt when life gets busy.',
    palette: ['rgba(244,168,136,0.24)', 'rgba(155,134,212,0.12)'],
  },
] as const;

const SUGGESTIONS = ['Glow Routine', 'Soft Reset', 'My Glow Garden', 'Sunday Self-Care'];

export default function SolutionScreen() {
  const router = useRouter();
  const { garden_name, setGardenName } = useOnboardingStore();
  const [inputValue, setInputValue] = useState(garden_name || '');
  const [glowType, setGlowType] = useState<(typeof GLOW_TYPES)[number]['id']>('consistency-reset');

  const activeGlow = GLOW_TYPES.find(g => g.id === glowType) ?? GLOW_TYPES[1];

  const handleGlowType = (type: (typeof GLOW_TYPES)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGlowType(type.id);
  };

  const handleSuggestion = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue(name);
    setGardenName(name);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.trim()) setGardenName(text.trim());
  };

  const handleContinue = () => {
    if (!inputValue.trim()) setGardenName(activeGlow.title);
    router.push('/(onboarding)/focus');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient pointerEvents="none" colors={activeGlow.palette} style={styles.backdrop} />

        <View style={styles.main}>
          <Text style={styles.kicker}>CHOOSE YOUR GARDEN STYLE</Text>
          <Text style={styles.headline}>How should your glow-up grow?</Text>

          <View style={styles.reel}>
            {GLOW_TYPES.map((type) => {
              const active = glowType === type.id;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => handleGlowType(type)}
                  style={({ pressed }) => [
                    styles.glowCard,
                    active && styles.glowCardActive,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <LinearGradient
                    colors={type.palette}
                    style={styles.glowWash}
                  />
                  <Text style={[styles.glowTitle, active && styles.glowTitleActive]}>{type.title}</Text>
                  <Text style={styles.glowLine}>{type.line}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.nameLabel}>NAME YOUR GLOW GARDEN</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="e.g. My Glow Garden"
            placeholderTextColor="rgba(255,255,255,0.35)"
            maxLength={30}
          />

          <View style={styles.suggestions}>
            {SUGGESTIONS.map((name) => (
              <Pressable key={name} onPress={() => handleSuggestion(name)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton title="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 500 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  headline: {
    fontSize: 33,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 40,
    marginBottom: 22,
  },
  reel: { gap: 12, marginBottom: 24 },
  glowCard: {
    minHeight: 118,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'flex-end',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  glowCardActive: {
    borderColor: 'rgba(242,180,204,0.62)',
    shadowColor: '#E87FA6',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  glowWash: { ...StyleSheet.absoluteFillObject, opacity: 0.85 },
  glowTitle: {
    fontSize: 25,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 8,
  },
  glowTitleActive: { color: '#FEFAF9' },
  glowLine: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.58)',
    lineHeight: 21,
  },
  nameLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.58)',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(242,180,204,0.24)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    fontFamily: 'DMSans',
    color: '#FEFAF9',
    marginBottom: 12,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.62)',
  },
  bottom: { paddingTop: 24 },
});
