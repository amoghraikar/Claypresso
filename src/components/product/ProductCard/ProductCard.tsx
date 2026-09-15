'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, ArrowRight } from 'lucide-react';
import { Product, BUSINESS_RULES } from '@/types/product';
import { Badge } from '@/components/ui/Badge/Badge';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

import { TiltCard } from '@/components/common/Motion';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { isWishlisted, toggleWishlist, addToCart } = useCart();
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const requiresSelection = product.customizable || (product.variants && product.variants.length > 0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 450);
  };

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      const rect = e.currentTarget.getBoundingClientRect();
      addToCart(product, 1, undefined, rect, false);
    }
  };

  return (
    <TiltCard maxTilt={3.2} imageFollow={6}>
      <div 
        className={`${styles.card} ${isOutOfStock ? styles.cardOutOfStock : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="washi-tape washi-tape-top-left washi-tape-peach" aria-hidden="true" />
        <div className={styles.imageWrapper}>
          <Link
            href={`/product/${product.slug}`}
            className={styles.imageLink}
            aria-label={product.name}
            data-cursor="product"
            data-cursor-text="VIEW"
          >
            {/* Primary Image */}
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              className={`${styles.productImage} tilt-image-follow`}
              priority={priority}
              quality={75}
            />

            {/* Secondary Hover Image if available - only rendered on hover to prevent unnecessary downloads */}
            {product.secondaryImage && isHovered && (
              <Image
                src={product.secondaryImage}
                alt={`${product.name} detail view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                className={styles.secondaryImage}
                quality={75}
              />
            )}
          </Link>

        {/* Badges */}
        <div className={styles.badges}>
          {isOutOfStock ? (
            <Badge status="OUT_OF_STOCK" />
          ) : (
            <>
              {product.badges.map((badge) => (
                <Badge key={badge} type={badge} stock={product.stock} />
              ))}
              {product.status === 'LOW_STOCK' && !product.badges.includes('low-stock') && (
                <Badge status="LOW_STOCK" stock={product.stock} />
              )}
            </>
          )}
        </div>

        {/* Wishlist Button with Tactile Squish and Centered Clay Particles */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${wishlisted ? styles.active : ''}`}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            size={18}
            className={`${styles.heartIcon} ${showHeartAnim ? styles.heartSquished : ''}`}
            fill={wishlisted ? '#E05A47' : 'none'}
            color={wishlisted ? '#E05A47' : 'currentColor'}
          />
          {showHeartAnim && (
            <div className={styles.particleWrapper} aria-hidden="true">
              <span className={`${styles.particle} ${styles.particle0}`} />
              <span className={`${styles.particle} ${styles.particle1}`} />
              <span className={`${styles.particle} ${styles.particle2}`} />
              <span className={`${styles.particle} ${styles.particle3}`} />
              <span className={`${styles.particle} ${styles.particle4}`} />
              <span className={`${styles.particle} ${styles.particle5}`} />
            </div>
          )}
        </button>

        {/* Desktop Quick Action: Quick Add vs View Product */}
        {!isOutOfStock && (
          <div className={styles.quickAddBar}>
            {requiresSelection ? (
              <Link
                href={`/product/${product.slug}`}
                className={styles.quickAddBtn}
              >
                View Product <ArrowRight size={13} />
              </Link>
            ) : (
              <button
                type="button"
                className={styles.quickAddBtn}
                onClick={handleQuickAdd}
              >
                <Plus size={14} /> Quick Add
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.details}>
        <span className={styles.category}>{product.category}</span>
        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>

        <div className={styles.metaRow}>
          <div className={styles.priceWrapper}>
            <span className={styles.price}>
              {BUSINESS_RULES.currency}{product.price}
            </span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                {BUSINESS_RULES.currency}{product.originalPrice}
              </span>
            )}
          </div>
          <span className={isOutOfStock ? styles.outOfStockNote : styles.productionNote}>
            {isOutOfStock
              ? 'Out of stock'
              : product.status === 'LOW_STOCK'
              ? `Only ${product.stock} left`
              : product.productionType === 'MADE_TO_ORDER'
              ? 'Made to order'
              : 'Ready to ship'}
          </span>
        </div>
      </div>
      </div>
    </TiltCard>
  );
};
