import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getDailyPrompt } from '../../constants/reflectionPrompts';
import { spacing, shadows } from '../../theme/spacing';
import { SolarIcon } from '../ui/SolarIcon';

export function TodayPromptCard() {
  const router = useRouter();
  const prompt = getDailyPrompt();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/journal')}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.94 }]}
    >
      <LinearGradient
        colors={['#E8B8D0', '#F2B4CC', '#F4A888']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.label}>TODAY'S PROMPT</Text>
        <Text style={styles.prompt}>{prompt.text}</Text>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>Open journal</Text>
          <SolarIcon name="alt-arrow-right-linear" size={13} color="#E87FA6" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 22,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  card: {
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
  },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#3A2E2B',
    lineHeight: 28,
    marginBottom: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cta: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#E87FA6',
  },
});
