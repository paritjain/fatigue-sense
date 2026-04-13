export type DomainProfile = 'athlete' | 'it_professional' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  domain: DomainProfile;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  profileId: string;
  startTime: number;
  endTime: number;
  domain: DomainProfile;
  peakFatigue: number;
  avgFatigue: number;
  alertCount: number;
  dataPoints: SessionDataPoint[];
}

export interface SessionDataPoint {
  time: number;
  fatigueLevel: number;
  blinkRate: number;
  ear: number;
  speechRate: number;
  pitch: number;
  perclos: number;
  headStability: number;
  voiceEnergy: number;
}

export interface CalibrationData {
  blinkRate: number;
  ear: number;
  pitch: number;
  speechRate: number;
  headStability: number;
  voiceEnergy: number;
  timestamp: number;
}

export interface DomainThresholds {
  blinkRate: { warning: number; danger: number };
  ear: { warning: number; danger: number };
  speechRate: { warning: number; danger: number };
  pitch: { warning: number; danger: number };
  perclos: { warning: number; danger: number };
  headStability: { warning: number; danger: number };
  voiceEnergy: { warning: number; danger: number };
  fatigueAlert: number;
  breakSuggestionInterval: number; // minutes
}

export const DOMAIN_THRESHOLDS: Record<DomainProfile, DomainThresholds> = {
  athlete: {
    blinkRate: { warning: 22, danger: 28 },
    ear: { warning: 0.25, danger: 0.20 },
    speechRate: { warning: 3.5, danger: 3.0 },
    pitch: { warning: 140, danger: 120 },
    perclos: { warning: 0.15, danger: 0.25 },
    headStability: { warning: 0.80, danger: 0.70 },
    voiceEnergy: { warning: -25, danger: -30 },
    fatigueAlert: 70,
    breakSuggestionInterval: 45,
  },
  it_professional: {
    blinkRate: { warning: 18, danger: 24 },
    ear: { warning: 0.27, danger: 0.22 },
    speechRate: { warning: 3.8, danger: 3.2 },
    pitch: { warning: 145, danger: 125 },
    perclos: { warning: 0.12, danger: 0.20 },
    headStability: { warning: 0.85, danger: 0.75 },
    voiceEnergy: { warning: -22, danger: -28 },
    fatigueAlert: 60,
    breakSuggestionInterval: 25,
  },
  student: {
    blinkRate: { warning: 20, danger: 26 },
    ear: { warning: 0.26, danger: 0.21 },
    speechRate: { warning: 3.6, danger: 3.1 },
    pitch: { warning: 142, danger: 122 },
    perclos: { warning: 0.13, danger: 0.22 },
    headStability: { warning: 0.82, danger: 0.72 },
    voiceEnergy: { warning: -23, danger: -29 },
    fatigueAlert: 65,
    breakSuggestionInterval: 30,
  },
};

export const DOMAIN_LABELS: Record<DomainProfile, string> = {
  athlete: 'Athlete',
  it_professional: 'IT Professional',
  student: 'Student',
};
