import React from 'react';
import { BadgeType, ProductStatus } from '@/types/product';
import styles from './Badge.module.css';

export interface BadgeProps {
  type?: BadgeType;
  status?: ProductStatus;
  label?: string;
  stock?: number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, status, label, stock, className = '' }) => {
  if (status === 'OUT_OF_STOCK' || type === 'out-of-stock') {
    return <span className={`${styles.badge} ${styles.outOfStock} ${className}`}>{label || 'Out of Stock'}</span>;
  }

  if (type === 'bestseller') {
    return <span className={`${styles.badge} ${styles.bestseller} ${className}`}>{label || 'Bestseller'}</span>;
  }

  if (type === 'new') {
    return <span className={`${styles.badge} ${styles.new} ${className}`}>{label || 'New Drop'}</span>;
  }

  if (type === 'low-stock' || status === 'LOW_STOCK') {
    const stockLabel = stock !== undefined && stock > 0 ? `Only ${stock} left` : 'Low Stock';
    return <span className={`${styles.badge} ${styles.lowStock} ${className}`}>{label || stockLabel}</span>;
  }

  if (type === 'made-to-order') {
    return <span className={`${styles.badge} ${styles.madeToOrder} ${className}`}>{label || 'Made to Order'}</span>;
  }

  return <span className={`${styles.badge} ${styles.new} ${className}`}>{label}</span>;
};
