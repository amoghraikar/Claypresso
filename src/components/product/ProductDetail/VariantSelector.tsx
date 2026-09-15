'use client';

import React from 'react';
import { ProductVariant, BUSINESS_RULES } from '@/types/product';
import styles from './ProductDetail.module.css';

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
  error?: string | null;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  error,
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className={styles.variantSection} role="group" aria-labelledby="variant-selector-label">
      <div className={styles.variantLabel}>
        <span id="variant-selector-label">
          Options: <strong>{selectedVariant ? selectedVariant.name : 'Please select'}</strong>
        </span>
        {error && <span style={{ color: '#E05A47', fontSize: '12px' }}>{error}</span>}
      </div>

      <div className={styles.variantGrid}>
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isOutOfStock = v.stock !== undefined && v.stock <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              className={`${styles.variantChip} ${isSelected ? styles.variantChipActive : ''}`}
              onClick={() => onSelectVariant(v)}
              aria-pressed={isSelected}
              aria-disabled={isOutOfStock}
            >
              <span>{v.name}</span>
              {v.priceDelta && v.priceDelta !== 0 && (
                <span style={{ fontSize: '11px', opacity: 0.85 }}>
                  ({v.priceDelta > 0 ? '+' : ''}
                  {BUSINESS_RULES.currency}
                  {v.priceDelta})
                </span>
              )}
              {isOutOfStock && <span style={{ fontSize: '10px' }}>(Out of stock)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
