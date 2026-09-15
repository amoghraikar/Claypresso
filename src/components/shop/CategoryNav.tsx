'use client';

import React, { useRef } from 'react';
import { CategoryInfo } from '@/types/product';
import styles from './ShopCatalog.module.css';

export interface CategoryNavProps {
  categories: CategoryInfo[];
  activeCategory: string;
  totalAllCount: number;
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  totalAllCount,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAll = !activeCategory || activeCategory === 'all';

  return (
    <nav className={styles.categoryNavWrapper} aria-label="Product Categories">
      <div className={styles.categoryScrollTrack} ref={scrollRef}>
        {/* All Products Pill */}
        <button
          type="button"
          className={`${styles.categoryPill} ${isAll ? styles.categoryPillActive : ''}`}
          onClick={() => onSelectCategory('all')}
          aria-pressed={isAll}
        >
          <span>All Products</span>
          <span className={styles.pillCount}>{totalAllCount}</span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ''}`}
              onClick={() => onSelectCategory(cat.slug)}
              aria-pressed={isActive}
            >
              <span>{cat.name}</span>
              <span className={styles.pillCount}>{cat.itemCount}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
