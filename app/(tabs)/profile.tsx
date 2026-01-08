import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useUserStore, useHabitStore, usePlantStore, useJournalStore, useChallengeStore } from '../../src/stores';
import { PlantDisplay } from '../../src/components/garden';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, resetUser } = useUserStore();
  const { habits, getActiveHabits, resetHabits } = useHabitStore();
  const { plant, getProgressToNext, getPointsToNext, resetPlant } = usePlantStore();
  const { entries, resetJournal } = useJournalStore();
  const { getCompletedChallenges, resetChallenges } = useChallengeStore();

  const activeHabits = getActiveHabits();
  const completedChallenges = getCompletedChallenges();

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to reset all your data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetUser();
            resetHabits();
            resetPlant();
            resetJournal();
            resetChallenges();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, label, value, onPress, isLast }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        !isLast && styles.menuItemBorder,
        pressed && onPress && styles.menuItemPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuIconContainer}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      {onPress && <Text style={styles.menuArrow}>›</Text>}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF9F5', '#FFEDE5', '#FFF5F7']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>You</Text>
          <Text style={styles.subtitle}>Your wellness journey</Text>
        </View>

        {/* Garden Card */}
        <View style={styles.gardenCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,249,245,0.98)']}
            style={styles.gardenCardGradient}
          />
          <Text style={styles.gardenName}>{user?.gardenName || 'My Garden'}</Text>
          <PlantDisplay
            stage={plant.currentStage}
            progressToNext={getProgressToNext()}
            pointsToNext={getPointsToNext()}
            totalPoints={plant.totalLifetimePoints}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF9F5']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{plant.totalLifetimePoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF5F7']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFFFFF', '#FFEDE5']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>

        {/* Active Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          <View style={styles.card}>
            {activeHabits.length === 0 ? (
              <Text style={styles.emptyText}>No habits selected</Text>
            ) : (
              activeHabits.map((habit, index) => (
                <View
                  key={habit.id}
                  style={[
                    styles.habitItem,
                    index < activeHabits.length - 1 && styles.habitItemBorder,
                  ]}
                >
                  <View style={styles.habitIconContainer}>
                    <Text style={styles.habitIcon}>{habit.icon}</Text>
                  </View>
                  <Text style={styles.habitName}>{habit.name}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <MenuItem
              icon="🔔"
              label="Notifications"
              value={user?.notificationSettings.enabled ? 'On' : 'Off'}
            />
            <MenuItem icon="🎨" label="Theme" value="Sunrise" />
            <MenuItem icon="📤" label="Export Data" isLast />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <MenuItem icon="💜" label="About Glowera" />
            <MenuItem icon="📖" label="Privacy Policy" />
            <MenuItem icon="📝" label="Terms of Service" isLast />
          </View>
        </View>

        {/* Reset */}
        <Pressable
          style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.7 }]}
          onPress={handleResetApp}
        >
          <Text style={styles.resetText}>Reset App Data</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>Glowera v1.0.0</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  gardenCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gardenCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gardenName: {
    fontSize: 22,
    fontWeight: '300',
    color: theme.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  statCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: theme.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  habitItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  habitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 153, 181, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  habitIcon: {
    fontSize: 18,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 153, 181, 0.05)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 177, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },
  menuValue: {
    fontSize: 14,
    color: theme.textSecondary,
    marginRight: spacing.sm,
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.textMuted,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.error,
  },
  version: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: 120,
  },
});
