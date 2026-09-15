import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

export default function ProductNotFound() {
  return (
    <div className="section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <div
          style={{
            width: 72,
            height: 72,
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
          <Sparkles size={32} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-espresso)', marginBottom: 'var(--space-2)' }}>
          Piece Not Found
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
          This handcrafted piece may have returned to the studio oven or the link might be out of date. Explore our current catalog of charms, keychains, and trinkets!
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="md" href="/shop" icon={<ArrowLeft size={16} />}>
            Back to Shop
          </Button>
          <Button variant="secondary" size="md" href="/custom">
            Request Custom Piece
          </Button>
        </div>
      </div>
    </div>
  );
}
