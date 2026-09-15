import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';
import { CartDrawer } from '@/components/common/CartDrawer/CartDrawer';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Claypresso — Handmade Clay Accessories | Bangalore',
  description:
    'Handmade clay charms, keychain charms, mini phone straps, magnets, trays and bespoke custom accessories shaped with care in Bangalore, India.',
  keywords: [
    'handmade clay charms',
    'clay accessories Bangalore',
    'phone charms India',
    'custom clay keychains',
    'polymer clay studio',
    'handmade gifts India',
  ],
  authors: [{ name: 'Claypresso Studio' }],
  metadataBase: new URL('https://claypresso.com'),
  openGraph: {
    title: 'Claypresso — Handmade Clay Accessories',
    description: 'Little things. Big personality. Handmade clay accessories from Bangalore.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Claypresso',
  },
};

import { MouseProvider } from '@/context/MouseContext';
import { CustomCursor } from '@/components/common/CustomCursor/CustomCursor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <MouseProvider>
          <CartProvider>
            <CustomCursor />
            <a
              href="#main-content"
              className="sr-only"
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'var(--color-espresso)',
                color: 'var(--color-ivory)',
                padding: '8px 16px',
                zIndex: 99999,
              }}
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </MouseProvider>
      </body>
    </html>
  );
}
