'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft, Search, X, Sparkles, Frown } from 'lucide-react';
import { Product, CategoryInfo } from '@/types/product';
import {
  getProducts,
  getCategories,
  getCollections,
  CollectionInfo,
} from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { CategoryNav } from './CategoryNav';
import { ActiveFilterChips, ActiveFilterItem } from './ActiveFilterChips';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ProductSkeletonGrid } from './ProductSkeletonGrid';
import { Button } from '@/components/ui/Button/Button';
import styles from './ShopCatalog.module.css';

export interface ShopCatalogProps {
  initialCategory?: string;
  initialSearchQuery?: string;
  initialProducts?: Product[];
  initialTotalCount?: number;
  initialCategories?: CategoryInfo[];
  initialCollections?: CollectionInfo[];
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  initialCategory,
  initialSearchQuery,
  initialProducts,
  initialTotalCount,
  initialCategories,
  initialCollections,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Data states initialized from Server Component props for instant SSR & SEO
  const [categories, setCategories] = useState<CategoryInfo[]>(() => initialCategories || []);
  const [collections, setCollections] = useState<CollectionInfo[]>(() => initialCollections || []);
  const [products, setProducts] = useState<Product[]>(() => initialProducts || []);
  const [totalCount, setTotalCount] = useState<number>(() => initialTotalCount ?? (initialProducts?.length || 0));
  const totalAllCount = useMemo(() => {
    const sum = categories.reduce((acc, cat) => acc + cat.itemCount, 0);
    return sum > 0 ? sum : (initialTotalCount ?? initialProducts?.length ?? 0);
  }, [categories, initialTotalCount, initialProducts]);
  const [loading, setLoading] = useState<boolean>(!initialProducts);

  // Pagination state
  const [displayLimit, setDisplayLimit] = useState<number>(12);

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState<boolean>(false);

  // Read current filters from URL search params or props
  const currentCategory = initialCategory || searchParams.get('category') || 'all';
  const currentCollection = searchParams.get('collection') || searchParams.get('filter') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const currentProductType = searchParams.get('type') || '';
  const currentSort = (searchParams.get('sort') as any) || 'featured';
  const currentQuery = searchParams.get('q') || initialSearchQuery || '';

  // Local search query input
  const [searchQueryInput, setSearchQueryInput] = useState<string>(currentQuery);

  useEffect(() => {
    setSearchQueryInput(currentQuery);
  }, [currentQuery]);

  // Load collections dynamically
  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      const cols = await getCollections();
      if (mounted) {
        setCollections(cols);
      }
    }
    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      setLoading(true);
      const res = await getProducts({
        category: currentCategory,
        collection: currentCollection,
        price: currentPrice,
        availability: currentAvailability,
        productType: currentProductType,
        sort: currentSort,
        query: currentQuery,
        page: 1,
        limit: displayLimit,
      });

      if (mounted) {
        setProducts(res.products);
        setTotalCount(res.totalCount);
        setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [
    currentCategory,
    currentCollection,
    currentPrice,
    currentAvailability,
    currentProductType,
    currentSort,
    currentQuery,
    displayLimit,
  ]);

  // Helper to update URL search parameters
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset pagination to first page
    setDisplayLimit(12);

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  // Category selection handler (navigates if on category route)
  const handleSelectCategory = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : '';

    if (categorySlug === 'all') {
      router.push(`/shop${query}`);
    } else {
      router.push(`/shop/${categorySlug}${query}`);
    }
  };

  // Collection selection toggle
  const handleSelectCollection = (collectionId: string) => {
    if (currentCollection === collectionId) {
      updateParams({ collection: null, filter: null });
    } else {
      updateParams({ collection: collectionId, filter: null });
    }
  };

  // Generic filter change
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'category') {
      handleSelectCategory(value);
    } else if (key === 'productType') {
      updateParams({ type: value || null });
    } else if (key === 'collection') {
      updateParams({ collection: value || null, filter: null });
    } else {
      updateParams({ [key]: value || null });
    }
  };

  // Sort change handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value });
  };

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchQueryInput.trim() || null });
  };

  const handleSearchClear = () => {
    setSearchQueryInput('');
    updateParams({ q: null });
  };

  // Clear all filters
  const handleClearAll = () => {
    setDisplayLimit(12);
    setSearchQueryInput('');
    if (initialCategory) {
      router.push('/shop');
    } else {
      startTransition(() => {
        router.replace('/shop', { scroll: false });
      });
    }
  };

  // Active filters list for chips
  const activeFilterList: ActiveFilterItem[] = useMemo(() => {
    const list: ActiveFilterItem[] = [];

    if (currentCategory && currentCategory !== 'all') {
      const cat = categories.find((c) => c.slug.toLowerCase() === currentCategory.toLowerCase());
      list.push({
        key: 'category',
        label: cat ? cat.name : currentCategory,
      });
    }

    if (currentCollection) {
      const col = collections.find((c) => c.id === currentCollection);
      list.push({
        key: 'collection',
        label: col ? col.name : currentCollection,
      });
    }

    if (currentPrice) {
      const priceLabels: Record<string, string> = {
        'under-100': 'Under ₹100',
        '100-250': '₹100–₹250',
        '250-500': '₹250–₹500',
        'above-500': 'Above ₹500',
      };
      list.push({
        key: 'price',
        label: priceLabels[currentPrice] || currentPrice,
      });
    }

    if (currentAvailability) {
      const availLabels: Record<string, string> = {
        'in-stock': 'In Stock',
        'low-stock': 'Low Stock',
        'made-to-order': 'Made to Order',
      };
      list.push({
        key: 'availability',
        label: availLabels[currentAvailability] || currentAvailability,
      });
    }

    if (currentProductType) {
      const typeLabels: Record<string, string> = {
        'ready-made': 'Ready Made',
        'made-to-order': 'Made to Order',
      };
      list.push({
        key: 'type',
        label: typeLabels[currentProductType] || currentProductType,
      });
    }

    if (currentQuery) {
      list.push({
        key: 'q',
        label: `"${currentQuery}"`,
      });
    }

    return list;
  }, [
    currentCategory,
    currentCollection,
    currentPrice,
    currentAvailability,
    currentProductType,
    currentQuery,
    categories,
    collections,
  ]);

  // Remove a single active filter chip
  const handleRemoveChip = (key: string) => {
    if (key === 'category') {
      if (initialCategory) {
        const params = new URLSearchParams(searchParams.toString());
        const queryString = params.toString();
        router.push(queryString ? `/shop?${queryString}` : '/shop');
      } else {
        updateParams({ category: null });
      }
    } else if (key === 'collection') {
      updateParams({ collection: null, filter: null });
    } else if (key === 'type') {
      updateParams({ type: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  // Find active category info for category view
  const activeCategoryInfo = useMemo(() => {
    const slug = initialCategory || (searchParams.get('category') && searchParams.get('category') !== 'all' ? searchParams.get('category') : '');
    if (!slug) return undefined;
    return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  }, [initialCategory, searchParams, categories]);

  const hasMore = displayLimit < totalCount;

  return (
    <section className={styles.shopSection}>
      <div className="container">
        {/* ==================================================================
            1. SHOP INTRO
            ================================================================== */}
        <div className={styles.shopIntro}>
          {activeCategoryInfo ? (
            <>
              <Link href="/shop" className={styles.introCategoryBack}>
                <ArrowLeft size={14} /> Back to All Products
              </Link>
              <h1 className={styles.introHeading}>{activeCategoryInfo.name}</h1>
              <p className={styles.introSupportingText}>{activeCategoryInfo.description}</p>
              <span className={styles.introBadge}>
                <Sparkles size={12} /> {totalCount} {totalCount === 1 ? 'piece' : 'pieces'}
              </span>
            </>
          ) : currentQuery ? (
            <>
              <Link href="/shop" className={styles.introCategoryBack}>
                <ArrowLeft size={14} /> Back to Shop
              </Link>
              <h1 className={styles.introHeading}>Search Results</h1>
              <p className={styles.introSupportingHeadline}>
                Matching &ldquo;{currentQuery}&rdquo;
              </p>
              <span className={styles.introBadge}>
                {totalCount} {totalCount === 1 ? 'result' : 'results'}
              </span>
            </>
          ) : (
            <>
              <h1 className={styles.introHeading}>SHOP</h1>
              <p className={styles.introSupportingHeadline}>
                &ldquo;Cute things. Clay things. Things you probably didn&apos;t know you needed.&rdquo;
              </p>
              <p className={styles.introSupportingText}>
                Explore handmade charms, accessories, trinkets and more.
              </p>
              <span className={styles.introBadge}>
                {totalCount} {totalCount === 1 ? 'piece' : 'pieces'} available
              </span>
            </>
          )}
        </div>

        {/* ==================================================================
            2. CATEGORY NAVIGATION (Horizontal scroll on mobile)
            ================================================================== */}
        <CategoryNav
          categories={categories}
          activeCategory={currentCategory}
          totalAllCount={totalAllCount}
          onSelectCategory={handleSelectCategory}
        />

        {/* ==================================================================
            3. COLLECTIONS QUICK BAR
            ================================================================== */}
        <div className={styles.collectionsQuickBar} aria-label="Collections filter">
          <span className={styles.collectionsLabel}>Collections:</span>
          {collections.map((col) => {
            const isActive = currentCollection.toLowerCase() === col.id.toLowerCase();
            return (
              <button
                key={col.id}
                type="button"
                className={`${styles.collectionBtn} ${isActive ? styles.collectionBtnActive : ''}`}
                onClick={() => handleSelectCollection(col.id)}
              >
                {col.name} ({col.itemCount})
              </button>
            );
          })}
        </div>

        {/* ==================================================================
            4. FILTER + SORT TOOLBAR
            ================================================================== */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {/* Filter Drawer Toggle */}
            <button
              type="button"
              className={styles.filterTriggerBtn}
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open filter drawer"
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterList.length > 0 && (
                <span className={styles.filterBadgeCount}>{activeFilterList.length}</span>
              )}
            </button>

            {/* Desktop Filter Dropdowns (Inline) */}
            <div className={styles.desktopFilterRow}>
              {/* Collection Filter */}
              <select
                className={styles.desktopSelect}
                value={currentCollection}
                onChange={(e) => handleFilterChange('collection', e.target.value)}
                aria-label="Filter by collection"
              >
                <option value="">Collection: All</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                className={styles.desktopSelect}
                value={currentPrice}
                onChange={(e) => handleFilterChange('price', e.target.value)}
                aria-label="Filter by price"
              >
                <option value="">Price: All</option>
                <option value="under-100">Under ₹100</option>
                <option value="100-250">₹100 – ₹250</option>
                <option value="250-500">₹250 – ₹500</option>
                <option value="above-500">Above ₹500</option>
              </select>

              {/* Availability Filter */}
              <select
                className={styles.desktopSelect}
                value={currentAvailability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                aria-label="Filter by availability"
              >
                <option value="">Stock: All</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="made-to-order">Made to Order</option>
              </select>

              {/* Production Type Filter */}
              <select
                className={styles.desktopSelect}
                value={currentProductType}
                onChange={(e) => handleFilterChange('productType', e.target.value)}
                aria-label="Filter by product type"
              >
                <option value="">Type: All</option>
                <option value="ready-made">Ready Made</option>
                <option value="made-to-order">Made to Order</option>
              </select>
            </div>

            <span className={styles.resultsCount}>
              {totalCount} {totalCount === 1 ? 'piece' : 'pieces'} found
            </span>
          </div>

          <div className={styles.toolbarRight}>
            {/* Search Input in Toolbar */}
            <form onSubmit={handleSearchSubmit} className={styles.toolbarSearch}>
              <input
                type="text"
                placeholder="Search pieces..."
                value={searchQueryInput}
                onChange={(e) => setSearchQueryInput(e.target.value)}
                className={styles.toolbarSearchInput}
                aria-label="Search catalogue"
              />
              {searchQueryInput ? (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className={styles.toolbarSearchClear}
                  aria-label="Clear search input"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className={styles.toolbarSearchClear}>
                  <Search size={14} />
                </span>
              )}
            </form>

            {/* Sort Select */}
            <div className={styles.sortWrapper}>
              <label htmlFor="shop-sort-select" className={styles.sortLabel}>
                Sort:
              </label>
              <select
                id="shop-sort-select"
                value={currentSort}
                onChange={handleSortChange}
                className={styles.sortSelect}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="bestselling">Best Selling</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================================================================
            5. ACTIVE FILTERS CHIPS
            ================================================================== */}
        <ActiveFilterChips
          filters={activeFilterList}
          onRemove={handleRemoveChip}
          onClearAll={handleClearAll}
        />

        {/* ==================================================================
            6. PRODUCT GRID / SKELETON / EMPTY STATE
            ================================================================== */}
        {loading ? (
          <ProductSkeletonGrid />
        ) : products.length > 0 ? (
          <div className={styles.productGrid}>
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{
                  animation: `clayFadeUp 600ms var(--ease-clay-settle) ${Math.min(index * 50, 400)}ms both`,
                }}
              >
                <ProductCard product={product} priority={index < 4} />
              </div>
            ))}
          </div>
        ) : (
          /* ================================================================
             EMPTY STATE (Requirement 18)
             ================================================================ */
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Frown size={32} strokeWidth={1.75} />
            </div>
            <h3 className={styles.emptyStateHeading}>NOTHING HERE... YET.</h3>
            <p className={styles.emptyStateText}>
              Try removing a filter or searching for something else.
            </p>
            <div className={styles.emptyStateActions}>
              <Button variant="primary" size="md" onClick={handleClearAll}>
                CLEAR FILTERS
              </Button>
              <Button variant="secondary" size="md" href="/shop">
                BACK TO SHOP
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================================
            7. LOAD MORE SECTION (Requirement 16)
            ================================================================== */}
        {!loading && products.length > 0 && hasMore && (
          <div className={styles.loadMoreSection}>
            <span className={styles.loadMoreProgress}>
              Showing {products.length} of {totalCount} pieces
            </span>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min((products.length / totalCount) * 100, 100)}%` }}
              />
            </div>
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={() => setDisplayLimit((prev) => prev + 8)}
            >
              LOAD MORE
            </button>
          </div>
        )}

        {/* ==================================================================
            8. MOBILE FILTER DRAWER (Requirement 11, 24, 25)
            ================================================================== */}
        <MobileFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          categories={categories}
          collections={collections}
          selectedCategory={currentCategory}
          selectedCollection={currentCollection}
          selectedPrice={currentPrice}
          selectedAvailability={currentAvailability}
          selectedProductType={currentProductType}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          resultCount={totalCount}
        />
      </div>
    </section>
  );
};
