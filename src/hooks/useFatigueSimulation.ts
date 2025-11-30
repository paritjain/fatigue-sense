import { useState, useEffect, useCallback, useRef } from 'react';

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

const useFatigueSimulation = (isRunning: boolean) => {
  const [metrics, setMetrics] = useState<FatigueMetrics>({
    fatigueLevel: 22,
    blinkRate: 15,
    ear: 0.32,
    speechRate: 4.5,
    pitch: 165,
    perclos: 0.08,
    headStability: 0.92,
    voiceEnergy: -18,
  });

  const [chartData, setChartData] = useState<ChartData>({
    blinkRate: [],
    ear: [],
    pitch: [],
  });

  const timeRef = useRef(0);
  const baselineRef = useRef({
    blinkRate: 15,
    ear: 0.32,
    pitch: 165,
  });

  // Simulate gradual fatigue increase over time
  const simulateFatigue = useCallback(() => {
    const timeFactor = Math.min(timeRef.current / 300, 1); // Max out at 5 minutes
    const noise = () => (Math.random() - 0.5) * 0.1;
    
    // Fatigue increases over time with some randomness
    const baseFatigue = 20 + timeFactor * 60;
    const fatigueLevel = Math.min(100, Math.max(0, baseFatigue + noise() * 20));
    
    // Blink rate increases with fatigue
    const blinkRate = Math.max(10, baselineRef.current.blinkRate + (fatigueLevel / 100) * 20 + noise() * 5);
    
    // EAR decreases with fatigue
    const ear = Math.max(0.15, baselineRef.current.ear - (fatigueLevel / 100) * 0.15 + noise() * 0.02);
    
    // Speech rate decreases with fatigue
    const speechRate = Math.max(2.5, 4.5 - (fatigueLevel / 100) * 2 + noise() * 0.5);
    
    // Pitch decreases with fatigue
    const pitch = Math.max(100, baselineRef.current.pitch - (fatigueLevel / 100) * 40 + noise() * 10);
    
    // PERCLOS increases with fatigue
    const perclos = Math.min(0.5, 0.05 + (fatigueLevel / 100) * 0.35 + noise() * 0.05);
    
    // Head stability decreases with fatigue
    const headStability = Math.max(0.5, 0.95 - (fatigueLevel / 100) * 0.4 + noise() * 0.05);
    
    // Voice energy decreases with fatigue
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
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      timeRef.current += 1;
      const newMetrics = simulateFatigue();
      setMetrics(newMetrics);

      // Update chart data (keep last 60 points)
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
    setMetrics({
      fatigueLevel: 22,
      blinkRate: 15,
      ear: 0.32,
      speechRate: 4.5,
      pitch: 165,
      perclos: 0.08,
      headStability: 0.92,
      voiceEnergy: -18,
    });
    setChartData({
      blinkRate: [],
      ear: [],
      pitch: [],
    });
  }, []);

  return {
    metrics,
    chartData,
    reset,
    sessionTime: timeRef.current,
  };
};

export default useFatigueSimulation;
