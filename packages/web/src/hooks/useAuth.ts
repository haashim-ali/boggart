import { useState, useEffect } from 'react';
import type { AuthUser } from '@boggart/shared';
import { api } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth.me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => api.auth.login();
  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
}
