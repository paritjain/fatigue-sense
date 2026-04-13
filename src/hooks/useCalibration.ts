import { useState, useRef, useCallback } from 'react';
import { CalibrationData } from '@/types/fatigue';

const CALIBRATION_DURATION = 30; // seconds

const useCalibration = () => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const samplesRef = useRef<{
    blinkRate: number[];
    ear: number[];
    pitch: number[];
    speechRate: number[];
    headStability: number[];
    voiceEnergy: number[];
  }>({ blinkRate: [], ear: [], pitch: [], speechRate: [], headStability: [], voiceEnergy: [] });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const startCalibration = useCallback(() => {
    samplesRef.current = { blinkRate: [], ear: [], pitch: [], speechRate: [], headStability: [], voiceEnergy: [] };
    elapsedRef.current = 0;
    setCalibrationProgress(0);
    setIsCalibrating(true);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setCalibrationProgress(Math.min(100, (elapsedRef.current / CALIBRATION_DURATION) * 100));

      if (elapsedRef.current >= CALIBRATION_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current);
        const s = samplesRef.current;
        const data: CalibrationData = {
          blinkRate: avg(s.blinkRate),
          ear: avg(s.ear),
          pitch: avg(s.pitch),
          speechRate: avg(s.speechRate),
          headStability: avg(s.headStability),
          voiceEnergy: avg(s.voiceEnergy),
          timestamp: Date.now(),
        };
        setCalibrationData(data);
        setIsCalibrating(false);
      }
    }, 1000);
  }, []);

  const addSample = useCallback((metrics: {
    blinkRate: number;
    ear: number;
    pitch: number;
    speechRate: number;
    headStability: number;
    voiceEnergy: number;
  }) => {
    if (!isCalibrating) return;
    const s = samplesRef.current;
    s.blinkRate.push(metrics.blinkRate);
    s.ear.push(metrics.ear);
    s.pitch.push(metrics.pitch);
    s.speechRate.push(metrics.speechRate);
    s.headStability.push(metrics.headStability);
    s.voiceEnergy.push(metrics.voiceEnergy);
  }, [isCalibrating]);

  const cancelCalibration = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCalibrating(false);
    setCalibrationProgress(0);
  }, []);

  const clearCalibration = useCallback(() => {
    setCalibrationData(null);
  }, []);

  return {
    isCalibrating,
    calibrationProgress,
    calibrationData,
    startCalibration,
    addSample,
    cancelCalibration,
    clearCalibration,
    calibrationDuration: CALIBRATION_DURATION,
  };
};

export default useCalibration;
