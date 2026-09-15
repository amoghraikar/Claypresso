'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { authService } from '@/services/authService';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('admin@claypresso.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === 'ADMIN') {
      const redirectUrl = searchParams.get('returnUrl') || '/admin';
      router.push(redirectUrl);
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both administrator email and password.');
      return;
    }

    setLoading(true);
    const res = await authService.login({ email, password });
    setLoading(false);

    if (res.success && res.user) {
      if (res.user.role !== 'ADMIN') {
        await authService.logout();
        setError('Access Denied: This portal is strictly restricted to the Studio Owner.');
        return;
      }

      const redirectUrl = searchParams.get('returnUrl') || '/admin';
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid administrator credentials. Access denied.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#231711',
        backgroundImage: 'radial-gradient(ellipse at top, rgba(141, 90, 60, 0.25) 0%, rgba(35, 23, 17, 1) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#2F2018',
          borderRadius: '26px',
          border: '1.5px solid rgba(232, 220, 209, 0.16)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(255, 255, 255, 0.08)',
          padding: '44px 36px',
          zIndex: 2,
        }}
      >
        {/* Top Peach Washi Tape */}
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%) rotate(1deg)',
            width: '100px',
            height: '24px',
            backgroundColor: 'rgba(246, 217, 200, 0.85)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            borderLeft: '2px dashed rgba(255, 255, 255, 0.6)',
            borderRight: '2px dashed rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* Studio Operations Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(235, 122, 102, 0.18)',
              border: '1px solid rgba(235, 122, 102, 0.35)',
              color: '#F6D9C8',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={12} color="#EB7A66" />
            <span>Claypresso Studio Operations</span>
          </div>

          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/logo-light.png"
              alt="Claypresso"
              width={160}
              height={48}
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              priority
            />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 600,
              color: '#FFF6EE',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Studio Owner Sign In
          </h1>
          <p style={{ fontSize: '13px', color: '#D4C9BC', margin: 0, lineHeight: 1.5 }}>
            Private management console for catalog inventory, custom commissions, and product publishing.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(169, 76, 69, 0.25)',
              border: '1px solid #A94C45',
              color: '#F8B4AF',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: 1.4,
            }}
          >
            <ShieldAlert size={18} color="#F8B4AF" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#D4C9BC',
                marginBottom: '8px',
              }}
            >
              Owner Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail
                size={16}
                color="#C4B5A5"
                style={{ position: 'absolute', left: 14, pointerEvents: 'none', opacity: 0.8 }}
              />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@claypresso.com"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 14px 0 40px',
                  backgroundColor: '#221611',
                  border: '1.5px solid rgba(232, 220, 209, 0.2)',
                  borderRadius: '12px',
                  color: '#FFF6EE',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#D4C9BC',
                marginBottom: '8px',
              }}
            >
              Master Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock
                size={16}
                color="#C4B5A5"
                style={{ position: 'absolute', left: 14, pointerEvents: 'none', opacity: 0.8 }}
              />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 42px 0 40px',
                  backgroundColor: '#221611',
                  border: '1.5px solid rgba(232, 220, 209, 0.2)',
                  borderRadius: '12px',
                  color: '#FFF6EE',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  padding: 6,
                  color: '#C4B5A5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 1-Click Studio Owner Autofill */}
          <button
            type="button"
            onClick={() => {
              setEmail('admin@claypresso.com');
              setPassword('AdminPassword123!');
              setError(null);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#EB7A66',
              background: 'rgba(235, 122, 102, 0.12)',
              border: '1px dashed rgba(235, 122, 102, 0.4)',
              borderRadius: '999px',
              padding: '6px 14px',
              cursor: 'pointer',
              alignSelf: 'center',
              transition: 'all 150ms ease',
            }}
          >
            <span>✦ 1-Tap Fill Studio Owner Credentials</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: '50px',
              marginTop: '4px',
              backgroundColor: '#EB7A66',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(235, 122, 102, 0.35)',
              transition: 'all 180ms ease',
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Operations Studio</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security & Return Link */}
        <div style={{ marginTop: '26px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '12.5px',
              color: '#D4C9BC',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <span>← Return to Public Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', backgroundColor: '#231711', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#F6D9C8' }}>Loading Studio Portal...</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
