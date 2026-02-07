import type { GeneratedContent } from '@boggart/shared';

interface Props {
  content: GeneratedContent;
}

export function ContentCard({ content }: Props) {
  const { goal, strategy, visual, copy, videoScript } = content;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12 }}>{goal}</h3>

      {/* Strategy */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>Strategy</h4>
        <p style={{ marginBottom: 8 }}>{strategy.persuasionApproach}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {strategy.emotionalHooks.map((hook) => (
            <span
              key={hook}
              style={{
                background: 'var(--surface-2)',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {hook}
            </span>
          ))}
        </div>
        {strategy.personalReferences.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
            Refs: {strategy.personalReferences.join(', ')}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            style={{
              background: 'var(--surface-2)',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
            }}
          >
            {strategy.tone}
          </span>
          <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
            {strategy.callToAction}
          </span>
        </div>
      </div>

      {/* Visual */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>Visual Concept</h4>
        <p style={{ marginBottom: 6 }}>{visual.description}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Style: {visual.style}</p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
          {visual.colorPalette.map((color) => (
            <div
              key={color}
              title={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: color,
                border: '1px solid var(--border)',
              }}
            />
          ))}
        </div>
        <pre
          style={{
            background: 'var(--surface-2)',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            color: 'var(--text-muted)',
          }}
        >
          {visual.imagePrompt}
        </pre>
      </div>

      {/* Copy */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>Copy</h4>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{copy.headline}</p>
        <p style={{ marginBottom: 8 }}>{copy.body}</p>
        {copy.personalHooks.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {copy.personalHooks.map((hook) => (
              <span
                key={hook}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              >
                {hook}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Video Script */}
      <div className="card">
        <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>Video Script</h4>
        <span
          style={{
            display: 'inline-block',
            background: 'var(--surface-2)',
            padding: '2px 10px',
            borderRadius: 12,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {videoScript.duration}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {videoScript.shots.map((shot, i) => (
            <div key={i} style={{ background: 'var(--surface-2)', padding: 10, borderRadius: 6 }}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>{shot.description}</p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {shot.duration} &middot; {shot.movement}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Mood: {videoScript.mood} &middot; Music: {videoScript.music}
        </p>
      </div>
    </div>
  );
}
