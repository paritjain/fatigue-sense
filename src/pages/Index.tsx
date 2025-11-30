import { useState, useCallback } from 'react';
import { Eye, Activity, Mic, Brain, Monitor, Waves, Target, Volume2 } from 'lucide-react';
import FatigueGauge from '@/components/FatigueGauge';
import MetricCard from '@/components/MetricCard';
import WebcamFeed from '@/components/WebcamFeed';
import StatusIndicator from '@/components/StatusIndicator';
import RealTimeChart from '@/components/RealTimeChart';
import ControlPanel from '@/components/ControlPanel';
import useFatigueSimulation from '@/hooks/useFatigueSimulation';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const { metrics, chartData, reset, sessionTime } = useFatigueSimulation(isRunning);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    toast({
      title: "Session Started",
      description: "Fatigue detection is now active.",
    });
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    toast({
      title: "Session Stopped",
      description: `Session duration: ${Math.floor(sessionTime / 60)}m ${sessionTime % 60}s`,
    });
  }, [sessionTime]);

  const handleExport = useCallback(() => {
    toast({
      title: "Data Exported",
      description: "Session data has been exported to CSV.",
    });
  }, []);

  const handleReset = useCallback(() => {
    reset();
    toast({
      title: "Session Reset",
      description: "All metrics have been cleared.",
    });
  }, [reset]);

  const getMetricStatus = (value: number, thresholds: { warning: number; danger: number }, inverse = false) => {
    if (inverse) {
      if (value <= thresholds.danger) return 'danger';
      if (value <= thresholds.warning) return 'warning';
      return 'normal';
    }
    if (value >= thresholds.danger) return 'danger';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Fatigue Detection System
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time athlete fatigue monitoring v0.1.0</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusIndicator label="Camera" status={isRunning ? 'online' : 'offline'} />
            <StatusIndicator label="Audio" status={isRunning ? 'online' : 'offline'} />
            <StatusIndicator label="Model" status="online" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Video Feed */}
        <div className="lg:col-span-2 space-y-6">
          <WebcamFeed isActive={isRunning} onFpsUpdate={setFps} />
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RealTimeChart
              data={chartData.blinkRate}
              label="Blink Rate"
              unit="/min"
              color="hsl(var(--chart-1))"
              threshold={25}
              thresholdLabel="Fatigue threshold"
            />
            <RealTimeChart
              data={chartData.ear}
              label="Eye Aspect Ratio"
              unit=""
              color="hsl(var(--chart-2))"
              threshold={0.22}
              thresholdLabel="Fatigue threshold"
            />
            <RealTimeChart
              data={chartData.pitch}
              label="Voice Pitch"
              unit="Hz"
              color="hsl(var(--chart-3))"
            />
          </div>
        </div>

        {/* Right Column - Metrics & Controls */}
        <div className="space-y-6">
          {/* Fatigue Gauge */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Fatigue Level</span>
            <FatigueGauge value={metrics.fatigueLevel} size={180} />
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {metrics.fatigueLevel <= 33 && "Athlete is well-rested and ready for training"}
                {metrics.fatigueLevel > 33 && metrics.fatigueLevel <= 66 && "Moderate fatigue detected - monitor closely"}
                {metrics.fatigueLevel > 66 && "High fatigue level - consider rest or reduced intensity"}
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Blink Rate"
              value={metrics.blinkRate}
              unit="/min"
              icon={<Eye className="w-4 h-4" />}
              status={getMetricStatus(metrics.blinkRate, { warning: 22, danger: 28 })}
              trend={metrics.blinkRate > 20 ? 'up' : 'stable'}
            />
            <MetricCard
              label="EAR"
              value={metrics.ear}
              unit=""
              icon={<Target className="w-4 h-4" />}
              status={getMetricStatus(metrics.ear, { warning: 0.25, danger: 0.20 }, true)}
              trend={metrics.ear < 0.28 ? 'down' : 'stable'}
            />
            <MetricCard
              label="Speech Rate"
              value={metrics.speechRate}
              unit="/sec"
              icon={<Mic className="w-4 h-4" />}
              status={getMetricStatus(metrics.speechRate, { warning: 3.5, danger: 3.0 }, true)}
              trend={metrics.speechRate < 4 ? 'down' : 'stable'}
            />
            <MetricCard
              label="Pitch"
              value={metrics.pitch}
              unit="Hz"
              icon={<Waves className="w-4 h-4" />}
              status={getMetricStatus(metrics.pitch, { warning: 140, danger: 120 }, true)}
            />
            <MetricCard
              label="PERCLOS"
              value={(metrics.perclos * 100).toFixed(0)}
              unit="%"
              icon={<Monitor className="w-4 h-4" />}
              status={getMetricStatus(metrics.perclos, { warning: 0.15, danger: 0.25 })}
            />
            <MetricCard
              label="Head Stability"
              value={(metrics.headStability * 100).toFixed(0)}
              unit="%"
              icon={<Activity className="w-4 h-4" />}
              status={getMetricStatus(metrics.headStability, { warning: 0.8, danger: 0.7 }, true)}
            />
            <MetricCard
              label="Voice Energy"
              value={metrics.voiceEnergy}
              unit="dB"
              icon={<Volume2 className="w-4 h-4" />}
              status={getMetricStatus(metrics.voiceEnergy, { warning: -25, danger: -30 }, true)}
            />
            <MetricCard
              label="FPS"
              value={isRunning ? fps : 0}
              unit=""
              icon={<Monitor className="w-4 h-4" />}
              status={fps < 12 && isRunning ? 'warning' : 'normal'}
            />
          </div>

          {/* Control Panel */}
          <ControlPanel
            isRunning={isRunning}
            onStart={handleStart}
            onStop={handleStop}
            onExport={handleExport}
            onReset={handleReset}
            sessionTime={sessionTime}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Fatigue Detection System v0.1.0 • Demo Version</p>
          <p>Using MediaPipe Face Mesh + Voice Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
