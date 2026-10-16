'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useDossier } from '@/context/DossierContext';
import { ParallaxLayer } from '@/components/common/Motion';
import { soundEngine } from '@/utils/audioFx';
import { Orbit, Image as ImageIcon, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import styles from './HeroShowcase.module.css';

interface HeroShowcaseProps {
  products: Product[];
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ products }) => {
  const { openDossier } = useDossier();

  // Mode: 'orbit' (3D sphere interactive) or 'still' (classic editorial scrapbook parallax)
  const [activeMode, setActiveMode] = useState<'orbit' | 'still'>('orbit');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3D Orbit Physics
  const [rotX, setRotX] = useState<number>(-12);
  const [rotY, setRotY] = useState<number>(30);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const rotRef = useRef({ rotX: -12, rotY: 30, velX: 0, velY: 0, lastX: 0, lastY: 0, lastClickTime: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Toggle Sound FX
  const toggleSound = () => {
    const next = soundEngine.toggleSound();
    setSoundOn(next);
  };

  // Filter products by category tab
  const categoryProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => {
      const cat = p.category.toLowerCase();
      if (activeCategory === 'keychains') return cat.includes('keychain') || cat.includes('couple');
      if (activeCategory === 'charms') return cat.includes('charm') || cat.includes('bag') || cat.includes('mini');
      if (activeCategory === 'decor') return cat.includes('decor') || cat.includes('tray') || cat.includes('desk');
      return cat.includes(activeCategory);
    });
  }, [products, activeCategory]);

  // Inertial continuous auto-rotation loop
  useEffect(() => {
    let active = true;

    const orbitLoop = () => {
      if (!active) return;
      const state = rotRef.current;

      if (!isDragging && activeMode === 'orbit') {
        state.velX *= 0.94;
        state.velY *= 0.94;

        // Gentle constant idle drift
        state.rotY += 0.08 + state.velX * 0.25;
        state.rotX -= state.velY * 0.25;

        // Clamp vertical tilt
        state.rotX = Math.max(-55, Math.min(55, state.rotX));

        setRotX(state.rotX);
        setRotY(state.rotY);
      }

      animFrameRef.current = requestAnimationFrame(orbitLoop);
    };

    animFrameRef.current = requestAnimationFrame(orbitLoop);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging, activeMode]);

  // Pointer Drag Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    rotRef.current.lastX = clientX;
    rotRef.current.lastY = clientY;
    rotRef.current.velX = 0;
    rotRef.current.velY = 0;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - rotRef.current.lastX;
    const deltaY = clientY - rotRef.current.lastY;

    rotRef.current.velX = deltaX;
    rotRef.current.velY = deltaY;

    rotRef.current.rotY += deltaX * 0.35;
    rotRef.current.rotX -= deltaY * 0.35;
    rotRef.current.rotX = Math.max(-55, Math.min(55, rotRef.current.rotX));

    rotRef.current.lastX = clientX;
    rotRef.current.lastY = clientY;

    setRotX(rotRef.current.rotX);
    setRotY(rotRef.current.rotY);

    // Audio feedback: soft ceramic click on dragging (throttled)
    const now = Date.now();
    if (now - rotRef.current.lastClickTime > 90) {
      soundEngine.playCeramicClick(580 + Math.abs(deltaX) * 15, 0.025);
      rotRef.current.lastClickTime = now;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Keyboard escape for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Fibonacci Sphere coordinates calculation (radius tuned for hero stage)
  const sphereProducts = useMemo(() => {
    return categoryProducts.slice(0, 12);
  }, [categoryProducts]);

  const baseRadius = isFullscreen ? 260 : 210;

  const nodes = useMemo(() => {
    const list = sphereProducts;
    const N = list.length;

    // Use stable initial angles during SSR to guarantee identical markup
    const currentRotX = isMounted ? rotX : -12;
    const currentRotY = isMounted ? rotY : 30;

    // Convert angles to radians for Depth-of-Field 3D matrix projection
    const radX = (currentRotX * Math.PI) / 180;
    const radY = (currentRotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    return list.map((product, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      // Truncate to integers to prevent floating-point boundary rounding flips
      const x = Math.trunc(baseRadius * Math.sin(phi) * Math.cos(theta));
      const y = Math.trunc(baseRadius * Math.cos(phi));
      const z = Math.trunc(baseRadius * Math.sin(phi) * Math.sin(theta));

      // Calculate projected camera-space Z depth for real 3D depth-of-field
      // 1. Rotate around Y:
      const z1 = -x * sinY + z * cosY;
      // 2. Rotate around X:
      const zDepth = y * sinX + z1 * cosX;

      // Depth-of-Field visual calculations
      const depthRatio = zDepth / baseRadius; // Range approx -1 to 1
      const isFront = depthRatio > 0;
      const scale = isFront ? 1.0 + depthRatio * 0.22 : 0.85 + depthRatio * 0.12;
      const opacity = isFront ? 1 : Math.max(0.4, 0.75 + depthRatio * 0.35);
      const blur = isFront ? 0 : Math.min(1.8, Math.abs(depthRatio) * 1.5);
      const zIndex = Math.round(zDepth + 600);

      return { product, x, y, z, index: i, zDepth, scale, opacity, blur, zIndex };
    });
  }, [sphereProducts, baseRadius, rotX, rotY, isMounted]);

  // Category switch handler with sound
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    soundEngine.playPop();
  };

  return (
    <>
      <div className={styles.showcaseWrapper} aria-label="Claypresso Hero Atelier Showcase">
        {/* Mode Switcher & Tools Row */}
        <div className={styles.modeSwitcherRow}>
          <div className={styles.modeSwitchGroup} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'orbit'}
              className={`${styles.modeBtn} ${activeMode === 'orbit' ? styles.modeBtnActive : ''}`}
              onClick={() => {
                setActiveMode('orbit');
                soundEngine.playPop();
              }}
            >
              <Orbit size={12} />
              <span>3D ORBIT</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'still'}
              className={`${styles.modeBtn} ${activeMode === 'still' ? styles.modeBtnActive : ''}`}
              onClick={() => {
                setActiveMode('still');
                soundEngine.playPop();
              }}
            >
              <ImageIcon size={12} />
              <span>ATELIER STILL</span>
            </button>
          </div>

          {/* Micro Tools: Sound Toggle & Fullscreen Exhibition */}
          <div className={styles.controlGroup}>
            <button
              type="button"
              className={`${styles.toolBtn} ${soundOn ? styles.toolBtnActive : ''}`}
              onClick={toggleSound}
              title={soundOn ? 'Mute atelier sound' : 'Enable ceramic audio FX'}
              aria-label="Toggle atelier audio"
            >
              {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>

            {activeMode === 'orbit' && (
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => {
                  setIsFullscreen(true);
                  soundEngine.playPop();
                }}
                title="Fullscreen Atelier Exhibition"
                aria-label="Fullscreen 3D orbit"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Active in 3D Orbit Mode) */}
        {activeMode === 'orbit' && (
          <div className={styles.categoryFilterBar} role="tablist" aria-label="Filter 3D orbit pieces">
            {[
              { id: 'all', label: 'ALL PIECES' },
              { id: 'keychains', label: 'KEYCHAINS' },
              { id: 'charms', label: 'CHARMS' },
              { id: 'decor', label: 'STUDIO DECOR' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.id}
                className={`${styles.categoryPill} ${activeCategory === tab.id ? styles.categoryPillActive : ''}`}
                onClick={() => handleCategoryChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Showcase Stage */}
        <div className={styles.cardFrame}>
          {activeMode === 'orbit' ? (
            /* 3D Orbit Interactive Stage with Depth-of-Field Focal Tracking */
            <div
              className={styles.orbitStage}
              data-cursor="drag"
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handlePointerUp}
            >
              <div className={styles.scene}>
                <div
                  className={styles.world}
                  style={{
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                  }}
                >
                  {/* Concentric Wire Rings */}
                  <div className={`${styles.wireRing} ${styles.wireEquator}`} />
                  <div className={`${styles.wireRing} ${styles.wireMeridian}`} />

                  {/* Center Studio Emblem */}
                  <div className={styles.centerEmblem}>
                    <div className={styles.emblemText}>Claypresso</div>
                    <div className={styles.emblemSub}>EST. 2026 • BLR</div>
                  </div>

                  {/* Orbiting Fibonacci Nodes with Real 3D Depth-of-Field */}
                  {nodes.map(({ product, x, y, z, scale, opacity, blur, zIndex }) => (
                    <div
                      key={product.id}
                      className={styles.node}
                      suppressHydrationWarning
                      style={{
                        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-rotY}deg) rotateX(${-rotX}deg) scale(${scale})`,
                        opacity,
                        filter: blur > 0 ? `blur(${blur}px)` : 'none',
                        zIndex,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDossier(product, categoryProducts);
                      }}
                      onMouseEnter={() => soundEngine.playCeramicClick(720, 0.02)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect ${product.name}`}
                    >
                      <div className={styles.nodeCard}>
                        {/* Corner crop reticles */}
                        <span className={`${styles.nodeReticle} ${styles.reticleTL}`} />
                        <span className={`${styles.nodeReticle} ${styles.reticleTR}`} />
                        <span className={`${styles.nodeReticle} ${styles.reticleBL}`} />
                        <span className={`${styles.nodeReticle} ${styles.reticleBR}`} />

                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={92}
                          height={92}
                          className={styles.nodeImage}
                        />

                        <div className={styles.nodeOverlay}>
                          <div className={styles.nodeTitle}>{product.name}</div>
                          <div className={styles.nodePrice}>₹{product.price}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Classic Still Scrapbook Multi-Depth Parallax */
            <>
              <ParallaxLayer speed={10} tilt={true} style={{ width: '100%', height: '100%' }}>
                <div className={`${styles.heroMainCard} marching-ants-frame has-reticle`}>
                  <span className="corner-reticle corner-reticle-tl" />
                  <span className="corner-reticle corner-reticle-tr" />
                  <span className="corner-reticle corner-reticle-bl" />
                  <span className="corner-reticle corner-reticle-br" />
                  <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
                  <div className={styles.heroImageFrame}>
                    <Image
                      src="/images/products/puzzle-couple-keychain-sq.jpg"
                      alt="Handcrafted Claypresso Pink Puzzle Piece couple keychain in hand"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 480px"
                      quality={85}
                      className={styles.catImage}
                    />
                  </div>

                  <div className={styles.heroStamp} aria-hidden="true">
                    <span>Claypresso</span>
                    <span>Est. 2026 • BLR</span>
                  </div>
                </div>
              </ParallaxLayer>

              {/* Floating Clay Accent Tile */}
              <ParallaxLayer speed={-8} style={{ position: 'absolute', bottom: '16px', left: '-24px', zIndex: 5 }}>
                <div className={styles.heroFloatingAccentCard}>
                  <div
                    className="washi-tape washi-tape-top-right washi-tape-sage"
                    style={{ width: 46, height: 14, top: -7, right: 10 }}
                    aria-hidden="true"
                  />
                  <div className={styles.heroAccentImageFrame}>
                    <Image
                      src="/images/products/frog-avocado-trio-sq.jpg"
                      alt="Pond frog and avocado companion charm detail"
                      fill
                      priority
                      sizes="150px"
                      quality={85}
                      className={styles.catImage}
                    />
                  </div>
                </div>
              </ParallaxLayer>

              {/* Floating Studio Badge */}
              <ParallaxLayer speed={12} style={{ position: 'absolute', top: '16px', right: '-18px', zIndex: 6 }}>
                <div className={styles.heroFloatingBadge}>
                  <div className={styles.badgeLogoWrap}>
                    <Image
                      src="/images/logo-badge.png"
                      alt="Claypresso Official Badge"
                      fill
                      sizes="44px"
                      quality={85}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-espresso)', lineHeight: 1.2 }}>
                      Claypresso Studio
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', lineHeight: 1.3, marginTop: 2 }}>
                      Handmade with love • Bangalore
                    </div>
                  </div>
                </div>
              </ParallaxLayer>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Atelier Exhibition Lightbox Mode */}
      {isFullscreen && (
        <div className={styles.fullscreenModal} role="dialog" aria-modal="true" aria-label="Fullscreen 3D Exhibition">
          <div className={styles.fullscreenTopBar}>
            <div className="telemetry-pill">
              <span className="telemetry-dot" />
              <span>CLAYPRESSO ATELIER // 3D EXHIBITION // 2026</span>
            </div>

            <button
              type="button"
              className={styles.exitFullscreenBtn}
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 size={13} />
              <span>EXIT EXHIBITION [ESC]</span>
            </button>
          </div>

          <div
            className={styles.fullscreenStage}
            data-cursor="drag"
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handlePointerUp}
          >
            <div className={styles.scene}>
              <div
                className={styles.world}
                style={{
                  transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                }}
              >
                <div className={`${styles.wireRing} ${styles.wireEquator}`} style={{ width: 560, height: 560, marginLeft: -280, marginTop: -280 }} />
                <div className={`${styles.wireRing} ${styles.wireMeridian}`} style={{ width: 560, height: 560, marginLeft: -280, marginTop: -280 }} />

                <div className={styles.centerEmblem} style={{ width: 96, height: 96, marginLeft: -48, marginTop: -48 }}>
                  <div className={styles.emblemText} style={{ fontSize: 12 }}>Claypresso</div>
                  <div className={styles.emblemSub}>EST. 2026 • BLR</div>
                </div>

                {nodes.map(({ product, x, y, z, scale, opacity, blur, zIndex }) => (
                  <div
                    key={product.id}
                    className={styles.node}
                    suppressHydrationWarning
                    style={{
                      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-rotY}deg) rotateX(${-rotX}deg) scale(${scale * 1.15})`,
                      opacity,
                      filter: blur > 0 ? `blur(${blur}px)` : 'none',
                      zIndex,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDossier(product, categoryProducts);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${product.name}`}
                  >
                    <div className={styles.nodeCard}>
                      <span className={`${styles.nodeReticle} ${styles.reticleTL}`} />
                      <span className={`${styles.nodeReticle} ${styles.reticleTR}`} />
                      <span className={`${styles.nodeReticle} ${styles.reticleBL}`} />
                      <span className={`${styles.nodeReticle} ${styles.reticleBR}`} />

                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={100}
                        height={100}
                        className={styles.nodeImage}
                      />

                      <div className={styles.nodeOverlay}>
                        <div className={styles.nodeTitle}>{product.name}</div>
                        <div className={styles.nodePrice}>₹{product.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
