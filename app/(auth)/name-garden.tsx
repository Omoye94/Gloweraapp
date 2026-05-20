import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui';
import { theme, typography, spacing, borderRadius, shadows } from '../../src/theme';
import { useUserStore } from '../../src/stores';

const gardenSuggestions = [
  'Rose',
  'Poppy',
  'Luna',
  'Clover',
  'Willow',
  'Honey',
  'Petal',
  'Fern',
];

export default function NameGardenScreen() {
  const router = useRouter();
  const { initializeUser, completeOnboarding } = useUserStore();
  const [gardenName, setGardenName] = useState('');

  const handleComplete = () => {
    const name = gardenName.trim() || 'My Garden';
    initializeUser(name);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const selectSuggestion = (suggestion: string) => {
    setGardenName(suggestion);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.plantPreview}>
            <Text style={styles.plantEmoji}>🌱</Text>
          </View>

          <Text style={styles.title}>Name Your Garden</Text>
          <Text style={styles.subtitle}>
            Give your garden a name that feels special to you
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter garden name..."
            placeholderTextColor={theme.textMuted}
            value={gardenName}
            onChangeText={setGardenName}
            maxLength={30}
            autoFocus
          />

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Suggestions:</Text>
            <View style={styles.suggestions}>
              {gardenSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={[
                    styles.suggestionChip,
                    gardenName === suggestion && styles.suggestionChipActive,
                  ]}
                  onPress={() => selectSuggestion(suggestion)}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      gardenName === suggestion && styles.suggestionTextActive,
                    ]}
                  >
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Start Growing"
            onPress={handleComplete}
            fullWidth
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  plantPreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  plantEmoji: {
    fontSize: 70,
  },
  title: {
    ...typography.h2,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: theme.text,
    textAlign: 'center',
    ...shadows.sm,
    borderWidth: 2,
    borderColor: theme.border,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: spacing.xl,
  },
  suggestionsLabel: {
    ...typography.labelSmall,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  suggestionChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: theme.textSecondary,
  },
  suggestionTextActive: {
    color: theme.surface,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
});
