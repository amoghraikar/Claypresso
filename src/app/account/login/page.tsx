'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User as UserType } from '@/types/auth';
import styles from '../account.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      router.push('/account');
    }
  }, [router]);

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

    if (res.success && res.user) {
      const redirectUrl = searchParams.get('redirect') || '/account';
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid email or password. Please try again.');
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

  if (currentUser) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
          <h1 className={styles.authTitle}>Already Signed In</h1>
          <p className={styles.authSubtitle}>
            You are signed in as {currentUser.email}.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link
              href="/account"
              className={styles.authSubmitBtn}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span>Go to My Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Decorative Washi Tape Accent */}
        <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--color-warm-brown)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Sparkles size={14} />
            <span>Claypresso Club</span>
          </div>

          <h1 className={styles.authTitle}>
            Welcome back.
          </h1>
          <p className={styles.authSubtitle}>
            Sign in to track orders, manage custom commissions, and save your favorite handmade pieces.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className={styles.authErrorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Modal / View */}
        {showForgot ? (
          <div>
            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: '999px', background: '#EDF3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-success)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-espresso)', marginBottom: 8 }}>
                  Reset link sent!
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  If an account exists for <strong>{forgotEmail}</strong>, we have dispatched instructions to reset your password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                    setError(null);
                  }}
                  className={styles.authSubmitBtn}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="forgot-email" className={styles.label}>
                    Your Account Email
                  </label>
                  <div className={styles.inputIconWrapper}>
                    <Mail size={16} className={styles.fieldIcon} />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={styles.inputWithIcon}
                      autoFocus
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                  <button type="submit" className={styles.authSubmitBtn}>
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setError(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 8,
                    }}
                  >
                    Cancel and Return
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputIconWrapper}>
                <Mail size={16} className={styles.fieldIcon} />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputWithIcon}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotEmail(email);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-warm-brown)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className={styles.inputIconWrapper}>
                <Lock size={16} className={styles.fieldIcon} />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputWithIcon}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.authSubmitBtn}
              style={{ marginTop: 12 }}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Create Account Link */}
        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Don&apos;t have an account yet?{' '}
            <Link
              href="/account/register"
              style={{
                fontWeight: 700,
                color: 'var(--color-warm-brown)',
                textDecoration: 'none',
              }}
            >
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <p style={{ textAlign: 'center', color: 'var(--color-muted-brown)' }}>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
