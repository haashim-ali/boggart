import { useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileCard } from '../components/ProfileCard';

interface Props {
  onContinue: () => void;
}

export function ProfilePage({ onContinue }: Props) {
  const { profile, entities, loading, refetch } = useProfile();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading || !profile) {
    return (
      <div className="container" style={{ paddingTop: 64, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 64 }}>
      {entities && (
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 24,
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          <span>{entities.people.length} people</span>
          <span>&middot;</span>
          <span>{entities.moments.length} moments</span>
          <span>&middot;</span>
          <span>{entities.artifacts.length} artifacts</span>
        </div>
      )}

      <ProfileCard profile={profile} />

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button className="btn-primary" onClick={onContinue} style={{ padding: '12px 32px', fontSize: 16 }}>
          Generate Content &rarr;
        </button>
      </div>
    </div>
  );
}
