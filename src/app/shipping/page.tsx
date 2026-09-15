import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Truck,
  Clock,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { BUSINESS_RULES } from '@/types/product';
import {
  SHIPPING_PARTNERS,
  SHIPPING_TIERS,
  ORDER_MOVEMENT_STEPS,
} from '@/data/shippingData';
import styles from './shipping.module.css';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Guide — Claypresso Studio Bangalore',
  description:
    'Learn how Claypresso ships across India: courier transit times, free shipping threshold (₹500+), and clear distinctions between handcrafting production time and shipping transit.',
};

export default function ShippingPage() {
  return (
    <div className={styles.shippingPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={13} />
              <span>Studio Fulfillment Policy</span>
            </div>

            <h1 className={styles.heroTitle}>SHIPPING, WITHOUT THE MYSTERY.</h1>

            <p className={styles.heroSubtitle}>
              Every piece leaves our Bangalore studio carefully padded and tracked. Here is exactly how your handmade parcel moves from our workbench to your doorstep.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. THREE CORE RULE CARDS */}
        <div className={styles.summaryCardsGrid}>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIconCircle}>
              <MapPin size={24} />
            </div>
            <h2 className={styles.ruleTitle}>Ships Across India</h2>
            <p className={styles.ruleText}>
              We deliver to domestic pincodes across India from Bangalore using trusted national courier partners including{' '}
              <strong>{SHIPPING_PARTNERS.join(' and ')}</strong>.
            </p>
          </div>

          <div className={styles.ruleCard}>
            <div className={styles.ruleIconCircle}>
              <ShieldCheck size={24} />
            </div>
            <h2 className={styles.ruleTitle}>Free Shipping ₹500+</h2>
            <p className={styles.ruleText}>
              Every order totaling <strong>{BUSINESS_RULES.currency}{BUSINESS_RULES.freeShippingThreshold}</strong> or more receives complimentary free shipping. For smaller orders below ₹500, a standard fee of {BUSINESS_RULES.currency}{BUSINESS_RULES.standardShippingFee} applies.
            </p>
          </div>

          <div className={styles.ruleCard}>
            <div className={styles.ruleIconCircle}>
              <Truck size={24} />
            </div>
            <h2 className={styles.ruleTitle}>~4 Days Transit</h2>
            <p className={styles.ruleText}>
              Once studio packaging is complete and your parcel is dispatched, typical courier transit time is approximately <strong>4 business days</strong> across India.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CRUCIAL DISTINCTION: PRODUCTION TIME vs. SHIPPING TRANSIT */}
      <section className={styles.distinctionSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Timeline Clarity</span>
            <h2 className={styles.sectionTitle}>How Long Does It Take?</h2>
            <p className={styles.sectionDesc}>
              Because clay pieces are sculpted with real human hands, please note the essential difference between{' '}
              <strong>Production Time</strong> and <strong>Shipping Transit</strong>.
            </p>
          </div>

          <div className={styles.tierCardsGrid}>
            {SHIPPING_TIERS.map((tier) => (
              <div key={tier.type} className={styles.tierCard}>
                <span className={styles.tierBadge}>{tier.badge}</span>
                <h3 className={styles.tierName}>{tier.type}</h3>
                <p className={styles.tierDesc}>{tier.description}</p>

                <div className={styles.tierBreakdown}>
                  <div className={styles.breakdownRow}>
                    <span>Studio Crafting:</span>
                    <strong>{tier.productionTime}</strong>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Shipping Transit:</span>
                    <strong>{tier.shippingTransit}</strong>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total Expectation:</span>
                    <span>{tier.totalTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* 4. VISUAL TIMELINE: HOW YOUR ORDER MOVES */}
        <section className={styles.timelineSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Step by Step</span>
            <h2 className={styles.sectionTitle}>How Your Order Moves</h2>
            <p className={styles.sectionDesc}>
              Transparent milestone tracking from our Bangalore studio to your hands.
            </p>
          </div>

          <div className={styles.orderMovementGrid}>
            {ORDER_MOVEMENT_STEPS.map((step) => (
              <div key={step.step} className={styles.movementStep}>
                <div className={styles.stepNumberBox}>{step.step}</div>
                <div className={styles.stepContent}>
                  <div className={styles.stepHeaderRow}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    {step.badge && <span className={styles.stepBadge}>{step.badge}</span>}
                  </div>
                  <p className={styles.stepText}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PACKAGING ASSURANCE & TRACKING UPDATES */}
        <section className={styles.packagingSection}>
          <div className={styles.packagingCol}>
            <PackageCheck size={28} color="var(--color-warm-brown)" style={{ marginBottom: 12 }} />
            <h3>Eco-Conscious, Padded Parcel Care</h3>
            <p>
              Polymer clay requires thoughtful handling. Every accessory is tucked in protective tissue, cushioned with bubble protection, and sealed in rigid recyclable cardboard mailers to withstand inter-city courier transit without chipping.
            </p>
          </div>

          <div className={styles.packagingCol}>
            <Clock size={28} color="var(--color-warm-brown)" style={{ marginBottom: 12 }} />
            <h3>SMS &amp; WhatsApp Tracking</h3>
            <p>
              As soon as your parcel is scanned by India Post or DTDC, an automated tracking link is dispatched to the mobile number provided during checkout so you can follow its transit in real time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
