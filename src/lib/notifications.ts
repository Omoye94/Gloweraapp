import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MORNING_RITUAL_KEY = 'notif:morning_ritual';
const EVENING_RITUAL_KEY = 'notif:evening_ritual';

// Default reminder times
const MORNING_HOUR = 8;
const MORNING_MINUTE = 0;
const EVENING_HOUR = 21;
const EVENING_MINUTE = 0;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  reminders_enabled: boolean;
  daily_reminder_time: string | null;
}

/**
 * Request notification permissions
 * Returns true if granted, false otherwise
 */
export async function requestPermission(): Promise<boolean> {
  // Must be a physical device for notifications
  if (!Device.isDevice) {
    console.log('[Notifications] Not a physical device, skipping permission request');
    return false;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule both morning and evening daily notifications
 * - Morning (8 AM): "Good morning! Time for your glow ritual. ✨"
 * - Evening (9 PM): "Wind down time. How did your day glow? 🌙"
 */
export async function scheduleDaily(): Promise<{
  morningId: string | null;
  eveningId: string | null;
}> {
  try {
    // Cancel any existing notifications first
    await cancelDaily();

    // Schedule morning notification (8 AM)
    const morningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Glowera ✨',
        body: 'Good morning! Time for your glow ritual.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: MORNING_HOUR,
        minute: MORNING_MINUTE,
      },
    });

    // Store morning notification ID
    await AsyncStorage.setItem(MORNING_RITUAL_KEY, morningId);
    console.log('[Notifications] Scheduled morning notification:', morningId, 'at 8:00 AM');

    // Schedule evening notification (9 PM)
    const eveningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Glowera 🌙',
        body: 'Wind down time. How did your day glow?',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: EVENING_HOUR,
        minute: EVENING_MINUTE,
      },
    });

    // Store evening notification ID
    await AsyncStorage.setItem(EVENING_RITUAL_KEY, eveningId);
    console.log('[Notifications] Scheduled evening notification:', eveningId, 'at 9:00 PM');

    return { morningId, eveningId };
  } catch (error) {
    console.error('[Notifications] Failed to schedule daily notifications:', error);
    return { morningId: null, eveningId: null };
  }
}

/**
 * Cancel both morning and evening notifications
 */
export async function cancelDaily(): Promise<void> {
  try {
    // Cancel morning notification
    const morningId = await AsyncStorage.getItem(MORNING_RITUAL_KEY);
    if (morningId) {
      await Notifications.cancelScheduledNotificationAsync(morningId);
      await AsyncStorage.removeItem(MORNING_RITUAL_KEY);
      console.log('[Notifications] Cancelled morning notification:', morningId);
    }

    // Cancel evening notification
    const eveningId = await AsyncStorage.getItem(EVENING_RITUAL_KEY);
    if (eveningId) {
      await Notifications.cancelScheduledNotificationAsync(eveningId);
      await AsyncStorage.removeItem(EVENING_RITUAL_KEY);
      console.log('[Notifications] Cancelled evening notification:', eveningId);
    }
  } catch (error) {
    console.error('[Notifications] Failed to cancel daily notifications:', error);
  }
}

/**
 * Ensure notifications are scheduled based on user settings
 * This is idempotent - safe to call multiple times
 * @param settings - User notification settings
 */
export async function ensureScheduledFromSettings(
  settings: NotificationSettings | null
): Promise<void> {
  if (!settings) {
    return;
  }

  const { reminders_enabled } = settings;

  if (reminders_enabled) {
    // Check if we have permission
    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      console.log('[Notifications] Permission not granted, skipping schedule');
      return;
    }

    // Check if already scheduled (check both morning and evening)
    const morningId = await AsyncStorage.getItem(MORNING_RITUAL_KEY);
    const eveningId = await AsyncStorage.getItem(EVENING_RITUAL_KEY);

    if (morningId && eveningId) {
      // Both exist, verify they're still scheduled
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const morningExists = scheduled.some((n) => n.identifier === morningId);
      const eveningExists = scheduled.some((n) => n.identifier === eveningId);

      if (morningExists && eveningExists) {
        console.log('[Notifications] Both daily notifications already scheduled');
        return;
      }
    }

    // Schedule both notifications
    await scheduleDaily();
  } else {
    // Reminders disabled, cancel any existing
    await cancelDaily();
  }
}

/**
 * Get all currently scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
