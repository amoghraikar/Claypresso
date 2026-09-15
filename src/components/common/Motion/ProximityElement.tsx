'use client';

import React, { useRef, useEffect } from 'react';
import { useMouse } from '@/context/MouseContext';

export interface ProximityElementProps {
  children: React.ReactNode;
  threshold?: number; // Distance in px to start reacting (default: 130px)
  maxDisplacement?: number; // Max push distance in px (default: 12px)
  rotate?: boolean; // If true, adds tiny rotation (up to 8deg)
  className?: string;
  style?: React.CSSProperties;
}

export const ProximityElement: React.FC<ProximityElementProps> = ({
  children,
  threshold = 130,
  maxDisplacement = 12,
  rotate = false,
  className = '',
  style = {},
}) => {
  const { pos, velocity, isTouch, isReducedMotion } = useMouse();
  const speed = velocity.speed;
  const elRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef({ x: 0, y: 0, rot: 0 });
  const targetRef = useRef({ x: 0, y: 0, rot: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTouch || isReducedMotion) return;

    const update = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      current.rot += (target.rot - current.rot) * 0.1;

      if (elRef.current) {
        let transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
        if (rotate) {
          transform += ` rotate(${current.rot.toFixed(2)}deg)`;
        }
        elRef.current.style.transform = transform;
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, isReducedMotion, rotate]);

  // Proximity calculation when mouse pos or speed updates
  useEffect(() => {
    if (isTouch || isReducedMotion) return;
    const el = elRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < threshold && dist > 0) {
      // Repulsion factor (1 at center, 0 at threshold edge)
      const factor = (1 - dist / threshold);
      // Incorporate slight velocity boost if fast moving
      const speedBoost = Math.min(1 + speed * 0.2, 1.5);
      const push = factor * maxDisplacement * speedBoost;

      // Push away from cursor
      const angle = Math.atan2(dy, dx);
      targetRef.current = {
        x: -Math.cos(angle) * push,
        y: -Math.sin(angle) * push,
        rot: rotate ? (dx > 0 ? -1 : 1) * factor * 10 : 0,
      };
    } else {
      // Settle back to origin
      targetRef.current = { x: 0, y: 0, rot: 0 };
    }
  }, [pos.x, pos.y, speed, threshold, maxDisplacement, rotate, isTouch, isReducedMotion]);

  return (
    <div
      ref={elRef}
      className={className}
      style={{
        willChange: 'transform',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
