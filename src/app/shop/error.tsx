'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { AlertCircle } from 'lucide-react';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Shop catalog error:', error);
  }, [error]);

  return (
    <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--color-cream)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            color: 'var(--color-terracotta)',
          }}
        >
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>
          Something went wrong while loading the shop.
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Please give it another try, or return to our homepage.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" size="md" href="/">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
