/**
 * API Client for Pebble Sales Hub
 * 
 * Provides typed functions for all backend API endpoints with:
 * - Automatic token attachment from localStorage
 * - JSON request/response handling
 * - 401 response handling (redirect to login)
 * - Error message extraction
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        username: string;
        role: 'admin' | 'sales';
        commissionRate?: number;
        status: 'active' | 'inactive';
    };
}

export interface User {
    id: string;
    name: string;
    username: string;
    role: 'admin' | 'sales';
    commissionRate: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface Campaign {
    id: string;
    title: string;
    platform: 'facebook' | 'instagram';
    type: 'post' | 'event' | 'live';
    url: string;
    salesPersonId: string;
    salesPerson?: User;
    status: 'active' | 'paused' | 'completed';
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    name: string;
    qty: number;
    basePrice: number;
}

export interface Order {
    id: string;
    campaignId: string;
    campaign?: Campaign;
    products: Product[];
    orderTotal: number;
    snapshotRate: number;
    commissionAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignPayout {
    campaignId: string;
    title: string;
    orderCount: number;
    totalSales: number;
    totalCommission: number;
}

export interface MyPayoutResponse {
    year: number;
    month: number;
    totalCommission: number;
    campaigns: CampaignPayout[];
}

export interface SalesPersonPayout {
    userId: string;
    name: string;
    currentRate: number;
    totalCommission: number;
    campaigns: CampaignPayout[];
}

export interface TeamPayoutResponse {
    year: number;
    month: number;
    grandTotalCommission: number;
    salesPersons: SalesPersonPayout[];
}

// ============================================================================
// Token Management
// ============================================================================

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ============================================================================
// Core Fetch Wrapper
// ============================================================================

interface FetchOptions extends RequestInit {
    skipAuthRedirect?: boolean; // For login endpoint - don't redirect on 401
}

async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const token = getToken();
    const { skipAuthRedirect, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        // Handle 401 - skip redirect as AuthContext handles this
        if (response.status === 401) {
            // For login attempts (skipAuthRedirect=true), get actual error from backend
            if (skipAuthRedirect) {
                try {
                    const data = await response.json();
                    return data as ApiResponse<T>;
                } catch {
                    return {
                        success: false,
                        error: {
                            code: 'UNAUTHORIZED',
                            message: 'Invalid credentials',
                        },
                    };
                }
            }
            // For other 401s, clear token and show session expired
            clearToken();
            return {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Session expired. Please login again.',
                },
            };
        }

        const data = await response.json();
        return data as ApiResponse<T>;
    } catch (error) {
        // Network error or JSON parse error
        return {
            success: false,
            error: {
                code: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : 'Network error occurred',
            },
        };
    }
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
    login: (username: string, password: string) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            skipAuthRedirect: true, // Don't redirect on wrong credentials
        }),

    me: () => apiFetch<{ user: LoginResponse['user'] }>('/auth/me', {
        skipAuthRedirect: true, // Don't clear token on 401 - let AuthContext handle it
    }),

    logout: () =>
        apiFetch<void>('/auth/logout', {
            method: 'POST',
        }),
};

// ============================================================================
// Users API (Admin only)
// ============================================================================

export interface CreateUserData {
    name: string;
    username: string;
    password: string;
    role: 'admin' | 'sales';
    commissionRate?: number;
    status?: 'active' | 'inactive';
}

export interface UpdateUserData {
    name?: string;
    username?: string;
    password?: string;
    role?: 'admin' | 'sales';
    commissionRate?: number;
    status?: 'active' | 'inactive';
}

export const usersApi = {
    list: () => apiFetch<User[]>('/users'),

    get: (id: string) => apiFetch<User>(`/users/${id}`),

    create: (data: CreateUserData) =>
        apiFetch<User>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateUserData) =>
        apiFetch<User>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiFetch<void>(`/users/${id}`, {
            method: 'DELETE',
        }),
};

// ============================================================================
// Campaigns API
// ============================================================================

export interface CreateCampaignData {
    title: string;
    platform: 'facebook' | 'instagram';
    type: 'post' | 'event' | 'live';
    url: string;
    salesPersonId: string;
    startDate?: string;
}

export interface UpdateCampaignData {
    title?: string;
    platform?: 'facebook' | 'instagram';
    type?: 'post' | 'event' | 'live';
    url?: string;
    status?: 'active' | 'paused' | 'completed';
    startDate?: string | null;
    endDate?: string | null;
    // Note: salesPersonId is IMMUTABLE after creation
}

export const campaignsApi = {
    list: () => apiFetch<Campaign[]>('/campaigns'),

    get: (id: string) => apiFetch<Campaign>(`/campaigns/${id}`),

    create: (data: CreateCampaignData) =>
        apiFetch<Campaign>('/campaigns', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateCampaignData) =>
        apiFetch<Campaign>(`/campaigns/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiFetch<void>(`/campaigns/${id}`, {
            method: 'DELETE',
        }),
};

// ============================================================================
// Orders API
// ============================================================================

export interface OrderFilters {
    campaignId?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
}

export interface CreateOrderData {
    campaignId: string;
    products: Product[];
}

export interface UpdateOrderData {
    products: Product[];
    // Note: campaignId is IMMUTABLE after creation
}

export const ordersApi = {
    list: (filters?: OrderFilters) => {
        const params = new URLSearchParams();
        if (filters?.campaignId) params.set('campaignId', filters.campaignId);
        if (filters?.startDate) params.set('startDate', filters.startDate);
        if (filters?.endDate) params.set('endDate', filters.endDate);
        const query = params.toString();
        return apiFetch<Order[]>(`/orders${query ? `?${query}` : ''}`);
    },

    get: (id: string) => apiFetch<Order>(`/orders/${id}`),

    create: (data: CreateOrderData) =>
        apiFetch<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateOrderData) =>
        apiFetch<Order>(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiFetch<void>(`/orders/${id}`, {
            method: 'DELETE',
        }),
};

// ============================================================================
// Payouts API
// ============================================================================

export const payoutsApi = {
    me: (year: number, month: number) =>
        apiFetch<MyPayoutResponse>(`/payouts/me?year=${year}&month=${month}`),

    team: (year: number, month: number) =>
        apiFetch<TeamPayoutResponse>(`/payouts/team?year=${year}&month=${month}`),
};

// ============================================================================
// Helper to extract error message
// ============================================================================

export function getErrorMessage(response: ApiResponse<unknown>): string {
    if (response.success) return '';
    return response.error?.message || 'An unexpected error occurred';
}
