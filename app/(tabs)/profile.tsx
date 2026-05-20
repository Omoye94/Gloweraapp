import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Switch,
  Share,
  Platform,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sun, Moon, Smartphone, Check, Plus, Sprout, Heart, PenLine } from 'lucide-react-native';
import { useUserStore, useHabitStore, usePlantStore, useJournalStore, useSupplementStore } from '../../src/stores';
import { supabase } from '../../lib/supabase';
import { GoalsSelectionModal } from '../../src/components/supplements';
import { spacing, borderRadius, shadows, lightTheme as defaultTheme } from '../../src/theme';
import { useTheme } from '../../src/context';
import { SolarIcon } from '../../src/components/ui/SolarIcon';

const LOCAL_ONBOARDING_KEY = 'glowera-onboarding-complete';
const PREVIEW_ONBOARDING_KEY = 'glowera-onboarding-preview';

const THEME_OPTIONS = [
  { id: 'default', name: 'Porcelain', colors: ['#FBF7F7', '#EDE4DC'] },
  { id: 'lavender', name: 'Lilac', colors: ['#FBF7F7', '#F1E1E1'] },
  { id: 'sage', name: 'Mint', colors: ['#F5FAF7', '#E8F4ED'] },
  { id: 'plum', name: 'Linen', colors: ['#EDE4DC', '#E2CBB2'] },
];

const APPEARANCE_OPTIONS = [
  { id: 'light', name: 'Light', Icon: Sun },
  { id: 'dark', name: 'Dark', Icon: Moon },
  { id: 'system', name: 'System', Icon: Smartphone },
] as const;

const STAGE_TO_LEVEL: Record<string, number> = {
  seed: 1,
  sprout: 2,
  bud: 3,
  bloom: 4,
  glow: 5,
};

function getInitials(name?: string): string {
  if (!name) return 'G';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'G';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const { user, resetUser, updateGardenName, updateNotificationSettings, setTheme } = useUserStore();
  const { habits, getActiveHabits, resetHabits, toggleHabitActive } = useHabitStore();
  const { plant, getProgressToNext, getPointsToNext, resetPlant } = usePlantStore();
  const { entries, resetJournal } = useJournalStore();
  const { wellnessGoals, resetSupplementPreferences } = useSupplementStore();

  // Modal states
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showManageHabitsModal, setShowManageHabitsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showWellnessGoalsModal, setShowWellnessGoalsModal] = useState(false);
  const [editedGardenName, setEditedGardenName] = useState(user?.gardenName || '');
  const [editingTimeType, setEditingTimeType] = useState<'morning' | 'evening'>('morning');
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  // Custom habit state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');
  const [newHabitCategory, setNewHabitCategory] = useState<string>('self-care');

  const activeHabits = getActiveHabits();
  const completedChallenges: unknown[] = [];

  // Derived stats
  const level = STAGE_TO_LEVEL[plant.currentStage] ?? 1;
  const currentStreak = plant.streak?.currentStreak ?? 0;
  const totalPoints = plant.totalLifetimePoints ?? 0;
  const badgeCount = plant.unlockedCosmetics?.length ?? 0;
  const displayName = user?.gardenName || 'Glowera';
  const initials = getInitials(displayName);

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'You can sign back in anytime to return to your Glowera account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              console.warn('[Profile] Sign out failed:', error);
            } finally {
              resetUser();
              resetHabits();
              resetPlant();
              resetJournal();
              resetSupplementPreferences();
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Your garden, habits, journal entries, and all data will be permanently erased.',
              [
                { text: 'Go Back', style: 'cancel' },
                {
                  text: 'Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Try to delete from Supabase (best-effort — works if authenticated)
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.rpc('delete_user');
                        await supabase.auth.signOut();
                      }
                    } catch (e) {
                      // Ignore Supabase errors — still clear local data
                      console.warn('[Profile] Supabase delete failed (may be local user):', e);
                    }

                    // Clear all AsyncStorage
                    await AsyncStorage.clear();

                    // Reset all stores
                    resetUser();
                    resetHabits();
                    resetPlant();
                    resetJournal();
                    resetSupplementPreferences();

                    router.replace('/(auth)/login');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleResetOnboarding = async () => {
    await AsyncStorage.setItem(PREVIEW_ONBOARDING_KEY, 'true');
    router.push('/(onboarding)/problem' as any);
  };

  const handleSaveGardenName = () => {
    if (editedGardenName.trim()) {
      updateGardenName(editedGardenName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEditNameModal(false);
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    updateNotificationSettings({ enabled: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleMorningReminder = (value: boolean) => {
    updateNotificationSettings({ morningReminder: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleEveningReminder = (value: boolean) => {
    updateNotificationSettings({ eveningReminder: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowThemeModal(false);
  };

  const handleToggleHabit = (habitId: string) => {
    toggleHabitActive(habitId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExportData = async () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        gardenName: user?.gardenName,
        createdAt: user?.createdAt,
        totalPoints: user?.totalPoints,
      },
      plant: {
        currentStage: plant.currentStage,
        totalLifetimePoints: plant.totalLifetimePoints,
      },
      habits: habits.map(h => ({
        name: h.name,
        category: h.category,
        isActive: h.isActive,
      })),
      journalEntries: entries.map(e => ({
        date: e.date,
        content: e.content,
        mood: e.mood,
      })),
      stats: {
        totalEntries: entries.length,
        completedChallenges: completedChallenges.length,
        activeHabits: activeHabits.length,
      },
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'Glowera Data Export',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    }
  };

  const getThemeName = () => {
    const currentTheme = THEME_OPTIONS.find(t => t.id === user?.selectedTheme);
    return currentTheme?.name || 'Sunrise';
  };

  const getAppearanceName = () => {
    const option = APPEARANCE_OPTIONS.find(o => o.id === themeMode);
    return option?.name || 'System';
  };

  const handleSelectAppearance = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAppearanceModal(false);
  };

  const openTimePicker = (type: 'morning' | 'evening') => {
    setEditingTimeType(type);
    const currentTime = type === 'morning'
      ? user?.notificationSettings.morningTime
      : user?.notificationSettings.eveningTime;

    if (currentTime) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const isPM = hours >= 12;
      setSelectedHour(hours > 12 ? hours - 12 : hours === 0 ? 12 : hours);
      setSelectedMinute(minutes);
      setSelectedPeriod(isPM ? 'PM' : 'AM');
    } else {
      setSelectedHour(type === 'morning' ? 8 : 8);
      setSelectedMinute(0);
      setSelectedPeriod(type === 'morning' ? 'AM' : 'PM');
    }
    setShowTimePickerModal(true);
  };

  const handleSaveTime = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) hour24 += 12;
    if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;

    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

    if (editingTimeType === 'morning') {
      updateNotificationSettings({ morningTime: timeString });
    } else {
      updateNotificationSettings({ eveningTime: timeString });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowTimePickerModal(false);
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '8:00 AM';
    const [hours, minutes] = time.split(':').map(Number);
    const isPM = hours >= 12;
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
  };

  const handleAddCustomHabit = () => {
    if (newHabitName.trim()) {
      const { addHabit } = useHabitStore.getState();
      addHabit({
        name: newHabitName.trim(),
        icon: newHabitIcon,
        category: newHabitCategory as any,
        isCustom: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewHabitName('');
      setNewHabitIcon('✨');
      setNewHabitCategory('self-care');
      setShowAddHabitModal(false);
    }
  };

  const HABIT_ICONS = ['✨', '💫', '🌟', '⭐', '🌸', '🌺', '🌼', '💪', '🧘', '📚', '🎨', '🎵', '💧', '🍎', '🥗', '🌙'];
  const HABIT_CATEGORIES = [
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'movement', name: 'Movement', icon: '💪' },
    { id: 'supplements', name: 'Supplements', icon: '💊' },
    { id: 'hobbies', name: 'Hobbies', icon: '🎨' },
    { id: 'self-care', name: 'Self-Care', icon: '🌸' },
    { id: 'reflection', name: 'Reflection', icon: '📝' },
  ];

  // Settings row component
  const SettingsRow = ({
    iconName,
    iconColor,
    iconBg,
    label,
    onPress,
    isLast = false,
  }: {
    iconName: string;
    iconColor: string;
    iconBg: string;
    label: string;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.settingsRow,
          pressed && onPress ? { backgroundColor: 'rgba(212,144,154,0.06)' } : null,
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.settingsIconBox, { backgroundColor: iconBg }]}>
          <SolarIcon name={iconName} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingsLabel}>{label}</Text>
        <SolarIcon name="alt-arrow-right-linear" size={20} color="#7A6668" />
      </Pressable>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={['#9B86D4', '#E87FA6', '#F4A888']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            {/* Camera edit button */}
            <Pressable
              style={styles.cameraButton}
              onPress={() => {
                setEditedGardenName(user?.gardenName || '');
                setShowEditNameModal(true);
              }}
            >
              <SolarIcon name="camera-bold" size={16} color="#FEFAF9" />
            </Pressable>
          </View>

          {/* Name */}
          <Text style={styles.headerName}>{displayName}</Text>
          <Text style={styles.headerSubtitle}>Level {level} • Glowera Platinum</Text>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {/* Streak */}
            <View style={styles.statCell}>
              <SolarIcon name="fire-bold" size={22} color="#C45A82" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>STREAK</Text>
            </View>
            {/* Points */}
            <View style={styles.statCell}>
              <SolarIcon name="star-bold" size={22} color="#9B86D4" />
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>POINTS</Text>
            </View>
            {/* Badges */}
            <View style={styles.statCell}>
              <SolarIcon name="medal-ribbon-bold" size={22} color="#8FA886" />
              <Text style={styles.statValue}>{badgeCount}</Text>
              <Text style={styles.statLabel}>BADGES</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Settings & Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS & PREFERENCES</Text>
          <View style={styles.card}>
            <SettingsRow
              iconName="pen-new-square-bold"
              iconColor="#C45A82"
              iconBg="rgba(244,198,204,0.2)"
              label="Garden Name"
              onPress={() => {
                setEditedGardenName(user?.gardenName || '');
                setShowEditNameModal(true);
              }}
            />
            <SettingsRow
              iconName="bell-bold"
              iconColor="#C45A82"
              iconBg="rgba(244,198,204,0.2)"
              label="Notifications"
              onPress={() => setShowNotificationsModal(true)}
            />
            <SettingsRow
              iconName="shield-check-bold"
              iconColor="#C45A82"
              iconBg="rgba(212,201,248,0.2)"
              label="Privacy"
              onPress={() => setShowPrivacyModal(true)}
            />
            <SettingsRow
              iconName="palette-bold"
              iconColor="#8FA886"
              iconBg="rgba(184,206,172,0.2)"
              label="Appearance"
              onPress={() => setShowAppearanceModal(true)}
              isLast
            />
          </View>
        </View>

        {/* ── Glowera Community ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GLOWERA COMMUNITY</Text>
          <View style={styles.card}>
            <SettingsRow
              iconName="users-group-rounded-bold"
              iconColor="#C45A82"
              iconBg="rgba(244,198,204,0.2)"
              label="Invite Friends"
              onPress={handleExportData}
            />
            <SettingsRow
              iconName="question-square-bold"
              iconColor="#7A6668"
              iconBg="#F4E8E0"
              label="Help & Support"
              onPress={() => setShowAboutModal(true)}
              isLast
            />
          </View>
        </View>

        {/* ── Preview Onboarding ── */}
        <Pressable
          style={({ pressed }) => [styles.previewOnboardingButton, pressed && { opacity: 0.7 }]}
          onPress={handleResetOnboarding}
        >
          <SolarIcon name="walking-bold" size={18} color="#7A6668" />
          <Text style={styles.previewOnboardingText}>Preview Onboarding</Text>
        </Pressable>

        {/* ── Logout ── */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]}
          onPress={handleLogout}
        >
          <SolarIcon name="logout-bold" size={18} color="#C96A6E" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* ── Delete Account ── */}
        <Pressable
          style={({ pressed }) => [styles.deleteAccountButton, pressed && { opacity: 0.7 }]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Edit Garden Name Modal ── */}
      <Modal
        visible={showEditNameModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowEditNameModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.backgroundWarm, borderColor: theme.borderLight, color: theme.text }]}
              value={editedGardenName}
              onChangeText={setEditedGardenName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textMuted}
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary, { backgroundColor: theme.backgroundWarm, borderColor: theme.borderLight }]}
                onPress={() => setShowEditNameModal(false)}
              >
                <Text style={[styles.modalButtonTextSecondary, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.primary }]}
                onPress={handleSaveGardenName}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: theme.textOnPrimary }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Notifications Modal ── */}
      <Modal
        visible={showNotificationsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotificationsModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifications</Text>

            <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Get gentle reminders</Text>
              </View>
              <Switch
                value={user?.notificationSettings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.borderLight, true: theme.primaryLight }}
                thumbColor={user?.notificationSettings.enabled ? theme.primary : theme.textMuted}
              />
            </View>

            {user?.notificationSettings.enabled && (
              <>
                <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
                  <Pressable
                    style={styles.settingInfo}
                    onPress={() => user?.notificationSettings.morningReminder && openTimePicker('morning')}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text }]}>Morning Reminder</Text>
                    <Text style={[
                      styles.settingDescription,
                      { color: theme.textSecondary },
                      user?.notificationSettings.morningReminder && { color: theme.primary },
                    ]}>
                      {formatTime(user?.notificationSettings.morningTime)}
                      {user?.notificationSettings.morningReminder && ' ›'}
                    </Text>
                  </Pressable>
                  <Switch
                    value={user?.notificationSettings.morningReminder}
                    onValueChange={handleToggleMorningReminder}
                    trackColor={{ false: theme.borderLight, true: theme.primaryLight }}
                    thumbColor={user?.notificationSettings.morningReminder ? theme.primary : theme.textMuted}
                  />
                </View>

                <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
                  <Pressable
                    style={styles.settingInfo}
                    onPress={() => user?.notificationSettings.eveningReminder && openTimePicker('evening')}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text }]}>Evening Reminder</Text>
                    <Text style={[
                      styles.settingDescription,
                      { color: theme.textSecondary },
                      user?.notificationSettings.eveningReminder && { color: theme.primary },
                    ]}>
                      {formatTime(user?.notificationSettings.eveningTime)}
                      {user?.notificationSettings.eveningReminder && ' ›'}
                    </Text>
                  </Pressable>
                  <Switch
                    value={user?.notificationSettings.eveningReminder}
                    onValueChange={handleToggleEveningReminder}
                    trackColor={{ false: theme.borderLight, true: theme.primaryLight }}
                    thumbColor={user?.notificationSettings.eveningReminder ? theme.primary : theme.textMuted}
                  />
                </View>
              </>
            )}

            <Pressable
              style={[styles.modalButton, styles.modalButtonPrimary, { marginTop: spacing.lg, backgroundColor: theme.primary }]}
              onPress={() => setShowNotificationsModal(false)}
            >
              <Text style={[styles.modalButtonTextPrimary, { color: theme.textOnPrimary }]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Appearance Modal ── */}
      <Modal
        visible={showAppearanceModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAppearanceModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAppearanceModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Appearance</Text>

            {APPEARANCE_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.themeOption,
                  themeMode === option.id && [styles.themeOptionSelected, { backgroundColor: isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.12)' }],
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleSelectAppearance(option.id)}
              >
                <View style={[styles.appearanceIconContainer, { backgroundColor: isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.12)' }]}>
                  <option.Icon size={22} strokeWidth={1.5} color={theme.primary} />
                </View>
                <Text style={[styles.themeName, { color: theme.text }]}>{option.name}</Text>
                {themeMode === option.id && (
                  <Check size={18} color={theme.primary} strokeWidth={2.5} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Privacy Modal ── */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={[styles.fullModalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.fullModalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Privacy Policy</Text>
              <Pressable
                onPress={() => setShowPrivacyModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.closeButton, { color: theme.primary }]}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: theme.text }]}>Your space, your data</Text>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                  Glowera is built to be a calm, private space. Your journal entries and voice reflections never leave your device. We only collect what's needed to run the app.
                </Text>
              </View>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: theme.text }]}>What stays on your device</Text>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                  • Journal entries and voice memos{'\n'}
                  • Habits and completion logs{'\n'}
                  • Mood check-ins and reflections{'\n'}
                  • Garden progress and plant stage
                </Text>
              </View>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: theme.text }]}>What we collect</Text>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                  Your email address (for your account), subscription status via RevenueCat, and basic usage data to power the garden and streaks. No location, no contacts, no health data.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.privacyLinkButton, pressed && { opacity: 0.7 }]}
                onPress={() => Linking.openURL('https://keen-cheshire-158.notion.site/Glowera-App-Privacy-Policy-34324bc53c8c80f0bda8f2f0d0527ed6')}
              >
                <SolarIcon name="document-text-bold" size={18} color="#C45A82" />
                <Text style={styles.privacyLinkText}>Read Full Privacy Policy</Text>
                <SolarIcon name="arrow-right-up-linear" size={16} color="#C45A82" />
              </Pressable>

              <Text style={[styles.aboutText, { color: theme.textMuted, textAlign: 'center', marginTop: 8 }]}>
                Last updated: April 15, 2026
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── About / Help Modal ── */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={[styles.fullModalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.fullModalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Help & Support</Text>
              <Pressable
                onPress={() => setShowAboutModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.closeButton, { color: theme.primary }]}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutLogoContainer}>
                <Sprout size={56} strokeWidth={1.5} color={defaultTheme.primary} />
                <Text style={[styles.aboutAppName, { color: theme.text }]}>Glowera</Text>
                <Text style={[styles.aboutTagline, { color: theme.textSecondary }]}>Grow at your own pace</Text>
              </View>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: theme.text }]}>Our Philosophy</Text>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                  Glowera is a gentle wellness companion designed for those who want to nurture their well-being without the pressure of perfect streaks or harsh penalties.
                </Text>
              </View>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutSectionTitle, { color: theme.text }]}>What Makes Us Different</Text>
                <View style={styles.aboutFeature}>
                  <View style={styles.aboutFeatureIconContainer}>
                    <Sprout size={22} strokeWidth={1.5} color={defaultTheme.primary} />
                  </View>
                  <View style={styles.aboutFeatureText}>
                    <Text style={[styles.aboutFeatureTitle, { color: theme.text }]}>No Streaks</Text>
                    <Text style={[styles.aboutFeatureDesc, { color: theme.textSecondary }]}>Your progress never resets. Every small step counts forever.</Text>
                  </View>
                </View>
                <View style={styles.aboutFeature}>
                  <View style={styles.aboutFeatureIconContainer}>
                    <Heart size={22} strokeWidth={1.5} color={defaultTheme.primary} />
                  </View>
                  <View style={styles.aboutFeatureText}>
                    <Text style={[styles.aboutFeatureTitle, { color: theme.text }]}>No Penalties</Text>
                    <Text style={[styles.aboutFeatureDesc, { color: theme.textSecondary }]}>Miss a day? That's okay. Your garden keeps growing when you return.</Text>
                  </View>
                </View>
              </View>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>Glowera v1.0.0 — Made with care for your wellness journey</Text>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Time Picker Modal ── */}
      <Modal
        visible={showTimePickerModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimePickerModal(false)}
        >
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingTimeType === 'morning' ? 'Morning' : 'Evening'} Reminder
            </Text>

            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <ScrollView
                  style={styles.timePickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerScrollContent}
                >
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => (
                    <Pressable
                      key={hour}
                      style={[
                        styles.timePickerItem,
                        selectedHour === hour && [styles.timePickerItemSelected, { backgroundColor: theme.primary }],
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        { color: theme.text },
                        selectedHour === hour && styles.timePickerItemTextSelected,
                      ]}>
                        {hour}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Text style={[styles.timePickerSeparator, { color: theme.text }]}>:</Text>

              <View style={styles.timePickerColumn}>
                <ScrollView
                  style={styles.timePickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.timePickerScrollContent}
                >
                  {[0, 15, 30, 45].map((minute) => (
                    <Pressable
                      key={minute}
                      style={[
                        styles.timePickerItem,
                        selectedMinute === minute && [styles.timePickerItemSelected, { backgroundColor: theme.primary }],
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        { color: theme.text },
                        selectedMinute === minute && styles.timePickerItemTextSelected,
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timePickerColumn}>
                {(['AM', 'PM'] as const).map((period) => (
                  <Pressable
                    key={period}
                    style={[
                      styles.timePickerItem,
                      styles.timePickerPeriodItem,
                      selectedPeriod === period && [styles.timePickerItemSelected, { backgroundColor: theme.primary }],
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.timePickerItemText,
                      { color: theme.text },
                      selectedPeriod === period && styles.timePickerItemTextSelected,
                    ]}>
                      {period}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary, { backgroundColor: theme.backgroundWarm, borderColor: theme.borderLight }]}
                onPress={() => setShowTimePickerModal(false)}
              >
                <Text style={[styles.modalButtonTextSecondary, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.primary }]}
                onPress={handleSaveTime}
              >
                <Text style={[styles.modalButtonTextPrimary, { color: theme.textOnPrimary }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Wellness Goals Modal ── */}
      <GoalsSelectionModal
        visible={showWellnessGoalsModal}
        onClose={() => setShowWellnessGoalsModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDD5CB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // ── Header ──
  headerGradient: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    shadowColor: '#C4A99A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 4,
    borderColor: 'rgba(212,144,154,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F2B4CC',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4A99A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInitials: {
    fontSize: 40,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#C45A82',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C45A82',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C4A99A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerName: {
    fontSize: 22,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(255,251,245,0.9)',
    marginBottom: 0,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  statCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 22,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 8,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(255,251,245,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Sections ──
  section: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#5C3D2E',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0CCBF',
  },
  settingsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  settingsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#1A0A06',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#D6C5C2',
    opacity: 0.3,
    marginHorizontal: 16,
  },

  // ── Logout ──
  previewOnboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 28,
    marginHorizontal: 24,
    gap: 8,
  },
  previewOnboardingText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#5C3D2E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginHorizontal: 24,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#C96A6E',
  },

  deleteAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    marginHorizontal: 24,
  },
  deleteAccountText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#B0878A',
    textDecorationLine: 'underline',
  },

  bottomSpacer: {
    height: 120,
  },

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: defaultTheme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: defaultTheme.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: defaultTheme.backgroundWarm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
    borderWidth: 1,
    borderColor: defaultTheme.borderLight,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: defaultTheme.primary,
  },
  modalButtonSecondary: {
    backgroundColor: defaultTheme.backgroundWarm,
    borderWidth: 1,
    borderColor: defaultTheme.borderLight,
  },
  modalButtonTextPrimary: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: defaultTheme.textOnPrimary,
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
  },

  // Settings rows in modals
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: defaultTheme.borderLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
  },
  settingDescription: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: defaultTheme.textSecondary,
    marginTop: 2,
  },

  // Appearance options
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  themeOptionSelected: {
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
  },
  appearanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  themeName: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
    flex: 1,
  },

  // Full-screen slide-up modals
  fullModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  fullModalContent: {
    backgroundColor: defaultTheme.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '80%',
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  closeButton: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: defaultTheme.primary,
  },
  aboutScrollView: {
    flex: 1,
  },
  aboutLogoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  aboutAppName: {
    fontSize: 28,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: defaultTheme.text,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  aboutTagline: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: defaultTheme.textSecondary,
    marginTop: spacing.xs,
  },
  aboutSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    fontWeight: '600',
    color: defaultTheme.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: defaultTheme.textSecondary,
    lineHeight: 22,
  },
  aboutFeature: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  aboutFeatureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aboutFeatureText: {
    flex: 1,
  },
  aboutFeatureTitle: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: defaultTheme.text,
    marginBottom: 2,
  },
  aboutFeatureDesc: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: defaultTheme.textSecondary,
    lineHeight: 18,
  },

  // Privacy link
  privacyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212,144,154,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  privacyLinkText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#C45A82',
    fontWeight: '600',
  },

  // Time picker
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  timePickerColumn: {
    alignItems: 'center',
  },
  timePickerScroll: {
    maxHeight: 160,
  },
  timePickerScrollContent: {
    alignItems: 'center',
  },
  timePickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  timePickerPeriodItem: {
    marginVertical: spacing.xs,
  },
  timePickerItemSelected: {
    backgroundColor: defaultTheme.primary,
  },
  timePickerItemText: {
    fontSize: 18,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
  },
  timePickerItemTextSelected: {
    color: defaultTheme.textOnPrimary,
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontFamily: 'DMSans',
    color: defaultTheme.text,
    marginHorizontal: spacing.xs,
  },
});
