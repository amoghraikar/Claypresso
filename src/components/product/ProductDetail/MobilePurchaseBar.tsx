'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, BUSINESS_RULES } from '@/types/product';
import styles from './ProductDetail.module.css';

export interface MobilePurchaseBarProps {
  product: Product;
  targetRef: React.RefObject<HTMLElement | null>;
  onTriggerAddToCart: () => void;
  price: number;
}

export const MobilePurchaseBar: React.FC<MobilePurchaseBarProps> = ({
  product,
  targetRef,
  onTriggerAddToCart,
  price,
}) => {
  const [visible, setVisible] = useState(false);

  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isCustom = product.productionType === 'CUSTOM';

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main purchase CTA is NOT intersecting (scrolled away), show the mobile bar
        setVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [targetRef]);

  return (
    <div
      className={`${styles.mobileStickyBar} ${!visible ? styles.mobileStickyBarHidden : ''}`}
      aria-hidden={!visible}
    >
      <div className={styles.stickyInfo}>
        <span className={styles.stickyName}>{product.name}</span>
        <span className={styles.stickyPrice}>
          {BUSINESS_RULES.currency}{price}
        </span>
      </div>

      {isCustom ? (
        <Link href="/custom" className={styles.stickyCtaBtn}>
          <span>Custom Request</span> <ArrowRight size={13} style={{ display: 'inline', marginLeft: 4 }} />
        </Link>
      ) : (
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onTriggerAddToCart}
          className={styles.stickyCtaBtn}
          aria-label={isOutOfStock ? 'Product out of stock' : `Add ${product.name} to cart`}
        >
          {isOutOfStock ? (
            'Out of Stock'
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShoppingBag size={14} /> Add to Cart
            </span>
          )}
        </button>
      )}
    </div>
  );
};
