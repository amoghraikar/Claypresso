'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Mail,
  MapPin,
  Instagram,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { BUSINESS_RULES } from '@/types/product';
import styles from './contact.module.css';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (field: keyof ContactFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Enter your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!form.message.trim() || form.message.trim().length < 5) {
      newErrors.message = 'Enter your message (at least 5 characters).';
    }

    setErrors(newErrors);

    if (newErrors.name) nameRef.current?.focus();
    else if (newErrors.email) emailRef.current?.focus();
    else if (newErrors.message) messageRef.current?.focus();

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    // Simulating frontend boundary dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className={styles.contactPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={13} />
              <span>Get in Touch</span>
            </div>

            <h1 className={styles.heroTitle}>SAY HELLO.</h1>

            <p className={styles.heroSubtitle}>
              Questions about an order, a custom idea, or something you spotted? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. CUSTOM COMMISSIONS REDIRECT BANNER */}
        <div className={styles.customRedirectBanner}>
          <div className={styles.customRedirectContent}>
            <span className={styles.customRedirectEyebrow}>Special Commissions</span>
            <div className={styles.customRedirectTitle}>LOOKING FOR SOMETHING CUSTOM? →</div>
            <p className={styles.customRedirectDesc}>
              If you&apos;d like a bespoke clay piece sculpted from photos or sketches, use our dedicated Custom Request form to receive an accurate quote and upload reference images.
            </p>
          </div>
          <Link href="/custom/request" className={styles.customRedirectBtn}>
            <span>START A CUSTOM REQUEST</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 3. CONTACT LAYOUT: CHANNELS & FORM */}
        <div className={styles.contactLayout}>
          {/* Left Column: Direct Studio Channels */}
          <aside className={styles.channelsCol} aria-label="Studio contact methods">
            <a
              href={BUSINESS_RULES.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channelCard}
            >
              <div className={styles.channelIconWrap}>
                <Instagram size={22} />
              </div>
              <div>
                <div className={styles.channelHeading}>Instagram DMs ↗</div>
                <p className={styles.channelSubtext}>
                  @claypresso • Send DMs, drop photos, or chat with us directly.
                </p>
              </div>
            </a>

            <div className={styles.channelCard}>
              <div className={styles.channelIconWrap}>
                <Mail size={22} />
              </div>
              <div>
                <div className={styles.channelHeading}>Email Inquiries</div>
                <p className={styles.channelSubtext}>
                  hello@claypresso.com • Order support and general notes.
                </p>
              </div>
            </div>

            <div className={styles.channelCard}>
              <div className={styles.channelIconWrap}>
                <MapPin size={22} />
              </div>
              <div>
                <div className={styles.channelHeading}>Bangalore Studio</div>
                <p className={styles.channelSubtext}>
                  Handmade in Bangalore, Karnataka, India • Domestic delivery across India.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Column: Contact Message Form */}
          <main className={styles.formCard}>
            {submitted ? (
              <div className={styles.successBox}>
                <div className={styles.successIconCircle}>
                  <CheckCircle2 size={36} />
                </div>
                <h2 className={styles.successHeading}>MESSAGE SENT.</h2>
                <p className={styles.successDesc}>
                  Thanks for reaching out, {form.name.trim() || 'friend'}. Claypresso will get back to your email ({form.email}) within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className={styles.resetBtn}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Send a Note</h2>
                  <p className={styles.formSubtitle}>
                    Drop us a message and we&apos;ll reply to your inbox.
                  </p>
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="contact-name" className={styles.fieldLabel}>
                    <span>Your Name<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={nameRef}
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Ananya Rao"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`${styles.inputField} ${errors.name ? styles.inputFieldError : ''}`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                  />
                  {errors.name && (
                    <span id="error-name" className={styles.fieldError} role="alert">
                      <AlertCircle size={14} /> {errors.name}
                    </span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="contact-email" className={styles.fieldLabel}>
                    <span>Email Address<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={emailRef}
                    id="contact-email"
                    type="email"
                    required
                    placeholder="ananya@example.com"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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

                <div className={styles.formRow}>
                  <label htmlFor="contact-subject" className={styles.fieldLabel}>
                    <span>Subject <span className={styles.optionalTag}>(Optional)</span></span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="e.g. Question regarding keychain order"
                    value={form.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="contact-message" className={styles.fieldLabel}>
                    <span>Message<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <textarea
                    ref={messageRef}
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="How can we help you today?"
                    value={form.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`${styles.textareaField} ${errors.message ? styles.inputFieldError : ''}`}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'error-msg' : undefined}
                  />
                  {errors.message && (
                    <span id="error-msg" className={styles.fieldError} role="alert">
                      <AlertCircle size={14} /> {errors.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitBtn}
                >
                  {submitting ? 'Sending...' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
