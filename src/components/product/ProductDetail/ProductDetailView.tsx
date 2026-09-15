'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductDetails } from './ProductDetails';
import { ReviewsSection } from './ReviewsSection';
import { RelatedProducts } from './RelatedProducts';
import { MobilePurchaseBar } from './MobilePurchaseBar';
import styles from './ProductDetail.module.css';

export interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
}) => {
  const purchaseCtaRef = useRef<HTMLElement | null>(null);

  const handleTriggerAddToCartFromSticky = () => {
    if (purchaseCtaRef.current) {
      const btn = purchaseCtaRef.current.querySelector('button');
      if (btn) {
        btn.click();
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* ==================================================================
            1. BREADCRUMBS
            ================================================================== */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/shop" className={styles.breadcrumbLink}>
            Shop
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link
            href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
            className={styles.breadcrumbLink}
          >
            {product.category}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent} aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* ==================================================================
            2. TWO-COLUMN HERO (GALLERY & INFO)
            ================================================================== */}
        <div className={styles.heroGrid}>
          {/* LEFT: GALLERY */}
          <ProductGallery product={product} />

          {/* RIGHT: INFO & ACTIONS */}
          <ProductInfo
            product={product}
            onAddToCartRef={(el) => {
              purchaseCtaRef.current = el;
            }}
          />
        </div>

        {/* ==================================================================
            3. "THE LITTLE DETAILS" EDITORIAL SECTION
            ================================================================== */}
        <ProductDetails product={product} />

        {/* ==================================================================
            4. REVIEWS SECTION
            ================================================================== */}
        <ReviewsSection product={product} />

        {/* ==================================================================
            5. RELATED PRODUCTS ("YOU MAY ALSO LIKE")
            ================================================================== */}
        <RelatedProducts products={relatedProducts} />
      </div>

      {/* ====================================================================
          6. MOBILE STICKY PURCHASE BAR
          ==================================================================== */}
      <MobilePurchaseBar
        product={product}
        targetRef={purchaseCtaRef}
        onTriggerAddToCart={handleTriggerAddToCartFromSticky}
        price={product.price}
      />
    </div>
  );
};
