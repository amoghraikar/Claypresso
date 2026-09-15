'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Store,
  Truck,
  Clock,
  Instagram,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Settings states
  const [storeName, setStoreName] = useState('Claypresso');
  const [supportEmail, setSupportEmail] = useState('hello@claypresso.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/claypresso');
  const [operatingStatus, setOperatingStatus] = useState('ACCEPTING_ORDERS');

  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [standardShippingRate, setStandardShippingRate] = useState('99');
  const [shippingTerritory, setShippingTerritory] = useState('India (Domestic Only)');

  const [defaultProductionDays, setDefaultProductionDays] = useState('3-5 business days');
  const [announcementText, setAnnouncementText] = useState(
    'Free shipping across India on orders above ₹999 • Handcrafted with love'
  );

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const res = await apiClient.get<Record<string, string>>('/api/admin/settings');
      if (res.success && res.data) {
        const s = res.data;
        if (s.store_name) setStoreName(s.store_name);
        if (s.support_email) setSupportEmail(s.support_email);
        if (s.support_phone) setSupportPhone(s.support_phone);
        if (s.instagram_url) setInstagramUrl(s.instagram_url);
        if (s.operating_status) setOperatingStatus(s.operating_status);

        if (s.free_shipping_threshold) setFreeShippingThreshold(s.free_shipping_threshold);
        if (s.standard_shipping_rate) setStandardShippingRate(s.standard_shipping_rate);
        if (s.shipping_territory) setShippingTerritory(s.shipping_territory);

        if (s.default_production_days) setDefaultProductionDays(s.default_production_days);
        if (s.announcement_text) setAnnouncementText(s.announcement_text);
      }
      setLoading(false);
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      store_name: storeName,
      support_email: supportEmail,
      support_phone: supportPhone,
      instagram_url: instagramUrl,
      operating_status: operatingStatus,
      free_shipping_threshold: freeShippingThreshold,
      standard_shipping_rate: standardShippingRate,
      shipping_territory: shippingTerritory,
      default_production_days: defaultProductionDays,
      announcement_text: announcementText,
    };

    const res = await apiClient.post<any>('/api/admin/settings', payload);
    setSaving(false);

    if (res.success) {
      setMessage({ text: 'Store settings saved successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ text: res.error || 'Failed to save settings', isError: true });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading store configurations...</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSave}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Store Settings</h1>
            <p className={styles.pageSubtitle}>
              Configure business details, shipping thresholds, studio operating status, and storefront announcements.
            </p>
          </div>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: message.isError ? '#FEE2E2' : '#E6F4EA',
              color: message.isError ? '#B91C1C' : '#1E6F3D',
              border: `1px solid ${message.isError ? '#FCA5A5' : '#A7F3D0'}`,
            }}
          >
            {message.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Business & Studio Info */}
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Store size={20} color="#8D5A3C" />
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                Store & Studio Profile
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Store Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Operating Status</label>
                <select
                  className={styles.select}
                  style={{ width: '100%' }}
                  value={operatingStatus}
                  onChange={(e) => setOperatingStatus(e.target.value)}
                >
                  <option value="ACCEPTING_ORDERS">Accepting Orders (Normal Operations)</option>
                  <option value="HIGH_DEMAND">High Demand (Longer Fulfillment Times)</option>
                  <option value="ON_HIATUS">On Studio Break / Hiatus</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Support Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Support Phone / WhatsApp</label>
                <input
                  type="text"
                  className={styles.input}
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Instagram Link</label>
                <input
                  type="url"
                  className={styles.input}
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Truck size={20} color="#8D5A3C" />
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                Shipping Configuration
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  step="1"
                  className={styles.input}
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#736B63', marginTop: '4px' }}>
                  Orders equal or above this amount receive free shipping.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  step="1"
                  className={styles.input}
                  value={standardShippingRate}
                  onChange={(e) => setStandardShippingRate(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#736B63', marginTop: '4px' }}>
                  Charged when cart is below free shipping threshold.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Shipping Territory</label>
                <input
                  type="text"
                  className={styles.input}
                  value={shippingTerritory}
                  disabled
                  style={{ backgroundColor: '#FDFBF9', color: '#736B63' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#736B63', marginTop: '4px' }}>
                  Strict domestic India delivery enforced.
                </span>
              </div>
            </div>
          </div>

          {/* Production & Customer Announcements */}
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Clock size={20} color="#8D5A3C" />
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                Production Timelines & Storefront Banners
              </h3>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
              <label className={styles.formLabel}>Default Made-to-Order Production Days</label>
              <input
                type="text"
                className={styles.input}
                value={defaultProductionDays}
                onChange={(e) => setDefaultProductionDays(e.target.value)}
                placeholder="e.g. 3-5 business days"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Top Bar Announcement Banner Message</label>
              <input
                type="text"
                className={styles.input}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Message shown across the top of customer pages"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
