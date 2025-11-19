/**
 * Zaminat Backend API Client
 * 
 * This client provides a type-safe interface to communicate with the Zaminat backend API.
 * All requests are authenticated using JWT tokens stored in localStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  requiresOtp?: boolean;
}

// Type aliases for API responses
type ApiData = Record<string, unknown>;
type ApiDataArray = Record<string, unknown>[];

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  private setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token refresh on 401
      if (response.status === 401 && this.token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.statusText}`);
          }
          return retryResponse.json();
        }
      }

      if (!response.ok) {
        // Don't throw error for 401/403 - let the calling code handle it
        if (response.status === 401 || response.status === 403) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || `API Error: ${response.statusText}`);
        }
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error: unknown) {
      // Only log non-network errors
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('Failed to fetch')) {
        console.error('API Request failed:', error);
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null;

    if (!refreshToken) {
      this.clearToken();
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearToken();
    return false;
  }

  // Authentication
  async register(data: {
    email?: string;
    phone?: string;
    password?: string;
    firstName: string;
    lastName: string;
    district?: string;
    school?: string;
    mahalla?: string;
  }) {
    const response = await this.request<ApiData & { accessToken?: string; refreshToken?: string; user?: ApiData; requiresOtp?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
      if (response.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    }

    return response;
  }

  async login(data: { email?: string; phone?: string; password?: string; otp?: string }) {
    const response = await this.request<ApiData & { accessToken?: string; refreshToken?: string; user?: ApiData; requiresOtp?: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
      if (response.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    }

    return response;
  }

  async verifyOtp(phone: string, otp: string) {
    const response = await this.request<ApiData & { accessToken?: string; refreshToken?: string; user?: ApiData }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    if (response.accessToken) {
      this.setToken(response.accessToken);
      if (response.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<ApiData>('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Projects
  async getProjects(status?: string, sortBy?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (sortBy) query.append('sortBy', sortBy);
    const queryString = query.toString();
    return this.request<ApiDataArray>(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getProject(id: string) {
    return this.request<ApiData>(`/projects/${id}`);
  }

  async getProjectResults(id: string) {
    return this.request<ApiData>(`/projects/${id}/results`);
  }

  async voteForProject(projectId: string) {
    return this.request<ApiData>(`/projects/${projectId}/vote`, {
      method: 'POST',
    });
  }

  async donateToProject(projectId: string, amount: number, currency: string, paymentProvider?: string) {
    return this.request<ApiData>(`/projects/${projectId}/donate`, {
      method: 'POST',
      body: JSON.stringify({ amount, currency, paymentProvider }),
    });
  }

  // Users
  async getUserProfile() {
    return this.request<ApiData>('/users/me');
  }

  async updateUserProfile(data: Record<string, unknown>) {
    return this.request<ApiData>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(userId: string) {
    return this.request<ApiData>(`/users/${userId}/stats`);
  }

  // Events
  async getEvents(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<ApiDataArray>(`/events${query}`);
  }

  async getEvent(id: string) {
    return this.request<ApiData>(`/events/${id}`);
  }

  async joinEvent(eventId: string) {
    return this.request<ApiData>(`/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  // Locations
  async getLocations(filters?: { type?: string; eventType?: string; district?: string }) {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return this.request<ApiDataArray>(`/locations${query ? `?${query}` : ''}`);
  }

  async getLocation(id: string) {
    return this.request<ApiData>(`/locations/${id}`);
  }

  async getNearbyLocations(lat: number, lng: number, radius?: number) {
    const query = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() }),
    }).toString();
    return this.request<ApiDataArray>(`/locations/nearby?${query}`);
  }

  // Collections
  async getCollectionPoints(filters?: { materialType?: string; district?: string; status?: string; limit?: number }) {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return this.request<ApiDataArray>(`/collection-points${query ? `?${query}` : ''}`);
  }

  async getCollectionPoint(id: string) {
    return this.request<ApiData>(`/collection-points/${id}`);
  }

  async createCollection(data: { collectionPointId: string; materialType: string; weightKg: number; photoUrl?: string }) {
    return this.request<ApiData>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserCollections(userId: string) {
    return this.request<ApiDataArray>(`/collections/user/${userId}`);
  }

  // Waste Logs
  async createWasteLog(data: { weightKg: number; category: string; location?: string; photoURL?: string; date?: string }) {
    return this.request<ApiData>('/waste-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserWasteLogs(userId?: string, filters?: { status?: string; category?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.category) query.append('category', filters.category);
    if (filters?.limit) query.append('limit', filters.limit.toString());
    if (filters?.offset) query.append('offset', filters.offset.toString());
    const queryString = query.toString();
    const endpoint = userId ? `/waste-logs/user/${userId}` : '/waste-logs/me';
    return this.request<ApiDataArray>(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  async getWasteLogStats(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request<ApiData>(`/waste-logs/stats${query}`);
  }

  async getWasteLog(id: string) {
    return this.request<ApiData>(`/waste-logs/${id}`);
  }

  async deleteWasteLog(id: string) {
    return this.request<ApiData>(`/waste-logs/${id}`, {
      method: 'DELETE',
    });
  }

  // News & Content
  async getNews(filters?: { limit?: number; offset?: number; search?: string }) {
    const query = new URLSearchParams();
    if (filters?.limit) query.append('limit', filters.limit.toString());
    if (filters?.offset) query.append('offset', filters.offset.toString());
    if (filters?.search) query.append('search', filters.search);
    const queryString = query.toString();
    return this.request<ApiDataArray>(`/news${queryString ? `?${queryString}` : ''}`);
  }

  async getNewsArticle(slug: string) {
    return this.request<ApiData>(`/news/${slug}`);
  }

  // Shop
  async getProducts(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<ApiDataArray>(`/shop/products${query}`);
  }

  async getProduct(id: string) {
    return this.request<ApiData>(`/shop/products/${id}`);
  }

  async createOrder(data: { items: Array<{ productId: string; quantity: number }>; shippingAddress: Record<string, unknown> }) {
    return this.request<ApiData>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(id: string) {
    return this.request<ApiData>(`/orders/${id}`);
  }

  // Stories
  async getStories(category?: string, type?: string, language?: string, search?: string) {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (type) query.append('type', type);
    if (language) query.append('language', language);
    if (search) query.append('search', search);
    const queryString = query.toString();
    return this.request<ApiDataArray>(`/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getStory(slug: string) {
    return this.request<ApiData>(`/posts/${slug}`);
  }

  async reactToPost(postId: string, reactionType: string) {
    return this.request<ApiData>(`/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async commentOnPost(postId: string, content: string) {
    return this.request<ApiData>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Leaderboard
  async getLeaderboard(period?: string, limit?: number) {
    const query = new URLSearchParams({
      ...(period && { period }),
      ...(limit && { limit: limit.toString() }),
    }).toString();
    return this.request<ApiDataArray>(`/leaderboard${query ? `?${query}` : ''}`);
  }

  // Achievements
  async getAchievements() {
    return this.request<ApiDataArray>('/achievements');
  }

  async getUserAchievements(userId: string) {
    return this.request<ApiDataArray>(`/users/${userId}/achievements`);
  }

  // Rewards
  async getRewards() {
    return this.request<ApiDataArray>('/rewards');
  }

  async redeemReward(rewardId: string) {
    return this.request<ApiData>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications(page?: number, limit?: number) {
    const query = new URLSearchParams({
      ...(page && { page: page.toString() }),
      ...(limit && { limit: limit.toString() }),
    }).toString();
    return this.request<ApiDataArray>(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationsRead(notificationIds?: string[]) {
    return this.request<ApiData>('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationIds }),
    });
  }

  // Impact Stats
  async getImpactStats() {
    return this.request<ApiData>('/impact/stats');
  }

  // Search
  async search(query: string) {
    return this.request<ApiData>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/upload/image`;
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse };
