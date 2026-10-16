'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { soundEngine } from '@/utils/audioFx';
import { ShoppingBag, Check, X, Sparkles, Sliders } from 'lucide-react';
import styles from './ArtworkDossierModal.module.css';

interface ArtworkDossierModalProps {
  product: Product | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasNavigation?: boolean;
}

export const ArtworkDossierModal: React.FC<ArtworkDossierModalProps> = ({
  product,
  onClose,
  onPrev,
  onNext,
  hasNavigation = false,
}) => {
  const { addToCart } = useCart();
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [activeFinish, setActiveFinish] = useState<'glaze' | 'matte' | 'speckle'>('glaze');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      soundEngine.playChime();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onPrev, onNext, onClose]);

  if (!product) return null;

  const handleBuy = () => {
    addToCart(product, 1, undefined, null, true);
    soundEngine.playChime();
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  const handleFinishChange = (finish: 'glaze' | 'matte' | 'speckle') => {
    setActiveFinish(finish);
    soundEngine.playPop();
  };

  return (
    <div
      className={`${styles.dossierBackdrop} ${product ? styles.dossierBackdropOpen : ''}`}
      onClick={onClose}
      aria-label="Artwork Dossier Modal"
    >
      <div
        className={styles.dossierCard}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close dossier"
        >
          <X size={16} />
        </button>

        {/* Visual Column */}
        <div className={styles.dossierVisual}>
          <div className={`${styles.dossierImgWrap} marching-ants-frame`}>
            <Image
              src={product.images[0]}
              alt={product.name}
              width={500}
              height={500}
              className={styles.dossierImg}
            />

            {/* Clay Finish Interactive Overlay */}
            {activeFinish === 'glaze' && <div className={styles.finishGlaze} />}
            {activeFinish === 'speckle' && <div className={styles.finishSpeckle} />}

            {/* Corner Crop Reticles */}
            <span className={`${styles.dossierCorner} ${styles.dossierTL}`} />
            <span className={`${styles.dossierCorner} ${styles.dossierTR}`} />
            <span className={`${styles.dossierCorner} ${styles.dossierBL}`} />
            <span className={`${styles.dossierCorner} ${styles.dossierBR}`} />
          </div>

          {/* Interactive Artisanal Finish Inspector */}
          <div className={styles.finishBar}>
            <button
              type="button"
              className={`${styles.finishBtn} ${activeFinish === 'glaze' ? styles.finishBtnActive : ''}`}
              onClick={() => handleFinishChange('glaze')}
            >
              <span>✨ UV GLAZE</span>
            </button>
            <button
              type="button"
              className={`${styles.finishBtn} ${activeFinish === 'matte' ? styles.finishBtnActive : ''}`}
              onClick={() => handleFinishChange('matte')}
            >
              <span>☁️ VELVET MATTE</span>
            </button>
            <button
              type="button"
              className={`${styles.finishBtn} ${activeFinish === 'speckle' ? styles.finishBtnActive : ''}`}
              onClick={() => handleFinishChange('speckle')}
            >
              <span>🍪 CERAMIC</span>
            </button>
          </div>
        </div>

        {/* Technical Dossier Specs */}
        <div className={styles.dossierInfo}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.archiveTag}>CLP-ATELIER // {product.category.toUpperCase()}</span>
              <span className={styles.telemetryTag}>ARCHIVE NO. #{product.id.slice(0, 6)}</span>
            </div>

            <h3 className={styles.headline}>{product.name}</h3>
            <div className={styles.rule} />

            <p className={styles.description}>{product.description}</p>

            <div className={styles.specsTable}>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>DIMENSIONS</span>
                <span className={styles.specValue}>{product.dimensions}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>MEDIUM</span>
                <span className={styles.specValue}>{product.material}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>PRODUCTION</span>
                <span className={styles.specValue}>{product.productionTime}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>AVAILABILITY</span>
                <span className={styles.specValue} style={{ color: 'var(--color-terracotta)' }}>
                  {product.status === 'IN_STOCK' ? 'READY TO SHIP' : 'HAND-SCULPTED TO ORDER'}
                </span>
              </div>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>₹{product.price}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>₹{product.originalPrice}</span>
              )}
            </div>

            <div className={styles.actionGroup}>
              <button className={styles.buyBtn} onClick={handleBuy}>
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
                href={`/custom?item=${encodeURIComponent(product.name)}`}
                className={styles.enquireBtn}
                onClick={onClose}
              >
                <span>CUSTOM ORDER</span>
              </Link>
            </div>
          </div>

          {/* Prev / Next controls */}
          {hasNavigation && (
            <div className={styles.dossierNav}>
              <button className={styles.navBtn} onClick={onPrev}>
                ← PREV CREATION
              </button>
              <span style={{ color: 'var(--color-text-muted)' }}>[ ARROW KEYS TO CYCLE ]</span>
              <button className={styles.navBtn} onClick={onNext}>
                NEXT CREATION →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
