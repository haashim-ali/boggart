import type { PipelineStatus as PipelineStatusType } from '@boggart/shared';

interface Props {
  status: PipelineStatusType;
}

export function PipelineStatus({ status }: Props) {
  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      {status.error && (
        <p style={{
          color: 'rgba(244,67,54,0.8)',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: 300,
        }}>
          {status.error}
        </p>
      )}
      <div className="loading-steps">
        {status.workers.map((w) => {
          const cls = [
            'loading-step',
            w.status === 'running' ? 'active' : '',
            w.status === 'completed' ? 'done' : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={w.name} className={cls}>
              <span className="step-icon" />
              <span style={{ textTransform: 'capitalize' }}>{w.name}</span>
              {w.status === 'completed' && w.itemCount !== undefined && (
                <span style={{
                  fontSize: '0.8rem',
                  color: 'rgba(155,123,234,0.5)',
                  marginLeft: '0.25rem',
                }}>
                  ({w.itemCount})
                </span>
              )}
              {w.status === 'failed' && w.error && (
                <span style={{
                  fontSize: '0.8rem',
                  color: 'rgba(244,67,54,0.6)',
                  marginLeft: '0.25rem',
                }}>
                  {w.error}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="loading-progress" style={{ width: '100%', marginTop: '1.5rem' }}>
        <div
          className="loading-progress-bar"
          style={{
            width: `${Math.round(
              (status.workers.filter((w) => w.status === 'completed').length /
                Math.max(status.workers.length, 1)) *
                100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}
