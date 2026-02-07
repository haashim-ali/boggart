import { GoogleSignIn } from '../components/GoogleSignIn';

interface Props {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: Props) {
  return (
    <div className="view view-active">
      <header className="header">
        <div className="logo">
          <img
            src="/boggart-logo.png"
            alt="Boggart"
            width={56}
            height={56}
            className="logo-icon"
          />
          <span className="logo-text">Boggart</span>
        </div>
      </header>

      <main className="main">
        <div className="badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 5L11 11M11 5L5 11" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          AI-Powered Psychological Profiling
        </div>

        <h1 className="headline">
          It knows what<br />
          <span className="headline-accent">you&apos;re afraid of</span>
        </h1>

        <p className="description">
          Boggart ingests your digital life and constructs a profile so precise
          it&apos;s uncomfortable. Then it uses that understanding to create content that
          feels like it was made by someone who has known you your entire life.
        </p>

        <GoogleSignIn onLogin={onLogin} />

        <div className="privacy-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3M7 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Your data never leaves this session. We don&apos;t store raw content.
        </div>
      </main>

      <section className="phases">
        <div className="phase-card">
          <div className="phase-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <div className="phase-title">Phase 1: Ingest</div>
          <div className="phase-desc">
            Gmail, Calendar, Drive, Photos, YouTube, Contacts. Every signal. Every absence.
          </div>
        </div>

        <div className="phase-card">
          <div className="phase-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="21" />
              <line x1="3" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          <div className="phase-title">Phase 2: Profile</div>
          <div className="phase-desc">
            Desires, fears, insecurities, ghost relationships. Not what you do &mdash; who you are.
          </div>
        </div>

        <div className="phase-card">
          <div className="phase-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="phase-title">Phase 3: Generate</div>
          <div className="phase-desc">
            Content so personal it makes you wonder how it knew that would work on you.
          </div>
        </div>
      </section>
    </div>
  );
}
