import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  getDbCategoryBySlug, 
  getDbCategories, 
  getDbProducts, 
  getDbCollections 
} from '@/services/productDbService';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { ProductSkeletonGrid } from '@/components/shop/ProductSkeletonGrid';

export const dynamicParams = true;
export const revalidate = 0;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getDbCategories();
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getDbCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found | Claypresso' };

  return {
    title: `${category.name} — Handmade Clay Collection | Claypresso`,
    description: category.description,
    alternates: {
      canonical: `https://claypresso.com/shop/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | Claypresso`,
      description: category.description,
      url: `https://claypresso.com/shop/${category.slug}`,
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{
    collection?: string;
    filter?: string;
    price?: string;
    availability?: string;
    type?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const { category: slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const collectionFilter = searchParams.collection || searchParams.filter;
  const category = await getDbCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [productsData, categories, collections] = await Promise.all([
    getDbProducts({
      category: slug,
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
        initialCategory={category.slug}
        initialProducts={productsData.products}
        initialTotalCount={productsData.totalCount}
        initialCategories={categories}
        initialCollections={collections}
      />
    </Suspense>
  );
}
