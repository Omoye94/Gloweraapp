import { format, parseISO, isToday, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays } from 'date-fns';

// Format date as YYYY-MM-DD for storage keys
export const formatDateKey = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};

// Parse YYYY-MM-DD string to Date
export const parseDateKey = (dateKey: string): Date => {
  return parseISO(dateKey);
};

// Format date for display
export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) {
    return 'Today';
  }
  return format(d, 'EEEE, MMMM d');
};

// Format short date
export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
};

// Get current week dates
export const getCurrentWeekDates = (): Date[] => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

// Get ISO timestamp
export const getISOTimestamp = (): string => {
  return new Date().toISOString();
};

// Check if date is today
export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
};

// Get days since date
export const getDaysSince = (date: Date | string): number => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(new Date(), d);
};

// Format time for display (e.g., "8:00 AM")
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
};

// Get greeting based on time of day
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
