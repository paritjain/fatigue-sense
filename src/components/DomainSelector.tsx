import { Dumbbell, Monitor, GraduationCap } from 'lucide-react';
import { DomainProfile, DOMAIN_LABELS } from '@/types/fatigue';

interface DomainSelectorProps {
  value: DomainProfile;
  onChange: (domain: DomainProfile) => void;
  disabled?: boolean;
}

const domains: { key: DomainProfile; icon: React.ReactNode; desc: string }[] = [
  { key: 'athlete', icon: <Dumbbell className="w-5 h-5" />, desc: 'Sports training' },
  { key: 'it_professional', icon: <Monitor className="w-5 h-5" />, desc: 'Screen work' },
  { key: 'student', icon: <GraduationCap className="w-5 h-5" />, desc: 'Study sessions' },
];

const DomainSelector = ({ value, onChange, disabled }: DomainSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {domains.map(({ key, icon, desc }) => (
        <button
          key={key}
          onClick={() => !disabled && onChange(key)}
          disabled={disabled}
          className={`p-3 rounded-lg border transition-all text-center space-y-1
            ${value === key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex justify-center">{icon}</div>
          <p className="text-xs font-medium">{DOMAIN_LABELS[key]}</p>
          <p className="text-[10px] opacity-60">{desc}</p>
        </button>
      ))}
    </div>
  );
};

export default DomainSelector;
