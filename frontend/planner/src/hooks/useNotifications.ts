import { LocalNotifications } from '@capacitor/local-notifications';
import type { PendingLocalNotificationSchema } from '@capacitor/local-notifications';

const PLATFORM = typeof window !== 'undefined'
  ? (window as any).Capacitor?.getPlatform?.() || 'web'
  : 'web';

function isNative(): boolean {
  return PLATFORM === 'android' || PLATFORM === 'ios';
}

/**
 * Запросить разрешение на отправку уведомлений
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Проверить статус разрешений
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

/**
 * Запланировать локальное уведомление
 */
export async function scheduleNotification(options: {
  id: number;
  title: string;
  body: string;
  scheduleAt: Date;
  extra?: Record<string, unknown>;
}): Promise<void> {
  if (!isNative()) return;

  const { id, title, body, scheduleAt, extra } = options;

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        schedule: { at: scheduleAt },
        extra,
        sound: 'default',
        // smallIcon omitted — uses system default (avoids crash if custom icon missing)
        // smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#4F46E5',
      },
    ],
  });
}

/**
 * Отменить уведомление по id
 */
export async function cancelNotification(id: number): Promise<void> {
  if (!isNative()) return;
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

/**
 * Отменить все уведомления
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNative()) return;
  await LocalNotifications.cancel({ notifications: [] });
}

/**
 * Получить список pending уведомлений
 */
export async function getPendingNotifications(): Promise<PendingLocalNotificationSchema[]> {
  if (!isNative()) return [];
  const result = await LocalNotifications.getPending();
  return result.notifications;
}
