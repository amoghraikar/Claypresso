'use client';

import React from 'react';
import { Truck, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { Product, BUSINESS_RULES } from '@/types/product';
import { useCart } from '@/context/CartContext';
import styles from './ProductDetail.module.css';

export interface ShippingInfoProps {
  product: Product;
}

export const ShippingInfo: React.FC<ShippingInfoProps> = ({ product }) => {
  const { subtotal, freeShippingRemaining, hasFreeShipping } = useCart();
  const threshold = BUSINESS_RULES.freeShippingThreshold;

  const percent = Math.min(Math.round((subtotal / threshold) * 100), 100);

  return (
    <div className={styles.shippingBox}>
      {/* 1. Production & Dispatch Timeline */}
      {product.productionType === 'CUSTOM' ? (
        <div className={styles.shippingItem}>
          <Clock size={18} className={styles.shippingItemIcon} />
          <div className={styles.shippingItemText}>
            <strong>Hand-Sculpted Custom Commission</strong>
            <small>
              Custom production typically takes ~{BUSINESS_RULES.transitDaysCustom} days, followed by ~{BUSINESS_RULES.transitDaysReadyMade} days shipping across India.
            </small>
          </div>
        </div>
      ) : product.productionType === 'MADE_TO_ORDER' ? (
        <div className={styles.shippingItem}>
          <Clock size={18} className={styles.shippingItemIcon} />
          <div className={styles.shippingItemText}>
            <strong>Made After You Order</strong>
            <small>
              Production time: {product.productionTime || '3–5 days handmade'}. Then ~{BUSINESS_RULES.transitDaysReadyMade} days tracked shipping across India.
            </small>
          </div>
        </div>
      ) : (
        <div className={styles.shippingItem}>
          <Truck size={18} className={styles.shippingItemIcon} />
          <div className={styles.shippingItemText}>
            <strong>Ready to Ship from Bangalore</strong>
            <small>
              Dispatches within 24–48 hours. Typical delivery is ~{BUSINESS_RULES.transitDaysReadyMade} business days across India.
            </small>
          </div>
        </div>
      )}

      {/* 2. Authentic Handmade Guarantee */}
      <div className={styles.shippingItem}>
        <ShieldCheck size={18} className={styles.shippingItemIcon} />
        <div className={styles.shippingItemText}>
          <strong>Authentic Studio Craft</strong>
          <small>
            Individually molded, hand-detailed, baked, and UV resin-sealed in Bangalore, India.
          </small>
        </div>
      </div>

      {/* 3. Dynamic Free Shipping Progress toward ₹500 */}
      <div className={styles.freeShippingProgress}>
        <div className={styles.freeShippingLabel}>
          <span>
            {hasFreeShipping ? (
              <span style={{ color: '#2F6F4E', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} /> FREE SHIPPING UNLOCKED
              </span>
            ) : (
              <span>
                {BUSINESS_RULES.currency}{freeShippingRemaining} away from Free Shipping
              </span>
            )}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>Orders ₹{threshold}+</span>
        </div>

        <div className={styles.freeShippingTrack} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`${styles.freeShippingFill} ${hasFreeShipping ? styles.freeShippingUnlocked : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
