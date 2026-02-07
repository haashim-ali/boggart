import type { Profile } from '@boggart/shared';

interface Props {
  profile: Profile;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h4 style={{ marginBottom: '1rem' }}>{title}</h4>
      {children}
    </div>
  );
}

function Bar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        fontWeight: 300,
        marginBottom: '0.35rem',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{pct}%</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
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
        <h2 style={{ marginBottom: '0.5rem' }}>{identity.name}</h2>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontWeight: 300,
          marginBottom: '0.75rem',
          letterSpacing: '0.02em',
        }}>
          {[identity.occupation, identity.location].filter(Boolean).join(' \u2014 ')}
        </p>
        {identity.inferredAgeRange && (
          <span className="pill" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {identity.inferredAgeRange}
          </span>
        )}
        <p style={{
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 300,
          lineHeight: 1.7,
        }}>
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
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '0.35rem',
          }}>Motivations</p>
          <ul>
            {psychology.motivations.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '0.35rem',
          }}>Fears</p>
          <ul>
            {psychology.fears.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Decision Style:</span>{' '}
          {psychology.decisionStyle}
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '0.35rem',
          }}>Emotional Patterns</p>
          <ul>
            {psychology.emotionalPatterns.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </Section>

      {/* Interests */}
      <Section title="Interests">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {interests.map((interest) => (
            <div
              key={interest.topic}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
              }}
            >
              <span style={{
                fontWeight: 400,
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.75)',
              }}>{interest.topic}</span>
              <div style={{ marginTop: '0.35rem' }}>
                <div className="bar-track" style={{ height: '3px' }}>
                  <div className="bar-fill" style={{ width: `${interest.intensity * 10}%`, height: '100%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Communication */}
      <Section title="Communication Style">
        <Bar label="Formality" value={communication.formality} max={10} />
        <Bar label="Verbosity" value={communication.verbosity} max={10} />
        <p style={{
          marginTop: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 300,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Humor:</span> {communication.humorStyle}
        </p>
        {communication.notablePatterns.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.35rem',
            }}>Patterns</p>
            <ul>
              {communication.notablePatterns.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}
      </Section>

      {/* Relationships */}
      <Section title="Relationships">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {relationships.map((r) => (
            <div
              key={r.personName}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                minWidth: '160px',
              }}
            >
              <div style={{
                fontWeight: 400,
                marginBottom: '0.25rem',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.95rem',
              }}>{r.personName}</div>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'capitalize',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}>
                {r.type}
              </div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i < r.closeness
                        ? 'rgba(155,123,234,0.7)'
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
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
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.6rem',
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.65)',
              fontWeight: 300,
              fontSize: '0.9rem',
            }}>{r.description}</span>
            <span className="pill" style={{ fontSize: '0.75rem' }}>
              {r.frequency}
            </span>
          </div>
        ))}
      </Section>

      {/* Values */}
      <Section title="Values">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {values.map((v) => (
            <span key={v} className="pill-accent pill">
              {v}
            </span>
          ))}
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <blockquote>{summary}</blockquote>
      </Section>
    </div>
  );
}
