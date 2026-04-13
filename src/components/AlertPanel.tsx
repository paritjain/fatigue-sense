import { AlertTriangle, Coffee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  type: 'fatigue' | 'break';
  message: string;
  timestamp: number;
}

interface AlertPanelProps {
  alerts: Alert[];
  breakSuggested: boolean;
  onDismissBreak: () => void;
}

const AlertPanel = ({ alerts, breakSuggested, onDismissBreak }: AlertPanelProps) => {
  const recentAlerts = alerts.slice(-5).reverse();

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Alerts</span>
        <span className="text-xs font-mono text-primary">{alerts.length} total</span>
      </div>

      {breakSuggested && (
        <div className="flex items-center gap-2 p-3 bg-status-moderate/10 border border-status-moderate/30 rounded-lg">
          <Coffee className="w-4 h-4 text-status-moderate shrink-0" />
          <p className="text-xs text-foreground flex-1">Time for a break! Step away for 5–10 minutes.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismissBreak}
            className="h-6 px-2 text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className="space-y-1.5 max-h-32 overflow-y-auto">
        {recentAlerts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No alerts yet</p>
        )}
        {recentAlerts.map(a => (
          <div key={a.id} className="flex items-start gap-2 text-xs p-2 bg-secondary/30 rounded">
            {a.type === 'fatigue' ? (
              <AlertTriangle className="w-3 h-3 text-status-fatigued shrink-0 mt-0.5" />
            ) : (
              <Coffee className="w-3 h-3 text-status-moderate shrink-0 mt-0.5" />
            )}
            <span className="text-muted-foreground flex-1">{a.message}</span>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">
              {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;
