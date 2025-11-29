const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ field: string; message: string }>;
}

// Error handling
export class ApiError extends Error {
    public statusCode: number;
    public errors?: Array<{ field: string; message: string }>;

    constructor(
        message: string,
        statusCode: number,
        errors?: Array<{ field: string; message: string }>
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

// Helper function to make API requests
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as any),
    };

    // Add authorization header if token exists
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || 'An error occurred',
                response.status,
                data.errors
            );
        }

        return data.data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Network error', 0);
    }
}

// API methods
export const api = {
    // Auth endpoints
    auth: {
        register: (data: { email: string; password: string; role: string }) =>
            request<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        login: (data: { email: string; password: string }) =>
            request<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        // Deprecated - use wallet linking flow instead
        getNonce: (address: string) =>
            request<{ nonce: string; message: string }>(`/auth/nonce/${address}`),

        verifySignature: (data: { message: string; signature: string }) =>
            request<{ user: any; accessToken: string; refreshToken: string }>('/auth/verify-signature', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        // Generate a nonce for wallet linking (protected endpoint)
        generateLinkingNonce: () =>
            request<{ nonce: string }>('/wallets/link/nonce', {
                method: 'POST',
            }),

        // Link wallet to the authenticated user
        linkWallet: (data: { message: string; signature: string }) =>
            request<{ user: any }>('/wallets/link', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        refreshToken: (refreshToken: string) =>
            request<{ accessToken: string }>('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            }),

        logout: (refreshToken: string) =>
            request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            }),

        getCurrentUser: () =>
            request<{ user: any }>('/auth/me'),
    },

    // Company endpoints
    companies: {
        getAll: (params?: { status?: string; page?: number; limit?: number }) => {
            const query = new URLSearchParams();
            if (params?.status) query.append('status', params.status);
            if (params?.page) query.append('page', params.page.toString());
            if (params?.limit) query.append('limit', params.limit.toString());

            const queryString = query.toString();
            return request<{ companies: any[]; pagination: any }>(
                `/companies${queryString ? `?${queryString}` : ''}`
            );
        },

        getById: (id: string) =>
            request<{ company: any }>(`/companies/${id}`),

        getMyCompany: () =>
            request<{ company: any }>('/companies/me/profile'),

        create: (data: any) =>
            request<{ company: any }>('/companies', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            request<{ company: any }>(`/companies/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            request(`/companies/${id}`, {
                method: 'DELETE',
            }),

        verify: (id: string, status: 'VERIFIED' | 'REJECTED') =>
            request<{ company: any }>(`/companies/${id}/verify`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            }),

        linkWallet: (id: string, walletAddress: string) =>
            request<{ company: any }>(`/companies/${id}/link-wallet`, {
                method: 'POST',
                body: JSON.stringify({ walletAddress }),
            }),
    },

    // Carbon Credits endpoints
    credits: {
        getAll: (params?: { type?: string; location?: string; minPrice?: number; maxPrice?: number; minScore?: number; limit?: number }) => {
            const queryParams = new URLSearchParams();
            if (params?.type) queryParams.append('type', params.type);
            if (params?.location) queryParams.append('location', params.location);
            if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
            if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
            if (params?.minScore) queryParams.append('minScore', params.minScore.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const queryString = queryParams.toString();
            return request<any[]>(
                `/credits${queryString ? `?${queryString}` : ''}`
            );
        },

        getById: (id: string) =>
            request<any>(`/credits/${id}`),

        create: (data: any) =>
            request<{ data: any }>('/credits', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            request<{ data: any }>(`/credits/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            request(`/credits/${id}`, {
                method: 'DELETE',
            }),
    },

    // Wallets endpoints
    wallets: {
        getAll: (params?: { status?: string; minScore?: number; limit?: number }) => {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.minScore) queryParams.append('minScore', params.minScore.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const queryString = queryParams.toString();
            return request<any[]>(
                `/wallets${queryString ? `?${queryString}` : ''}`
            );
        },

        getByAddress: (address: string) =>
            request<any>(`/wallets/${address}`),
    },

    // Proposals endpoints
    proposals: {
        getAll: (params?: { status?: string }) => {
            const query = new URLSearchParams();
            if (params?.status) query.append('status', params.status);

            const queryString = query.toString();
            return request<any[]>(
                `/proposals${queryString ? `?${queryString}` : ''}`
            );
        },

        getById: (id: string) =>
            request<any>(`/proposals/${id}`),
    },

    // Smart contract endpoints
    contracts: {
        getBalance: (address: string) =>
            request<{ address: string; balance: string }>(`/contracts/balance/${address}`),

        getProjectDetails: (id: number) =>
            request<{ project: any }>(`/contracts/project/${id}`),

        verifyTransaction: (txHash: string) =>
            request<{ verified: boolean; confirmations?: number }>('/contracts/verify-transaction', {
                method: 'POST',
                body: JSON.stringify({ txHash }),
            }),

        getEvents: () =>
            request<{ events: any[] }>('/contracts/events'),
    },

    // Market endpoints
    market: {
        getListings: () =>
            request<any[]>('/market'),

        create: (data: any) =>
            request<{ data: any }>('/market', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },
};

// Token management helpers
export const tokenManager = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),

    setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    setUser: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};
