'use client';

import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import styles from './ProductDetail.module.css';

export interface RelatedProductsProps {
  products: Product[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedSection} aria-labelledby="related-heading">
      <div className={styles.relatedHeader}>
        <h2 id="related-heading" className={styles.relatedHeading}>
          YOU MAY ALSO LIKE
        </h2>
        <p className={styles.relatedSubheading}>
          Handmade companion pieces sculpted in the same studio spirit.
        </p>
      </div>

      <div className={styles.relatedGrid}>
        {products.slice(0, 4).map((p, idx) => (
          <div
            key={p.id}
            style={{
              animation: `clayFadeUp 500ms var(--ease-clay-settle) ${Math.min(idx * 60, 300)}ms both`,
            }}
          >
            <ProductCard product={p} priority={false} />
          </div>
        ))}
      </div>
    </section>
  );
};
