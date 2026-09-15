'use client';

import React, { useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { CategoryInfo } from '@/types/product';
import { CollectionInfo } from '@/services/productService';
import styles from './ShopCatalog.module.css';

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  collections: CollectionInfo[];
  selectedCategory: string;
  selectedCollection: string;
  selectedPrice: string;
  selectedAvailability: string;
  selectedProductType: string;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  resultCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  selectedPrice,
  selectedAvailability,
  selectedProductType,
  onFilterChange,
  onClearAll,
  resultCount,
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose} aria-modal="true" role="dialog">
      <div
        className={styles.drawerSheet}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleRow}>
            <SlidersHorizontal size={18} color="var(--color-terracotta)" />
            <span className={styles.drawerTitle}>FILTERS</span>
          </div>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close filter drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className={styles.drawerBody}>
          {/* 1. Category Section */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionHeading}>Category</h4>
            <div className={styles.drawerOptionGrid}>
              <button
                type="button"
                className={`${styles.drawerOptionBtn} ${!selectedCategory || selectedCategory === 'all' ? styles.drawerOptionBtnActive : ''}`}
                onClick={() => onFilterChange('category', 'all')}
              >
                <span>All Categories</span>
                {(!selectedCategory || selectedCategory === 'all') && <Check size={14} />}
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.drawerOptionBtn} ${isActive ? styles.drawerOptionBtnActive : ''}`}
                    onClick={() => onFilterChange('category', cat.slug)}
                  >
                    <span>{cat.name}</span>
                    <span className={styles.drawerOptionCount}>{cat.itemCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Collection Section */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionHeading}>Collections</h4>
            <div className={styles.drawerOptionGrid}>
              {collections.map((col) => {
                const isActive = selectedCollection.toLowerCase() === col.id.toLowerCase();
                return (
                  <button
                    key={col.id}
                    type="button"
                    className={`${styles.drawerOptionBtn} ${isActive ? styles.drawerOptionBtnActive : ''}`}
                    onClick={() => onFilterChange('collection', isActive ? '' : col.id)}
                  >
                    <span>{col.name}</span>
                    <span className={styles.drawerOptionCount}>{col.itemCount}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Price Section */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionHeading}>Price</h4>
            <div className={styles.drawerOptionGrid}>
              {[
                { id: 'under-100', label: 'Under ₹100' },
                { id: '100-250', label: '₹100 – ₹250' },
                { id: '250-500', label: '₹250 – ₹500' },
                { id: 'above-500', label: 'Above ₹500' },
              ].map((p) => {
                const isActive = selectedPrice === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.drawerOptionBtn} ${isActive ? styles.drawerOptionBtnActive : ''}`}
                    onClick={() => onFilterChange('price', isActive ? '' : p.id)}
                  >
                    <span>{p.label}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Availability Section */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionHeading}>Availability</h4>
            <div className={styles.drawerOptionGrid}>
              {[
                { id: 'in-stock', label: 'In Stock' },
                { id: 'low-stock', label: 'Low Stock' },
                { id: 'made-to-order', label: 'Made to Order' },
              ].map((a) => {
                const isActive = selectedAvailability === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.drawerOptionBtn} ${isActive ? styles.drawerOptionBtnActive : ''}`}
                    onClick={() => onFilterChange('availability', isActive ? '' : a.id)}
                  >
                    <span>{a.label}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Product Type Section */}
          <div className={styles.drawerSection}>
            <h4 className={styles.drawerSectionHeading}>Product Type</h4>
            <div className={styles.drawerOptionGrid}>
              {[
                { id: 'ready-made', label: 'Ready Made (Ships in ~4 days)' },
                { id: 'made-to-order', label: 'Made to Order (Handmade for you)' },
              ].map((t) => {
                const isActive = selectedProductType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.drawerOptionBtn} ${isActive ? styles.drawerOptionBtnActive : ''}`}
                    onClick={() => onFilterChange('productType', isActive ? '' : t.id)}
                  >
                    <span>{t.label}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.drawerClearBtn}
            onClick={onClearAll}
          >
            <RotateCcw size={14} />
            <span>CLEAR</span>
          </button>

          <button
            type="button"
            className={styles.drawerApplyBtn}
            onClick={onClose}
          >
            SHOW {resultCount} RESULTS
          </button>
        </div>
      </div>
    </div>
  );
};
