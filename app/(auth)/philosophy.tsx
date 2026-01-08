import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../src/components/ui';
import { theme, typography, spacing, borderRadius } from '../../src/theme';

const { width } = Dimensions.get('window');

const philosophyCards = [
  {
    emoji: '🌱',
    title: 'Your garden only grows',
    description: 'Every step forward counts. Your progress is never lost, and your plant never shrinks.',
  },
  {
    emoji: '💜',
    title: 'Partial progress matters',
    description: 'Did it gently? That counts too. There\'s no all-or-nothing here.',
  },
  {
    emoji: '✨',
    title: 'No streaks, no pressure',
    description: 'Missed a day? Your garden still loves you. Pick up whenever you\'re ready.',
  },
];

export default function PhilosophyScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < philosophyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/(auth)/select-habits');
    }
  };

  const currentCard = philosophyCards[currentIndex];
  const isLastCard = currentIndex === philosophyCards.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Our Philosophy</Text>

        <Card variant="elevated" padding="large" style={styles.card}>
          <Text style={styles.cardEmoji}>{currentCard.emoji}</Text>
          <Text style={styles.cardTitle}>{currentCard.title}</Text>
          <Text style={styles.cardDescription}>{currentCard.description}</Text>
        </Card>

        <View style={styles.dots}>
          {philosophyCards.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isLastCard ? 'Choose Your Habits' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.xl,
  },
  card: {
    width: width - spacing.xl * 2,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h4,
    color: theme.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  activeDot: {
    backgroundColor: theme.primary,
    width: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
