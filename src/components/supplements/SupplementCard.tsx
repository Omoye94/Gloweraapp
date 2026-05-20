import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
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
      <ChevronRight size={20} color={theme.textMuted} strokeWidth={1.5} />
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
    ...shadows.sm,
  },
  addedContainer: {
    backgroundColor: '#FFF6F2',
    borderWidth: 1,
    borderColor: '#EADBD4',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EADBD4',
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
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
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
    color: '#F2B4CC',
  },
  description: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6B5B52',
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
    backgroundColor: '#EADBD4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#6B5B52',
  },
  moreText: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
});
