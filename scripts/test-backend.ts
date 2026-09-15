import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword, signAuthToken, verifyAuthToken } from '../src/lib/auth';
import { calculateServerShipping } from '../src/lib/shipping';

const prisma = new PrismaClient();

async function runBackendTests() {
  console.log('🧪 Starting Claypresso Step 10 Backend Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Database Connection & Products
    // -------------------------------------------------------------
    console.log('1. Testing Product Catalog & DB Connection:');
    const productCount = await prisma.product.count();
    assert(productCount > 0, `Database contains seeded products (found ${productCount})`);

    const sampleProduct = await prisma.product.findFirst({
      where: { slug: 'night-light-fury-couple-keychain' },
      include: { category: true, images: true, variants: true },
    });
    assert(!!sampleProduct, 'Found sample product by slug');
    assert(sampleProduct?.images.length! > 0, 'Product has associated images');
    assert(sampleProduct?.category.name === 'Keychain Charms', 'Product category relation intact');

    // -------------------------------------------------------------
    // Test 2: Categories
    // -------------------------------------------------------------
    console.log('\n2. Testing Category Model:');
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
    assert(categories.length >= 7, `Seeded at least 7 categories (found ${categories.length})`);
    assert(categories.some((c) => c._count.products > 0), 'Categories aggregate active product counts');

    // -------------------------------------------------------------
    // Test 3: Password Hashing & Authentication
    // -------------------------------------------------------------
    console.log('\n3. Testing Auth, Bcrypt & JWT:');
    const rawPass = 'SecretHandmadeClay2026!';
    const hashed = await hashPassword(rawPass);
    assert(hashed !== rawPass && hashed.startsWith('$2'), 'Password hashed with bcrypt');

    const passMatch = await verifyPassword(rawPass, hashed);
    assert(passMatch, 'Password verification succeeds with correct password');

    const passMismatch = await verifyPassword('WrongPassword', hashed);
    assert(!passMismatch, 'Password verification fails with incorrect password');

    const token = await signAuthToken({
      userId: 'usr_test_123',
      email: 'test@claypresso.com',
      role: 'CUSTOMER',
      name: 'Test Customer',
    });
    assert(typeof token === 'string' && token.length > 20, 'Signed valid JWT session token');

    const payload = await verifyAuthToken(token);
    assert(payload?.userId === 'usr_test_123' && payload?.role === 'CUSTOMER', 'Verified JWT token payload');

    // -------------------------------------------------------------
    // Test 4: Server Shipping Calculations
    // -------------------------------------------------------------
    console.log('\n4. Testing Authoritative Shipping Rules:');
    const belowThreshold = calculateServerShipping(350);
    assert(belowThreshold.fee === 60 && !belowThreshold.isFree, 'Subtotal < ₹500 incurs ₹60 shipping');

    const atThreshold = calculateServerShipping(500);
    assert(atThreshold.fee === 0 && atThreshold.isFree, 'Subtotal = ₹500 qualifies for FREE shipping');

    const aboveThreshold = calculateServerShipping(1200);
    assert(aboveThreshold.fee === 0 && aboveThreshold.isFree, 'Subtotal > ₹500 qualifies for FREE shipping');

    // -------------------------------------------------------------
    // Test 5: Atomic Order Creation & Inventory Checks
    // -------------------------------------------------------------
    console.log('\n5. Testing Atomic Order Creation & Inventory:');
    const testProd = await prisma.product.findFirst({
      where: { stock: { gte: 2 } },
    });
    assert(!!testProd, 'Found product with adequate stock for testing');

    if (testProd) {
      const initialStock = testProd.stock;

      // Simulate atomic order placement
      const testOrder = await prisma.$transaction(async (tx) => {
        // Atomic stock decrement
        await tx.product.update({
          where: { id: testProd.id },
          data: { stock: { decrement: 1 } },
        });

        return tx.order.create({
          data: {
            orderNumber: `CLP-TEST-${Date.now()}`,
            customerName: 'Test Buyer',
            customerEmail: 'buyer@example.com',
            customerPhone: '+91 99999 11111',
            shippingAddress: JSON.stringify({ city: 'Bengaluru', pincode: '560001' }),
            subtotal: testProd.price,
            shippingFee: testProd.price >= 500 ? 0 : 60,
            total: testProd.price + (testProd.price >= 500 ? 0 : 60),
            paymentMethod: 'UPI',
            paymentStatus: 'PAID',
            orderStatus: 'PROCESSING',
            items: {
              create: [
                {
                  productId: testProd.id,
                  productNameSnapshot: testProd.name,
                  priceSnapshot: testProd.price,
                  quantity: 1,
                  subtotal: testProd.price,
                  imageSnapshot: '/images/placeholder.png',
                  productionTypeSnapshot: testProd.productionType,
                },
              ],
            },
          },
        });
      });

      assert(!!testOrder.id, `Created test order (${testOrder.orderNumber})`);

      const recheckedProd = await prisma.product.findUnique({
        where: { id: testProd.id },
      });
      assert(
        recheckedProd?.stock === initialStock - 1,
        `Inventory accurately decremented from ${initialStock} to ${recheckedProd?.stock}`
      );

      // Clean up test order & restore stock
      await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
      await prisma.order.delete({ where: { id: testOrder.id } });
      await prisma.product.update({
        where: { id: testProd.id },
        data: { stock: initialStock },
      });
      console.log('  🧹 Cleaned up test order and restored original stock.');
    }

    // -------------------------------------------------------------
    // Test 6: Custom Order & Quotation Lifecycle
    // -------------------------------------------------------------
    console.log('\n6. Testing Custom Order & Quotation Lifecycle:');
    const customOrder = await prisma.customOrder.create({
      data: {
        referenceNumber: `CP-CUSTOM-TEST-${Date.now()}`,
        name: 'Custom Client',
        email: 'client@example.com',
        phone: '+91 98888 22222',
        category: 'Clay Charm',
        description: 'Bespoke lilac cat charm with golden collar',
        quantity: 2,
        status: 'NEW',
      },
    });
    assert(customOrder.status === 'NEW', 'Custom order initialized with NEW status');

    // Admin creates quote
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const quote = await prisma.customQuote.create({
      data: {
        customOrderId: customOrder.id,
        price: 450,
        productionDays: 20,
        notes: 'Hand-sculpted in pastel lilac clay',
        expiresAt: expiry,
        status: 'PENDING',
      },
    });
    await prisma.customOrder.update({
      where: { id: customOrder.id },
      data: { status: 'QUOTED' },
    });
    assert(quote.price === 450, 'Admin quotation created with price ₹450');

    // Customer approves quote
    await prisma.$transaction([
      prisma.customQuote.update({
        where: { id: quote.id },
        data: { status: 'ACCEPTED' },
      }),
      prisma.customOrder.update({
        where: { id: customOrder.id },
        data: { status: 'APPROVED' },
      }),
    ]);

    const approvedOrder = await prisma.customOrder.findUnique({
      where: { id: customOrder.id },
    });
    assert(approvedOrder?.status === 'APPROVED', 'Custom order status transitioned to APPROVED');

    // Clean up
    await prisma.customQuote.deleteMany({ where: { customOrderId: customOrder.id } });
    await prisma.customOrder.delete({ where: { id: customOrder.id } });
    console.log('  🧹 Cleaned up custom test order.');

    // -------------------------------------------------------------
    // Test 7: Discounts & Site Settings
    // -------------------------------------------------------------
    console.log('\n7. Testing Discounts & Site Settings:');
    const welcomePromo = await prisma.discount.findUnique({
      where: { code: 'WELCOME10' },
    });
    assert(!!welcomePromo && welcomePromo.active, 'WELCOME10 discount code active');

    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'free_shipping_threshold' },
    });
    assert(setting?.value === '500', 'Free shipping threshold site setting is ₹500');

  } catch (error: any) {
    console.error('Test run failed with error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n========================================`);
  console.log(`Backend Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendTests();
