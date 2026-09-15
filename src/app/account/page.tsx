'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  Heart,
  Settings,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  Trash2,
  Plus,
  LayoutDashboard,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { User } from '@/types/auth';
import { OrderPayload } from '@/types/order';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';
import { BUSINESS_RULES } from '@/types/product';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { wishlist, removeFromCart, addToCart, toggleWishlist } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [orders, setOrders] = useState<OrderPayload[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      setProfileForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
      // Load user's orders (all orders placed in session/storage)
      const allOrders = orderService.getAllOrders();
      setOrders(allOrders);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await authService.updateProfile(profileForm);
    if (updated) {
      setUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2400);
    }
  };

  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return styles.statusShipped;
      case 'completed':
      case 'delivered':
        return styles.statusDelivered;
      case 'in_production':
      case 'in production':
        return styles.statusProduction;
      case 'processing':
        return styles.statusProcessing;
      default:
        return styles.statusPlaced;
    }
  };

  if (loading) {
    return (
      <div className={styles.accountPage}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  // GUEST LANDING VIEW (If not logged in)
  if (!user) {
    return (
      <div className={styles.accountPage}>
        <div className="container">
          <div className={styles.guestContainer}>
            <div className={styles.guestCard}>
              <div className={styles.guestIconWrap}>
                <UserIcon size={32} />
              </div>
              <h1 className={styles.guestTitle}>YOUR CLAYPRESSO ACCOUNT</h1>
              <p className={styles.guestSubtitle}>
                Create an account to keep your orders together and make future shopping easier. Guest checkout is always available without an account.
              </p>

              <div className={styles.guestButtonGroup}>
                <Link href="/account/login" className={styles.primaryAuthBtn}>
                  LOG IN →
                </Link>
                <Link href="/account/register" className={styles.secondaryAuthBtn}>
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>

            {/* Guest Order Tracking Callout */}
            <div className={styles.guestTrackBanner}>
              <div className={styles.trackBannerContent}>
                <div className={styles.trackBannerHeading}>Track an existing order</div>
                <p className={styles.trackBannerText}>
                  Already have an order number? Track your parcel directly without logging in.
                </p>
              </div>
              <Link href="/track-order" className={styles.primaryAuthBtn} style={{ padding: '12px 22px', fontSize: '14px' }}>
                <span>TRACK AN ORDER</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED CUSTOMER DASHBOARD
  return (
    <div className={styles.accountPage}>
      <div className="container">
        <div className={styles.accountLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebarCard}>
            <div className={styles.userGreeting}>
              <div className={styles.avatarCircle}>
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.greetingText}>
                <h2>HEY, {user.firstName.toUpperCase()}.</h2>
                <p>{user.email}</p>
              </div>
            </div>

            {/* Admin Fast-Track Panel */}
            {user.role === 'ADMIN' && (
              <div
                style={{
                  backgroundColor: 'var(--color-cream-soft)',
                  border: '1.5px dashed var(--color-warm-brown)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-warm-brown)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ✦ Studio Operations
                </div>
                <Link
                  href="/admin/products/new"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'var(--color-espresso)',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-clay-button)',
                  }}
                >
                  <Plus size={14} />
                  <span>+ Add New Piece</span>
                </Link>
                <Link
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-espresso)',
                    border: '1px solid var(--color-border)',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <LayoutDashboard size={14} />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            )}

            <nav className={styles.navMenu} aria-label="Account Navigation">
              <button
                type="button"
                className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} />
                <span>Orders</span>
                {orders.length > 0 && <span className={styles.navBadge}>{orders.length}</span>}
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeTab === 'wishlist' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={18} />
                <span>Wishlist</span>
                {wishlistedProducts.length > 0 && (
                  <span className={styles.navBadge}>{wishlistedProducts.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <Settings size={18} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${styles.logoutBtn}`}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className={styles.contentPanel}>
            {/* Top Admin Banner */}
            {user.role === 'ADMIN' && (
              <div
                style={{
                  backgroundColor: '#FFFBE6',
                  border: '1.5px solid #FFE58F',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#D46B08' }}>
                    👑 Studio Administrator Active
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                    Add new pieces, update pricing & stock, and fulfill orders.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href="/admin/products/new"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'var(--color-espresso)',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: 'var(--shadow-clay-button)',
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Add New Piece</span>
                  </Link>

                  <Link
                    href="/admin"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-espresso)',
                      border: '1px solid var(--color-border)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={15} />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div className={styles.panelHeader}>
                  <h1 className={styles.panelTitle}>Recent Orders</h1>
                  <Link href="/track-order" style={{ fontSize: '13px', color: 'var(--color-warm-brown)', fontWeight: 600 }}>
                    Track Guest Order ↗
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--color-cream)',
                        color: 'var(--color-warm-brown)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <Package size={28} />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: 6 }}>
                      NO ORDERS YET.
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: '14px' }}>
                      Something cute might be a good place to start.
                    </p>
                    <Link href="/shop" className={styles.primaryAuthBtn}>
                      SHOP CLAYPRESSO →
                    </Link>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {orders.map((order) => (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderCardHeader}>
                          <div>
                            <span className={styles.orderRef}>#{order.orderNumber}</span>
                            <div className={styles.orderDate}>
                              Placed on{' '}
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          <span className={`${styles.statusBadge} ${getStatusClass(order.orderStatus)}`}>
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Product Thumbnails Preview */}
                        <div className={styles.orderItemsRow}>
                          {order.items.map((item) => (
                            <div key={item.id} className={styles.thumbWrapper} title={`${item.name} × ${item.quantity}`}>
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={54}
                                height={54}
                                className={styles.orderThumb}
                              />
                            </div>
                          ))}
                        </div>

                        <div className={styles.orderCardFooter}>
                          <div className={styles.orderTotal}>
                            Total: {BUSINESS_RULES.currency}{order.total} ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                          </div>
                          <Link href={`/account/orders/${order.id}`} className={styles.viewOrderLink}>
                            <span>VIEW ORDER &amp; TRACKING</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div>
                <div className={styles.panelHeader}>
                  <h1 className={styles.panelTitle}>
                    Your Wishlist ({wishlistedProducts.length})
                  </h1>
                </div>

                {wishlistedProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
                    <Heart size={44} color="var(--color-peach)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: 6 }}>
                      Your wishlist is empty
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: '14px' }}>
                      Click the heart icon on any charm or accessory to save it here for later.
                    </p>
                    <Link href="/shop" className={styles.primaryAuthBtn}>
                      EXPLORE FAVOURITES →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                    {wishlistedProducts.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          border: '1.5px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'var(--color-white)',
                          position: 'relative',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.id)}
                          aria-label={`Remove ${p.name} from wishlist`}
                          style={{
                            position: 'absolute',
                            top: 18,
                            right: 18,
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '999px',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 2,
                          }}
                        >
                          <Trash2 size={13} color="var(--color-error)" />
                        </button>

                        <div style={{ width: '100%', height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', marginBottom: 10 }}>
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-espresso)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </h3>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-warm-brown)', marginBottom: 10 }}>
                          {BUSINESS_RULES.currency}{p.price}
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          style={{
                            width: '100%',
                            height: 36,
                            background: 'var(--color-espresso)',
                            color: 'var(--color-ivory)',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ADD TO BAG
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <div className={styles.panelHeader}>
                  <h1 className={styles.panelTitle}>Profile Information</h1>
                </div>

                {profileSaved && (
                  <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '14px' }}>
                    Profile details updated successfully!
                  </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: '460px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className={styles.inputField}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className={styles.inputField}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--color-espresso)' }}>
                      Mobile Number (SMS &amp; WhatsApp Tracking)
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.primaryAuthBtn}
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  >
                    SAVE CHANGES
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
