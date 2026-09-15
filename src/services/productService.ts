import { Product, CategoryInfo, ProductCategory, ProductCollectionId } from '@/types/product';
import { PRODUCTS, CATEGORIES } from '@/data/products';

import { apiClient } from './apiClient';

export interface ProductFilterParams {
  category?: string;
  collection?: string;
  price?: string; // 'under-100' | '100-250' | '250-500' | 'above-500'
  availability?: string; // 'in-stock' | 'low-stock' | 'made-to-order'
  productType?: string; // 'ready-made' | 'made-to-order'
  sort?: 'featured' | 'newest' | 'bestselling' | 'price-asc' | 'price-desc';
  query?: string;
  page?: number;
  limit?: number;
}

export interface CollectionInfo {
  id: ProductCollectionId;
  name: string;
  description: string;
  itemCount: number;
}

export interface PaginatedProductsResult {
  products: Product[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Filter and query products.
 * Queries the real /api/products backend with fallback.
 */
export async function getProducts(
  params: ProductFilterParams = {}
): Promise<PaginatedProductsResult> {
  if (typeof window !== 'undefined') {
    try {
      const res = await apiClient.get<PaginatedProductsResult>('/api/products', params);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      console.warn('API fetch failed, using fallback:', e);
    }
  }

  const {
    category,
    collection,
    price,
    availability,
    productType,
    sort = 'featured',
    query,
    page = 1,
    limit = 12,
  } = params;

  let filtered = [...PRODUCTS];

  // 1. Search Query
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCollection = p.collection?.toLowerCase().includes(q) || false;
      const matchMaterial = p.material.toLowerCase().includes(q);
      return matchName || matchCategory || matchDesc || matchCollection || matchMaterial;
    });
  }

  // 2. Category Filter (by slug or name)
  if (category && category !== 'all') {
    const catLower = category.toLowerCase().replace(/-/g, ' ');
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase() === catLower ||
        p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
    );
  }

  // 3. Collection Filter
  if (collection) {
    const colLower = collection.toLowerCase();
    if (colLower === 'bestsellers' || colLower === 'bestseller') {
      filtered = filtered.filter((p) => p.badges.includes('bestseller'));
    } else if (colLower === 'new-arrivals' || colLower === 'new') {
      filtered = filtered.filter((p) => p.badges.includes('new'));
    } else if (colLower === 'gifts' || colLower === 'gift') {
      filtered = filtered.filter(
        (p) =>
          p.collection?.toLowerCase().includes('gift') ||
          p.collection?.toLowerCase().includes('friend') ||
          p.collection?.toLowerCase().includes('companion') ||
          p.name.toLowerCase().includes('duo') ||
          p.name.toLowerCase().includes('pair') ||
          p.name.toLowerCase().includes('couple') ||
          p.name.toLowerCase().includes('set')
      );
    } else if (colLower === 'under-100') {
      filtered = filtered.filter((p) => p.price <= 100);
    } else if (colLower === 'under-250') {
      filtered = filtered.filter((p) => p.price <= 250);
    } else if (colLower === 'under-500') {
      filtered = filtered.filter((p) => p.price <= 500);
    }
  }

  // 4. Price Bracket Filter
  if (price) {
    if (price === 'under-100') {
      filtered = filtered.filter((p) => p.price <= 100);
    } else if (price === '100-250') {
      filtered = filtered.filter((p) => p.price > 100 && p.price <= 250);
    } else if (price === '250-500') {
      filtered = filtered.filter((p) => p.price > 250 && p.price <= 500);
    } else if (price === 'above-500') {
      filtered = filtered.filter((p) => p.price > 500);
    }
  }

  // 5. Availability Filter
  if (availability) {
    if (availability === 'in-stock') {
      filtered = filtered.filter((p) => p.status === 'IN_STOCK');
    } else if (availability === 'low-stock') {
      filtered = filtered.filter((p) => p.status === 'LOW_STOCK');
    } else if (availability === 'made-to-order') {
      filtered = filtered.filter((p) => p.productionType === 'MADE_TO_ORDER');
    }
  }

  // 6. Product Type Filter
  if (productType) {
    if (productType === 'ready-made') {
      filtered = filtered.filter((p) => p.productionType === 'READY_MADE');
    } else if (productType === 'made-to-order') {
      filtered = filtered.filter((p) => p.productionType === 'MADE_TO_ORDER');
    }
  }

  // 7. Sorting
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => {
      const aNew = a.badges.includes('new') ? 1 : 0;
      const bNew = b.badges.includes('new') ? 1 : 0;
      return bNew - aNew;
    });
  } else if (sort === 'bestselling') {
    filtered.sort((a, b) => {
      const aBest = a.badges.includes('bestseller') ? 1 : 0;
      const bBest = b.badges.includes('bestseller') ? 1 : 0;
      return bBest - aBest;
    });
  } else {
    // 'featured' default: In-stock bestsellers and new drops first, out of stock last
    filtered.sort((a, b) => {
      if (a.status === 'OUT_OF_STOCK' && b.status !== 'OUT_OF_STOCK') return 1;
      if (b.status === 'OUT_OF_STOCK' && a.status !== 'OUT_OF_STOCK') return -1;
      return 0;
    });
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = 0;
  const endIndex = page * limit;
  const paginatedProducts = filtered.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    totalCount,
    page,
    limit,
    totalPages,
    hasMore: endIndex < totalCount,
  };
}

/**
 * Get all categories with dynamic actual item counts (never hardcoded).
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  return CATEGORIES.map((cat) => {
    const count = PRODUCTS.filter((p) => p.category === cat.name).length;
    return {
      ...cat,
      itemCount: count,
    };
  });
}

/**
 * Get single category by slug.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | undefined> {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return undefined;
  const count = PRODUCTS.filter((p) => p.category === cat.name).length;
  return {
    ...cat,
    itemCount: count,
  };
}

/**
 * Get catalog collections with live counts.
 */
export async function getCollections(): Promise<CollectionInfo[]> {
  const bestsellersCount = PRODUCTS.filter((p) => p.badges.includes('bestseller')).length;
  const newArrivalsCount = PRODUCTS.filter((p) => p.badges.includes('new')).length;
  const giftsCount = PRODUCTS.filter(
    (p) =>
      p.collection?.toLowerCase().includes('gift') ||
      p.collection?.toLowerCase().includes('friend') ||
      p.collection?.toLowerCase().includes('companion') ||
      p.name.toLowerCase().includes('duo') ||
      p.name.toLowerCase().includes('pair') ||
      p.name.toLowerCase().includes('couple') ||
      p.name.toLowerCase().includes('set')
  ).length;
  const under100Count = PRODUCTS.filter((p) => p.price <= 100).length;
  const under250Count = PRODUCTS.filter((p) => p.price <= 250).length;
  const under500Count = PRODUCTS.filter((p) => p.price <= 500).length;

  return [
    {
      id: 'new-arrivals',
      name: 'New Arrivals',
      description: 'Fresh out of the studio oven.',
      itemCount: newArrivalsCount,
    },
    {
      id: 'bestsellers',
      name: 'Bestsellers',
      description: 'Our most-loved pieces.',
      itemCount: bestsellersCount,
    },
    {
      id: 'gifts',
      name: 'Gifts',
      description: 'Pairs and keepsakes made to be shared.',
      itemCount: giftsCount,
    },
    {
      id: 'under-100',
      name: 'Under ₹100',
      description: 'Tiny pocket treasures.',
      itemCount: under100Count,
    },
    {
      id: 'under-250',
      name: 'Under ₹250',
      description: 'Affordable tactile accents.',
      itemCount: under250Count,
    },
    {
      id: 'under-500',
      name: 'Under ₹500',
      description: 'Everyday companions.',
      itemCount: under500Count,
    },
  ];
}

/**
 * Get product by slug.
 * Queries the real /api/products/[slug] backend with fallback.
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (typeof window !== 'undefined') {
    try {
      const res = await apiClient.get<Product>(`/api/products/${slug}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (e) {
      console.warn('API fetch failed for product slug, using fallback:', e);
    }
  }
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Get related products based on category, collection, price proximity, and bestsellers.
 * Excludes the current product.
 */
export async function getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  const others = PRODUCTS.filter((p) => p.id !== product.id && p.slug !== product.slug);

  const scored = others.map((p) => {
    let score = 0;
    // 1. Same category (+10)
    if (p.category === product.category) score += 10;
    // 2. Same collection (+5)
    if (product.collection && p.collection === product.collection) score += 5;
    // 3. Similar price range (+3)
    const priceDiff = Math.abs(p.price - product.price);
    if (priceDiff <= 150) score += 3;
    // 4. Bestseller (+2)
    if (p.badges.includes('bestseller')) score += 2;
    // 5. In stock (+2)
    if (p.status === 'IN_STOCK') score += 2;

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

