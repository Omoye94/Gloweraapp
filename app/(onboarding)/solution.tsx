import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
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
    <OnboardingScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            placeholderTextColor="rgba(58,46,43,0.4)"
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
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  headline: {
    fontSize: 33,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  subhead: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 24,
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.22)',
    borderLeftWidth: 6,
    borderLeftColor: '#7C66B8',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 20,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 22,
    shadowColor: '#7C66B8',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.18)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
  },
  bottom: { paddingTop: 24 },
});
