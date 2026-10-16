'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { Button } from '@/components/ui/Button/Button';
import { soundEngine } from '@/utils/audioFx';
import { LayoutGrid, GalleryHorizontal, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import styles from './BestsellerShowcase.module.css';

interface BestsellerShowcaseProps {
  products: Product[];
}

export const BestsellerShowcase: React.FC<BestsellerShowcaseProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => {
      const cat = p.category.toLowerCase();
      if (activeCategory === 'keychains') return cat.includes('keychain') || cat.includes('couple');
      if (activeCategory === 'charms') return cat.includes('charm') || cat.includes('bag') || cat.includes('mini');
      if (activeCategory === 'decor') return cat.includes('decor') || cat.includes('tray') || cat.includes('desk');
      return cat.includes(activeCategory);
    });
  }, [products, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    soundEngine.playPop();
  };

  const handleViewChange = (mode: 'grid' | 'carousel') => {
    setViewMode(mode);
    soundEngine.playPop();
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    soundEngine.playCeramicClick(680, 0.02);
  };

  return (
    <div className={styles.sectionWrapper} aria-label="People Love These - Bestseller Showcase">
      {/* Section Header */}
      <div className={styles.headerRow}>
        <span className={styles.pretitle}>Most Loved Pieces</span>
        <h2 className={styles.title}>People Love These</h2>
        <p className={styles.subtitle}>
          Little handmade favourites sculpted in Bangalore that keep finding their way into carts.
        </p>
      </div>

      {/* Toolbar: Category Filters & View Switcher */}
      <div className={styles.toolbarRow}>
        {/* Category Pills */}
        <div className={styles.filterTabs} role="tablist" aria-label="Filter bestsellers">
          {[
            { id: 'all', label: `ALL (${products.length})` },
            { id: 'keychains', label: 'KEYCHAINS' },
            { id: 'charms', label: 'CHARMS' },
            { id: 'decor', label: 'STUDIO DECOR' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === tab.id}
              className={`${styles.filterTab} ${activeCategory === tab.id ? styles.filterTabActive : ''}`}
              onClick={() => handleCategoryChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Controls: 4-Grid vs Carousel */}
        <div className={styles.viewControls}>
          <div className={styles.viewSwitchGroup} role="tablist" aria-label="Layout mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => handleViewChange('grid')}
              title="Compact 4-column grid layout"
            >
              <LayoutGrid size={12} />
              <span>GRID</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'carousel'}
              className={`${styles.viewBtn} ${viewMode === 'carousel' ? styles.viewBtnActive : ''}`}
              onClick={() => handleViewChange('carousel')}
              title="Horizontal carousel tray"
            >
              <GalleryHorizontal size={12} />
              <span>CAROUSEL</span>
            </button>
          </div>

          {/* Carousel Arrow Controls (Visible in Carousel Mode) */}
          {viewMode === 'carousel' && (
            <div className={styles.carouselNavBtns}>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Compact Grid or Horizontal Carousel */}
      {viewMode === 'grid' ? (
        <div className={styles.compactGrid}>
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className={styles.compactCardWrap}>
              <ProductCard product={product} priority={idx < 4} />
            </div>
          ))}
        </div>
      ) : (
        <div ref={carouselRef} className={styles.carouselTray}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.carouselItem}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className={styles.ctaRow}>
        <Button variant="secondary" size="md" href="/shop?filter=bestseller" icon={<ArrowRight size={15} />}>
          View All Bestsellers
        </Button>
      </div>
    </div>
  );
};
