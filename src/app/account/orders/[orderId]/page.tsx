'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { OrderPayload, OrderItem } from '@/types/order';
import { BUSINESS_RULES } from '@/types/product';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './orderDetail.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { addToCart } = useCart();

  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const found = orderService.getOrderById(orderId);
      setOrder(found);
    }
    setLoading(false);
  }, [orderId]);

  // Reorder Action
  const handleReorder = () => {
    if (!order) return;

    let addedCount = 0;
    let unavailableCount = 0;

    order.items.forEach((item) => {
      const catalogProduct = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productSlug);
      if (catalogProduct && catalogProduct.stock > 0) {
        addToCart(catalogProduct, item.quantity, item.selectedVariant);
        addedCount++;
      } else {
        unavailableCount++;
      }
    });

    if (unavailableCount > 0 && addedCount > 0) {
      setReorderMessage('Added available items to your bag. Some items are currently unavailable.');
    } else if (unavailableCount > 0 && addedCount === 0) {
      setReorderMessage('Some items are no longer available in the studio catalog.');
    } else {
      setReorderMessage('Added items back to your bag! ✦');
    }

    setTimeout(() => setReorderMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className={styles.orderDetailPage}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  // Order Not Found State
  if (!order) {
    return (
      <div className={styles.orderDetailPage}>
        <div className="container">
          <div className={styles.detailCard} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
            <AlertCircle size={48} color="var(--color-warm-brown)" style={{ margin: '0 auto 16px' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: 8 }}>
              WE COULDN&apos;T FIND THAT ORDER.
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '15px', maxWidth: '440px', margin: '0 auto 24px' }}>
              We could not find an order matching reference &ldquo;{orderId}&rdquo;. Please check the order number or use guest tracking.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/track-order" className={styles.reorderBtn}>
                GUEST TRACKING →
              </Link>
              <Link href="/account" className={styles.backLink} style={{ alignSelf: 'center' }}>
                Back to Account
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
    orderStatus,
    deliveryExpectation,
  } = order;

  // Timeline Steps construction based on production type
  const isMadeToOrder = deliveryExpectation.hasMadeToOrder;
  const timelineSteps = isMadeToOrder
    ? [
        { id: 'placed', label: 'Order Placed', subtext: 'Confirmed' },
        { id: 'production', label: 'In Production', subtext: 'Studio Handcrafting' },
        { id: 'shipped', label: 'Shipped', subtext: '~4 Days Transit' },
        { id: 'delivered', label: 'Delivered', subtext: 'At Your Door' },
      ]
    : [
        { id: 'placed', label: 'Order Placed', subtext: 'Confirmed' },
        { id: 'processing', label: 'Processing', subtext: 'Careful Packaging' },
        { id: 'shipped', label: 'Shipped', subtext: '~4 Days Transit' },
        { id: 'delivered', label: 'Delivered', subtext: 'At Your Door' },
      ];

  // Determine active step index
  const normalizedStatus = orderStatus.toLowerCase();
  let activeIndex = 0;
  if (normalizedStatus === 'processing' || normalizedStatus === 'in_production' || normalizedStatus === 'in production') {
    activeIndex = 1;
  } else if (normalizedStatus === 'shipped') {
    activeIndex = 2;
  } else if (normalizedStatus === 'delivered' || normalizedStatus === 'completed') {
    activeIndex = 3;
  }

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={styles.orderDetailPage}>
      <div className="container">
        {/* Navigation Breadcrumbs */}
        <div className={styles.breadcrumbNav}>
          <Link href="/account" className={styles.backLink}>
            <ArrowLeft size={16} /> Return to Account
          </Link>
          <Link href="/track-order" style={{ fontSize: '13px', color: 'var(--color-warm-brown)', fontWeight: 600 }}>
            Guest Tracking ↗
          </Link>
        </div>

        {reorderMessage && (
          <div
            style={{
              maxWidth: '860px',
              margin: '0 auto 16px',
              background: 'var(--color-espresso)',
              color: 'var(--color-ivory)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
            }}
            role="status"
          >
            {reorderMessage}
          </div>
        )}

        <div className={styles.detailCard}>
          {/* Header */}
          <div className={styles.detailHeader}>
            <div>
              <h1 className={styles.orderHeading}>Order #{orderNumber}</h1>
              <p className={styles.orderMetaText}>
                Placed on {formattedDate} • Customer: {customer.fullName}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--color-peach)',
                  color: 'var(--color-espresso)',
                }}
              >
                Status: {orderStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* VISUAL ORDER TIMELINE */}
          <div className={styles.timelineWrapper}>
            <span className={styles.timelineTitle}>Fulfillment Timeline</span>
            <div className={styles.timelineTrack}>
              {timelineSteps.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;
                const nodeClass = isCompleted
                  ? styles.nodeCompleted
                  : isActive
                  ? styles.nodeActive
                  : styles.nodeUpcoming;

                return (
                  <div key={step.id} className={styles.timelineStepNode}>
                    <div className={`${styles.nodeCircle} ${nodeClass}`}>
                      {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <div>
                      <div className={styles.stepLabelText}>{step.label}</div>
                      <div className={styles.stepSubtext}>{step.subtext}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Production Timeline Expectations */}
          <div
            style={{
              background: 'var(--color-ivory)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: 'var(--space-8)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            <Clock size={20} color="var(--color-warm-brown)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Estimated Timeline: </strong>
              <span>
                {deliveryExpectation.hasMadeToOrder && deliveryExpectation.productionTimeNotice
                  ? `${deliveryExpectation.productionTimeNotice} + `
                  : ''}
                {deliveryExpectation.shippingTransitNotice}
              </span>
            </div>
          </div>

          {/* Order Items List */}
          <div className={styles.itemsSection}>
            <h2 className={styles.sectionHeading}>Items in This Order ({items.length})</h2>
            <div>
              {items.map((item) => (
                <div key={item.id} className={styles.orderItemRow}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className={styles.itemThumb}
                  />
                  <div className={styles.itemInfo}>
                    <Link href={`/product/${item.productSlug}`} className={styles.itemTitle}>
                      {item.name} ↗
                    </Link>
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

          {/* Two-Column Shipping & Payment Info (Zero sensitive credentials) */}
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
                Status: {paymentStatus.toUpperCase()}
                <br />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                  Processed securely via 256-bit encrypted gateway. Zero card or banking details stored.
                </span>
              </p>
            </div>
          </div>

          {/* Pricing Totals */}
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
              <span className={styles.grandTotalLabel}>Total Amount</span>
              <span className={styles.grandTotalAmount}>
                {BUSINESS_RULES.currency}{total}
              </span>
            </div>
          </div>

          {/* Action Row: Reorder */}
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={handleReorder}
              className={styles.reorderBtn}
            >
              <ShoppingBag size={16} />
              <span>BUY AGAIN</span>
            </button>

            <Link href="/shop" style={{ fontSize: '13px', color: 'var(--color-warm-brown)', fontWeight: 600 }}>
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
