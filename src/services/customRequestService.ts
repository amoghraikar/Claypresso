import {
  CustomRequestPayload,
  CustomRequestFormValues,
} from '@/types/custom';
import { BUSINESS_RULES } from '@/types/product';
import { apiClient, ApiResponse } from './apiClient';

const CUSTOM_REQUESTS_KEY = 'claypresso_custom_requests';
const LATEST_CUSTOM_REQUEST_KEY = 'claypresso_latest_custom_request_id';

export const customRequestService = {
  /**
   * Posts custom request to real backend database.
   */
  async createRequestOnServer(form: CustomRequestFormValues): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/api/custom/orders', {
        customer: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        category: form.category,
        customCategoryDetails: form.customCategoryDetails,
        description: form.description,
        preferredColors: form.preferredColors,
        theme: form.theme,
        textToInclude: form.textToInclude,
        quantity: form.quantity,
        approximateSize: form.approximateSize,
        additionalInstructions: form.additionalInstructions,
        referenceImages: form.referenceImages,
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Builds an immutable CustomRequestPayload from form values.
   */
  buildRequestPayload(form: CustomRequestFormValues): CustomRequestPayload {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `CR-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `req_${timestamp}_${randomSuffix}`;

    return {
      id,
      referenceNumber,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      category: form.category,
      customCategoryDetails:
        form.category === 'Other' ? form.customCategoryDetails.trim() : undefined,
      description: form.description.trim(),
      preferredColors: form.preferredColors.trim() || undefined,
      theme: form.theme.trim() || undefined,
      textToInclude: form.textToInclude.trim() || undefined,
      quantity: Math.max(1, form.quantity || 1),
      approximateSize: form.approximateSize.trim() || undefined,
      additionalInstructions: form.additionalInstructions.trim() || undefined,
      referenceImages: form.referenceImages,
      status: 'NEW',
      quotedPrice: null, // Zero fake price: explicitly null until reviewed by Claypresso
      productionTime: `~${BUSINESS_RULES.transitDaysCustom} days handmade production`,
      transitDays: BUSINESS_RULES.transitDaysReadyMade,
    };
  },

  /**
   * Persists a custom request in client storage for review and success presentation.
   */
  saveRequest(payload: CustomRequestPayload): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getAllRequests();
      const updated = [payload, ...existing.filter((r) => r.id !== payload.id)];
      sessionStorage.setItem(CUSTOM_REQUESTS_KEY, JSON.stringify(updated));
      sessionStorage.setItem(LATEST_CUSTOM_REQUEST_KEY, payload.id);
    } catch {
      // Storage unavailable or full
    }
  },

  /**
   * Retrieves a request by its unique ID.
   */
  getRequestById(id: string): CustomRequestPayload | null {
    if (typeof window === 'undefined') return null;
    try {
      const requests = this.getAllRequests();
      return requests.find((r) => r.id === id || r.referenceNumber === id) || null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the most recently placed custom request ID.
   */
  getLatestRequestId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(LATEST_CUSTOM_REQUEST_KEY);
  },

  /**
   * Retrieves all requests from the active session.
   */
  getAllRequests(): CustomRequestPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(CUSTOM_REQUESTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
