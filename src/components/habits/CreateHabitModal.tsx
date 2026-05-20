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
import { Apple, Dumbbell, Pill, Palette, Heart, PenLine, Sun, Moon, Utensils, Clock } from 'lucide-react-native';
import { HabitCategory } from '../../types/habit';
import { useHabitStore } from '../../stores';
import { getHabitsByCategory } from '../../constants/habits';
import { spacing, shadows } from '../../theme';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: HabitCategory; Icon: React.FC<any> }[] = [
  { label: 'Nutrition', value: 'nutrition', Icon: Apple },
  { label: 'Movement', value: 'movement', Icon: Dumbbell },
  { label: 'Supplements', value: 'supplements', Icon: Pill },
  { label: 'Hobbies', value: 'hobbies', Icon: Palette },
  { label: 'Self-Care', value: 'self-care', Icon: Heart },
  { label: 'Reflection', value: 'reflection', Icon: PenLine },
];

const ICONS = [
  '\u2728', '\uD83D\uDCAB', '\uD83C\uDF1F', '\u2B50', '\uD83C\uDF38', '\uD83C\uDF3A', '\uD83C\uDF3C', '\uD83D\uDCAA',
  '\uD83E\uDDD8', '\uD83D\uDCDA', '\uD83C\uDFA8', '\uD83C\uDFB5', '\uD83D\uDCA7', '\uD83C\uDF4E', '\uD83E\uDD57', '\uD83C\uDF19',
];

const SUPPLEMENT_ICONS = [
  '\uD83D\uDC8A', '\uD83D\uDCA7', '\uD83E\uDDF4', '\uD83C\uDF3F', '\uD83C\uDF75', '\u2600\uFE0F', '\uD83C\uDF19', '\u2728',
  '\uD83E\uDEE7', '\uD83C\uDF43', '\uD83E\uDDEC', '\uD83D\uDC8E',
];

const TIMING_OPTIONS = [
  { label: 'Morning', value: 'morning', Icon: Sun },
  { label: 'With Food', value: 'with-food', Icon: Utensils },
  { label: 'Evening', value: 'evening', Icon: Moon },
  { label: 'Any Time', value: 'any', Icon: Clock },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  visible,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('nutrition');
  const [selectedIcon, setSelectedIcon] = useState('\u2728');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('any');
  const [notes, setNotes] = useState('');

  const { addHabit, habits } = useHabitStore();

  const isSupplements = category === 'supplements';

  const suggestions = getHabitsByCategory(category).filter(
    (s) => !habits.some((h) => h.name.toLowerCase() === s.name.toLowerCase())
  );
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
    setSelectedIcon('\u2728');
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
                      setSelectedIcon('\uD83D\uDC8A');
                    } else if (isSupplements) {
                      setSelectedIcon('\u2728');
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.pill,
                    isSelected && styles.pillSelected,
                  ]}
                >
                  <View style={styles.pillIconRow}>
                    <cat.Icon size={14} strokeWidth={1.5} color={isSelected ? '#FFFFFF' : '#6B5B52'} />
                    <Text
                      style={[
                        styles.pillText,
                        isSelected && styles.pillTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              <Text style={styles.label}>Suggestions</Text>
              <View style={styles.pillRow}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s.name}
                    onPress={() => {
                      setName(s.name);
                      setSelectedIcon(s.icon);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.pill,
                      name === s.name && styles.pillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        name === s.name && styles.pillTextSelected,
                      ]}
                    >
                      {s.icon} {s.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={(text) => setName(text.slice(0, 40))}
            placeholder="e.g. Morning stretches"
            placeholderTextColor={'#B8A99E'}
            maxLength={40}
          />
          <Text style={styles.charCount}>{name.length}/40</Text>

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
                placeholderTextColor={'#B8A99E'}
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
                      <View style={styles.pillIconRow}>
                        <opt.Icon size={14} strokeWidth={1.5} color={isSelected ? '#FFFFFF' : '#6B5B52'} />
                        <Text
                          style={[
                            styles.pillText,
                            isSelected && styles.pillTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </View>
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
                placeholderTextColor={'#B8A99E'}
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
    backgroundColor: '#FBF7F7',
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
    fontFamily: 'DMSans',
    color: '#6B5B52',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#6B5B52',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    borderWidth: 1,
    borderColor: '#EDE4DC',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#B8A99E',
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
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EDE4DC',
  },
  pillSelected: {
    backgroundColor: '#3A2E2B',
    borderColor: '#3A2E2B',
  },
  pillIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'DMSans',
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE4DC',
  },
  iconCellSelected: {
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
    borderColor: '#F2B4CC',
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
    borderRadius: 12,
    backgroundColor: '#3A2E2B',
    overflow: 'hidden',
  },
  createButtonDisabled: {
    backgroundColor: '#B8A99E',
  },
  createButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#F2B4CC',
    paddingVertical: spacing.md,
  },
});
