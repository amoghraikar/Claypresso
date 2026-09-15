import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  badgeCount?: number;
  variant?: 'ghost' | 'solid';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  badgeCount,
  variant = 'ghost',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.iconButton} ${variant === 'solid' ? styles.solid : ''} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
      {typeof badgeCount === 'number' && badgeCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};
