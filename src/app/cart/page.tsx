'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BUSINESS_RULES } from '@/types/product';
import styles from './cart.module.css';

export default function CartPage() {
  const {
    cart,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    freeShippingRemaining,
    hasFreeShipping,
    hasMadeToOrderItems,
  } = useCart();

  const threshold = BUSINESS_RULES.freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  const shippingCost = hasFreeShipping ? 0 : BUSINESS_RULES.standardShippingFee;
  const finalTotal = subtotal + shippingCost;

  // 1. Empty Cart State (Requirement 11)
  if (cart.length === 0) {
    return (
      <section className={styles.cartPageSection}>
        <div className="container">
          <div className={styles.emptyCartContainer}>
            <div className={styles.emptyIconCircle}>
              <ShoppingBag size={32} strokeWidth={1.75} />
            </div>
            <h1 className={styles.emptyTitle}>YOUR CART IS FEELING A LITTLE EMPTY.</h1>
            <p className={styles.emptyText}>Something cute could fix that.</p>
            <Link href="/shop" className={styles.checkoutCta} style={{ maxWidth: 240 }}>
              <span>EXPLORE THE SHOP</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 2. Full Cart Page (Requirement 9 & 10)
  return (
    <section className={styles.cartPageSection}>
      <div className="container">
        {/* Header */}
        <div className={styles.cartHeader}>
          <h1 className={styles.cartHeading}>YOUR CART</h1>
          <p className={styles.cartSubtitle}>
            {totalItems} little {totalItems === 1 ? 'thing is' : 'things are'} on their way to you.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className={styles.cartLayout}>
          {/* LEFT: Items List */}
          <div className={styles.itemsColumn}>
            {cart.map((item) => {
              const itemPrice = item.product.price + (item.selectedVariant?.priceDelta || 0);
              const lineTotal = itemPrice * item.quantity;
              const isMadeToOrder = item.product.productionType === 'MADE_TO_ORDER';
              const maxStock = item.product.stock;

              return (
                <div
                  key={`${item.product.id}-${item.selectedVariant?.id || 'default'}`}
                  className={styles.cartItemRow}
                >
                  {/* Image */}
                  <div className={styles.itemImageWrapper}>
                    <Link href={`/product/${item.product.slug}`} aria-label={item.product.name}>
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="88px"
                        className={styles.itemImage}
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className={styles.itemInfoCol}>
                    <span className={styles.itemCategory}>{item.product.category}</span>
                    <Link href={`/product/${item.product.slug}`} className={styles.itemName}>
                      {item.product.name}
                    </Link>

                    {item.selectedVariant && (
                      <span className={styles.itemVariantText}>
                        Option: {item.selectedVariant.name}
                      </span>
                    )}

                    <span
                      className={`${styles.productionPill} ${
                        isMadeToOrder ? styles.pillMadeToOrder : styles.pillReady
                      }`}
                    >
                      {isMadeToOrder ? 'MADE TO ORDER' : 'READY TO SHIP'}
                    </span>
                  </div>

                  {/* Quantity Control */}
                  <div className={styles.qtySection}>
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
                        <Minus size={13} />
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
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className={styles.priceCol}>
                    <span className={styles.lineTotal}>
                      {BUSINESS_RULES.currency}{lineTotal}
                    </span>
                    {item.quantity > 1 && (
                      <span className={styles.unitPrice}>
                        {BUSINESS_RULES.currency}{itemPrice} each
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary */}
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>

            {/* Dynamic Free Shipping Progress (Requirement 6) */}
            <div className={styles.freeShippingBox}>
              <div className={styles.freeShippingText}>
                {hasFreeShipping ? (
                  <span style={{ color: '#2F6F4E', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={14} /> FREE SHIPPING UNLOCKED
                  </span>
                ) : (
                  <span>
                    Add <strong>{BUSINESS_RULES.currency}{freeShippingRemaining}</strong> more for Free Shipping
                  </span>
                )}
                <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>₹{threshold}+</span>
              </div>

              <div
                className={styles.freeShippingTrack}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Free shipping progress"
              >
                <div
                  className={`${styles.freeShippingFill} ${hasFreeShipping ? styles.freeShippingUnlocked : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Price Lines */}
            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                <strong>{BUSINESS_RULES.currency}{subtotal}</strong>
              </div>

              <div className={styles.summaryLine}>
                <span>India Shipping</span>
                {hasFreeShipping ? (
                  <span className={styles.freeBadge}>FREE</span>
                ) : (
                  <span>{BUSINESS_RULES.currency}{BUSINESS_RULES.standardShippingFee}</span>
                )}
              </div>

              <div className={`${styles.summaryLine} ${styles.summaryLineTotal}`}>
                <span>Total</span>
                <span>{BUSINESS_RULES.currency}{finalTotal}</span>
              </div>
            </div>

            {/* Made-to-Order Notice (Requirement 15) */}
            <div className={styles.productionDeliveryNotice}>
              {hasMadeToOrderItems ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Sparkles size={16} color="var(--color-warm-brown)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Contains Made-to-Order item(s)</strong>
                    <br />
                    Individually hand-sculpted in our studio. Production time applies before ~4 days dispatch across India.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Truck size={16} color="var(--color-warm-brown)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>All items ready to ship</strong>
                    <br />
                    Dispatches from Bangalore within 24–48 hours. Typical transit is ~4 days across India.
                  </div>
                </div>
              )}
            </div>

            {/* Primary CTA (Requirement 8) */}
            <Link href="/checkout" className={styles.checkoutCta}>
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </Link>

            {/* Secondary Action */}
            <Link href="/shop" className={styles.continueShoppingLink}>
              CONTINUE SHOPPING →
            </Link>

            {/* Trust badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4 }}>
              <ShieldCheck size={14} color="#2F6F4E" />
              <span>Safe & Secure Packaging • Direct Studio Craft</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
