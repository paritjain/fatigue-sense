import { Monitor, Keyboard, BrainCircuit, Focus, Wind, PersonStanding, Zap, Heart, Activity } from 'lucide-react';
import MetricCard from './MetricCard';
import { DomainProfile } from '@/types/fatigue';

interface DomainMetricsProps {
  domain: DomainProfile;
  metrics: {
    screenStrain: number;
    typingFatigue: number;
    cognitiveLoad: number;
    attentionScore: number;
    yawnRate: number;
    postureSlouch: number;
    reactionTime: number;
    breathingRate: number;
    recoveryIndex: number;
  };
}

const status = (v: number, warn: number, danger: number, inverse = false) => {
  if (inverse) {
    if (v <= danger) return 'danger' as const;
    if (v <= warn) return 'warning' as const;
    return 'normal' as const;
  }
  if (v >= danger) return 'danger' as const;
  if (v >= warn) return 'warning' as const;
  return 'normal' as const;
};

const DomainMetrics = ({ domain, metrics }: DomainMetricsProps) => {
  const title =
    domain === 'it_professional' ? 'IT Professional Insights' :
    domain === 'student' ? 'Student Insights' : 'Athlete Insights';

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {domain === 'it_professional' && (
          <>
            <MetricCard label="Screen Strain" value={metrics.screenStrain} unit="%" icon={<Monitor className="w-4 h-4" />} status={status(metrics.screenStrain, 50, 75)} />
            <MetricCard label="Typing Fatigue" value={metrics.typingFatigue} unit="%" icon={<Keyboard className="w-4 h-4" />} status={status(metrics.typingFatigue, 50, 75)} />
            <MetricCard label="Cognitive Load" value={metrics.cognitiveLoad} unit="%" icon={<BrainCircuit className="w-4 h-4" />} status={status(metrics.cognitiveLoad, 60, 80)} />
            <MetricCard label="Posture Slouch" value={metrics.postureSlouch} unit="%" icon={<PersonStanding className="w-4 h-4" />} status={status(metrics.postureSlouch, 50, 75)} />
          </>
        )}
        {domain === 'student' && (
          <>
            <MetricCard label="Attention" value={metrics.attentionScore} unit="%" icon={<Focus className="w-4 h-4" />} status={status(metrics.attentionScore, 60, 40, true)} />
            <MetricCard label="Yawn Rate" value={metrics.yawnRate} unit="/min" icon={<Wind className="w-4 h-4" />} status={status(metrics.yawnRate, 2, 4)} />
            <MetricCard label="Cognitive Load" value={metrics.cognitiveLoad} unit="%" icon={<BrainCircuit className="w-4 h-4" />} status={status(metrics.cognitiveLoad, 60, 80)} />
            <MetricCard label="Posture Slouch" value={metrics.postureSlouch} unit="%" icon={<PersonStanding className="w-4 h-4" />} status={status(metrics.postureSlouch, 50, 75)} />
          </>
        )}
        {domain === 'athlete' && (
          <>
            <MetricCard label="Reaction Time" value={metrics.reactionTime} unit="ms" icon={<Zap className="w-4 h-4" />} status={status(metrics.reactionTime, 320, 380)} />
            <MetricCard label="Breathing Rate" value={metrics.breathingRate} unit="/min" icon={<Wind className="w-4 h-4" />} status={status(metrics.breathingRate, 20, 24)} />
            <MetricCard label="Recovery Index" value={metrics.recoveryIndex} unit="%" icon={<Heart className="w-4 h-4" />} status={status(metrics.recoveryIndex, 60, 40, true)} />
            <MetricCard label="Head Stability" value={Math.round((1 - metrics.postureSlouch / 100) * 100)} unit="%" icon={<Activity className="w-4 h-4" />} status={status(metrics.postureSlouch, 50, 75)} />
          </>
        )}
      </div>
    </div>
  );
};

export default DomainMetrics;
