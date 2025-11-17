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

const showNotification = (title: string, options?: NotificationOptions) => {
  if (!checkNotificationSupport()) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
    }
  }
};

// Notificações de jejum
export const notifyFastStarted = (protocolName: string) => {
  showNotification('🌟 Jejum Iniciado!', {
    body: `Seu jejum ${protocolName} começou. Boa sorte!`,
    tag: 'fast-started',
  });
};

export const notifyFastProgress = (percentage: number, remaining: string) => {
  showNotification(`🔥 ${percentage}% Completo!`, {
    body: `Faltam ${remaining} para sua meta. Continue firme!`,
    tag: 'fast-progress',
  });
};

export const notifyFastCompleted = (streak: number) => {
  const messages = [
    '🎉 Parabéns! Jejum completo!',
    '🏆 Meta alcançada!',
    '⭐ Excelente trabalho!',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  showNotification(message, {
    body: `Sequência atual: ${streak} dias`,
    tag: 'fast-completed',
  });
};

export const notifyDailyReminder = () => {
  showNotification('⏰ Lembrete de Jejum', {
    body: 'Está na hora de iniciar seu jejum!',
    tag: 'daily-reminder',
  });
};

// Notificações de água
export const notifyWaterReminder = () => {
  showNotification('💧 Hora de Beber Água!', {
    body: 'Mantenha-se hidratado durante o dia.',
    tag: 'water-reminder',
  });
};

export const notifyWaterGoalReached = () => {
  showNotification('✅ Meta de Água Atingida!', {
    body: 'Parabéns! Você alcançou sua meta diária de hidratação.',
    tag: 'water-goal',
  });
};

export const notifyLowWater = () => {
  showNotification('⚠️ Pouca Água!', {
    body: 'Você está abaixo de 30% da sua meta. Beba mais água!',
    tag: 'low-water',
  });
};
