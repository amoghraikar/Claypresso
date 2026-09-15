'use client';

import React, { useRef, useEffect } from 'react';
import { useMouse } from '@/context/MouseContext';

export interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // In pixels translation (default: 8px)
  tilt?: boolean; // If true, adds subtle 3D tilt (3-5deg)
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 10,
  tilt = false,
  className = '',
  style = {},
}) => {
  const { normPos, isTouch, isReducedMotion } = useMouse();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouch || isReducedMotion) return;

    const el = layerRef.current;
    if (!el) return;

    let rafId: number;
    let currentX = 0;
    let currentY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const targetX = normPos.x * speed;
    const targetY = normPos.y * speed;
    const targetRotX = tilt ? -normPos.y * 4 : 0;
    const targetRotY = tilt ? normPos.x * 4 : 0;

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const update = () => {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);

      let transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (tilt) {
        currentRotX = lerp(currentRotX, targetRotX, 0.12);
        currentRotY = lerp(currentRotY, targetRotY, 0.12);
        transform = `perspective(900px) translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      }

      el.style.transform = transform;
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [normPos.x, normPos.y, speed, tilt, isTouch, isReducedMotion]);

  return (
    <div
      ref={layerRef}
      className={className}
      style={{
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
