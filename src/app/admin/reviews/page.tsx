'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  authorName: string;
  rating: number;
  title?: string;
  content: string;
  verifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (statusFilter !== 'all') query.set('status', statusFilter);

    const res = await apiClient.get<ReviewItem[]>(`/api/admin/reviews?${query.toString()}`);
    if (res.success && res.data) {
      setReviews(res.data);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    setActionLoading(id);
    const res = await apiClient.patch<any>(`/api/admin/reviews/${id}`, { status: newStatus });
    setActionLoading(null);

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } else {
      alert(res.error || 'Failed to update review status');
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Review Moderation</h1>
          <p className={styles.pageSubtitle}>
            Moderate customer product reviews before they appear on the public storefront.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'all' ? styles.tabBtnActive : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Reviews
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'PENDING' ? styles.tabBtnActive : ''}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: '6px',
                backgroundColor: '#D97706',
                color: '#FFF',
                borderRadius: '10px',
                padding: '2px 7px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'APPROVED' ? styles.tabBtnActive : ''}`}
          onClick={() => setStatusFilter('APPROVED')}
        >
          Approved
        </button>
        <button
          className={`${styles.tabBtn} ${statusFilter === 'REJECTED' ? styles.tabBtnActive : ''}`}
          onClick={() => setStatusFilter('REJECTED')}
        >
          Rejected
        </button>
      </div>

      {/* Reviews Content */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading customer reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No reviews found</h3>
          <p className={styles.emptyText}>
            {statusFilter === 'PENDING'
              ? 'No pending reviews waiting for moderation.'
              : 'No customer reviews match this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              className={styles.card}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                borderLeft:
                  r.status === 'APPROVED'
                    ? '4px solid #1E6F3D'
                    : r.status === 'REJECTED'
                    ? '4px solid #B91C1C'
                    : '4px solid #D97706',
              }}
            >
              {/* Review Body */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={star <= r.rating ? '#F59E0B' : 'transparent'}
                        color={star <= r.rating ? '#F59E0B' : '#D1C7BD'}
                      />
                    ))}
                  </div>

                  {r.title && (
                    <span style={{ fontWeight: 700, color: 'var(--color-espresso)', fontSize: '1rem' }}>
                      {r.title}
                    </span>
                  )}

                  <span
                    className={`${styles.badge} ${
                      r.status === 'APPROVED'
                        ? styles.badgeApproved
                        : r.status === 'REJECTED'
                        ? styles.badgeCancelled
                        : styles.badgePending
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <p
                  style={{
                    color: '#4A3E36',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    margin: '0 0 0.75rem 0',
                  }}
                >
                  {r.content}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#736B63',
                  }}
                >
                  <span>
                    By <strong style={{ color: 'var(--color-espresso)' }}>{r.authorName}</strong>
                  </span>

                  {r.verifiedPurchase && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#1E6F3D',
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={14} />
                      Verified Purchase
                    </span>
                  )}

                  <span>•</span>

                  <span>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Product Info & Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '1rem',
                  minWidth: '220px',
                }}
              >
                {/* Product badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#FDFBF9',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #E8DDD2',
                    maxWidth: '240px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      position: 'relative',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#F5EBE1',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={r.productImage}
                      alt={r.productName}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--color-espresso)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.productName}
                    </div>
                    <Link
                      href={`/product/${r.productSlug}`}
                      target="_blank"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-warm-brown)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      Store page <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>

                {/* Moderate Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {r.status !== 'APPROVED' && (
                    <button
                      className={styles.btnPrimary}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#1E6F3D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      disabled={actionLoading === r.id}
                      onClick={() => handleModerate(r.id, 'APPROVED')}
                    >
                      <CheckCircle2 size={14} />
                      Approve
                    </button>
                  )}

                  {r.status !== 'REJECTED' && (
                    <button
                      className={styles.btnSecondary}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.85rem',
                        color: '#B91C1C',
                        borderColor: '#FCA5A5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      disabled={actionLoading === r.id}
                      onClick={() => handleModerate(r.id, 'REJECTED')}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
