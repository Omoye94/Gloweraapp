import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BeautyRitualForm, BeautyFormValues } from '../../src/components/beauty/BeautyRitualForm';
import { useBeautyRituals } from '../../src/hooks/useBeautyRituals';
import { spacing } from '../../src/theme';
import { BeautyCategory, BeautyTimeOfDay } from '../../src/types/beauty';

const PRESETS: Array<{
  label: string;
  category: BeautyCategory;
  time_of_day: BeautyTimeOfDay;
}> = [
  { label: 'AM Skincare', category: 'skincare', time_of_day: 'morning' },
  { label: 'PM Skincare', category: 'skincare', time_of_day: 'evening' },
  { label: 'Gua Sha', category: 'gua-sha', time_of_day: 'evening' },
  { label: 'Lip Care', category: 'lip-care', time_of_day: 'anytime' },
  { label: 'Hair Oiling', category: 'hair-care', time_of_day: 'weekly' },
  { label: 'Scalp Massage', category: 'scalp-care', time_of_day: 'weekly' },
  { label: 'Body Lotion', category: 'body-care', time_of_day: 'evening' },
  { label: 'Shower Ritual', category: 'shower-ritual', time_of_day: 'anytime' },
];

export default function NewBeautyRitualScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleCreate } = useBeautyRituals();

  const [formValues, setFormValues] = useState<BeautyFormValues>({
    title: '',
    category: 'skincare',
    time_of_day: 'morning',
    frequency: 'daily',
    notes: '',
  });

  const applyPreset = (preset: typeof PRESETS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormValues((v) => ({
      ...v,
      title: preset.label,
      category: preset.category,
      time_of_day: preset.time_of_day,
    }));
  };

  const handleSave = async () => {
    if (!formValues.title.trim()) {
      Alert.alert('Name required', 'Please give your ritual a name.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await handleCreate({
      title: formValues.title.trim(),
      category: formValues.category,
      time_of_day: formValues.time_of_day,
      frequency: formValues.frequency,
      notes: formValues.notes.trim() || undefined,
    });
    router.back();
  };

  return (
    <LinearGradient
      colors={['#EDE0DB', '#F5ECE1', '#D8D0E8']}
      style={styles.root}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New Ritual</Text>
          <View style={styles.closePlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Preset suggestions */}
          <View style={styles.presetSection}>
            <Text style={styles.presetsLabel}>Quick add</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRow}
            >
              {PRESETS.map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => applyPreset(preset)}
                  style={({ pressed }) => [
                    styles.presetChip,
                    formValues.title === preset.label && styles.presetChipSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      formValues.title === preset.label && styles.presetChipTextSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.divider} />

          {/* Form */}
          <BeautyRitualForm
            initialValues={formValues}
            onChange={setFormValues}
          />
        </ScrollView>

        {/* Save button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <Text style={styles.saveButtonText}>Save ritual</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(254,250,249,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#7A6668',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#1F1530',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  closePlaceholder: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
  },
  presetSection: {
    gap: spacing.sm,
  },
  presetsLabel: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: 24,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(254,250,249,0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.3)',
  },
  presetChipSelected: {
    backgroundColor: '#1F1530',
    borderColor: '#1F1530',
  },
  presetChipText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#6B5B52',
  },
  presetChipTextSelected: {
    color: '#FEFAF9',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212,144,154,0.2)',
    marginVertical: spacing.lg,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#1F1530',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.2,
  },
});
