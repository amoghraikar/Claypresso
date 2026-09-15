'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import styles from './ShopCatalog.module.css';

export interface ActiveFilterItem {
  key: string;
  label: string;
}

export interface ActiveFilterChipsProps {
  filters: ActiveFilterItem[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={styles.activeChipsBar} aria-label="Active Filters">
      <span className={styles.activeChipsLabel}>Active:</span>
      <div className={styles.activeChipsList}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={styles.chip}
            onClick={() => onRemove(item.key)}
            aria-label={`Remove ${item.label} filter`}
          >
            <span>{item.label}</span>
            <X size={13} className={styles.chipCloseIcon} />
          </button>
        ))}

        <button
          type="button"
          className={styles.clearAllBtn}
          onClick={onClearAll}
          aria-label="Clear all active filters"
        >
          <RotateCcw size={12} />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};
