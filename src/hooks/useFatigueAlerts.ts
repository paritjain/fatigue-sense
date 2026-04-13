import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface AlertConfig {
  fatigueThreshold: number;
  breakInterval: number; // minutes
  soundEnabled: boolean;
}

interface Alert {
  id: string;
  type: 'fatigue' | 'break';
  message: string;
  timestamp: number;
}

const useFatigueAlerts = (config: AlertConfig) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [breakSuggested, setBreakSuggested] = useState(false);
  const lastAlertRef = useRef(0);
  const sessionStartRef = useRef(0);
  const lastBreakRef = useRef(0);

  const ALERT_COOLDOWN = 30000; // 30s cooldown between alerts

  const playAlertSound = useCallback(() => {
    if (!config.soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
  }, [config.soundEnabled]);

  const checkFatigue = useCallback((fatigueLevel: number, sessionTime: number) => {
    const now = Date.now();

    if (sessionStartRef.current === 0) {
      sessionStartRef.current = now;
      lastBreakRef.current = now;
    }

    // High fatigue alert
    if (fatigueLevel >= config.fatigueThreshold && now - lastAlertRef.current > ALERT_COOLDOWN) {
      lastAlertRef.current = now;
      const alert: Alert = {
        id: crypto.randomUUID(),
        type: 'fatigue',
        message: `High fatigue detected (${fatigueLevel}%). Consider reducing intensity or taking a break.`,
        timestamp: now,
      };
      setAlerts(prev => [...prev.slice(-19), alert]);
      playAlertSound();
      toast({
        title: "⚠️ High Fatigue Alert",
        description: alert.message,
        variant: "destructive",
      });
    }

    // Break suggestion
    const minutesSinceBreak = (now - lastBreakRef.current) / 60000;
    if (minutesSinceBreak >= config.breakInterval && !breakSuggested) {
      setBreakSuggested(true);
      const alert: Alert = {
        id: crypto.randomUUID(),
        type: 'break',
        message: `You've been active for ${Math.round(minutesSinceBreak)} minutes. Time for a break!`,
        timestamp: now,
      };
      setAlerts(prev => [...prev.slice(-19), alert]);
      toast({
        title: "💡 Break Suggestion",
        description: alert.message,
      });
    }
  }, [config.fatigueThreshold, config.breakInterval, breakSuggested, playAlertSound]);

  const dismissBreak = useCallback(() => {
    setBreakSuggested(false);
    lastBreakRef.current = Date.now();
  }, []);

  const resetAlerts = useCallback(() => {
    setAlerts([]);
    setBreakSuggested(false);
    sessionStartRef.current = 0;
    lastBreakRef.current = 0;
    lastAlertRef.current = 0;
  }, []);

  return {
    alerts,
    breakSuggested,
    checkFatigue,
    dismissBreak,
    resetAlerts,
    alertCount: alerts.length,
  };
};

export default useFatigueAlerts;
