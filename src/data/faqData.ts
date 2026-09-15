export interface FAQItem {
  id: string;
  category: 'Products' | 'Orders' | 'Custom' | 'Shipping' | 'Payment';
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES = ['All', 'Products', 'Orders', 'Custom', 'Shipping', 'Payment'] as const;

export const FAQ_ITEMS: FAQItem[] = [
  // PRODUCTS
  {
    id: 'prod-1',
    category: 'Products',
    question: 'What does Claypresso make?',
    answer:
      'Claypresso creates miniature, personality-filled clay accessories including bag charms, keychain charms, mini phone charms, sculpted fridge magnets, trinket trays, wearable pin badges, and hair pins.',
  },
  {
    id: 'prod-2',
    category: 'Products',
    question: 'Are all Claypresso pieces handmade?',
    answer:
      'Yes, 100% handmade. Every accessory is hand-sculpted with polymer clay, baked for strength, detailed with gentle pigments, and sealed with a protective glaze in our Bangalore studio. Because each item is formed by hand, subtle natural variations make every piece completely unique.',
  },
  {
    id: 'prod-3',
    category: 'Products',
    question: 'Are products available in limited quantities?',
    answer:
      'Yes. Because our studio works by hand in small batches, ready-made drops have limited inventory. When ready-made pieces sell out, they may become available as made-to-order with a brief crafting period.',
  },
  {
    id: 'prod-4',
    category: 'Products',
    question: 'How do I care for my clay pieces?',
    answer:
      'Our pieces are coated with a protective glaze and are resistant to light splashes. However, do not submerge them in water, wear hairpins in the shower, or use harsh abrasive cleaners. To clean, simply wipe gently with a soft, damp cloth.',
  },

  // ORDERS
  {
    id: 'ord-1',
    category: 'Orders',
    question: 'Can I order directly from the website?',
    answer:
      'Yes! You can browse our full catalog, select your favorite variants, add pieces to your bag, and complete guest checkout directly on the website.',
  },
  {
    id: 'ord-2',
    category: 'Orders',
    question: 'Can I order multiple products in a single order?',
    answer:
      'Yes, you can combine ready-made charms, made-to-order items, and different variants into one order. We will package your entire order carefully together.',
  },
  {
    id: 'ord-3',
    category: 'Orders',
    question: 'Do I need to create an account to order?',
    answer:
      'No account creation is required. Guest checkout is our default so you can complete your purchase smoothly without unnecessary passwords or forms.',
  },

  // CUSTOM
  {
    id: 'cst-1',
    category: 'Custom',
    question: 'Do you accept custom commission orders?',
    answer:
      'Yes, custom creations are one of our favorite things to make. You can tell us what you want sculpted through our dedicated Custom Request page (/custom/request).',
  },
  {
    id: 'cst-2',
    category: 'Custom',
    question: 'How does a custom order work?',
    answer:
      'First, submit your idea and reference photos through our form. We will review feasibility within 24–48 hours and send you a custom quote. Once you review and approve the design and price, payment is completed and production begins.',
  },
  {
    id: 'cst-3',
    category: 'Custom',
    question: 'Can I upload reference photos or sketches?',
    answer:
      'Yes. Our custom request form supports uploading multiple reference images (photos, doodles, screenshots, color swatches) up to 10MB each.',
  },
  {
    id: 'cst-4',
    category: 'Custom',
    question: 'How long do custom orders take to make?',
    answer:
      'Custom pieces typically take around 25 days of dedicated production time in our studio to sculpt, cure, glaze, and assemble. Shipping transit time (~4 days across India) is additional.',
  },

  // SHIPPING
  {
    id: 'shp-1',
    category: 'Shipping',
    question: 'Do you ship across India?',
    answer:
      'Yes, we ship to pincodes across India from our Bangalore studio using reliable domestic courier partners including India Post and DTDC.',
  },
  {
    id: 'shp-2',
    category: 'Shipping',
    question: 'How long does shipping transit take?',
    answer:
      'Once your parcel is dispatched from our Bangalore studio, domestic shipping transit typically takes around 4 business days.',
  },
  {
    id: 'shp-3',
    category: 'Shipping',
    question: 'When is shipping free?',
    answer:
      'All orders totaling ₹500 or more qualify for FREE domestic shipping across India. For orders below ₹500, a standard shipping fee of ₹60 applies.',
  },
  {
    id: 'shp-4',
    category: 'Shipping',
    question: 'How does made-to-order timing differ from ready-made?',
    answer:
      'Ready-made pieces are in stock and ship quickly (~4 days transit). Made-to-order pieces require a crafting window (typically 3–5 days) before the ~4-day shipping transit begins.',
  },

  // PAYMENT
  {
    id: 'pay-1',
    category: 'Payment',
    question: 'What payment methods do you support?',
    answer:
      'We support UPI (Google Pay, PhonePe, Paytm, BHIM, CRED) and major Debit/Credit Cards (Visa, Mastercard, RuPay) via secure 256-bit encrypted gateway. Cash on Delivery (COD) is not offered.',
  },
];
