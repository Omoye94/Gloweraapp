import { View, Text } from 'react-native';
import { format, isToday } from 'date-fns';
import { colors } from '../../lib/constants';

interface DayData {
  date: Date;
  taken: number;
  total: number;
}

interface WeeklyConsistencyViewProps {
  data: DayData[];
}

export default function WeeklyConsistencyView({ data }: WeeklyConsistencyViewProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-text mb-3">This Week</Text>
      <View className="flex-row justify-between">
        {data.map((day, index) => {
          const label = format(day.date, 'EEEEE'); // Single letter: M, T, W...
          const today = isToday(day.date);
          const ratio = day.total > 0 ? day.taken / day.total : 0;

          return (
            <View key={index} className="items-center">
              <Text className="text-[10px] text-text-light mb-1">{label}</Text>
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  today ? 'border-2' : ''
                }`}
                style={{
                  borderColor: today ? colors.primary : undefined,
                  backgroundColor:
                    ratio >= 1
                      ? colors.success
                      : ratio > 0
                        ? `${colors.success}80`
                        : `${colors.success}20`,
                }}
              >
                {day.total > 0 && (
                  <Text className="text-[10px] text-text font-medium">
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
