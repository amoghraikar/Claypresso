'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Package,
  Layers,
  Users,
  MessageSquare,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { apiClient } from '@/services/apiClient';
import styles from './adminShell.module.css';

interface NavItemConfig {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
  { href: '/admin/custom-orders', label: 'Custom Orders', icon: <Sparkles size={18} /> },
  { href: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { href: '/admin/inventory', label: 'Inventory', icon: <Layers size={18} /> },
  { href: '/admin/customers', label: 'Customers', icon: <Users size={18} /> },
  { href: '/admin/reviews', label: 'Reviews', icon: <MessageSquare size={18} /> },
  { href: '/admin/discounts', label: 'Discounts', icon: <Tag size={18} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick search modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      // 1. Check client session
      const user = authService.getCurrentUser();
      if (!user) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      // 2. Authorize with backend server token
      try {
        const res = await apiClient.get<any>('/api/auth/me');
        if (res.success && res.data && res.data.role === 'ADMIN') {
          setIsAdmin(true);
          setAdminUser(res.data);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [pathname]);

  // Handle global keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick search execution
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const res = await apiClient.get<any>('/api/admin/search', { q: searchQuery });
      setSearchLoading(false);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/account/login');
  };

  if (loading) {
    return (
      <div className={styles.deniedContainer}>
        <div className={styles.deniedCard}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            Verifying admin authorization...
          </p>
        </div>
      </div>
    );
  }

  // Access Restricted / Unauthorized Screen
  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <div className={styles.deniedCard}>
          <ShieldAlert size={48} color="var(--color-warm-brown)" style={{ margin: '0 auto' }} />
          <h1 className={styles.deniedTitle}>ACCESS RESTRICTED</h1>
          <p className={styles.deniedText}>
            Claypresso Studio Operations requires verified administrator authorization. Normal customer accounts cannot view operations data.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/account/login?returnUrl=/admin" className={styles.deniedBtn}>
              LOG IN AS ADMINISTRATOR →
            </Link>
            <Link
              href="/"
              style={{ fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none' }}
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Current page title mapping
  const activeNav = NAV_ITEMS.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );
  const pageTitle = activeNav?.label || 'Operations';

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brandLink}>
            <span className={styles.brandLogo}>Claypresso</span>
            <span className={styles.adminBadge}>Studio Ops</span>
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navSection} aria-label="Admin Navigation">
          <div className={styles.navGroupTitle}>Operations</div>
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank" className={styles.storeLink}>
            <span>View Public Store</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className={styles.mainContainer}>
        {/* TOP BAR */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <h1 className={styles.pageHeading}>{pageTitle}</h1>
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={styles.quickSearchBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Quick search (Cmd+K)"
            >
              <Search size={14} />
              <span>Search orders, products, requests...</span>
              <span className={styles.searchKbd}>⌘K</span>
            </button>

            <div className={styles.userProfileMenu}>
              <div className={styles.avatarCircle} title={adminUser?.name || 'Admin'}>
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.adminNameText}>{adminUser?.name || 'Studio Admin'}</span>
                <span className={styles.adminRoleText}>Administrator</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Sign out of operations"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className={styles.pageBody}>{children}</main>
      </div>

      {/* QUICK SEARCH MODAL */}
      {searchOpen && (
        <div className={styles.modalBackdrop} onClick={() => setSearchOpen(false)}>
          <div
            className={styles.searchDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Admin Quick Search"
          >
            <div className={styles.searchInputWrapper}>
              <Search size={18} color="var(--color-warm-brown)" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search orders (#CLP), products, custom inquiries, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.searchResultsList}>
              {searchLoading && (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Searching operations database...
                </div>
              )}

              {!searchLoading && searchResults && (
                <div>
                  {/* Orders */}
                  {searchResults.orders?.length > 0 && (
                    <div>
                      <div className={styles.searchGroupHeading}>Orders</div>
                      {searchResults.orders.map((o: any) => (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          className={styles.searchResultRow}
                          onClick={() => setSearchOpen(false)}
                        >
                          <div>
                            <strong>#{o.orderNumber}</strong> — {o.customerName}
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--color-warm-brown)', fontWeight: 600 }}>
                            ₹{o.total} • {o.orderStatus}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {searchResults.products?.length > 0 && (
                    <div>
                      <div className={styles.searchGroupHeading}>Products</div>
                      {searchResults.products.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/admin/products/${p.id}`}
                          className={styles.searchResultRow}
                          onClick={() => setSearchOpen(false)}
                        >
                          <div>{p.name}</div>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            Stock: {p.stock} • ₹{p.price}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Custom Requests */}
                  {searchResults.customOrders?.length > 0 && (
                    <div>
                      <div className={styles.searchGroupHeading}>Custom Commissions</div>
                      {searchResults.customOrders.map((c: any) => (
                        <Link
                          key={c.id}
                          href={`/admin/custom-orders/${c.id}`}
                          className={styles.searchResultRow}
                          onClick={() => setSearchOpen(false)}
                        >
                          <div>
                            <strong>{c.referenceNumber}</strong> — {c.name} ({c.category})
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--color-warm-brown)' }}>
                            {c.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Customers */}
                  {searchResults.customers?.length > 0 && (
                    <div>
                      <div className={styles.searchGroupHeading}>Customers</div>
                      {searchResults.customers.map((u: any) => (
                        <Link
                          key={u.id}
                          href={`/admin/customers/${u.id}`}
                          className={styles.searchResultRow}
                          onClick={() => setSearchOpen(false)}
                        >
                          <div>{u.name}</div>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {u.email}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.orders?.length === 0 &&
                    searchResults.products?.length === 0 &&
                    searchResults.customOrders?.length === 0 &&
                    searchResults.customers?.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        No matching records found.
                      </div>
                    )}
                </div>
              )}

              {!searchLoading && !searchResults && (
                <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Type at least 2 characters to search orders, products, custom requests, and customers.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
