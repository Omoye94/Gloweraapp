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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BeautyRitualForm, BeautyFormValues } from '../../src/components/beauty/BeautyRitualForm';
import { useBeautyRituals } from '../../src/hooks/useBeautyRituals';
import { useBeautyStore } from '../../src/stores/useBeautyStore';
import { spacing } from '../../src/theme';

export default function BeautyRitualDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const ritual = useBeautyStore((s) => s.rituals.find((r) => r.id === id));
  const { handleUpdate, handleArchive, handleDelete } = useBeautyRituals();

  const [formValues, setFormValues] = useState<BeautyFormValues>({
    title: ritual?.title ?? '',
    category: ritual?.category ?? 'skincare',
    time_of_day: ritual?.time_of_day ?? 'morning',
    frequency: ritual?.frequency ?? 'daily',
    notes: ritual?.notes ?? '',
  });

  if (!ritual) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ritual not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = async () => {
    if (!formValues.title.trim()) {
      Alert.alert('Name required', 'Please give your ritual a name.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await handleUpdate(id!, {
      title: formValues.title.trim(),
      category: formValues.category,
      time_of_day: formValues.time_of_day,
      frequency: formValues.frequency,
      notes: formValues.notes.trim() || undefined,
    });
    router.back();
  };

  const confirmArchive = () => {
    Alert.alert(
      'Archive ritual',
      'This ritual will be hidden. You can add it again anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await handleArchive(id!);
            router.back();
          },
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete ritual',
      'This will permanently remove this ritual.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await handleDelete(id!);
            router.back();
          },
        },
      ],
    );
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
          <Text style={styles.headerTitle}>Edit Ritual</Text>
          <View style={styles.closePlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 160 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BeautyRitualForm
            initialValues={formValues}
            onChange={setFormValues}
          />
        </ScrollView>

        {/* Footer actions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <Text style={styles.saveButtonText}>Save changes</Text>
          </Pressable>

          <Pressable
            onPress={confirmArchive}
            style={({ pressed }) => [styles.softButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.archiveText}>Archive ritual</Text>
          </Pressable>

          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [styles.softButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.deleteText}>Delete ritual</Text>
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 4,
  },
  saveButton: {
    backgroundColor: '#1F1530',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    letterSpacing: -0.2,
  },
  softButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  archiveText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#9E8880',
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#C45A82',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#EDE0DB',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    color: '#1F1530',
  },
  backLink: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#C45A82',
  },
});
