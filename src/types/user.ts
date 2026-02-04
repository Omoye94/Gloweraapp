export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string; // "HH:MM" format
  eveningReminder: boolean;
  eveningTime: string;
}

export interface User {
  id: string;
  gardenName: string;
  createdAt: string; // ISO date
  onboardingCompleted: boolean;
  totalPoints: number;
  selectedTheme: string;
  notificationSettings: NotificationSettings;
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  morningReminder: true,
  morningTime: '08:00',
  eveningReminder: true,
  eveningTime: '20:00',
};
