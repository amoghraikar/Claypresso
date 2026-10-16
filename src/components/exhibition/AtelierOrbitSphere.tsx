'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CategoryInfo } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, ArrowLeft, X, Sparkles, Check, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './AtelierOrbitSphere.module.css';

interface AtelierOrbitSphereProps {
  products: Product[];
  categories: CategoryInfo[];
}

export const AtelierOrbitSphere: React.FC<AtelierOrbitSphereProps> = ({ products, categories }) => {
  const { addToCart } = useCart();

  // State
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [clockTime, setClockTime] = useState<string>('00:00:00');

  // 3D Orbit Physics
  const [rotX, setRotX] = useState<number>(-12);
  const [rotY, setRotY] = useState<number>(30);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const rotRef = useRef({ rotX: -12, rotY: 30, velX: 0, velY: 0, lastX: 0, lastY: 0 });
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
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.4, prev - e.deltaY * 0.001)));
  };

  // 4. Fibonacci Sphere Calculation
  const nodes = useMemo(() => {
    const list = filteredProducts;
    const N = list.length;
    const baseRadius = 340;

    return list.map((product, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = Math.round(baseRadius * Math.sin(phi) * Math.cos(theta));
      const y = Math.round(baseRadius * Math.cos(phi));
      const z = Math.round(baseRadius * Math.sin(phi) * Math.sin(theta));

      return { product, x, y, z, index: i };
    });
  }, [filteredProducts]);

  // Dossier Navigation
  const handlePrevProduct = () => {
    if (!selectedProduct) return;
    const curr = filteredProducts.findIndex((p) => p.id === selectedProduct.id);
    const prev = (curr - 1 + filteredProducts.length) % filteredProducts.length;
    setSelectedProduct(filteredProducts[prev]);
  };

  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const curr = filteredProducts.findIndex((p) => p.id === selectedProduct.id);
    const next = (curr + 1) % filteredProducts.length;
    setSelectedProduct(filteredProducts[next]);
  };

  const handleBuy = (product: Product) => {
    addToCart(product, 1, undefined, null, true);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null);
      if (e.key === 'ArrowLeft') handlePrevProduct();
      if (e.key === 'ArrowRight') handleNextProduct();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, filteredProducts]);

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
            onClick={() => setActiveCategorySlug('all')}
          >
            <span>ALL PIECES ({products.length})</span>
          </button>

          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.name).length;
            return (
              <button
                key={c.slug}
                className={`${styles.filterPill} ${activeCategorySlug === c.slug ? styles.filterPillActive : ''}`}
                onClick={() => setActiveCategorySlug(c.slug)}
              >
                <span>{c.name.toUpperCase()} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* 3D Orbit Stage */}
        <div
          className={styles.orbitStage}
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

              {/* Orbiting 3D Nodes */}
              {nodes.map(({ product, x, y, z }) => (
                <div
                  key={product.id}
                  className={styles.node}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-rotY}deg) rotateX(${-rotX}deg)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
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
              <span>✦ DRAG OR TOUCH TO ORBIT • CLICK CREATION TO INSPECT</span>
            </div>
            <div className={styles.zoomButtonGroup}>
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

      {/* Artwork Dossier Inspector Modal */}
      <div
        className={`${styles.dossierBackdrop} ${selectedProduct ? styles.dossierBackdropOpen : ''}`}
        onClick={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div
            className={styles.dossierCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedProduct(null)}
              aria-label="Close dossier"
            >
              <X size={16} />
            </button>

            {/* Left: Framed Artwork Visual */}
            <div className={styles.dossierVisual}>
              <div className={`${styles.dossierImgWrap} marching-ants-frame`}>
                <Image
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  width={500}
                  height={500}
                  className={styles.dossierImg}
                />
                <span className={`${styles.dossierCorner} ${styles.dossierTL}`} />
                <span className={`${styles.dossierCorner} ${styles.dossierTR}`} />
                <span className={`${styles.dossierCorner} ${styles.dossierBL}`} />
                <span className={`${styles.dossierCorner} ${styles.dossierBR}`} />
              </div>
            </div>

            {/* Right: Technical Dossier Specs */}
            <div className={styles.dossierInfo}>
              <div>
                <div className={styles.eyebrow}>
                  <span>CLP-ATELIER // {selectedProduct.category.toUpperCase()}</span>
                </div>

                <h3 className={styles.headline}>{selectedProduct.name}</h3>
                <div className={styles.rule} />

                <p className={styles.description}>{selectedProduct.description}</p>

                <div className={styles.specsTable}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>DIMENSIONS</span>
                    <span className={styles.specValue}>{selectedProduct.dimensions}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>MEDIUM</span>
                    <span className={styles.specValue}>{selectedProduct.material}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>PRODUCTION</span>
                    <span className={styles.specValue}>{selectedProduct.productionTime}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>AVAILABILITY</span>
                    <span className={styles.specValue} style={{ color: 'var(--color-terracotta)' }}>
                      {selectedProduct.status === 'IN_STOCK' ? 'READY TO SHIP' : 'MADE TO ORDER'}
                    </span>
                  </div>
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span className={styles.originalPrice}>₹{selectedProduct.originalPrice}</span>
                  )}
                </div>

                <div className={styles.actionGroup}>
                  <button className={styles.buyBtn} onClick={() => handleBuy(selectedProduct)}>
                    {addedAnimation ? (
                      <>
                        <Check size={14} />
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>BUY PIECE</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/custom?item=${encodeURIComponent(selectedProduct.name)}`}
                    className={styles.enquireBtn}
                  >
                    <span>CUSTOM ORDER</span>
                  </Link>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className={styles.dossierNav}>
                <button className={styles.navBtn} onClick={handlePrevProduct}>
                  ← PREV CREATION
                </button>
                <span style={{ color: 'var(--color-text-muted)' }}>[ ARROW KEYS TO CYCLE ]</span>
                <button className={styles.navBtn} onClick={handleNextProduct}>
                  NEXT CREATION →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
