'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, UserPlus, AlertCircle, Heart } from 'lucide-react';
import { authService } from '@/services/authService';
import styles from '../account.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await authService.register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
    });
    setLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.authContainer} style={{ maxWidth: '520px' }}>
          {/* Tactile Claymorphic Card with Scrapbook Washi Tape */}
          <div
            className={styles.authCard}
            style={{
              position: 'relative',
              boxShadow: 'var(--shadow-clay-card)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: '#FFFFFF',
              padding: '38px 32px',
              border: '1px solid var(--color-border-warm)',
            }}
          >
            <div className="washi-tape washi-tape-top-right washi-tape-sage" aria-hidden="true" />

            <div className={styles.authHeader} style={{ marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-peach)',
                  color: 'var(--color-warm-brown)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: 'var(--shadow-clay-pill)',
                }}
              >
                <Heart size={20} fill="var(--color-warm-brown)" />
              </div>
              <h1 className={styles.authTitle} style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
                Join the Clay Atelier
              </h1>
              <p className={styles.authSubtitle}>
                Save delivery details, track courier transit, and curate your dream collection.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '18px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label htmlFor="reg-first-name" className={styles.formLabel}>
                    First Name *
                  </label>
                  <input
                    id="reg-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Priya"
                    className={styles.formInput}
                    autoComplete="given-name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-last-name" className={styles.formLabel}>
                    Last Name
                  </label>
                  <input
                    id="reg-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    className={styles.formInput}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className={styles.formLabel}>
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className={styles.formInput}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className={styles.formLabel}>
                  Phone Number (Optional for SMS updates)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={styles.formInput}
                  autoComplete="tel"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label htmlFor="reg-password" className={styles.formLabel}>
                    Password *
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className={styles.formInput}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-confirm-password" className={styles.formLabel}>
                    Confirm Password *
                  </label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={styles.formInput}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  marginTop: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--color-warm-brown)' }}
                />
                <span>Receive studio letters, drop countdowns, and secret bespoke slots.</span>
              </label>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
                style={{
                  backgroundColor: 'var(--color-espresso)',
                  boxShadow: 'var(--shadow-clay-button)',
                  marginTop: '12px',
                }}
              >
                <span>{loading ? 'Creating Account...' : 'Create My Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className={styles.authFooter}>
              <span>Already have an account? </span>
              <Link href="/account/login" className={styles.authLink}>
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
