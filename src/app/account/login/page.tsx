'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User as UserType } from '@/types/auth';
import styles from '../account.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'admin' ? 'admin' : 'customer';

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(initialMode);
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
    if (searchParams.get('mode') === 'admin') {
      setActiveTab('admin');
      setEmail('admin@claypresso.com');
      setPassword('AdminPassword123!');
    }
  }, [searchParams]);

  const handleQuickFillAdmin = () => {
    setActiveTab('admin');
    setEmail('admin@claypresso.com');
    setPassword('AdminPassword123!');
    setError(null);
  };

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
      // If user is Admin, guide them directly to the Admin Studio Portal!
      if (res.user.role === 'ADMIN' || activeTab === 'admin') {
        const redirectUrl = searchParams.get('redirect') || '/admin';
        router.push(redirectUrl);
      } else {
        router.push('/account');
      }
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

  // If already logged in as Admin, show quick jump actions
  if (currentUser && currentUser.role === 'ADMIN') {
    return (
      <div className={styles.authContainer} style={{ maxWidth: 520 }}>
        <div
          className={styles.authCard}
          style={{
            position: 'relative',
            boxShadow: 'var(--shadow-clay-card)',
            border: '2px solid var(--color-warm-brown)',
            backgroundColor: '#FFFFFF',
            padding: '36px 28px',
          }}
        >
          <div className="washi-tape washi-tape-top-right washi-tape-peach" aria-hidden="true" />
          
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="stamp-seal" style={{ margin: '0 auto 12px' }} aria-hidden="true">
              <span>Claypresso Studio</span>
              <span>Admin Verified • BLR</span>
            </div>

            <h1 className={styles.authTitle} style={{ fontSize: '26px' }}>
              Welcome Back, Studio Owner!
            </h1>
            <p className={styles.authSubtitle}>
              You are currently authenticated with Full Administrator privileges ({currentUser.email}).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            <Link
              href="/admin/products/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'var(--color-espresso)',
                color: '#FFFFFF',
                padding: '14px 20px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-clay-button)',
              }}
            >
              <Plus size={18} />
              <span>+ Add New Product to Store</span>
            </Link>

            <Link
              href="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'var(--color-cream)',
                color: 'var(--color-espresso)',
                border: '1.5px solid var(--color-border)',
                padding: '12px 20px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              <LayoutDashboard size={16} />
              <span>Open Studio Operations Dashboard</span>
            </Link>

            <Link
              href="/account"
              style={{
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--color-muted-brown)',
                marginTop: 8,
                textDecoration: 'underline',
              }}
            >
              View Customer Profile & Past Orders →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer} style={{ maxWidth: 480 }}>
      {/* Editorial Claymorphic Card with Scrapbook Washi Tape */}
      <div
        className={styles.authCard}
        style={{
          position: 'relative',
          boxShadow: 'var(--shadow-clay-card)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          padding: '36px 32px',
          border: '1px solid var(--color-border-warm)',
        }}
      >
        <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />

        {/* Tab Switcher: Customer vs Studio Owner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--color-cream-soft)',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '24px',
            border: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setError(null);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'customer' ? 'var(--color-espresso)' : 'transparent',
              color: activeTab === 'customer' ? '#FFFFFF' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Customer
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'admin' ? 'var(--color-espresso)' : 'transparent',
              color: activeTab === 'admin' ? '#FFFFFF' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            <span>✦ Studio Owner</span>
          </button>
        </div>

        {/* Header Branding */}
        <div className={styles.authHeader} style={{ marginBottom: 20 }}>
          <h1 className={styles.authTitle} style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
            {activeTab === 'admin' ? 'Studio Owner Sign In' : 'Welcome Back'}
          </h1>
          <p className={styles.authSubtitle}>
            {activeTab === 'admin'
              ? 'Access studio catalog, add new pieces, and manage commissions.'
              : 'Access your orders, tracked deliveries, and wishlist items.'}
          </p>
        </div>

        {/* Admin 1-Click Fill Helper Banner */}
        {activeTab === 'admin' && (
          <div
            style={{
              backgroundColor: 'var(--color-peach-light)',
              border: '1px dashed var(--color-warm-brown)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)' }}>
                Studio Owner Account
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)' }}>
                Tap to auto-fill credentials
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickFillAdmin}
              style={{
                backgroundColor: 'var(--color-warm-brown)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Fill Credentials
            </button>
          </div>
        )}

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

        {/* Forgot Password Accordion */}
        {showForgot ? (
          <form onSubmit={handleForgotSubmit} className={styles.authForm}>
            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={36} color="var(--color-warm-brown)" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-espresso)', margin: '0 0 4px' }}>
                  Reset Link Sent
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
                  If an account exists for {forgotEmail}, instructions were dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotSent(false);
                  }}
                  className={styles.authLink}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Return to Log In
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
                  Enter your email address to receive a secure password reset link.
                </p>
                <div>
                  <label htmlFor="forgot-email" className={styles.formLabel}>
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.formInput}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  style={{ backgroundColor: 'var(--color-espresso)', boxShadow: 'var(--shadow-clay-button)' }}
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </>
            )}
          </form>
        ) : (
          /* Main Login Form */
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div>
              <label htmlFor="login-email" className={styles.formLabel}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin@claypresso.com' : 'you@example.com'}
                className={styles.formInput}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="login-password" className={styles.formLabel} style={{ marginBottom: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    color: 'var(--color-warm-brown)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Forgot?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.formInput}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
              style={{
                backgroundColor: 'var(--color-espresso)',
                boxShadow: 'var(--shadow-clay-button)',
                marginTop: '8px',
              }}
            >
              <span>{loading ? 'Authenticating...' : activeTab === 'admin' ? 'Enter Studio Admin →' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className={styles.authFooter}>
          {activeTab === 'admin' ? (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px' }}>
                Need help with studio credentials? Check your studio configuration.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('customer')}
                style={{ background: 'none', border: 'none', color: 'var(--color-warm-brown)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Switch to Customer Login
              </button>
            </div>
          ) : (
            <div>
              <span>New to Claypresso? </span>
              <Link href="/account/register" className={styles.authLink}>
                Create an account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.accountPage}>
      <div className="container">
        <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading authentication...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
