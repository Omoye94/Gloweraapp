import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const MAX_CHARS = 500;

export default function FirstReflectionScreen() {
  const router = useRouter();
  const { first_reflection, setFirstReflection } = useOnboardingStore();
  const [text, setText] = useState(first_reflection || '');

  const handleChange = (value: string) => {
    setText(value);
    setFirstReflection(value.trim());
  };

  const handleContinue = () => {
    router.push('/(onboarding)/analyzing');
  };

  return (
    <OnboardingScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.main}>
            <Text style={styles.emoji}>✦</Text>
            <Text style={styles.label}>SET YOUR WHY</Text>
            <Text style={styles.headline}>What do you want this garden to grow into?</Text>

            <View style={styles.card}>
              <Text style={styles.prompt}>Write what you want to feel.</Text>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={handleChange}
                placeholder="I want to feel like myself again..."
                placeholderTextColor="rgba(58,46,43,0.35)"
                multiline
                maxLength={MAX_CHARS}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{text.length}/{MAX_CHARS}</Text>
            </View>
          </View>

          <View style={styles.bottom}>
            <PrimaryButton
              title={text.trim() ? 'Save my why' : 'Skip for now'}
              onPress={handleContinue}
            />
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
  emoji: { fontSize: 40, marginBottom: 16 },
  label: { fontSize: 11, fontFamily: 'SpaceMono-Bold', color: '#C45A82', letterSpacing: 1.6, marginBottom: 12 },
  headline: { fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#3A2E2B', lineHeight: 40, letterSpacing: -0.3, marginBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 22,
    borderWidth: 2, borderColor: 'rgba(58,46,43,0.22)',
    borderLeftWidth: 6, borderLeftColor: '#6F8B6A',
    padding: 22,
    shadowColor: '#6F8B6A', shadowOpacity: 0.24, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 8,
  },
  prompt: { fontSize: 15, fontFamily: 'PlayfairDisplay-Italic', color: 'rgba(58,46,43,0.65)', marginBottom: 14 },
  input: {
    fontSize: 15, fontFamily: 'DMSans', color: '#3A2E2B',
    minHeight: 140, lineHeight: 24,
    backgroundColor: 'rgba(247,232,218,0.45)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(58,46,43,0.1)',
    padding: 14,
  },
  charCount: { fontSize: 11, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.4)', textAlign: 'right', marginTop: 8 },
  bottom: { paddingTop: 24 },
});
