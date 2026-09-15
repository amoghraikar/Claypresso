import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal/ScrollReveal';
import { ParallaxLayer, CurvedLoop, CurvedCircularBadge } from '@/components/common/Motion';
import { getDbProducts, getDbCategories } from '@/services/productDbService';
import { BUSINESS_RULES } from '@/types/product';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [bestsellersRes, newArrivalsRes, categories] = await Promise.all([
    getDbProducts({ collection: 'bestsellers', limit: 8 }),
    getDbProducts({ collection: 'new-arrivals', limit: 4 }),
    getDbCategories(),
  ]);
  const BESTSELLERS = bestsellersRes.products;
  const NEW_ARRIVALS = newArrivalsRes.products;
  const CATEGORIES = categories;
  return (
    <>
      {/* ======================================================================
          2. HERO SECTION
          ====================================================================== */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div className={styles.heroTagline}>
                  <Sparkles size={14} color="var(--color-warm-brown)" />
                  <span>Handmade Clay Studio • Issue 2026</span>
                </div>
                <div className="stamp-seal" aria-hidden="true">
                  <span>Claypresso</span>
                  <span>Est. 2026 • BLR</span>
                </div>
              </div>

              <h1 className={styles.heroHeadline}>
                <span className={styles.revealLineWrapper}>
                  <span className={`${styles.revealLine} ${styles.revealLineDelay1}`}>
                    Little things.
                  </span>
                </span>
                <span className={styles.revealLineWrapper}>
                  <span className={`${styles.revealLine} ${styles.revealLineDelay2}`}>
                    <em>Big personality.</em>
                  </span>
                </span>
              </h1>

              <p className={styles.heroSupporting}>
                Handmade clay pieces, tiny accessories and custom creations sculpted to bring a tactile, joyful personality to your everyday essentials.
              </p>

              <div className={styles.heroCtaGroup}>
                <Button
                  variant="primary"
                  size="lg"
                  href="/shop?filter=bestseller"
                  icon={<ArrowRight size={18} />}
                >
                  Shop Bestsellers
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/custom"
                >
                  Make it Custom
                </Button>
              </div>

              {/* Bento Studio Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'var(--space-2)' }}>
                <span className="clay-pill">✦ 100% Oven-Baked</span>
                <span className="clay-pill">✦ Zero Factory Molds</span>
                <span className="clay-pill">✦ PAN-India Courier</span>
              </div>
            </div>

            {/* Editorial Clay Product Composition with Multi-depth Parallax & 3D Tilt */}
            <div className={styles.heroComposition}>
              <ParallaxLayer speed={10} tilt={true} style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div className={styles.heroMainImageWrapper}>
                  <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
                  <Image
                    src="/images/products/crescent-cat-keychain-sq.jpg"
                    alt="Handcrafted Claypresso Midnight Crescent Cat keychain charm in hand"
                    fill
                    priority
                    className={styles.catImage}
                  />
                </div>
              </ParallaxLayer>

              {/* Floating Clay Accent Tile (Inverted counter-drift) */}
              <ParallaxLayer speed={-14} style={{ position: 'absolute', bottom: -20, left: -20, zIndex: 3 }}>
                <div className={styles.heroFloatingAccent}>
                  <div className="washi-tape washi-tape-top-right washi-tape-sage" style={{ width: 50, height: 14 }} aria-hidden="true" />
                  <Image
                    src="/images/products/dragon-couple-keychain-sq.jpg"
                    alt="Night & Light Fury couple keychain detail"
                    fill
                    className={styles.catImage}
                  />
                </div>
              </ParallaxLayer>

              {/* Floating Studio Badge with Responsive Depth */}
              <ParallaxLayer speed={16} style={{ position: 'absolute', top: -16, right: -16, zIndex: 4 }}>
                <div className={styles.heroFloatingBadge}>
                  <div
                    style={{
                      position: 'relative',
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--color-cream)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <Image
                      src="/images/logo-badge.png"
                      alt="Claypresso Official Badge"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-espresso)' }}>
                      Claypresso Studio
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)' }}>
                      Handmade with love • Bangalore
                    </div>
                  </div>
                </div>
              </ParallaxLayer>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. TRUST STRIP
          ====================================================================== */}
      <section className={styles.trustStrip} aria-label="Claypresso Guarantees">
        <div className="container">
          <ul className={styles.trustList}>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>Handmade</span>
            </li>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>India-wide shipping</span>
            </li>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>Custom orders</span>
            </li>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>Small batch</span>
            </li>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>₹{BUSINESS_RULES.freeShippingThreshold}+ free shipping</span>
            </li>
            <li className={styles.trustItem}>
              <span className={styles.trustDot} aria-hidden="true" />
              <span>Made with care</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ======================================================================
          CURVED LOOP WAVY RIBBON MARQUEE
          ====================================================================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '12px 0 18px',
          background: 'var(--color-cream-soft)',
          borderTop: '1px dashed var(--color-border-warm)',
          borderBottom: '1px dashed var(--color-border-warm)',
        }}
        aria-label="Artisan Studio Marquee"
      >
        <CurvedLoop
          text="✦ HANDMADE IN BANGALORE ✦ SMALL BATCH CERAMICS ✦ PURE OVEN-BAKED CLAY ✦ CUSTOM CREATIONS ✦ ZERO FACTORY MOLDS ✦ TACTILE JOY ✦"
          speed={0.85}
          height={120}
        />
      </section>

      {/* ======================================================================
          4. BESTSELLERS
          ====================================================================== */}
      <section className="section" id="bestsellers">
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionPretitle}>Most Loved</span>
              <h2 className={styles.sectionTitle}>People Love These</h2>
              <p className={styles.sectionSubtitle}>
                Little favourites that keep finding their way into carts.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={1}>
            <div className={styles.productGrid}>
              {BESTSELLERS.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 2} />
              ))}
            </div>
          </ScrollReveal>

          <div className={styles.sectionCtaWrapper}>
            <Button variant="secondary" size="md" href="/shop?filter=bestseller">
              View All Bestsellers
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          5. CATEGORY DISCOVERY
          ====================================================================== */}
      <section className="section" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionPretitle}>Browse By Form</span>
              <h2 className={styles.sectionTitle}>Category Discovery</h2>
              <p className={styles.sectionSubtitle}>
                Each piece is individually rolled, shaped, detailed, and glazed.
              </p>
            </div>
          </ScrollReveal>

          {/* Varied Editorial Grid: 7 & 5, then three 4-spans */}
          <ScrollReveal stagger={2}>
            <div className={styles.categoryGrid}>
            {/* 1. Charms */}
            <Link
              href={`/shop/${CATEGORIES[0].slug}`}
              className={`${styles.catCard} ${styles.span7}`}
            >
              <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[0].coverImage}
                  alt={CATEGORIES[0].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>01 / ARCHIVE</span>
                  <span className={styles.catCount}>{CATEGORIES[0].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[0].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 2. Keychain Charms */}
            <Link
              href={`/shop/${CATEGORIES[1].slug}`}
              className={`${styles.catCard} ${styles.span5}`}
            >
              <div className="washi-tape washi-tape-top-right washi-tape-sage" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[1].coverImage}
                  alt={CATEGORIES[1].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>02 / BESTSELLER</span>
                  <span className={styles.catCount}>{CATEGORIES[1].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[1].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 3. Mini Phone Charms */}
            <Link
              href={`/shop/${CATEGORIES[2].slug}`}
              className={`${styles.catCard} ${styles.span4}`}
            >
              <div className="washi-tape washi-tape-top-left washi-tape-blush" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[2].coverImage}
                  alt={CATEGORIES[2].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>03 / ESSENTIAL</span>
                  <span className={styles.catCount}>{CATEGORIES[2].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[2].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 4. Magnets */}
            <Link
              href={`/shop/${CATEGORIES[3].slug}`}
              className={`${styles.catCard} ${styles.span4}`}
            >
              <div className="washi-tape washi-tape-top-right washi-tape-peach" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[3].coverImage}
                  alt={CATEGORIES[3].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>04 / MAGNETS</span>
                  <span className={styles.catCount}>{CATEGORIES[3].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[3].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 5. Trays */}
            <Link
              href={`/shop/${CATEGORIES[4].slug}`}
              className={`${styles.catCard} ${styles.span4}`}
            >
              <div className="washi-tape washi-tape-top-left washi-tape-sage" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[4].coverImage}
                  alt={CATEGORIES[4].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>05 / CERAMIC</span>
                  <span className={styles.catCount}>{CATEGORIES[4].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[4].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 6. Badges */}
            <Link
              href={`/shop/${CATEGORIES[5].slug}`}
              className={`${styles.catCard} ${styles.span7}`}
            >
              <div className="washi-tape washi-tape-top-left washi-tape-blush" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[5].coverImage}
                  alt={CATEGORIES[5].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>06 / PIN BADGES</span>
                  <span className={styles.catCount}>{CATEGORIES[5].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[5].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>

            {/* 7. Hair Pins */}
            <Link
              href={`/shop/${CATEGORIES[6].slug}`}
              className={`${styles.catCard} ${styles.span5}`}
            >
              <div className="washi-tape washi-tape-top-right washi-tape-peach" aria-hidden="true" />
              <div className={styles.catImageWrapper}>
                <Image
                  src={CATEGORIES[6].coverImage}
                  alt={CATEGORIES[6].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className={styles.catImage}
                />
              </div>
              <div className={styles.catContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sticker-badge" style={{ fontSize: '10px' }}>07 / HAIR ACCESSORIES</span>
                  <span className={styles.catCount}>{CATEGORIES[6].itemCount} pieces</span>
                </div>
                <h3 className={styles.catName} style={{ marginTop: '4px' }}>
                  <span>{CATEGORIES[6].name}</span>
                  <span className={styles.catArrow} aria-hidden="true">→</span>
                </h3>
              </div>
            </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======================================================================
          6. NEW ARRIVALS
          ====================================================================== */}
      <section className="section" id="new-arrivals">
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionPretitle}>Fresh Drop</span>
              <h2 className={styles.sectionTitle}>Just Landed</h2>
              <p className={styles.sectionSubtitle}>
                Fresh from the clay table.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={1}>
            <div className={styles.productGrid}>
              {NEW_ARRIVALS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </ScrollReveal>

          <div className={styles.sectionCtaWrapper}>
            <Button variant="secondary" size="md" href="/shop?filter=new">
              Shop New Arrivals
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          7. EDITORIAL BRAND STORY
          ====================================================================== */}
      <section className={`${styles.section} ${styles.storySection}`}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyVisuals}>
              <div className={styles.storyImg1}>
                <div className="polaroid-frame" style={{ transform: 'rotate(-2.2deg)' }}>
                  <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
                  <div style={{ position: 'relative', width: '100%', height: '230px', overflow: 'hidden', borderRadius: '4px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop"
                      alt="Clay crafting in studio"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={styles.catImage}
                    />
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted-brown)', paddingTop: '8px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    FIG. 01 — HAND CONDITIONING
                  </div>
                </div>
              </div>

              <div className={styles.storyImg2}>
                <div className="polaroid-frame" style={{ transform: 'rotate(2.6deg)' }}>
                  <div className="washi-tape washi-tape-top-right washi-tape-sage" aria-hidden="true" />
                  <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden', borderRadius: '4px' }}>
                    <Image
                      src="/images/products/puppy-head-keychain-sq.jpg"
                      alt="Caramel puppy clay charm"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={styles.catImage}
                    />
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted-brown)', paddingTop: '8px', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    FIG. 02 — SCULPTED CHARM
                  </div>
                </div>
              </div>

              {/* Interactive Artisan Stamp Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  right: '16px',
                  zIndex: 4,
                }}
              >
                <CurvedCircularBadge
                  text="CLAYPRESSO STUDIO • HANDMADE WITH LOVE •"
                  size={116}
                  centerIcon="✦"
                />
              </div>
            </div>

            <div className={styles.storyContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="sticker-badge">EST. 2026</span>
                <span className={styles.sectionPretitle} style={{ marginBottom: 0 }}>The Clay Atelier</span>
              </div>
              <h2 className={styles.storyHeading}>Made by Hand. Meant to be Yours.</h2>
              <p className={styles.storyText}>
                Claypresso was born out of an appreciation for tiny objects with genuine character. In our small studio in Bangalore, we treat every single accessory not as inventory, but as a miniature sculpture.
              </p>
              <p className={styles.storyText}>
                We condition, color-blend, hand-cut, and slow-cure our polymer clay in intentional, small batches. No factory molds. No generic prints. Just warm hands, careful detailing, and a sincere joy in making things that make you smile every time you glance at your keys or phone.
              </p>

              <div className={styles.storyHighlightBox}>
                <div className="clay-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div className={styles.statNumber}>100%</div>
                  <div className={styles.statLabel}>Handmade in BLR</div>
                </div>
                <div className="clay-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div className={styles.statNumber}>Small</div>
                  <div className={styles.statLabel}>Batch Drops</div>
                </div>
                <div className="clay-card" style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div className={styles.statNumber}>~4 Days</div>
                  <div className={styles.statLabel}>India Transit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          8. CUSTOM CREATION SECTION (ESPRESSO)
          ====================================================================== */}
      <section className={styles.customSection} id="custom">
        <div className="container">
          <div className={styles.customGrid}>
            <div className={styles.customContent}>
              <span
                style={{
                  color: 'var(--color-peach)',
                  fontSize: 'var(--text-label)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Bespoke Clay Requests
              </span>
              <h2 className={styles.customTitle}>Have Something Else in Mind?</h2>
              <p className={styles.customText}>
                Whether you want your pet sculpted into a miniature charm, a custom wedding favor tray, or personalized colorways for a special gift, we love bringing your imagination to life in clay.
              </p>

              <ScrollReveal stagger={1}>
                <div className={styles.processSteps}>
                  <div className={styles.stepItem}>
                    <span className={styles.stepNumber}>01</span>
                    <div>
                      <div className={styles.stepTitle}>Tell us your idea</div>
                      <p className={styles.stepDesc}>Share your sketches, photos, or dream color palette.</p>
                    </div>
                  </div>
                  <div className={styles.stepItem}>
                    <span className={styles.stepNumber}>02</span>
                    <div>
                      <div className={styles.stepTitle}>Sculpting & Baking</div>
                      <p className={styles.stepDesc}>Handcrafted meticulously with high-durability clay and resin sealant.</p>
                    </div>
                  </div>
                  <div className={styles.stepItem}>
                    <span className={styles.stepNumber}>03</span>
                    <div>
                      <div className={styles.stepTitle}>Carefully Packed & Shipped</div>
                      <p className={styles.stepDesc}>Bespoke orders typically take ~25 days production + standard shipping transit across India.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <div style={{ marginTop: 'var(--space-2)' }}>
                <Button
                  variant="accent"
                  size="lg"
                  href="/custom"
                  icon={<ArrowRight size={18} />}
                >
                  Start a Custom Request →
                </Button>
              </div>
            </div>

            {/* Custom Production Timeline Summary Card */}
            <div className={styles.customCard}>
              <div className="washi-tape washi-tape-top-right washi-tape-peach" aria-hidden="true" />
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ivory)', fontSize: '24px' }}>
                Custom Order Guide
              </h3>
              <div className={styles.customTimeline}>
                <span style={{ color: 'var(--color-peach)', fontSize: '14px' }}>Production Lead Time</span>
                <strong style={{ color: 'var(--color-ivory)', fontSize: '14px' }}>~25 Days</strong>
              </div>
              <div className={styles.customTimeline}>
                <span style={{ color: 'var(--color-peach)', fontSize: '14px' }}>Shipping Transit</span>
                <strong style={{ color: 'var(--color-ivory)', fontSize: '14px' }}>~4 Days across India</strong>
              </div>
              <div className={styles.customTimeline}>
                <span style={{ color: 'var(--color-peach)', fontSize: '14px' }}>Available Forms</span>
                <strong style={{ color: 'var(--color-ivory)', fontSize: '14px' }}>Charms, Trays, Pins, Badges</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-light-taupe)', margin: 0 }}>
                *Production times may vary slightly based on seasonal order volume. We keep you updated at every clay stage!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          9. REVIEWS (Authentic Community Callout — No Fabricated Quotes)
          ====================================================================== */}
      <section className="section" id="reviews">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPretitle}>Customer Love</span>
            <h2 className={styles.sectionTitle}>Loved by People Who Like Cute Things.</h2>
            <p className={styles.sectionSubtitle}>
              We let genuine customer experiences speak for themselves.
            </p>
          </div>

          <div className={styles.authenticNote}>
            <Heart size={36} color="var(--color-blush)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-espresso)', marginBottom: 8 }}>
              Community Love Notes
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', maxWidth: '520px', margin: '0 auto 16px' }}>
              Received your Claypresso package? We’d adore seeing your charm in its new home! Share your unboxing or tag us on Instagram to be featured here.
            </p>
            <Button
              variant="secondary"
              size="sm"
              href="https://www.instagram.com/claypresso/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tag @claypresso on Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          10. CUSTOMER PHOTOS / UGC (Authentic Showcase Placeholder)
          ====================================================================== */}
      <section className="section" style={{ backgroundColor: 'var(--color-cream)', paddingTop: 'var(--space-12)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPretitle}>In The Wild</span>
            <h2 className={styles.sectionTitle}>Seen Out in the Wild</h2>
            <p className={styles.sectionSubtitle}>
              Where do your clay charms travel?
            </p>
          </div>

          <div className={styles.ugcGrid}>
            <div className={styles.ugcTile}>
              <Image
                src="/images/products/dragon-couple-keychain.jpg"
                alt="Night and Light Fury couple keychain in hand"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.catImage}
              />
              <div className={styles.ugcOverlay}>#claypressolove</div>
            </div>
            <div className={styles.ugcTile}>
              <Image
                src="/images/products/bunny-frog-keychains.jpg"
                alt="Bunny and Frog clay keychains in hand"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.catImage}
              />
              <div className={styles.ugcOverlay}>#claypressolove</div>
            </div>
            <div className={styles.ugcTile}>
              <Image
                src="/images/products/puppy-head-keychain.jpg"
                alt="Puppy charm on keys"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.catImage}
              />
              <div className={styles.ugcOverlay}>#claypressolove</div>
            </div>
            <div className={styles.ugcTile}>
              <Image
                src="/images/products/midnight-cat-keychain.jpg"
                alt="Midnight cat charm on bag"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.catImage}
              />
              <div className={styles.ugcOverlay}>#claypressolove</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          11. INSTAGRAM DISCOVERY
          ====================================================================== */}
      <section className="section" id="instagram">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPretitle}>Social Gallery</span>
            <h2 className={styles.sectionTitle}>More Claypresso IRL</h2>
            <p className={styles.sectionSubtitle}>
              Behind-the-scenes sculpting, studio clay conditioning, and drop countdowns on Instagram.
            </p>
          </div>

          <div className={styles.instagramGrid}>
            {[
              {
                url: '/images/products/spiral-star-charm.jpg',
                alt: 'Handmade crimson spiral star charm',
              },
              {
                url: '/images/products/dragon-couple-keychain-sq.jpg',
                alt: 'Dragon couple companion charms',
              },
              {
                url: '/images/products/puppy-head-keychain-sq.jpg',
                alt: 'Puppy clay face charm',
              },
              {
                url: '/images/products/bunny-frog-keychains-sq.jpg',
                alt: 'Bunny and frog charm pair',
              },
              {
                url: '/images/products/crescent-cat-keychain-sq.jpg',
                alt: 'Crescent cat charm',
              },
            ].map((tile, i) => (

              <a
                key={i}
                href="https://www.instagram.com/claypresso/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.instaTile}
                aria-label={`View Claypresso post ${i + 1} on Instagram`}
              >
                <Image
                  src={tile.url}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className={styles.instaImg}
                />
              </a>
            ))}
          </div>

          <div className={styles.sectionCtaWrapper}>
            <Button
              variant="secondary"
              size="md"
              href="https://www.instagram.com/claypresso/"
              target="_blank"
              rel="noopener noreferrer"
              icon={<Instagram size={16} />}
            >
              Follow @claypresso
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          12. FINAL CTA
          ====================================================================== */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <div className={styles.finalCtaContent}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-label)',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-warm-brown)',
              }}
            >
              Handmade & Ready to Ship
            </span>

            <h2 className={styles.finalCtaHeadline}>Something cute is waiting.</h2>

            <p style={{ color: 'var(--color-espresso)', fontSize: '18px', maxWidth: '440px', margin: 0 }}>
              Find your next little everyday companion, or let us sculpt something unique just for you.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="primary" size="lg" href="/shop">
                Shop All
              </Button>
              <Button variant="secondary" size="lg" href="/custom">
                Make it Custom
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
