'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useMouse } from '@/context/MouseContext';

export interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // 0.1 to 0.5
  maxOffset?: number; // In pixels (default: 10px)
  arrowOffset?: number; // Extra offset for nested arrows (default: 6px)
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.28,
  maxOffset = 10,
  arrowOffset = 6,
  className = '',
  style = {},
  as: Component = 'div',
}) => {
  const { isTouch, isReducedMotion } = useMouse();
  const elementRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isTouch || isReducedMotion) return;

    const el = elementRef.current;
    if (!el) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate pull towards cursor
      const pullX = deltaX * strength;
      const pullY = deltaY * strength;

      targetX = Math.max(-maxOffset, Math.min(maxOffset, pullX));
      targetY = Math.max(-maxOffset, Math.min(maxOffset, pullY));
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      setIsHovered(false);
    };

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const animate = () => {
      // Spring follow: fast response, soft settle
      currentX = lerp(currentX, targetX, isHovered ? 0.24 : 0.16);
      currentY = lerp(currentY, targetY, isHovered ? 0.24 : 0.16);

      if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
        el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

        // Independent arrow response (Section 14)
        const arrow = el.querySelector('.magnetic-arrow') as HTMLElement | null;
        if (arrow) {
          const arrowX = currentX * (1 + arrowOffset / maxOffset);
          const arrowY = currentY * (1 + arrowOffset / maxOffset);
          arrow.style.transform = `translate3d(${arrowX.toFixed(2)}px, ${arrowY.toFixed(2)}px, 0)`;
        }
      } else if (!isHovered && (currentX !== 0 || currentY !== 0)) {
        currentX = 0;
        currentY = 0;
        el.style.transform = 'translate3d(0, 0, 0)';
        const arrow = el.querySelector('.magnetic-arrow') as HTMLElement | null;
        if (arrow) arrow.style.transform = 'translate3d(0, 0, 0)';
      }

      rafId = requestAnimationFrame(animate);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (el) el.style.transform = 'translate3d(0, 0, 0)';
    };
  }, [isTouch, isReducedMotion, strength, maxOffset, arrowOffset, isHovered]);

  return (
    <Component
      ref={elementRef}
      className={className}
      style={{
        display: 'inline-block',
        willChange: 'transform',
        transition: isHovered ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.85, 0.25, 1)',
        ...style,
      }}
    >
      {children}
    </Component>
  );
};
