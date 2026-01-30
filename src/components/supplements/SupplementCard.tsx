import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SupplementInfo } from '../../types/supplement';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface SupplementCardProps {
  supplement: SupplementInfo;
  onPress: () => void;
  isAdded?: boolean;
}

export const SupplementCard: React.FC<SupplementCardProps> = ({
  supplement,
  onPress,
  isAdded = false,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isAdded && styles.addedContainer,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{supplement.icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{supplement.name}</Text>
          {isAdded && (
            <View style={styles.addedBadge}>
              <Text style={styles.addedText}>Added</Text>
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {supplement.description}
        </Text>
        <View style={styles.tags}>
          {supplement.benefits.slice(0, 2).map((benefit, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{benefit}</Text>
            </View>
          ))}
          {supplement.benefits.length > 2 && (
            <Text style={styles.moreText}>+{supplement.benefits.length - 2}</Text>
          )}
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
    ...shadows.sm,
  },
  addedContainer: {
    backgroundColor: 'rgba(212, 196, 232, 0.08)',
    borderColor: 'rgba(212, 196, 232, 0.3)',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  addedBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    marginLeft: spacing.sm,
  },
  addedText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.primary,
  },
  description: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(158, 207, 176, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  moreText: {
    fontSize: 11,
    color: theme.textMuted,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
    color: theme.textMuted,
    marginLeft: spacing.sm,
  },
});
