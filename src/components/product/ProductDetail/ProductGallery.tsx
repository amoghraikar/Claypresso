'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './ProductDetail.module.css';

export interface ProductGalleryProps {
  product: Product;
  priority?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ product, priority = true }) => {
  // Consolidate images (including secondary if distinct) and optional videos
  const mediaItems: Array<{ type: 'image' | 'video'; url: string; alt: string }> = [];

  product.images.forEach((img, idx) => {
    mediaItems.push({
      type: 'image',
      url: img,
      alt: `${product.name} — View ${idx + 1}`,
    });
  });

  if (product.secondaryImage && !product.images.includes(product.secondaryImage)) {
    mediaItems.push({
      type: 'image',
      url: product.secondaryImage,
      alt: `${product.name} — Detail View`,
    });
  }

  if (product.videos && product.videos.length > 0) {
    product.videos.forEach((vid, idx) => {
      mediaItems.push({
        type: 'video',
        url: vid,
        alt: `${product.name} — Video Demonstration ${idx + 1}`,
      });
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [imageKey, setImageKey] = useState(0);

  // Desktop subtle cursor-responsive depth lens (Section 19)
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageTargetRef = useRef<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const imageCurrentRef = useRef<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const lensRafRef = useRef<number | null>(null);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (isTouchDevice) return;

    const container = imageContainerRef.current;
    if (!container) return;

    const updatePosition = () => {
      const target = imageTargetRef.current;
      const current = imageCurrentRef.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.scale += (target.scale - current.scale) * 0.12;

      const imgEl = container.querySelector<HTMLElement>('img');
      if (imgEl) {
        imgEl.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0) scale(${current.scale.toFixed(3)})`;
      }

      lensRafRef.current = requestAnimationFrame(updatePosition);
    };

    lensRafRef.current = requestAnimationFrame(updatePosition);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Subtle 6px translation and 1.025 slight zoom
      imageTargetRef.current = {
        x: normX * 6,
        y: normY * 6,
        scale: 1.025,
      };
    };

    const handleMouseLeave = () => {
      imageTargetRef.current = { x: 0, y: 0, scale: 1 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (lensRafRef.current) cancelAnimationFrame(lensRafRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeIndex]);

  const activeMedia = mediaItems[activeIndex] || mediaItems[0];
  const isOutOfStock = product.status === 'OUT_OF_STOCK';

  // Smooth switch
  const handleSelectMedia = (idx: number) => {
    if (idx !== activeIndex) {
      setActiveIndex(idx);
      setImageKey((prev) => prev + 1);
    }
  };

  // Keyboard navigation for gallery
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    }
  };

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      // Swiped left -> Next
      setActiveIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> Prev
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className={styles.galleryWrapper} onKeyDown={handleKeyDown} tabIndex={0} aria-label="Product image gallery">
      {/* Desktop Vertical Thumbnails Navigation */}
      {mediaItems.length > 1 && (
        <div className={styles.thumbnailsCol} role="tablist" aria-label="Gallery thumbnails">
          {mediaItems.map((item, idx) => (
            <button
              key={`${item.url}-${idx}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Show ${item.alt}`}
              className={`${styles.thumbnailBtn} ${activeIndex === idx ? styles.thumbnailBtnActive : ''}`}
              onClick={() => handleSelectMedia(idx)}
            >
              {item.type === 'video' ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-cream)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warm-brown)' }}>VIDEO</span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="72px"
                  className={styles.thumbnailImg}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Display Area */}
      <div
        ref={imageContainerRef}
        className={styles.mainMediaContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
        {/* Floating Badges */}
        <div className={styles.galleryBadges}>
          {isOutOfStock ? (
            <Badge status="OUT_OF_STOCK" />
          ) : (
            <>
              {product.badges.map((badge) => (
                <Badge key={badge} type={badge} stock={product.stock} />
              ))}
              {product.status === 'LOW_STOCK' && !product.badges.includes('low-stock') && (
                <Badge status="LOW_STOCK" stock={product.stock} />
              )}
            </>
          )}
        </div>

        {activeMedia?.type === 'video' ? (
          <video
            src={activeMedia.url}
            controls
            autoPlay
            muted
            loop
            className={styles.mainVideo}
          />
        ) : (
          <Image
            key={imageKey}
            src={activeMedia?.url || product.images[0]}
            alt={activeMedia?.alt || product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.mainImage}
            style={{
              animation: 'clayFadeUp 400ms var(--ease-clay-settle) both',
            }}
          />
        )}
      </div>

      {/* Mobile Pagination Indicator Dots */}
      {mediaItems.length > 1 && (
        <div className={styles.mobilePagination} aria-hidden="true">
          {mediaItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.dot} ${activeIndex === idx ? styles.dotActive : ''}`}
              onClick={() => handleSelectMedia(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
