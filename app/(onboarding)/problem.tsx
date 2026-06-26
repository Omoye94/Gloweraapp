import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const OPTIONS = [
  {
    emoji: '🧺',
    text: 'My routines live in too many places',
    reply: 'Glowera gathers the little beauty, wellness, and self-care pieces into one garden you can care for.',
  },
  {
    emoji: '🌀',
    text: "I can't seem to keep up with my own routine",
    reply: 'Your garden will show what needs care today without making you feel behind.',
  },
  {
    emoji: '🌙',
    text: 'I start strong, then fall off',
    reply: "We'll build a garden you can return to after messy days — not a streak you have to protect.",
  },
  {
    emoji: '🍃',
    text: 'I keep forgetting the small things that make me feel like me',
    reply: 'Every tiny thing becomes a seed: water, supplements, skin, movement, reflection, rest.',
  },
] as const;

export default function ProblemScreen() {
  const router = useRouter();
  const setValidationItems = useOnboardingStore((s) => s.setValidationItems);
  const [selected, setSelected] = useState<(typeof OPTIONS)[number] | null>(null);

  const handleSelect = (option: (typeof OPTIONS)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(option);
    setValidationItems([option.text]);
  };

  return (
    <OnboardingScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          <Text style={styles.kicker}>YOUR GLOW-UP, GROWN</Text>
          <Text style={styles.headline}>
            What&apos;s making your glow up <Text style={styles.headlineItalic}>hard</Text> right now?
          </Text>
          <Text style={styles.body}>
            Pick the one that&apos;s truest. We&apos;ll build from there.
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((option, index) => {
              const isSelected = selected?.text === option.text;
              return (
                <Pressable
                  key={option.text}
                  onPress={() => handleSelect(option)}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={styles.optionNumber}>0{index + 1}</Text>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.response, selected && styles.responseVisible]}>
            <Text style={styles.responseQuote}>“</Text>
            <Text style={styles.responseText}>
              {selected?.reply ?? 'Glowera turns your glow-up into a garden you can actually stay with.'}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title={selected ? 'Plant my glow' : 'Pick the one that fits'}
            onPress={() => router.push('/(onboarding)/focus')}
            disabled={!selected}
          />
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.signInLink, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Text style={styles.signInText}>Already glowing? </Text>
            <Text style={styles.signInTextBold}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  main: { flex: 1, paddingTop: 12 },
  kicker: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  headline: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  headlineItalic: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: '#C45A82',
  },
  body: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 24,
    marginBottom: 24,
  },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.24)',
    borderRadius: 20,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.26,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  optionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C45A82',
    borderWidth: 3,
    shadowColor: '#C45A82',
    shadowOpacity: 0.45,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  optionPressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  optionNumber: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.42)',
    width: 22,
    letterSpacing: 0.8,
  },
  optionEmoji: { fontSize: 22 },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    lineHeight: 22,
  },
  optionTextSelected: { color: '#3A2E2B', fontWeight: '600' },
  response: {
    marginTop: 18,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.32)',
    opacity: 0.6,
    position: 'relative',
    shadowColor: '#C45A82',
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  responseVisible: {
    opacity: 1,
    borderColor: 'rgba(196,90,130,0.5)',
    shadowOpacity: 0.32,
  },
  responseQuote: {
    position: 'absolute',
    top: 0,
    left: 16,
    fontSize: 60,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(196,90,130,0.18)',
    lineHeight: 60,
  },
  responseText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    color: 'rgba(58,46,43,0.78)',
    lineHeight: 24,
    paddingLeft: 4,
  },
  bottom: { paddingTop: 18, gap: 14 },
  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  signInText: {
    fontFamily: 'DMSans',
    fontSize: 13,
    color: 'rgba(58,46,43,0.45)',
  },
  signInTextBold: {
    fontFamily: 'DMSans',
    fontSize: 13,
    fontWeight: '600',
    color: '#C45A82',
  },
});
