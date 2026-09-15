'use client';

import React from 'react';
import styles from './ShopCatalog.module.css';

export const ProductSkeletonGrid: React.FC = () => {
  return (
    <div className={styles.productGrid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonDetails}>
            <div className={styles.skeletonCategory} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta}>
              <div className={styles.skeletonPrice} />
              <div className={styles.skeletonNote} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
