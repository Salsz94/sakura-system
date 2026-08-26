// ════════════════════════════════════════════════════════════════
// NOTIFICATIONS & APP BADGING SERVICE — SakiGo (サキゴー)
// Recordatorios sutiles y elegantes (Anti-Duolingo) + Badging en icono PWA.
// ════════════════════════════════════════════════════════════════

const REMINDER_KEY = 'sakura_reminder_enabled';
const REMINDER_TIME_KEY = 'sakura_reminder_time';
const LAST_NOTIF_DATE_KEY = 'sakura_last_notif_date';

const REMINDER_MESSAGES = [
  {
    title: '🌸 SakiGo — Tu Dojo te espera',
    body: 'El hábito diario forja al maestro. 3 minutos hoy bastan para afianzar tu japonés.',
  },
  {
    title: '⚡ SakiGo — Entrenamiento Ronin',
    body: 'Tienes tarjetas listas para consolidar en tu memoria a largo plazo.',
  },
  {
    title: '🏯 SakiGo — Tu camino ninja continúa',
    body: 'Un nuevo día, un nuevo paso hacia la fluidez real en japonés.',
  },
  {
    title: '⚔️ SakiGo — Desafío diario listo',
    body: 'Entrena tus reflejos con kana, verbos y kanji en tu sesión de hoy.',
  },
];

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isBadgingSupported(): boolean {
  return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setReminderEnabled(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isReminderEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(REMINDER_KEY) === '1' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

export function setReminderEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(REMINDER_KEY, enabled ? '1' : '0');
}

export function getReminderTime(): string {
  if (typeof localStorage === 'undefined') return '20:00';
  return localStorage.getItem(REMINDER_TIME_KEY) || '20:00';
}

export function setReminderTime(timeStr: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(REMINDER_TIME_KEY, timeStr);
}

/** Actualiza la "burbujita" numérica en el icono de la PWA (celular o PC). */
export async function updateAppBadge(count: number): Promise<void> {
  if (!isBadgingSupported()) return;
  try {
    if (count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).clearAppBadge();
    }
  } catch {
    // Falla en silencio si el dispositivo no lo permite
  }
}

/** Limpia la burbujita del icono. */
export async function clearAppBadge(): Promise<void> {
  if (!isBadgingSupported()) return;
  try {
    await (navigator as any).clearAppBadge();
  } catch {
    // Falla en silencio
  }
}

/** Envía una notificación inmediata (local o vía Service Worker). */
export async function sendLocalNotification(title?: string, body?: string): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false;

  const randomMsg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
  const finalTitle = title || randomMsg.title;
  const finalBody = body || randomMsg.body;

  const options: NotificationOptions = {
    body: finalBody,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: 'sakigo-reminder',
    renotify: true,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(finalTitle, options);
        return true;
      }
    }
    // Fallback estándar en navegador
    new Notification(finalTitle, options);
    return true;
  } catch {
    return false;
  }
}

/** Verifica si es hora de mostrar el recordatorio diario (sin duplicar en el mismo día). */
export function checkDailyReminder(): void {
  if (!isReminderEnabled()) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const lastNotif = localStorage.getItem(LAST_NOTIF_DATE_KEY);

  if (lastNotif === todayStr) return; // Ya se notificó hoy

  const reminderTime = getReminderTime(); // ej. "20:00"
  const [targetH, targetM] = reminderTime.split(':').map(Number);

  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  if (currentH > targetH || (currentH === targetH && currentM >= targetM)) {
    sendLocalNotification();
    localStorage.setItem(LAST_NOTIF_DATE_KEY, todayStr);
  }
}
