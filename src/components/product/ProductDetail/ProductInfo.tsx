'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check, ArrowRight, Star } from 'lucide-react';
import { Product, ProductVariant, BUSINESS_RULES } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { ShippingInfo } from './ShippingInfo';
import styles from './ProductDetail.module.css';

export interface ProductInfoProps {
  product: Product;
  onAddToCartRef?: (el: HTMLElement | null) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onAddToCartRef }) => {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();

  // State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [showHeartAnim, setShowHeartAnim] = useState<boolean>(false);

  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isCustom = product.productionType === 'CUSTOM';

  // Dynamic price calculating variant delta if applicable
  const currentPrice = product.price + (selectedVariant?.priceDelta || 0);

  // Availability label and class
  let statusText = 'In Stock';
  let statusClass = styles.statusInStock;

  if (isOutOfStock) {
    statusText = 'Out of Stock';
    statusClass = styles.statusOutOfStock;
  } else if (product.status === 'LOW_STOCK') {
    statusText = product.stock ? `Only ${product.stock} left in studio` : 'Low Stock';
    statusClass = styles.statusLowStock;
  } else if (product.productionType === 'MADE_TO_ORDER') {
    statusText = 'Made to Order';
    statusClass = styles.statusMadeToOrder;
  }

  // Handle Wishlist Toggle
  const handleWishlistClick = () => {
    toggleWishlist(product.id);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 450);
  };

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validate variant selection if product has variants
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setVariantError('Please select a finish/option first');
      return;
    }
    setVariantError(null);

    if (!isOutOfStock && !isCustom) {
      const rect = e.currentTarget.getBoundingClientRect();
      addToCart(product, quantity, selectedVariant || undefined, rect, true);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2400);
    }
  };

  return (
    <div className={styles.infoColumn}>
      {/* 1. Category & Collection Meta */}
      <div className={styles.metaHeader}>
        <div className={styles.categoryCollectionRow}>
          <Link href={`/shop/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className={styles.categoryTag}>
            {product.category}
          </Link>
          {product.collection && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{product.collection}</span>
            </>
          )}
        </div>

        {/* 2. Product Name in Fraunces */}
        <h1 className={styles.productTitle}>{product.name}</h1>

        {/* 3. Rating & Review Summary (only if real reviews exist) */}
        {product.rating && product.rating > 0 ? (
          <div className={styles.ratingRow}>
            <div className={styles.stars} aria-label={`Rated ${product.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= Math.round(product.rating || 0) ? '#F2B041' : 'none'}
                  color={s <= Math.round(product.rating || 0) ? '#F2B041' : 'var(--color-border)'}
                />
              ))}
            </div>
            <span>
              {product.rating.toFixed(1)} (
              <a href="#reviews" className={styles.reviewCountLink}>
                {product.reviewCount || 1} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </a>
              )
            </span>
          </div>
        ) : (
          <div className={styles.ratingRow}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Handcrafted studio batch • <a href="#reviews" className={styles.reviewCountLink}>Leave first review</a>
            </span>
          </div>
        )}

        {/* 4. Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>
            {BUSINESS_RULES.currency}{currentPrice}
          </span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              {BUSINESS_RULES.currency}{product.originalPrice}
            </span>
          )}
          <span className={styles.priceTaxNote}>(Includes all taxes)</span>
        </div>
      </div>

      {/* 5. Stock Status Banner */}
      <div className={styles.stockStatusRow}>
        <span className={`${styles.statusIndicator} ${statusClass}`}>
          <span className={styles.statusDot} />
          {statusText}
        </span>
      </div>

      {/* 6. Short Product Description */}
      <p className={styles.shortDesc}>{product.description}</p>

      {/* 7. Variant Selection when available */}
      {product.variants && product.variants.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelectVariant={(v) => {
            setSelectedVariant(v);
            setVariantError(null);
          }}
          error={variantError}
        />
      )}

      {/* 8. Purchase Actions */}
      <div className={styles.purchaseSection}>
        <div className={styles.actionRow} ref={onAddToCartRef as any}>
          {isCustom ? (
            /* Custom piece CTA routes to /custom */
            <Link href="/custom" className={styles.customRequestBtn}>
              <span>Start a Custom Request</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              {/* Quantity Selector */}
              {!isOutOfStock && (
                <QuantitySelector
                  quantity={quantity}
                  maxStock={product.stock}
                  onChange={setQuantity}
                  disabled={isOutOfStock}
                />
              )}

              {/* Add to Cart Button */}
              <button
                type="button"
                className={styles.addToCartBtn}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                aria-label={isOutOfStock ? 'Product out of stock' : `Add ${product.name} to cart`}
              >
                {addedAnimation ? (
                  <>
                    <Check size={18} /> Added to Bag! ✦
                  </>
                ) : isOutOfStock ? (
                  'OUT OF STOCK'
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>
            </>
          )}

          {/* Wishlist Button with Tactile Squish and Particles */}
          <button
            type="button"
            className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ''}`}
            onClick={handleWishlistClick}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          >
            <Heart
              size={20}
              fill={wishlisted ? '#E05A47' : 'none'}
              color={wishlisted ? '#E05A47' : 'currentColor'}
              style={{
                animation: showHeartAnim ? 'heartSquish 500ms var(--ease-clay-squish) forwards' : 'none',
                transition: 'fill 200ms ease, color 200ms ease',
              }}
            />
          </button>
        </div>
      </div>

      {/* 9. Shipping & Free Shipping Progress */}
      <ShippingInfo product={product} />
    </div>
  );
};
