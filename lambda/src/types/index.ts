export interface ApiResponse<T = any> {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': boolean;
  };
  body: string;
}

export interface UserData {
  userId: string;
  deviceId?: string;
  platform?: 'ios' | 'android' | 'web';
  createdAt: number;
  lastSeenAt: number;
  firstSeenAt?: number; // For retention tracking
  sessionCount?: number; // Total number of sessions
  totalPlayTime?: number; // Total play time in seconds
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
  purchases?: {
    productId: string;
    transactionId: string;
    purchaseDate: number;
  }[];
}

export interface AnalyticsEvent {
  eventId: string;
  userId?: string;
  deviceId?: string;
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  timestamp: number;
  platform?: 'ios' | 'android' | 'web';
  appVersion?: string;
  ttl?: number; // For DynamoDB TTL (expires after 90 days)
}

export interface GameEvent {
  userId: string;
  timestamp: number;
  eventType: 'level_started' | 'level_completed' | 'animal_discovered' | 'purchase' | 'app_launch';
  level?: string;
  animal?: string;
  score?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface Session {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in seconds
  startDate: string; // YYYY-MM-DD format for querying
  platform?: 'ios' | 'android' | 'web';
  appVersion?: string;
}

export interface AnimalInteraction {
  interactionId: string;
  userId: string;
  animalName: string;
  level?: string;
  timestamp: number;
  date: string; // YYYY-MM-DD format for querying
  interactionType?: 'click' | 'discover' | 'drag';
  metadata?: Record<string, any>;
}

export interface LambdaEvent {
  httpMethod?: string;
  path?: string;
  pathParameters?: {
    userId?: string;
  };
  queryStringParameters?: Record<string, string>;
  body?: string;
  headers?: Record<string, string>;
}
