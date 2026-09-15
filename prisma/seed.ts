import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PRODUCTS, CATEGORIES } from '../src/data/products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Claypresso database seed...');

  // 1. Clean existing records (in logical child-to-parent order)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customQuote.deleteMany();
  await prisma.customOrder.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Seed Default Site Settings
  await prisma.siteSetting.createMany({
    data: [
      { key: 'free_shipping_threshold', value: '500' },
      { key: 'standard_shipping_fee', value: '60' },
      { key: 'estimated_transit_days', value: '4' },
      { key: 'studio_location', value: 'Bangalore, Karnataka, India' },
      { key: 'store_status', value: 'OPEN' },
    ],
  });
  console.log('✅ Created site settings.');

  // 3. Seed Discounts
  await prisma.discount.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minimumOrderValue: 300,
        maximumDiscount: 100,
        usageLimit: 500,
        active: true,
      },
      {
        code: 'CLAYLOVE',
        type: 'FIXED',
        value: 50,
        minimumOrderValue: 400,
        usageLimit: 200,
        active: true,
      },
    ],
  });
  console.log('✅ Created discount codes.');

  // 4. Seed Users (Admin & Customer)
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@claypresso.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      name: 'Claypresso Studio Admin',
      phone: '+91 99999 00000',
    },
  });

  const customerPasswordHash = await bcrypt.hash('PriyaPassword123!', 10);
  const customerUser = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
    },
  });

  // Create empty wishlist for customer
  await prisma.wishlist.create({
    data: {
      userId: customerUser.id,
    },
  });
  console.log('✅ Seeded users (Admin: admin@claypresso.com, Customer: priya@example.com).');

  // 5. Seed Categories
  const categoryMap = new Map<string, string>(); // category.name -> category.id

  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const createdCat = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.coverImage,
        active: true,
        sortOrder: i,
      },
    });
    categoryMap.set(c.name, createdCat.id);
  }
  console.log(`✅ Seeded ${CATEGORIES.length} categories.`);

  // 6. Seed Products with Images, Variants, and Inventories
  let productCount = 0;
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) {
      console.warn(`Category not found for product: ${p.name} (${p.category})`);
      continue;
    }

    const createdProduct = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: categoryId,
        collection: p.collection || null,
        price: p.price,
        originalPrice: p.originalPrice || null,
        productionType: p.productionType,
        productionTime: p.productionTime || 'Ready to ship',
        customizable: p.customizable,
        material: p.material,
        dimensions: p.dimensions,
        status: p.status,
        stock: p.stock,
        badges: p.badges.join(','),
        weightGrams: p.weightGrams || 50,
      },
    });

    // Product Images
    if (p.images && p.images.length > 0) {
      for (let idx = 0; idx < p.images.length; idx++) {
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            url: p.images[idx],
            altText: `${p.name} photo ${idx + 1}`,
            sortOrder: idx,
          },
        });
      }
    }

    // Product Variants & Inventory
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            name: v.name,
            priceAdjustment: v.priceDelta || 0,
            stock: v.stock ?? 5,
            sku: v.sku || `${p.slug}-${v.id}`,
          },
        });

        // Inventory for variant
        await prisma.inventory.create({
          data: {
            productId: createdProduct.id,
            variantId: variant.id,
            stock: v.stock ?? 5,
            lowStockThreshold: 2,
          },
        });
      }
    } else {
      // Inventory for base product without variants
      await prisma.inventory.create({
        data: {
          productId: createdProduct.id,
          stock: p.stock,
          lowStockThreshold: 3,
        },
      });
    }

    // Product Reviews
    if (p.reviews && p.reviews.length > 0) {
      for (const r of p.reviews) {
        await prisma.review.create({
          data: {
            productId: createdProduct.id,
            authorName: r.author,
            rating: r.rating,
            title: r.rating === 5 ? 'Absolutely loved it!' : 'Cute handmade charm',
            content: r.content,
            verifiedPurchase: r.verifiedPurchase ?? true,
            status: 'APPROVED',
          },
        });
      }
    }

    productCount++;
  }
  console.log(`✅ Seeded ${productCount} products with images, variants, inventory, and reviews.`);

  // 7. Seed Sample Initial Orders (Ready-made & Made-to-order for testing tracking)
  const sampleProduct = PRODUCTS[0];
  const sampleItemPrice = sampleProduct.price;

  await prisma.order.create({
    data: {
      orderNumber: 'CLP-2026-000001',
      userId: customerUser.id,
      customerName: 'Priya Sharma',
      customerEmail: 'priya@example.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        phone: '+91 98765 43210',
        addressLine1: '42, Lavender Bough, Indiranagar',
        addressLine2: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      }),
      subtotal: sampleItemPrice,
      shippingFee: sampleItemPrice >= 500 ? 0 : 60,
      discount: 0,
      total: sampleItemPrice + (sampleItemPrice >= 500 ? 0 : 60),
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderStatus: 'SHIPPED',
      items: {
        create: [
          {
            productId: sampleProduct.id,
            productNameSnapshot: sampleProduct.name,
            priceSnapshot: sampleItemPrice,
            quantity: 1,
            subtotal: sampleItemPrice,
            imageSnapshot: sampleProduct.images[0],
            selectedVariantSnapshot: 'Default',
            productionTypeSnapshot: sampleProduct.productionType,
          },
        ],
      },
      payments: {
        create: [
          {
            provider: 'MOCK_UPI',
            providerPaymentId: 'pay_mock_upi_sample_001',
            amount: sampleItemPrice + (sampleItemPrice >= 500 ? 0 : 60),
            currency: 'INR',
            status: 'PAID',
          },
        ],
      },
    },
  });
  console.log('✅ Seeded sample test order (CLP-2026-000001).');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
