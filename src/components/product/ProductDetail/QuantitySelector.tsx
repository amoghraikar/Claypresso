'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './ProductDetail.module.css';

export interface QuantitySelectorProps {
  quantity: number;
  maxStock?: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxStock,
  onChange,
  disabled = false,
}) => {
  const isMin = quantity <= 1;
  const isMax = maxStock !== undefined && quantity >= maxStock;

  const handleDecrease = () => {
    if (!isMin && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!isMax && !disabled) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className={styles.quantityControl} aria-label="Product quantity selector">
      <button
        type="button"
        className={styles.qtyBtn}
        onClick={handleDecrease}
        disabled={isMin || disabled}
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>

      <span className={styles.qtyValue} aria-live="polite" aria-label={`Quantity ${quantity}`}>
        {quantity}
      </span>

      <button
        type="button"
        className={styles.qtyBtn}
        onClick={handleIncrease}
        disabled={isMax || disabled}
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  );
};
