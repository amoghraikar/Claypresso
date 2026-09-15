'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Truck,
  Clock,
  ArrowRight,
  PackageCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import { OrderPayload } from '@/types/order';
import { BUSINESS_RULES } from '@/types/product';
import styles from './confirmation.module.css';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (orderId) {
      const foundOrder = orderService.getOrderById(orderId);
      setOrder(foundOrder);
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.confirmationPage}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <p>Retrieving your order details...</p>
        </div>
      </div>
    );
  }

  // Fallback if direct link opened or storage session expired
  if (!order) {
    return (
      <div className={styles.confirmationPage}>
        <div className="container">
          <div className={styles.confirmationCard} style={{ textAlign: 'center' }}>
            <div className={styles.iconWrapper} style={{ background: 'var(--color-cream)' }}>
              <HelpCircle size={32} color="var(--color-warm-brown)" />
            </div>
            <h1 className={styles.orderTitle} style={{ fontSize: '28px' }}>
              Order Not Found in Session
            </h1>
            <p className={styles.orderSubtitle} style={{ marginBottom: '24px' }}>
              We could not find an active order matching reference <strong>{orderId}</strong> in your current browser session. If you recently placed an order, our Bangalore studio is packaging it and a dispatch SMS/WhatsApp was sent to your phone.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/shop" className={styles.primaryCta}>
                CONTINUE SHOPPING →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    orderNumber,
    createdAt,
    customer,
    shippingAddress,
    items,
    subtotal,
    shippingFee,
    total,
    paymentMethod,
    paymentStatus,
    deliveryExpectation,
    isGatewaySimulation,
  } = order;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={styles.confirmationPage}>
      <div className="container">
        <div className={styles.confirmationCard}>
          {/* Top Success Branding & Checkmark Motion */}
          <div className={styles.successHeader}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <Sparkles size={16} className={styles.sparkleAccent} />
              <svg className={styles.checkmarkSvg} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" className={styles.checkmarkPath} />
              </svg>
            </div>
            <h1 className={styles.orderTitle}>ORDER&apos;S IN.</h1>
            <p className={styles.orderSubtitle}>
              Your little Claypresso pieces are officially on their way.
            </p>
          </div>

          {/* Reference & Date Banner */}
          <div className={styles.referenceBanner}>
            <div className={styles.refCol}>
              <span className={styles.refLabel}>Order Reference</span>
              <span className={styles.refValue}>#{orderNumber}</span>
            </div>
            <div className={styles.refCol}>
              <span className={styles.refLabel}>Order Date</span>
              <span className={styles.refValue}>{formattedDate}</span>
            </div>
            <div className={styles.refCol}>
              <span className={styles.refLabel}>Recipient</span>
              <span className={styles.refValue}>{customer.fullName}</span>
            </div>
          </div>

          {/* Delivery & Production Timeline Notice */}
          <div className={styles.timelineCard}>
            <div className={styles.timelineHeader}>
              <Truck size={18} color="var(--color-warm-brown)" />
              <span>Fulfillment &amp; Delivery Expectations</span>
            </div>

            {deliveryExpectation.hasMadeToOrder && deliveryExpectation.productionTimeNotice && (
              <div className={styles.timelineItem}>
                <Clock size={16} className={styles.timelineIcon} style={{ color: '#8c3b3b' }} />
                <div>
                  <strong>Handcrafting Period:</strong>{' '}
                  <span>{deliveryExpectation.productionTimeNotice}</span>
                </div>
              </div>
            )}

            <div className={styles.timelineItem}>
              <PackageCheck size={16} className={styles.timelineIcon} />
              <div>
                <strong>Shipping Transit:</strong>{' '}
                <span>{deliveryExpectation.shippingTransitNotice}</span>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className={styles.itemsSection}>
            <h2 className={styles.sectionHeading}>Items Ordered ({items.length})</h2>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.orderItemRow}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={52}
                    height={52}
                    className={styles.itemThumb}
                  />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemMeta}>
                      Qty: {item.quantity}
                      {item.selectedVariant ? ` • ${item.selectedVariant.name}` : ''}
                      {item.productionType === 'MADE_TO_ORDER' ? ' • Made to order' : ' • In stock'}
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    {BUSINESS_RULES.currency}{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Shipping & Payment Information */}
          <div className={styles.metaGrid}>
            <div>
              <div className={styles.metaColTitle}>Delivery Address</div>
              <p className={styles.metaText}>
                <strong>{shippingAddress.fullName}</strong>
                <br />
                {shippingAddress.addressLine1}
                {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}
                <br />
                {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
                <br />
                India
                <br />
                Phone: {shippingAddress.phone}
              </p>
            </div>

            <div>
              <div className={styles.metaColTitle}>Payment Method</div>
              <p className={styles.metaText}>
                <strong>{paymentMethod === 'UPI' ? 'UPI' : 'Card'}</strong>
                <br />
                Status:{' '}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '1px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: paymentStatus === 'paid' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                    color: paymentStatus === 'paid' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {paymentStatus === 'paid' ? 'Paid' : 'Pending Gateway Verification'}
                </span>
                <br />
                {isGatewaySimulation ? (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                    Preview Order Contract (No live transaction was billed)
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: 4 }}>
                    Dispatched from Bangalore Studio
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className={styles.totalsBox}>
            <div className={styles.totalsRow}>
              <span>Subtotal</span>
              <strong>{BUSINESS_RULES.currency}{subtotal}</strong>
            </div>
            <div className={styles.totalsRow}>
              <span>Shipping across India</span>
              <span>{shippingFee === 0 ? 'FREE' : `${BUSINESS_RULES.currency}${shippingFee}`}</span>
            </div>
            <div className={styles.grandTotalRow}>
              <span className={styles.grandTotalLabel}>Total Paid</span>
              <span className={styles.grandTotalAmount}>
                {BUSINESS_RULES.currency}{total}
              </span>
            </div>
          </div>

          {/* Bottom CTAs */}
          <div className={styles.ctaRow}>
            <div className={styles.buttonGroup}>
              {isAuthenticated ? (
                <Link href={`/account/orders/${order.id}`} className={styles.primaryCta}>
                  <span>VIEW ORDER DETAILS</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href={`/track-order?order=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(customer.email || customer.phone || '')}`}
                  className={styles.primaryCta}
                >
                  <span>TRACK YOUR ORDER</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <Link href="/shop" className={styles.secondaryCta}>
                <span>CONTINUE SHOPPING</span>
              </Link>
            </div>

            <p className={styles.secondaryNote}>
              Have questions regarding your order? Reach out anytime at hello@claypresso.com or DM on Instagram @claypresso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
