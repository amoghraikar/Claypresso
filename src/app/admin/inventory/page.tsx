'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  Search,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  state: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  image: string;
  updatedAt: string;
  variants: Array<{
    id: string;
    name: string;
    stock: number;
    sku?: string;
  }>;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  // Adjustment modal state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [reason, setReason] = useState('New stock');
  const [customReason, setCustomReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (stateFilter !== 'all') query.set('status', stateFilter);
    if (search.trim()) query.set('search', search.trim());

    const res = await apiClient.get<any>(`/api/admin/inventory?${query.toString()}`);
    if (res.success && res.data?.items) {
      setItems(res.data.items);
    }
    setLoading(false);
  }, [stateFilter, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setSelectedVariantId('');
    setAdjustAmount(0);
    setReason('New stock');
    setCustomReason('');
    setFeedback(null);
  };

  const currentStock = selectedItem
    ? selectedVariantId
      ? selectedItem.variants.find((v) => v.id === selectedVariantId)?.stock ?? selectedItem.stock
      : selectedItem.stock
    : 0;

  const resultingStock = currentStock + adjustAmount;

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (resultingStock < 0) {
      setFeedback({ text: 'Stock cannot become negative.', isError: true });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const finalReason = reason === 'Other' ? (customReason.trim() || 'Other') : reason;

    const res = await apiClient.post<any>('/api/admin/inventory/adjust', {
      productId: selectedItem.id,
      variantId: selectedVariantId || undefined,
      adjustment: adjustAmount,
      reason: finalReason,
    });

    setSaving(false);

    if (res.success) {
      setFeedback({ text: 'Inventory updated successfully!' });
      setTimeout(() => {
        setSelectedItem(null);
        fetchInventory();
      }, 1000);
    } else {
      setFeedback({ text: res.error || 'Failed to adjust stock', isError: true });
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Inventory Management</h1>
          <p className={styles.pageSubtitle}>
            Monitor product stock levels, set low-stock thresholds, and record stock adjustments.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className={styles.controlsBar}>
        <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="all">All Inventory States</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading inventory items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <Boxes size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No inventory items found</h3>
          <p className={styles.emptyText}>
            Try changing your search query or inventory status filter.
          </p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variants / SKU</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>State</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                let badgeClass = styles.badgeApproved;
                let badgeLabel = 'IN STOCK';
                if (item.state === 'OUT_OF_STOCK') {
                  badgeClass = styles.badgeCancelled;
                  badgeLabel = 'OUT OF STOCK';
                } else if (item.state === 'LOW_STOCK') {
                  badgeClass = styles.badgePending;
                  badgeLabel = 'LOW STOCK';
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            position: 'relative',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#F5EBE1',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-espresso)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#736B63' }}>
                            {item.category} • ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {item.variants.length > 0 ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          {item.variants.map((v) => (
                            <div key={v.id} style={{ color: '#5A4A3E' }}>
                              {v.name}: <strong>{v.stock}</strong> {v.sku && `(${v.sku})`}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#9E948A' }}>Standard</span>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color:
                            item.stock <= 0
                              ? '#B91C1C'
                              : item.stock <= item.lowStockThreshold
                              ? '#D97706'
                              : '#1E6F3D',
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.9rem', color: '#736B63' }}>
                        {item.lowStockThreshold} units
                      </span>
                    </td>

                    <td>
                      <span className={`${styles.badge} ${badgeClass}`}>{badgeLabel}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#736B63' }}>
                        {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`${styles.btnSecondary}`}
                        onClick={() => openAdjustModal(item)}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <Edit size={13} style={{ marginRight: '4px' }} />
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
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
              maxWidth: '520px',
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
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-espresso)', margin: 0 }}>
                  Adjust Inventory
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#736B63', fontSize: '0.9rem' }}>
                  {selectedItem.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
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

            <form onSubmit={handleAdjustSubmit}>
              {selectedItem.variants.length > 0 && (
                <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                  <label className={styles.formLabel}>Target Variant (Optional)</label>
                  <select
                    className={styles.select}
                    style={{ width: '100%' }}
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                  >
                    <option value="">Base Product Stock ({selectedItem.stock})</option>
                    {selectedItem.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Current: {v.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#FDFBF9',
                  borderRadius: '8px',
                  border: '1px solid #E8DDD2',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#736B63', textTransform: 'uppercase' }}>
                    Current
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-espresso)' }}>
                    {currentStock}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#736B63', textTransform: 'uppercase' }}>
                    Adjustment
                  </div>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: adjustAmount > 0 ? '#1E6F3D' : adjustAmount < 0 ? '#B91C1C' : '#736B63',
                    }}
                  >
                    {adjustAmount > 0 ? `+${adjustAmount}` : adjustAmount}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#736B63', textTransform: 'uppercase' }}>
                    Resulting
                  </div>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      color: resultingStock < 0 ? '#B91C1C' : 'var(--color-espresso)',
                    }}
                  >
                    {resultingStock}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                <label className={styles.formLabel}>Stock Adjustment Amount (+ / -)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAdjustAmount((prev) => prev - 5)}
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAdjustAmount((prev) => prev - 1)}
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    className={styles.input}
                    style={{ textAlign: 'center', fontWeight: 600 }}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value || '0', 10))}
                  />
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAdjustAmount((prev) => prev + 1)}
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAdjustAmount((prev) => prev + 5)}
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    +5
                  </button>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                <label className={styles.formLabel}>Reason for Adjustment *</label>
                <select
                  className={styles.select}
                  style={{ width: '100%' }}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="New stock">New stock received</option>
                  <option value="Manual correction">Manual count correction</option>
                  <option value="Damaged item">Damaged item</option>
                  <option value="Lost item">Lost / Missing item</option>
                  <option value="Returned item">Returned item</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              {reason === 'Other' && (
                <div className={styles.formGroup} style={{ marginBottom: '1.25rem' }}>
                  <label className={styles.formLabel}>Specify Reason *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter reason for audit record"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                  />
                </div>
              )}

              {feedback && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    backgroundColor: feedback.isError ? '#FEE2E2' : '#E6F4EA',
                    color: feedback.isError ? '#B91C1C' : '#1E6F3D',
                  }}
                >
                  {feedback.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setSelectedItem(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={saving || adjustAmount === 0 || resultingStock < 0}
                >
                  {saving ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
