'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BUSINESS_RULES } from '@/types/product';
import { Magnetic } from '@/components/common/Motion';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    freeShippingRemaining,
    hasFreeShipping,
    hasMadeToOrderItems,
  } = useCart();

  const drawerRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Focus management & Escape key handling (Requirement 18)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      // Focus close button on open
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const threshold = BUSINESS_RULES.freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  const shippingCost = hasFreeShipping ? 0 : BUSINESS_RULES.standardShippingFee;
  const finalTotal = subtotal + shippingCost;

  return (
    <>
      {/* 1. Backdrop */}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.backdropOpen : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 2. Cart Drawer */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Cart"
        aria-hidden={!isCartOpen}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleRow}>
            <h2 className={styles.drawerTitle}>YOUR CART</h2>
            <span className={styles.drawerItemCount}>({totalItems})</span>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Dynamic Progress Tracker (Requirement 6) */}
        <div className={`${styles.shippingTracker} ${hasFreeShipping ? styles.shippingUnlocked : ''}`}>
          <div className={styles.shippingText}>
            {hasFreeShipping ? (
              <span style={{ color: '#2F6F4E', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} /> FREE SHIPPING UNLOCKED
              </span>
            ) : (
              <span>
                Add <strong>{BUSINESS_RULES.currency}{freeShippingRemaining}</strong> more for Free Delivery
              </span>
            )}
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>₹{threshold}+</span>
          </div>

          <div
            className={styles.progressBarBg}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Free shipping progress"
          >
            <div
              className={`${styles.progressBarFill} ${hasFreeShipping ? styles.progressBarFillUnlocked : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3. Items List OR Empty State */}
        {cart.length === 0 ? (
          /* Empty Cart State (Requirement 11) */
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <ShoppingBag size={28} strokeWidth={1.75} />
            </div>
            <h3 className={styles.emptyHeading}>YOUR CART IS FEELING A LITTLE EMPTY.</h3>
            <p className={styles.emptyText}>Something cute could fix that.</p>
            <Link
              href="/shop"
              className={styles.checkoutBtn}
              style={{ maxWidth: 220 }}
              onClick={closeCart}
            >
              EXPLORE THE SHOP →
            </Link>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {cart.map((item) => {
              const itemPrice = item.product.price + (item.selectedVariant?.priceDelta || 0);
              const lineTotal = itemPrice * item.quantity;
              const isMadeToOrder = item.product.productionType === 'MADE_TO_ORDER';
              const maxStock = item.product.stock;

              return (
                <div key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`} className={styles.cartItem}>
                  {/* Thumbnail */}
                  <div className={styles.itemImageWrapper}>
                    <Link href={`/product/${item.product.slug}`} onClick={closeCart} aria-label={item.product.name}>
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="76px"
                        className={styles.itemImage}
                      />
                    </Link>
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <div>
                      <div className={styles.itemHeaderRow}>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className={styles.itemName}
                          onClick={closeCart}
                        >
                          {item.product.name}
                        </Link>
                        <span className={styles.itemPrice}>
                          {BUSINESS_RULES.currency}{lineTotal}
                        </span>
                      </div>

                      {/* Selected Variant */}
                      {item.selectedVariant && (
                        <div className={styles.itemVariantRow}>
                          Option: {item.selectedVariant.name}
                        </div>
                      )}

                      {/* Production Status Badge */}
                      <span
                        className={`${styles.itemStatusBadge} ${
                          isMadeToOrder ? styles.statusMadeToOrder : styles.statusReady
                        }`}
                      >
                        {isMadeToOrder ? 'MADE TO ORDER' : 'READY TO SHIP'}
                      </span>
                    </div>

                    {/* Quantity & Remove Action */}
                    <div className={styles.qtyRow}>
                      <div className={styles.qtyControl} aria-label="Quantity selector">
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant?.id)
                          }
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          <Minus size={11} />
                        </button>
                        <span className={styles.qtyValue} aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          disabled={maxStock !== undefined && item.quantity >= maxStock}
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant?.id)
                          }
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Cart Summary Footer */}
        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            {/* Made to order notice if applicable */}
            {hasMadeToOrderItems && (
              <div className={styles.madeToOrderCartNotice}>
                ✦ Includes hand-crafted piece(s). Studio production time applies before dispatch.
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{BUSINESS_RULES.currency}{subtotal}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              {hasFreeShipping ? (
                <span className={styles.shippingBadgeFree}>FREE</span>
              ) : (
                <span>{BUSINESS_RULES.currency}{BUSINESS_RULES.standardShippingFee}</span>
              )}
            </div>

            <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
              <span>Total</span>
              <span>{BUSINESS_RULES.currency}{finalTotal}</span>
            </div>

            {/* Primary Magnetic CTA (Section 16) */}
            <Magnetic strength={0.28} maxOffset={10} style={{ width: '100%' }}>
              <Link
                href="/checkout"
                className={styles.checkoutBtn}
                onClick={closeCart}
                data-cursor="button"
                style={{ width: '100%' }}
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={15} className="magnetic-arrow" />
              </Link>
            </Magnetic>

            {/* Secondary Action */}
            <button
              type="button"
              className={styles.continueShoppingBtn}
              onClick={closeCart}
              data-cursor="button"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
