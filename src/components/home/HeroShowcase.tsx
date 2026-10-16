'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { ParallaxLayer } from '@/components/common/Motion';
import { ShoppingBag, Check, X, Sparkles, Orbit, Image as ImageIcon } from 'lucide-react';
import styles from './HeroShowcase.module.css';

interface HeroShowcaseProps {
  products: Product[];
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ products }) => {
  const { addToCart } = useCart();

  // Mode: 'orbit' (3D sphere interactive) or 'still' (classic editorial scrapbook parallax)
  const [activeMode, setActiveMode] = useState<'orbit' | 'still'>('orbit');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // 3D Orbit Physics
  const [rotX, setRotX] = useState<number>(-12);
  const [rotY, setRotY] = useState<number>(30);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const rotRef = useRef({ rotX: -12, rotY: 30, velX: 0, velY: 0, lastX: 0, lastY: 0 });
  const animFrameRef = useRef<number | null>(null);

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
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Fibonacci Sphere coordinates calculation (radius tuned for 480px-500px hero container)
  const sphereProducts = useMemo(() => {
    return products.slice(0, 12);
  }, [products]);

  const nodes = useMemo(() => {
    const list = sphereProducts;
    const N = list.length;
    const baseRadius = 210;

    return list.map((product, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = Math.round(baseRadius * Math.sin(phi) * Math.cos(theta));
      const y = Math.round(baseRadius * Math.cos(phi));
      const z = Math.round(baseRadius * Math.sin(phi) * Math.sin(theta));

      return { product, x, y, z, index: i };
    });
  }, [sphereProducts]);

  // Dossier Navigation
  const handlePrevProduct = () => {
    if (!selectedProduct) return;
    const curr = products.findIndex((p) => p.id === selectedProduct.id);
    const prev = (curr - 1 + products.length) % products.length;
    setSelectedProduct(products[prev]);
  };

  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const curr = products.findIndex((p) => p.id === selectedProduct.id);
    const next = (curr + 1) % products.length;
    setSelectedProduct(products[next]);
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
  }, [selectedProduct, products]);

  return (
    <div className={styles.showcaseWrapper} aria-label="Claypresso Hero Atelier Showcase">
      {/* Mode Switcher Pill */}
      <div className={styles.modeSwitcherRow}>
        <div className={styles.modeSwitchGroup} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'orbit'}
            className={`${styles.modeBtn} ${activeMode === 'orbit' ? styles.modeBtnActive : ''}`}
            onClick={() => setActiveMode('orbit')}
          >
            <Orbit size={12} />
            <span>3D ORBIT</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'still'}
            className={`${styles.modeBtn} ${activeMode === 'still' ? styles.modeBtnActive : ''}`}
            onClick={() => setActiveMode('still')}
          >
            <ImageIcon size={12} />
            <span>ATELIER STILL</span>
          </button>
        </div>

        <div className={styles.orbitCue}>
          {activeMode === 'orbit' ? (
            <span>✦ DRAG TO ROTATE • CLICK TO INSPECT</span>
          ) : (
            <span>✦ PARALLAX EDITORIAL</span>
          )}
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className={styles.cardFrame}>
        {activeMode === 'orbit' ? (
          /* 3D Orbit Interactive Stage */
          <div
            className={styles.orbitStage}
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

                {/* Orbiting Fibonacci Nodes */}
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

      {/* Artwork Dossier Inspector Modal (oumahi.art exhibition inspector) */}
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

            {/* Left Column: Framed Visual with Marching Ants */}
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

            {/* Right Column: Technical Dossier Specs */}
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
    </div>
  );
};
