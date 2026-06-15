import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const SUGGESTIONS = ['Glow Garden', 'My Bloom', 'Wildflower', 'Quiet Garden'];
const FALLBACK_NAME = 'My Glow Garden';

export default function SolutionScreen() {
  const router = useRouter();
  const { garden_name, setGardenName } = useOnboardingStore();
  const [inputValue, setInputValue] = useState(garden_name || '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const handleSuggestion = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue(name);
    setGardenName(name);
    inputRef.current?.focus();
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.trim()) setGardenName(text.trim());
  };

  const handleContinue = () => {
    if (!inputValue.trim()) setGardenName(FALLBACK_NAME);
    router.push('/(onboarding)/firstreflection');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(242,180,204,0.30)', 'rgba(216,201,236,0.10)']}
          style={styles.backdrop}
        />

        <View style={styles.main}>
          <Text style={styles.kicker}>MAKE IT YOURS</Text>
          <Text style={styles.headline}>Every garden needs a name.</Text>
          <Text style={styles.subhead}>What feels like yours?</Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Type your garden's name…"
            placeholderTextColor="rgba(255,255,255,0.40)"
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          <Text style={styles.suggestionsLabel}>Or pick one of these</Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((name) => (
              <Pressable key={name} onPress={() => handleSuggestion(name)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton title="Plant it" onPress={handleContinue} />
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
    marginBottom: 14,
  },
  headline: {
    fontSize: 33,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 40,
    marginBottom: 12,
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 24,
    marginBottom: 28,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(242,180,204,0.24)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 18,
    fontFamily: 'DMSans',
    color: '#FEFAF9',
    marginBottom: 22,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(255,255,255,0.42)',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.72)',
  },
  bottom: { paddingTop: 24 },
});
