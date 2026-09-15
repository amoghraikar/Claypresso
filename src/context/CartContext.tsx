'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Product, CartItem, ProductVariant, BUSINESS_RULES } from '@/types/product';
import { Check } from 'lucide-react';

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant,
    sourceRect?: DOMRect | null,
    openDrawer?: boolean
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingRemaining: number;
  hasFreeShipping: boolean;
  hasMadeToOrderItems: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartBumped: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [cartBumped, setCartBumped] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage safely on client
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem('claypresso_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWishlist = localStorage.getItem('claypresso_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // LocalStorage not accessible
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('claypresso_cart', JSON.stringify(cart));
    } catch {}
  }, [cart, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('claypresso_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, mounted]);

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariant,
    sourceRect?: DOMRect | null,
    openDrawer: boolean = false
  ) => {
    // If source rect is available, run the signature flying thumbnail animation
    if (sourceRect && typeof window !== 'undefined') {
      const cartBtn = document.getElementById('header-cart-btn');
      const targetRect = cartBtn?.getBoundingClientRect();

      const startX = sourceRect.left + sourceRect.width / 2 - 22;
      const startY = sourceRect.top + sourceRect.height / 2 - 22;
      const endX = targetRect ? targetRect.left + targetRect.width / 2 - 22 : window.innerWidth - 60;
      const endY = targetRect ? targetRect.top + targetRect.height / 2 - 22 : 24;

      const flyId = `${product.id}-${Date.now()}`;
      const newFlyingItem: FlyingItem = {
        id: flyId,
        image: product.images[0],
        startX,
        startY,
        endX,
        endY,
      };

      setFlyingItems((prev) => [...prev, newFlyingItem]);

      // Trigger cart receive bump when flight arrives
      setTimeout(() => {
        setCartBumped(true);
        setTimeout(() => setCartBumped(false), 500);
        triggerToast(`Added ${product.name} to bag! ✦`);
      }, 550);

      // Clean up flying item
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== flyId));
      }, 700);
    } else {
      setCartBumped(true);
      setTimeout(() => setCartBumped(false), 500);
      triggerToast(`Added ${product.name} to bag! ✦`);
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant?.id === variant?.id
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });

    if (openDrawer) {
      setTimeout(() => setIsCartOpen(true), 600);
    }
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (variantId && item.selectedVariant?.id !== variantId) return true;
        return false;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const matchesProduct = item.product.id === productId;
        const matchesVariant = !variantId || item.selectedVariant?.id === variantId;
        if (matchesProduct && matchesVariant) {
          const maxStock = item.product.stock;
          const clampedQty = maxStock ? Math.min(quantity, maxStock) : quantity;
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const itemPrice = item.product.price + (item.selectedVariant?.priceDelta || 0);
        return sum + itemPrice * item.quantity;
      }, 0),
    [cart]
  );

  const freeShippingRemaining = Math.max(0, BUSINESS_RULES.freeShippingThreshold - subtotal);
  const hasFreeShipping = subtotal >= BUSINESS_RULES.freeShippingThreshold;

  const hasMadeToOrderItems = useMemo(
    () => cart.some((item) => item.product.productionType === 'MADE_TO_ORDER'),
    [cart]
  );

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        subtotal,
        freeShippingRemaining,
        hasFreeShipping,
        hasMadeToOrderItems,
        wishlist,
        toggleWishlist,
        isWishlisted,
        cartBumped,
      }}
    >
      {children}

      {/* Signature Product-to-Cart Flying Clay Orbs */}
      {flyingItems.map((item) => (
        <FlyingOrb key={item.id} item={item} />
      ))}

      {/* Subtle Tactile Confirmation Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--color-espresso)',
            color: 'var(--color-ivory)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 999999,
            animation: 'clayDrop 320ms var(--ease-clay-squish) forwards',
            border: '1px solid var(--color-warm-brown)',
            maxWidth: '340px',
          }}
          role="status"
          aria-live="polite"
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-peach)',
              color: 'var(--color-espresso)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={12} strokeWidth={3} />
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {toastMessage}
          </span>
        </div>
      )}
    </CartContext.Provider>
  );
}

// Flying Thumbnail component that animates from click location to cart button
function FlyingOrb({ item }: { item: FlyingItem }) {
  const [style, setStyle] = useState<React.CSSProperties>({
    left: `${item.startX}px`,
    top: `${item.startY}px`,
    transform: 'scale(1) rotate(0deg)',
    opacity: 1,
  });

  useEffect(() => {
    // Trigger animation in next tick
    const anim = requestAnimationFrame(() => {
      setStyle({
        left: `${item.endX}px`,
        top: `${item.endY}px`,
        transform: 'scale(0.35) rotate(25deg)',
        opacity: 0.85,
      });
    });
    return () => cancelAnimationFrame(anim);
  }, [item]);

  return (
    <div className="flying-clay-orb" style={style}>
      <Image
        src={item.image}
        alt="Adding to cart"
        width={44}
        height={44}
        style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }}
      />
    </div>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
