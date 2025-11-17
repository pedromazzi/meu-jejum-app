import React from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  duration: number; // duração total em ms
  elapsedTime: number; // tempo decorrido em ms
  endTime: string | null; // horário de término formatado
  isFasting: boolean; // indica se o jejum está ativo
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  duration,
  elapsedTime,
  endTime,
  isFasting,
}) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Formata milissegundos para "XXh XXm"
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const formattedElapsedTime = formatTime(elapsedTime);
  const formattedDuration = formatTime(duration);

  return (
    <div className="circular-progress-wrapper">
      <svg className="circular-progress-svg" width="280" height="280" viewBox="0 0 280 280">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="100%" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        {/* Círculo de fundo */}
        <circle
          className="circular-progress-bg"
          cx="140"
          cy="140"
          r={radius}
          strokeWidth="12"
        />
        {/* Círculo de progresso */}
        <circle
          className="circular-progress-bar"
          cx="140"
          cy="140"
          r={radius}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 140 140)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="circular-progress-text">
        {isFasting ? (
          <>
            <p className="current-time">{formattedElapsedTime}</p>
            <div className="divider"></div>
            <p className="target-time">Meta: {formattedDuration}</p>
            <p className="end-time">Termina: {endTime || '--:--'}</p>
          </>
        ) : (
          <p className="not-fasting-text">Jejum Inativo</p>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
