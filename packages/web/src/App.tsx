import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { IngestPage } from './pages/IngestPage';
import { ProfilePage } from './pages/ProfilePage';
import { GeneratePage } from './pages/GeneratePage';

type Page = 'login' | 'ingest' | 'profile' | 'generate';

const pageLabels: Record<Exclude<Page, 'login'>, string> = {
  ingest: 'Ingest',
  profile: 'Profile',
  generate: 'Generate',
};

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [page, setPage] = useState<Page>('ingest');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div>
      {/* Nav bar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          zIndex: 100,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>Boggart</span>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 24 }}>
          {(Object.keys(pageLabels) as Array<Exclude<Page, 'login'>>).map((p) => (
            <span
              key={p}
              style={{
                fontSize: 13,
                fontWeight: page === p ? 600 : 400,
                color: page === p ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'default',
              }}
            >
              {pageLabels[p]}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              style={{ width: 28, height: 28, borderRadius: '50%' }}
            />
          )}
          <span style={{ fontSize: 13 }}>{user.name}</span>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 12,
              padding: '4px 10px',
              border: '1px solid var(--border)',
              borderRadius: 6,
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ paddingTop: 56 }}>
        {page === 'ingest' && <IngestPage onComplete={() => setPage('profile')} />}
        {page === 'profile' && <ProfilePage onContinue={() => setPage('generate')} />}
        {page === 'generate' && <GeneratePage />}
      </div>
    </div>
  );
}
