import { useState, useCallback } from 'react';
import { UserProfile, DomainProfile, SessionRecord } from '@/types/fatigue';

const STORAGE_KEY_PROFILES = 'fds_profiles';
const STORAGE_KEY_SESSIONS = 'fds_sessions';
const STORAGE_KEY_ACTIVE = 'fds_active_profile';

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const useProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => loadFromStorage(STORAGE_KEY_PROFILES, []));
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => loadFromStorage(STORAGE_KEY_ACTIVE, null));
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadFromStorage(STORAGE_KEY_SESSIONS, []));

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const addProfile = useCallback((name: string, domain: DomainProfile) => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name,
      domain,
      createdAt: Date.now(),
    };
    setProfiles(prev => {
      const next = [...prev, profile];
      saveToStorage(STORAGE_KEY_PROFILES, next);
      return next;
    });
    setActiveProfileId(profile.id);
    saveToStorage(STORAGE_KEY_ACTIVE, profile.id);
    return profile;
  }, []);

  const selectProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    saveToStorage(STORAGE_KEY_ACTIVE, id);
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEY_PROFILES, next);
      return next;
    });
    setSessions(prev => {
      const next = prev.filter(s => s.profileId !== id);
      saveToStorage(STORAGE_KEY_SESSIONS, next);
      return next;
    });
    if (activeProfileId === id) {
      setActiveProfileId(null);
      saveToStorage(STORAGE_KEY_ACTIVE, null);
    }
  }, [activeProfileId]);

  const addSession = useCallback((session: SessionRecord) => {
    setSessions(prev => {
      const next = [...prev, session];
      saveToStorage(STORAGE_KEY_SESSIONS, next);
      return next;
    });
  }, []);

  const getProfileSessions = useCallback((profileId: string) => {
    return sessions.filter(s => s.profileId === profileId);
  }, [sessions]);

  return {
    profiles,
    activeProfile,
    activeProfileId,
    sessions,
    addProfile,
    selectProfile,
    deleteProfile,
    addSession,
    getProfileSessions,
  };
};

export default useProfiles;
