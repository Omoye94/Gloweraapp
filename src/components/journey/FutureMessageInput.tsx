import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context';
import { useJourneyStore } from '../../stores/useJourneyStore';

interface FutureMessageInputProps {
  visible: boolean;
  onClose: () => void;
}

const DELIVERY_OPTIONS = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

export function FutureMessageInput({ visible, onClose }: FutureMessageInputProps) {
  const { theme, isDark } = useTheme();
  const { addFutureMessage } = useJourneyStore();
  const [message, setMessage] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);

  const handleSave = () => {
    if (!message.trim()) return;
    addFutureMessage(message.trim(), selectedDays);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMessage('');
    setSelectedDays(30);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { backgroundColor: isDark ? theme.surface : '#FFFFFF' }]}
          onPress={e => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: theme.text }]}>Write to Your Future Self</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            This message will appear in your journey when the time comes.
          </Text>

          <TextInput
            style={[styles.input, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              color: theme.text,
              borderColor: theme.borderLight,
            }]}
            placeholder="Dear future me..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={500}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.textMuted }]}>
            {message.length}/500
          </Text>

          <Text style={[styles.deliverLabel, { color: theme.textSecondary }]}>Deliver in</Text>
          <View style={styles.pillRow}>
            {DELIVERY_OPTIONS.map(opt => {
              const isSelected = selectedDays === opt.days;
              return (
                <Pressable
                  key={opt.days}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: isSelected ? theme.primary : theme.borderLight,
                    },
                  ]}
                  onPress={() => {
                    setSelectedDays(opt.days);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary, opacity: message.trim() ? 1 : 0.5 }]}
            onPress={handleSave}
            disabled={!message.trim()}
          >
            <Text style={styles.saveButtonText}>Send to Future Self</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    height: 120,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 15,
    fontFamily: 'DMSans',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'DMSans',
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  deliverLabel: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#FFFFFF',
  },
});
