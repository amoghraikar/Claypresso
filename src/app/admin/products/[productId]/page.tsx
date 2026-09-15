'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import ProductForm from '../ProductForm';
import styles from '../../orders/orders.module.css';

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.productId as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      setError(null);
      const res = await apiClient.get<any>(`/api/admin/products/${productId}`);
      if (res.success && res.data) {
        setProduct(res.data);
      } else {
        setError(res.error || 'Failed to load product');
      }
      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorState}>
        <h3>Product Not Found</h3>
        <p>{error || 'Could not find the requested product.'}</p>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
