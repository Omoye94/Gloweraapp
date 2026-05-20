import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { GratitudeEntry } from '../../lib/gratitude';

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  if (todayKey === dateKey) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yestKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
  if (yestKey === dateKey) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

interface GratitudeEntryCardProps {
  entry: GratitudeEntry;
  onDelete: (id: string) => void;
}

export const GratitudeEntryCard: React.FC<GratitudeEntryCardProps> = ({ entry, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleLongPress = () => {
    setShowDelete(true);
    Alert.alert(
      'Remove entry?',
      'This gratitude will be removed from your jar.',
      [
        { text: 'Keep it', style: 'cancel', onPress: () => setShowDelete(false) },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setShowDelete(false);
            onDelete(entry.id);
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.emoji}>{entry.emoji}</Text>
      <View style={styles.body}>
        <Text style={styles.content}>{entry.content}</Text>
        <Text style={styles.date}>{formatRelativeDate(entry.created_at)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(254,250,249,0.7)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.15)',
    shadowColor: '#3A2E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: {
    fontSize: 24,
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  content: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
    lineHeight: 20,
  },
  date: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#B8A09C',
    letterSpacing: 0.3,
  },
});
