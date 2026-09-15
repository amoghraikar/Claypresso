'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Clock,
  AlertCircle,
  PackageCheck,
  CreditCard,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BUSINESS_RULES } from '@/types/product';
import { apiClient } from '@/services/apiClient';
import {
  CheckoutFormValues,
  CheckoutFormErrors,
  PaymentMethod,
} from '@/types/order';
import { orderService } from '@/services/orderService';
import { paymentGatewayService, PAYMENT_METHODS } from '@/services/paymentService';
import { INDIAN_STATES } from '@/utils/indianStates';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    totalItems,
    hasFreeShipping,
    hasMadeToOrderItems,
    freeShippingRemaining,
    clearCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<CheckoutFormValues>({
    fullName: '',
    email: '',
    phone: '',
    shippingFullName: '',
    shippingPhone: '',
    sameAsContact: true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    paymentMethod: 'UPI',
    termsAgreed: false,
  });

  const [errors, setErrors] = useState<CheckoutFormErrors>({});

  // Refs for auto-focusing on first error
  const fieldRefs = {
    fullName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    addressLine1: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    state: useRef<HTMLSelectElement>(null),
    pincode: useRef<HTMLInputElement>(null),
    termsAgreed: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const shippingFee = hasFreeShipping ? 0 : BUSINESS_RULES.standardShippingFee;
  const total = subtotal + shippingFee;
  const gatewayConfig = paymentGatewayService.getGatewayConfig();

  // Handle Field Changes
  const handleInputChange = (
    field: keyof CheckoutFormValues,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: CheckoutFormErrors = {};

    // 1. Full Name
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
    // If entered with country code +91
    const normalizedPhone =
      cleanedPhone.length === 12 && cleanedPhone.startsWith('91')
        ? cleanedPhone.slice(2)
        : cleanedPhone;

    if (!validIndianPhone.test(normalizedPhone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number.';
    }

    // 4. Address Line 1
    if (!form.addressLine1.trim() || form.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Enter your street address or apartment.';
    }

    // 5. City
    if (!form.city.trim() || form.city.trim().length < 2) {
      newErrors.city = 'Enter your city.';
    }

    // 6. State
    if (!form.state.trim()) {
      newErrors.state = 'Select your state.';
    }

    // 7. PIN Code (6-digit Indian PIN)
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!form.pincode.trim() || !pinRegex.test(form.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code.';
    }

    // 8. Payment Method
    if (!form.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
    }

    // 9. Terms consent
    if (!form.termsAgreed) {
      newErrors.termsAgreed = 'Please agree to the terms to proceed.';
    }

    setErrors(newErrors);

    // Auto-focus on first error field
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

  // Place Order Handler
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create real server-side pending order in the database
      const serverRes = await orderService.createOrderOnServer(
        cart,
        form,
        { isSimulation: false, discountCode: undefined }
      );

      if (!serverRes.success || !serverRes.data) {
        setSubmitError(serverRes.error || 'Failed to place order. Please review your cart.');
        setSubmitting(false);
        return;
      }

      const dbOrder = serverRes.data;

      // 2. Create Payment Session via Gateway Provider
      const sessionRes = await apiClient.post<any>('/api/payments/create-session', {
        orderId: dbOrder.id,
      });

      if (!sessionRes.success || !sessionRes.data) {
        setSubmitError(sessionRes.error || 'Failed to initialize payment gateway.');
        setSubmitting(false);
        return;
      }

      const session = sessionRes.data;

      // 3. Complete Payment Flow (Live or Honest Sandbox)
      let verifyPayload: any;

      if (!session.isTestMode && typeof window !== 'undefined' && session.keyId) {
        // Live Razorpay Widget Execution
        if (!(window as any).Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => (script.onload = resolve));
        }

        const razorpayPromise = new Promise((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key: session.keyId,
            amount: session.amount,
            currency: session.currency || 'INR',
            name: 'Claypresso Studio',
            description: `Order #${dbOrder.orderNumber}`,
            order_id: session.gatewayOrderId,
            prefill: {
              name: form.fullName,
              email: form.email,
              contact: form.phone,
            },
            theme: { color: '#8D5A3C' },
            handler: function (response: any) {
              resolve({
                orderId: dbOrder.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                gatewayOrderId: response.razorpay_order_id,
              });
            },
            modal: {
              ondismiss: function () {
                reject(new Error('Payment window was closed before completion.'));
              },
            },
          });
          rzp.open();
        });

        try {
          verifyPayload = await razorpayPromise;
        } catch (paymentErr: any) {
          setSubmitError(paymentErr.message || 'Payment cancelled.');
          setSubmitting(false);
          return;
        }
      } else {
        // Sandbox / Test Mode (Credentials pending in environment)
        verifyPayload = {
          orderId: dbOrder.id,
          paymentId: `pay_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          signature: 'mock_verified_signature',
          gatewayOrderId: session.gatewayOrderId,
        };
      }

      // 4. Server-side payment verification & stock deduction
      const verifyRes = await apiClient.post<any>('/api/payments/verify', verifyPayload);

      if (!verifyRes.success) {
        setSubmitError(verifyRes.error || 'Payment verification failed on the server.');
        setSubmitting(false);
        return;
      }

      // 5. Construct client OrderPayload snapshot from server response for immediate confirmation presentation
      const confirmedOrder = verifyRes.data?.order || dbOrder;
      const serverSnapshot = orderService.buildOrderPayload(
        cart,
        form,
        confirmedOrder.subtotal,
        confirmedOrder.shippingFee,
        {
          isSimulation: session.isTestMode,
          paymentStatus: confirmedOrder.paymentStatus?.toLowerCase() || 'paid',
        }
      );
      serverSnapshot.id = confirmedOrder.id;
      serverSnapshot.orderNumber = confirmedOrder.orderNumber;
      serverSnapshot.total = confirmedOrder.total;
      serverSnapshot.subtotal = confirmedOrder.subtotal;
      serverSnapshot.shippingFee = confirmedOrder.shippingFee;
      serverSnapshot.paymentStatus = 'paid';
      serverSnapshot.orderStatus = 'processing';

      orderService.saveOrder(serverSnapshot);

      // 6. Clear cart & redirect
      clearCart();
      router.push(`/order-confirmation/${confirmedOrder.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating your order. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <p>Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  // Handle empty cart entering checkout
  if (cart.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrapper}>
              <PackageCheck size={32} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: 12 }}>
              Your Bag is Empty
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '15px' }}>
              Looks like you haven&apos;t added any handmade clay pieces to your bag yet.
            </p>
            <Link
              href="/shop"
              className={styles.submitBtn}
              style={{ display: 'inline-flex', maxWidth: '240px', margin: '0 auto', textDecoration: 'none' }}
            >
              Explore Shop →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Identify made to order products in cart
  const madeToOrderItems = cart.filter(
    (item) => item.product.productionType === 'MADE_TO_ORDER'
  );

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className={styles.checkoutHeaderNav}>
          <Link href="/cart" className={styles.backLink} aria-label="Return to cart">
            <ArrowLeft size={16} /> Return to Cart
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            <Lock size={14} color="var(--color-warm-brown)" />
            <span>Encrypted 256-bit Checkout</span>
          </div>
        </div>

        {submitError && (
          <div
            style={{
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '14px',
            }}
            role="alert"
          >
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <div className={styles.checkoutLayout}>
          {/* ============================================================ */}
          {/* LEFT COLUMN: Customer Information, Address, Delivery, Payment */}
          {/* ============================================================ */}
          <form className={styles.formCol} onSubmit={handleSubmitOrder} noValidate>
            {/* STEP 1: Contact Information */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>1</span>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
              </div>
              <p className={styles.sectionNote}>
                Guest checkout enabled. We use this to send your parcel dispatch tracking.
              </p>

              <div className={styles.formRow}>
                <label htmlFor="contact-fullname" className={styles.fieldLabel}>
                  <span>Full Name<span className={styles.requiredStar}>*</span></span>
                </label>
                <input
                  ref={fieldRefs.fullName}
                  id="contact-fullname"
                  type="text"
                  required
                  placeholder="e.g. Pooja Nair"
                  value={form.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`${styles.inputField} ${errors.fullName ? styles.inputFieldError : ''}`}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                />
                {errors.fullName && (
                  <span id="error-fullName" className={styles.fieldError} role="alert">
                    <AlertCircle size={14} /> {errors.fullName}
                  </span>
                )}
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <label htmlFor="contact-email" className={styles.fieldLabel}>
                    <span>Email Address<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={fieldRefs.email}
                    id="contact-email"
                    type="email"
                    required
                    placeholder="pooja@example.com"
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

                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <label htmlFor="contact-phone" className={styles.fieldLabel}>
                    <span>Mobile (for SMS & WhatsApp)<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={fieldRefs.phone}
                    id="contact-phone"
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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

            {/* STEP 2: Shipping Address (India Only) */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>2</span>
                <h2 className={styles.sectionTitle}>Shipping Address</h2>
              </div>
              <p className={styles.sectionNote}>
                Claypresso ships all handmade parcels securely across India.
              </p>

              <div className={styles.formRow}>
                <label htmlFor="shipping-address1" className={styles.fieldLabel}>
                  <span>Street Address / Flat No.<span className={styles.requiredStar}>*</span></span>
                </label>
                <input
                  ref={fieldRefs.addressLine1}
                  id="shipping-address1"
                  type="text"
                  required
                  placeholder="Flat 302, Palm Grove Apts, 12th Main Road"
                  value={form.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className={`${styles.inputField} ${errors.addressLine1 ? styles.inputFieldError : ''}`}
                  aria-invalid={Boolean(errors.addressLine1)}
                  aria-describedby={errors.addressLine1 ? 'error-addressLine1' : undefined}
                />
                {errors.addressLine1 && (
                  <span id="error-addressLine1" className={styles.fieldError} role="alert">
                    <AlertCircle size={14} /> {errors.addressLine1}
                  </span>
                )}
              </div>

              <div className={styles.formRow}>
                <label htmlFor="shipping-address2" className={styles.fieldLabel}>
                  <span>Apartment, Suite, Landmark <span className={styles.optionalTag}>(Optional)</span></span>
                </label>
                <input
                  id="shipping-address2"
                  type="text"
                  placeholder="Near Indiranagar Metro Station"
                  value={form.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGridTwo}>
                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <label htmlFor="shipping-city" className={styles.fieldLabel}>
                    <span>City<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={fieldRefs.city}
                    id="shipping-city"
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`${styles.inputField} ${errors.city ? styles.inputFieldError : ''}`}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'error-city' : undefined}
                  />
                  {errors.city && (
                    <span id="error-city" className={styles.fieldError} role="alert">
                      <AlertCircle size={14} /> {errors.city}
                    </span>
                  )}
                </div>

                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <label htmlFor="shipping-state" className={styles.fieldLabel}>
                    <span>State<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      ref={fieldRefs.state}
                      id="shipping-state"
                      value={form.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`${styles.inputField} ${errors.state ? styles.inputFieldError : ''}`}
                      style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: 'var(--color-warm-brown)',
                      }}
                    />
                  </div>
                  {errors.state && (
                    <span id="error-state" className={styles.fieldError} role="alert">
                      <AlertCircle size={14} /> {errors.state}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGridTwo} style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <label htmlFor="shipping-pincode" className={styles.fieldLabel}>
                    <span>PIN Code (6 digits)<span className={styles.requiredStar}>*</span></span>
                  </label>
                  <input
                    ref={fieldRefs.pincode}
                    id="shipping-pincode"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="560038"
                    value={form.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className={`${styles.inputField} ${errors.pincode ? styles.inputFieldError : ''}`}
                    aria-invalid={Boolean(errors.pincode)}
                    aria-describedby={errors.pincode ? 'error-pincode' : undefined}
                  />
                  {errors.pincode && (
                    <span id="error-pincode" className={styles.fieldError} role="alert">
                      <AlertCircle size={14} /> {errors.pincode}
                    </span>
                  )}
                </div>

                <div className={styles.formRow} style={{ marginBottom: 0 }}>
                  <span className={styles.fieldLabel}>Country</span>
                  <div className={styles.readonlyCountry}>India (Domestic Delivery)</div>
                </div>
              </div>
            </div>

            {/* STEP 3: Delivery Timeline & Expectations */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>3</span>
                <h2 className={styles.sectionTitle}>Delivery Information</h2>
              </div>

              <div className={styles.deliveryInfoBox}>
                {/* Ready Made items note */}
                <div className={styles.deliveryRow}>
                  <Truck size={20} className={styles.deliveryIcon} />
                  <div>
                    <span className={`${styles.deliveryBadge} ${styles.badgeReady}`}>
                      Shipping Transit
                    </span>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      Typical shipping transit: ~{BUSINESS_RULES.transitDaysReadyMade} days across India once dispatched.
                    </p>
                  </div>
                </div>

                {/* Made to order notice if applicable */}
                {hasMadeToOrderItems ? (
                  <div className={styles.deliveryRow} style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
                    <Clock size={20} className={styles.deliveryIcon} style={{ color: '#8c3b3b' }} />
                    <div>
                      <span className={`${styles.deliveryBadge} ${styles.badgeMadeToOrder}`}>
                        Production Time Notice
                      </span>
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        <strong>Production time applies before shipping.</strong> You have made-to-order items in your cart:
                      </p>
                      <ul style={{ margin: '4px 0 0 18px', padding: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {madeToOrderItems.map((item) => (
                          <li key={item.product.id}>
                            <strong>{item.product.name}</strong>: {item.product.productionTime || '3–5 days handmade'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className={styles.deliveryRow} style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
                    <Sparkles size={18} className={styles.deliveryIcon} />
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      All items in your bag are in-stock and ready to carefully package from our Bangalore studio!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 4: Payment Method Selection */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepNumber}>4</span>
                <h2 className={styles.sectionTitle}>Payment Method</h2>
              </div>
              <p className={styles.sectionNote}>
                Select your preferred digital payment method. No Cash on Delivery.
              </p>

              <div className={styles.paymentList} role="radiogroup" aria-label="Payment Method Selection">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = form.paymentMethod === pm.id;
                  return (
                    <label
                      key={pm.id}
                      className={`${styles.paymentCard} ${isSelected ? styles.paymentCardSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={isSelected}
                        onChange={() => handleInputChange('paymentMethod', pm.id as PaymentMethod)}
                        className={styles.paymentRadio}
                      />
                      <div className={styles.paymentDetails}>
                        <div className={styles.paymentHeader}>
                          <span className={styles.paymentName}>
                            {pm.id === 'UPI' ? <Smartphone size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> : <CreditCard size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />}
                            {pm.name}
                          </span>
                          <span className={styles.paymentBadge}>{pm.badge}</span>
                        </div>
                        <div className={styles.paymentHeadline}>{pm.headline}</div>
                        <p className={styles.paymentDesc}>{pm.description}</p>
                        <div className={styles.paymentLogos}>
                          {pm.supportedLogos.map((logo) => (
                            <span key={logo} className={styles.paymentLogoPill}>
                              {logo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Gateway Integration Notice */}
              <div className={styles.gatewayBoundaryNotice}>
                <ShieldCheck size={20} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Payment Integration Boundary</strong>
                  {gatewayConfig.isConfigured ? (
                    <span>Live payment gateway is configured and active.</span>
                  ) : (
                    <span>
                      The checkout architecture is decoupled and ready for official Razorpay / Stripe gateway keys. Sensitive credentials (CVV, PINs) are never stored. Test mode allows inspecting complete review &amp; confirmation contracts.
                    </span>
                  )}
                </div>
              </div>

              {/* Required Terms / Consent Checkbox */}
              <div className={styles.termsRow}>
                <input
                  ref={fieldRefs.termsAgreed}
                  id="terms-checkbox"
                  type="checkbox"
                  checked={form.termsAgreed}
                  onChange={(e) => handleInputChange('termsAgreed', e.target.checked)}
                  className={styles.checkboxInput}
                  aria-invalid={Boolean(errors.termsAgreed)}
                />
                <label htmlFor="terms-checkbox" className={styles.termsLabel}>
                  I agree to the{' '}
                  <Link href="/shipping" target="_blank">
                    Shipping &amp; Returns Policy
                  </Link>{' '}
                  and understand the production and delivery details of my handmade order.
                </label>
              </div>
              {errors.termsAgreed && (
                <div className={styles.fieldError} style={{ marginTop: '-8px', marginBottom: '16px' }} role="alert">
                  <AlertCircle size={14} /> {errors.termsAgreed}
                </div>
              )}

              {/* Primary CTA Button */}
              <div className={styles.ctaWrapper}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitBtn}
                >
                  {submitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <span>PLACE ORDER</span>
                      <span>•</span>
                      <span>{BUSINESS_RULES.currency}{total}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <div className={styles.trustFootnote}>
                  <Lock size={12} />
                  <span>Your cart items are safely reserved during checkout</span>
                </div>
              </div>
            </div>
          </form>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Order Summary Card                             */}
          {/* ============================================================ */}
          <aside className={styles.summaryCard} aria-label="Order Summary">
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>
                Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h2>
              <Link href="/cart" className={styles.editCartLink}>
                EDIT CART →
              </Link>
            </div>

            {/* List of Cart Items */}
            <div className={styles.itemList}>
              {cart.map((item) => {
                const itemTotal =
                  (item.product.price + (item.selectedVariant?.priceDelta || 0)) * item.quantity;
                return (
                  <div key={`${item.product.id}-${item.selectedVariant?.id || 'base'}`} className={styles.summaryItem}>
                    <div className={styles.itemImageWrapper}>
                      <Image
                        src={item.product.images[0] || '/images/placeholder.png'}
                        alt={item.product.name}
                        width={54}
                        height={54}
                        className={styles.itemImage}
                      />
                      <span className={styles.itemQtyBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName} title={item.product.name}>
                        {item.product.name}
                      </div>
                      {item.selectedVariant && (
                        <div className={styles.itemVariant}>Variant: {item.selectedVariant.name}</div>
                      )}
                      <div className={styles.itemBadge}>
                        {item.product.productionType === 'MADE_TO_ORDER' ? '✦ Made to order' : 'Ready to ship'}
                      </div>
                    </div>
                    <div className={styles.itemPrice}>
                      {BUSINESS_RULES.currency}{itemTotal}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculation Breakdown */}
            <div className={styles.calculationList}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <strong>{BUSINESS_RULES.currency}{subtotal}</strong>
              </div>

              <div className={styles.calcRow}>
                <span>Delivery across India</span>
                {hasFreeShipping ? (
                  <span className={styles.freeShippingTag}>FREE</span>
                ) : (
                  <strong>{BUSINESS_RULES.currency}{shippingFee}</strong>
                )}
              </div>

              {!hasFreeShipping && (
                <div className={styles.shippingNotice}>
                  <Sparkles size={14} color="var(--color-warm-brown)" />
                  <span>
                    Add {BUSINESS_RULES.currency}{freeShippingRemaining} more for FREE shipping!
                  </span>
                </div>
              )}

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Payable</span>
                <span className={styles.totalAmount}>
                  {BUSINESS_RULES.currency}{total}
                </span>
              </div>
            </div>

            {/* Claypresso Studio Trust Elements */}
            <div className={styles.trustList}>
              <div className={styles.trustItem}>
                <Sparkles size={15} className={styles.trustIcon} />
                <span>Handcrafted with love in Bangalore</span>
              </div>
              <div className={styles.trustItem}>
                <PackageCheck size={15} className={styles.trustIcon} />
                <span>Eco-conscious, safe-padded parcel protection</span>
              </div>
              <div className={styles.trustItem}>
                <Truck size={15} className={styles.trustIcon} />
                <span>Dispatch updates sent via SMS &amp; WhatsApp</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
