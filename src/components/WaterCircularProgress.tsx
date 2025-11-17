import React from 'react';

interface WaterCircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const WaterCircularProgress: React.FC<WaterCircularProgressProps> = ({
  percentage,
  size = 180,
  strokeWidth = 10,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Cor do progresso baseada na porcentagem
  const getColor = (pct: number) => {
    if (pct >= 75) return 'var(--primary)'; // Verde
    if (pct >= 50) return 'var(--water-progress-medium)'; // Amarelo
    return 'var(--water-progress-bad)'; // Vermelho
  };

  return (
    <div className="water-circular-progress" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="water-circular-progress-svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      
      {/* Content inside circle */}
      <div className="water-circular-progress-content">
        {children}
      </div>
    </div>
  );
};

export default WaterCircularProgress;
