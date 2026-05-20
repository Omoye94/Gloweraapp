import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SolarIcon } from '../ui/SolarIcon';
import { spacing, shadows } from '../../theme';

export const ActionCards: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Reflection Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          styles.cardReflection,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push('/(tabs)/reflect')}
      >
        <View style={[styles.iconCircle, styles.iconCircleReflection]}>
          <SolarIcon name="pen-new-square-bold" size={22} color="#3A2E2B" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Reflection</Text>
          <Text style={styles.cardSubtitle}>Daily prompt</Text>
        </View>
      </Pressable>

      {/* Supplements Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          styles.cardSupplements,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => router.push('/(tabs)/glowstack')}
      >
        <View style={[styles.iconCircle, styles.iconCircleSupplements]}>
          <SolarIcon name="pill-bold" size={22} color="#3A2E2B" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Supplements</Text>
          <Text style={styles.cardSubtitle}>Check your stack</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    height: 110,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  cardReflection: {
    backgroundColor: '#F2B4CC',
  },
  cardSupplements: {
    backgroundColor: '#9B86D4',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleReflection: {
    backgroundColor: 'rgba(222, 196, 191, 0.5)',
  },
  iconCircleSupplements: {
    backgroundColor: 'rgba(222, 196, 191, 0.5)',
  },
  cardText: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    opacity: 0.65,
  },
});
