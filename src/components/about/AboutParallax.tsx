'use client';

import React from 'react';
import Image from 'next/image';
import { ParallaxLayer } from '@/components/common/Motion/HeroParallax';
import { ProximityElement } from '@/components/common/Motion/ProximityElement';
import styles from '@/app/about/about.module.css';

export const AboutHeroVisual: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '960px', margin: '0 auto var(--space-16)' }}>
      {/* Decorative floating reactive elements */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-24px',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <ProximityElement threshold={120} maxDisplacement={14} rotate>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '60% 40% 50% 70% / 50% 60% 40% 60%',
              backgroundColor: 'var(--color-terracotta)',
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <span style={{ fontSize: '14px', color: 'var(--color-cream)' }}>✦</span>
          </div>
        </ProximityElement>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-16px',
          right: '-18px',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <ProximityElement threshold={140} maxDisplacement={12} rotate>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-sage)',
              opacity: 0.8,
              boxShadow: 'var(--shadow-xs)',
            }}
          />
        </ProximityElement>
      </div>

      {/* Editorial Workspace Photo wrapped in restrained parallax & subtle tilt */}
      <ParallaxLayer speed={6} tilt className={styles.featuredImageWrap}>
        <Image
          src="/images/brand-identity.jpg"
          alt="Claypresso Studio table with handmade clay prototypes, tools, and palette samples"
          fill
          priority
          className={styles.featuredImage}
          sizes="(max-width: 768px) 100vw, 960px"
        />
      </ParallaxLayer>
    </div>
  );
};

export const AboutCustomBannerImage: React.FC = () => {
  return (
    <ParallaxLayer speed={5} tilt className={styles.customBannerImageWrap}>
      <Image
        src="/images/products/dragon-couple-keychain.jpg"
        alt="Handcrafted custom pair dragons clay keychain"
        width={480}
        height={320}
        className={styles.customBannerImage}
      />
    </ParallaxLayer>
  );
};
