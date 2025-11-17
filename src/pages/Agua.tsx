import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, Settings, CupSoda, Bell } from 'lucide-react'; // Importar Bell
import WaterCircularProgress from '../components/WaterCircularProgress';
import WaterConfigModal from '../components/WaterConfigModal';
import NotificationsModal from '../components/NotificationsModal'; // Importar o modal de notificações
import { showSuccess } from '../utils/toast';
import { useApp } from '../context/AppContext';

const Agua = () => {
  const {
    appData,
    addWater,
    updateWaterGoal,
    updateCupSize,
    getWaterProgressPercentage,
    sendWaterNotification, // Nova função para enviar notificações de água
    notificationSettings, // Configurações de notificação
  } = useApp();

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false); // Estado para o modal de notificações
  const [cupsFilledCount, setCupsFilledCount] = useState<number>(0);

  const { waterData, waterHistory } = appData;
  const { goal: waterGoal, cupSize, consumed: consumedToday } = waterData;

  const progressPercentage = getWaterProgressPercentage();
  const cupsTotal = Math.ceil(waterGoal / cupSize);

  // Update cupsFilledCount when consumedToday or cupSize changes
  useEffect(() => {
    setCupsFilledCount(Math.floor(consumedToday / cupSize));
  }, [consumedToday, cupSize]);

  const handleAddCup = useCallback(() => {
    addWater(cupSize);
    // Vibração tátil (se disponível)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Notificação visual ao atingir a meta
    if (consumedToday + cupSize >= waterGoal && consumedToday < waterGoal) {
      showSuccess('Parabéns! Você atingiu sua meta diária de hidratação!');
      sendWaterNotification('goalReached'); // Enviar notificação de meta atingida
    }
  }, [addWater, cupSize, consumedToday, waterGoal, sendWaterNotification]);

  const handleSaveConfig = useCallback((newGoal: number, newCupSize: number) => {
    updateWaterGoal(newGoal);
    updateCupSize(newCupSize);
  }, [updateWaterGoal, updateCupSize]);

  const formatLiters = (ml: number) => `${(ml / 1000).toFixed(1)}L`;

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
  };

  const getProgressEmoji = (percentage: number) => {
    if (percentage >= 90) return '✅';
    if (percentage >= 60) return '⚠️';
    return '❌';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 75) return 'var(--primary)'; // Green
    if (percentage >= 50) return 'var(--water-progress-medium)'; // Yellow
    return 'var(--water-progress-bad)'; // Red
  };

  // Função para obter os dados do histórico semanal (real, com 0% para dias sem registro)
  const getWeeklySummaryData = useCallback(() => {
    const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza para o início do dia

    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i)); // Obtém a data para cada um dos últimos 7 dias, do mais antigo ao mais recente
      const dateStr = date.toISOString().split('T')[0];

      let consumed = 0;
      let goal = waterData.goal; // Meta padrão, pode ser sobrescrita por dados históricos

      if (dateStr === waterData.date) {
        // Dados para o dia atual
        consumed = waterData.consumed;
        goal = waterData.goal;
      } else {
        // Dados para um dia passado
        const historicalDay = waterHistory.find(h => h.date === dateStr);
        if (historicalDay) {
          consumed = historicalDay.consumed;
          goal = historicalDay.goal;
        } else {
          // Nenhum dado histórico para este dia passado, mostra 0% com a meta atual como referência
          consumed = 0;
          goal = waterData.goal; 
        }
      }

      const percentage = goal > 0 ? (consumed / goal) * 100 : 0;

      return {
        day: daysOfWeek[date.getDay()], // Obtém o nome do dia com base na data calculada
        percentage: percentage,
        date: dateStr,
      };
    });
    return weeklyData;
  }, [waterHistory, waterData]); // Dependências para useCallback

  const weeklyData = getWeeklySummaryData();

  return (
    <div className="page-container agua-page">
      <div className="agua-header">
        <h1 className="agua-title">💧 Hidratação</h1>
        <div className="header-icons">
          <button 
            className="icon-button-visuals"
            onClick={() => setShowNotificationsModal(true)}
            aria-label="Configurar notificações"
          >
            <Bell size={24} />
          </button>
          <button 
            className="icon-button-visuals"
            onClick={() => setShowConfigModal(true)}
            aria-label="Configurar meta de água"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="agua-goal-card" onClick={() => setShowConfigModal(true)}>
        <div>
          <span className="agua-goal-label">Meta Diária</span>
          <p className="agua-goal-value">{formatLiters(waterGoal)}</p>
        </div>
        <button 
          className="icon-button-visuals"
          onClick={() => setShowConfigModal(true)}
          aria-label="Configurar meta de água"
        >
          <Settings size={20} />
        </button>
      </div>

      <WaterCircularProgress 
        consumed={consumedToday}
        goal={waterGoal}
      />

      <div className="water-cups-grid">
        {Array.from({ length: cupsTotal }).map((_, index) => (
          <div
            key={index}
            className={`water-cup-item ${index < cupsFilledCount ? 'filled' : 'empty'}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CupSoda size={24} />
          </div>
        ))}
      </div>

      <button className="water-add-button" onClick={handleAddCup}>
        + ADICIONAR COPO ({cupSize}ml)
      </button>

      <div className="weekly-history">
        <h2 className="weekly-header">📊 Esta Semana</h2>
        <div className="weekly-days">
          {weeklyData.map((day, index) => {
            const percentage = Math.min(100, day.percentage);
            return (
              <div key={index} className="week-day-row">
                <span className="day-label">{day.day}</span>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getProgressBarColor(percentage),
                    }}
                  ></div>
                </div>
                <span className="percentage-text">{Math.round(percentage)}%</span>
                <span className="status-emoji">{getProgressEmoji(percentage)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showConfigModal && (
        <WaterConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          currentGoal={waterGoal}
          currentCupSize={cupSize}
          onSave={handleSaveConfig}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}
    </div>
  );
};

export default Agua;