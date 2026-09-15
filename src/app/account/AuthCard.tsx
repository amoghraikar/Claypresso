'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Package,
  ShieldCheck,
  Heart,
  Truck
} from 'lucide-react';
import { authService } from '@/services/authService';
import { User as UserType } from '@/types/auth';
import styles from './account.module.css';

interface AuthCardProps {
  initialMode: 'login' | 'register';
  guestNotice?: string;
}

export default function AuthCard({ initialMode, guestNotice }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password View
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Register Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setShowForgot(false);
    // Push the URL without full refresh for clean address bar & history
    if (newMode === 'login') {
      window.history.replaceState(null, '', '/account/login');
    } else {
      window.history.replaceState(null, '', '/account/register');
    }
  };

  // 1-Click Demo Customer Autofill (Priya Sharma)
  const handleFillDemoCustomer = () => {
    setLoginEmail('priya@example.com');
    setLoginPassword('PriyaPassword123!');
    setError(null);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await authService.login({ email: loginEmail, password: loginPassword }, rememberMe);
    setLoading(false);

    if (res.success && res.user) {
      const redirectUrl = searchParams.get('redirect') || '/account';
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid email or password. Please try again.');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await authService.register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: regEmail.trim(),
      phone: phone.trim(),
      password: regPassword,
      confirmPassword,
    });
    setLoading(false);

    if (res.success && res.user) {
      const redirectUrl = searchParams.get('redirect') || '/account';
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    await authService.requestPasswordReset(forgotEmail);
    setLoading(false);
    setForgotSent(true);
  };

  // If already authenticated
  if (currentUser) {
    return (
      <div className={styles.authPageWrapper}>
        <div className="container">
          <div className={styles.authCardContainer}>
            <div className={styles.authMainCard}>
              <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '999px',
                    background: 'var(--color-peach)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'var(--color-warm-brown)',
                  }}
                >
                  <User size={28} />
                </div>
                <h1 className={styles.authTitle} style={{ fontSize: 26, marginBottom: 8 }}>
                  Already Signed In
                </h1>
                <p className={styles.authSubtitle} style={{ marginBottom: 24 }}>
                  You are currently authenticated as <strong>{currentUser.email}</strong>.
                </p>
                <Link href="/account" className={styles.authSubmitBtn} style={{ textDecoration: 'none' }}>
                  <span>Proceed to Your Account</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPageWrapper}>
      <div className="container">
        <div className={styles.authCardContainer}>
          <div className={styles.authMainCard}>
            {/* Top Washi Tape Accent */}
            <div className={styles.authTopTape} aria-hidden="true" />

            {/* Atelier Studio Brand Seal */}
            <div className={styles.authBrandHeader}>
              <div className={styles.authStudioPill}>
                <Sparkles size={13} color="var(--color-warm-brown)" />
                <span>Bangalore Clay Atelier • Est. 2026</span>
              </div>
              <div className={styles.authLogoWrap}>
                <Image
                  src="/images/logo.png"
                  alt="Claypresso"
                  width={150}
                  height={46}
                  priority
                  className={styles.authLogoImg}
                />
              </div>
            </div>

            {/* Guest notice if arriving from checkout or protected action */}
            {guestNotice && (
              <div className={styles.authNoticeBanner}>
                <Sparkles size={14} style={{ flexShrink: 0 }} />
                <span>{guestNotice}</span>
              </div>
            )}

            {/* Symmetrical Segmented Tab Bar */}
            <div className={styles.authTabSegment} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => handleTabSwitch('login')}
                className={`${styles.authTabBtn} ${mode === 'login' ? styles.authTabBtnActive : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => handleTabSwitch('register')}
                className={`${styles.authTabBtn} ${mode === 'register' ? styles.authTabBtnActive : ''}`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className={styles.authError}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* =================================================================
                FORGOT PASSWORD FLOW
               ================================================================= */}
            {showForgot ? (
              <div className={styles.authForgotSection}>
                {forgotSent ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div className={styles.authSuccessIconWrap}>
                      <CheckCircle2 size={24} />
                    </div>
                    <h2 className={styles.authTitle} style={{ fontSize: 22, marginBottom: 8 }}>
                      Reset Link Dispatched
                    </h2>
                    <p className={styles.authSubtitle} style={{ marginBottom: 24 }}>
                      If an account exists for <strong>{forgotEmail}</strong>, we have sent password reset instructions to your inbox.
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
                  <form onSubmit={handleForgotSubmit} className={styles.authForm}>
                    <div className={styles.authHeadingSection}>
                      <h2 className={styles.authTitle}>Reset Your Password</h2>
                      <p className={styles.authSubtitle}>
                        Enter your account email and we will send you a secure link to recover your account.
                      </p>
                    </div>

                    <div className={styles.authFieldGroup}>
                      <label htmlFor="forgot-email" className={styles.authFieldLabel}>
                        Account Email Address
                      </label>
                      <div className={styles.authInputContainer}>
                        <Mail size={16} className={styles.authInputIcon} />
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className={styles.authInputField}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
                      {loading ? 'Sending link...' : 'Send Recovery Link'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(false);
                        setError(null);
                      }}
                      className={styles.authCancelBtn}
                    >
                      Cancel and return to Sign In
                    </button>
                  </form>
                )}
              </div>
            ) : mode === 'login' ? (
              /* =================================================================
                  SIGN IN MODE
                 ================================================================= */
              <div>
                <div className={styles.authHeadingSection}>
                  <h1 className={styles.authTitle}>Welcome back to the studio.</h1>
                  <p className={styles.authSubtitle}>
                    Sign in to track handcrafted orders, view your saved charms, and manage custom commissions.
                  </p>
                </div>

                {/* 1-Tap Demo Customer Autofill Pill */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={handleFillDemoCustomer}
                    className={styles.demoFillBtn}
                    title="1-click fill with customer Priya Sharma"
                  >
                    <span>✦ 1-Tap Fill Demo Customer (priya@example.com)</span>
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className={styles.authForm}>
                  {/* Email Field */}
                  <div className={styles.authFieldGroup}>
                    <label htmlFor="login-email" className={styles.authFieldLabel}>
                      Email Address
                    </label>
                    <div className={styles.authInputContainer}>
                      <Mail size={16} className={styles.authInputIcon} />
                      <input
                        id="login-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={styles.authInputField}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className={styles.authFieldGroup}>
                    <div className={styles.authLabelRow}>
                      <label htmlFor="login-password" className={styles.authFieldLabel}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(true);
                          setForgotEmail(loginEmail);
                          setError(null);
                        }}
                        className={styles.authForgotLink}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className={styles.authInputContainer}>
                      <Lock size={16} className={styles.authInputIcon} />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={styles.authInputField}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={styles.authPasswordToggle}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className={styles.authRememberRow}>
                    <label className={styles.authCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={styles.authCheckbox}
                      />
                      <span>Keep me signed in for 7 days</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
                    {loading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In to Atelier</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className={styles.authFooter}>
                  <span>New to Claypresso?</span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className={styles.authSwitchBtn}
                  >
                    Create an account →
                  </button>
                </div>
              </div>
            ) : (
              /* =================================================================
                  CREATE ACCOUNT MODE
                 ================================================================= */
              <div>
                <div className={styles.authHeadingSection}>
                  <h1 className={styles.authTitle}>Join the Claypresso Circle.</h1>
                  <p className={styles.authSubtitle}>
                    Create your account to enjoy fast checkout, track custom orders from Bangalore oven to doorstep, and access private drops.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className={styles.authForm}>
                  {/* First & Last Name Row */}
                  <div className={styles.authFieldRow}>
                    <div className={styles.authFieldGroup}>
                      <label htmlFor="reg-first-name" className={styles.authFieldLabel}>
                        First Name *
                      </label>
                      <div className={styles.authInputContainer}>
                        <User size={16} className={styles.authInputIcon} />
                        <input
                          id="reg-first-name"
                          type="text"
                          required
                          placeholder="Priya"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={styles.authInputField}
                          autoComplete="given-name"
                        />
                      </div>
                    </div>

                    <div className={styles.authFieldGroup}>
                      <label htmlFor="reg-last-name" className={styles.authFieldLabel}>
                        Last Name
                      </label>
                      <div className={styles.authInputContainer}>
                        <User size={16} className={styles.authInputIcon} />
                        <input
                          id="reg-last-name"
                          type="text"
                          placeholder="Sharma"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={styles.authInputField}
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className={styles.authFieldGroup}>
                    <label htmlFor="reg-email" className={styles.authFieldLabel}>
                      Email Address *
                    </label>
                    <div className={styles.authInputContainer}>
                      <Mail size={16} className={styles.authInputIcon} />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={styles.authInputField}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div className={styles.authFieldGroup}>
                    <label htmlFor="reg-phone" className={styles.authFieldLabel}>
                      Phone Number (Optional)
                    </label>
                    <div className={styles.authInputContainer}>
                      <Phone size={16} className={styles.authInputIcon} />
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={styles.authInputField}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Row */}
                  <div className={styles.authFieldRow}>
                    <div className={styles.authFieldGroup}>
                      <label htmlFor="reg-password" className={styles.authFieldLabel}>
                        Password *
                      </label>
                      <div className={styles.authInputContainer}>
                        <Lock size={16} className={styles.authInputIcon} />
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="At least 6 chars"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className={styles.authInputField}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className={styles.authPasswordToggle}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.authFieldGroup}>
                      <label htmlFor="reg-confirm" className={styles.authFieldLabel}>
                        Confirm *
                      </label>
                      <div className={styles.authInputContainer}>
                        <Lock size={16} className={styles.authInputIcon} />
                        <input
                          id="reg-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={styles.authInputField}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className={styles.authPasswordToggle}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Newsletter Checkbox */}
                  <div className={styles.authRememberRow}>
                    <label className={styles.authCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className={styles.authCheckbox}
                      />
                      <span>Receive quiet announcements about new small-batch drops and secret slots</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
                    {loading ? (
                      <span>Creating your account...</span>
                    ) : (
                      <>
                        <span>Create Atelier Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className={styles.authFooter}>
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className={styles.authSwitchBtn}
                  >
                    Sign in here →
                  </button>
                </div>
              </div>
            )}

            {/* Quick Guest Order Tracking Shortcut */}
            <div className={styles.authGuestTrackWrap}>
              <span>Looking to track a parcel without signing in?</span>
              <Link href="/track-order" className={styles.authGuestTrackLink}>
                <span>Track Order</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Reassurance Trust Strip */}
            <div className={styles.authTrustStrip}>
              <div className={styles.authTrustItem}>
                <Sparkles size={13} color="var(--color-warm-brown)" />
                <span>100% Handcrafted</span>
              </div>
              <div className={styles.authTrustItem}>
                <Truck size={13} color="var(--color-warm-brown)" />
                <span>India-Wide Delivery</span>
              </div>
              <div className={styles.authTrustItem}>
                <ShieldCheck size={13} color="var(--color-warm-brown)" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
