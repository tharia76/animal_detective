import { Asset } from 'expo-asset';
import { InteractionManager, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackgroundLoadingQueue {
  videos: any[];
  images: any[];
  priority: 'low' | 'medium' | 'high';
  loaded: boolean;
}

class BackgroundAssetManager {
  private loadingQueue: BackgroundLoadingQueue[] = [];
  private isLoading = false;
  private appState: AppStateStatus = 'active';
  private loadedAssets = new Set<string>();
  private failedAssets = new Set<string>();
  
  constructor() {
    this.setupAppStateListener();
    this.loadCachedProgress();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      this.appState = nextAppState;
      
      // Pause background loading when app is not active
      if (nextAppState !== 'active') {
        console.log('📱 App backgrounded, pausing asset loading');
        this.isLoading = false;
      } else {
        console.log('📱 App foregrounded, resuming asset loading');
        this.resumeBackgroundLoading();
      }
    });
  }

  private async loadCachedProgress() {
    try {
      const cached = await AsyncStorage.getItem('backgroundLoadingProgress');
      if (cached) {
        const data = JSON.parse(cached);
        this.loadedAssets = new Set(data.loadedAssets || []);
        this.failedAssets = new Set(data.failedAssets || []);
        console.log(`📦 Loaded cache: ${this.loadedAssets.size} assets loaded, ${this.failedAssets.size} failed`);
      }
    } catch (error) {
      console.warn('Failed to load background loading progress:', error);
    }
  }

  private async saveCachedProgress() {
    try {
      await AsyncStorage.setItem('backgroundLoadingProgress', JSON.stringify({
        loadedAssets: Array.from(this.loadedAssets),
        failedAssets: Array.from(this.failedAssets),
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save background loading progress:', error);
    }
  }

  // Add assets to background loading queue
  queueAssets(
    videos: any[], 
    images: any[], 
    priority: 'low' | 'medium' | 'high' = 'low'
  ) {
    this.loadingQueue.push({
      videos,
      images,
      priority,
      loaded: false
    });

    // Sort queue by priority
    this.loadingQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log(`📋 Queued ${videos.length} videos and ${images.length} images with ${priority} priority`);
    
    // Start processing if not already loading
    if (!this.isLoading && this.appState === 'active') {
      this.startBackgroundLoading();
    }
  }

  private async startBackgroundLoading() {
    if (this.isLoading || this.loadingQueue.length === 0) return;
    
    this.isLoading = true;
    console.log('🔄 Starting background asset loading...');

    // Use InteractionManager to ensure UI responsiveness
    InteractionManager.runAfterInteractions(() => {
      this.processQueue();
    });
  }

  private async processQueue() {
    while (this.loadingQueue.length > 0 && this.appState === 'active') {
      const currentBatch = this.loadingQueue.shift();
      if (!currentBatch || currentBatch.loaded) continue;

      console.log(`🎯 Processing ${currentBatch.priority} priority batch...`);

      // Load videos first (typically larger)
      await this.loadAssetBatch(currentBatch.videos, 'video');
      
      // Brief pause to prevent UI blocking
      await this.idleWait(100);
      
      // Load images
      await this.loadAssetBatch(currentBatch.images, 'image');
      
      currentBatch.loaded = true;
      
      // Longer pause between batches
      await this.idleWait(500);
    }

    this.isLoading = false;
    await this.saveCachedProgress();
    console.log('✅ Background asset loading complete');
  }

  private async loadAssetBatch(assets: any[], type: 'video' | 'image') {
    for (const asset of assets) {
      if (this.appState !== 'active') {
        console.log('⏸️ App not active, pausing background loading');
        return;
      }

      try {
        const assetModule = Asset.fromModule(asset);
        const assetKey = `${type}-${assetModule.name || 'unknown'}`;
        
        // Skip if already loaded or failed
        if (this.loadedAssets.has(assetKey) || this.failedAssets.has(assetKey)) {
          continue;
        }

        console.log(`📥 Background loading ${type}: ${assetKey}`);

        // Set timeout based on asset type
        const timeoutMs = type === 'video' ? 30000 : 10000;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Background load timeout')), timeoutMs);
        });

        await Promise.race([assetModule.downloadAsync(), timeoutPromise]);
        
        this.loadedAssets.add(assetKey);
        console.log(`✅ Background loaded: ${assetKey}`);

      } catch (error) {
        const assetKey = `${type}-unknown`;
        console.warn(`⚠️ Failed to background load ${assetKey}:`, error);
        this.failedAssets.add(assetKey);
      }

      // Small delay between individual assets
      await this.idleWait(50);
    }
  }

  private idleWait(ms: number): Promise<void> {
    return new Promise(resolve => {
      // Use requestIdleCallback equivalent for React Native
      InteractionManager.runAfterInteractions(() => {
        setTimeout(resolve, ms);
      });
    });
  }

  private resumeBackgroundLoading() {
    if (!this.isLoading && this.loadingQueue.length > 0) {
      this.startBackgroundLoading();
    }
  }

  // Get loading statistics
  getLoadingStats() {
    return {
      queuedBatches: this.loadingQueue.filter(b => !b.loaded).length,
      loadedAssets: this.loadedAssets.size,
      failedAssets: this.failedAssets.size,
      isLoading: this.isLoading,
      appState: this.appState
    };
  }

  // Clear failed assets (retry mechanism)
  retryFailedAssets() {
    const failedCount = this.failedAssets.size;
    this.failedAssets.clear();
    console.log(`🔄 Cleared ${failedCount} failed assets for retry`);
    this.resumeBackgroundLoading();
  }

  // Memory cleanup
  cleanup() {
    this.loadingQueue = [];
    this.isLoading = false;
    console.log('🧹 Background asset manager cleaned up');
  }
}

// Singleton instance
export const backgroundAssetManager = new BackgroundAssetManager();

// Convenience function to queue common asset types
export const queueLevelAssets = (levelName: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
  const levelVideos = [
    // Add level-specific videos based on level name
  ];

  const levelImages = [
    // Add level-specific images based on level name
  ];

  backgroundAssetManager.queueAssets(levelVideos, levelImages, priority);
};

export default BackgroundAssetManager;