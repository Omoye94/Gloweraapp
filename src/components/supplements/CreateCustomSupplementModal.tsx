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
import { useHabitStore } from '../../stores';
import { SupplementInfo } from '../../types/supplement';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface CreateCustomSupplementModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

const ICONS = [
  '💊', '💧', '🧴', '🌿', '🍵', '☀️',
  '🌙', '✨', '🫧', '🍃', '🧬', '💎',
];

const TIMING_OPTIONS = [
  { label: 'Morning', value: 'morning', emoji: '☀️' },
  { label: 'With Food', value: 'with-food', emoji: '🍽️' },
  { label: 'Evening', value: 'evening', emoji: '🌙' },
  { label: 'Any Time', value: 'any', emoji: '⏰' },
];

export const CreateCustomSupplementModal: React.FC<CreateCustomSupplementModalProps> = ({
  visible,
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💊');
  const [timing, setTiming] = useState('any');
  const [notes, setNotes] = useState('');

  const { addSupplementHabit } = useHabitStore();

  const handleAdd = () => {
    if (!name.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Build a SupplementInfo-like object for the custom supplement
    const customSupplement: SupplementInfo = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      category: 'specialty',
      description: 'Custom supplement',
      benefits: [],
      typicalDosage: dosage.trim() || '',
      timing: timing as SupplementInfo['timing'],
      tags: [],
    };

    addSupplementHabit(customSupplement, {
      dosage: dosage.trim() || undefined,
      timingPreference: timing,
      notes: notes.trim() || undefined,
    });

    resetAndClose();
    onAdded?.();
  };

  const resetAndClose = () => {
    setName('');
    setDosage('');
    setSelectedIcon('💊');
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
          colors={['#FBF7F7', '#EDE4DC']}
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
          <Text style={styles.headerTitle}>Custom Supplement</Text>
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
            onChangeText={setName}
            placeholder="e.g. Ashwagandha"
            placeholderTextColor={theme.textMuted}
            autoFocus
          />

          {/* Dosage Input */}
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.textInput}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g. 500 mg"
            placeholderTextColor={theme.textMuted}
          />

          {/* Icon Picker */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => {
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

          {/* Timing Selector */}
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

          {/* Notes Input */}
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

          {/* Add Button */}
          <Pressable
            onPress={handleAdd}
            disabled={!name.trim()}
            style={({ pressed }) => [
              styles.addButton,
              !name.trim() && styles.addButtonDisabled,
              pressed && name.trim() ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : null,
            ]}
          >
            <LinearGradient
              colors={name.trim() ? ['#3A2E2B', '#A85C3C'] : ['#B8A99E', '#B8A99E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            />
            <Text style={styles.addButtonText}>Add to My Stack</Text>
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
    backgroundColor: '#FBF7F7',
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
    color: '#3A2E2B',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A2E2B',
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
    color: '#6B5B52',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: '#3A2E2B',
    borderWidth: 1,
    borderColor: '#EDE4DC',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE4DC',
  },
  pillSelected: {
    backgroundColor: '#3A2E2B',
    borderColor: '#3A2E2B',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B5B52',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDE4DC',
  },
  iconCellSelected: {
    backgroundColor: '#EDE4DC',
    borderColor: '#3A2E2B',
    ...shadows.warmGlow,
  },
  iconEmoji: {
    fontSize: 24,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm + 2,
  },
  addButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.button,
    overflow: 'hidden',
    ...shadows.glow,
  },
  addButtonDisabled: {
    ...shadows.none,
  },
  addButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  addButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: spacing.md,
  },
});
