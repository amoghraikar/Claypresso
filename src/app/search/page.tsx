import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { ProductSkeletonGrid } from '@/components/shop/ProductSkeletonGrid';

import { getDbProducts, getDbCategories, getDbCollections } from '@/services/productDbService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Search Catalogue | Claypresso Bangalore',
  description: 'Search our handcrafted polymer clay charms, keychains, pins, and accessories.',
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || '';

  const [productsData, categories, collections] = await Promise.all([
    getDbProducts({ query: q, limit: 12 }),
    getDbCategories(),
    getDbCollections(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="section">
          <div className="container">
            <ProductSkeletonGrid />
          </div>
        </div>
      }
    >
      <ShopCatalog
        initialSearchQuery={q}
        initialProducts={productsData.products}
        initialTotalCount={productsData.totalCount}
        initialCategories={categories}
        initialCollections={collections}
      />
    </Suspense>
  );
}
