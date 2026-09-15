import { prisma } from '@/lib/prisma';
import { Product, CategoryInfo, ProductCategory, ProductCollectionId } from '@/types/product';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { ProductFilterParams, PaginatedProductsResult, CollectionInfo } from './productService';

/**
 * Format raw Prisma Product record into the frontend Product interface.
 */
export function formatPrismaProduct(p: any): Product {
  const images = p.images && p.images.length > 0 
    ? p.images.map((img: any) => img.url) 
    : ['/images/placeholder.png'];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: (p.category?.name || 'Charms') as ProductCategory,
    collection: p.collection || undefined,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    images,
    secondaryImage: images.length > 1 ? images[1] : undefined,
    stock: p.stock,
    variants: p.variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku || undefined,
      priceDelta: v.priceAdjustment || 0,
      stock: v.stock,
    })) || [],
    material: p.material || 'Polymer Clay, Nickel-Free Hardware',
    dimensions: p.dimensions || '2.5cm x 2.0cm',
    productionType: (p.productionType || 'READY_MADE') as any,
    productionTime: p.productionTime || 'Ready to ship',
    customizable: p.customizable || false,
    status: (p.status || (p.stock <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK')) as any,
    badges: p.badges ? p.badges.split(',').map((b: string) => b.trim()).filter(Boolean) : [],
    weightGrams: p.weightGrams || 50,
  };
}

/**
 * Server-side direct database query for products.
 * Seamlessly integrates live database products into Server Components.
 */
export async function getDbProducts(params: ProductFilterParams = {}): Promise<PaginatedProductsResult> {
  try {
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

    const skip = (page - 1) * limit;
    const where: any = {};

    // 1. Category Filter
    if (category && category !== 'all') {
      where.category = {
        OR: [
          { slug: { equals: category } },
          { name: { equals: category } },
        ],
      };
    }

    // 2. Collection Filter
    if (collection) {
      const colLower = collection.toLowerCase();
      if (colLower === 'new-arrivals' || colLower === 'new') {
        where.badges = { contains: 'new' };
      } else if (colLower === 'bestsellers' || colLower === 'bestseller') {
        where.badges = { contains: 'bestseller' };
      } else if (colLower === 'under-100') {
        where.price = { lte: 100 };
      } else if (colLower === 'under-250') {
        where.price = { lte: 250 };
      } else if (colLower === 'under-500') {
        where.price = { lte: 500 };
      } else {
        where.collection = collection;
      }
    }

    // 3. Price Filter
    if (price) {
      if (price === 'under-100') {
        where.price = { ...where.price, lte: 100 };
      } else if (price === '100-250') {
        where.price = { ...where.price, gte: 100, lte: 250 };
      } else if (price === '250-500') {
        where.price = { ...where.price, gte: 250, lte: 500 };
      } else if (price === 'above-500') {
        where.price = { ...where.price, gt: 500 };
      }
    }

    // 4. Availability
    if (availability) {
      if (availability === 'in-stock') {
        where.status = 'IN_STOCK';
      } else if (availability === 'low-stock') {
        where.status = 'LOW_STOCK';
      } else if (availability === 'made-to-order') {
        where.productionType = 'MADE_TO_ORDER';
      }
    }

    // 5. Product Type
    if (productType) {
      if (productType === 'ready-made') {
        where.productionType = 'READY_MADE';
      } else if (productType === 'made-to-order') {
        where.productionType = 'MADE_TO_ORDER';
      }
    }

    // 6. Search Query
    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    // 7. Sort
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'bestselling') {
      orderBy = { badges: 'desc' };
    }

    const [totalCount, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
    ]);

    if (totalCount > 0 || Object.keys(where).length > 0) {
      const products = rawProducts.map(formatPrismaProduct);
      const totalPages = Math.ceil(totalCount / limit);
      return {
        products,
        totalCount,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    }
  } catch (error) {
    console.warn('[getDbProducts] Database query error, falling back to local dataset:', error);
  }

  // Graceful fallback to static PRODUCTS if DB is initializing or empty
  let filtered = [...PRODUCTS];
  const { category, collection, query, page = 1, limit = 12 } = params;

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase() || p.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase());
  }
  if (collection) {
    const col = collection.toLowerCase();
    if (col === 'bestsellers' || col === 'bestseller') {
      filtered = filtered.filter((p) => p.badges.includes('bestseller'));
    } else if (col === 'new-arrivals' || col === 'new') {
      filtered = filtered.filter((p) => p.badges.includes('new'));
    }
  }

  const totalCount = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    hasMore: startIndex + limit < totalCount,
  };
}

/**
 * Server-side direct database query for a single product by slug.
 */
export async function getDbProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    if (p) {
      return formatPrismaProduct(p);
    }
  } catch (error) {
    console.warn(`[getDbProductBySlug] DB query error for slug "${slug}":`, error);
  }

  // Fallback to static PRODUCTS
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Server-side direct database query for all categories with accurate live item counts.
 */
export async function getDbCategories(): Promise<CategoryInfo[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name as ProductCategory,
        slug: c.slug,
        description: c.description || '',
        coverImage: c.image || '/images/products/crescent-cat-keychain-sq.jpg',
        itemCount: c._count.products,
      }));
    }
  } catch (error) {
    console.warn('[getDbCategories] DB query error:', error);
  }

  // Fallback to static CATEGORIES
  return CATEGORIES.map((cat) => ({
    ...cat,
    itemCount: PRODUCTS.filter((p) => p.category === cat.name).length,
  }));
}

/**
 * Server-side direct database query for a single category by slug.
 */
export async function getDbCategoryBySlug(slug: string): Promise<CategoryInfo | undefined> {
  try {
    const c = await prisma.category.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: slug } },
        ],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (c) {
      return {
        id: c.id,
        name: c.name as ProductCategory,
        slug: c.slug,
        description: c.description || '',
        coverImage: c.image || '/images/products/crescent-cat-keychain-sq.jpg',
        itemCount: c._count.products,
      };
    }
  } catch (error) {
    console.warn(`[getDbCategoryBySlug] DB query error for slug "${slug}":`, error);
  }

  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return undefined;
  return {
    ...cat,
    itemCount: PRODUCTS.filter((p) => p.category === cat.name).length,
  };
}

/**
 * Server-side direct database query for collections with live counts.
 */
export async function getDbCollections(): Promise<CollectionInfo[]> {
  try {
    const [bestsellersCount, newArrivalsCount, under100Count, under250Count, under500Count] = await Promise.all([
      prisma.product.count({ where: { badges: { contains: 'bestseller' } } }),
      prisma.product.count({ where: { badges: { contains: 'new' } } }),
      prisma.product.count({ where: { price: { lte: 100 } } }),
      prisma.product.count({ where: { price: { lte: 250 } } }),
      prisma.product.count({ where: { price: { lte: 500 } } }),
    ]);

    return [
      {
        id: 'new-arrivals',
        name: 'New Arrivals',
        description: 'Fresh from the clay table.',
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
        itemCount: bestsellersCount,
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
  } catch (error) {
    console.warn('[getDbCollections] DB query error:', error);
  }

  const bestsellersCount = PRODUCTS.filter((p) => p.badges.includes('bestseller')).length;
  const newArrivalsCount = PRODUCTS.filter((p) => p.badges.includes('new')).length;

  return [
    { id: 'new-arrivals', name: 'New Arrivals', description: 'Fresh from the clay table.', itemCount: newArrivalsCount },
    { id: 'bestsellers', name: 'Bestsellers', description: 'Our most-loved pieces.', itemCount: bestsellersCount },
    { id: 'gifts', name: 'Gifts', description: 'Pairs and keepsakes made to be shared.', itemCount: bestsellersCount },
    { id: 'under-100', name: 'Under ₹100', description: 'Tiny pocket treasures.', itemCount: 0 },
    { id: 'under-250', name: 'Under ₹250', description: 'Affordable tactile accents.', itemCount: 0 },
    { id: 'under-500', name: 'Under ₹500', description: 'Everyday companions.', itemCount: 0 },
  ];
}

/**
 * Server-side query for related products.
 */
export async function getDbRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  try {
    const raw = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        category: { name: product.category },
      },
      take: limit,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    if (raw.length > 0) {
      return raw.map(formatPrismaProduct);
    }
  } catch (error) {
    console.warn('[getDbRelatedProducts] DB query error:', error);
  }

  const others = PRODUCTS.filter((p) => p.id !== product.id && p.slug !== product.slug);
  return others.slice(0, limit);
}
