import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, spacing, borderRadius } from '../../theme';

interface HealthDisclaimerProps {
  compact?: boolean;
}

export const HealthDisclaimer: React.FC<HealthDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactIcon}>ℹ️</Text>
        <Text style={styles.compactText}>
          Not medical advice. Consult a healthcare professional.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>ℹ️</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Health Disclaimer</Text>
        <Text style={styles.text}>
          This information is for educational purposes only and is not intended as medical advice.
          Always consult with a qualified healthcare professional before starting any supplement regimen.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 196, 232, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 196, 232, 0.3)',
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(212, 196, 232, 0.1)',
    borderRadius: borderRadius.sm,
  },
  compactIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  compactText: {
    fontSize: 11,
    color: theme.textMuted,
    flex: 1,
  },
});
