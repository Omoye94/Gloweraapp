import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

interface PodSectionProps {
  label: string;
  children: React.ReactNode;
}

export function PodSection({ label, children }: PodSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelRow}>
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(58,46,43,0.08)',
  },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#9E8880',
    letterSpacing: 2,
  },
});
