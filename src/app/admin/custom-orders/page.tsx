'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

const STATUS_TABS = [
  'all',
  'NEW',
  'REVIEWING',
  'QUOTED',
  'APPROVED',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
];

export default function AdminCustomOrdersPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      const params: any = {};
      if (activeTab !== 'all') params.status = activeTab;

      const res = await apiClient.get<any[]>('/api/admin/custom-orders', params);
      if (res.success && res.data) {
        setRequests(res.data);
      }
      setLoading(false);
    }

    loadRequests();
  }, [activeTab]);

  const filtered = requests.filter((r) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        r.referenceNumber.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Top Filter & Search */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search custom reference #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.selectInput}
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {STATUS_TABS.map((tab) => (
              <option key={tab} value={tab}>
                {tab === 'all' ? 'All Workflow Statuses' : tab.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'Inquiry' : 'Inquiries'}
        </div>
      </div>

      {/* CUSTOM REQUESTS TABLE */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading custom inquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No custom inquiries found matching this filter.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Submitted</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Photos</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/custom-orders/${r.id}`} className={styles.orderRowLink}>
                        {r.referenceNumber}
                      </Link>
                    </td>
                    <td>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {r.email}
                      </div>
                    </td>
                    <td>{r.category}</td>
                    <td>{r.quantity}</td>
                    <td>{r.imageCount} attached</td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background:
                            r.status === 'NEW'
                              ? '#FFF7E6'
                              : r.status === 'QUOTED' || r.status === 'APPROVED'
                              ? '#E6FFFB'
                              : r.status === 'IN_PRODUCTION'
                              ? '#E6F7FF'
                              : '#F6FFED',
                          color:
                            r.status === 'NEW'
                              ? '#D46B08'
                              : r.status === 'QUOTED' || r.status === 'APPROVED'
                              ? '#08979C'
                              : r.status === 'IN_PRODUCTION'
                              ? '#096DD9'
                              : '#389E0D',
                        }}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/custom-orders/${r.id}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-warm-brown)',
                          textDecoration: 'none',
                        }}
                      >
                        Review / Quote →
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
