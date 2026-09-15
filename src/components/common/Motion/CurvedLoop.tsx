'use client';

import React, { useRef, useEffect, useId, useState, useCallback } from 'react';
import { useMouse } from '@/context/MouseContext';
import styles from './CurvedLoop.module.css';

export interface CurvedLoopProps {
  text?: string;
  speed?: number; // Base pixels per second (default: 50) or multiplier if <= 5
  direction?: 'left' | 'right';
  ribbon?: boolean; // If true, draws clay/washi ribbon under the text
  ribbonColor?: string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const CurvedLoop: React.FC<CurvedLoopProps> = ({
  text = '✦ HANDMADE IN BANGALORE • SMALL-BATCH CLAY CHARMS • 100% OVEN-BAKED • MEANT TO BE YOURS • BESPOKE COMMISSIONS • TACTILE CERAMIC FINISH • ',
  speed = 50,
  direction = 'left',
  ribbon = true,
  ribbonColor,
  height,
  className = '',
  style = {},
}) => {
  const id = useId().replace(/:/g, '');
  const pathId = `curved-loop-path-${id}`;
  const textPathRef = useRef<SVGTextPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isTouch, isReducedMotion, velocity } = useMouse();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const offsetRef = useRef<number>(0);
  const dragStartX = useRef<number>(0);
  const dragStartOffset = useRef<number>(0);
  const rafId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Repeat text so the loop has continuous density along the 3000px path
  const repeatedText = `${text} ${text} ${text} ${text} `;

  // Smooth RAF loop
  const updateLoop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    if (!isDragging && !isReducedMotion) {
      // Dynamic speed multiplier: faster on hover, responds slightly to mouse velocity
      const baseSpeed = speed <= 5 ? speed * 50 : speed;
      let currentSpeed = baseSpeed;
      if (isHovered) {
        currentSpeed *= 1.4;
      }
      const speedBoost = Math.min(Math.abs(velocity.x) * 0.1, 2);
      currentSpeed += speedBoost * 10;

      const dirMultiplier = direction === 'left' ? -1 : 1;
      offsetRef.current += dirMultiplier * currentSpeed * delta;

      // Wrap smoothly around 2000px cycle
      const loopWidth = 2000;
      if (offsetRef.current < -loopWidth) {
        offsetRef.current += loopWidth;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= loopWidth;
      }

      if (textPathRef.current) {
        textPathRef.current.setAttribute('startOffset', `${offsetRef.current.toFixed(1)}px`);
      }
    }

    rafId.current = requestAnimationFrame(updateLoop);
  }, [speed, direction, isHovered, isDragging, isReducedMotion, velocity.x]);

  useEffect(() => {
    rafId.current = requestAnimationFrame(updateLoop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [updateLoop]);

  // Touch & Mouse Drag to interactively scrub the loop
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX.current;
    offsetRef.current = dragStartOffset.current + diff * 1.5;
    if (textPathRef.current) {
      textPathRef.current.setAttribute('startOffset', `${offsetRef.current.toFixed(1)}px`);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Organic S-curve path spanning across 3200px for seamless repetition
  const pathD = `
    M -600 70
    C -200 15, 200 125, 600 70
    C 1000 15, 1400 125, 1800 70
    C 2200 15, 2600 125, 3000 70
    C 3400 15, 3800 125, 4200 70
  `;

  return (
    <div
      ref={containerRef}
      className={`${styles.curvedLoopWrapper} ${className}`}
      style={height ? { height, ...style } : style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label={text}
      role="marquee"
    >
      <svg
        className={styles.curvedSvg}
        viewBox="0 0 1800 140"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id={pathId} d={pathD} />
        </defs>

        {/* Optional clay/washi undulating ribbon background */}
        {ribbon && (
          <path
            d={pathD}
            className={styles.ribbonPath}
            style={ribbonColor ? { stroke: ribbonColor } : undefined}
          />
        )}

        {/* Continuously animated flowing text */}
        <text className={styles.curvedText}>
          <textPath
            ref={textPathRef}
            href={`#${pathId}`}
            startOffset="0px"
          >
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export interface CurvedCircularBadgeProps {
  text?: string;
  centerIcon?: React.ReactNode;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CurvedCircularBadge: React.FC<CurvedCircularBadgeProps> = ({
  text = '✦ CLAYPRESSO STUDIO ✦ BANGALORE 560038 ✦ EST 2026 ✦',
  centerIcon = '✦',
  size = 120,
  className = '',
  style = {},
}) => {
  const id = useId().replace(/:/g, '');
  const circleId = `badge-circle-path-${id}`;

  return (
    <div
      className={`${styles.badgeContainer} ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        className={styles.badgeSvg}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular path counter-clockwise for natural reading */}
          <path
            id={circleId}
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>

        <text className={styles.badgeText}>
          <textPath href={`#${circleId}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Central Tactile Clay Icon / Seal */}
      <div className={styles.badgeCenterIcon}>
        {centerIcon}
      </div>
    </div>
  );
};
