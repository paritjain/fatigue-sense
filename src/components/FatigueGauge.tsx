import { useEffect, useState } from 'react';

interface FatigueGaugeProps {
  value: number;
  size?: number;
}

const FatigueGauge = ({ value, size = 200 }: FatigueGaugeProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedValue / 100) * circumference;
  
  const getStatus = () => {
    if (value <= 33) return { label: 'FRESH', color: 'hsl(var(--status-fresh))', glowClass: 'glow-success' };
    if (value <= 66) return { label: 'MODERATE', color: 'hsl(var(--status-moderate))', glowClass: 'glow-warning' };
    return { label: 'FATIGUED', color: 'hsl(var(--status-fatigued))', glowClass: 'glow-danger' };
  };

  const status = getStatus();

  return (
    <div className="relative flex flex-col items-center">
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45 * (size / 100)}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={8 * (size / 100)}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45 * (size / 100)}
          fill="none"
          stroke={status.color}
          strokeWidth={8 * (size / 100)}
          strokeLinecap="round"
          strokeDasharray={circumference * (size / 100)}
          strokeDashoffset={offset * (size / 100)}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 10px ${status.color})`
          }}
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45 * (size / 100)}
          fill="none"
          stroke={status.color}
          strokeWidth={2 * (size / 100)}
          strokeLinecap="round"
          strokeDasharray={circumference * (size / 100)}
          strokeDashoffset={offset * (size / 100)}
          className="transition-all duration-1000 ease-out blur-sm opacity-50"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className="font-mono text-4xl font-bold transition-colors duration-500"
          style={{ color: status.color }}
        >
          {Math.round(animatedValue)}%
        </span>
        <span 
          className="text-xs font-semibold tracking-widest mt-1 transition-colors duration-500"
          style={{ color: status.color }}
        >
          {status.label}
        </span>
      </div>
    </div>
  );
};

export default FatigueGauge;
