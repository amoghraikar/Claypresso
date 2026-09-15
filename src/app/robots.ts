import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://claypresso.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/product/*',
          '/about',
          '/faq',
          '/contact',
          '/shipping',
          '/custom',
          '/custom/request',
          '/track-order',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/checkout',
          '/checkout/*',
          '/order-confirmation',
          '/order-confirmation/*',
          '/api',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
