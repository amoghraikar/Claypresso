'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Search, ShoppingBag, ArrowUpRight, Mail, Phone, Calendar } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  orderCount: number;
  totalSpend: number;
  joinedAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());

    const res = await apiClient.get<any>(`/api/admin/customers?${query.toString()}`);
    if (res.success && res.data?.customers) {
      setCustomers(res.data.customers);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customer Management</h1>
          <p className={styles.pageSubtitle}>
            View registered users and guest store purchasers, order histories, and lifetime spend.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className={styles.controlsBar}>
        <form onSubmit={handleSearch} className={styles.searchBox} style={{ maxWidth: '400px' }}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No customers found</h3>
          <p className={styles.emptyText}>No registered accounts or guest checkout orders match.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Orders</th>
                <th>Lifetime Spend</th>
                <th>Joined / First Seen</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#736B63' }}>{c.email}</div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#5A4A3E' }}>
                      {c.phone !== '—' ? c.phone : <span style={{ color: '#9E948A' }}>No phone</span>}
                    </div>
                  </td>

                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        backgroundColor: c.isRegistered ? '#EBF5FB' : '#F4ECE4',
                        color: c.isRegistered ? '#1B4F72' : '#6E5540',
                      }}
                    >
                      {c.isRegistered ? 'Registered' : 'Guest Buyer'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShoppingBag size={14} color="#736B63" />
                      <span style={{ fontWeight: 600 }}>{c.orderCount}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#736B63' }}>
                      {new Date(c.joinedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className={styles.btnSecondary}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      View Profile
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
