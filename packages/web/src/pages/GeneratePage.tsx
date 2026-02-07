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
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Brand Ads */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="section-title">Brand Ads</div>
        {loadingBrands && brands.length === 0 && (
          <div className="card" style={{
            textAlign: 'center',
            padding: '3rem',
          }}>
            <div className="media-placeholder-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 300,
              letterSpacing: '0.04em',
              fontStyle: 'italic',
            }}>
              Generating personalized brand content...
            </p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {brands.map((b) => (
            <ContentCard key={b.id} content={b} />
          ))}
        </div>
      </section>

      {/* Custom Content */}
      <section>
        <div className="section-title">Custom Content</div>
        <div style={{ marginBottom: '1.5rem' }}>
          <GoalInput onSubmit={generateCustom} loading={loadingCustom} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {customContent.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
