const CACHE_NAME = 'meujejum-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/globals.css',
  '/manifest.json'
];

// Estado das notificações
let waterIntervalId = null;
let fastingTimeouts = {};
let dailyReminderTimeout = null;

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// ==================== NOTIFICAÇÕES ====================

// Função auxiliar para verificar se está dentro do horário permitido
function isWithinTimeRange(startTime, endTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  
  const [endHour, endMin] = endTime.split(':').map(Number);
  const endMinutes = endHour * 60 + endMin;
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

// Função para mostrar notificação
async function showNotification(title, body, tag, data = {}) {
  try {
    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag,
      data,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    };
    
    await self.registration.showNotification(title, options);
    console.log(`Notificação enviada: ${title}`);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

// ========== NOTIFICAÇÕES DE ÁGUA ==========

function scheduleWaterNotifications(settings) {
  // Limpar notificações existentes
  if (waterIntervalId) {
    clearInterval(waterIntervalId);
    waterIntervalId = null;
  }
  
  if (!settings.enabled) {
    console.log('Notificações de água desabilitadas');
    return;
  }
  
  console.log('Agendando notificações de água:', settings);
  
  const intervalMs = settings.interval * 60 * 1000; // converter minutos para ms
  
  // Função que envia a notificação se estiver no horário
  const sendWaterNotification = () => {
    if (isWithinTimeRange(settings.startTime, settings.endTime)) {
      showNotification(
        '💧 Hora de beber água!',
        'Hidrate-se! Já bebeu água?',
        'water-reminder',
        { url: '/agua' }
      );
    } else {
      console.log('Fora do horário de notificações de água');
    }
  };
  
  // Enviar primeira notificação imediatamente se estiver no horário
  sendWaterNotification();
  
  // Agendar notificações periódicas
  waterIntervalId = setInterval(sendWaterNotification, intervalMs);
}

function cancelWaterNotifications() {
  if (waterIntervalId) {
    clearInterval(waterIntervalId);
    waterIntervalId = null;
    console.log('Notificações de água canceladas');
  }
}

// ========== NOTIFICAÇÕES DE JEJUM ==========

function scheduleFastingProgressNotifications(settings, fastData) {
  // Limpar notificações existentes
  Object.values(fastingTimeouts).forEach(timeout => clearTimeout(timeout));
  fastingTimeouts = {};
  
  if (!fastData || !fastData.startTime || !fastData.goalHours) {
    console.log('Dados de jejum inválidos');
    return;
  }
  
  const startTime = fastData.startTime;
  const goalMs = fastData.goalHours * 60 * 60 * 1000;
  const now = Date.now();
  
  console.log('Agendando notificações de jejum:', { startTime, goalMs, now });
  
  // Notificação de 50%
  if (settings.halfway) {
    const halfwayTime = startTime + (goalMs * 0.5);
    const halfwayDelay = halfwayTime - now;
    
    if (halfwayDelay > 0) {
      fastingTimeouts.halfway = setTimeout(() => {
        const remaining = Math.floor((goalMs * 0.5) / (60 * 60 * 1000));
        showNotification(
          '🔥 50% do Jejum Completo!',
          `Você está na metade! Faltam ${remaining}h para sua meta.`,
          'fast-progress-50',
          { url: '/jejum' }
        );
      }, halfwayDelay);
      console.log(`Notificação 50% agendada para daqui a ${halfwayDelay}ms`);
    }
  }
  
  // Notificação de 75%
  if (settings.threeQuarters) {
    const threeQuartersTime = startTime + (goalMs * 0.75);
    const threeQuartersDelay = threeQuartersTime - now;
    
    if (threeQuartersDelay > 0) {
      fastingTimeouts.threeQuarters = setTimeout(() => {
        const remaining = Math.floor((goalMs * 0.25) / (60 * 60 * 1000));
        showNotification(
          '🔥 75% do Jejum Completo!',
          `Quase lá! Faltam apenas ${remaining}h para sua meta.`,
          'fast-progress-75',
          { url: '/jejum' }
        );
      }, threeQuartersDelay);
      console.log(`Notificação 75% agendada para daqui a ${threeQuartersDelay}ms`);
    }
  }
  
  // Notificação de 100%
  if (settings.completed) {
    const completedTime = startTime + goalMs;
    const completedDelay = completedTime - now;
    
    if (completedDelay > 0) {
      fastingTimeouts.completed = setTimeout(() => {
        showNotification(
          '🎉 Jejum Completo!',
          'Parabéns! Você atingiu sua meta de jejum!',
          'fast-completed',
          { url: '/jejum' }
        );
      }, completedDelay);
      console.log(`Notificação 100% agendada para daqui a ${completedDelay}ms`);
    }
  }
}

function cancelFastingProgressNotifications() {
  Object.values(fastingTimeouts).forEach(timeout => clearTimeout(timeout));
  fastingTimeouts = {};
  console.log('Notificações de progresso de jejum canceladas');
}

function scheduleDailyReminder(settings) {
  // Limpar lembrete existente
  if (dailyReminderTimeout) {
    clearTimeout(dailyReminderTimeout);
    dailyReminderTimeout = null;
  }
  
  if (!settings.dailyReminder || !settings.reminderTime) {
    console.log('Lembrete diário desabilitado');
    return;
  }
  
  const [hours, minutes] = settings.reminderTime.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // Se o horário já passou hoje, agendar para amanhã
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime.getTime() - now.getTime();
  
  console.log(`Agendando lembrete diário para: ${scheduledTime.toLocaleString()}`);
  
  dailyReminderTimeout = setTimeout(() => {
    showNotification(
      '⏰ Lembrete de Jejum',
      'Está na hora de iniciar seu jejum!',
      'daily-reminder',
      { url: '/jejum' }
    );
    
    // Reagendar para o próximo dia
    scheduleDailyReminder(settings);
  }, delay);
}

function cancelDailyReminder() {
  if (dailyReminderTimeout) {
    clearTimeout(dailyReminderTimeout);
    dailyReminderTimeout = null;
    console.log('Lembrete diário cancelado');
  }
}

// ========== MENSAGENS DO APP ==========

self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  console.log('Service Worker recebeu mensagem:', type, data);
  
  switch (type) {
    case 'SCHEDULE_WATER_NOTIFICATIONS':
      scheduleWaterNotifications(data);
      break;
      
    case 'CANCEL_WATER_NOTIFICATIONS':
      cancelWaterNotifications();
      break;
      
    case 'SCHEDULE_FASTING_PROGRESS':
      scheduleFastingProgressNotifications(data.settings, data.fastData);
      break;
      
    case 'CANCEL_FASTING_PROGRESS':
      cancelFastingProgressNotifications();
      break;
      
    case 'SCHEDULE_DAILY_REMINDER':
      scheduleDailyReminder(data);
      break;
      
    case 'CANCEL_DAILY_REMINDER':
      cancelDailyReminder();
      break;
      
    case 'SHOW_WATER_GOAL_NOTIFICATION':
      showNotification(
        '✅ Meta de Água Atingida!',
        'Parabéns! Você alcançou sua meta diária de hidratação.',
        'water-goal',
        { url: '/agua' }
      );
      break;
      
    case 'SHOW_LOW_WATER_NOTIFICATION':
      showNotification(
        '⚠️ Pouca Água!',
        'Você está abaixo de 30% da sua meta. Beba mais água!',
        'low-water',
        { url: '/agua' }
      );
      break;
      
    default:
      console.log('Tipo de mensagem desconhecido:', type);
  }
});

// ========== CLICK NAS NOTIFICAÇÕES ==========

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus().then(() => {
              // Navegar para a URL específica
              return client.navigate(urlToOpen);
            });
          }
        }
        
        // Se não houver janela aberta, abrir nova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ========== WEB PUSH NOTIFICATIONS ==========

self.addEventListener('push', function(event) {
  console.log('📬 Push recebido:', event);
  
  let data = { title: 'MeuJejum', body: 'Nova notificação' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Erro ao parsear push:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    requireInteraction: false,
    data: { url: data.url || '/' }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
