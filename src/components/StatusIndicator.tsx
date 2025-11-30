interface StatusIndicatorProps {
  label: string;
  status: 'online' | 'offline' | 'warning';
}

const StatusIndicator = ({ label, status }: StatusIndicatorProps) => {
  const statusConfig = {
    online: {
      color: 'bg-status-fresh',
      textColor: 'text-status-fresh',
      label: 'Online',
    },
    offline: {
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      label: 'Offline',
    },
    warning: {
      color: 'bg-status-moderate',
      textColor: 'text-status-moderate',
      label: 'Warning',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === 'online' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
};

export default StatusIndicator;
