import { useEffect, useRef } from 'react';
import { usePipeline } from '../hooks/usePipeline';
import { PipelineStatus } from '../components/PipelineStatus';

interface Props {
  onComplete: () => void;
}

export function IngestPage({ onComplete }: Props) {
  const { status, start, loading } = usePipeline();
  const started = useRef(false);

  useEffect(() => {
    if (!started.current && (status === null || status.stage === 'idle')) {
      started.current = true;
      start();
    }
  }, [status, start]);

  useEffect(() => {
    if (status?.stage === 'complete') {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  return (
    <div className="container" style={{ paddingTop: 64 }}>
      <h1 style={{ marginBottom: 24 }}>Analyzing Your Data</h1>
      {loading && !status && (
        <p style={{ color: 'var(--text-muted)' }}>Starting pipeline...</p>
      )}
      {status && <PipelineStatus status={status} />}
      {status && status.stage !== 'complete' && status.stage !== 'error' && (
        <p style={{ color: 'var(--text-muted)', marginTop: 20 }}>
          Sit tight -- we are building your profile...
        </p>
      )}
      {status?.stage === 'complete' && (
        <p style={{ color: 'var(--success)', marginTop: 20, fontWeight: 600 }}>
          Analysis complete! Moving on...
        </p>
      )}
      {status?.stage === 'error' && (
        <p style={{ color: 'var(--error)', marginTop: 20 }}>
          Something went wrong. {status.error}
        </p>
      )}
    </div>
  );
}
