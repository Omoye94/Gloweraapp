import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { BeautyCategory, BeautyTimeOfDay, BeautyFrequency } from '../../types/beauty';
import { BEAUTY_CATEGORY_COLORS, BEAUTY_CATEGORY_LABELS } from './BeautyCategoryPill';
import { spacing, borderRadius } from '../../theme';

const CATEGORIES: BeautyCategory[] = [
  'skincare',
  'body-care',
  'hair-care',
  'gua-sha',
  'lip-care',
  'scalp-care',
  'shower-ritual',
  'custom',
];

const TIMES: { value: BeautyTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' },
  { value: 'weekly', label: 'Weekly' },
];

const FREQUENCIES: { value: BeautyFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export interface BeautyFormValues {
  title: string;
  category: BeautyCategory;
  time_of_day: BeautyTimeOfDay;
  frequency: BeautyFrequency;
  notes: string;
}

interface BeautyRitualFormProps {
  initialValues?: Partial<BeautyFormValues>;
  onChange: (values: BeautyFormValues) => void;
}

export function BeautyRitualForm({ initialValues, onChange }: BeautyRitualFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [category, setCategory] = useState<BeautyCategory>(
    initialValues?.category ?? 'skincare',
  );
  const [timeOfDay, setTimeOfDay] = useState<BeautyTimeOfDay>(
    initialValues?.time_of_day ?? 'morning',
  );
  const [frequency, setFrequency] = useState<BeautyFrequency>(
    initialValues?.frequency ?? 'daily',
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  const emit = (updates: Partial<BeautyFormValues>) => {
    const next: BeautyFormValues = {
      title,
      category,
      time_of_day: timeOfDay,
      frequency,
      notes,
      ...updates,
    };
    onChange(next);
  };

  return (
    <View style={styles.form}>
      {/* Ritual name */}
      <View style={styles.field}>
        <Text style={styles.label}>Ritual name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            emit({ title: t });
          }}
          placeholder="e.g. AM Skincare, Gua Sha..."
          placeholderTextColor="#BFA99F"
          maxLength={60}
          returnKeyType="done"
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat;
            return (
              <Pressable
                key={cat}
                style={[
                  styles.chip,
                  selected && {
                    backgroundColor: BEAUTY_CATEGORY_COLORS[cat],
                    borderColor: BEAUTY_CATEGORY_COLORS[cat],
                  },
                ]}
                onPress={() => {
                  setCategory(cat);
                  emit({ category: cat });
                }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {BEAUTY_CATEGORY_LABELS[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Time of day */}
      <View style={styles.field}>
        <Text style={styles.label}>Time of day</Text>
        <View style={styles.segmented}>
          {TIMES.map(({ value, label }) => {
            const selected = timeOfDay === value;
            return (
              <Pressable
                key={value}
                style={[styles.segment, selected && styles.segmentSelected]}
                onPress={() => {
                  setTimeOfDay(value);
                  emit({ time_of_day: value });
                }}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.field}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.segmented}>
          {FREQUENCIES.map(({ value, label }) => {
            const selected = frequency === value;
            return (
              <Pressable
                key={value}
                style={[styles.segment, selected && styles.segmentSelected]}
                onPress={() => {
                  setFrequency(value);
                  emit({ frequency: value });
                }}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.field}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={(n) => {
            setNotes(n);
            emit({ notes: n });
          }}
          placeholder="Any reminders or details..."
          placeholderTextColor="#BFA99F"
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(254,250,249,0.9)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.25)',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.3)',
    backgroundColor: 'rgba(254,250,249,0.8)',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#6B5B52',
  },
  chipTextSelected: {
    color: '#3A2E2B',
    fontWeight: '700',
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.25)',
    backgroundColor: 'rgba(254,250,249,0.8)',
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: '#3A2E2B',
    borderColor: '#3A2E2B',
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#6B5B52',
  },
  segmentTextSelected: {
    color: '#FEFAF9',
    fontWeight: '600',
  },
});
