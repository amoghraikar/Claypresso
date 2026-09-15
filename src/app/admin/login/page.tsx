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
  CheckCircle2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { authService } from '@/services/authService';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('admin@claypresso.com');
  const [password, setPassword] = useState('AdminPassword123!');
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
        backgroundColor: '#1C1512',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(235, 122, 102, 0.12) 0%, rgba(28, 21, 18, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#2A201C',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          padding: '40px 32px',
          zIndex: 2,
        }}
      >
        {/* Studio Operations Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(235, 122, 102, 0.15)',
              border: '1px solid rgba(235, 122, 102, 0.3)',
              color: '#F6D9C8',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={13} color="#EB7A66" />
            <span>Claypresso Studio Portal</span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <Image
              src="/images/logo-light.png"
              alt="Claypresso"
              width={160}
              height={48}
              style={{ height: '42px', width: 'auto', objectFit: 'contain', margin: '0 auto' }}
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
          <p style={{ fontSize: '13px', color: '#A89F91', margin: 0, lineHeight: 1.5 }}>
            Restricted operations management, inventory catalog, and product publishing.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(169, 76, 69, 0.2)',
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
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#D4C9BC',
                marginBottom: '8px',
              }}
            >
              Owner Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#8C827A"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
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
                  padding: '12px 14px 12px 40px',
                  backgroundColor: '#1E1714',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '12px',
                  color: '#FFF6EE',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#D4C9BC',
                marginBottom: '8px',
              }}
            >
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#8C827A"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  backgroundColor: '#1E1714',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '12px',
                  color: '#FFF6EE',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
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
              fontSize: '11px',
              fontWeight: 700,
              color: '#EB7A66',
              background: 'none',
              border: 'none',
              padding: '2px 0',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <span>✦ 1-Click Fill Owner Credentials</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: '8px',
              padding: '14px 20px',
              backgroundColor: '#EB7A66',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(235, 122, 102, 0.35)',
              transition: 'all 200ms ease',
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

        {/* Return to Public Website */}
        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '12px',
              color: '#A89F91',
              textDecoration: 'none',
            }}
          >
            <span>Return to Public Storefront</span>
            <ExternalLink size={13} />
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
        <div style={{ minHeight: '100vh', backgroundColor: '#1C1512', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#F6D9C8' }}>Loading Studio Portal...</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
