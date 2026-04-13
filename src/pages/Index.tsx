import { useState, useCallback, useRef } from 'react';
import { Eye, Activity, Mic, Brain, Waves, Target, Volume2, Monitor, Crosshair } from 'lucide-react';
import FatigueGauge from '@/components/FatigueGauge';
import MetricCard from '@/components/MetricCard';
import WebcamFeed from '@/components/WebcamFeed';
import StatusIndicator from '@/components/StatusIndicator';
import RealTimeChart from '@/components/RealTimeChart';
import ControlPanel from '@/components/ControlPanel';
import CalibrationOverlay from '@/components/CalibrationOverlay';
import DomainSelector from '@/components/DomainSelector';
import ProfileManager from '@/components/ProfileManager';
import AlertPanel from '@/components/AlertPanel';
import SessionHistory from '@/components/SessionHistory';
import useFatigueSimulation from '@/hooks/useFatigueSimulation';
import useCalibration from '@/hooks/useCalibration';
import useProfiles from '@/hooks/useProfiles';
import useFatigueAlerts from '@/hooks/useFatigueAlerts';
import { DomainProfile, DOMAIN_THRESHOLDS, SessionRecord } from '@/types/fatigue';
import { exportSessionToCSV } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<DomainProfile>('athlete');

  const {
    profiles, activeProfile, activeProfileId,
    addProfile, selectProfile, deleteProfile,
    addSession, getProfileSessions, sessions,
  } = useProfiles();

  const {
    isCalibrating, calibrationProgress, calibrationData,
    startCalibration, addSample, cancelCalibration, calibrationDuration,
  } = useCalibration();

  const currentDomain = activeProfile?.domain ?? selectedDomain;
  const domainThresholds = DOMAIN_THRESHOLDS[currentDomain];

  const { metrics, chartData, reset, sessionTime, thresholds } = useFatigueSimulation(
    isRunning, currentDomain, calibrationData
  );

  const { alerts, breakSuggested, checkFatigue, dismissBreak, resetAlerts, alertCount } = useFatigueAlerts({
    fatigueThreshold: domainThresholds.fatigueAlert,
    breakInterval: domainThresholds.breakSuggestionInterval,
    soundEnabled: true,
  });

  const sessionDataRef = useRef<SessionRecord['dataPoints']>([]);
  const sessionStartRef = useRef(0);

  // Feed calibration samples
  if (isCalibrating && isRunning) {
    addSample(metrics);
  }

  // Check fatigue alerts
  if (isRunning) {
    checkFatigue(metrics.fatigueLevel, sessionTime);
  }

  // Record session data points
  if (isRunning) {
    const lastTime = sessionDataRef.current.length > 0 ? sessionDataRef.current[sessionDataRef.current.length - 1].time : -1;
    if (sessionTime > lastTime) {
      sessionDataRef.current.push({ time: sessionTime, ...metrics });
    }
  }

  const handleStart = useCallback(() => {
    setIsRunning(true);
    sessionStartRef.current = Date.now();
    sessionDataRef.current = [];
    toast({ title: "Session Started", description: "Fatigue detection is now active." });
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    // Save session
    if (activeProfileId && sessionDataRef.current.length > 0) {
      const fatigues = sessionDataRef.current.map(d => d.fatigueLevel);
      const session: SessionRecord = {
        id: crypto.randomUUID(),
        profileId: activeProfileId,
        startTime: sessionStartRef.current,
        endTime: Date.now(),
        domain: currentDomain,
        peakFatigue: Math.max(...fatigues),
        avgFatigue: Math.round(fatigues.reduce((a, b) => a + b, 0) / fatigues.length),
        alertCount,
        dataPoints: sessionDataRef.current,
      };
      addSession(session);
    }
    toast({
      title: "Session Stopped",
      description: `Session duration: ${Math.floor(sessionTime / 60)}m ${sessionTime % 60}s`,
    });
  }, [sessionTime, activeProfileId, currentDomain, alertCount, addSession]);

  const handleReset = useCallback(() => {
    reset();
    resetAlerts();
    sessionDataRef.current = [];
    toast({ title: "Session Reset", description: "All metrics have been cleared." });
  }, [reset, resetAlerts]);

  const handleExport = useCallback(() => {
    if (sessionDataRef.current.length === 0) {
      toast({ title: "No Data", description: "Run a session first to export data." });
      return;
    }
    const session: SessionRecord = {
      id: crypto.randomUUID(),
      profileId: activeProfileId || 'anonymous',
      startTime: sessionStartRef.current || Date.now(),
      endTime: Date.now(),
      domain: currentDomain,
      peakFatigue: Math.max(...sessionDataRef.current.map(d => d.fatigueLevel)),
      avgFatigue: Math.round(sessionDataRef.current.map(d => d.fatigueLevel).reduce((a, b) => a + b, 0) / sessionDataRef.current.length),
      alertCount,
      dataPoints: sessionDataRef.current,
    };
    exportSessionToCSV(session);
    toast({ title: "Data Exported", description: "Session data has been exported to CSV." });
  }, [activeProfileId, currentDomain, alertCount]);

  const getMetricStatus = (value: number, t: { warning: number; danger: number }, inverse = false) => {
    if (inverse) {
      if (value <= t.danger) return 'danger' as const;
      if (value <= t.warning) return 'warning' as const;
      return 'normal' as const;
    }
    if (value >= t.danger) return 'danger' as const;
    if (value >= t.warning) return 'warning' as const;
    return 'normal' as const;
  };

  const profileSessions = activeProfileId ? getProfileSessions(activeProfileId) : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <CalibrationOverlay
        isCalibrating={isCalibrating}
        progress={calibrationProgress}
        duration={calibrationDuration}
        onCancel={cancelCalibration}
      />

      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Fatigue Detection System
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time fatigue monitoring v0.2.0
              {activeProfile && <span className="text-primary ml-2">• {activeProfile.name}</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusIndicator label="Camera" status={isRunning ? 'online' : 'offline'} />
            <StatusIndicator label="Audio" status={isRunning ? 'online' : 'offline'} />
            <StatusIndicator label="Model" status="online" />
            {calibrationData && <StatusIndicator label="Calibrated" status="online" />}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <WebcamFeed isActive={isRunning} onFpsUpdate={setFps} />

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RealTimeChart data={chartData.blinkRate} label="Blink Rate" unit="/min" color="hsl(var(--chart-1))" threshold={thresholds.blinkRate.danger} thresholdLabel="Fatigue threshold" />
            <RealTimeChart data={chartData.ear} label="Eye Aspect Ratio" unit="" color="hsl(var(--chart-2))" threshold={thresholds.ear.danger} thresholdLabel="Fatigue threshold" />
            <RealTimeChart data={chartData.pitch} label="Voice Pitch" unit="Hz" color="hsl(var(--chart-3))" />
          </div>

          {/* Alert Panel */}
          <AlertPanel alerts={alerts} breakSuggested={breakSuggested} onDismissBreak={dismissBreak} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Domain Selector */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Domain</span>
            <DomainSelector value={currentDomain} onChange={setSelectedDomain} disabled={isRunning || !!activeProfile} />
            <Button
              variant="outline"
              size="sm"
              onClick={startCalibration}
              disabled={isRunning || isCalibrating}
              className="w-full border-border text-xs"
            >
              <Crosshair className="w-3 h-3 mr-1" />
              {calibrationData ? 'Recalibrate Baseline' : 'Calibrate Baseline (30s)'}
            </Button>
          </div>

          {/* Fatigue Gauge */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Fatigue Level</span>
            <FatigueGauge value={metrics.fatigueLevel} size={180} />
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                {metrics.fatigueLevel <= 33 && "Well-rested and ready"}
                {metrics.fatigueLevel > 33 && metrics.fatigueLevel <= 66 && "Moderate fatigue - monitor closely"}
                {metrics.fatigueLevel > 66 && "High fatigue - consider rest"}
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Blink Rate" value={metrics.blinkRate} unit="/min" icon={<Eye className="w-4 h-4" />} status={getMetricStatus(metrics.blinkRate, thresholds.blinkRate)} trend={metrics.blinkRate > 20 ? 'up' : 'stable'} />
            <MetricCard label="EAR" value={metrics.ear} unit="" icon={<Target className="w-4 h-4" />} status={getMetricStatus(metrics.ear, thresholds.ear, true)} trend={metrics.ear < 0.28 ? 'down' : 'stable'} />
            <MetricCard label="Speech Rate" value={metrics.speechRate} unit="/sec" icon={<Mic className="w-4 h-4" />} status={getMetricStatus(metrics.speechRate, thresholds.speechRate, true)} trend={metrics.speechRate < 4 ? 'down' : 'stable'} />
            <MetricCard label="Pitch" value={metrics.pitch} unit="Hz" icon={<Waves className="w-4 h-4" />} status={getMetricStatus(metrics.pitch, thresholds.pitch, true)} />
            <MetricCard label="PERCLOS" value={(metrics.perclos * 100).toFixed(0)} unit="%" icon={<Monitor className="w-4 h-4" />} status={getMetricStatus(metrics.perclos, thresholds.perclos)} />
            <MetricCard label="Head Stability" value={(metrics.headStability * 100).toFixed(0)} unit="%" icon={<Activity className="w-4 h-4" />} status={getMetricStatus(metrics.headStability, thresholds.headStability, true)} />
            <MetricCard label="Voice Energy" value={metrics.voiceEnergy} unit="dB" icon={<Volume2 className="w-4 h-4" />} status={getMetricStatus(metrics.voiceEnergy, thresholds.voiceEnergy, true)} />
            <MetricCard label="FPS" value={isRunning ? fps : 0} unit="" icon={<Monitor className="w-4 h-4" />} status={fps < 12 && isRunning ? 'warning' : 'normal'} />
          </div>

          {/* Control Panel */}
          <ControlPanel isRunning={isRunning} onStart={handleStart} onStop={handleStop} onExport={handleExport} onReset={handleReset} sessionTime={sessionTime} />

          {/* Profile Manager */}
          <ProfileManager profiles={profiles} activeProfileId={activeProfileId} onAddProfile={addProfile} onSelectProfile={selectProfile} onDeleteProfile={deleteProfile} />

          {/* Session History */}
          <SessionHistory sessions={profileSessions} onExportSession={exportSessionToCSV} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Fatigue Detection System v0.2.0 • Multi-Domain</p>
          <p>MediaPipe Face Mesh + Voice Analysis • Context-Aware Detection</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
