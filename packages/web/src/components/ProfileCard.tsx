import type { Profile } from '@boggart/shared';

interface Props {
  profile: Profile;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>{title}</h3>
      {children}
    </div>
  );
}

function Bar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div style={{ background: 'var(--surface-2)', borderRadius: 4, height: 8 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--accent)',
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

export function ProfileCard({ profile }: Props) {
  const { identity, psychology, interests, communication, relationships, routines, values, summary } = profile;

  return (
    <div>
      {/* Identity */}
      <Section title="Identity">
        <h2 style={{ marginBottom: 4 }}>{identity.name}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          {[identity.occupation, identity.location].filter(Boolean).join(' -- ')}
        </p>
        {identity.inferredAgeRange && (
          <span
            style={{
              display: 'inline-block',
              background: 'var(--surface-2)',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {identity.inferredAgeRange}
          </span>
        )}
        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          {identity.selfDescription}
        </p>
      </Section>

      {/* Big Five */}
      <Section title="Big Five Personality">
        <Bar label="Openness" value={psychology.bigFive.openness} />
        <Bar label="Conscientiousness" value={psychology.bigFive.conscientiousness} />
        <Bar label="Extraversion" value={psychology.bigFive.extraversion} />
        <Bar label="Agreeableness" value={psychology.bigFive.agreeableness} />
        <Bar label="Neuroticism" value={psychology.bigFive.neuroticism} />
      </Section>

      {/* Psychology */}
      <Section title="Psychology">
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, marginBottom: 4 }}>Motivations</h4>
          <ul style={{ paddingLeft: 20 }}>
            {psychology.motivations.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, marginBottom: 4 }}>Fears</h4>
          <ul style={{ paddingLeft: 20 }}>
            {psychology.fears.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <p><strong>Decision Style:</strong> {psychology.decisionStyle}</p>
        <div style={{ marginTop: 8 }}>
          <strong>Emotional Patterns:</strong>
          <ul style={{ paddingLeft: 20 }}>
            {psychology.emotionalPatterns.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </Section>

      {/* Interests */}
      <Section title="Interests">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {interests.map((interest) => (
            <div
              key={interest.topic}
              style={{
                background: 'var(--surface-2)',
                borderRadius: 8,
                padding: '8px 14px',
                flex: '0 0 auto',
              }}
            >
              <span style={{ fontWeight: 500 }}>{interest.topic}</span>
              <div style={{ marginTop: 4, background: 'var(--border)', borderRadius: 3, height: 4 }}>
                <div
                  style={{
                    width: `${interest.intensity * 10}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Communication */}
      <Section title="Communication Style">
        <Bar label="Formality" value={communication.formality} max={10} />
        <Bar label="Verbosity" value={communication.verbosity} max={10} />
        <p style={{ marginTop: 8 }}><strong>Humor:</strong> {communication.humorStyle}</p>
        {communication.notablePatterns.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <strong>Patterns:</strong>
            <ul style={{ paddingLeft: 20 }}>
              {communication.notablePatterns.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}
      </Section>

      {/* Relationships */}
      <Section title="Relationships">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {relationships.map((r) => (
            <div
              key={r.personName}
              style={{
                background: 'var(--surface-2)',
                borderRadius: 8,
                padding: 12,
                minWidth: 160,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.personName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 6 }}>
                {r.type}
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i < r.closeness ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Routines */}
      <Section title="Routines">
        {routines.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span>{r.description}</span>
            <span
              style={{
                background: 'var(--surface-2)',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 12,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {r.frequency}
            </span>
          </div>
        ))}
      </Section>

      {/* Values */}
      <Section title="Values">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {values.map((v) => (
            <span
              key={v}
              style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '4px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {v}
            </span>
          ))}
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <blockquote
          style={{
            borderLeft: '3px solid var(--accent)',
            paddingLeft: 16,
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
          }}
        >
          {summary}
        </blockquote>
      </Section>
    </div>
  );
}
