import React from 'react';
import Link from 'next/link';
import { Magnetic } from '@/components/common/Motion';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  magnetic?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  target,
  rel,
  icon,
  iconPosition = 'right',
  magnetic = true,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className={`${styles.icon} magnetic-arrow`}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className={`${styles.icon} magnetic-arrow`}>{icon}</span>}
    </>
  );

  const buttonEl = href ? (
    <Link
      href={href}
      className={buttonClasses}
      role="button"
      target={target}
      rel={rel}
      data-cursor="button"
    >
      {content}
    </Link>
  ) : (
    <button className={buttonClasses} data-cursor="button" {...props}>
      {content}
    </button>
  );

  if (magnetic && !fullWidth) {
    return (
      <Magnetic maxOffset={11} arrowOffset={6}>
        {buttonEl}
      </Magnetic>
    );
  }

  return buttonEl;
};

