/**
 * Claypresso Authoritative Shipping & Courier Logistics
 */

export interface ShippingCalculation {
  fee: number;
  isFree: boolean;
  transitNotice: string;
  currency: string;
  tier: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export const SHIPPING_CONFIG = {
  freeShippingThreshold: 500, // ₹500
  baseRates: {
    small: 60,   // Keychains, charms (under 100g)
    medium: 90,  // Trays, multi-packs (100g - 500g)
    large: 120,  // Large sets, bulk (> 500g)
  },
  transitDays: 4, // ~4 business days typical courier transit across India
  currency: '₹',
};

export const SUPPORTED_COURIERS = [
  {
    name: 'India Post',
    code: 'INDIA_POST',
    trackingUrlTemplate: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx',
  },
  {
    name: 'DTDC',
    code: 'DTDC',
    trackingUrlTemplate: 'https://www.dtdc.in/tracking/shipment-tracking.asp?trackingNo={TRACKING_NUMBER}',
  },
  {
    name: 'Blue Dart',
    code: 'BLUE_DART',
    trackingUrlTemplate: 'https://www.bluedart.com/tracking?track={TRACKING_NUMBER}',
  },
  {
    name: 'Delhivery',
    code: 'DELHIVERY',
    trackingUrlTemplate: 'https://www.delhivery.com/track/package/{TRACKING_NUMBER}',
  },
];

/**
 * Authoritatively calculates shipping fee on the server.
 * Never trust client-submitted shipping fee.
 */
export function calculateServerShipping(subtotal: number, totalWeightGrams = 50): ShippingCalculation {
  const isFree = subtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  let fee = 0;
  let tier: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL';

  if (!isFree) {
    if (totalWeightGrams > 500) {
      fee = SHIPPING_CONFIG.baseRates.large;
      tier = 'LARGE';
    } else if (totalWeightGrams > 100) {
      fee = SHIPPING_CONFIG.baseRates.medium;
      tier = 'MEDIUM';
    } else {
      fee = SHIPPING_CONFIG.baseRates.small;
      tier = 'SMALL';
    }
  }

  const transitNotice = `Standard courier delivery ~${SHIPPING_CONFIG.transitDays} working days across India`;

  return {
    fee,
    isFree,
    transitNotice,
    currency: SHIPPING_CONFIG.currency,
    tier,
  };
}

/**
 * Generates an official courier tracking web URL from courier name and tracking code.
 */
export function generateTrackingUrl(courierName: string, trackingNumber: string): string {
  if (!trackingNumber?.trim()) return '';

  const cleanNum = trackingNumber.trim();
  const courier = SUPPORTED_COURIERS.find(
    (c) => c.name.toLowerCase() === courierName?.toLowerCase() || c.code === courierName
  );

  if (courier && courier.trackingUrlTemplate.includes('{TRACKING_NUMBER}')) {
    return courier.trackingUrlTemplate.replace('{TRACKING_NUMBER}', encodeURIComponent(cleanNum));
  }

  if (courier) {
    return courier.trackingUrlTemplate;
  }

  // Generic fallback if courier is unrecognized
  return `https://www.google.com/search?q=${encodeURIComponent(`${courierName || 'Courier'} tracking ${cleanNum}`)}`;
}
