import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Progresso = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { appData, getCurrentStreak, getBestStreak, getMonthlyStats, getCalendarData } = useApp();

  const { fasts: fastHistory } = appData; // Renomear para clareza

  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const stats = getMonthlyStats(currentMonth.getFullYear(), currentMonth.getMonth());
  const calendarData = getCalendarData(currentMonth.getFullYear(), currentMonth.getMonth());

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      firstDayOfWeek: firstDay.getDay(), // 0-6 (domingo-sábado)
      totalDays: lastDay.getDate(),
    };
  }, []);

  const isToday = useCallback((day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  }, [currentMonth]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    const today = new Date();
    // Não permitir ir para o futuro
    if (
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    ) {
      return;
    }
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, [currentMonth]);

  const renderCalendarDays = useCallback(() => {
    const { firstDayOfWeek, totalDays } = getDaysInMonth(currentMonth);
    const days = [];

    // Espaços vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-empty" />);
    }

    // Dias do mês
    for (let day = 1; day <= totalDays; day++) {
      const dayInfo = calendarData[day];
      const isCurrentDay = isToday(day);

      let statusClass = 'status-empty';
      if (dayInfo) {
        statusClass = dayInfo.completed ? 'status-completed' : 'status-incomplete';
      }

      days.push(
        <div
          key={day}
          className={`calendar-day ${statusClass} ${isCurrentDay ? 'today' : ''}`}
        >
          {day}
        </div>
      );
    }
    return days;
  }, [currentMonth, getDaysInMonth, calendarData, isToday]);

  return (
    <div className="page-container progresso-page">
      <div className="progresso-header">
        <h1 className="progresso-title">📊 Progresso</h1>
      </div>

      {/* Card de Sequência */}
      <div className="streak-card">
        <p className="streak-label">🔥 SEQUÊNCIA ATUAL</p>
        <p className="current-streak-value">{currentStreak} DIAS</p>
        <p className="best-streak-info">Melhor sequência: {bestStreak} dias</p>
        {/* Próxima conquista (exemplo, pode ser mais dinâmico) */}
        <p className="next-achievement">Próxima conquista: {bestStreak + 1} dias 🎯</p>
      </div>

      {/* Calendário Mensal */}
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={goToPreviousMonth} className="calendar-nav-button">
            <ChevronLeft size={24} />
          </button>
          <h2 className="calendar-month-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2>
          <button onClick={goToNextMonth} className="calendar-nav-button" disabled={
            currentMonth.getMonth() === new Date().getMonth() &&
            currentMonth.getFullYear() === new Date().getFullYear()
          }>
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="calendar-weekdays">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legenda do Calendário */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color status-completed"></span> Meta atingida
        </div>
        <div className="legend-item">
          <span className="legend-color status-incomplete"></span> Incompleto
        </div>
        <div className="legend-item">
          <span className="legend-color status-empty"></span> Sem jejum
        </div>
      </div>

      {/* Card de Estatísticas do Mês */}
      <div className="stats-card">
        <h2 className="stats-title">📈 Estatísticas de {monthName.split(' ')[0].charAt(0).toUpperCase() + monthName.split(' ')[0].slice(1)}</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-label">Média de jejum</p>
            <p className="stat-value">{stats.average}h</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total de horas</p>
            <p className="stat-value">{stats.totalHours}h</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Jejuns completos</p>
            <p className="stat-value">{stats.completed}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Taxa de sucesso</p>
            <p className="stat-value">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progresso;