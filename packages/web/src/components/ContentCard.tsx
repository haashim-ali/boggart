import { useState, useCallback } from 'react';
import type { GeneratedContent, MediaStatus } from '@boggart/shared';
import { VideoGenerationPoller } from './VideoGenerationPoller';

interface Props {
  content: GeneratedContent;
}

function ImageDisplay({ status }: { status: MediaStatus }) {
  if (status.status === 'completed') {
    return (
      <div className="media-cell" style={{ aspectRatio: '16 / 10', marginBottom: '0.75rem' }}>
        <img
          src={status.url}
          alt="Generated visual"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
        />
      </div>
    );
  }
  if (status.status === 'failed') {
    return (
      <p style={{
        fontSize: '0.85rem',
        color: 'rgba(244,67,54,0.6)',
        fontWeight: 300,
        marginBottom: '0.75rem',
      }}>
        Image generation failed: {status.error}
      </p>
    );
  }
  return null;
}

function VideoDisplay({ status, contentId }: { status: MediaStatus; contentId: string }) {
  const [current, setCurrent] = useState(status);

  const handleComplete = useCallback((updated: MediaStatus) => {
    setCurrent(updated);
  }, []);

  if (current.status === 'completed') {
    return (
      <div className="media-cell" style={{ marginTop: '0.75rem' }}>
        <video
          src={current.url}
          controls
          style={{ width: '100%', borderRadius: '12px' }}
        />
      </div>
    );
  }
  if (current.status === 'generating') {
    return <VideoGenerationPoller contentId={contentId} onComplete={handleComplete} />;
  }
  if (current.status === 'failed') {
    return (
      <p style={{
        fontSize: '0.85rem',
        color: 'rgba(244,67,54,0.6)',
        fontWeight: 300,
        marginTop: '0.75rem',
      }}>
        Video generation failed: {current.error}
      </p>
    );
  }
  return null;
}

export function ContentCard({ content }: Props) {
  const { goal, strategy, visual, copy, videoScript } = content;

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', fontStyle: 'italic' }}>{goal}</h3>

      {/* Strategy */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Strategy</h4>
        <p style={{
          marginBottom: '0.75rem',
          color: 'rgba(255,255,255,0.65)',
          fontWeight: 300,
          lineHeight: 1.7,
        }}>{strategy.persuasionApproach}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {strategy.emotionalHooks.map((hook) => (
            <span key={hook} className="pill">{hook}</span>
          ))}
        </div>
        {strategy.personalReferences.length > 0 && (
          <p style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 300,
            marginBottom: '0.5rem',
            fontStyle: 'italic',
          }}>
            Refs: {strategy.personalReferences.join(', ')}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="pill">{strategy.tone}</span>
          <span style={{
            color: 'var(--accent-light)',
            fontWeight: 400,
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
          }}>
            {strategy.callToAction}
          </span>
        </div>
      </div>

      {/* Visual */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Visual Concept</h4>
        <ImageDisplay status={visual.generatedImage} />
        <p style={{
          marginBottom: '0.5rem',
          color: 'rgba(255,255,255,0.65)',
          fontWeight: 300,
          lineHeight: 1.7,
        }}>{visual.description}</p>
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.35)',
          fontWeight: 300,
          marginBottom: '0.75rem',
          fontStyle: 'italic',
        }}>Style: {visual.style}</p>
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}>
          {visual.colorPalette.map((color) => (
            <div
              key={color}
              title={color}
              className="color-swatch"
              style={{ background: color }}
            />
          ))}
        </div>
        <pre>{visual.imagePrompt}</pre>
      </div>

      {/* Copy */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Copy</h4>
        <p style={{
          fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          marginBottom: '0.75rem',
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.3,
        }}>{copy.headline}</p>
        <p style={{
          marginBottom: '0.75rem',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 300,
          lineHeight: 1.7,
        }}>{copy.body}</p>
        {copy.personalHooks.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {copy.personalHooks.map((hook) => (
              <span key={hook} className="pill pill-accent">{hook}</span>
            ))}
          </div>
        )}
      </div>

      {/* Video Script */}
      <div className="card">
        <h4 style={{ marginBottom: '0.75rem' }}>Video Script</h4>
        <span className="pill" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
          {videoScript.duration}
        </span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          marginBottom: '0.75rem',
        }}>
          {videoScript.shots.map((shot, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '0.85rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontWeight: 400,
                marginBottom: '0.25rem',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
              }}>{shot.description}</p>
              <span style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 300,
              }}>
                {shot.duration} &middot; {shot.movement}
              </span>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.35)',
          fontWeight: 300,
          fontStyle: 'italic',
        }}>
          Mood: {videoScript.mood} &middot; Music: {videoScript.music}
        </p>
        <VideoDisplay status={videoScript.generatedVideo} contentId={content.id} />
      </div>
    </div>
  );
}
