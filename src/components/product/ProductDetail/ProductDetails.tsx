'use client';

import React from 'react';
import { Product } from '@/types/product';
import styles from './ProductDetail.module.css';

export interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <section className={styles.editorialSection} aria-labelledby="details-heading">
      <h2 id="details-heading" className={styles.editorialHeading}>
        THE LITTLE DETAILS
      </h2>

      <div className={styles.editorialGrid}>
        {/* Story & Crafting Note */}
        <div className={styles.editorialStoryCard}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: 0, color: 'var(--color-espresso)' }}>
            Behind The Sculpt
          </h3>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {product.description}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warm-brown)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Hand-formed without commercial silicone molds
            </span>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Because each piece is sculpted individually from raw polymer clay, slight organic variations in shade, curvature, and facial expression are celebration markers of human craftsmanship.
            </p>
          </div>
        </div>

        {/* Specifications & Care */}
        <div className={styles.editorialSpecsCard}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: 0, color: 'var(--color-espresso)' }}>
            Specifications & Care
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'var(--space-2)' }}>
            {product.material && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Material</span>
                <span className={styles.specValue}>{product.material}</span>
              </div>
            )}

            {product.dimensions && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Dimensions</span>
                <span className={styles.specValue}>{product.dimensions}</span>
              </div>
            )}

            {product.weightGrams !== undefined && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Approx. Weight</span>
                <span className={styles.specValue}>~{product.weightGrams}g</span>
              </div>
            )}

            {product.productionType && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Production Method</span>
                <span className={styles.specValue}>
                  {product.productionType === 'MADE_TO_ORDER'
                    ? 'Hand-crafted upon order'
                    : product.productionType === 'CUSTOM'
                    ? 'Bespoke custom commission'
                    : 'Studio ready-made'}
                </span>
              </div>
            )}

            {product.productionTime && (
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Studio Time</span>
                <span className={styles.specValue}>{product.productionTime}</span>
              </div>
            )}

            <div className={styles.specRow}>
              <span className={styles.specLabel}>Care Instructions</span>
              <span className={styles.specValue} style={{ maxWidth: '60%' }}>
                Gently wipe with soft damp cloth. Keep away from solvent chemicals and excessive water immersion.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
