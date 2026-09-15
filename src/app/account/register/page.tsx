'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
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
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
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
      firstName,
      lastName,
      email,
      phone,
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
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-peach)',
                  color: 'var(--color-warm-brown)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <UserPlus size={20} />
              </div>
              <h1 className={styles.authTitle}>Create an Account</h1>
              <p className={styles.authSubtitle}>
                Save your addresses, view past orders, and manage wishlist pieces.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
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

            <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    htmlFor="reg-fname"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    First Name *
                  </label>
                  <input
                    id="reg-fname"
                    type="text"
                    required
                    placeholder="Pooja"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-lname"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    id="reg-lname"
                    type="text"
                    placeholder="Nair"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: 'var(--color-espresso)',
                  }}
                >
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="pooja@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: 4,
                    color: 'var(--color-espresso)',
                  }}
                >
                  Mobile Number <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label
                    htmlFor="reg-pwd"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    Password (6+ chars) *
                  </label>
                  <input
                    id="reg-pwd"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-cpwd"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: 4,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="reg-cpwd"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>

              {/* Explicitly Optional Newsletter Opt-In */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                <input
                  id="reg-newsletter"
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  style={{ accentColor: 'var(--color-warm-brown)', marginTop: 3, width: 16, height: 16 }}
                />
                <label htmlFor="reg-newsletter" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  (Optional) Send me quiet drop announcements and occasional studio news.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.primaryAuthBtn}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              >
                {loading ? 'Creating Account...' : 'CREATE ACCOUNT →'}
              </button>
            </form>

            <div className={styles.authFooter}>
              <span>
                Already have an account?{' '}
                <Link href="/account/login" className={styles.authLink}>
                  Log In
                </Link>
              </span>
              <span>
                Guest checkout is always default • No account required to buy.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
