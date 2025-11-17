import React from 'react';

interface WaterCircularProgressProps {
  consumed: number; // Consumido em ml
  goal: number; // Meta em ml
}

const WaterCircularProgress: React.FC<WaterCircularProgressProps> = ({ consumed, goal }) => {
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatLiters = (ml: number) => `${(ml / 1000).toFixed(1)}L`;

  return (
    <div className="water-circular-progress-wrapper">
      <svg className="water-circular-progress-svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="waterProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff9d" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        {/* Círculo de fundo */}
        <circle
          className="water-circular-progress-bg"
          cx="120"
          cy="120"
          r={radius}
          strokeWidth="12"
        />
        {/* Círculo de progresso */}
        <circle
          className="water-circular-progress-bar"
          cx="120"
          cy="120"
          r={radius}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 120 120)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="water-circular-progress-text">
        <p className="water-consumed">{formatLiters(consumed)}</p>
        <p className="water-goal">Meta: {formatLiters(goal)}</p>
        <p className="water-percentage">{Math.round(percentage)}%</p>
      </div>
    </div>
  );
};

export default WaterCircularProgress;
