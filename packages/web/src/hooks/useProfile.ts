import { useState, useCallback } from 'react';
import type { Profile, EntityGraph } from '@boggart/shared';
import { api } from '../api/client';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entities, setEntities] = useState<EntityGraph | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    Promise.all([api.profile.get(), api.profile.entities()])
      .then(([profileRes, entitiesRes]) => {
        setProfile(profileRes.profile);
        setEntities(entitiesRes.entities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { profile, entities, loading, refetch };
}
