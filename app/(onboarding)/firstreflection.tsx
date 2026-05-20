import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../src/components/onboarding';
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.main}>
          <Text style={styles.emoji}>✦</Text>
          <Text style={styles.label}>SET YOUR WHY</Text>
          <Text style={styles.headline}>What would bloom if your glow-up finally felt organized?</Text>

          <View style={styles.card}>
            <Text style={styles.prompt}>Write the feeling you want this garden to grow.</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={handleChange}
              placeholder="I want to feel on top of myself again..."
              placeholderTextColor="rgba(255,255,255,0.25)"
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  emoji: { fontSize: 40, marginBottom: 16 },
  label: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.6)', letterSpacing: 1.2, marginBottom: 10 },
  headline: { fontSize: 31, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', lineHeight: 38, marginBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', padding: 20,
  },
  prompt: { fontSize: 15, fontFamily: 'PlayfairDisplay-Italic', color: 'rgba(255,255,255,0.55)', marginBottom: 14 },
  input: {
    fontSize: 15, fontFamily: 'DMSans', color: '#FEFAF9',
    minHeight: 140, lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
  },
  charCount: { fontSize: 11, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginTop: 8 },
  bottom: { paddingTop: 24 },
});
