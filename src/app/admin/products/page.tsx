'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingDemo, setClearingDemo] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const params: any = { limit: 50 };
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    const res = await apiClient.get<any>('/api/admin/products', params);
    if (res.success && res.data?.products) {
      setProducts(res.data.products);
    }
    setLoading(false);
  };

  const handleClearDemo = async () => {
    if (!confirm('Are you sure you want to clear all demo products? This will give you a clean store to add your own real creations.')) {
      return;
    }
    setClearingDemo(true);
    setMessage(null);
    const res = await apiClient.post<any>('/api/admin/catalog/clear-demo', {});
    setClearingDemo(false);
    if (res.success) {
      setMessage(res.data?.message || 'Demo products cleared!');
      fetchProducts();
    } else {
      alert(res.error || 'Failed to clear demo products');
    }
  };

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const params: any = { limit: 50 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get<any>('/api/admin/products', params);
      if (res.success && res.data?.products) {
        setProducts(res.data.products);
      }
      setLoading(false);
    }

    loadProducts();
  }, [categoryFilter, statusFilter, search]);

  return (
    <div className={styles.container}>
      {/* Top Bar with Add CTA */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search products by title, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className={styles.selectInput}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Charms">Charms</option>
            <option value="Keychain Charms">Keychain Charms</option>
            <option value="Mini Phone Charms">Mini Phone Charms</option>
            <option value="Magnets">Magnets</option>
            <option value="Trays">Trays</option>
            <option value="Badges">Badges</option>
            <option value="Hair Pins">Hair Pins</option>
          </select>

          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleClearDemo}
            disabled={clearingDemo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: '#FFF1F0',
              color: '#CF1322',
              border: '1px solid #FFA39E',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: clearingDemo ? 'not-allowed' : 'pointer',
              opacity: clearingDemo ? 0.6 : 1,
            }}
          >
            <Trash2 size={15} />
            <span>{clearingDemo ? 'Clearing...' : 'Clear Demo Products'}</span>
          </button>

          <Link
            href="/admin/products/new"
            className={styles.actionBtn}
            style={{ textDecoration: 'none' }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            background: '#F6FFED',
            color: '#389E0D',
            border: '1px solid #B7EB8F',
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading catalog products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No products match the filter criteria.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Image
                          src={p.image || '/images/placeholder.png'}
                          alt={p.name}
                          width={44}
                          height={44}
                          style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                        />
                        <div>
                          <Link href={`/admin/products/${p.id}`} className={styles.orderRowLink}>
                            {p.name}
                          </Link>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      <strong>₹{p.price}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {p.productionType === 'MADE_TO_ORDER' ? 'Made-to-order' : 'Ready-made'}
                      </span>
                    </td>
                    <td>
                      <strong>{p.stock}</strong> units
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background:
                            p.status === 'IN_STOCK'
                              ? '#F6FFED'
                              : p.status === 'LOW_STOCK'
                              ? '#FFF7E6'
                              : '#FFF1F0',
                          color:
                            p.status === 'IN_STOCK'
                              ? '#389E0D'
                              : p.status === 'LOW_STOCK'
                              ? '#D46B08'
                              : '#CF1322',
                        }}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link
                          href={`/admin/products/${p.id}`}
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-warm-brown)',
                            textDecoration: 'none',
                          }}
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          View ↗
                        </Link>
                      </div>
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
