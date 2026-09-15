'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowLeft, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { authService } from '@/services/authService';
import { OrderPayload } from '@/types/order';
import { BUSINESS_RULES } from '@/types/product';
import styles from '../account.module.css';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderPayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allOrders = orderService.getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  }, []);

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
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountPage}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link href="/account" className={styles.viewOrderLink} style={{ gap: 6 }}>
            <ArrowLeft size={16} /> Return to Account
          </Link>
        </div>

        <div className={styles.panelHeader}>
          <h1 className={styles.panelTitle}>Your Order History ({orders.length})</h1>
          <Link href="/track-order" style={{ fontSize: '13px', color: 'var(--color-warm-brown)', fontWeight: 600 }}>
            Guest Order Lookup ↗
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className={styles.contentPanel} style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
            <Package size={44} color="var(--color-warm-brown)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: 8 }}>
              NO ORDERS YET.
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '15px' }}>
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

                {/* Product Thumbnails */}
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
    </div>
  );
}
