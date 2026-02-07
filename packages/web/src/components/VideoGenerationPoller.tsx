import { useState, useEffect, useRef, useCallback } from 'react';
import type { MediaStatus } from '@boggart/shared';
import { api } from '../api/client';

interface Props {
  contentId: string;
  onComplete: (status: MediaStatus) => void;
}

export function VideoGenerationPoller({ contentId, onComplete }: Props) {
  const [dots, setDots] = useState('');
  const intervalRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await api.media.videoStatus(contentId);
        if (res.video.status === 'completed' || res.video.status === 'failed') {
          stopPolling();
          onComplete(res.video);
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 10_000);

    return () => stopPolling();
  }, [contentId, onComplete, stopPolling]);

  // Animate dots
  useEffect(() => {
    const timer = window.setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: 'var(--surface-2)',
      padding: 16,
      borderRadius: 8,
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: 13,
    }}>
      Generating video{dots}
    </div>
  );
}
