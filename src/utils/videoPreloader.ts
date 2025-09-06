import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';

export interface VideoPreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentVideo: string;
  isComplete: boolean;
  phase: 'critical' | 'priority' | 'background';
  estimatedTime: number;
}

// Priority-based video loading for optimal performance
const CRITICAL_VIDEOS = [
  // Essential videos that must load first
  require('../assets/intro_videos/splash.mp4'),
  // require('../assets/intro_videos/farm-vid1.mp4'), // Most common level
];

const PRIORITY_VIDEOS = [
  require('../assets/intro_videos/splash.mp4'),
  // Common level videos
  // require('../assets/intro_videos/forest.mp4'),
  // require('../assets/intro_videos/water.mp4'),
  // require('../assets/intro_videos/farm-vid2.mp4'),
];

const BACKGROUND_VIDEOS = [
  require('../assets/intro_videos/splash.mp4'),
  // Less frequently accessed videos
  // require('../assets/intro_videos/arctic-vid.mp4'),
  // require('../assets/intro_videos/desert-vid.mp4'),
  // require('../assets/intro_videos/birds-vid.mp4'),
  // require('../assets/intro_videos/insects-vid.mp4'),
  // require('../assets/intro_videos/jungless.mp4'),
  // require('../assets/intro_videos/savan-vid.mp4'),
];

class SmartVideoPreloader {
  private loadTimes: Map<string, number> = new Map();
  private failedVideos: Set<string> = new Set();
  private loadingStartTime: number = 0;

  constructor() {
    this.loadCachedMetrics();
  }

  private async loadCachedMetrics() {
    try {
      const cached = await AsyncStorage.getItem('videoLoadMetrics');
      if (cached) {
        const data = JSON.parse(cached);
        this.loadTimes = new Map(data.loadTimes || []);
        this.failedVideos = new Set(data.failedVideos || []);
      }
    } catch (error) {
      console.warn('Failed to load cached video metrics:', error);
    }
  }

  private async saveCachedMetrics() {
    try {
      await AsyncStorage.setItem('videoLoadMetrics', JSON.stringify({
        loadTimes: Array.from(this.loadTimes.entries()),
        failedVideos: Array.from(this.failedVideos),
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save video metrics:', error);
    }
  }

  private estimateRemainingTime(loaded: number, total: number): number {
    if (loaded === 0) return 0;
    
    const elapsed = Date.now() - this.loadingStartTime;
    const avgTimePerVideo = elapsed / loaded;
    const remaining = total - loaded;
    
    return Math.round((remaining * avgTimePerVideo) / 1000);
  }

  private async loadVideoBatch(
    videos: any[], 
    batchSize: number,
    onProgress: (progress: VideoPreloadProgress) => void,
    phase: 'critical' | 'priority' | 'background'
  ): Promise<number> {
    const totalVideos = CRITICAL_VIDEOS.length + PRIORITY_VIDEOS.length + BACKGROUND_VIDEOS.length;
    let loaded = 0;

    // Load videos in smaller batches to prevent memory issues
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (video, batchIndex) => {
        const globalIndex = i + batchIndex;
        const startTime = Date.now();
        
        try {
          const asset = Asset.fromModule(video);
          const videoName = asset.name || `${phase}-video-${globalIndex}`;
          
          // Skip previously failed videos
          if (this.failedVideos.has(videoName)) {
            console.log(`⏭️ Skipping previously failed video: ${videoName}`);
            return;
          }

          console.log(`🎬 Loading ${phase} video: ${videoName}`);
          
          // Timeout based on video priority and expected size
          const timeoutMs = phase === 'critical' ? 15000 : phase === 'priority' ? 25000 : 35000;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Video load timeout')), timeoutMs);
          });

          await Promise.race([asset.downloadAsync(), timeoutPromise]);
          
          const loadTime = Date.now() - startTime;
          this.loadTimes.set(videoName, loadTime);
          
          loaded++;
          
          const progress: VideoPreloadProgress = {
            loaded,
            total: totalVideos,
            percentage: Math.round((loaded / totalVideos) * 100),
            currentVideo: videoName,
            isComplete: loaded === totalVideos,
            phase,
            estimatedTime: this.estimateRemainingTime(loaded, totalVideos)
          };
          
          onProgress(progress);
          console.log(`✅ Video loaded: ${videoName} (${loadTime}ms)`);
          
        } catch (error) {
          const videoName = `${phase}-video-${globalIndex}`;
          console.warn(`⚠️ Failed to load ${phase} video ${videoName}:`, error);
          this.failedVideos.add(videoName);
          loaded++; // Count as processed
          
          const progress: VideoPreloadProgress = {
            loaded,
            total: totalVideos,
            percentage: Math.round((loaded / totalVideos) * 100),
            currentVideo: `${videoName} (failed)`,
            isComplete: loaded === totalVideos,
            phase,
            estimatedTime: this.estimateRemainingTime(loaded, totalVideos)
          };
          
          onProgress(progress);
        }
      });

      await Promise.all(batchPromises);
      
      // Brief pause between batches
      if (i + batchSize < videos.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return loaded;
  }

  async preloadEssentialVideos(onProgress: (progress: VideoPreloadProgress) => void): Promise<void> {
    this.loadingStartTime = Date.now();
    console.log('⚡ Fast loading: Essential videos only...');
    await this.loadVideoBatch(CRITICAL_VIDEOS, 1, onProgress, 'critical');
  }

  async preloadAllVideos(onProgress: (progress: VideoPreloadProgress) => void): Promise<void> {
    this.loadingStartTime = Date.now();
    console.log('🎬 Starting intelligent video preloading...');

    try {
      // Phase 1: Critical videos first
      console.log('🚨 Phase 1: Loading critical videos...');
      await this.loadVideoBatch(CRITICAL_VIDEOS, 1, onProgress, 'critical');
      
      // Allow UI breathing room
      await new Promise(resolve => InteractionManager.runAfterInteractions(() => resolve(undefined)));
      
      // Phase 2: Priority videos
      console.log('📽️ Phase 2: Loading priority videos...');
      await this.loadVideoBatch(PRIORITY_VIDEOS, 1, onProgress, 'priority');
      
      // UI update opportunity
      await new Promise(resolve => InteractionManager.runAfterInteractions(() => resolve(undefined)));
      
      // Phase 3: Background videos
      console.log('🎞️ Phase 3: Loading background videos...');
      await this.loadVideoBatch(BACKGROUND_VIDEOS, 2, onProgress, 'background');
      
      await this.saveCachedMetrics();
      console.log('🎉 All video preloading phases complete!');
      
    } catch (error) {
      console.error('❌ Video preloading error:', error);
      throw error;
    }
  }
}

// Singleton instance
const videoPreloader = new SmartVideoPreloader();

// Legacy function for backwards compatibility
export const preloadAllVideos = async (
  onProgress?: (progress: VideoPreloadProgress) => void
): Promise<void> => {
  if (onProgress) {
    await videoPreloader.preloadAllVideos(onProgress);
  } else {
    await videoPreloader.preloadAllVideos(() => {});
  }
};

export { videoPreloader };

export const getVideoAssetUri = (videoSource: any): string | null => {
  try {
    const asset = Asset.fromModule(videoSource);
    return asset.localUri || asset.uri;
  } catch (error) {
    console.error('❌ Failed to get video URI:', error);
    return null;
  }
};
