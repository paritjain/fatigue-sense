import { useState, useEffect, useCallback, useRef } from 'react';
import { CalibrationData, DomainProfile, DOMAIN_THRESHOLDS } from '@/types/fatigue';

interface FatigueMetrics {
  fatigueLevel: number;
  blinkRate: number;
  ear: number;
  speechRate: number;
  pitch: number;
  perclos: number;
  headStability: number;
  voiceEnergy: number;
}

interface ChartDataPoint {
  time: number;
  value: number;
}

interface ChartData {
  blinkRate: ChartDataPoint[];
  ear: ChartDataPoint[];
  pitch: ChartDataPoint[];
}

const DEFAULT_METRICS: FatigueMetrics = {
  fatigueLevel: 22,
  blinkRate: 15,
  ear: 0.32,
  speechRate: 4.5,
  pitch: 165,
  perclos: 0.08,
  headStability: 0.92,
  voiceEnergy: -18,
};

const useFatigueSimulation = (
  isRunning: boolean,
  domain: DomainProfile = 'athlete',
  calibration: CalibrationData | null = null,
) => {
  const [metrics, setMetrics] = useState<FatigueMetrics>(DEFAULT_METRICS);
  const [chartData, setChartData] = useState<ChartData>({ blinkRate: [], ear: [], pitch: [] });
  const [sessionTime, setSessionTime] = useState(0);

  const timeRef = useRef(0);
  const baselineRef = useRef({
    blinkRate: calibration?.blinkRate ?? 15,
    ear: calibration?.ear ?? 0.32,
    pitch: calibration?.pitch ?? 165,
  });

  // Update baseline when calibration changes
  useEffect(() => {
    if (calibration) {
      baselineRef.current = {
        blinkRate: calibration.blinkRate,
        ear: calibration.ear,
        pitch: calibration.pitch,
      };
    }
  }, [calibration]);

  const thresholds = DOMAIN_THRESHOLDS[domain];

  const simulateFatigue = useCallback(() => {
    // Domain-specific fatigue curve speed
    const speedMultiplier = domain === 'it_professional' ? 0.8 : domain === 'student' ? 0.9 : 1;
    const timeFactor = Math.min((timeRef.current * speedMultiplier) / 300, 1);
    const noise = () => (Math.random() - 0.5) * 0.1;

    const baseFatigue = 20 + timeFactor * 60;
    const fatigueLevel = Math.min(100, Math.max(0, baseFatigue + noise() * 20));

    const blinkRate = Math.max(10, baselineRef.current.blinkRate + (fatigueLevel / 100) * 20 + noise() * 5);
    const ear = Math.max(0.15, baselineRef.current.ear - (fatigueLevel / 100) * 0.15 + noise() * 0.02);
    const speechRate = Math.max(2.5, 4.5 - (fatigueLevel / 100) * 2 + noise() * 0.5);
    const pitch = Math.max(100, baselineRef.current.pitch - (fatigueLevel / 100) * 40 + noise() * 10);
    const perclos = Math.min(0.5, 0.05 + (fatigueLevel / 100) * 0.35 + noise() * 0.05);
    const headStability = Math.max(0.5, 0.95 - (fatigueLevel / 100) * 0.4 + noise() * 0.05);
    const voiceEnergy = Math.max(-35, -15 - (fatigueLevel / 100) * 15 + noise() * 3);

    return {
      fatigueLevel: Math.round(fatigueLevel),
      blinkRate: Math.round(blinkRate * 10) / 10,
      ear: Math.round(ear * 100) / 100,
      speechRate: Math.round(speechRate * 10) / 10,
      pitch: Math.round(pitch),
      perclos: Math.round(perclos * 100) / 100,
      headStability: Math.round(headStability * 100) / 100,
      voiceEnergy: Math.round(voiceEnergy),
    };
  }, [domain]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      timeRef.current += 1;
      setSessionTime(timeRef.current);
      const newMetrics = simulateFatigue();
      setMetrics(newMetrics);

      setChartData(prev => {
        const time = timeRef.current;
        const addPoint = (arr: ChartDataPoint[], value: number) => {
          const newArr = [...arr, { time, value }];
          return newArr.slice(-60);
        };
        return {
          blinkRate: addPoint(prev.blinkRate, newMetrics.blinkRate),
          ear: addPoint(prev.ear, newMetrics.ear),
          pitch: addPoint(prev.pitch, newMetrics.pitch),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulateFatigue]);

  const reset = useCallback(() => {
    timeRef.current = 0;
    setSessionTime(0);
    setMetrics(DEFAULT_METRICS);
    setChartData({ blinkRate: [], ear: [], pitch: [] });
  }, []);

  return {
    metrics,
    chartData,
    reset,
    sessionTime,
    thresholds,
  };
};

export default useFatigueSimulation;
