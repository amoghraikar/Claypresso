'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className={styles.footerWrapper}>
      <div className="container">
        {/* Newsletter Callout */}
        <div className={styles.newsletterCard}>
          <h2 className={styles.newsletterTitle}>Get first dibs on new drops.</h2>
          <p className={styles.newsletterSub}>
            Small batches sell out fast. Join our quiet little email list for release announcements, secret custom slots, and studio stories.
          </p>

          {subscribed ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(85, 122, 97, 0.25)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-ivory)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Check size={18} color="var(--color-success)" />
              <span>You are on the list! Thank you for supporting handmade.</span>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                aria-label="Email for new drop announcements"
              />
              <Button
                variant="accent"
                size="md"
                type="submit"
                icon={<ArrowRight size={16} />}
              >
                Join
              </Button>
            </form>
          )}
        </div>

        {/* 4 Footer Columns */}
        <div className={styles.footerGrid}>
          {/* Brand Intro Column */}
          <div className={styles.brandCol}>
            <div style={{ marginBottom: '8px' }}>
              <Image
                src="/images/logo-light.png"
                alt="Claypresso — Made with love"
                width={150}
                height={46}
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <p className={styles.brandDesc}>
              Handmade clay pieces, tiny phone charms, and custom creations shaped with love and patience in Bangalore, India.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-peach)' }}>
              Studio: Bangalore • Shipping India-wide
            </p>
          </div>

          {/* Column 1: SHOP */}
          <div>
            <h3 className={styles.colTitle}>Shop</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/shop" className={styles.link}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className={styles.link}>
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=bestseller" className={styles.link}>
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=gifts" className={styles.link}>
                  Gifts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div>
            <h3 className={styles.colTitle}>Help</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/faq" className={styles.link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className={styles.link}>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.link}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ABOUT */}
          <div>
            <h3 className={styles.colTitle}>About</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.link}>
                  About Claypresso
                </Link>
              </li>
              <li>
                <Link href="/custom" className={styles.link}>
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: SOCIAL */}
          <div>
            <h3 className={styles.colTitle}>Social</h3>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="https://www.instagram.com/claypresso/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Instagram ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className={styles.bottomRow}>
          <div>
            © {new Date().getFullYear()} Claypresso Handmade Studio. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <Link href="/shipping" className={styles.link}>
              Shipping & Returns
            </Link>
            <span>•</span>
            <Link href="/faq" className={styles.link}>
              Care Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
