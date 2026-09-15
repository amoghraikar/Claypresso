import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'default',
  children,
  className = '',
  style,
  ...props
}) => {
  const maxWidth = size === 'narrow' ? '1080px' : size === 'wide' ? '1600px' : 'var(--max-width)';

  return (
    <div
      className={`container ${className}`}
      style={{ maxWidth, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};
