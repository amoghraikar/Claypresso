'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { OrderPayload } from '@/types/order';
import { BUSINESS_RULES } from '@/types/product';
import styles from './trackOrder.module.css';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [contact, setContact] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<OrderPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order');
      const contactParam = params.get('contact');
      if (orderParam) {
        setOrderNumber(orderParam);
      }
      if (contactParam) {
        setContact(contactParam);
      }
      if (orderParam && contactParam) {
        setLoading(true);
        setSearched(true);
        orderService.trackOrderOnServer(orderParam, contactParam).then((res) => {
          setLoading(false);
          if (res.success && res.data) {
            setFoundOrder(res.data);
          } else {
            const fallback = orderService.findOrderByTracking(orderParam, contactParam);
            if (fallback) {
              setFoundOrder(fallback);
            } else {
              setError("WE COULDN'T FIND THAT ORDER. Check the order number and email address or phone and try again.");
            }
          }
        });
      }
    }
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSearched(true);

    if (!orderNumber.trim()) {
      setError('Please enter your order number.');
      return;
    }

    if (!contact.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }

    setLoading(true);
    const res = await orderService.trackOrderOnServer(orderNumber, contact);
    setLoading(false);

    if (res.success && res.data) {
      setFoundOrder(res.data);
      setError(null);
    } else {
      const localResult = orderService.findOrderByTracking(orderNumber, contact);
      if (localResult) {
        setFoundOrder(localResult);
        setError(null);
      } else {
        setFoundOrder(null);
        setError("WE COULDN'T FIND THAT ORDER. Check the order number and email address or phone and try again.");
      }
    }
  };

  // Timeline computation
  const getTimelineSteps = (order: OrderPayload) => {
    const isMadeToOrder = order.deliveryExpectation.hasMadeToOrder;
    return isMadeToOrder
      ? [
          { id: 'placed', label: 'Order Placed', subtext: 'Confirmed' },
          { id: 'production', label: 'In Production', subtext: 'Handcrafted' },
          { id: 'shipped', label: 'Shipped', subtext: '~4 Days Transit' },
          { id: 'delivered', label: 'Delivered', subtext: 'At Your Door' },
        ]
      : [
          { id: 'placed', label: 'Order Placed', subtext: 'Confirmed' },
          { id: 'processing', label: 'Processing', subtext: 'Careful Packaging' },
          { id: 'shipped', label: 'Shipped', subtext: '~4 Days Transit' },
          { id: 'delivered', label: 'Delivered', subtext: 'At Your Door' },
        ];
  };

  const getActiveIndex = (order: OrderPayload) => {
    const st = order.orderStatus.toLowerCase();
    if (st === 'processing' || st === 'in_production' || st === 'in production') return 1;
    if (st === 'shipped') return 2;
    if (st === 'delivered' || st === 'completed') return 3;
    return 0;
  };

  return (
    <div className={styles.trackPage}>
      <div className="container">
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.eyebrow}>
            <Sparkles size={13} />
            <span>Guest Parcel Tracking</span>
          </div>

          <h1 className={styles.heroTitle}>TRACK YOUR ORDER</h1>

          <p className={styles.heroSubtitle}>
            Check the real-time status of your handmade Claypresso parcel. No account required.
          </p>
        </section>

        {/* Lookup Form */}
        <div className={styles.formCard}>
          <form onSubmit={handleTrackSubmit} className={styles.formFields} noValidate>
            <div className={styles.fieldRow}>
              <label htmlFor="track-order-num" className={styles.fieldLabel}>
                Order Number *
              </label>
              <input
                id="track-order-num"
                type="text"
                required
                placeholder="e.g. CP-2026-1048"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className={`${styles.inputField} ${error && !orderNumber ? styles.inputFieldError : ''}`}
              />
            </div>

            <div className={styles.fieldRow}>
              <label htmlFor="track-contact" className={styles.fieldLabel}>
                Email Address or Mobile Number *
              </label>
              <input
                id="track-contact"
                type="text"
                required
                placeholder="pooja@example.com or 9876543210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={`${styles.inputField} ${error && !contact ? styles.inputFieldError : ''}`}
              />
            </div>

            {error && (
              <div className={styles.errorMessage} role="alert">
                <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.trackBtn}
            >
              {loading ? (
                'Locating Order...'
              ) : (
                <>
                  <span>TRACK ORDER</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* TRACKING RESULTS DISPLAY */}
        {foundOrder && (
          <div className={styles.resultCard}>
            <div
              style={{
                background: 'var(--color-white)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0, color: 'var(--color-espresso)' }}>
                    Order #{foundOrder.orderNumber}
                  </h2>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Recipient: {foundOrder.customer.fullName} • Placed on{' '}
                    {new Date(foundOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'var(--color-peach)',
                    color: 'var(--color-espresso)',
                  }}
                >
                  Status: {foundOrder.orderStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Visual Timeline */}
              <div
                style={{
                  background: 'var(--color-cream)',
                  border: '1px solid var(--color-light-taupe)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  {getTimelineSteps(foundOrder).map((step, idx) => {
                    const activeIdx = getActiveIndex(foundOrder);
                    const isDone = idx < activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div
                        key={step.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          flex: 1,
                          minWidth: '110px',
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '999px',
                            background: isDone
                              ? 'var(--color-espresso)'
                              : isCurrent
                              ? 'var(--color-warm-brown)'
                              : 'var(--color-white)',
                            color: isDone || isCurrent ? 'var(--color-ivory)' : 'var(--color-text-muted)',
                            border: isDone || isCurrent ? 'none' : '1.5px solid var(--color-light-taupe)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            marginBottom: 8,
                            boxShadow: isCurrent ? '0 0 0 4px rgba(141, 90, 60, 0.25)' : 'none',
                          }}
                        >
                          {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--color-espresso)' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {step.subtext}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COURIER SHIPMENT TRACKING BANNER */}
              {foundOrder.trackingNumber && (
                <div
                  style={{
                    backgroundColor: '#FDFBF9',
                    border: '1.5px solid var(--color-warm-brown)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    marginBottom: '28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                      COURIER DISPATCH INFORMATION
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-espresso)', marginTop: 2 }}>
                      {foundOrder.courier || 'India Post Express'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      Tracking Number:{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-warm-brown)' }}>
                        {foundOrder.trackingNumber}
                      </span>
                    </div>
                  </div>

                  {foundOrder.trackingUrl && (
                    <a
                      href={foundOrder.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.trackBtn}
                      style={{
                        padding: '10px 20px',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>TRACK ON COURIER WEBSITE</span>
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* Items Breakdown */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 12 }}>
                  Ordered Items ({foundOrder.items.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {foundOrder.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-espresso)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            Qty: {item.quantity} {item.selectedVariant ? `• ${item.selectedVariant.name}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-espresso)' }}>
                        {BUSINESS_RULES.currency}{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Courier Information */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                  padding: 16,
                  background: 'var(--color-cream)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warm-brown)', marginBottom: 4 }}>
                    Shipping Destination
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-espresso)', lineHeight: 1.4 }}>
                    <strong>{foundOrder.shippingAddress.fullName}</strong>
                    <br />
                    {foundOrder.shippingAddress.addressLine1}
                    <br />
                    {foundOrder.shippingAddress.city}, {foundOrder.shippingAddress.state} — {foundOrder.shippingAddress.pincode}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-warm-brown)', marginBottom: 4 }}>
                    Delivery Expectation
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-espresso)', lineHeight: 1.4 }}>
                    {foundOrder.deliveryExpectation.shippingTransitNotice}
                    <br />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Tracked via India Post / DTDC Express.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
