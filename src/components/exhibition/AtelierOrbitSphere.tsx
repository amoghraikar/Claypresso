'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CategoryInfo } from '@/types/product';
import { useDossier } from '@/context/DossierContext';
import { soundEngine } from '@/utils/audioFx';
import { Volume2, VolumeX } from 'lucide-react';
import styles from './AtelierOrbitSphere.module.css';

interface AtelierOrbitSphereProps {
  products: Product[];
  categories: CategoryInfo[];
}

export const AtelierOrbitSphere: React.FC<AtelierOrbitSphereProps> = ({ products, categories }) => {
  const { openDossier } = useDossier();

  // State
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [clockTime, setClockTime] = useState<string>('00:00:00');

  // 3D Orbit Physics
  const [rotX, setRotX] = useState<number>(-12);
  const [rotY, setRotY] = useState<number>(30);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const rotRef = useRef({ rotX: -12, rotY: 30, velX: 0, velY: 0, lastX: 0, lastY: 0, lastClickTime: 0 });
  const animFrameRef = useRef<number | null>(null);

  // 1. Live Bangalore atelier clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClockTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Filter products
  const filteredProducts = useMemo(() => {
    if (activeCategorySlug === 'all') return products;
    return products.filter((p) => {
      const slug = p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return slug === activeCategorySlug || p.category.toLowerCase().includes(activeCategorySlug.toLowerCase());
    });
  }, [products, activeCategorySlug]);

  // 3. 3D Inertial Orbit Animation Loop
  useEffect(() => {
    let active = true;

    const orbitLoop = () => {
      if (!active) return;
      const state = rotRef.current;

      if (!isDragging) {
        state.velX *= 0.94;
        state.velY *= 0.94;

        // Gentle constant idle drift
        state.rotY += 0.08 + state.velX * 0.25;
        state.rotX -= state.velY * 0.25;

        // Clamp vertical tilt
        state.rotX = Math.max(-60, Math.min(60, state.rotX));

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
  }, [isDragging]);

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
    rotRef.current.rotX = Math.max(-60, Math.min(60, rotRef.current.rotX));

    rotRef.current.lastX = clientX;
    rotRef.current.lastY = clientY;

    setRotX(rotRef.current.rotX);
    setRotY(rotRef.current.rotY);

    const now = Date.now();
    if (now - rotRef.current.lastClickTime > 90) {
      soundEngine.playCeramicClick(600 + Math.abs(deltaX) * 12, 0.025);
      rotRef.current.lastClickTime = now;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.4, prev - e.deltaY * 0.001)));
  };

  // 4. Fibonacci Sphere Calculation with Depth-of-Field 3D matrix projection
  const nodes = useMemo(() => {
    const list = filteredProducts;
    const N = list.length;
    const baseRadius = 340;

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    return list.map((product, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = Math.round(baseRadius * Math.sin(phi) * Math.cos(theta));
      const y = Math.round(baseRadius * Math.cos(phi));
      const z = Math.round(baseRadius * Math.sin(phi) * Math.sin(theta));

      const z1 = -x * sinY + z * cosY;
      const zDepth = y * sinX + z1 * cosX;

      const depthRatio = zDepth / baseRadius;
      const isFront = depthRatio > 0;
      const scale = isFront ? 1.0 + depthRatio * 0.22 : 0.85 + depthRatio * 0.12;
      const opacity = isFront ? 1.0 : Math.max(0.4, 0.75 + depthRatio * 0.35);
      const blur = isFront ? 0 : Math.min(1.8, Math.abs(depthRatio) * 1.5);
      const zIndex = Math.round(zDepth + 600);

      return { product, x, y, z, index: i, scale, opacity, blur, zIndex };
    });
  }, [filteredProducts, rotX, rotY]);

  const toggleSound = () => {
    const next = soundEngine.toggleSound();
    setSoundOn(next);
  };

  return (
    <section className={styles.exhibitionSection} id="atelier-exhibition" aria-label="3D Atelier Exhibition">
      <div className={styles.atmosphereGlow} />
      <div className={styles.gridOverlay} />

      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.telemetryRow}>
            <div className="telemetry-pill">
              <span className="telemetry-dot" />
              <span>BLR ATELIER // LIVE // {clockTime}</span>
            </div>
            <span className="sticker-badge">3D INTERACTIVE</span>
          </div>

          <h2 className={styles.sectionTitle}>The Atelier Orbit</h2>
          <p className={styles.sectionSubtitle}>
            Grab, drag and rotate to explore our hand-sculpted pieces in three dimensions. Click any creation to inspect details or claim it.
          </p>
        </div>

        {/* Category Filters */}
        <div className={styles.filterPills}>
          <button
            className={`${styles.filterPill} ${activeCategorySlug === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => {
              setActiveCategorySlug('all');
              soundEngine.playPop();
            }}
          >
            <span>ALL PIECES ({products.length})</span>
          </button>

          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.name).length;
            return (
              <button
                key={c.slug}
                className={`${styles.filterPill} ${activeCategorySlug === c.slug ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setActiveCategorySlug(c.slug);
                  soundEngine.playPop();
                }}
              >
                <span>{c.name.toUpperCase()} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* 3D Orbit Stage */}
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
          onWheel={handleWheel}
        >
          <div className={styles.scene}>
            <div
              className={styles.world}
              style={{
                transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              }}
            >
              {/* Concentric Wire Rings */}
              <div className={`${styles.wireRing} ${styles.wireEquator}`} />
              <div className={`${styles.wireRing} ${styles.wireMeridian}`} />

              {/* Floating Center Studio Seal */}
              <div className={styles.centerEmblem}>
                <div className={styles.emblemText}>Claypresso</div>
                <div className={styles.emblemSub}>EST. 2026 • BLR</div>
              </div>

              {/* Orbiting 3D Nodes with Depth-of-Field */}
              {nodes.map(({ product, x, y, z, scale, opacity, blur, zIndex }) => (
                <div
                  key={product.id}
                  className={styles.node}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-rotY}deg) rotateX(${-rotX}deg) scale(${scale})`,
                    opacity,
                    filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    zIndex,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDossier(product, filteredProducts);
                  }}
                  onMouseEnter={() => soundEngine.playCeramicClick(720, 0.02)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${product.name}`}
                >
                  <div className={styles.nodeCard}>
                    {/* Reticle Crop Accents */}
                    <div className={`${styles.nodeReticle} ${styles.reticleTL}`} />
                    <div className={`${styles.nodeReticle} ${styles.reticleTR}`} />
                    <div className={`${styles.nodeReticle} ${styles.reticleBL}`} />
                    <div className={`${styles.nodeReticle} ${styles.reticleBR}`} />

                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={120}
                      height={120}
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

          {/* Stage Controls */}
          <div className={styles.stageControls}>
            <div className={styles.stageHint}>
              <span>✦ DRAG OR TOUCH TO ORBIT • CLICK TO INSPECT</span>
            </div>

            <div className={styles.zoomButtonGroup}>
              <button
                className={styles.zoomBtn}
                onClick={toggleSound}
                title={soundOn ? 'Mute atelier sound' : 'Enable ceramic audio FX'}
                aria-label="Toggle sound"
              >
                {soundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </button>
              <button
                className={styles.zoomBtn}
                onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                className={styles.zoomBtn}
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
                aria-label="Zoom out"
              >
                −
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
