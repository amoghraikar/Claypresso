import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Clock,
  Truck,
  ShieldCheck,
  Instagram,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { BUSINESS_RULES } from '@/types/product';
import styles from './custom.module.css';

export const metadata: Metadata = {
  title: 'Claypresso Custom Creations — Bespoke Handmade Clay Accessories',
  description:
    'Custom handmade clay pieces made specially for you. Bring your idea to life with personalized charms, phone straps, trinket trays, and bespoke sculptures.',
};

export default function CustomLandingPage() {
  return (
    <div className={styles.customPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={13} />
              <span>Bespoke Clay Studio</span>
            </div>

            <h1 className={styles.heroTitle}>MAKE IT YOURS.</h1>

            <p className={styles.heroSubtitle}>
              Have something specific in mind? Tell us what you&apos;re imagining and we&apos;ll turn it into a handmade clay piece.
            </p>

            <div className={styles.heroCtaGroup}>
              <Link href="/custom/request" className={styles.primaryHeroBtn}>
                <span>START A CUSTOM REQUEST</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className={styles.secondaryHeroBtn}>
                <span>SEE HOW IT WORKS</span>
                <ChevronDown size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TACTILE PROCESS VISUAL SECTION: "Your idea → handmade object" */}
      <section className={styles.workspaceVisualSection}>
        <div className="container">
          <div className={styles.workspaceBoard}>
            <div className={styles.boardHeader}>
              <div className={styles.boardTagline}>
                Your imagination <span>→</span> Handcrafted physical piece
              </div>
              <span className={styles.boardBadge}>Bangalore Artisan Workshop</span>
            </div>

            <div className={styles.transformationGrid}>
              {/* Left Card: Customer's Idea / Inspiration */}
              <div className={styles.stageCard}>
                <span className={styles.stageLabel}>Step 1: Your Idea &amp; Reference</span>
                <div className={styles.stageImageWrap}>
                  <Image
                    src="/images/brand-identity.jpg"
                    alt="Creative reference sketch and clay inspiration board"
                    width={480}
                    height={320}
                    className={styles.stageImage}
                  />
                </div>
                <h3 className={styles.stageTitle}>Photos, Doodles &amp; Palette</h3>
                <p className={styles.stageDesc}>
                  Share a photo of your pet, a favorite character, initials, or color theme. Any reference helps us understand your vision.
                </p>
                <div className={styles.stageNotePill}>
                  <Palette size={12} />
                  <span>Custom Color Matching</span>
                </div>
              </div>

              {/* Middle Connector */}
              <div className={styles.connectorCol} aria-hidden="true">
                <span className={styles.connectorBadge}>Sculpted By Hand</span>
                <ArrowRight size={24} style={{ display: 'none' }} />
                <div className={styles.connectorLine} />
                <Sparkles size={20} />
              </div>

              {/* Right Card: The Finished Handmade Piece */}
              <div className={styles.stageCard}>
                <span className={styles.stageLabel}>Step 2: Finished Clay Creation</span>
                <div className={styles.stageImageWrap}>
                  <Image
                    src="/images/products/dragon-couple-keychain.jpg"
                    alt="Completed handcrafted couple dragon clay keychain piece"
                    width={480}
                    height={320}
                    className={styles.stageImage}
                  />
                </div>
                <h3 className={styles.stageTitle}>Glazed, Cured &amp; Assembled</h3>
                <p className={styles.stageDesc}>
                  Every curve is shaped with polymer clay, slow-baked for strength, detailed with gentle pigments, and sealed for everyday love.
                </p>
                <div className={styles.stageNotePill} style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={12} />
                  <span>Durable Water-Resistant Finish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: 4 CLEAR STEPS */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>How Custom Orders Work</span>
            <h2 className={styles.sectionTitle}>Four simple steps. Zero guesswork.</h2>
            <p className={styles.sectionDesc}>
              Because every custom piece is sculpted from scratch, we quote transparently before you pay.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Step 01 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>01</span>
              <h3 className={styles.stepTitle}>SHARE YOUR IDEA</h3>
              <p className={styles.stepText}>
                Tell Claypresso what you want. Send references, photos, colors, and any special requests via our structured form.
              </p>
            </div>

            {/* Step 02 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>02</span>
              <h3 className={styles.stepTitle}>WE REVIEW IT</h3>
              <p className={styles.stepText}>
                Claypresso checks the design, size, clay feasibility, and handcrafting requirements within 24–48 hours.
              </p>
            </div>

            {/* Step 03 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>03</span>
              <h3 className={styles.stepTitle}>GET YOUR QUOTE</h3>
              <p className={styles.stepText}>
                You&apos;ll receive the final price, estimated craft window, and exact details. No upfront payment required to ask.
              </p>
            </div>

            {/* Step 04 */}
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>04</span>
              <h3 className={styles.stepTitle}>WE MAKE IT</h3>
              <p className={styles.stepText}>
                Once approved and paid, hand sculpting begins. Your one-of-a-kind piece is packaged with care and shipped across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCTION & SHIPPING TIMELINE BANNER */}
      <section className={styles.timelineBannerSection}>
        <div className="container">
          <div className={styles.timelineBanner}>
            <div className={styles.timelineCol}>
              <div className={styles.timelineIconBox}>
                <Clock size={22} />
              </div>
              <div>
                <div className={styles.timelineHeading}>Production Time</div>
                <div className={styles.timelineHighlight}>~25 Days Handcrafted</div>
                <p className={styles.timelineSubtext}>
                  Custom pieces typically take around 25 days to sculpt, cure, and glaze.
                </p>
              </div>
            </div>

            <div className={styles.timelineCol}>
              <div className={styles.timelineIconBox}>
                <Truck size={22} />
              </div>
              <div>
                <div className={styles.timelineHeading}>Shipping Transit</div>
                <div className={styles.timelineHighlight}>~4 Days Across India</div>
                <p className={styles.timelineSubtext}>
                  Shipping time is additional once studio production is complete.
                </p>
              </div>
            </div>

            <div className={styles.timelineCol}>
              <div className={styles.timelineIconBox}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className={styles.timelineHeading}>Domestic Shipping</div>
                <div className={styles.timelineHighlight}>Free on Orders ₹500+</div>
                <p className={styles.timelineSubtext}>
                  Carefully packed in eco-conscious, bubble-padded boxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSTAGRAM FALLBACK: "PREFER TO CHAT?" */}
      <section className={styles.socialChatSection}>
        <div className="container">
          <div className={styles.socialChatCard}>
            <div className={styles.socialChatContent}>
              <span className={styles.socialChatEyebrow}>Direct Studio Messages</span>
              <h2 className={styles.socialChatTitle}>Prefer to chat?</h2>
              <p className={styles.socialChatDesc}>
                You can also send your idea directly to Claypresso on Instagram. Send reference photos, drop voice notes, or discuss dimensions with us directly in DMs.
              </p>
            </div>
            <a
              href={BUSINESS_RULES.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramBtn}
            >
              <Instagram size={18} />
              <span>Chat on Instagram @claypresso ↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM INVITATION CTA */}
      <section className={styles.bottomInvitation}>
        <div className="container">
          <h2 className={styles.invitationTitle}>Ready to sculpt your vision?</h2>
          <p className={styles.invitationDesc}>
            Fill out our structured custom form. It takes less than 2 minutes and costs nothing to receive a quote.
          </p>
          <Link href="/custom/request" className={styles.primaryHeroBtn} style={{ margin: '0 auto' }}>
            <span>START A CUSTOM REQUEST</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
