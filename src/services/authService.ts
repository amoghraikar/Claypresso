import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { apiClient } from './apiClient';

const AUTH_STORAGE_KEY = 'claypresso_auth_session';

export const authService = {
  /**
   * Retrieves the current authenticated user session if available.
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Checks whether an active user session exists.
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  /**
   * Real backend authentication for customer login.
   */
  async login(credentials: LoginCredentials, remember: boolean = true): Promise<{ success: boolean; user?: User; error?: string }> {
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      return { success: false, error: 'Please enter your email and password.' };
    }

    try {
      const res = await apiClient.post<{ user: User }>('/api/auth/login', {
        email,
        password,
        remember,
      });

      if (res.success && res.data?.user) {
        const user = res.data.user;
        const serialized = JSON.stringify(user);
        if (remember) {
          localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
        }
        return { success: true, user };
      } else {
        return { success: false, error: res.error || 'Invalid email or password.' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Login request failed.' };
    }
  },

  /**
   * Real backend registration for customer sign-up.
   */
  async register(data: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone?.trim();

    if (!firstName || !email) {
      return { success: false, error: 'First name and email are required.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    try {
      const res = await apiClient.post<{ user: User }>('/api/auth/register', {
        firstName,
        lastName,
        email,
        password: data.password,
        phone,
      });

      if (res.success && res.data?.user) {
        const user = res.data.user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, error: res.error || 'Registration failed.' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration request failed.' };
    }
  },

  /**
   * Updates basic profile details with backend persistence.
   */
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    const current = this.getCurrentUser();
    if (!current) return null;

    try {
      const res = await apiClient.patch<User>('/api/auth/me', updates);
      if (res.success && res.data) {
        const updated = { ...current, ...res.data };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
    } catch {}

    const localUpdated: User = { ...current, ...updates };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUpdated));
      return localUpdated;
    } catch {
      return null;
    }
  },

  /**
   * Logs out the user without destroying the guest cart.
   */
  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await apiClient.post('/api/auth/logout');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  },

  /**
   * Password reset boundary: Never reveals whether an email exists.
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
      if (res.data?.message) {
        return { success: true, message: res.data.message };
      }
    } catch {}
    return {
      success: true,
      message: "If an account exists for that email, you'll receive instructions to reset your password.",
    };
  },
};
