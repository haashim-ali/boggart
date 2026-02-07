import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { ShaderBackground } from './components/ShaderBackground';
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
      <>
        <ShaderBackground />
        <div className="overlay">
          <div className="view view-active view-loading">
            <div className="loading-container">
              <img src="/boggart-logo.png" alt="" className="loading-ghost" />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300, letterSpacing: '0.04em' }}>
                Loading...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <ShaderBackground />
        <div className="overlay">
          <LoginPage onLogin={login} />
        </div>
      </>
    );
  }

  return (
    <>
      <ShaderBackground />
      <div className="overlay">
        {/* Nav bar */}
        <nav className="nav-bar">
          <div className="logo">
            <img src="/boggart-logo.png" alt="Boggart" className="logo-icon-sm" />
            <span className="logo-text-sm">Boggart</span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div className="nav-links">
              {(Object.keys(pageLabels) as Array<Exclude<Page, 'login'>>).map((p) => (
                <span
                  key={p}
                  className={`nav-link${page === p ? ' active' : ''}`}
                >
                  {pageLabels[p]}
                </span>
              ))}
            </div>
          </div>

          <div className="nav-user">
            {user.picture && (
              <img src={user.picture} alt="" className="nav-user-avatar" />
            )}
            <span className="nav-user-name">{user.name}</span>
            <button onClick={logout} className="nav-logout">
              Logout
            </button>
          </div>
        </nav>

        {/* Page content */}
        <div className="view-active">
          {page === 'ingest' && <IngestPage onComplete={() => setPage('profile')} />}
          {page === 'profile' && <ProfilePage onContinue={() => setPage('generate')} />}
          {page === 'generate' && <GeneratePage />}
        </div>
      </div>
    </>
  );
}
