import { useState, useRef, useEffect, useCallback } from 'react';
import type { PipelineStatus } from '@boggart/shared';
import { api } from '../api/client';

export function usePipeline() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setLoading(true);
    api.pipeline.start()
      .then(() => {
        setLoading(false);
        intervalRef.current = window.setInterval(async () => {
          try {
            const updated = await api.pipeline.status();
            setStatus(updated);
            if (updated.stage === 'complete' || updated.stage === 'error') {
              stopPolling();
            }
          } catch {
            stopPolling();
          }
        }, 2000);
      })
      .catch(() => setLoading(false));
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { status, start, loading };
}
