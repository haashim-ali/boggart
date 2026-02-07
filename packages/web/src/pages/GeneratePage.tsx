import { useEffect, useRef } from 'react';
import { useGenerate } from '../hooks/useGenerate';
import { ContentCard } from '../components/ContentCard';
import { GoalInput } from '../components/GoalInput';

export function GeneratePage() {
  const { brands, customContent, loadingBrands, loadingCustom, generateBrands, generateCustom } = useGenerate();
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      generateBrands();
    }
  }, [generateBrands]);

  return (
    <div className="container" style={{ paddingTop: 64 }}>
      {/* Brand Ads */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ marginBottom: 20 }}>Brand Ads</h2>
        {loadingBrands && brands.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Generating personalized brand content...
          </div>
        )}
        {brands.map((b) => (
          <ContentCard key={b.id} content={b} />
        ))}
      </section>

      {/* Custom Content */}
      <section>
        <h2 style={{ marginBottom: 20 }}>Custom Content</h2>
        <div style={{ marginBottom: 24 }}>
          <GoalInput onSubmit={generateCustom} loading={loadingCustom} />
        </div>
        {customContent.map((c) => (
          <ContentCard key={c.id} content={c} />
        ))}
      </section>
    </div>
  );
}
