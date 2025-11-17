import React, { useCallback } from 'react';
import { useApp } from '../context/AppContext';

// Lista completa de badges
const allBadges = [
  // INICIANTE
  {
    id: 'first-fast',
    emoji: '🌟',
    name: 'Primeiro Jejum',
    description: 'Complete seu primeiro jejum',
    requirement: { type: 'total', value: 1 }
  },
  
  // SEQUÊNCIAS
  {
    id: '3-day-streak',
    emoji: '🔥',
    name: '3 Dias Seguidos',
    description: 'Mantenha 3 dias consecutivos',
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: '7-day-streak',
    emoji: '🔥',
    name: '7 Dias Seguidos',
    description: 'Uma semana perfeita!',
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: '10-day-streak',
    emoji: '🔥',
    name: '10 Dias Seguidos',
    description: 'Disciplina em alta!',
    requirement: { type: 'streak', value: 10 }
  },
  {
    id: '30-day-streak',
    emoji: '🏆',
    name: '30 Dias Seguidos',
    description: 'Um mês perfeito!',
    requirement: { type: 'streak', value: 30 }
  },
  {
    id: '100-day-streak',
    emoji: '👑',
    name: '100 Dias Seguidos',
    description: 'Mestre do jejum!',
    requirement: { type: 'streak', value: 100 }
  },
  
  // TOTAIS
  {
    id: '10-fasts',
    emoji: '⭐',
    name: '10 Jejuns',
    description: 'Complete 10 jejuns',
    requirement: { type: 'total', value: 10 }
  },
  {
    id: '30-fasts',
    emoji: '⭐',
    name: '30 Jejuns',
    description: 'Complete 30 jejuns',
    requirement: { type: 'total', value: 30 }
  },
  {
    id: '50-fasts',
    emoji: '💎',
    name: '50 Jejuns',
    description: 'Complete 50 jejuns',
    requirement: { type: 'total', value: 50 }
  },
  {
    id: '100-fasts',
    emoji: '👑',
    name: '100 Jejuns',
    description: 'Centenário!',
    requirement: { type: 'total', value: 100 }
  },
  
  // LENDÁRIO
  {
    id: '365-day-streak',
    emoji: '🌟',
    name: 'Ano Perfeito',
    description: '365 dias consecutivos',
    requirement: { type: 'streak', value: 365 },
    special: true // Dourado
  }
];

const Conquistas = () => {
  const { appData, getCurrentStreak, getBestStreak } = useApp();
  const { fasts: fastHistory } = appData;

  // Filtrar apenas jejuns completos para as estatísticas e badges
  const completedFasts = fastHistory.filter(f => f.completed);

  // Verificar se badge está desbloqueado
  const checkBadgeUnlocked = useCallback((badge: typeof allBadges[0]) => {
    const totalCompletedFasts = completedFasts.length;
    const bestStreak = getBestStreak();
    
    switch (badge.requirement.type) {
      case 'total':
        return totalCompletedFasts >= badge.requirement.value;
      case 'streak':
        return bestStreak >= badge.requirement.value;
      default:
        return false;
    }
  }, [completedFasts.length, getBestStreak]);
  
  // Pegar data em que conquistou badge (apenas para badges de 'total')
  const getBadgeDate = useCallback((badge: typeof allBadges[0]) => {
    if (!checkBadgeUnlocked(badge) || badge.requirement.type !== 'total') return null;
    
    const achievementFast = completedFasts.sort((a, b) => a.startTime - b.startTime)[badge.requirement.value - 1];
    
    if (achievementFast) {
      const date = new Date(achievementFast.startTime);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    return null;
  }, [checkBadgeUnlocked, completedFasts]);
  
  // Requisito faltante (para badges bloqueados)
  const getMissingRequirement = useCallback((badge: typeof allBadges[0]) => {
    const totalCompletedFasts = completedFasts.length;
    const currentStreak = getCurrentStreak();
    
    if (checkBadgeUnlocked(badge)) return '';

    switch (badge.requirement.type) {
      case 'total':
        const missing = badge.requirement.value - totalCompletedFasts;
        return missing > 0 ? `Faltam ${missing}` : '';
      case 'streak':
        const missingDays = badge.requirement.value - currentStreak;
        return missingDays > 0 ? `Faltam ${missingDays} dias` : '';
      default:
        return '';
    }
  }, [checkBadgeUnlocked, completedFasts.length, getCurrentStreak]);
  
  // Próximo badge de streak
  const getNextStreakBadge = useCallback(() => {
    const currentStreakValue = getCurrentStreak();
    const streakBadges = allBadges
      .filter(b => b.requirement.type === 'streak')
      .filter(b => !checkBadgeUnlocked(b))
      .sort((a, b) => a.requirement.value - b.requirement.value);
    
    return streakBadges[0] || null;
  }, [getCurrentStreak, checkBadgeUnlocked]);
  
  // Progresso até próximo badge de streak
  const getNextStreakProgress = useCallback(() => {
    const nextBadge = getNextStreakBadge();
    if (!nextBadge) return 100; // Todos desbloqueados
    
    const currentStreakValue = getCurrentStreak();
    return Math.min(100, (currentStreakValue / nextBadge.requirement.value) * 100);
  }, [getCurrentStreak, getNextStreakBadge]);
  
  // Estatísticas totais
  const getStats = useCallback(() => {
    const totalFasts = completedFasts.length;
    const totalHours = completedFasts.reduce((sum, f) => sum + f.duration, 0);
    const avgDuration = totalFasts > 0 ? totalHours / totalFasts : 0;
    
    return {
      total: totalFasts,
      totalHours: Math.round(totalHours),
      average: parseFloat(avgDuration.toFixed(1)),
      bestStreak: getBestStreak()
    };
  }, [completedFasts, getBestStreak]);
  
  const currentStreak = getCurrentStreak();
  const nextStreakBadge = getNextStreakBadge();
  const nextStreakProgress = getNextStreakProgress();
  const stats = getStats();

  return (
    <div className="page-container conquistas-page">
      <div className="progresso-header"> {/* Reutilizando estilo de header */}
        <h1 className="progresso-title">🏆 Suas Conquistas</h1>
      </div>

      {/* Card de Sequência */}
      <div className="streak-card">
        <p className="streak-label">🔥 SEQUÊNCIA ATUAL</p>
        <p className="current-streak-value">{currentStreak} DIAS</p>
        {nextStreakBadge ? (
          <>
            <p className="next-achievement">Próxima conquista: {nextStreakBadge.requirement.value} dias 🎯</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${nextStreakProgress}%` }}></div>
            </div>
            <p className="progress-text">Faltam {nextStreakBadge.requirement.value - currentStreak} dias</p>
          </>
        ) : (
          <p className="next-achievement">Todas as conquistas de sequência desbloqueadas! 🎉</p>
        )}
      </div>

      {/* Seção "Coleção de Badges" */}
      <h2 className="section-title">Coleção de Badges</h2>
      <div className="badges-grid">
        {allBadges.map(badge => {
          const unlocked = checkBadgeUnlocked(badge);
          const badgeDate = getBadgeDate(badge);
          const missingRequirement = getMissingRequirement(badge);
          
          return (
            <div 
              key={badge.id} 
              className={`badge-card ${unlocked ? 'unlocked' : 'locked'} ${badge.special ? 'special' : ''}`}
            >
              {unlocked && <span className="badge-checkmark">✅</span>}
              <p className="badge-icon">{unlocked ? badge.emoji : '🔒'}</p>
              <p className="badge-name">{badge.name}</p>
              {unlocked && badgeDate && <p className="badge-date">{badgeDate}</p>}
              {!unlocked && missingRequirement && <p className="badge-requirement">{missingRequirement}</p>}
            </div>
          );
        })}
      </div>

      {/* Card de Estatísticas */}
      <div className="stats-card">
        <h2 className="stats-title">📊 Suas Estatísticas</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-label">Total de jejuns</p>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Horas totais</p>
            <p className="stat-value">{stats.totalHours}h</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Média por jejum</p>
            <p className="stat-value">{stats.average}h</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Melhor sequência</p>
            <p className="stat-value">{stats.bestStreak} dias 🔥</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conquistas;