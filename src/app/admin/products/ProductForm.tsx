'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  UploadCloud, 
  Star, 
  Check, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Eye,
  Info
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import styles from '../orders/orders.module.css';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const DEFAULT_CATEGORIES = [
  'Charms',
  'Keychain Charms',
  'Mini Phone Charms',
  'Magnets',
  'Trays',
  'Badges',
  'Hair Pins',
  'Custom Pieces'
];

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryName, setCategoryName] = useState(initialData?.category?.name || 'Charms');
  const [customCategory, setCustomCategory] = useState('');
  const [collection, setCollection] = useState(initialData?.collection || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ? String(initialData.originalPrice) : ''
  );
  const [productionType, setProductionType] = useState(
    initialData?.productionType || 'READY_MADE'
  );
  const [productionTime, setProductionTime] = useState(
    initialData?.productionTime || 'Ready to ship'
  );
  const [customizable, setCustomizable] = useState(initialData?.customizable || false);
  const [material, setMaterial] = useState(
    initialData?.material || 'Polymer Clay, Nickel-Free Hardware'
  );
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '2.5cm x 2.0cm');
  const [stock, setStock] = useState(initialData?.stock !== undefined ? String(initialData.stock) : '5');
  const [status, setStatus] = useState(initialData?.status || 'IN_STOCK');
  
  // Badges array for easy toggling
  const [badgesList, setBadgesList] = useState<string[]>(() => {
    if (!initialData?.badges) return ['new'];
    return initialData.badges.split(',').map((b: string) => b.trim()).filter(Boolean);
  });

  // Visual Images Array (first image is always the Primary Cover Photo)
  const [images, setImages] = useState<string[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((img: any) => (typeof img === 'string' ? img : img.url));
    }
    return [];
  });

  // UI States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProductSlug, setSavedProductSlug] = useState<string | null>(null);

  // Auto-generate clean slug from title if not set manually
  const generatedSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'new-clay-piece';

  // Toggle badge helper
  const toggleBadge = (badge: string) => {
    setBadgesList((prev) => 
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Upload single or multiple files
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length} (${file.name})...`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.data?.url) {
          uploadedUrls.push(data.data.url);
        } else {
          setError(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err: any) {
        setError(err.message || `Upload error on ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  // Photo ordering & cover selection
  const setCoverPhoto = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    setImages((prev) => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for this piece.');
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      setError('Please provide a valid selling price in ₹.');
      return;
    }

    setSaving(true);

    const finalCategory = categoryName === '__CUSTOM__' ? (customCategory.trim() || 'Charms') : categoryName;
    const finalImages = images.length > 0 ? images : ['/images/placeholder.png'];
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10) || 0;

    const payload = {
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim() || `${name.trim()} — Handcrafted polymer clay piece from Claypresso studio.`,
      categoryName: finalCategory,
      collection: collection || null,
      price: numPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      productionType,
      productionTime,
      customizable,
      material,
      dimensions,
      stock: numStock,
      status: numStock <= 0 ? 'OUT_OF_STOCK' : numStock <= 3 ? 'LOW_STOCK' : status,
      badges: badgesList.join(','),
      images: finalImages,
    };

    let res;
    if (isEdit && initialData?.id) {
      res = await apiClient.put(`/api/admin/products/${initialData.id}`, payload);
    } else {
      res = await apiClient.post('/api/admin/products', payload);
    }

    setSaving(false);

    if (res.success) {
      setSavedProductSlug(generatedSlug);
      router.push('/admin/products');
    } else {
      setError(res.error || 'Failed to save product. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm(`Are you sure you want to delete "${name}" from the store?`)) return;

    setSaving(true);
    const res = await apiClient.delete(`/api/admin/products/${initialData.id}`);
    setSaving(false);

    if (res.success) {
      router.push('/admin/products');
    } else {
      setError(res.error || 'Failed to delete product.');
    }
  };

  const primaryCoverImage = images[0] || '/images/placeholder.png';

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--color-warm-brown)',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div style={{ display: 'flex', gap: 10 }}>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFF1F0',
                color: '#CF1322',
                border: '1px solid #FFA39E',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={15} />
              <span>Delete Piece</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-espresso)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-clay-button)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Publishing...' : isEdit ? 'Update Piece' : 'Publish to Store'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            background: '#FFF1F0',
            color: '#CF1322',
            border: '1px solid #FFA39E',
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {savedProductSlug && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            background: '#F6FFED',
            color: '#389E0D',
            border: '1px solid #B7EB8F',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>✓ Published successfully! This piece is now live in the store.</span>
          <Link
            href={`/product/${savedProductSlug}`}
            target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#389E0D', textDecoration: 'underline' }}
          >
            View on Storefront <ExternalLink size={14} />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
        {/* LEFT COLUMN: VISUAL PHOTOS & DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 1. VISUAL PHOTO UPLOADER */}
          <div className={styles.card} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Product Photos</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                  Upload photos of your piece. The first photo with the star (★) will be the main cover photo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-warm-brown)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <UploadCloud size={16} />
                <span>{uploading ? 'Uploading...' : '+ Add Photos'}</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleFilesUpload(e.target.files)}
              disabled={uploading}
              style={{ display: 'none' }}
            />

            {/* Drag & Drop Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragOver ? '2px dashed var(--color-warm-brown)' : '2px dashed var(--color-border)',
                backgroundColor: isDragOver ? 'var(--color-peach-light)' : '#FAF6F0',
                borderRadius: 'var(--radius-md)',
                padding: images.length === 0 ? '36px 20px' : '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: 16,
              }}
            >
              <UploadCloud size={32} color="var(--color-warm-brown)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-espresso)' }}>
                {uploading ? uploadProgress : 'Tap to select photos or drag & drop here'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', marginTop: 4 }}>
                Supports JPG, PNG, and WebP photos directly from your phone or computer.
              </div>
            </div>

            {/* Photo Thumbnails Grid */}
            {images.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-espresso)', marginBottom: 10 }}>
                  Uploaded Photos ({images.length})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid var(--color-warm-brown)' : '1px solid var(--color-border)',
                        background: '#FFFFFF',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: 120 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Piece photo ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Primary Cover Badge */}
                      {idx === 0 ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'var(--color-espresso)',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 7px',
                            borderRadius: 'var(--radius-pill)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          }}
                        >
                          <Star size={10} fill="#FFE58F" color="#FFE58F" /> Cover
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverPhoto(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'rgba(255,255,255,0.92)',
                            color: 'var(--color-espresso)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 6px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--color-border)',
                            cursor: 'pointer',
                          }}
                        >
                          Set Cover
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: '#CF1322',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                        title="Remove photo"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Reorder Buttons */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          background: '#FDFBF7',
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePhoto(idx, 'left')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: idx === 0 ? '#CCC' : 'var(--color-warm-brown)',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            padding: '2px 4px',
                          }}
                          title="Move left"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        <span style={{ fontSize: '10px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                          #{idx + 1}
                        </span>

                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => movePhoto(idx, 'right')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: idx === images.length - 1 ? '#CCC' : 'var(--color-warm-brown)',
                            cursor: idx === images.length - 1 ? 'default' : 'pointer',
                            padding: '2px 4px',
                          }}
                          title="Move right"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. PIECE DETAILS */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Piece Information</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                  PIECE NAME *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Midnight Crescent Cat Charm"
                  className={styles.searchInput}
                  style={{ width: '100%', fontSize: '15px', fontWeight: 600 }}
                  required
                />
                <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', marginTop: 4 }}>
                  Live storefront URL: <code style={{ color: 'var(--color-warm-brown)' }}>/product/{generatedSlug}</code>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your piece — color palette, inspiration, charm details..."
                  className={styles.searchInput}
                  style={{ width: '100%', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    CATEGORY
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={styles.selectInput}
                    style={{ width: '100%' }}
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__CUSTOM__">+ Add New Category...</option>
                  </select>

                  {categoryName === '__CUSTOM__' && (
                    <input
                      type="text"
                      placeholder="Type category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className={styles.searchInput}
                      style={{ width: '100%', marginTop: 8 }}
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    COLLECTION (OPTIONAL)
                  </label>
                  <select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className={styles.selectInput}
                    style={{ width: '100%' }}
                  >
                    <option value="">None (Standard Catalog)</option>
                    <option value="bestsellers">Bestsellers</option>
                    <option value="new-arrivals">New Arrivals / Fresh Drops</option>
                    <option value="gifts">Gifts & Keepsakes</option>
                    <option value="under-250">Under ₹250</option>
                    <option value="under-500">Under ₹500</option>
                  </select>
                </div>
              </div>

              {/* Craft Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    MATERIALS
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. Polymer Clay, Gold Hardware"
                    className={styles.searchInput}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    DIMENSIONS
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 3.0cm x 2.2cm"
                    className={styles.searchInput}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICING, INVENTORY, BADGES & LIVE PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 1. PRICING & STOCK */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Pricing & Stock</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    SELLING PRICE (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 10, fontWeight: 700, color: 'var(--color-warm-brown)' }}>₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="349"
                      className={styles.searchInput}
                      style={{ width: '100%', paddingLeft: 28, fontSize: '16px', fontWeight: 700 }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    ORIGINAL PRICE (₹)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 10, fontWeight: 700, color: 'var(--color-muted-brown)' }}>₹</span>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="399"
                      className={styles.searchInput}
                      style={{ width: '100%', paddingLeft: 28 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    PIECES IN STOCK
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={styles.searchInput}
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 6 }}>
                    CREATION TYPE
                  </label>
                  <select
                    value={productionType}
                    onChange={(e) => setProductionType(e.target.value)}
                    className={styles.selectInput}
                    style={{ width: '100%' }}
                  >
                    <option value="READY_MADE">Ready to Ship</option>
                    <option value="MADE_TO_ORDER">Made to Order (~3-5 days)</option>
                    <option value="CUSTOM">Custom Commission</option>
                  </select>
                </div>
              </div>

              {/* Badges Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-espresso)', marginBottom: 8 }}>
                  STOREFRONT BADGES
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleBadge('bestseller')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: badgesList.includes('bestseller') ? '1.5px solid var(--color-warm-brown)' : '1px solid var(--color-border)',
                      backgroundColor: badgesList.includes('bestseller') ? 'var(--color-peach-light)' : '#FFFFFF',
                      color: badgesList.includes('bestseller') ? 'var(--color-espresso)' : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    ⭐ Bestseller (Homepage Feature)
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBadge('new')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: badgesList.includes('new') ? '1.5px solid var(--color-warm-brown)' : '1px solid var(--color-border)',
                      backgroundColor: badgesList.includes('new') ? 'var(--color-peach-light)' : '#FFFFFF',
                      color: badgesList.includes('new') ? 'var(--color-espresso)' : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    ✦ Fresh Drop / New
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBadge('gift')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: badgesList.includes('gift') ? '1.5px solid var(--color-warm-brown)' : '1px solid var(--color-border)',
                      backgroundColor: badgesList.includes('gift') ? 'var(--color-peach-light)' : '#FFFFFF',
                      color: badgesList.includes('gift') ? 'var(--color-espresso)' : 'var(--color-text-secondary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    🎁 Gift Idea
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. LIVE STOREFRONT CARD PREVIEW */}
          <div className={styles.card} style={{ backgroundColor: 'var(--color-cream-soft)', border: '1.5px dashed var(--color-border-warm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Eye size={16} color="var(--color-warm-brown)" />
              <h2 className={styles.cardTitle} style={{ margin: 0, fontSize: '13px' }}>
                Customer Live Preview
              </h2>
            </div>
            
            <p style={{ fontSize: '11px', color: 'var(--color-muted-brown)', margin: '0 0 14px' }}>
              How this piece will look to buyers on the homepage and catalog:
            </p>

            {/* Mock Product Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                boxShadow: 'var(--shadow-clay-card)',
                maxWidth: 240,
                margin: '0 auto',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 190,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#F5EBE1',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryCoverImage}
                  alt={name || 'Clay piece preview'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {badgesList.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: 'rgba(255,255,255,0.92)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: 'var(--color-espresso)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {badgesList[0]}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: '10px', color: 'var(--color-muted-brown)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {categoryName === '__CUSTOM__' ? customCategory || 'Charms' : categoryName}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-espresso)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name || 'Untiled Clay Creation'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-warm-brown)' }}>
                    ₹{price || '0'}
                  </div>
                  <div style={{ fontSize: '10px', color: parseInt(stock, 10) > 0 ? '#389E0D' : '#CF1322', fontWeight: 700 }}>
                    {parseInt(stock, 10) > 0 ? `${stock} in stock` : 'Sold out'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--color-espresso)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: '15px',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-clay-button)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Publishing...' : isEdit ? 'Save Changes' : 'Publish to Website'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
