const BACKEND_URL = 'https://meujejum-backend.onrender.com';
const VAPID_PUBLIC_KEY = 'BMeMyhPueRqFfmM284Zq0JcP13jB3F8_S_Tc-9aonZPPvUFsipG6ykJepmgMJjbQweB5uLqlJewfQlEC4ZF86AM';

// Converter base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  try {
    console.log('🔔 Registrando push notifications...');
    
    // Verificar suporte
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push não suportado');
      return null;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permissão negada');
      return null;
    }

    // Registrar SW e obter subscription
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('✅ Subscription obtida:', subscription);

    // Enviar para backend
    const response = await fetch(`${BACKEND_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (response.ok) {
      console.log('✅ Subscription salva no backend!');
      return subscription;
    }

    return null;
  } catch (error) {
    console.error('Erro ao registrar push:', error);
    return null;
  }
}

export async function scheduleWaterReminder(intervalMinutes: number) {
  try {
    console.log(`💧 Agendando lembrete de água: ${intervalMinutes} min`);
    
    const response = await fetch(`${BACKEND_URL}/schedule-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'water',
        intervalMinutes,
        title: '💧 Hora de beber água!',
        body: 'Hidrate-se! Já bebeu água?'
      })
    });

    const data = await response.json();
    console.log('✅ Lembrete de água agendado:', data);
    return data;
  } catch (error) {
    console.error('Erro ao agendar água:', error);
    return null;
  }
}

export async function scheduleFastingNotification(
  percentage: number,
  targetTime: string,
  title: string,
  body: string
) {
  try {
    console.log(`⏰ Agendando notificação de jejum: ${percentage}%`);
    
    const response = await fetch(`${BACKEND_URL}/schedule-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'fasting',
        targetTime,
        title,
        body
      })
    });

    const data = await response.json();
    console.log('✅ Notificação de jejum agendada:', data);
    return data;
  } catch (error) {
    console.error('Erro ao agendar jejum:', error);
    return null;
  }
}
