'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X, Instagram, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { Magnetic } from '@/components/common/Motion';
import { BUSINESS_RULES } from '@/types/product';
import styles from './Header.module.css';

import { authService } from '@/services/authService';
import { User as UserType } from '@/types/auth';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart, cartBumped } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Close mobile drawer on route change & refresh current user session
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setCurrentUser(authService.getCurrentUser());
  }, [pathname]);

  const isCheckout = pathname === '/checkout';
  const isOrderConfirmation = pathname?.startsWith('/order-confirmation');

  if (isCheckout || isOrderConfirmation) {
    return (
      <header className={styles.headerWrapper}>
        <div className="container">
          <div className={styles.checkoutHeaderInner}>
            <Link href="/" className={styles.brandLink} aria-label="Claypresso Home">
              <Image
                src="/images/logo.png"
                alt="Claypresso — Made with love"
                width={150}
                height={46}
                priority
                className={styles.brandLogoImg}
              />
            </Link>

            <div className={styles.checkoutSecurityBadge}>
              <ShieldCheck size={16} strokeWidth={2.2} />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>

            {isCheckout ? (
              <Link href="/cart" className={styles.checkoutBackLink} aria-label="Return to shopping cart">
                <ArrowLeft size={16} />
                <span>Return to Cart</span>
              </Link>
            ) : (
              <Link href="/shop" className={styles.checkoutBackLink} aria-label="Continue Shopping">
                <span>Continue Shopping →</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'New', href: '/shop?collection=new-arrivals' },
    { name: 'Bestsellers', href: '/shop?collection=bestsellers' },
    { name: 'Custom', href: '/custom' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className={styles.headerWrapper}>
      {/* Subtle Trust Ribbon */}
      <div className={styles.announcementBar}>
        Handmade in Bangalore • <span>Free shipping across India on orders ₹500+</span>
      </div>

      <div className="container">
        <div className={styles.headerInner}>
          {/* Exact Official Claypresso Brand Logo */}
          <Link href="/" className={styles.brandLink} aria-label="Claypresso Home">
            <Image
              src="/images/logo.png"
              alt="Claypresso — Made with love"
              width={160}
              height={50}
              priority
              className={styles.brandLogoImg}
            />
          </Link>

          {/* Desktop Navigation with Micro Magnetic Physics */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Magnetic key={link.name} strength={0.2} maxOffset={5}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                    data-cursor="link"
                  >
                    {link.name}
                  </Link>
                </Magnetic>
              );
            })}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search Trigger */}
            <IconButton
              icon={<Search size={20} strokeWidth={2} />}
              aria-label="Search accessories"
              onClick={() => setSearchOpen((prev) => !prev)}
              data-cursor="button"
            />

            {/* Instagram Social Link */}
            <a
              href={BUSINESS_RULES.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Claypresso Instagram"
              style={{ display: 'flex' }}
              data-cursor="link"
            >
              <IconButton
                icon={<Instagram size={19} strokeWidth={2} />}
                aria-label="Instagram @claypresso"
                tabIndex={-1}
              />
            </a>

            {/* Account Link */}
            <Link
              href="/account"
              aria-label={currentUser ? `Account (${currentUser.firstName})` : 'My Account'}
              style={{ display: 'flex', position: 'relative' }}
              data-cursor="link"
            >
              <IconButton
                icon={<User size={20} strokeWidth={2} />}
                aria-label={currentUser ? `Account (${currentUser.firstName})` : 'My Account'}
                tabIndex={-1}
              />
              {currentUser && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: '999px',
                    background: 'var(--color-warm-brown)',
                    boxShadow: '0 0 0 2px var(--color-bg-primary)',
                  }}
                  title={`Logged in as ${currentUser.firstName}`}
                />
              )}
            </Link>

            {/* Cart Trigger with Magnetic Interaction & Physical Bump */}
            <Magnetic strength={0.25} maxOffset={8}>
              <button
                id="header-cart-btn"
                type="button"
                className={`${styles.cartButton} ${cartBumped ? styles.cartButtonBump : ''}`}
                onClick={openCart}
                aria-label={`Open shopping cart, ${totalItems} items`}
                data-cursor="button"
              >
                <ShoppingBag size={18} />
                <span className="sr-only">Cart</span>
                <span className={styles.cartCountPill}>{totalItems}</span>
              </button>
            </Magnetic>

            {/* Mobile Menu Hamburger */}
            <div className={styles.mobileMenuToggle}>
              <IconButton
                icon={mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inline Search Drawer/Bar */}
      {searchOpen && (
        <div
          style={{
            background: 'var(--color-cream)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 0',
          }}
        >
          <div className="container" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Search size={20} color="var(--color-warm-brown)" />
            <input
              type="search"
              placeholder="Search charms, keychains, phone straps, trays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                color: 'var(--color-espresso)',
                outline: 'none',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setSearchOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-muted-brown)',
                padding: '4px 8px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <ul className={styles.mobileNavList}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.mobileUtilityRow}>
          <Link
            href="/custom"
            className={styles.mobileNavLink}
            style={{ color: 'var(--color-warm-brown)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Request Custom Piece →
          </Link>
          <a
            href={BUSINESS_RULES.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileNavLink}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Instagram size={20} />
            <span>Follow @claypresso ↗</span>
          </a>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '16px' }}>
            Claypresso Studio • Bangalore, India
            <br />
            Free shipping on orders above ₹500
          </p>
        </div>
      </div>
    </header>
  );
};
