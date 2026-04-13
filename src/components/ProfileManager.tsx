import { useState } from 'react';
import { User, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserProfile, DomainProfile, DOMAIN_LABELS } from '@/types/fatigue';
import DomainSelector from './DomainSelector';

interface ProfileManagerProps {
  profiles: UserProfile[];
  activeProfileId: string | null;
  onAddProfile: (name: string, domain: DomainProfile) => void;
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
}

const ProfileManager = ({
  profiles,
  activeProfileId,
  onAddProfile,
  onSelectProfile,
  onDeleteProfile,
}: ProfileManagerProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState<DomainProfile>('athlete');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAddProfile(newName.trim(), newDomain);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Profiles</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="text-primary h-7 px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>

      {showCreate && (
        <div className="space-y-3 p-3 bg-secondary/50 rounded-lg">
          <Input
            placeholder="Name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-8 text-sm bg-background"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <DomainSelector value={newDomain} onChange={setNewDomain} />
          <Button size="sm" onClick={handleCreate} className="w-full h-8 bg-primary text-primary-foreground">
            Create Profile
          </Button>
        </div>
      )}

      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {profiles.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No profiles yet</p>
        )}
        {profiles.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectProfile(p.id)}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-sm
              ${p.id === activeProfileId
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'hover:bg-secondary text-foreground'
              }
            `}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate flex-1">{p.name}</span>
            <span className="text-[10px] text-muted-foreground">{DOMAIN_LABELS[p.domain]}</span>
            {p.id === activeProfileId && <Check className="w-3 h-3 text-primary" />}
            <button
              onClick={e => { e.stopPropagation(); onDeleteProfile(p.id); }}
              className="text-muted-foreground hover:text-destructive p-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileManager;
