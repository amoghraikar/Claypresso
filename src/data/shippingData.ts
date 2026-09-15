import { BUSINESS_RULES } from '@/types/product';

export interface ShippingTimelineStep {
  step: string;
  title: string;
  description: string;
  duration?: string;
  badge?: string;
}

export const SHIPPING_PARTNERS = ['India Post', 'DTDC Express'];

export const SHIPPING_TIERS = [
  {
    type: 'Ready-Made Accessories',
    description: 'In-stock pieces sculpted, glazed, and stored in our Bangalore studio.',
    productionTime: '0 Days (In stock)',
    shippingTransit: `~${BUSINESS_RULES.transitDaysReadyMade} business days`,
    totalTime: `~${BUSINESS_RULES.transitDaysReadyMade} days total`,
    badge: 'Ready to Ship',
  },
  {
    type: 'Made-to-Order Pieces',
    description: 'Sculpted fresh upon your order placement with personalized variant care.',
    productionTime: '3–5 business days crafting',
    shippingTransit: `~${BUSINESS_RULES.transitDaysReadyMade} business days`,
    totalTime: '~7–9 business days total',
    badge: 'Handmade on Order',
  },
  {
    type: 'Custom Commissions',
    description: 'One-of-a-kind designs sculpted from your photos, notes, and custom sketches.',
    productionTime: `~${BUSINESS_RULES.transitDaysCustom} business days production`,
    shippingTransit: `~${BUSINESS_RULES.transitDaysReadyMade} business days`,
    totalTime: '~29 business days total',
    badge: 'Bespoke Crafting',
  },
];

export const ORDER_MOVEMENT_STEPS: ShippingTimelineStep[] = [
  {
    step: '01',
    title: 'Order Placed',
    description: 'Your order details are confirmed. If items are in stock, they enter parcel packaging.',
    badge: 'Confirmed',
  },
  {
    step: '02',
    title: 'Studio Production',
    description: 'Applies to made-to-order (3–5 days) and custom commissions (~25 days). Shaped, baked, and glazed.',
    badge: 'Crafting',
  },
  {
    step: '03',
    title: 'Careful Padded Packaging',
    description: 'Secured in bubble-padded cushioning, tissue wrap, and sturdy boxes to protect every clay detail.',
    badge: 'Packing',
  },
  {
    step: '04',
    title: 'Dispatched Across India',
    description: 'Handed over to India Post or DTDC. Tracking link dispatched via SMS & WhatsApp (~4 days transit).',
    badge: 'In Transit',
  },
  {
    step: '05',
    title: 'Delivered to Your Doorstep',
    description: 'Your little handmade Claypresso pieces arrive safely to brighten your everyday accessories.',
    badge: 'Delivered',
  },
];
