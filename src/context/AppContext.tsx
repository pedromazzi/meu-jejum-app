import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { loadData, saveData, defaultAppData, type AppDataState } from '../utils/localStorage';
import {
  notifyFastStarted,
  notifyFastProgress,
  notifyFastCompleted,
  notifyDailyReminder,
  notifyWaterReminder,
  notifyWaterGoalReached,
  notifyLowWater,
  checkNotificationSupport,
  requestNotificationPermission
} from '../utils/notifications'; // Importar funções de notificação
import { getPlatform, isAppInstalled } from '../utils/pwa'; // Importar utilitários PWA

// Define tipos para melhor segurança de tipo
interface FastingProtocol {
  hours: number;
  eating: number;
  name: string;
}

// Nova interface para o registro de jejum no histórico
interface FastRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // em horas
  goal: number; // meta em horas
  completed: boolean; // atingiu meta?
  protocol: string; // nome do protocolo
}

interface WaterEntry {
  time: string;
  amount: number;
}

interface WaterDayData {
  date: string;
  goal: number;
  cupSize: number;
  consumed: number;
  entries: WaterEntry[];
}

interface WaterHistoryEntry {
  date: string;
  consumed: number;
  goal: number;
}

// Interface para as configurações de notificação
interface NotificationSettings {
  fasting: {
    started: boolean;
    halfway: boolean;
    threeQuarters: boolean;
    completed: boolean;
    dailyReminder: boolean;
    reminderTime: string; // HH:MM
  };
  water: {
    enabled: boolean;
    interval: number; // minutos
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    goalReached: boolean;
    lowWaterAlert: boolean;
  };
}

interface AppContextType {
  appData: AppDataState;
  fastStartTime: number | null;
  setFastStartTime: (time: number | null) => void;
  updateFastingProtocol: (protocol: FastingProtocol) => void;
  addFastEntry: (entry: FastRecord) => void; // Atualizado para FastRecord
  addWater: (amount: number) => void;
  updateWaterGoal: (newGoal: number) => void;
  updateCupSize: (newSize: number) => void;
  getWaterProgressPercentage: () => number;
  // Novas funções para o histórico de jejuns
  getFastsByMonth: (year: number, month: number) => FastRecord[];
  getMonthlyStats: (year: number, month: number) => {
    total: number;
    completed: number;
    totalHours: number;
    average: number;
  };
  getCurrentStreak: () => number;
  getBestStreak: () => number;
  getCalendarData: (year: number, month: number) => {
    [day: number]: {
      hasFast: boolean;
      completed: boolean;
      duration: number;
    };
  };
  // Notificações
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: NotificationSettings) => void;
  sendFastingNotification: (type: 'started' | 'progress50' | 'progress75' | 'completed' | 'dailyReminder', data?: any) => void;
  sendWaterNotification: (type: 'reminder' | 'goalReached' | 'lowWater', data?: any) => void;
  // PWA
  deferredPrompt: any | null;
  platform: 'ios' | 'android' | 'desktop' | 'other';
  setDeferredPrompt: (prompt: any | null) => void;
}

// Default notification settings
const defaultNotificationSettings: NotificationSettings = {
  fasting: {
    started: true,
    halfway: true,
    threeQuarters: true,
    completed: true,
    dailyReminder: true,
    reminderTime: '20:00'
  },
  water: {
    enabled: true,
    interval: 120, // minutos
    startTime: '08:00',
    endTime: '22:00',
    goalReached: true,
    lowWaterAlert: true
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppDataState>(defaultAppData);
  const [fastStartTime, setFastStartTimeState] = useState<number | null>(null); // Internal state for Jejum page
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  
  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>(getPlatform());

  // Refs para controlar se as notificações de progresso já foram enviadas
  const halfwayNotifiedRef = useRef(false);
  const threeQuartersNotifiedRef = useRef(false);
  const waterReminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dailyFastReminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedAppData = loadData('meujejum_app_data', defaultAppData);
    setAppData(storedAppData);
    
    // 📦 CARREGANDO JEJUM
    const savedFastStartTime = loadData('meujejum_fast_start_time', null);
    console.log('📦 CARREGANDO JEJUM: Dados do localStorage para meujejum_fast_start_time:', savedFastStartTime);
    setFastStartTimeState(savedFastStartTime); // Load fast start time

    const storedNotificationSettings = loadData('meujejum_notification_settings', defaultNotificationSettings);
    setNotificationSettings(storedNotificationSettings);
  }, []);

  // Save appData to localStorage whenever it changes
  useEffect(() => {
    saveData('meujejum_app_data', appData);
  }, [appData]);

  // Save fastStartTime to localStorage whenever it changes
  useEffect(() => {
    // 🔥 SALVANDO JEJUM
    console.log('🔥 SALVANDO JEJUM: Valor de fastStartTime no localStorage para meujejum_fast_start_time:', fastStartTime);
    saveData('meujejum_fast_start_time', fastStartTime);
  }, [fastStartTime]);

  // Save notificationSettings to localStorage whenever it changes
  useEffect(() => {
    saveData('meujejum_notification_settings', notificationSettings);
  }, [notificationSettings]);

  // Core daily water reset logic: triggered when appData.waterData.date is different from today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (appData.waterData.date !== today) {
      console.log(`🔄 Reset diário de água acionado. Data anterior: ${appData.waterData.date}, Nova data: ${today}`);
      
      const previousDayData: WaterHistoryEntry = {
        date: appData.waterData.date,
        consumed: appData.waterData.consumed,
        goal: appData.waterData.goal,
      };

      setAppData(prev => {
        // Apenas adiciona ao histórico se a data anterior for válida (não a data atual)
        // e se ainda não estiver no histórico para evitar duplicatas.
        const isPreviousDayValid = previousDayData.date && previousDayData.date !== today;
        const isAlreadyInHistory = prev.waterHistory.some(entry => entry.date === previousDayData.date);
        
        let updatedHistory = prev.waterHistory;
        if (isPreviousDayValid && !isAlreadyInHistory) {
          updatedHistory = [previousDayData, ...prev.waterHistory];
        }
        
        return {
          ...prev,
          waterData: {
            ...prev.waterData,
            date: today, // Atualiza para a data de hoje
            consumed: 0,
            entries: [],
          },
          waterHistory: updatedHistory.slice(0, 7), // Mantém apenas os últimos 7 dias
        };
      });
    }
  }, [appData.waterData.date]); // Esta dependência garante que ele seja executado quando waterData.date muda

  // Verificação baseada em intervalo para atualizar waterData.date se a meia-noite passar com o app aberto
  useEffect(() => {
    const intervalId = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (appData.waterData.date !== today) {
        console.log(`⏰ Intervalo detectou mudança de dia. Atualizando waterData.date de ${appData.waterData.date} para ${today}.`);
        // Esta atualização acionará o outro useEffect (a lógica de reset principal)
        setAppData(prev => ({
          ...prev,
          waterData: {
            ...prev.waterData,
            date: today, // Esta mudança aciona o useEffect de reset principal
          },
        }));
      }
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  }, [appData.waterData.date]); // Dependência para garantir que ele use a data mais recente para comparação

  // PWA: Capturar o evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Fasting related actions
  const updateFastingProtocol = useCallback((protocol: FastingProtocol) => {
    setAppData(prev => ({
      ...prev,
      fastingProtocol: protocol,
    }));
  }, []);

  // Adiciona um jejum finalizado ao histórico
  const addFastEntry = useCallback((entry: FastRecord) => {
    setAppData(prev => {
      const updatedFasts = [...prev.fasts, entry];
      updatedFasts.sort((a, b) => b.startTime - a.startTime); // Ordena do mais recente para o mais antigo

      // Opcional: Manter apenas os jejuns dos últimos 90 dias
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const recentFasts = updatedFasts.filter(f => f.startTime > ninetyDaysAgo);

      return {
        ...prev,
        fasts: recentFasts,
      };
    });
  }, []);

  // Retorna jejuns para um mês e ano específicos
  const getFastsByMonth = useCallback((year: number, month: number) => {
    return appData.fasts.filter(fast => {
      const date = new Date(fast.startTime);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [appData.fasts]);

  // Calcula estatísticas mensais
  const getMonthlyStats = useCallback((year: number, month: number) => {
    const fasts = getFastsByMonth(year, month);
    
    const totalFasts = fasts.length;
    const completedFasts = fasts.filter(f => f.completed).length;
    const totalHours = fasts.reduce((sum, f) => sum + f.duration, 0);
    const avgDuration = totalFasts > 0 ? totalHours / totalFasts : 0;
    
    return {
      total: totalFasts,
      completed: completedFasts,
      totalHours: Math.round(totalHours),
      average: parseFloat(avgDuration.toFixed(1)),
    };
  }, [getFastsByMonth]);

  // Calcula a sequência atual de jejuns completos
  const getCurrentStreak = useCallback(() => {
    const completedFasts = appData.fasts.filter(f => f.completed);
    if (completedFasts.length === 0) return 0;

    // Obter datas únicas de jejuns completos (normalizadas para o início do dia)
    const uniqueFastDates = Array.from(new Set(
      completedFasts.map(f => new Date(f.startTime).setHours(0, 0, 0, 0))
    )).sort((a, b) => b - a); // Ordenar decrescente (mais recente primeiro)

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expectedDate = new Date(today); // Começar a verificar a partir de hoje

    // Verificar se o jejum mais recente foi hoje ou ontem
    const mostRecentFastDate = new Date(uniqueFastDates[0]);
    const diffDaysFromToday = Math.floor((today.getTime() - mostRecentFastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDaysFromToday > 1) { // Jejum mais recente foi há mais de 1 dia, sem sequência atual
      return 0;
    } else if (diffDaysFromToday === 1) { // Jejum mais recente foi ontem, iniciar sequência a partir de ontem
      expectedDate.setDate(today.getDate() - 1);
    }
    // Se diffDaysFromToday === 0, jejum mais recente foi hoje, expectedDate já é hoje

    for (let i = 0; i < uniqueFastDates.length; i++) {
      const fastDate = new Date(uniqueFastDates[i]);
      fastDate.setHours(0, 0, 0, 0);

      if (fastDate.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1); // Mover para o dia anterior
      } else if (fastDate.getTime() < expectedDate.getTime()) {
        // Lacuna encontrada, sequência quebrada
        break;
      }
    }
    return streak;
  }, [appData.fasts]);

  // Calcula a melhor sequência de jejuns completos
  const getBestStreak = useCallback(() => {
    const completedFasts = appData.fasts.filter(f => f.completed);
    if (completedFasts.length === 0) return 0;

    // Obter datas únicas de jejuns completos (normalizadas para o início do dia)
    const uniqueFastDates = Array.from(new Set(
      completedFasts.map(f => new Date(f.startTime).setHours(0, 0, 0, 0))
    )).sort((a, b) => a - b); // Ordenar crescente (mais antigo primeiro)

    let bestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    uniqueFastDates.forEach(timestamp => {
      const fastDate = new Date(timestamp);

      if (lastDate) {
        const daysDiff = Math.floor((fastDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) { // Dia consecutivo
          currentStreak++;
        } else if (daysDiff > 1) { // Lacuna na sequência
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 1; // Iniciar nova sequência
        }
        // Se daysDiff === 0, é o mesmo dia (já tratado pelo Set), não faz nada com a sequência
      } else {
        currentStreak = 1; // O primeiro jejum inicia uma sequência de 1
      }
      lastDate = fastDate;
    });

    return Math.max(bestStreak, currentStreak); // Comparar com a última sequência atual
  }, [appData.fasts]);

  // Prepara dados para um calendário (ex: tela de Progresso)
  const getCalendarData = useCallback((year: number, month: number) => {
    const fasts = getFastsByMonth(year, month);
    const calendar: {
      [day: number]: {
        hasFast: boolean;
        completed: boolean;
        duration: number;
      };
    } = {};

    fasts.forEach(fast => {
      const date = new Date(fast.startTime);
      const day = date.getDate();

      // Se houver múltiplos jejuns no mesmo dia, o último processado prevalece
      calendar[day] = {
        hasFast: true,
        completed: fast.completed,
        duration: fast.duration,
      };
    });
    return calendar;
  }, [getFastsByMonth]);

  // Water related actions
  const addWater = useCallback((amount: number) => {
    setAppData(prev => {
      const now = new Date();
      const newConsumed = prev.waterData.consumed + amount;
      const newEntry: WaterEntry = {
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        amount: amount,
      };
      return {
        ...prev,
        waterData: {
          ...prev.waterData,
          consumed: newConsumed,
          entries: [...prev.waterData.entries, newEntry],
        },
      };
    });
  }, []);

  const updateWaterGoal = useCallback((newGoal: number) => {
    setAppData(prev => ({
      ...prev,
      waterData: {
        ...prev.waterData,
        goal: newGoal,
      },
    }));
  }, []);

  const updateCupSize = useCallback((newSize: number) => {
    setAppData(prev => ({
      ...prev,
      waterData: {
        ...prev.waterData,
        cupSize: newSize,
      },
    }));
  }, []);

  const getWaterProgressPercentage = useCallback(() => {
    return appData.waterData.goal > 0 ? (appData.waterData.consumed / appData.waterData.goal) * 100 : 0;
  }, [appData.waterData.consumed, appData.waterData.goal]);

  // --- Lógica de Notificações ---
  const sendFastingNotification = useCallback(async (type: 'started' | 'progress50' | 'progress75' | 'completed' | 'dailyReminder', data?: any) => {
    if (!checkNotificationSupport() || !(await requestNotificationPermission())) return;

    const protocol = appData.fastingProtocol;
    const currentStreak = getCurrentStreak(); // Obter a streak atualizada

    switch (type) {
      case 'started':
        if (notificationSettings.fasting.started) {
          notifyFastStarted(protocol.name);
        }
        break;
      case 'progress50':
        if (notificationSettings.fasting.halfway && !halfwayNotifiedRef.current) {
          notifyFastProgress(50, data.remaining);
          halfwayNotifiedRef.current = true;
        }
        break;
      case 'progress75':
        if (notificationSettings.fasting.threeQuarters && !threeQuartersNotifiedRef.current) {
          notifyFastProgress(75, data.remaining);
          threeQuartersNotifiedRef.current = true;
        }
        break;
      case 'completed':
        if (notificationSettings.fasting.completed) {
          notifyFastCompleted(currentStreak);
        }
        // Resetar refs de progresso ao completar
        halfwayNotifiedRef.current = false;
        threeQuartersNotifiedRef.current = false;
        break;
      case 'dailyReminder':
        if (notificationSettings.fasting.dailyReminder) {
          notifyDailyReminder();
        }
        break;
    }
  }, [appData.fastingProtocol, notificationSettings.fasting, getCurrentStreak]);

  const sendWaterNotification = useCallback(async (type: 'reminder' | 'goalReached' | 'lowWater', data?: any) => {
    if (!checkNotificationSupport() || !(await requestNotificationPermission())) return;

    const { consumed, goal } = appData.waterData;

    switch (type) {
      case 'reminder':
        if (notificationSettings.water.enabled) {
          notifyWaterReminder();
        }
        break;
      case 'goalReached':
        if (notificationSettings.water.goalReached) {
          notifyWaterGoalReached();
        }
        break;
      case 'lowWater':
        if (notificationSettings.water.lowWaterAlert) {
          notifyLowWater();
        }
        break;
    }
  }, [appData.waterData, notificationSettings.water]);

  // Efeito para agendar lembrete diário de jejum
  useEffect(() => {
    if (dailyFastReminderTimeoutRef.current) {
      clearTimeout(dailyFastReminderTimeoutRef.current);
    }

    if (notificationSettings.fasting.dailyReminder) {
      const [hours, minutes] = notificationSettings.fasting.reminderTime.split(':').map(Number);
      const now = new Date();
      let reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

      // Se o horário já passou hoje, agendar para amanhã
      if (reminderDate.getTime() < now.getTime()) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }

      const timeToReminder = reminderDate.getTime() - now.getTime();

      dailyFastReminderTimeoutRef.current = setTimeout(() => {
        sendFastingNotification('dailyReminder', notificationSettings.fasting.reminderTime);
        // Reagendar para o próximo dia
        dailyFastReminderTimeoutRef.current = setTimeout(() => {
          sendFastingNotification('dailyReminder', notificationSettings.fasting.reminderTime);
        }, 24 * 60 * 60 * 1000); // 24 horas
      }, timeToReminder);
    }

    return () => {
      if (dailyFastReminderTimeoutRef.current) {
        clearTimeout(dailyFastReminderTimeoutRef.current);
      }
    };
  }, [notificationSettings.fasting.dailyReminder, notificationSettings.fasting.reminderTime, sendFastingNotification]);

  // Efeito para agendar lembretes de água
  useEffect(() => {
    if (waterReminderIntervalRef.current) {
      clearInterval(waterReminderIntervalRef.current);
    }

    if (notificationSettings.water.enabled && notificationSettings.water.interval > 0) {
      const intervalMs = notificationSettings.water.interval * 60 * 1000;
      const [startHour, startMinute] = notificationSettings.water.startTime.split(':').map(Number);
      const [endHour, endMinute] = notificationSettings.water.endTime.split(':').map(Number);

      const checkAndSendWaterReminder = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Converter horários para minutos do dia para fácil comparação
        const nowInMinutes = currentHour * 60 + currentMinute;
        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;

        // Lógica para lidar com horários que cruzam a meia-noite (ex: 22:00 - 06:00)
        let isInRange = false;
        if (startInMinutes <= endInMinutes) {
          // Intervalo normal (ex: 08:00 - 22:00)
          isInRange = nowInMinutes >= startInMinutes && nowInMinutes <= endInMinutes;
        } else {
          // Intervalo que cruza a meia-noite (ex: 22:00 - 06:00)
          isInRange = nowInMinutes >= startInMinutes || nowInMinutes <= endInMinutes;
        }

        if (isInRange) {
          sendWaterNotification('reminder');
        }
      };

      // Enviar o primeiro lembrete imediatamente se estiver dentro do horário
      checkAndSendWaterReminder();
      // Agendar lembretes subsequentes
      waterReminderIntervalRef.current = setInterval(checkAndSendWaterReminder, intervalMs);
    }

    return () => {
      if (waterReminderIntervalRef.current) {
        clearInterval(waterReminderIntervalRef.current);
      }
    };
  }, [
    notificationSettings.water.enabled,
    notificationSettings.water.interval,
    notificationSettings.water.startTime,
    notificationSettings.water.endTime,
    sendWaterNotification
  ]);

  const contextValue = {
    appData,
    fastStartTime,
    setFastStartTime: setFastStartTimeState,
    updateFastingProtocol,
    addFastEntry,
    addWater,
    updateWaterGoal,
    updateCupSize,
    getWaterProgressPercentage,
    getFastsByMonth,
    getMonthlyStats,
    getCurrentStreak,
    getBestStreak,
    getCalendarData,
    notificationSettings,
    updateNotificationSettings: setNotificationSettings, // Usar o setter direto
    sendFastingNotification,
    sendWaterNotification,
    // PWA
    deferredPrompt,
    platform,
    setDeferredPrompt, // Expor o setter para o banner poder resetar
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};