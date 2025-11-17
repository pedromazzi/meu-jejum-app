// Utilitários para gerenciamento de localStorage

export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar ${key} do localStorage:`, error);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
};

// Define tipos para melhor segurança de tipo
interface FastingProtocol {
  hours: number;
  eating: number;
  name: string;
}

interface FastRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  goal: number;
  completed: boolean;
  protocol: string;
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

export interface AppDataState {
  fastingProtocol: FastingProtocol;
  fasts: FastRecord[];
  waterData: WaterDayData;
  waterHistory: WaterHistoryEntry[];
}

// Dados padrão do aplicativo
export const defaultAppData: AppDataState = {
  fastingProtocol: {
    hours: 16,
    eating: 8,
    name: '16:8',
  },
  fasts: [],
  waterData: {
    date: new Date().toISOString().split('T')[0],
    goal: 2000,
    cupSize: 250,
    consumed: 0,
    entries: [],
  },
  waterHistory: [],
};
