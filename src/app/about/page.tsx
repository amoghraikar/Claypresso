import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Truck, Palette, CheckCircle } from 'lucide-react';
import { BUSINESS_RULES } from '@/types/product';
import { AboutHeroVisual, AboutCustomBannerImage } from '@/components/about/AboutParallax';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Claypresso — Handmade Clay Accessories Studio | Bangalore',
  description:
    'Discover Claypresso: an independent polymer clay accessories studio in Bangalore, India crafting small-batch bag charms, keychains, phone straps, and custom bespoke gifts.',
};

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={13} />
              <span>Independent Clay Studio • Bangalore</span>
            </div>

            <h1 className={styles.heroTitle}>MADE BY HAND. MEANT TO BE YOURS.</h1>

            <p className={styles.heroSubtitle}>
              Claypresso creates tactile, personality-filled clay accessories shaped with patience, gentle colors, and everyday affection in Bangalore, India.
            </p>
          </div>

          {/* Editorial Workspace Photo with Parallax & Proximity Elements */}
          <AboutHeroVisual />
        </div>
      </section>

      {/* 2. WHAT CLAYPRESSO MAKES: "LITTLE THINGS. BIG PERSONALITY." */}
      <section className={styles.sectionBlock}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>What We Sculpt</span>
            <h2 className={styles.sectionTitle}>LITTLE THINGS. BIG PERSONALITY.</h2>
            <p className={styles.sectionDesc}>
              Every accessory is small enough to hold in your palm, but distinctive enough to bring character to your keys, bags, and phone.
            </p>
          </div>

          <div className={styles.productStoryGrid}>
            <div className={styles.storyCard}>
              <div className={styles.storyCardImageWrap}>
                <Image
                  src="/images/products/crescent-cat-keychain.jpg"
                  alt="Midnight Crescent Cat Keychain handmade piece"
                  width={400}
                  height={260}
                  className={styles.storyCardImage}
                />
              </div>
              <div className={styles.storyCardContent}>
                <h3 className={styles.storyCardTitle}>Charms &amp; Keychains</h3>
                <p className={styles.storyCardText}>
                  Sculpted characters, cosmic kitties, and playful companion pieces attached to durable, high-polish keyrings.
                </p>
              </div>
            </div>

            <div className={styles.storyCard}>
              <div className={styles.storyCardImageWrap}>
                <Image
                  src="/images/products/spiral-star-charm.jpg"
                  alt="Pastel Mini Phone Charm with beaded strap"
                  width={400}
                  height={260}
                  className={styles.storyCardImage}
                />
              </div>
              <div className={styles.storyCardContent}>
                <h3 className={styles.storyCardTitle}>Mini Phone Straps</h3>
                <p className={styles.storyCardText}>
                  Beaded wrist loops anchored with hand-shaped clay centerpieces designed for everyday daily handling.
                </p>
              </div>
            </div>

            <div className={styles.storyCard}>
              <div className={styles.storyCardImageWrap}>
                <Image
                  src="/images/products/puppy-head-keychain.jpg"
                  alt="Puppy Head Sculpted Clay Accessory"
                  width={400}
                  height={260}
                  className={styles.storyCardImage}
                />
              </div>
              <div className={styles.storyCardContent}>
                <h3 className={styles.storyCardTitle}>Bespoke Sculptures</h3>
                <p className={styles.storyCardText}>
                  Pin badges, fridge magnets, and custom portrait pieces shaped from scratch to capture specific moments and personalities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE HANDMADE PROCESS: "MADE WITH CLAY. MADE WITH CARE." */}
      <section className={styles.processSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>The Studio Workflow</span>
            <h2 className={styles.sectionTitle}>MADE WITH CLAY. MADE WITH CARE.</h2>
            <p className={styles.sectionDesc}>
              No industrial injection molds or mass-production machinery. Every step relies on tactile manual craft.
            </p>
          </div>

          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <span className={styles.processStepNum}>01</span>
              <h3 className={styles.processCardTitle}>Color Conditioning</h3>
              <p className={styles.processCardText}>
                Polymer clay is warmed by hand and custom-mixed into harmonious blush, peach, cream, and espresso palettes.
              </p>
            </div>

            <div className={styles.processCard}>
              <span className={styles.processStepNum}>02</span>
              <h3 className={styles.processCardTitle}>Tactile Sculpting</h3>
              <p className={styles.processCardText}>
                Pieces are shaped with micro-tools, miniature clay cutters, and soft fingertip pressure for expressive character.
              </p>
            </div>

            <div className={styles.processCard}>
              <span className={styles.processStepNum}>03</span>
              <h3 className={styles.processCardTitle}>Slow Curing</h3>
              <p className={styles.processCardText}>
                Carefully oven-baked at precise temperatures to transform flexible raw clay into tough, resilient accessories.
              </p>
            </div>

            <div className={styles.processCard}>
              <span className={styles.processStepNum}>04</span>
              <h3 className={styles.processCardTitle}>Glaze &amp; Assembly</h3>
              <p className={styles.processCardText}>
                Finished with protective water-resistant sealant coats, fitted with stainless hardware, and individually inspected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CUSTOM EXISTS: "SOMETHING MADE JUST FOR YOU." */}
      <section className={styles.sectionBlock}>
        <div className="container">
          <div className={styles.customBanner}>
            <div>
              <span className={styles.sectionEyebrow}>Personalized Commissions</span>
              <h2 className={styles.customBannerTitle}>SOMETHING MADE JUST FOR YOU.</h2>
              <p className={styles.customBannerText}>
                Not everything fits inside a pre-made mold. Whether it&apos;s a miniature sculpture of your pet, anniversary initials, or a quirky inside joke, our custom commission workflow translates your ideas directly into physical clay.
              </p>
              <Link href="/custom" className={styles.primaryCtaBtn}>
                <span>EXPLORE CUSTOM CREATIONS</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <AboutCustomBannerImage />
          </div>
        </div>
      </section>

      {/* 5. SMALL-BATCH / HANDMADE PHILOSOPHY */}
      <section className={styles.sectionBlock}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Our Standards</span>
            <h2 className={styles.sectionTitle}>Thoughtful from Studio to Doorstep</h2>
            <p className={styles.sectionDesc}>
              Small-batch production allows us to pay personal attention to each package that leaves Bangalore.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            <div className={styles.pillarCard}>
              <Heart size={26} className={styles.pillarIcon} />
              <h3 className={styles.pillarTitle}>Human Touch Guaranteed</h3>
              <p className={styles.pillarText}>
                Subtle organic variations are the signature of authentic handmade craft. No two Claypresso pieces are ever identical.
              </p>
            </div>

            <div className={styles.pillarCard}>
              <ShieldCheck size={26} className={styles.pillarIcon} />
              <h3 className={styles.pillarTitle}>Padded Protection</h3>
              <p className={styles.pillarText}>
                Every piece is secured in bubble-padded cushioning, tissue wrap, and rigid boxes to withstand courier handling across India.
              </p>
            </div>

            <div className={styles.pillarCard}>
              <Truck size={26} className={styles.pillarIcon} />
              <h3 className={styles.pillarTitle}>Domestic Delivery</h3>
              <p className={styles.pillarText}>
                We partner with India Post and DTDC to provide door-to-door delivery with tracking updates sent directly to your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT CTA SECTION */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <h2 className={styles.finalCtaTitle}>Ready to meet your new companion?</h2>
          <p className={styles.finalCtaSubtitle}>
            Browse our current small-batch catalog or start a bespoke custom commission today.
          </p>

          <div className={styles.ctaButtonGroup}>
            <Link href="/shop" className={styles.primaryCtaBtn}>
              <span>FIND SOMETHING CUTE</span>
              <ArrowRight size={18} />
            </Link>

            <Link href="/custom" className={styles.secondaryCtaBtn}>
              <span>MAKE IT CUSTOM</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
