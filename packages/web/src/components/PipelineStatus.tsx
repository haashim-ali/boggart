import type { PipelineStatus as PipelineStatusType } from '@boggart/shared';

interface Props {
  status: PipelineStatusType;
}

export function PipelineStatus({ status }: Props) {
  return (
    <div>
      <h2 style={{ marginBottom: 16, textTransform: 'capitalize' }}>
        {status.stage === 'idle' ? 'Ready' : status.stage}
      </h2>
      {status.error && (
        <p style={{ color: 'var(--error)', marginBottom: 12 }}>{status.error}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {status.workers.map((w) => (
          <div
            key={w.name}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 16,
            }}
          >
            <span className={`status-dot ${w.status}`} />
            <span style={{ flex: 1, textTransform: 'capitalize', fontWeight: 500 }}>
              {w.name}
            </span>
            {w.status === 'completed' && w.itemCount !== undefined && (
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {w.itemCount} items
              </span>
            )}
            {w.status === 'failed' && w.error && (
              <span style={{ color: 'var(--error)', fontSize: 13 }}>{w.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
