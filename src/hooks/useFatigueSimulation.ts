import { useState, useEffect, useCallback, useRef } from 'react';
import { CalibrationData, DomainProfile, DOMAIN_THRESHOLDS } from '@/types/fatigue';

interface FatigueMetrics {
  fatigueLevel: number;
  stressLevel: number;
  blinkRate: number;
  ear: number;
  speechRate: number;
  pitch: number;
  perclos: number;
  headStability: number;
  voiceEnergy: number;
  // Domain-specific (only some are populated based on domain)
  screenStrain: number;
  typingFatigue: number;
  cognitiveLoad: number;
  attentionScore: number;
  yawnRate: number;
  postureSlouch: number;
  reactionTime: number;
  breathingRate: number;
  recoveryIndex: number;
}

interface ChartDataPoint {
  time: number;
  value: number;
}

interface ChartData {
  blinkRate: ChartDataPoint[];
  ear: ChartDataPoint[];
  pitch: ChartDataPoint[];
  stress: ChartDataPoint[];
}

const DEFAULT_METRICS: FatigueMetrics = {
  fatigueLevel: 22,
  stressLevel: 18,
  blinkRate: 15,
  ear: 0.32,
  speechRate: 4.5,
  pitch: 165,
  perclos: 0.08,
  headStability: 0.92,
  voiceEnergy: -18,
  screenStrain: 10,
  typingFatigue: 12,
  cognitiveLoad: 25,
  attentionScore: 88,
  yawnRate: 0,
  postureSlouch: 8,
  reactionTime: 220,
  breathingRate: 14,
  recoveryIndex: 85,
};

const useFatigueSimulation = (
  isRunning: boolean,
  domain: DomainProfile = 'athlete',
  calibration: CalibrationData | null = null,
) => {
  const [metrics, setMetrics] = useState<FatigueMetrics>(DEFAULT_METRICS);
  const [chartData, setChartData] = useState<ChartData>({ blinkRate: [], ear: [], pitch: [], stress: [] });
  const [sessionTime, setSessionTime] = useState(0);

  const timeRef = useRef(0);
  const baselineRef = useRef({
    blinkRate: calibration?.blinkRate ?? 15,
    ear: calibration?.ear ?? 0.32,
    pitch: calibration?.pitch ?? 165,
  });

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

  const simulateFatigue = useCallback((): FatigueMetrics => {
    const speedMultiplier = domain === 'it_professional' ? 0.8 : domain === 'student' ? 0.9 : 1;
    const timeFactor = Math.min((timeRef.current * speedMultiplier) / 300, 1);
    const noise = () => (Math.random() - 0.5) * 0.1;

    const baseFatigue = 20 + timeFactor * 60;
    const fatigueLevel = Math.min(100, Math.max(0, baseFatigue + noise() * 20));
    const f = fatigueLevel / 100;

    const blinkRate = Math.max(10, baselineRef.current.blinkRate + f * 20 + noise() * 5);
    const ear = Math.max(0.15, baselineRef.current.ear - f * 0.15 + noise() * 0.02);
    const speechRate = Math.max(2.5, 4.5 - f * 2 + noise() * 0.5);
    const pitch = Math.max(100, baselineRef.current.pitch - f * 40 + noise() * 10);
    const perclos = Math.min(0.5, 0.05 + f * 0.35 + noise() * 0.05);
    const headStability = Math.max(0.5, 0.95 - f * 0.4 + noise() * 0.05);
    const voiceEnergy = Math.max(-35, -15 - f * 15 + noise() * 3);

    // Stress: derived from pitch deviation, voice energy drop, and head instability
    const pitchDev = Math.abs(pitch - baselineRef.current.pitch) / baselineRef.current.pitch;
    const stressLevel = Math.min(100, Math.max(0,
      f * 50 + pitchDev * 80 + (1 - headStability) * 60 + Math.random() * 8
    ));

    // Domain-specific metrics
    // IT Professional: screen strain, typing fatigue, cognitive load
    const screenStrain = Math.min(100, 10 + f * 75 + perclos * 100 + noise() * 5);
    const typingFatigue = Math.min(100, 12 + f * 70 + (1 - headStability) * 30 + noise() * 5);
    const cognitiveLoad = Math.min(100, 25 + f * 55 + pitchDev * 50 + noise() * 8);

    // Student: attention score, yawn rate, posture slouch
    const attentionScore = Math.max(20, 90 - f * 60 - perclos * 80 + noise() * 5);
    const yawnRate = Math.max(0, f * 6 + noise() * 1.5); // yawns per minute
    const postureSlouch = Math.min(100, 8 + f * 70 + (1 - headStability) * 40 + noise() * 5);

    // Athlete: reaction time, breathing rate, recovery index
    const reactionTime = Math.round(220 + f * 180 + noise() * 30); // ms
    const breathingRate = Math.max(10, 14 + f * 10 + noise() * 2); // breaths/min
    const recoveryIndex = Math.max(20, 90 - f * 65 + noise() * 5);

    return {
      fatigueLevel: Math.round(fatigueLevel),
      stressLevel: Math.round(stressLevel),
      blinkRate: Math.round(blinkRate * 10) / 10,
      ear: Math.round(ear * 100) / 100,
      speechRate: Math.round(speechRate * 10) / 10,
      pitch: Math.round(pitch),
      perclos: Math.round(perclos * 100) / 100,
      headStability: Math.round(headStability * 100) / 100,
      voiceEnergy: Math.round(voiceEnergy),
      screenStrain: Math.round(screenStrain),
      typingFatigue: Math.round(typingFatigue),
      cognitiveLoad: Math.round(cognitiveLoad),
      attentionScore: Math.round(attentionScore),
      yawnRate: Math.round(yawnRate * 10) / 10,
      postureSlouch: Math.round(postureSlouch),
      reactionTime,
      breathingRate: Math.round(breathingRate * 10) / 10,
      recoveryIndex: Math.round(recoveryIndex),
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
          stress: addPoint(prev.stress, newMetrics.stressLevel),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulateFatigue]);

  const reset = useCallback(() => {
    timeRef.current = 0;
    setSessionTime(0);
    setMetrics(DEFAULT_METRICS);
    setChartData({ blinkRate: [], ear: [], pitch: [], stress: [] });
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
