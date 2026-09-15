export type CustomRequestStatus =
  | 'NEW'
  | 'REVIEWING'
  | 'QUOTED'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CustomCategory =
  | 'Clay Charm'
  | 'Keychain'
  | 'Mini Phone Charm'
  | 'Magnet'
  | 'Tray'
  | 'Badge'
  | 'Hair Pin'
  | 'Other';

export const CUSTOM_CATEGORIES: { id: CustomCategory; label: string; icon: string; description: string }[] = [
  { id: 'Clay Charm', label: 'Clay Charm', icon: '✦', description: 'Small decorative charm for bags or zip pulls' },
  { id: 'Keychain', label: 'Keychain', icon: '🗝️', description: 'Durable handmade clay keyring accessory' },
  { id: 'Mini Phone Charm', label: 'Mini Phone Charm', icon: '📱', description: 'Beaded phone strap with custom clay centerpiece' },
  { id: 'Magnet', label: 'Magnet', icon: '🧲', description: 'Sculpted character or object fridge magnet' },
  { id: 'Tray', label: 'Trinket Tray', icon: '🥣', description: 'Sculpted dish for jewelry, keys, or desk items' },
  { id: 'Badge', label: 'Badge / Pin', icon: '📌', description: 'Wearable pin badge for tote bags or jackets' },
  { id: 'Hair Pin', label: 'Hair Pin', icon: '🌸', description: 'Clay hair clip or alligator pin' },
  { id: 'Other', label: 'Other Idea', icon: '💡', description: 'Something unique or experimental' },
];

export interface UploadedReferenceImage {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  type: string;
}

export interface CustomCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface CustomRequestPayload {
  id: string;
  referenceNumber: string;
  createdAt: string; // ISO 8601
  customer: CustomCustomerInfo;
  category: CustomCategory;
  customCategoryDetails?: string;
  description: string;
  preferredColors?: string;
  theme?: string;
  textToInclude?: string;
  quantity: number;
  approximateSize?: string;
  additionalInstructions?: string;
  referenceImages: UploadedReferenceImage[];
  status: CustomRequestStatus;
  quotedPrice: number | null; // null until Claypresso quotes
  productionTime: string; // e.g. "~25 days handmade"
  transitDays: number;
}

export interface CustomRequestFormValues {
  // Contact
  fullName: string;
  email: string;
  phone: string;

  // Category
  category: CustomCategory;
  customCategoryDetails: string;

  // Core Idea
  description: string;

  // Preferences (Optional)
  preferredColors: string;
  theme: string;
  textToInclude: string;
  quantity: number;
  approximateSize: string;
  additionalInstructions: string;

  // References
  referenceImages: UploadedReferenceImage[];
}

export type CustomRequestFormErrors = Partial<Record<keyof CustomRequestFormValues, string>>;
