import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { format, isToday } from 'date-fns';
import { getCurrentWeekDates } from '../../utils/dateUtils';
import { spacing, shadows } from '../../theme';

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const weekDates = getCurrentWeekDates();

  const isSelected = (date: Date) =>
    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weekDates.map((date) => {
          const selected = isSelected(date);
          const today = isToday(date);
          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              style={({ pressed }) => [
                styles.dayItem,
                selected && styles.dayItemSelected,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  selected && styles.dayNumberSelected,
                ]}
              >
                {format(date, 'd')}
              </Text>
              <Text
                style={[
                  styles.dayLabel,
                  selected && styles.dayLabelSelected,
                ]}
              >
                {format(date, 'EEE').toUpperCase()}
              </Text>
              {today && !selected && <View style={styles.todayDot} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 44,
  },
  dayItemSelected: {
    backgroundColor: '#F2B4CC',
  },
  dayNumber: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#9E8880',
    letterSpacing: 0.5,
  },
  dayLabelSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F2B4CC',
    marginTop: 4,
  },
});
