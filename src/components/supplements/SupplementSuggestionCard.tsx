import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SupplementInfo } from '../../types/supplement';
import { useSupplementStore } from '../../stores';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface SupplementSuggestionCardProps {
  onViewSupplement: (supplement: SupplementInfo) => void;
  onViewMore: () => void;
}

export const SupplementSuggestionCard: React.FC<SupplementSuggestionCardProps> = ({
  onViewSupplement,
  onViewMore,
}) => {
  const { getSuggestions, dismissSuggestion, hasGoals } = useSupplementStore();
  const suggestions = getSuggestions(2);

  // Don't render if no goals set or no suggestions
  if (!hasGoals() || suggestions.length === 0) {
    return null;
  }

  const handleDismiss = (supplementId: string) => {
    dismissSuggestion(supplementId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleViewSupplement = (supplement: SupplementInfo) => {
    onViewSupplement(supplement);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(158, 207, 176, 0.1)', 'rgba(212, 196, 232, 0.1)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>✨</Text>
          <Text style={styles.headerTitle}>Suggested for You</Text>
        </View>
        <Pressable
          onPress={onViewMore}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.viewMoreText}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.suggestionsContainer}>
        {suggestions.map((supplement) => (
          <View key={supplement.id} style={styles.suggestionItem}>
            <Pressable
              style={({ pressed }) => [
                styles.suggestionContent,
                pressed && styles.suggestionPressed,
              ]}
              onPress={() => handleViewSupplement(supplement)}
            >
              <View style={styles.suggestionIcon}>
                <Text style={styles.iconText}>{supplement.icon}</Text>
              </View>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {supplement.name}
                </Text>
                <Text style={styles.suggestionBenefit} numberOfLines={1}>
                  {supplement.benefits[0]}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleDismiss(supplement.id)}
            >
              <Text style={styles.dismissText}>✕</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        Based on your wellness goals
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
  },
  suggestionsContainer: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 196, 232, 0.2)',
  },
  suggestionPressed: {
    opacity: 0.8,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconText: {
    fontSize: 18,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  suggestionBenefit: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '300',
    color: theme.textMuted,
  },
  dismissButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  dismissText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  disclaimer: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
