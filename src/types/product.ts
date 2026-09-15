export type ProductionType = 'READY_MADE' | 'MADE_TO_ORDER' | 'CUSTOM';
export type ProductStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type BadgeType = 'bestseller' | 'new' | 'low-stock' | 'made-to-order' | 'out-of-stock';

export type ProductCollectionId =
  | 'new-arrivals'
  | 'bestsellers'
  | 'gifts'
  | 'under-100'
  | 'under-250'
  | 'under-500';

export type ProductCategory =
  | 'Charms'
  | 'Keychain Charms'
  | 'Mini Phone Charms'
  | 'Magnets'
  | 'Trays'
  | 'Badges'
  | 'Hair Pins';

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  priceDelta?: number;
  stock?: number;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  content: string;
  verifiedPurchase?: boolean;
  customerImage?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  collection?: string;
  price: number; // in INR (₹)
  originalPrice?: number; // optional comparison price
  images: string[];
  secondaryImage?: string;
  videos?: string[];
  stock: number;
  variants?: ProductVariant[];
  material: string;
  dimensions: string;
  productionType: ProductionType;
  productionTime: string; // e.g. "Ready to ship" vs "3–5 days handmade"
  customizable: boolean;
  status: ProductStatus;
  badges: BadgeType[];
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  customerPhotos?: string[];
  weightGrams?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  customNotes?: string;
}

export interface CategoryInfo {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string;
  itemCount: number;
  coverImage: string;
  accentColor?: string;
}

export const BUSINESS_RULES = {
  currency: '₹',
  currencyCode: 'INR',
  freeShippingThreshold: 500, // ₹500+ free shipping
  shippingRegions: ['India'],
  standardShippingFee: 60,
  transitDaysReadyMade: 4,
  transitDaysCustom: 25,
  location: 'Bangalore, India',
  instagram: {
    handle: '@claypresso',
    url: 'https://www.instagram.com/claypresso/',
  },
} as const;
