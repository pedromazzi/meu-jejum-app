// Utilitários para notificações

export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!checkNotificationSupport()) {
    console.warn('Notificações não suportadas neste navegador');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return 'denied';
  }
};

// ========== COMUNICAÇÃO COM SERVICE WORKER ==========

export const sendMessageToSW = async (type: string, data?: any) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type, data });
      console.log(`Mensagem enviada ao SW: ${type}`, data);
    } catch (error) {
      console.error('Erro ao enviar mensagem ao SW:', error);
    }
  } else {
    console.warn('Service Worker não está ativo');
  }
};

export const scheduleWaterNotifications = (settings: {
  enabled: boolean;
  interval: number;
  startTime: string;
  endTime: string;
}) => {
  if (settings.enabled) {
    sendMessageToSW('SCHEDULE_WATER_NOTIFICATIONS', settings);
  } else {
    sendMessageToSW('CANCEL_WATER_NOTIFICATIONS');
  }
};

export const scheduleFastingProgress = (
  settings: {
    halfway: boolean;
    threeQuarters: boolean;
    completed: boolean;
  },
  fastData: {
    startTime: number;
    goalHours: number;
  }
) => {
  sendMessageToSW('SCHEDULE_FASTING_PROGRESS', { settings, fastData });
};

export const cancelFastingProgress = () => {
  sendMessageToSW('CANCEL_FASTING_PROGRESS');
};

export const scheduleDailyReminder = (settings: {
  dailyReminder: boolean;
  reminderTime: string;
}) => {
  if (settings.dailyReminder) {
    sendMessageToSW('SCHEDULE_DAILY_REMINDER', settings);
  } else {
    sendMessageToSW('CANCEL_DAILY_REMINDER');
  }
};

export const notifyWaterGoalReached = () => {
  sendMessageToSW('SHOW_WATER_GOAL_NOTIFICATION');
};

export const notifyLowWater = () => {
  sendMessageToSW('SHOW_LOW_WATER_NOTIFICATION');
};

