import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

function firstWord(text: string): string {
  return text.trim().split(/\s+/)[0] || '';
}

export default function YourNameScreen() {
  const router = useRouter();
  const { preferred_name, setPreferredName } = useOnboardingStore();
  const [inputValue, setInputValue] = useState(preferred_name || '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setPreferredName(firstWord(text));
  };

  const handleContinue = () => {
    setPreferredName(firstWord(inputValue));
    router.push('/(onboarding)/rituals');
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
            <Text style={styles.kicker}>BEFORE WE BEGIN</Text>
            <Text style={styles.headline}>What should we call you?</Text>
            <Text style={styles.subhead}>We&apos;ll greet you here each day.</Text>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputValue}
              onChangeText={handleInputChange}
              placeholder="Your first name"
              placeholderTextColor="rgba(58,46,43,0.4)"
              maxLength={24}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />

            <Text style={styles.hint}>You can change this anytime in your profile.</Text>
          </View>

          <View style={styles.bottom}>
            <PrimaryButton title="Continue" onPress={handleContinue} />
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
    borderLeftColor: '#C45A82',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 20,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    marginBottom: 14,
    shadowColor: '#C45A82',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.55)',
    letterSpacing: 0.2,
  },
  bottom: { paddingTop: 24 },
});
