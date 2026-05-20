import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { JourneyEvent } from '../../types/journey';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context';
import { formatDistanceToNow } from 'date-fns';

interface JourneyItemProps {
  event: JourneyEvent;
  isLast: boolean;
}

export function JourneyItem({ event, isLast }: JourneyItemProps) {
  const { theme, isDark } = useTheme();

  const relativeTime = formatDistanceToNow(new Date(event.created_at), { addSuffix: true });

  return (
    <View style={styles.container}>
      {/* Timeline line */}
      <View style={styles.timelineColumn}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(244, 198, 204, 0.15)' : 'rgba(244, 198, 204, 0.12)' }]}>
          <Text style={styles.icon}>{event.icon}</Text>
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: theme.borderLight }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, { backgroundColor: isDark ? theme.surface : 'rgba(255,255,255,0.85)', borderColor: theme.borderLight }]}>
        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
        {event.description && (
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
            {event.description}
          </Text>
        )}
        <Text style={[styles.time, { color: theme.textMuted }]}>{relativeTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 44,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    fontFamily: 'DMSans',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    fontFamily: 'DMSans',
  },
});
