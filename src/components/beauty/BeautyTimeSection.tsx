import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BeautyRitual, BeautyTimeOfDay } from '../../types/beauty';
import { BeautyRitualCard } from './BeautyRitualCard';
import { spacing } from '../../theme';

const SECTION_LABELS: Record<BeautyTimeOfDay, string> = {
  morning: 'Morning',
  evening: 'Evening',
  anytime: 'Anytime',
  weekly: 'Weekly',
};

interface BeautyTimeSectionProps {
  timeOfDay: BeautyTimeOfDay;
  rituals: BeautyRitual[];
  isCompletedToday: (ritualId: string) => boolean;
  onComplete: (ritualId: string) => void;
  onUncomplete: (ritualId: string) => void;
}

export const BeautyTimeSection: React.FC<BeautyTimeSectionProps> = ({
  timeOfDay,
  rituals,
  isCompletedToday,
  onComplete,
  onUncomplete,
}) => {
  if (rituals.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.header}>{SECTION_LABELS[timeOfDay]}</Text>
      {rituals.map((ritual) => (
        <BeautyRitualCard
          key={ritual.id}
          ritual={ritual}
          isCompleted={isCompletedToday(ritual.id)}
          onComplete={() => onComplete(ritual.id)}
          onUncomplete={() => onUncomplete(ritual.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});
