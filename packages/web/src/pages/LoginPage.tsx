import { GoogleSignIn } from '../components/GoogleSignIn';

interface Props {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 16,
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: 'var(--accent)',
          marginBottom: 4,
        }}
      >
        Boggart
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>
        Hyper-personalized content through deep understanding
      </p>
      <GoogleSignIn onLogin={onLogin} />
    </div>
  );
}
