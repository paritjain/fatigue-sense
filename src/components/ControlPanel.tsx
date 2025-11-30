import { Play, Square, Download, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onExport: () => void;
  onReset: () => void;
  sessionTime: number;
}

const ControlPanel = ({ 
  isRunning, 
  onStart, 
  onStop, 
  onExport, 
  onReset,
  sessionTime 
}: ControlPanelProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Controls</span>
        <span className="font-mono text-primary text-sm">{formatTime(sessionTime)}</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {!isRunning ? (
          <Button 
            onClick={onStart}
            className="flex-1 bg-status-fresh hover:bg-status-fresh/90 text-primary-foreground"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button 
            onClick={onStop}
            variant="destructive"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={onReset}
          disabled={isRunning}
          className="border-border hover:bg-secondary"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline"
          onClick={onExport}
          disabled={isRunning}
          className="border-border hover:bg-secondary"
        >
          <Download className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline"
          className="border-border hover:bg-secondary"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
