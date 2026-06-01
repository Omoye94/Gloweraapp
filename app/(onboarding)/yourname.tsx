import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../src/components/onboarding';
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
    router.push('/(onboarding)/solution');
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
          <Text style={styles.kicker}>BEFORE WE BEGIN</Text>
          <Text style={styles.headline}>What should we call you?</Text>
          <Text style={styles.subhead}>We'll greet you here each day.</Text>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Your first name"
            placeholderTextColor="rgba(255,255,255,0.40)"
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
    marginBottom: 14,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.42)',
    letterSpacing: 0.2,
  },
  bottom: { paddingTop: 24 },
});
