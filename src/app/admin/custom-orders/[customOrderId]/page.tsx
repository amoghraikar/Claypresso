'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Image as ImageIcon, Send, Clock, X } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../../orders/orders.module.css';

export default function AdminCustomOrderDetailPage() {
  const params = useParams();
  const customOrderId = params?.customOrderId as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDays, setQuoteDays] = useState('25');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteValidity, setQuoteValidity] = useState('7');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!customOrderId) return;
      setLoading(true);
      const res = await apiClient.get<any>(`/api/admin/custom-orders/${customOrderId}`);
      if (res.success && res.data) {
        setRequest(res.data);
        setSelectedStatus(res.data.status);
      }
      setLoading(false);
    }

    loadDetail();
  }, [customOrderId]);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotePrice || parseFloat(quotePrice) <= 0) return;

    setSubmittingQuote(true);
    setMessage(null);

    const res = await apiClient.post<any>(`/api/admin/custom-orders/${request.id}/quote`, {
      price: parseFloat(quotePrice),
      productionDays: parseInt(quoteDays, 10),
      notes: quoteNotes,
      validityDays: parseInt(quoteValidity, 10),
    });

    setSubmittingQuote(false);

    if (res.success && res.data?.quote) {
      setMessage({ text: 'Quotation generated and sent to customer!' });
      setRequest((prev: any) => ({
        ...prev,
        status: 'QUOTED',
        quotes: [res.data.quote, ...(prev.quotes || [])],
      }));
      setSelectedStatus('QUOTED');
      setQuotePrice('');
      setQuoteNotes('');
    } else {
      setMessage({ text: res.error || 'Failed to create quote', isError: true });
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === request.status) return;

    setMessage(null);
    const res = await apiClient.patch<any>(`/api/admin/custom-orders/${request.id}`, {
      status: selectedStatus,
    });

    if (res.success && res.data?.customOrder) {
      setRequest(res.data.customOrder);
      setMessage({ text: `Status updated to ${res.data.customOrder.status}!` });
    } else {
      setMessage({ text: res.error || 'Failed to update status', isError: true });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Loading custom inquiry...
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Custom inquiry not found.</p>
        <Link href="/admin/custom-orders" style={{ color: 'var(--color-warm-brown)', fontWeight: 600 }}>
          ← Back to custom orders
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          href="/admin/custom-orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-warm-brown)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to custom inquiries
        </Link>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Submitted on {new Date(request.createdAt).toLocaleString('en-IN')}
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

      <div className={styles.detailGrid}>
        {/* LEFT COLUMN: SPECIFICATIONS & IMAGES */}
        <div>
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className={styles.cardTitle} style={{ border: 'none', margin: 0, padding: 0 }}>
                {request.referenceNumber} — {request.category}
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
                {request.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '14px', marginTop: 16 }}>
              <div>
                <strong style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block', textTransform: 'uppercase' }}>
                  Description
                </strong>
                <p style={{ marginTop: 4, lineHeight: 1.6, background: '#FAF8F5', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  {request.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>QUANTITY</span>
                  <strong>{request.quantity} units</strong>
                </div>
                {request.approximateSize && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>SIZE</span>
                    <strong>{request.approximateSize}</strong>
                  </div>
                )}
                {request.preferredColors && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>COLORS</span>
                    <strong>{request.preferredColors}</strong>
                  </div>
                )}
                {request.theme && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>THEME</span>
                    <strong>{request.theme}</strong>
                  </div>
                )}
                {request.textToInclude && (
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>ENGRAVED TEXT</span>
                    <strong>&ldquo;{request.textToInclude}&rdquo;</strong>
                  </div>
                )}
              </div>

              {request.additionalInstructions && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>ADDITIONAL NOTES</span>
                  <p style={{ marginTop: 4 }}>{request.additionalInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reference Images Gallery */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              Reference Images ({request.referenceImages?.length || 0})
            </h3>
            {(!request.referenceImages || request.referenceImages.length === 0) ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No reference images uploaded with this request.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
                {request.referenceImages.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img.previewUrl || img.url)}
                    style={{
                      cursor: 'pointer',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Image
                      src={img.previewUrl || img.url || '/images/placeholder.png'}
                      alt={img.name || 'Reference photo'}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ fontSize: '10px', textAlign: 'center', padding: '4px', background: '#FAFAFA' }}>
                      Click to zoom
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUOTE CREATION & STATUS */}
        <div>
          {/* Create / Edit Quote */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Create Studio Quotation</h3>
            <form onSubmit={handleCreateQuote}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  PRICE (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className={styles.searchInput}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  PRODUCTION WINDOW (DAYS)
                </label>
                <input
                  type="number"
                  value={quoteDays}
                  onChange={(e) => setQuoteDays(e.target.value)}
                  className={styles.searchInput}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  QUOTE VALIDITY (DAYS)
                </label>
                <input
                  type="number"
                  value={quoteValidity}
                  onChange={(e) => setQuoteValidity(e.target.value)}
                  className={styles.searchInput}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  STUDIO NOTES FOR CUSTOMER
                </label>
                <textarea
                  placeholder="e.g. Price includes dual-tone blending and waterproof glaze."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  rows={2}
                  className={styles.searchInput}
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingQuote}
                className={styles.actionBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={14} />
                <span>{submittingQuote ? 'Sending Quote...' : 'Dispatch Quote to Client'}</span>
              </button>
            </form>
          </div>

          {/* Workflow Status Updater */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Pipeline Status</h3>
            <form onSubmit={handleStatusChange}>
              <div style={{ marginBottom: 12 }}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={styles.selectInput}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="NEW">New Request</option>
                  <option value="REVIEWING">Reviewing Specs</option>
                  <option value="QUOTED">Quotation Sent</option>
                  <option value="APPROVED">Approved by Customer</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="SHIPPED">Dispatched / Shipped</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={selectedStatus === request.status}
                className={styles.actionBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Update Workflow Status
              </button>
            </form>
          </div>

          {/* Customer Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Client Information</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
              <div>
                <strong>{request.name}</strong>
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Email: {request.email}</div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Phone: {request.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{ position: 'relative', maxWidth: '800px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Expanded reference preview"
              width={700}
              height={700}
              style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius-md)' }}
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                padding: '6px',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
