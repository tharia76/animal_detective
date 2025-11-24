import { Platform } from 'react-native';

// API Base URL - Set this to your deployed API Gateway URL or Lambda Function URL
// Example API Gateway: https://abc123.execute-api.us-east-1.amazonaws.com/dev
// Example Function URL: https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000' // For local testing with serverless offline
  : process.env.EXPO_PUBLIC_API_URL || 'https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws';

interface ApiConfig {
  baseUrl: string;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: API_BASE_URL,
    };
  }

  /**
   * Update the API base URL (useful for environment switching)
   */
  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
  }

  /**
   * Get the current API base URL
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    return this.request('/health');
  }

  /**
   * Track analytics events
   */
  async trackAnalytics(events: Array<{
    userId?: string;
    deviceId?: string;
    eventType?: string;
    eventName: string;
    properties?: Record<string, any>;
    timestamp?: number;
    platform?: 'ios' | 'android' | 'web';
    appVersion?: string;
  }>): Promise<{ message: string; events: Array<{ eventId: string; status: string }> }> {
    return this.request('/analytics', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  }

  /**
   * Track a single game event
   */
  async trackGameEvent(data: {
    userId: string;
    eventType: 'level_started' | 'level_completed' | 'animal_discovered' | 'purchase' | 'app_launch';
    level?: string;
    animal?: string;
    score?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<{ message: string; event: { userId: string; eventType: string; timestamp: number } }> {
    return this.request('/game-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user data
   */
  async getUserData(userId: string): Promise<{
    userId: string;
    deviceId?: string;
    platform?: 'ios' | 'android' | 'web';
    createdAt: number;
    lastSeenAt: number;
    progress?: {
      unlockedLevels: string[];
      completedLevels: string[];
      totalAnimalsDiscovered: number;
      totalPlayTime: number;
    };
    preferences?: {
      soundEnabled: boolean;
      musicEnabled: boolean;
      language?: string;
    };
    purchases?: Array<{
      productId: string;
      transactionId: string;
      purchaseDate: number;
    }>;
  }> {
    return this.request(`/users/${userId}`);
  }

  /**
   * Update user data
   */
  async updateUserData(
    userId: string,
    data: {
      deviceId?: string;
      platform?: 'ios' | 'android' | 'web';
      progress?: {
        unlockedLevels: string[];
        completedLevels: string[];
        totalAnimalsDiscovered: number;
        totalPlayTime: number;
      };
      preferences?: {
        soundEnabled: boolean;
        musicEnabled: boolean;
        language?: string;
      };
      purchases?: Array<{
        productId: string;
        transactionId: string;
        purchaseDate: number;
      }>;
    }
  ): Promise<{ message: string; userId: string }> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Track level started
   */
  async trackLevelStarted(userId: string, level: string): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'level_started',
        level,
      });
    } catch (error) {
      console.warn('Failed to track level started:', error);
    }
  }

  /**
   * Track level completed
   */
  async trackLevelCompleted(
    userId: string,
    level: string,
    score?: number,
    duration?: number
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'level_completed',
        level,
        score,
        duration,
      });
    } catch (error) {
      console.warn('Failed to track level completed:', error);
    }
  }

  /**
   * Track animal discovered
   */
  async trackAnimalDiscovered(
    userId: string,
    animal: string,
    level: string
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'animal_discovered',
        animal,
        level,
      });
    } catch (error) {
      console.warn('Failed to track animal discovered:', error);
    }
  }

  /**
   * Track purchase
   */
  async trackPurchase(
    userId: string,
    productId: string,
    transactionId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'purchase',
        metadata: {
          productId,
          transactionId,
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track purchase:', error);
    }
  }

  /**
   * Track app launch
   */
  async trackAppLaunch(userId: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'app_launch',
        metadata: {
          platform: Platform.OS,
          app_version: metadata?.appVersion,
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track app launch:', error);
    }
  }

  /**
   * Track level started with detailed data
   */
  async trackLevelStartedDetailed(
    userId: string,
    level: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'level_started',
        level,
        metadata: {
          level_name: level,
          level_id: level.toLowerCase(),
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track level started:', error);
    }
  }

  /**
   * Track animal discovered with detailed data
   */
  async trackAnimalDiscoveredDetailed(
    userId: string,
    animal: string,
    level: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'animal_discovered',
        animal,
        level,
        metadata: {
          animal_name: animal,
          level_name: level,
          content_id: `${level}_${animal}`,
          content_type: 'animal',
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track animal discovered:', error);
    }
  }

  /**
   * Track level completed with detailed data
   */
  async trackLevelCompletedDetailed(
    userId: string,
    level: string,
    score?: number,
    duration?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'level_completed',
        level,
        score,
        duration,
        metadata: {
          level_name: level,
          level_id: level.toLowerCase(),
          content_id: level.toLowerCase(),
          content_type: 'level',
          value: score || 0,
          currency: 'USD',
          time_spent: duration,
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track level completed:', error);
    }
  }

  /**
   * Track purchase with detailed data
   */
  async trackPurchaseDetailed(
    userId: string,
    productId: string,
    transactionId: string,
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.trackGameEvent({
        userId,
        eventType: 'purchase',
        metadata: {
          productId,
          transactionId,
          amount,
          currency,
          content_id: productId,
          content_type: 'product',
          value: amount,
          ...metadata,
        },
      });
    } catch (error) {
      console.warn('Failed to track purchase:', error);
    }
  }

  /**
   * Start a new session
   */
  async startSession(data: {
    userId: string;
    sessionId?: string;
    platform?: 'ios' | 'android' | 'web';
    appVersion?: string;
  }): Promise<{ message: string; sessionId: string; startTime: number }> {
    return this.request('/sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * End a session
   */
  async endSession(data: {
    userId: string;
    sessionId: string;
  }): Promise<{ message: string; sessionId: string; duration: number; endTime: number }> {
    return this.request('/sessions/end', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Track animal click/interaction
   */
  async trackAnimalClick(data: {
    userId: string;
    animalName: string;
    level?: string;
    interactionType?: 'click' | 'discover' | 'drag';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.request('/animals/click', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to track animal click:', error);
    }
  }

  /**
   * Get daily downloads
   */
  async getDailyDownloads(date?: string): Promise<{
    date: string;
    downloads: number;
    users: Array<{
      userId: string;
      platform?: string;
      createdAt: number;
    }>;
  }> {
    const params = date ? `?date=${date}` : '';
    return this.request(`/analytics/daily-downloads${params}`);
  }

  /**
   * Get user retention stats
   */
  async getUserRetention(days: number = 7): Promise<{
    period: string;
    totalUsers: number;
    newUsers: number;
    returningUsers: number;
    activeUsers: number;
    retentionRate: string;
  }> {
    return this.request(`/analytics/retention?days=${days}`);
  }

  /**
   * Get animal interaction statistics
   */
  async getAnimalStats(days: number = 30): Promise<{
    period: string;
    totalInteractions: number;
    uniqueAnimals: number;
    animalStats: Array<{
      animalName: string;
      totalClicks: number;
      uniqueUsers: number;
      levels: string[];
    }>;
  }> {
    return this.request(`/analytics/animal-stats?days=${days}`);
  }
}

export default new ApiService();

