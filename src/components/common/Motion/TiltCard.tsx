'use client';

import React, { useRef, useEffect } from 'react';
import { useMouse } from '@/context/MouseContext';

export interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number; // In degrees (default: 3.5deg)
  imageFollow?: number; // In pixels (default: 6px)
  className?: string;
  style?: React.CSSProperties;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 3.5,
  imageFollow = 6,
  className = '',
  style = {},
}) => {
  const { isTouch, isReducedMotion } = useMouse();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch || isReducedMotion) return;

    const card = cardRef.current;
    if (!card) return;

    let rafId: number;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let targetImgX = 0;
    let targetImgY = 0;
    let targetShadowX = 0;
    let targetShadowY = 0;

    let curTiltX = 0;
    let curTiltY = 0;
    let curImgX = 0;
    let curImgY = 0;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates from -1 to 1
      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      // Card 3D tilt: mouse top tilts up (positive rotateX), mouse right tilts right (positive rotateY)
      targetTiltX = -normY * maxTilt;
      targetTiltY = normX * maxTilt;

      // Image follow: shifts with cursor
      targetImgX = normX * imageFollow;
      targetImgY = normY * imageFollow;

      // Dynamic shadow shifts opposite to cursor
      targetShadowX = -normX * 8;
      targetShadowY = 8 - normY * 6;

      isHovering = true;
    };

    const onMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
      targetImgX = 0;
      targetImgY = 0;
      targetShadowX = 0;
      targetShadowY = 8;
      isHovering = false;
    };

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const loop = () => {
      const easeFactor = isHovering ? 0.2 : 0.12;

      curTiltX = lerp(curTiltX, targetTiltX, easeFactor);
      curTiltY = lerp(curTiltY, targetTiltY, easeFactor);
      curImgX = lerp(curImgX, targetImgX, easeFactor);
      curImgY = lerp(curImgY, targetImgY, easeFactor);

      if (Math.abs(curTiltX - targetTiltX) > 0.02 || Math.abs(curTiltY - targetTiltY) > 0.02 || isHovering) {
        card.style.transform = `perspective(800px) rotateX(${curTiltX.toFixed(2)}deg) rotateY(${curTiltY.toFixed(2)}deg)`;
        card.style.boxShadow = `${targetShadowX.toFixed(1)}px ${targetShadowY.toFixed(1)}px 24px rgba(62, 42, 31, 0.10)`;

        // Image follow (Section 8)
        const image = card.querySelector('.tilt-image-follow') as HTMLElement | null;
        if (image) {
          image.style.transform = `scale(1.05) translate3d(${curImgX.toFixed(2)}px, ${curImgY.toFixed(2)}px, 0)`;
        }
      } else if (!isHovering) {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
        card.style.boxShadow = '';
        const image = card.querySelector('.tilt-image-follow') as HTMLElement | null;
        if (image) {
          image.style.transform = '';
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
      if (card) {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    };
  }, [isTouch, isReducedMotion, maxTilt, imageFollow]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow',
        transition: 'transform 0.4s var(--ease-clay-settle), box-shadow 0.4s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
