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
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="loading-container">
          <img src="/boggart-logo.png" alt="" className="loading-ghost" />
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            fontStyle: 'italic',
          }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Your Profile</h1>
        {entities && (
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <span className="pill">{entities.people.length} people</span>
            <span className="pill">{entities.moments.length} moments</span>
            <span className="pill">{entities.artifacts.length} artifacts</span>
          </div>
        )}
      </div>

      <ProfileCard profile={profile} />

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={onContinue}>
          Generate Content &rsaquo;
        </button>
      </div>
    </div>
  );
}
