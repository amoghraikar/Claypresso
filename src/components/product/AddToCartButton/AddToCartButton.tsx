'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button/Button';

export interface AddToCartButtonProps {
  product: Product;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const { addToCart, isWishlisted, toggleWishlist } = useCart();
  const [added, setAdded] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    addToCart(product, 1, undefined, rect, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 450);
  };

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleAdd}
        icon={added ? <Check size={18} /> : <ShoppingBag size={18} />}
        style={{
          transition: 'transform 180ms var(--ease-clay-squish), background-color 200ms ease',
        }}
      >
        {added ? 'Added to Bag! ✦' : 'Add to Cart'}
      </Button>

      <button
        type="button"
        onClick={handleWishlist}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          background: 'var(--color-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: wishlisted ? '#E05A47' : 'var(--color-espresso)',
          transition: 'transform 200ms var(--ease-clay-squish), border-color 200ms ease',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <Heart
          size={20}
          fill={wishlisted ? '#E05A47' : 'none'}
          color={wishlisted ? '#E05A47' : 'currentColor'}
          style={{
            display: 'block',
            animation: showHeartAnim ? 'heartSquish 500ms var(--ease-clay-squish) forwards' : 'none',
            transition: 'fill 200ms ease, color 200ms ease',
          }}
        />
        {showHeartAnim && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 10,
            }}
            aria-hidden="true"
          >
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#E05A47',
                animation: 'particleBurst0 460ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#E28768',
                animation: 'particleBurst1 480ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#7A5243',
                animation: 'particleBurst2 440ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#F2B041',
                animation: 'particleBurst3 480ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#F4A896',
                animation: 'particleBurst4 460ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -3,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#D97D54',
                animation: 'particleBurst5 450ms var(--ease-clay-settle) forwards',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
      </button>
    </div>
  );
};

