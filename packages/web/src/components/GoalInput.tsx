import { useState } from 'react';

interface Props {
  onSubmit: (goal: string) => void;
  loading: boolean;
}

export function GoalInput({ onSubmit, loading }: Props) {
  const [goal, setGoal] = useState('');

  const handleSubmit = () => {
    const trimmed = goal.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setGoal('');
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="Enter a goal, e.g. 'Sell me a Tesla Model 3'"
        disabled={loading}
      />
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || !goal.trim()}
        style={{ whiteSpace: 'nowrap' }}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}
