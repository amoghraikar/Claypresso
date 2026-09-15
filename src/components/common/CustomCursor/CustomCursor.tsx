'use client';

import React, { useEffect, useRef } from 'react';
import { useMouse } from '@/context/MouseContext';
import styles from './CustomCursor.module.css';

export const CustomCursor: React.FC = () => {
  const { cursorVariant, cursorText, isPressed, isTouch, isReducedMotion } = useMouse();

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trail0Ref = useRef<HTMLDivElement>(null);
  const trail1Ref = useRef<HTMLDivElement>(null);
  const trail2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch || isReducedMotion || typeof window === 'undefined') return;

    let targetX = -100;
    let targetY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let t0X = -100;
    let t0Y = -100;
    let t1X = -100;
    let t1Y = -100;
    let t2X = -100;
    let t2Y = -100;

    let speed = 0;
    let lastMoveTime = Date.now();
    let isMoving = false;
    let isVisible = false;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastMoveTime = Date.now();
      isMoving = true;
      if (!isVisible) {
        isVisible = true;
        dotX = targetX;
        dotY = targetY;
        ringX = targetX;
        ringY = targetY;
        t0X = targetX;
        t0Y = targetY;
        t1X = targetX;
        t1Y = targetY;
        t2X = targetX;
        t2Y = targetY;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    let rafId: number;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      const now = Date.now();
      if (now - lastMoveTime > 120) {
        isMoving = false;
      }

      const dx = targetX - dotX;
      const dy = targetY - dotY;
      speed = Math.sqrt(dx * dx + dy * dy);

      // Spring / Inertia factors
      dotX = lerp(dotX, targetX, 0.45);
      dotY = lerp(dotY, targetY, 0.45);

      ringX = lerp(ringX, targetX, 0.2);
      ringY = lerp(ringY, targetY, 0.2);

      // Micro trail with staggered follow
      t0X = lerp(t0X, ringX, 0.28);
      t0Y = lerp(t0Y, ringY, 0.28);

      t1X = lerp(t1X, t0X, 0.22);
      t1Y = lerp(t1Y, t0Y, 0.22);

      t2X = lerp(t2X, t1X, 0.16);
      t2Y = lerp(t2Y, t1Y, 0.16);

      const opacity = isVisible && targetX > 0 ? 1 : 0;
      const trailOpacity = isMoving && speed > 2.5 && isVisible ? Math.min(0.55, speed / 15) : 0;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
        dotRef.current.style.opacity = cursorVariant === 'product' || cursorVariant === 'hidden' ? '0' : String(opacity);
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        ringRef.current.style.opacity = cursorVariant === 'hidden' ? '0' : String(opacity);
      }

      // Restrained micro-trail: fades to 0 when stationary
      if (trail0Ref.current) {
        trail0Ref.current.style.transform = `translate3d(${t0X}px, ${t0Y}px, 0)`;
        trail0Ref.current.style.opacity = cursorVariant === 'product' ? '0' : String(trailOpacity * 0.7);
      }
      if (trail1Ref.current) {
        trail1Ref.current.style.transform = `translate3d(${t1X}px, ${t1Y}px, 0)`;
        trail1Ref.current.style.opacity = cursorVariant === 'product' ? '0' : String(trailOpacity * 0.5);
      }
      if (trail2Ref.current) {
        trail2Ref.current.style.transform = `translate3d(${t2X}px, ${t2Y}px, 0)`;
        trail2Ref.current.style.opacity = cursorVariant === 'product' ? '0' : String(trailOpacity * 0.35);
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
      {/* Restrained Micro-Trail (Section 11) */}
      <div ref={trail2Ref} className={`${styles.trailParticle} ${styles.trail2}`} />
      <div ref={trail1Ref} className={`${styles.trailParticle} ${styles.trail1}`} />
      <div ref={trail0Ref} className={`${styles.trailParticle} ${styles.trail0}`} />

      {/* Inertial Soft Outer Ring */}
      <div
        ref={ringRef}
        className={`${styles.cursorRing} ${variantClass} ${isPressed ? styles.pressed : ''}`}
      >
        {cursorVariant === 'product' && (
          <span className={styles.cursorLabel}>{cursorText || 'VIEW'}</span>
        )}
      </div>

      {/* Direct Soft Center Dot */}
      <div ref={dotRef} className={styles.cursorDot} />
    </div>
  );
};
