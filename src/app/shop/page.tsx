import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { ProductSkeletonGrid } from '@/components/shop/ProductSkeletonGrid';

import { getDbProducts, getDbCategories, getDbCollections } from '@/services/productDbService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Shop All Handmade Pieces | Claypresso Bangalore',
  description:
    'Cute things. Clay things. Things you probably didn’t know you needed. Explore our full collection of handmade clay charms, keychains, trays, and accessories.',
  alternates: {
    canonical: 'https://claypresso.com/shop',
  },
  openGraph: {
    title: 'Shop All Handmade Pieces | Claypresso Bangalore',
    description:
      'Cute things. Clay things. Things you probably didn’t know you needed. Explore our full collection of handmade clay charms, keychains, trays, and accessories.',
    url: 'https://claypresso.com/shop',
  },
};

export default async function ShopPage(props: {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    filter?: string;
    price?: string;
    availability?: string;
    type?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const collectionFilter = searchParams.collection || searchParams.filter;
  const [productsData, categories, collections] = await Promise.all([
    getDbProducts({
      category: searchParams.category,
      collection: collectionFilter,
      price: searchParams.price,
      availability: searchParams.availability,
      productType: searchParams.type,
      sort: (searchParams.sort as any) || 'featured',
      query: searchParams.q,
      limit: 12,
    }),
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
        initialProducts={productsData.products}
        initialTotalCount={productsData.totalCount}
        initialCategories={categories}
        initialCollections={collections}
      />
    </Suspense>
  );
}
