import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';

export interface AssetLoadingProgress {
  phase: 'critical' | 'priority' | 'background' | 'complete';
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
  isComplete: boolean;
  criticalComplete: boolean;
  priorityComplete: boolean;
  estimatedTime: number;
}

// Asset priorities for optimal loading order
const CRITICAL_ASSETS = [
  // Essential UI - must load first for basic functionality
  require('../assets/images/game-logo.png'),
  require('../assets/images/menu-screen.png'),
  require('../assets/images/tap.png'),
  require('../assets/images/hand.png'),
];

const PRIORITY_ASSETS = [
  // Level backgrounds - load next for smooth transitions
  require('../assets/images/level-backgrounds/farm.webp'),
  require('../assets/images/level-backgrounds/forest.webp'),
  require('../assets/images/level-backgrounds/ocean.webp'),
  require('../assets/images/level-backgrounds/jungle.webp'),
  
  // Common UI elements
  require('../assets/images/settings.png'),
  require('../assets/images/congrats.png'),
  require('../assets/images/mission-completed.png'),
  
  // Most used animal silhouettes
  require('../assets/images/silhouettes/cat_silhouette.png'),
  require('../assets/images/silhouettes/dog_silhouette.png'),
  require('../assets/images/silhouettes/cow_silhouette.png'),
  require('../assets/images/silhouettes/chicken_silhouette.png'),
];

const BACKGROUND_ASSETS = [
  // Remaining level backgrounds
  require('../assets/images/level-backgrounds/arctic.webp'),
  require('../assets/images/level-backgrounds/desert.webp'),
  require('../assets/images/level-backgrounds/savannah.webp'),
  require('../assets/images/level-backgrounds/birds.webp'),
  require('../assets/images/level-backgrounds/insect.webp'),
  
  // Secondary UI elements
  require('../assets/images/congrats-bg.png'),
  require('../assets/images/discovered_number.png'),
  require('../assets/images/icon.png'),
  
  // Background elements
  require('../assets/images/level-backgrounds/leaves/leaf1.png'),
  require('../assets/images/level-backgrounds/leaves/leaf2.png'),
  require('../assets/images/level-backgrounds/leaves/leaf3.png'),
  
  // Interactive elements
  require('../assets/balloons/blue_balloon.png'),
  require('../assets/balloons/green_balloon.png'),
  require('../assets/balloons/orange_balloon.png'),
  require('../assets/balloons/pink_balloon.png'),
  require('../assets/elements/bubble.png'),
  
  // Additional animal silhouettes
  require('../assets/images/silhouettes/pig_silhouette.png'),
  require('../assets/images/silhouettes/horse_silhouette.png'),
  require('../assets/images/silhouettes/sheep_silhouette.png'),
  require('../assets/images/silhouettes/bear_silhouette.png'),
  require('../assets/images/silhouettes/fox_silhouette.png'),
  require('../assets/images/silhouettes/owl_silhouette.png'),
  require('../assets/images/silhouettes/elephant_silhouette.png'),
  require('../assets/images/silhouettes/giraffe_silhouette.png'),
  require('../assets/images/silhouettes/leon_silhouette.png'),
  require('../assets/images/silhouettes/btiger_silhouette.png'),
  require('../assets/images/silhouettes/dolphin_silhouette.png'),
  require('../assets/images/silhouettes/fish_silhouette.png'),
  require('../assets/images/silhouettes/eagle_silhouette.png'),
  require('../assets/images/silhouettes/butterfly_silhouette.png'),
];

class SmartAssetPreloader {
  private loadTimes: Map<string, number> = new Map();
  private failedAssets: Set<string> = new Set();
  private loadingStartTime: number = 0;
  
  constructor() {
    this.loadCachedMetrics();
  }

  private async loadCachedMetrics() {
    try {
      const cached = await AsyncStorage.getItem('assetLoadMetrics');
      if (cached) {
        const data = JSON.parse(cached);
        this.loadTimes = new Map(data.loadTimes || []);
        this.failedAssets = new Set(data.failedAssets || []);
      }
    } catch (error) {
      console.warn('Failed to load cached asset metrics:', error);
    }
  }

  private async saveCachedMetrics() {
    try {
      await AsyncStorage.setItem('assetLoadMetrics', JSON.stringify({
        loadTimes: Array.from(this.loadTimes.entries()),
        failedAssets: Array.from(this.failedAssets),
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save asset metrics:', error);
    }
  }

  private async loadAssetBatch(
    assets: any[], 
    batchSize: number = 3, 
    onProgress: (progress: AssetLoadingProgress) => void,
    phase: 'critical' | 'priority' | 'background'
  ): Promise<void> {
    const totalAssets = CRITICAL_ASSETS.length + PRIORITY_ASSETS.length + BACKGROUND_ASSETS.length;
    let loaded = 0;

    // Process assets in small batches to avoid overwhelming the system
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (asset, batchIndex) => {
        const globalIndex = i + batchIndex;
        const startTime = Date.now();
        
        try {
          const assetModule = Asset.fromModule(asset);
          const assetName = assetModule.name || `${phase}-${globalIndex}`;
          
          // Skip if this asset failed before and we have alternatives
          if (this.failedAssets.has(assetName)) {
            console.log(`⏭️ Skipping previously failed asset: ${assetName}`);
            return;
          }

          console.log(`📥 Loading ${phase} asset: ${assetName}`);
          
          // Use timeout for critical assets to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Asset load timeout')), 
              phase === 'critical' ? 5000 : phase === 'priority' ? 8000 : 12000);
          });

          await Promise.race([assetModule.downloadAsync(), timeoutPromise]);
          
          const loadTime = Date.now() - startTime;
          this.loadTimes.set(assetName, loadTime);
          
          loaded++;
          
          const progress: AssetLoadingProgress = {
            phase,
            loaded,
            total: totalAssets,
            percentage: Math.round((loaded / totalAssets) * 100),
            currentAsset: assetName,
            isComplete: loaded === totalAssets,
            criticalComplete: phase !== 'critical',
            priorityComplete: phase === 'background',
            estimatedTime: this.estimateRemainingTime(loaded, totalAssets)
          };
          
          onProgress(progress);
          console.log(`✅ Loaded ${phase} asset: ${assetName} (${loadTime}ms)`);
          
        } catch (error) {
          const assetName = `${phase}-${globalIndex}`;
          console.warn(`⚠️ Failed to load ${phase} asset ${assetName}:`, error);
          this.failedAssets.add(assetName);
          loaded++; // Still count to avoid hanging
        }
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < assets.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  private estimateRemainingTime(loaded: number, total: number): number {
    if (loaded === 0) return 0;
    
    const elapsed = Date.now() - this.loadingStartTime;
    const avgTimePerAsset = elapsed / loaded;
    const remaining = total - loaded;
    
    return Math.round((remaining * avgTimePerAsset) / 1000); // in seconds
  }

  async preloadAllAssets(onProgress: (progress: AssetLoadingProgress) => void): Promise<void> {
    this.loadingStartTime = Date.now();
    console.log('🚀 Starting intelligent asset preloading...');

    try {
      // Phase 1: Load critical assets first (blocking)
      console.log('📱 Phase 1: Loading critical assets...');
      await this.loadAssetBatch(CRITICAL_ASSETS, 2, onProgress, 'critical');
      
      // Allow UI to update
      await new Promise<void>(resolve => InteractionManager.runAfterInteractions(() => resolve(undefined)));
      
      // Phase 2: Load priority assets (high priority)
      console.log('🎯 Phase 2: Loading priority assets...');
      await this.loadAssetBatch(PRIORITY_ASSETS, 3, onProgress, 'priority');
      
      // Another UI update opportunity
      await new Promise<void>(resolve => InteractionManager.runAfterInteractions(() => resolve()));
      
      // Phase 3: Load background assets (low priority, non-blocking)
      console.log('🌄 Phase 3: Loading background assets...');
      await this.loadAssetBatch(BACKGROUND_ASSETS, 5, onProgress, 'background');
      
      // Save metrics for future optimizations
      await this.saveCachedMetrics();
      
      console.log('🎉 All asset preloading phases complete!');
      
    } catch (error) {
      console.error('❌ Asset preloading error:', error);
      throw error;
    }
  }

  // Progressive loading - load just enough to start the app
  async preloadEssentialAssets(onProgress: (progress: AssetLoadingProgress) => void): Promise<void> {
    console.log('⚡ Fast loading: Essential assets only...');
    await this.loadAssetBatch(CRITICAL_ASSETS, 2, onProgress, 'critical');
  }

  // Background loading for remaining assets
  async continueBackgroundLoading(onProgress: (progress: AssetLoadingProgress) => void): Promise<void> {
    console.log('🔄 Continuing background asset loading...');
    
    // Use requestIdleCallback equivalent for React Native
    const loadWhenIdle = () => {
      return new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(async () => {
          try {
            await this.loadAssetBatch(PRIORITY_ASSETS, 2, onProgress, 'priority');
            await this.loadAssetBatch(BACKGROUND_ASSETS, 3, onProgress, 'background');
            resolve();
          } catch (error) {
            console.warn('Background loading error:', error);
            resolve();
          }
        });
      });
    };

    await loadWhenIdle();
  }

  // Get assets for background loading
  getBackgroundAssets() {
    return {
      priority: PRIORITY_ASSETS,
      background: BACKGROUND_ASSETS
    };
  }

  // Memory management - cleanup unused assets
  cleanup() {
    this.loadTimes.clear();
    this.failedAssets.clear();
    console.log('🧹 Asset preloader cleaned up');
  }

  // Get loading recommendations based on previous performance
  getLoadingStrategy(): 'fast' | 'balanced' | 'thorough' {
    const avgLoadTime = Array.from(this.loadTimes.values()).reduce((a, b) => a + b, 0) / this.loadTimes.size;
    const failureRate = this.failedAssets.size / (this.loadTimes.size + this.failedAssets.size);
    
    if (avgLoadTime > 1000 || failureRate > 0.1) {
      return 'fast'; // Load only essentials, continue in background
    } else if (avgLoadTime > 500) {
      return 'balanced'; // Standard phased loading
    } else {
      return 'thorough'; // Load everything upfront
    }
  }
}

// Singleton instance
const assetPreloader = new SmartAssetPreloader();

export { assetPreloader };
export default SmartAssetPreloader;