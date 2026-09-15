'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Home,
  ShoppingBag,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { customRequestService } from '@/services/customRequestService';
import { CustomRequestPayload } from '@/types/custom';
import styles from './success.module.css';

export default function CustomRequestSuccessPage() {
  const [request, setRequest] = useState<CustomRequestPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const latestId = customRequestService.getLatestRequestId();
    if (latestId) {
      const found = customRequestService.getRequestById(latestId);
      setRequest(found);
    }
    setLoading(false);
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Claypresso reviews your request',
      desc: 'We examine your description, reference photos, dimensions, and clay requirements.',
    },
    {
      num: '02',
      title: 'You receive a quote',
      desc: 'We will message you via email or WhatsApp within 24–48 hours with transparent pricing and details.',
    },
    {
      num: '03',
      title: 'You approve the design and price',
      desc: 'We discuss any adjustments, colors, or size tweaks before anything is set in stone.',
    },
    {
      num: '04',
      title: 'You complete payment',
      desc: 'Once you are 100% happy with the quote and concept, secure payment is completed.',
    },
    {
      num: '05',
      title: 'Production begins',
      desc: 'Your custom creation is individually hand-sculpted, oven-cured, and glazed in Bangalore (~25 days).',
    },
    {
      num: '06',
      title: 'Your piece ships',
      desc: 'Safely boxed and dispatched with tracking provided directly to your phone (~4 days transit across India).',
    },
  ];

  return (
    <div className={styles.successPage}>
      <div className="container">
        <div className={styles.successCard}>
          {/* Header & Animated Checkmark */}
          <div className={styles.headerWrap}>
            <div className={styles.iconCircle} aria-hidden="true">
              <Sparkles size={16} className={styles.sparkleIcon} />
              <svg className={styles.checkmarkSvg} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" className={styles.checkmarkPath} />
              </svg>
            </div>
            <h1 className={styles.pageTitle}>WE&apos;VE GOT YOUR IDEA.</h1>
            <p className={styles.pageSubtitle}>
              Claypresso will review your request and get back to you with a quote.
            </p>
          </div>

          {/* Reference Banner if request is loaded from session */}
          {request && (
            <div className={styles.referenceBox}>
              <div className={styles.refCol}>
                <span className={styles.refLabel}>Commission Request ID</span>
                <span className={styles.refValue}>#{request.referenceNumber}</span>
              </div>
              <div className={styles.refCol}>
                <span className={styles.refLabel}>Submitted For</span>
                <span className={styles.refValue}>{request.customer.fullName}</span>
              </div>
              <div className={styles.refCol}>
                <span className={styles.refLabel}>Category</span>
                <span className={styles.refValue}>
                  {request.customCategoryDetails
                    ? `Other (${request.customCategoryDetails})`
                    : request.category}
                </span>
              </div>
            </div>
          )}

          {/* Snapshot Summary if loaded */}
          {request && (
            <div className={styles.snapshotBox}>
              <h2 className={styles.snapshotTitle}>Submitted Details</h2>
              <div className={styles.snapshotList}>
                <div className={styles.snapshotItem}>
                  <span>Description:</span>
                  <strong>{request.description}</strong>
                </div>
                {request.preferredColors && (
                  <div className={styles.snapshotItem}>
                    <span>Colors:</span>
                    <strong>{request.preferredColors}</strong>
                  </div>
                )}
                {request.referenceImages.length > 0 && (
                  <div className={styles.snapshotItem}>
                    <span>Reference Images:</span>
                    <strong>{request.referenceImages.length} attached</strong>
                  </div>
                )}
                <div className={styles.snapshotItem}>
                  <span>Pricing Status:</span>
                  <strong style={{ color: 'var(--color-warm-brown)' }}>
                    Pending Studio Review (No Charge Yet)
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* WHAT HAPPENS NEXT */}
          <div className={styles.roadmapSection}>
            <h2 className={styles.roadmapHeading}>What Happens Next</h2>
            <div className={styles.roadmapList}>
              {steps.map((step) => (
                <div key={step.num} className={styles.roadmapStep}>
                  <span className={styles.stepNumPill}>{step.num}</span>
                  <div className={styles.stepDetails}>
                    <div className={styles.stepLabel}>{step.title}</div>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation CTAs */}
          <div className={styles.ctaButtonGroup}>
            <Link href="/shop" className={styles.primaryCta}>
              <ShoppingBag size={18} />
              <span>BACK TO SHOP</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/" className={styles.secondaryCta}>
              <Home size={18} />
              <span>BACK TO HOME</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
