'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export type CursorVariant = 'default' | 'link' | 'button' | 'product' | 'text' | 'drag' | 'hidden';

export interface MousePosition {
  x: number;
  y: number;
}

export interface MouseVelocity {
  x: number;
  y: number;
  speed: number;
}

interface MouseContextValue {
  pos: MousePosition;
  normPos: MousePosition; // -1 to 1 relative to window center
  velocity: MouseVelocity;
  cursorVariant: CursorVariant;
  cursorText: string;
  isHovered: boolean;
  isPressed: boolean;
  isTouch: boolean;
  isReducedMotion: boolean;
  setCursor: (variant: CursorVariant, text?: string) => void;
  resetCursor: () => void;
}

const MouseContext = createContext<MouseContextValue>({
  pos: { x: -100, y: -100 },
  normPos: { x: 0, y: 0 },
  velocity: { x: 0, y: 0, speed: 0 },
  cursorVariant: 'default',
  cursorText: '',
  isHovered: false,
  isPressed: false,
  isTouch: false,
  isReducedMotion: false,
  setCursor: () => {},
  resetCursor: () => {},
});

export const useMouse = () => useContext(MouseContext);

export const MouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default');
  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Position & velocity stored in refs for zero-lag RAF loop
  const posRef = useRef<MousePosition>({ x: -100, y: -100 });
  const normPosRef = useRef<MousePosition>({ x: 0, y: 0 });
  const velocityRef = useRef<MouseVelocity>({ x: 0, y: 0, speed: 0 });
  const lastPosRef = useRef<MousePosition>({ x: -100, y: -100 });
  const lastTimeRef = useRef<number>(Date.now());

  // Exposed state (updated periodically or on key frame for hooks)
  const [pos, setPos] = useState<MousePosition>({ x: -100, y: -100 });
  const [normPos, setNormPos] = useState<MousePosition>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<MouseVelocity>({ x: 0, y: 0, speed: 0 });

  const setCursor = useCallback((variant: CursorVariant, text: string = '') => {
    setCursorVariant(variant);
    setCursorText(text);
    setIsHovered(variant !== 'default' && variant !== 'hidden');
  }, []);

  const resetCursor = useCallback(() => {
    setCursorVariant('default');
    setCursorText('');
    setIsHovered(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect touch / coarse pointer
    const touchMedia = window.matchMedia('(pointer: coarse)');
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsTouch(touchMedia.matches || 'ontouchstart' in window);
    setIsReducedMotion(motionMedia.matches);

    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);

    touchMedia.addEventListener('change', handleTouchChange);
    motionMedia.addEventListener('change', handleMotionChange);

    // If touch or reduced motion, skip expensive pointer tracking
    if (touchMedia.matches) {
      return () => {
        touchMedia.removeEventListener('change', handleTouchChange);
        motionMedia.removeEventListener('change', handleMotionChange);
      };
    }

    let rafId: number;

    const handlePointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      normPosRef.current = {
        x: Math.max(-1, Math.min(1, (e.clientX - halfW) / halfW)),
        y: Math.max(-1, Math.min(1, (e.clientY - halfH) / halfH)),
      };

      // Auto-detect interactive elements using event delegation
      const target = e.target as HTMLElement | null;
      if (target) {
        const productEl = target.closest('[data-cursor="product"]');
        const buttonEl = target.closest('[data-cursor="button"], button, .btn, [role="button"]');
        const linkEl = target.closest('[data-cursor="link"], a');
        const textEl = target.closest('[data-cursor="text"]');
        const dragEl = target.closest('[data-cursor="drag"]');
        const explicitCursor = target.closest('[data-cursor]');

        if (productEl) {
          const customText = productEl.getAttribute('data-cursor-text') || 'VIEW';
          setCursor('product', customText);
        } else if (explicitCursor && explicitCursor.getAttribute('data-cursor') === 'link') {
          setCursor('link');
        } else if (dragEl) {
          setCursor('drag');
        } else if (buttonEl) {
          setCursor('button');
        } else if (linkEl) {
          setCursor('link');
        } else if (textEl) {
          setCursor('text');
        } else {
          resetCursor();
        }
      }
    };

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);
    const handleMouseLeave = () => {
      posRef.current = { x: -100, y: -100 };
      setCursor('hidden');
    };
    const handleMouseEnter = () => resetCursor();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth RAF loop to compute velocity and update exposed positions
    const updateLoop = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastTimeRef.current);

      const dx = posRef.current.x - lastPosRef.current.x;
      const dy = posRef.current.y - lastPosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy) / (dt / 16.6);

      velocityRef.current = {
        x: dx / (dt / 16.6),
        y: dy / (dt / 16.6),
        speed: Math.min(speed, 50),
      };

      lastPosRef.current = { ...posRef.current };
      lastTimeRef.current = now;

      setPos({ ...posRef.current });
      setNormPos({ ...normPosRef.current });
      setVelocity({ ...velocityRef.current });

      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      touchMedia.removeEventListener('change', handleTouchChange);
      motionMedia.removeEventListener('change', handleMotionChange);
    };
  }, [setCursor, resetCursor]);

  return (
    <MouseContext.Provider
      value={{
        pos,
        normPos,
        velocity,
        cursorVariant,
        cursorText,
        isHovered,
        isPressed,
        isTouch,
        isReducedMotion,
        setCursor,
        resetCursor,
      }}
    >
      {children}
    </MouseContext.Provider>
  );
};
