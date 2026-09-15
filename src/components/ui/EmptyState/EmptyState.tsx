import React from 'react';
import { Button } from '@/components/ui/Button/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        maxWidth: '540px',
        margin: '0 auto',
      }}
    >
      {icon && <div style={{ marginBottom: 'var(--space-4)', color: 'var(--color-warm-brown)' }}>{icon}</div>}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-h3)',
          color: 'var(--color-espresso)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-body)',
          marginBottom: actionLabel ? 'var(--space-6)' : '0',
          maxWidth: '400px',
        }}
      >
        {description}
      </p>
      {actionLabel && (
        <Button
          variant="primary"
          href={actionHref}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
