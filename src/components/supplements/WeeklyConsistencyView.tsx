import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, isToday } from 'date-fns';
import { theme, spacing } from '../../theme';

interface DayData {
  date: Date;
  taken: number;
  total: number;
}

interface WeeklyConsistencyViewProps {
  data: DayData[];
}

export function WeeklyConsistencyView({ data }: WeeklyConsistencyViewProps) {
  return (
    <View>
      <Text style={styles.title}>This Week</Text>
      <View style={styles.row}>
        {data.map((day, index) => {
          const label = format(day.date, 'EEEEE');
          const today = isToday(day.date);
          const ratio = day.total > 0 ? day.taken / day.total : 0;

          return (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayLabel}>{label}</Text>
              <View
                style={[
                  styles.circle,
                  today && styles.circleToday,
                  {
                    backgroundColor:
                      ratio >= 1
                        ? theme.success
                        : ratio > 0
                          ? 'rgba(158, 207, 176, 0.5)'
                          : 'rgba(158, 207, 176, 0.15)',
                  },
                ]}
              >
                {day.total > 0 && (
                  <Text style={styles.circleText}>
                    {day.taken}/{day.total}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
    color: theme.textMuted,
    marginBottom: 4,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleToday: {
    borderWidth: 2,
    borderColor: theme.primary,
  },
  circleText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.text,
  },
});
