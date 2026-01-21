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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useUserStore, useHabitStore, usePlantStore, useJournalStore, useChallengeStore } from '../../src/stores';
import { PlantDisplay } from '../../src/components/garden';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';

const THEME_OPTIONS = [
  { id: 'default', name: 'Lavender Bloom', colors: ['#FAE8ED', '#F5EBF8'] },
  { id: 'lavender', name: 'Misty Lavender', colors: ['#FAF5FC', '#E8D9F0'] },
  { id: 'sage', name: 'Garden Sage', colors: ['#F5FAF7', '#E8F4ED'] },
  { id: 'plum', name: 'Plum Dusk', colors: ['#F5EBF0', '#E8D4DE'] },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, resetUser, updateGardenName, updateNotificationSettings, setTheme } = useUserStore();
  const { habits, getActiveHabits, resetHabits, toggleHabitActive } = useHabitStore();
  const { plant, getProgressToNext, getPointsToNext, resetPlant } = usePlantStore();
  const { entries, resetJournal } = useJournalStore();
  const { challenges, getCompletedChallenges, resetChallenges } = useChallengeStore();

  // Modal states
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showManageHabitsModal, setShowManageHabitsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
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
        colors={['#FAE8ED', '#F5EBF8', '#E8D9F0']}
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
            colors={['rgba(255,255,255,0.95)', 'rgba(250,232,237,0.98)']}
            style={styles.gardenCardGradient}
          />
          <Pressable
            onPress={() => {
              setEditedGardenName(user?.gardenName || '');
              setShowEditNameModal(true);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.gardenNameRow}>
              <Text style={styles.gardenName}>{user?.gardenName || 'My Garden'}</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </Pressable>
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
              colors={['#FFFFFF', '#FAF5FC']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{plant.totalLifetimePoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFFFFF', '#FAE8ED']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F5EBF8']}
              style={styles.statCardGradient}
            />
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
        </View>

        {/* Your Habits - with manage option */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Habits</Text>
            <Pressable
              onPress={() => setShowManageHabitsModal(true)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.manageLink}>Manage</Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            {activeHabits.length === 0 ? (
              <Text style={styles.emptyText}>No habits selected</Text>
            ) : (
              activeHabits.slice(0, 5).map((habit, index) => (
                <View
                  key={habit.id}
                  style={[
                    styles.habitItem,
                    index < Math.min(activeHabits.length, 5) - 1 && styles.habitItemBorder,
                  ]}
                >
                  <View style={styles.habitIconContainer}>
                    <Text style={styles.habitIcon}>{habit.icon}</Text>
                  </View>
                  <Text style={styles.habitName}>{habit.name}</Text>
                </View>
              ))
            )}
            {activeHabits.length > 5 && (
              <Pressable
                onPress={() => setShowManageHabitsModal(true)}
                style={styles.seeMoreButton}
              >
                <Text style={styles.seeMoreText}>+{activeHabits.length - 5} more</Text>
              </Pressable>
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
              onPress={() => setShowNotificationsModal(true)}
            />
            <MenuItem
              icon="🎨"
              label="Theme"
              value={getThemeName()}
              onPress={() => setShowThemeModal(true)}
            />
            <MenuItem
              icon="📤"
              label="Export Data"
              onPress={handleExportData}
              isLast
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <MenuItem
              icon="💜"
              label="About Glowera"
              onPress={() => setShowAboutModal(true)}
            />
            <MenuItem
              icon="📖"
              label="Privacy Policy"
              onPress={() => setShowPrivacyModal(true)}
            />
            <MenuItem
              icon="📝"
              label="Terms of Service"
              onPress={() => setShowTermsModal(true)}
              isLast
            />
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

      {/* Edit Garden Name Modal */}
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
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit Garden Name</Text>
            <TextInput
              style={styles.textInput}
              value={editedGardenName}
              onChangeText={setEditedGardenName}
              placeholder="Enter garden name"
              placeholderTextColor={theme.textMuted}
              autoFocus
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowEditNameModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveGardenName}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Notifications Modal */}
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
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Notifications</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>Get gentle reminders</Text>
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
                <View style={styles.settingRow}>
                  <Pressable
                    style={styles.settingInfo}
                    onPress={() => user?.notificationSettings.morningReminder && openTimePicker('morning')}
                  >
                    <Text style={styles.settingLabel}>Morning Reminder</Text>
                    <Text style={[
                      styles.settingDescription,
                      user?.notificationSettings.morningReminder && styles.settingTimeTappable
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

                <View style={styles.settingRow}>
                  <Pressable
                    style={styles.settingInfo}
                    onPress={() => user?.notificationSettings.eveningReminder && openTimePicker('evening')}
                  >
                    <Text style={styles.settingLabel}>Evening Reminder</Text>
                    <Text style={[
                      styles.settingDescription,
                      user?.notificationSettings.eveningReminder && styles.settingTimeTappable
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
              style={[styles.modalButton, styles.modalButtonPrimary, { marginTop: spacing.lg }]}
              onPress={() => setShowNotificationsModal(false)}
            >
              <Text style={styles.modalButtonTextPrimary}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose Theme</Text>

            {THEME_OPTIONS.map((themeOption) => (
              <Pressable
                key={themeOption.id}
                style={({ pressed }) => [
                  styles.themeOption,
                  user?.selectedTheme === themeOption.id && styles.themeOptionSelected,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleSelectTheme(themeOption.id)}
              >
                <LinearGradient
                  colors={themeOption.colors}
                  style={styles.themePreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.themeName}>{themeOption.name}</Text>
                {user?.selectedTheme === themeOption.id && (
                  <Text style={styles.themeCheck}>✓</Text>
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Manage Habits Modal */}
      <Modal
        visible={showManageHabitsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManageHabitsModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalContent}>
            <View style={styles.fullModalHeader}>
              <Text style={styles.modalTitle}>Manage Habits</Text>
              <Pressable
                onPress={() => setShowManageHabitsModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.closeButton}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>Toggle habits on or off</Text>

            <Pressable
              style={({ pressed }) => [styles.addHabitButton, pressed && { opacity: 0.8 }]}
              onPress={() => setShowAddHabitModal(true)}
            >
              <Text style={styles.addHabitIcon}>+</Text>
              <Text style={styles.addHabitText}>Create Custom Habit</Text>
            </Pressable>

            <ScrollView style={styles.habitsScrollView}>
              {habits.map((habit, index) => (
                <Pressable
                  key={habit.id}
                  style={[
                    styles.habitManageItem,
                    index < habits.length - 1 && styles.habitItemBorder,
                  ]}
                  onPress={() => handleToggleHabit(habit.id)}
                >
                  <View style={styles.habitIconContainer}>
                    <Text style={styles.habitIcon}>{habit.icon}</Text>
                  </View>
                  <View style={styles.habitManageInfo}>
                    <Text style={[
                      styles.habitName,
                      !habit.isActive && styles.habitNameInactive,
                    ]}>
                      {habit.name}
                    </Text>
                    <Text style={styles.habitCategory}>{habit.category}</Text>
                  </View>
                  <Switch
                    value={habit.isActive}
                    onValueChange={() => handleToggleHabit(habit.id)}
                    trackColor={{ false: theme.borderLight, true: theme.primaryLight }}
                    thumbColor={habit.isActive ? theme.primary : theme.textMuted}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
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
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {editingTimeType === 'morning' ? 'Morning' : 'Evening'} Reminder
            </Text>

            <View style={styles.timePickerContainer}>
              {/* Hour */}
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
                        selectedHour === hour && styles.timePickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedHour === hour && styles.timePickerItemTextSelected,
                      ]}>
                        {hour}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timePickerSeparator}>:</Text>

              {/* Minute */}
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
                        selectedMinute === minute && styles.timePickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text style={[
                        styles.timePickerItemText,
                        selectedMinute === minute && styles.timePickerItemTextSelected,
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View style={styles.timePickerColumn}>
                {(['AM', 'PM'] as const).map((period) => (
                  <Pressable
                    key={period}
                    style={[
                      styles.timePickerItem,
                      styles.timePickerPeriodItem,
                      selectedPeriod === period && styles.timePickerItemSelected,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.timePickerItemText,
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
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowTimePickerModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* About Glowera Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalContent}>
            <View style={styles.fullModalHeader}>
              <Text style={styles.modalTitle}>About Glowera</Text>
              <Pressable
                onPress={() => setShowAboutModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.closeButton}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutLogoContainer}>
                <Text style={styles.aboutLogo}>🌸</Text>
                <Text style={styles.aboutAppName}>Glowera</Text>
                <Text style={styles.aboutTagline}>Grow at your own pace</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Our Philosophy</Text>
                <Text style={styles.aboutText}>
                  Glowera is a gentle wellness companion designed for those who want to nurture their well-being without the pressure of perfect streaks or harsh penalties.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>What Makes Us Different</Text>
                <View style={styles.aboutFeature}>
                  <Text style={styles.aboutFeatureIcon}>🌱</Text>
                  <View style={styles.aboutFeatureText}>
                    <Text style={styles.aboutFeatureTitle}>No Streaks</Text>
                    <Text style={styles.aboutFeatureDesc}>Your progress never resets. Every small step counts forever.</Text>
                  </View>
                </View>
                <View style={styles.aboutFeature}>
                  <Text style={styles.aboutFeatureIcon}>💜</Text>
                  <View style={styles.aboutFeatureText}>
                    <Text style={styles.aboutFeatureTitle}>No Penalties</Text>
                    <Text style={styles.aboutFeatureDesc}>Miss a day? That's okay. Your garden keeps growing when you return.</Text>
                  </View>
                </View>
                <View style={styles.aboutFeature}>
                  <Text style={styles.aboutFeatureIcon}>🌸</Text>
                  <View style={styles.aboutFeatureText}>
                    <Text style={styles.aboutFeatureTitle}>Gentle Progress</Text>
                    <Text style={styles.aboutFeatureDesc}>Celebrate doing things "gently" as much as doing them fully.</Text>
                  </View>
                </View>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Version</Text>
                <Text style={styles.aboutText}>Glowera v1.0.0</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutText}>Made with 💜 for your wellness journey</Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalContent}>
            <View style={styles.fullModalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Pressable
                onPress={() => setShowPrivacyModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.closeButton}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Your Privacy Matters</Text>
                <Text style={styles.aboutText}>
                  At Glowera, we believe your wellness journey is personal. Here's how we protect your privacy:
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Data Storage</Text>
                <Text style={styles.aboutText}>
                  All your data is stored locally on your device. We do not collect, store, or transmit your personal information to any servers.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>What We Store Locally</Text>
                <Text style={styles.aboutText}>
                  • Your garden name and preferences{'\n'}
                  • Your selected habits and completion history{'\n'}
                  • Your journal entries and moods{'\n'}
                  • Your plant growth progress
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>No Tracking</Text>
                <Text style={styles.aboutText}>
                  We do not use analytics, tracking pixels, or any third-party services that monitor your behavior.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Data Export</Text>
                <Text style={styles.aboutText}>
                  You can export all your data at any time from the Settings menu. Your data belongs to you.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Data Deletion</Text>
                <Text style={styles.aboutText}>
                  You can delete all your data at any time using the "Reset App Data" option. This permanently removes all information from your device.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutText}>
                  Last updated: January 2026
                </Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalContent}>
            <View style={styles.fullModalHeader}>
              <Text style={styles.modalTitle}>Terms of Service</Text>
              <Pressable
                onPress={() => setShowTermsModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.closeButton}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Welcome to Glowera</Text>
                <Text style={styles.aboutText}>
                  By using Glowera, you agree to these terms. Please read them carefully.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Use of the App</Text>
                <Text style={styles.aboutText}>
                  Glowera is designed to support your personal wellness journey. The app is provided "as is" for personal, non-commercial use.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Not Medical Advice</Text>
                <Text style={styles.aboutText}>
                  Glowera is a habit tracking and wellness companion app. It is not intended to provide medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Your Responsibilities</Text>
                <Text style={styles.aboutText}>
                  • Use the app in a way that supports your well-being{'\n'}
                  • Keep your device secure to protect your data{'\n'}
                  • Respect that progress is personal and non-competitive
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Intellectual Property</Text>
                <Text style={styles.aboutText}>
                  The Glowera name, design, and content are protected by intellectual property laws. You may not copy, modify, or distribute the app without permission.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Changes to Terms</Text>
                <Text style={styles.aboutText}>
                  We may update these terms from time to time. Continued use of the app constitutes acceptance of any changes.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutText}>
                  Last updated: January 2026
                </Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Custom Habit Modal */}
      <Modal
        visible={showAddHabitModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddHabitModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddHabitModal(false)}
        >
          <Pressable style={[styles.modalContent, styles.addHabitModalContent]} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Create Custom Habit</Text>

            <Text style={styles.inputLabel}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="e.g., Read for 10 minutes"
              placeholderTextColor={theme.textMuted}
              maxLength={40}
            />

            <Text style={styles.inputLabel}>Choose an Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    newHabitIcon === icon && styles.iconOptionSelected,
                  ]}
                  onPress={() => setNewHabitIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {HABIT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    newHabitCategory === cat.id && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setNewHabitCategory(cat.id)}
                >
                  <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryOptionText,
                    newHabitCategory === cat.id && styles.categoryOptionTextSelected,
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddHabitModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  !newHabitName.trim() && styles.modalButtonDisabled,
                ]}
                onPress={handleAddCustomHabit}
                disabled={!newHabitName.trim()}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: 'rgba(212, 196, 232, 0.2)',
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
    backgroundColor: 'rgba(212, 196, 232, 0.1)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 196, 232, 0.15)',
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
  // Garden name edit
  gardenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  // Section header with manage link
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  manageLink: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
    marginRight: spacing.xs,
  },
  seeMoreButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: theme.backgroundWarm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.borderLight,
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
    backgroundColor: theme.primary,
  },
  modalButtonSecondary: {
    backgroundColor: theme.backgroundWarm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  modalButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textOnPrimary,
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  // Settings rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  // Theme options
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  themeOptionSelected: {
    backgroundColor: 'rgba(212, 196, 232, 0.2)',
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },
  themeCheck: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: '600',
  },
  // Full modal for manage habits
  fullModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  fullModalContent: {
    backgroundColor: theme.surface,
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
    fontWeight: '600',
    color: theme.primary,
  },
  habitsScrollView: {
    marginTop: spacing.md,
  },
  habitManageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  habitManageInfo: {
    flex: 1,
  },
  habitNameInactive: {
    color: theme.textMuted,
  },
  habitCategory: {
    fontSize: 12,
    color: theme.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  // Tappable time in notifications
  settingTimeTappable: {
    color: theme.primary,
  },
  // Add habit button in manage habits modal
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 196, 232, 0.15)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.secondary,
    borderStyle: 'dashed',
  },
  addHabitIcon: {
    fontSize: 20,
    color: theme.primary,
    marginRight: spacing.sm,
    fontWeight: '300',
  },
  addHabitText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.primary,
  },
  // Time picker styles
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
    backgroundColor: theme.primary,
  },
  timePickerItemText: {
    fontSize: 18,
    fontWeight: '400',
    color: theme.text,
  },
  timePickerItemTextSelected: {
    color: theme.textOnPrimary,
    fontWeight: '600',
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: '300',
    color: theme.text,
    marginHorizontal: spacing.xs,
  },
  // About modal styles
  aboutScrollView: {
    flex: 1,
  },
  aboutLogoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  aboutLogo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  aboutAppName: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  aboutTagline: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  aboutSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  aboutFeature: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  aboutFeatureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  aboutFeatureText: {
    flex: 1,
  },
  aboutFeatureTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 2,
  },
  aboutFeatureDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  // Add habit modal styles
  addHabitModalContent: {
    maxWidth: 360,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: theme.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  iconOptionSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  iconOptionText: {
    fontSize: 22,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: theme.backgroundWarm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  categoryOptionSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },
  categoryOptionTextSelected: {
    color: theme.primary,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});
