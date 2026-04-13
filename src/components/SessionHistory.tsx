import { Clock, TrendingUp, Download } from 'lucide-react';
import { SessionRecord, DOMAIN_LABELS } from '@/types/fatigue';
import { Button } from '@/components/ui/button';

interface SessionHistoryProps {
  sessions: SessionRecord[];
  onExportSession: (session: SessionRecord) => void;
}

const SessionHistory = ({ sessions, onExportSession }: SessionHistoryProps) => {
  const recent = sessions.slice(-10).reverse();

  const formatDuration = (start: number, end: number) => {
    const sec = Math.round((end - start) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Session History</span>
        <span className="text-xs font-mono text-primary">{sessions.length} sessions</span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {recent.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No sessions recorded</p>
        )}
        {recent.map(s => (
          <div key={s.id} className="flex items-center gap-2 p-2 bg-secondary/30 rounded text-xs">
            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-foreground">{new Date(s.startTime).toLocaleDateString()}</span>
                <span className="text-muted-foreground">{formatDuration(s.startTime, s.endTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{DOMAIN_LABELS[s.domain]}</span>
                <span className="text-[10px]">
                  Peak: <span className={s.peakFatigue > 66 ? 'text-status-fatigued' : s.peakFatigue > 33 ? 'text-status-moderate' : 'text-status-fresh'}>
                    {s.peakFatigue}%
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground">Avg: {s.avgFatigue}%</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExportSession(s)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;
