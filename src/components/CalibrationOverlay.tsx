import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CalibrationOverlayProps {
  isCalibrating: boolean;
  progress: number;
  duration: number;
  onCancel: () => void;
}

const CalibrationOverlay = ({ isCalibrating, progress, duration, onCancel }: CalibrationOverlayProps) => {
  if (!isCalibrating) return null;

  const secondsLeft = Math.ceil(duration * (1 - progress / 100));

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-primary/30 rounded-lg p-8 max-w-md w-full mx-4 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Target className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Calibrating Baseline</h2>
          <p className="text-muted-foreground text-sm">
            Please stay relaxed and look at the camera. We're recording your rested state to personalize fatigue thresholds.
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="font-mono text-primary text-sm">{secondsLeft}s remaining</p>
        </div>

        <Button variant="outline" onClick={onCancel} className="border-border">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CalibrationOverlay;
