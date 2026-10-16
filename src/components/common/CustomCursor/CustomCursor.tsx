'use client';

import React, { useEffect, useRef } from 'react';
import { useMouse } from '@/context/MouseContext';
import styles from './CustomCursor.module.css';

export const CustomCursor: React.FC = () => {
  const { cursorVariant, cursorText, isPressed, isTouch, isReducedMotion } = useMouse();

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch || isReducedMotion || typeof window === 'undefined') return;

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = targetX;
        ringY = targetY;
      }

      // 1:1 Instant follow for the center dot (Zero sluggish lag)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        dotRef.current.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    let rafId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      // Fluid, natural spring damping for outer halo
      ringX = lerp(ringX, targetX, 0.24);
      ringY = lerp(ringY, targetY, 0.24);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        ringRef.current.style.opacity = isVisible && targetX > 0 && cursorVariant !== 'hidden' ? '1' : '0';
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isTouch, isReducedMotion, cursorVariant]);

  if (isTouch || isReducedMotion) {
    return null;
  }

  const variantClass =
    cursorVariant === 'link'
      ? styles.linkVariant
      : cursorVariant === 'button'
      ? styles.buttonVariant
      : cursorVariant === 'product'
      ? styles.productVariant
      : cursorVariant === 'drag'
      ? styles.dragVariant
      : '';

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      {/* Outer Fluid Halo */}
      <div
        ref={ringRef}
        className={`${styles.cursorRing} ${variantClass} ${isPressed ? styles.pressed : ''}`}
      >
        {cursorVariant === 'product' && (
          <span className={styles.cursorLabel}>{cursorText || '✦'}</span>
        )}
      </div>

      {/* Direct Precision Dot (Instant 1:1, Zero Lag) */}
      <div ref={dotRef} className={styles.cursorDot} />
    </div>
  );
};
