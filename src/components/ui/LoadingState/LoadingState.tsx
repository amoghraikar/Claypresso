import React from 'react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Crafting with care...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        minHeight: '260px',
        gap: 'var(--space-4)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '32px',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-blush)',
            display: 'inline-block',
            animation: 'clayDotSquish 1000ms var(--ease-clay-squish) infinite',
            animationDelay: '0ms',
          }}
        />
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '45% 55% 50% 50%',
            backgroundColor: 'var(--color-warm-brown)',
            display: 'inline-block',
            animation: 'clayDotSquish 1000ms var(--ease-clay-squish) infinite',
            animationDelay: '150ms',
          }}
        />
        <span
          style={{
            width: '11px',
            height: '11px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-peach)',
            display: 'inline-block',
            animation: 'clayDotSquish 1000ms var(--ease-clay-squish) infinite',
            animationDelay: '300ms',
          }}
        />
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
        {message}
      </p>
    </div>
  );
};
