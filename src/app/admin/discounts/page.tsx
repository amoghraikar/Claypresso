'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

interface DiscountItem {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minimumOrderValue: number;
  maximumDiscount?: number | null;
  usedCount: number;
  usageLimit?: number | null;
  active: boolean;
  startsAt: string;
  expiresAt?: string | null;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minimumOrderValue, setMinimumOrderValue] = useState('0');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    setLoading(true);
    const res = await apiClient.get<DiscountItem[]>('/api/admin/discounts');
    if (res.success && res.data) {
      setDiscounts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleToggleActive = async (discount: DiscountItem) => {
    const nextState = !discount.active;
    const res = await apiClient.patch<any>(`/api/admin/discounts/${discount.id}`, {
      active: nextState,
    });
    if (res.success) {
      setDiscounts((prev) =>
        prev.map((d) => (d.id === discount.id ? { ...d, active: nextState } : d))
      );
    } else {
      alert(res.error || 'Failed to update discount status');
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete discount code "${codeName}"?`)) {
      return;
    }

    const res = await apiClient.delete<any>(`/api/admin/discounts/${id}`);
    if (res.success) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } else {
      alert(res.error || 'Failed to delete discount');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !value) {
      setFormError('Promo code and discount value are required.');
      return;
    }

    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      minimumOrderValue: parseFloat(minimumOrderValue || '0'),
      maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      active,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    const res = await apiClient.post<any>('/api/admin/discounts', payload);
    setSaving(false);

    if (res.success) {
      setShowModal(false);
      resetForm();
      fetchDiscounts();
    } else {
      setFormError(res.error || 'Failed to create discount');
    }
  };

  const resetForm = () => {
    setCode('');
    setType('PERCENTAGE');
    setValue('');
    setMinimumOrderValue('0');
    setMaximumDiscount('');
    setUsageLimit('');
    setExpiresAt('');
    setActive(true);
    setFormError(null);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Discounts & Coupons</h1>
          <p className={styles.pageSubtitle}>
            Create promotional coupons, percentage discounts, minimum cart value rules, and expiry dates.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          Create Discount
        </button>
      </div>

      {/* Discounts Table */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading discount coupons...</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className={styles.emptyState}>
          <Tag size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No discount codes</h3>
          <p className={styles.emptyText}>Create your first promotional discount coupon code.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Max Cap</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => {
                const isExpired = d.expiresAt && new Date(d.expiresAt) < new Date();
                const isLimitReached = d.usageLimit && d.usedCount >= d.usageLimit;

                return (
                  <tr key={d.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#F7EFE9',
                          borderRadius: '4px',
                          color: 'var(--color-espresso)',
                          border: '1px dashed #D6C2B4',
                        }}
                      >
                        {d.code}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>
                        {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `₹${d.value} FLAT`}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.9rem', color: '#736B63' }}>
                        {d.minimumOrderValue > 0 ? `₹${d.minimumOrderValue.toLocaleString('en-IN')}` : 'No min'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.9rem', color: '#736B63' }}>
                        {d.maximumDiscount ? `₹${d.maximumDiscount.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        <strong>{d.usedCount}</strong>
                        {d.usageLimit ? ` / ${d.usageLimit}` : ' / ∞'}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: isExpired ? '#B91C1C' : '#736B63',
                        }}
                      >
                        {d.expiresAt
                          ? new Date(d.expiresAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </span>
                    </td>

                    <td>
                      {isExpired ? (
                        <span className={`${styles.badge} ${styles.badgeCancelled}`}>EXPIRED</span>
                      ) : isLimitReached ? (
                        <span className={`${styles.badge} ${styles.badgeCancelled}`}>LIMIT REACHED</span>
                      ) : d.active ? (
                        <span className={`${styles.badge} ${styles.badgeApproved}`}>ACTIVE</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgePending}`}>INACTIVE</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onClick={() => handleToggleActive(d)}
                        >
                          {d.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{
                            padding: '0.3rem 0.5rem',
                            color: '#B91C1C',
                            borderColor: '#FCA5A5',
                          }}
                          onClick={() => handleDelete(d.id, d.code)}
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(30, 20, 15, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E8DDD2',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-espresso)', margin: 0 }}>
                Create Discount Coupon
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#736B63',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                <label className={styles.formLabel}>Promo Code *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. WELCOME10, FESTIVE500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount Type *</label>
                  <select
                    className={styles.select}
                    style={{ width: '100%' }}
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Discount Value {type === 'PERCENTAGE' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.input}
                    placeholder={type === 'PERCENTAGE' ? '15' : '200'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Min. Order Value (₹)</label>
                  <input
                    type="number"
                    step="1"
                    className={styles.input}
                    placeholder="0"
                    value={minimumOrderValue}
                    onChange={(e) => setMinimumOrderValue(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Max. Discount Cap (₹)</label>
                  <input
                    type="number"
                    step="1"
                    className={styles.input}
                    placeholder="Leave blank for no cap"
                    value={maximumDiscount}
                    onChange={(e) => setMaximumDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Usage Limit (Times)</label>
                  <input
                    type="number"
                    step="1"
                    className={styles.input}
                    placeholder="Leave blank for unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-espresso)' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '0.9rem', color: '#4A3E36', cursor: 'pointer' }}>
                  Enable coupon immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
