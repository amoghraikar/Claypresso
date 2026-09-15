import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDbProductBySlug, getDbRelatedProducts } from '@/services/productDbService';
import { PRODUCTS } from '@/data/products';
import { ProductDetailView } from '@/components/product/ProductDetail/ProductDetailView';
import { BUSINESS_RULES } from '@/types/product';

export const dynamicParams = true;
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);

  if (!product) {
    return {
      title: 'Piece Not Found | Claypresso Bangalore',
      description: 'Handcrafted polymer clay charms and accessories from Claypresso.',
    };
  }

  const primaryImage = product.images[0] || '/images/logo.png';

  return {
    title: `${product.name} | Handcrafted Clay | Claypresso`,
    description: product.description,
    alternates: {
      canonical: `https://claypresso.com/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Claypresso Bangalore`,
      description: product.description,
      url: `https://claypresso.com/product/${product.slug}`,
      siteName: 'Claypresso',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getDbRelatedProducts(product, 4);

  // Schema.org JSON-LD Structured Data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Claypresso',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: BUSINESS_RULES.currencyCode,
      availability:
        product.status === 'OUT_OF_STOCK'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: `https://claypresso.com/product/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
