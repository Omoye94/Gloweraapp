import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const OPTIONS = [
  {
    emoji: '🧺',
    text: 'My routines live in too many places',
    reply: 'Glowera gathers the little beauty, wellness, and self-care pieces into one garden you can care for.',
    glow: ['rgba(216,201,236,0.24)', 'rgba(242,180,204,0.10)'],
  },
  {
    emoji: '🌀',
    text: 'I can\'t seem to keep up with my own routine',
    reply: 'Your garden will show what needs care today without making you feel behind.',
    glow: ['rgba(155,134,212,0.28)', 'rgba(184,207,177,0.10)'],
  },
  {
    emoji: '🌙',
    text: 'I start strong, then fall off',
    reply: 'We\'ll build a garden you can return to after messy days — not a streak you have to protect.',
    glow: ['rgba(242,180,204,0.20)', 'rgba(216,201,236,0.12)'],
  },
  {
    emoji: '🍃',
    text: 'I keep forgetting the small things that make me feel like me',
    reply: 'Every tiny thing becomes a seed: water, supplements, skin, movement, reflection, rest.',
    glow: ['rgba(184,207,177,0.22)', 'rgba(244,168,136,0.12)'],
  },
] as const;

export default function ProblemScreen() {
  const router = useRouter();
  const setValidationItems = useOnboardingStore(s => s.setValidationItems);
  const [selected, setSelected] = useState<(typeof OPTIONS)[number] | null>(null);

  const handleSelect = (option: (typeof OPTIONS)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(option);
    setValidationItems([option.text]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        pointerEvents="none"
        colors={selected?.glow ?? ['rgba(232,127,166,0.16)', 'rgba(155,134,212,0.08)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>YOUR GLOW-UP, GROWN</Text>
        <Text style={styles.headline}>What&apos;s making your glow up hard right now?</Text>
        <Text style={styles.body}>Pick the one that&apos;s truest. We&apos;ll build from there.</Text>

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
          <Text style={styles.responseText}>{selected?.reply ?? 'Glowera turns your glow-up into a garden you can actually stay with.'}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={selected ? 'Plant my glow' : 'Pick the one that fits'}
          onPress={() => router.push('/(onboarding)/focus')}
          disabled={!selected}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 28, justifyContent: 'space-between' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    opacity: 0.9,
  },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  headline: {
    fontSize: 31,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 38,
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 24,
    marginBottom: 20,
  },
  options: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
  },
  optionSelected: {
    backgroundColor: 'rgba(232,127,166,0.18)',
    borderColor: 'rgba(242,180,204,0.62)',
  },
  optionPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  optionNumber: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(255,255,255,0.26)',
    width: 22,
  },
  optionEmoji: { fontSize: 20 },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 22,
  },
  optionTextSelected: { color: '#FEFAF9', fontWeight: '600' },
  response: {
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(20,12,32,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.16)',
    opacity: 0.65,
  },
  responseVisible: {
    opacity: 1,
    borderColor: 'rgba(242,180,204,0.34)',
  },
  responseText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 23,
  },
  bottom: { paddingTop: 16 },
});
