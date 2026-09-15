'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders.module.css';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [courier, setCourier] = useState('India Post');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setLoading(true);
      const res = await apiClient.get<any>(`/api/admin/orders/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
        setSelectedStatus(res.data.orderStatus);
        if (res.data.courier) setCourier(res.data.courier);
        if (res.data.trackingNumber) setTrackingNumber(res.data.trackingNumber);
      }
      setLoading(false);
    }

    loadOrder();
  }, [orderId]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdating(true);
    setMessage(null);

    const res = await apiClient.patch<any>(`/api/admin/orders/${order.id}`, {
      orderStatus: selectedStatus,
      courier,
      trackingNumber,
      notes,
    });

    setUpdating(false);

    if (res.success && res.data?.order) {
      setOrder(res.data.order);
      setMessage({ text: `Order status updated to ${res.data.order.orderStatus}!` });
      setNotes('');
    } else {
      setMessage({ text: res.error || 'Failed to update order status.', isError: true });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Order not found.</p>
        <Link href="/admin/orders" style={{ color: 'var(--color-warm-brown)', fontWeight: 600 }}>
          ← Back to all orders
        </Link>
      </div>
    );
  }

  const address = order.shippingAddress || {};

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          href="/admin/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-warm-brown)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
        </span>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            background: message.isError ? '#FFF1F0' : '#F6FFED',
            color: message.isError ? '#CF1322' : '#389E0D',
            border: `1px solid ${message.isError ? '#FFA39E' : '#B7EB8F'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Two-Column Grid */}
      <div className={styles.detailGrid}>
        {/* LEFT COLUMN: ITEMS & FINANCIALS */}
        <div>
          {/* Order Header & Items */}
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className={styles.cardTitle} style={{ border: 'none', margin: 0, padding: 0 }}>
                Order #{order.orderNumber}
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#F0EAE1',
                  color: 'var(--color-espresso)',
                }}
              >
                Status: {order.orderStatus}
              </span>
            </div>

            <div style={{ marginTop: 16 }}>
              {order.items?.map((item: any) => (
                <div key={item.id} className={styles.itemRow}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      src={item.imageSnapshot || '/images/placeholder.png'}
                      alt={item.productNameSnapshot}
                      width={50}
                      height={50}
                      className={styles.itemThumb}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.productNameSnapshot}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Qty: {item.quantity} • Unit: ₹{item.priceSnapshot}
                        {item.selectedVariantSnapshot ? ` • ${item.selectedVariantSnapshot}` : ''}
                        {item.productionTypeSnapshot === 'MADE_TO_ORDER' ? ' • Made-to-order' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{item.subtotal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Financial Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Items Subtotal</span>
                <strong>₹{order.subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#389E0D' }}>
                  <span>Discount Applied</span>
                  <strong>-₹{order.discount}</strong>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 12,
                  marginTop: 6,
                  fontSize: '16px',
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Paid</span>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>
                  ₹{order.total}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATUS UPDATER, CUSTOMER & SHIPPING */}
        <div>
          {/* Status Updater Form */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Update Fulfillment</h3>
            <form onSubmit={handleStatusUpdate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  ORDER STATUS
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={styles.selectInput}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing (Packaging)</option>
                  <option value="IN_PRODUCTION">In Production (Handcrafting)</option>
                  <option value="SHIPPED">Shipped (In Transit)</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {(selectedStatus === 'SHIPPED' || order.orderStatus === 'SHIPPED' || order.trackingNumber) && (
                <div style={{ backgroundColor: '#FDFBF9', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: 14 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-warm-brown)', marginBottom: 8 }}>
                    COURIER & SHIPMENT TRACKING
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      Courier Partner
                    </label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="India Post">India Post (Speed Post / Parcel)</option>
                      <option value="DTDC">DTDC Express</option>
                      <option value="Blue Dart">Blue Dart</option>
                      <option value="Delhivery">Delhivery</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      Tracking / Consignment Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. ED123456789IN or D12345678"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {order.trackingUrl && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--color-warm-brown)', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Track on Courier Website ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  INTERNAL NOTES (OPTIONAL)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Courier tracking # posted, packaged in eco box"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className={styles.actionBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {updating ? 'Updating...' : 'Save Order Status'}
              </button>
            </form>
          </div>

          {/* Customer Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Customer Information</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
              <div>
                <strong>{order.customerName}</strong>
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Email: {order.customerEmail}</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Phone: {order.customerPhone}</div>
              <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {order.userId ? 'Registered Customer' : 'Guest Checkout'}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Delivery Address</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
              <div>{address.fullName || order.customerName}</div>
              <div>{address.addressLine1}</div>
              {address.addressLine2 && <div>{address.addressLine2}</div>}
              <div>
                {address.city}, {address.state} — {address.pincode}
              </div>
              <div>India</div>
              {address.phone && <div style={{ marginTop: 4 }}>Phone: {address.phone}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
