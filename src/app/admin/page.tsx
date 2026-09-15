'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentCustom, setRecentCustom] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, ordersRes, customRes] = await Promise.all([
          apiClient.get<any>('/api/admin/dashboard'),
          apiClient.get<any>('/api/admin/orders'),
          apiClient.get<any>('/api/admin/custom-orders'),
        ]);

        if (dashRes.success && dashRes.data) {
          setData(dashRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data.slice(0, 6));
        }
        if (customRes.success && customRes.data) {
          setRecentCustom(customRes.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading studio operations data...
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingCustomRequests: 0,
    lowStockCount: 0,
  };

  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className={styles.dashboardGrid}>
      {/* 6 PRIMARY METRICS CARDS */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Orders</span>
            <ShoppingBag size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{metrics.totalOrders}</div>
          <div className={styles.metricSubtext}>Lifetime store orders</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Gross Revenue</span>
            <IndianRupee size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>₹{metrics.totalRevenue}</div>
          <div className={styles.metricSubtext}>Paid transactions</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Pending Action</span>
            <Clock size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{metrics.pendingOrders}</div>
          <div className={styles.metricSubtext}>Awaiting studio fulfillment</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Custom Requests</span>
            <Sparkles size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{metrics.pendingCustomRequests}</div>
          <div className={styles.metricSubtext}>Inquiries requiring quotes</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Low Stock Alert</span>
            <AlertTriangle size={18} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{metrics.lowStockCount}</div>
          <div className={styles.metricSubtext}>Items below threshold</div>
        </div>
      </div>

      {/* TWO-COLUMN SECTION: RECENT ORDERS & ATTENTION PANELS */}
      <div className={styles.splitSection}>
        {/* RECENT ORDERS PANEL */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              View all orders ({recentOrders.length}) →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '20px 0' }}>
              No orders placed yet.
            </p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.orderNumber}</strong>
                      </td>
                      <td>
                        <div>{o.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {o.customerEmail}
                        </div>
                      </td>
                      <td>{o.items?.length || 1}</td>
                      <td>
                        <strong>₹{o.total}</strong>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${
                            o.paymentStatus === 'PAID' ? styles.statusPaid : styles.statusUnpaid
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${
                            o.orderStatus === 'PROCESSING' || o.orderStatus === 'IN_PRODUCTION'
                              ? styles.statusProcessing
                              : o.orderStatus === 'SHIPPED'
                              ? styles.statusShipped
                              : styles.statusPending
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className={styles.actionBtnSmall}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          View ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOW STOCK & CUSTOM REQUESTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* LOW STOCK ATTENTION */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Low Stock Products</h2>
              <Link href="/admin/inventory" className={styles.viewAllLink}>
                Manage stock →
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Inventory looks healthy across all products.
              </p>
            ) : (
              <div className={styles.attentionList}>
                {lowStockProducts.slice(0, 4).map((p: any) => (
                  <div key={p.id} className={styles.attentionItem}>
                    <div className={styles.attentionLeft}>
                      <span className={styles.stockAlertBadge}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                      </div>
                    </div>
                    <Link href={`/admin/inventory`} className={styles.actionBtnSmall}>
                      Adjust
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOM REQUESTS ATTENTION */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Custom Requests</h2>
              <Link href="/admin/custom-orders" className={styles.viewAllLink}>
                All requests →
              </Link>
            </div>

            {recentCustom.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                No custom commission requests yet.
              </p>
            ) : (
              <div className={styles.attentionList}>
                {recentCustom.map((c: any) => (
                  <div key={c.id} className={styles.attentionItem}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {c.referenceNumber} — {c.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {c.category} • Qty: {c.quantity}
                      </div>
                    </div>
                    <Link href={`/admin/custom-orders/${c.id}`} className={styles.actionBtnSmall}>
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
