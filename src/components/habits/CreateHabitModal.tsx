import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { HabitCategory } from '../../types/habit';
import { useHabitStore } from '../../stores';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: HabitCategory }[] = [
  { label: 'Nutrition', value: 'nutrition' },
  { label: 'Movement', value: 'movement' },
  { label: 'Supplements', value: 'supplements' },
  { label: 'Hobbies', value: 'hobbies' },
  { label: 'Self-Care', value: 'self-care' },
  { label: 'Reflection', value: 'reflection' },
];

const ICONS = [
  '✨', '💫', '🌟', '⭐', '🌸', '🌺', '🌼', '💪',
  '🧘', '📚', '🎨', '🎵', '💧', '🍎', '🥗', '🌙',
];

const SUPPLEMENT_ICONS = [
  '💊', '💧', '🧴', '🌿', '🍵', '☀️', '🌙', '✨',
  '🫧', '🍃', '🧬', '💎',
];

const TIMING_OPTIONS = [
  { label: 'Morning', value: 'morning', emoji: '☀️' },
  { label: 'With Food', value: 'with-food', emoji: '🍽️' },
  { label: 'Evening', value: 'evening', emoji: '🌙' },
  { label: 'Any Time', value: 'any', emoji: '⏰' },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  visible,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('nutrition');
  const [selectedIcon, setSelectedIcon] = useState('✨');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('any');
  const [notes, setNotes] = useState('');

  const { addHabit } = useHabitStore();

  const isSupplements = category === 'supplements';
  const iconGrid = isSupplements ? SUPPLEMENT_ICONS : ICONS;

  const handleCreate = () => {
    if (!name.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    addHabit({
      name: name.trim(),
      category,
      icon: selectedIcon,
      isCustom: true,
      ...(isSupplements && {
        supplementMeta: {
          dosage: dosage.trim() || undefined,
          timingPreference: timing,
          notes: notes.trim() || undefined,
        },
      }),
    });

    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setCategory('nutrition');
    setSelectedIcon('✨');
    setDosage('');
    setTiming('any');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={['#FAE8ED', '#F5EBF8', '#FAF5FC']}
          style={styles.gradientBackground}
        />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={resetAndClose}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New Habit</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={(text) => setName(text.slice(0, 40))}
            placeholder="e.g. Morning stretches"
            placeholderTextColor={theme.textMuted}
            maxLength={40}
            autoFocus
          />
          <Text style={styles.charCount}>{name.length}/40</Text>

          {/* Category Selector */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pillRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => {
                    setCategory(cat.value);
                    if (cat.value === 'supplements') {
                      setSelectedIcon('💊');
                    } else if (isSupplements) {
                      setSelectedIcon('✨');
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.pill,
                    isSelected && styles.pillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected && styles.pillTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Icon Picker */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {iconGrid.map((icon) => {
              const isSelected = selectedIcon === icon;
              return (
                <Pressable
                  key={icon}
                  onPress={() => {
                    setSelectedIcon(icon);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.iconCell,
                    isSelected && styles.iconCellSelected,
                  ]}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Supplement-specific fields */}
          {isSupplements && (
            <>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.textInput}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 500 mg"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={styles.label}>Timing</Text>
              <View style={styles.pillRow}>
                {TIMING_OPTIONS.map((opt) => {
                  const isSelected = timing === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        setTiming(opt.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.pill,
                        isSelected && styles.pillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isSelected && styles.pillTextSelected,
                        ]}
                      >
                        {opt.emoji} {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
              />
            </>
          )}

          {/* Create Button */}
          <Pressable
            onPress={handleCreate}
            disabled={!name.trim()}
            style={({ pressed }) => [
              styles.createButton,
              !name.trim() && styles.createButtonDisabled,
              pressed && name.trim() ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : null,
            ]}
          >
            <LinearGradient
              colors={name.trim() ? ['#5C2D5C', '#7A4068'] : ['#B8A8B0', '#B8A8B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            />
            <Text style={styles.createButtonText}>Create Habit</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerButton: {
    width: 60,
  },
  cancelText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  charCount: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  pillSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  iconCellSelected: {
    backgroundColor: 'rgba(232, 164, 200, 0.25)',
    borderColor: theme.accent,
    ...shadows.glow,
  },
  iconEmoji: {
    fontSize: 24,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm + 2,
  },
  createButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.button,
    overflow: 'hidden',
    ...shadows.glow,
  },
  createButtonDisabled: {
    ...shadows.none,
  },
  createButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: spacing.md,
  },
});
