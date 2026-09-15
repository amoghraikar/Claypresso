'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  ShoppingBag,
  IndianRupee,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../../orders/orders.module.css';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params?.customerId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      if (!customerId) return;
      setLoading(true);
      setError(null);

      const res = await apiClient.get<any>(`/api/admin/customers/${customerId}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to load customer profile');
      }
      setLoading(false);
    }

    loadCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading customer profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <h3>Customer Not Found</h3>
        <p>{error || 'Could not find the requested customer record.'}</p>
        <Link href="/admin/customers" className={styles.btnSecondary} style={{ marginTop: '1rem' }}>
          Back to Customers
        </Link>
      </div>
    );
  }

  const { customer, orders, stats } = data;

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/admin/customers"
          className={styles.btnSecondary}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>
      </div>

      {/* Customer Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 className={styles.pageTitle}>{customer.name}</h1>
            <span
              className={styles.badge}
              style={{
                backgroundColor: customer.isRegistered ? '#EBF5FB' : '#F4ECE4',
                color: customer.isRegistered ? '#1B4F72' : '#6E5540',
              }}
            >
              {customer.isRegistered ? 'Registered Customer' : 'Guest Customer'}
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            Customer profile, contact details, and past purchases at Claypresso.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className={styles.card}>
          <div style={{ fontSize: '0.8rem', color: '#736B63', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Lifetime Orders
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-espresso)' }}>
            {stats.totalOrders}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ fontSize: '0.8rem', color: '#736B63', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Total Paid Spend
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-espresso)' }}>
            ₹{stats.totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ fontSize: '0.8rem', color: '#736B63', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Average Order Value
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-espresso)' }}>
            ₹{stats.avgOrderValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <h3 className={styles.cardTitle}>Customer Details</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#736B63' }}>Email Address</div>
            <div style={{ fontWeight: 600, color: 'var(--color-espresso)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#8D5A3C" />
              {customer.email}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#736B63' }}>Phone Number</div>
            <div style={{ fontWeight: 600, color: 'var(--color-espresso)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="#8D5A3C" />
              {customer.phone || 'Not provided'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#736B63' }}>Customer Since</div>
            <div style={{ fontWeight: 600, color: 'var(--color-espresso)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#8D5A3C" />
              {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order History Table */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Order History ({orders.length})</h3>

        {orders.length === 0 ? (
          <p style={{ color: '#736B63', fontSize: '0.9rem', margin: '1rem 0 0' }}>
            No orders recorded for this customer yet.
          </p>
        ) : (
          <div className={styles.tableCard} style={{ marginTop: '1rem' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>
                        {o.orderNumber}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#736B63' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#5A4A3E' }}>
                        {o.items?.length || 0} items
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          o.paymentStatus === 'PAID' ? styles.badgeApproved : styles.badgePending
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          o.orderStatus === 'DELIVERED' || o.orderStatus === 'COMPLETED'
                            ? styles.badgeApproved
                            : o.orderStatus === 'CANCELLED'
                            ? styles.badgeCancelled
                            : styles.badgePending
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>
                        ₹{o.total.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className={styles.btnSecondary}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                      >
                        View Order
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
