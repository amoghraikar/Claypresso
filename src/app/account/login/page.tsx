'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import styles from '../account.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await authService.login({ email, password });
    setLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Enter a valid email address to request password reset.');
      return;
    }

    await authService.requestPasswordReset(forgotEmail);
    setForgotSent(true);
  };

  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.authContainer}>
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
                <Lock size={20} />
              </div>
              <h1 className={styles.authTitle}>Log In</h1>
              <p className={styles.authSubtitle}>
                Access your past orders, tracking, and wishlist.
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

            {!showForgot ? (
              <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
                <div>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: 6,
                      color: 'var(--color-espresso)',
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="pooja@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <label
                      htmlFor="login-password"
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-espresso)',
                      }}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setForgotSent(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '12px',
                        color: 'var(--color-warm-brown)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.primaryAuthBtn}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                >
                  {loading ? 'Logging in...' : 'LOG IN →'}
                </button>
              </form>
            ) : (
              /* Forgot Password Flow */
              <div style={{ marginTop: 8 }}>
                {forgotSent ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: 8 }}>
                      CHECK YOUR INBOX.
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                      If an account exists for that email, you will receive instructions to reset your password.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className={styles.secondaryAuthBtn}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Back to Log In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className={styles.authForm}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                      Enter your email address below and we&apos;ll send instructions to reset your password.
                    </p>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={styles.inputField}
                    />
                    <button
                      type="submit"
                      className={styles.primaryAuthBtn}
                      style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                    >
                      SEND RESET LINK →
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                    >
                      Cancel &amp; return to log in
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className={styles.authFooter}>
              <span>
                Don&apos;t have an account yet?{' '}
                <Link href="/account/register" className={styles.authLink}>
                  Create Account
                </Link>
              </span>
              <span>
                Looking to track a recent order?{' '}
                <Link href="/track-order" className={styles.authLink}>
                  Track Order (No Login Needed)
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
