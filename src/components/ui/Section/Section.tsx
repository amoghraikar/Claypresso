import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'ivory' | 'cream' | 'espresso';
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'ivory',
  className = '',
  style,
  ...props
}) => {
  const bgMap = {
    ivory: 'var(--color-bg-primary)',
    cream: 'var(--color-bg-surface)',
    espresso: 'var(--color-espresso)',
  };

  const colorMap = {
    ivory: 'var(--color-text-primary)',
    cream: 'var(--color-text-primary)',
    espresso: 'var(--color-ivory)',
  };

  return (
    <section
      className={`section ${className}`}
      style={{
        backgroundColor: bgMap[variant],
        color: colorMap[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </section>
  );
};
