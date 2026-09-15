'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Filter, ArrowRight } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from './orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get<any[]>('/api/admin/orders', params);
      if (res.success && res.data) {
        setOrders(res.data);
      }
      setLoading(false);
    }

    loadOrders();
  }, [statusFilter]);

  // Client search filtering across customer name, order number, email
  const filteredOrders = orders.filter((o) => {
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      return matchNum || matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* FILTER & SEARCH BAR */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            className={styles.selectInput}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className={styles.orderRowLink}>
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: o.paymentStatus === 'PAID' ? '#F6FFED' : '#FFF1F0',
                          color: o.paymentStatus === 'PAID' ? '#389E0D' : '#CF1322',
                        }}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background:
                            o.orderStatus === 'PROCESSING' || o.orderStatus === 'IN_PRODUCTION'
                              ? '#E6F7FF'
                              : o.orderStatus === 'SHIPPED'
                              ? '#F6FFED'
                              : '#FFF7E6',
                          color:
                            o.orderStatus === 'PROCESSING' || o.orderStatus === 'IN_PRODUCTION'
                              ? '#096DD9'
                              : o.orderStatus === 'SHIPPED'
                              ? '#389E0D'
                              : '#D46B08',
                        }}
                      >
                        {o.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-warm-brown)',
                          textDecoration: 'none',
                        }}
                      >
                        Manage →
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
