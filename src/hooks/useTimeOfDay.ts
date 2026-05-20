import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

const TIME_OF_DAY_GRADIENTS: Record<TimeOfDay, [string, string]> = {
  morning: ['#FBF7F7', '#F1E1E1'],
  day: ['#FBF7F7', '#EDE4DC'],
  evening: ['#F1E1E1', '#EDE4DC'],
  night: ['#EDE4DC', '#E2CBB2'],
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour <= 10) return 'morning';
  if (hour >= 11 && hour <= 16) return 'day';
  if (hour >= 17 && hour <= 20) return 'evening';
  return 'night';
}

export function useTimeOfDay() {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const timeOfDay = getTimeOfDay(hour);
  const gradientColors = TIME_OF_DAY_GRADIENTS[timeOfDay];

  return { timeOfDay, gradientColors };
}
