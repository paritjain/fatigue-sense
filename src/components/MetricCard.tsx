import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'danger';
}

const MetricCard = ({ label, value, unit, icon, trend, status = 'normal' }: MetricCardProps) => {
  const statusColors = {
    normal: 'text-primary border-primary/20',
    warning: 'text-status-moderate border-status-moderate/20',
    danger: 'text-status-fatigued border-status-fatigued/20',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className={`bg-card border ${statusColors[status]} rounded-lg p-4 transition-all duration-300 hover:bg-secondary/50`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
        <div className="text-primary opacity-60">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-bold ${statusColors[status].split(' ')[0]}`}>
          {value}
        </span>
        <span className="text-muted-foreground text-sm">{unit}</span>
        {trend && (
          <span className={`text-sm ml-auto ${
            trend === 'up' ? 'text-status-fatigued' : 
            trend === 'down' ? 'text-status-fresh' : 
            'text-muted-foreground'
          }`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
