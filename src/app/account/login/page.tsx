'use client';

import React, { Suspense } from 'react';
import AuthCard from '../AuthCard';
import styles from '../account.module.css';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.authPageWrapper}>
          <div className="container">
            <p style={{ textAlign: 'center', color: 'var(--color-muted-brown)' }}>Loading Atelier...</p>
          </div>
        </div>
      }
    >
      <AuthCard initialMode="login" />
    </Suspense>
  );
}
