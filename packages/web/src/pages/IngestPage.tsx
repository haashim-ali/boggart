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
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div className="loading-container">
        <img src="/boggart-logo.png" alt="" className="loading-ghost" />

        {loading && !status && (
          <div className="loading-steps">
            <div className="loading-step active">
              <span className="step-icon" />
              Connecting to Google...
            </div>
            <div className="loading-step">
              <span className="step-icon" />
              Analyzing your digital footprint...
            </div>
            <div className="loading-step">
              <span className="step-icon" />
              Building psychological profile...
            </div>
          </div>
        )}

        {status && <PipelineStatus status={status} />}

        {status && status.stage !== 'complete' && status.stage !== 'error' && (
          <p style={{
            fontWeight: 300,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.04em',
            fontSize: '0.95rem',
            fontStyle: 'italic',
          }}>
            Sit tight &mdash; we are building your profile...
          </p>
        )}

        {status?.stage === 'complete' && (
          <p style={{
            color: 'rgba(155,123,234,0.8)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            fontSize: '1.1rem',
          }}>
            Analysis complete! Moving on...
          </p>
        )}

        {status?.stage === 'error' && (
          <p style={{
            color: 'rgba(244,67,54,0.8)',
            fontWeight: 300,
            letterSpacing: '0.02em',
          }}>
            Something went wrong. {status.error}
          </p>
        )}
      </div>
    </div>
  );
}
