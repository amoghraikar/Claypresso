'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import {
  CustomCategory,
  CUSTOM_CATEGORIES,
  UploadedReferenceImage,
  CustomRequestFormValues,
  CustomRequestFormErrors,
} from '@/types/custom';
import { Magnetic } from '@/components/common/Motion';
import { customRequestService } from '@/services/customRequestService';
import { BUSINESS_RULES } from '@/types/product';
import styles from './request.module.css';

export default function CustomRequestPage() {
  const router = useRouter();

  // Form State
  const [form, setForm] = useState<CustomRequestFormValues>({
    fullName: '',
    email: '',
    phone: '',
    category: 'Clay Charm',
    customCategoryDetails: '',
    description: '',
    preferredColors: '',
    theme: '',
    textToInclude: '',
    quantity: 1,
    approximateSize: '',
    additionalInstructions: '',
    referenceImages: [],
  });

  const [errors, setErrors] = useState<CustomRequestFormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Field Refs for auto-focus on error
  const fieldRefs = {
    fullName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    customCategoryDetails: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Input Changes
  const handleTextChange = (
    field: keyof CustomRequestFormValues,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Image Upload Handling
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const newImages: UploadedReferenceImage[] = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
        setUploadError(`"${file.name}" is not a supported image format. Please upload PNG, JPG, or WEBP.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setUploadError(`"${file.name}" exceeds the 10MB limit. Please upload a smaller image.`);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'custom-requests');

      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          const remoteUrl = data.success && data.data?.url ? data.data.url : URL.createObjectURL(file);
          const newImg: UploadedReferenceImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            previewUrl: remoteUrl,
            type: file.type,
          };

          setForm((prev) => ({
            ...prev,
            referenceImages: [...prev.referenceImages, newImg],
          }));
        })
        .catch((err) => {
          console.error('Custom image upload error:', err);
          setUploadError(`Failed to upload "${file.name}". Please retry.`);
        })
        .finally(() => {
          setUploading(false);
        });
    });
  };

  const handleRemoveImage = (id: string) => {
    setForm((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((img) => img.id !== id),
    }));
  };

  // Drag & Drop
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
    handleFiles(e.dataTransfer.files);
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: CustomRequestFormErrors = {};

    // 1. Name
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      newErrors.fullName = 'Enter your full name.';
    }

    // 2. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    // 3. Phone (India: 10 digits starting 6,7,8,9)
    const cleanedPhone = form.phone.replace(/\D/g, '');
    const validIndianPhone = /^[6-9]\d{9}$/;
    const normalizedPhone =
      cleanedPhone.length === 12 && cleanedPhone.startsWith('91')
        ? cleanedPhone.slice(2)
        : cleanedPhone;

    if (!validIndianPhone.test(normalizedPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number.';
    }

    // 4. Other Category detail
    if (form.category === 'Other' && !form.customCategoryDetails.trim()) {
      newErrors.customCategoryDetails = 'Please specify what you would like made.';
    }

    // 5. Idea Description
    if (!form.description.trim() || form.description.trim().length < 10) {
      newErrors.description = 'Please describe your idea (at least 10 characters).';
    }

    setErrors(newErrors);

    // Auto-focus on first invalid field
    const errorKeys = Object.keys(newErrors) as (keyof typeof fieldRefs)[];
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const targetRef = fieldRefs[firstKey];
      if (targetRef && targetRef.current) {
        targetRef.current.focus();
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // 1. Post to backend database
      const serverRes = await customRequestService.createRequestOnServer(form);
      const payload = customRequestService.buildRequestPayload(form);

      if (serverRes.success && serverRes.data?.referenceNumber) {
        payload.referenceNumber = serverRes.data.referenceNumber;
        payload.id = serverRes.data.id;
      }

      // 2. Persist in session cache for immediate success view
      customRequestService.saveRequest(payload);
      router.push('/custom/request/success');
    } catch {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.requestPage}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className={styles.breadcrumbNav}>
          <Link href="/custom" className={styles.backLink} aria-label="Return to Custom overview">
            <ArrowLeft size={16} /> Back to Custom Creations
          </Link>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            No upfront payment required
          </span>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <span className={styles.headerEyebrow}>Custom Commission Request</span>
          <h1 className={styles.pageTitle}>TELL US WHAT YOU&apos;RE IMAGINING.</h1>
          <p className={styles.pageSubtitle}>
            Send us the details. We&apos;ll take a look and get back to you with a quote.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer} noValidate>
          {/* ============================================================ */}
          {/* SECTION 1: YOUR DETAILS                                      */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>1</span>
              <h2 className={styles.sectionTitle}>Your Details</h2>
            </div>
            <p className={styles.sectionNote}>
              We use these contact details to reply with your personalized design review and quote.
            </p>

            <div className={styles.formRow}>
              <label htmlFor="custom-name" className={styles.fieldLabel}>
                <span>Full Name<span className={styles.requiredStar}>*</span></span>
              </label>
              <input
                ref={fieldRefs.fullName}
                id="custom-name"
                type="text"
                required
                placeholder="e.g. Diya Sharma"
                value={form.fullName}
                onChange={(e) => handleTextChange('fullName', e.target.value)}
                className={`${styles.inputField} ${errors.fullName ? styles.inputFieldError : ''}`}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'error-name' : undefined}
              />
              {errors.fullName && (
                <span id="error-name" className={styles.fieldError} role="alert">
                  <AlertCircle size={14} /> {errors.fullName}
                </span>
              )}
            </div>

            <div className={styles.formGridTwo}>
              <div className={styles.formRow} style={{ marginBottom: 0 }}>
                <label htmlFor="custom-email" className={styles.fieldLabel}>
                  <span>Email Address<span className={styles.requiredStar}>*</span></span>
                </label>
                <input
                  ref={fieldRefs.email}
                  id="custom-email"
                  type="email"
                  required
                  placeholder="diya@example.com"
                  value={form.email}
                  onChange={(e) => handleTextChange('email', e.target.value)}
                  className={`${styles.inputField} ${errors.email ? styles.inputFieldError : ''}`}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && (
                  <span id="error-email" className={styles.fieldError} role="alert">
                    <AlertCircle size={14} /> {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.formRow} style={{ marginBottom: 0 }}>
                <label htmlFor="custom-phone" className={styles.fieldLabel}>
                  <span>Mobile (SMS &amp; WhatsApp)<span className={styles.requiredStar}>*</span></span>
                </label>
                <input
                  ref={fieldRefs.phone}
                  id="custom-phone"
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) => handleTextChange('phone', e.target.value)}
                  className={`${styles.inputField} ${errors.phone ? styles.inputFieldError : ''}`}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'error-phone' : undefined}
                />
                {errors.phone && (
                  <span id="error-phone" className={styles.fieldError} role="alert">
                    <AlertCircle size={14} /> {errors.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: WHAT ARE YOU MAKING?                              */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>2</span>
              <h2 className={styles.sectionTitle}>What Are You Making?</h2>
            </div>
            <p className={styles.sectionNote}>
              Choose the general accessory type. This helps us estimate clay volume and hardware fittings.
            </p>

            <div className={styles.categoryGrid} role="radiogroup" aria-label="Product Category">
              {CUSTOM_CATEGORIES.map((cat) => {
                const isSelected = form.category === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`${styles.categoryCard} ${isSelected ? styles.categoryCardSelected : ''}`}
                    onClick={() => handleTextChange('category', cat.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleTextChange('category', cat.id);
                      }
                    }}
                  >
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    <span className={styles.categoryLabel}>{cat.label}</span>
                    <span className={styles.categoryDesc}>{cat.description}</span>
                  </div>
                );
              })}
            </div>

            {/* If "Other" is selected, show detail text input */}
            {form.category === 'Other' && (
              <div className={styles.formRow} style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
                <label htmlFor="custom-other" className={styles.fieldLabel}>
                  <span>Tell us what you&apos;re thinking<span className={styles.requiredStar}>*</span></span>
                </label>
                <input
                  ref={fieldRefs.customCategoryDetails}
                  id="custom-other"
                  type="text"
                  required
                  placeholder="e.g. Desk cable holder, bookmark charm, miniature statue..."
                  value={form.customCategoryDetails}
                  onChange={(e) => handleTextChange('customCategoryDetails', e.target.value)}
                  className={`${styles.inputField} ${errors.customCategoryDetails ? styles.inputFieldError : ''}`}
                />
                {errors.customCategoryDetails && (
                  <span className={styles.fieldError} role="alert">
                    <AlertCircle size={14} /> {errors.customCategoryDetails}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: TELL US ABOUT IT                                  */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>3</span>
              <h2 className={styles.sectionTitle}>Tell Us About It</h2>
            </div>

            <div className={styles.formRow} style={{ marginBottom: 0 }}>
              <label htmlFor="custom-desc" className={styles.fieldLabel}>
                <span>Describe Your Idea<span className={styles.requiredStar}>*</span></span>
              </label>
              <textarea
                ref={fieldRefs.description}
                id="custom-desc"
                required
                rows={5}
                placeholder="Tell us what you'd like made, what it should look like, and anything important we should know..."
                value={form.description}
                onChange={(e) => handleTextChange('description', e.target.value)}
                className={`${styles.textareaField} ${errors.description ? styles.inputFieldError : ''}`}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'error-desc' : 'helper-desc'}
              />
              <span id="helper-desc" className={styles.fieldHelperText}>
                Be as descriptive as you like! Mention characters, cute poses, specific facial expressions, or textures.
              </span>
              {errors.description && (
                <span id="error-desc" className={styles.fieldError} role="alert">
                  <AlertCircle size={14} /> {errors.description}
                </span>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: REFERENCE IMAGES                                  */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>4</span>
              <h2 className={styles.sectionTitle}>Reference Images</h2>
            </div>
            <p className={styles.sectionNote}>
              Have a photo, sketch, screenshot or inspiration image? Send it over.
            </p>

            {/* Dropzone Upload */}
            <div
              className={`${styles.uploadDropzone} ${isDragOver ? styles.uploadDropzoneDragOver : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/heic"
                className={styles.hiddenFileInput}
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className={styles.uploadIconCircle}>
                <Upload size={22} />
              </div>
              <div className={styles.uploadHeading}>
                {uploading ? 'Processing files...' : 'Upload Reference Photos'}
              </div>
              <p className={styles.uploadSubtext}>
                Click to browse or drag &amp; drop images here
              </p>
              <span className={styles.uploadFormats}>
                PNG, JPG, WEBP or HEIC (Up to 10MB each)
              </span>
            </div>

            {uploadError && (
              <div className={styles.fieldError} style={{ marginTop: '12px' }} role="alert">
                <AlertCircle size={14} /> {uploadError}
              </div>
            )}

            {/* Previews Gallery */}
            {form.referenceImages.length > 0 && (
              <div className={styles.previewsGrid}>
                {form.referenceImages.map((img) => (
                  <div key={img.id} className={styles.previewCard}>
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => handleRemoveImage(img.id)}
                      aria-label={`Remove ${img.name}`}
                    >
                      <X size={14} />
                    </button>
                    <div className={styles.previewThumbWrap}>
                      <Image
                        src={img.previewUrl}
                        alt={img.name}
                        width={120}
                        height={100}
                        className={styles.previewThumb}
                      />
                    </div>
                    <span className={styles.previewFileName} title={img.name}>
                      {img.name}
                    </span>
                    <span className={styles.previewFileSize}>
                      {formatFileSize(img.size)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 5: FINAL DETAILS (OPTIONAL)                          */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>5</span>
              <h2 className={styles.sectionTitle}>Final Details</h2>
            </div>
            <p className={styles.sectionNote}>
              Optional styling preferences to help us match your aesthetic vision precisely.
            </p>

            <div className={styles.formGridTwo}>
              <div className={styles.formRow}>
                <label htmlFor="custom-colors" className={styles.fieldLabel}>
                  <span>Preferred Colors <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="custom-colors"
                  type="text"
                  placeholder="e.g. Pastel pink, lavender, matcha green"
                  value={form.preferredColors}
                  onChange={(e) => handleTextChange('preferredColors', e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formRow}>
                <label htmlFor="custom-theme" className={styles.fieldLabel}>
                  <span>Theme or Style <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="custom-theme"
                  type="text"
                  placeholder="e.g. Kawaii, Cottagecore, Minimalist"
                  value={form.theme}
                  onChange={(e) => handleTextChange('theme', e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formGridTwo}>
              <div className={styles.formRow}>
                <label htmlFor="custom-text" className={styles.fieldLabel}>
                  <span>Initials or Name to Include <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="custom-text"
                  type="text"
                  placeholder="e.g. 'P &amp; K' or 'LUNA'"
                  value={form.textToInclude}
                  onChange={(e) => handleTextChange('textToInclude', e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formRow}>
                <label htmlFor="custom-qty" className={styles.fieldLabel}>
                  <span>Quantity <span className={styles.optionalTag}>(Default: 1)</span></span>
                </label>
                <input
                  id="custom-qty"
                  type="number"
                  min={1}
                  max={50}
                  value={form.quantity}
                  onChange={(e) => handleTextChange('quantity', parseInt(e.target.value, 10) || 1)}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formGridTwo}>
              <div className={styles.formRow} style={{ marginBottom: 0 }}>
                <label htmlFor="custom-size" className={styles.fieldLabel}>
                  <span>Approximate Size <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="custom-size"
                  type="text"
                  placeholder="e.g. approx 3–4 cm, or 'pocket-sized'"
                  value={form.approximateSize}
                  onChange={(e) => handleTextChange('approximateSize', e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formRow} style={{ marginBottom: 0 }}>
                <label htmlFor="custom-extra" className={styles.fieldLabel}>
                  <span>Additional Instructions <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="custom-extra"
                  type="text"
                  placeholder="e.g. Need by birthday date, special gift packaging"
                  value={form.additionalInstructions}
                  onChange={(e) => handleTextChange('additionalInstructions', e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 6: REVIEW REQUEST & SUBMISSION                       */}
          {/* ============================================================ */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.stepNumber}>6</span>
              <h2 className={styles.sectionTitle}>Review Request</h2>
            </div>

            <div className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <h3 className={styles.reviewTitle}>Custom Request Summary</h3>
                <span className={styles.reviewBadge}>Ready For Review</span>
              </div>

              <div className={styles.reviewRowList}>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Recipient:</span>
                  <span className={styles.reviewValue}>{form.fullName || '—'}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Category:</span>
                  <span className={styles.reviewValue}>
                    {form.category === 'Other' && form.customCategoryDetails
                      ? `Other (${form.customCategoryDetails})`
                      : form.category}
                  </span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Description:</span>
                  <span className={styles.reviewValue}>
                    {form.description ? `${form.description.slice(0, 100)}${form.description.length > 100 ? '...' : ''}` : '—'}
                  </span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Quantity:</span>
                  <span className={styles.reviewValue}>{form.quantity} piece{form.quantity > 1 ? 's' : ''}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>References:</span>
                  <span className={styles.reviewValue}>
                    {form.referenceImages.length} image{form.referenceImages.length !== 1 ? 's' : ''} attached
                  </span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Price:</span>
                  <span className={styles.reviewValue} style={{ color: 'var(--color-warm-brown)', fontWeight: 700 }}>
                    QUOTE AFTER REVIEW
                  </span>
                </div>
              </div>

              <div className={styles.quoteNoteBox}>
                <Clock size={20} color="var(--color-warm-brown)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className={styles.quotePriceHighlight}>PRICE: QUOTE AFTER REVIEW</div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                    Custom pieces typically take around <strong>25 days</strong> to sculpt and cure. Shipping transit (~4 days across India) is additional. No payment is collected until you review and approve our quote.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.submitWrapper}>
              <Magnetic strength={0.25} maxOffset={10}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitBtn}
                  data-cursor="button"
                >
                  {submitting ? (
                    'Submitting Request...'
                  ) : (
                    <>
                      <span>SEND CUSTOM REQUEST</span>
                      <ArrowRight size={18} className="magnetic-arrow" />
                    </>
                  )}
                </button>
              </Magnetic>
              <div className={styles.submitFootnote}>
                Claypresso will review your request and reply to your email / WhatsApp within 24–48 hours.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
