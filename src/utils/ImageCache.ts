// Persistent image cache to prevent reloading between navigation
import { Image } from 'react-native';
import { Asset } from 'expo-asset';

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cachedImages: Map<string, any> = new Map();
  private preloadPromises: Map<string, Promise<void>> = new Map();

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  // Preload and cache an image
  async preloadImage(source: any, key?: string): Promise<void> {
    const cacheKey = key || this.getImageKey(source);
    
    // Return existing promise if already preloading
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey)!;
    }

    // Return immediately if already cached
    if (this.cachedImages.has(cacheKey)) {
      return Promise.resolve();
    }

    const preloadPromise = new Promise<void>((resolve, reject) => {
      // Handle require() sources (bundled images)
      if (typeof source === 'number') {
        // For require() sources, we just store them - they're already bundled
        this.cachedImages.set(cacheKey, source);
        resolve();
        return;
      }

      // Handle URI sources
      if (source?.uri) {
        Image.prefetch(source.uri)
          .then(() => {
            this.cachedImages.set(cacheKey, source);
            resolve();
          })
          .catch((error) => {
            console.warn(`Failed to preload image ${cacheKey}:`, error);
            // Still cache the source for fallback
            this.cachedImages.set(cacheKey, source);
            resolve(); // Don't reject, just continue
          });
        return;
      }

      // Fallback: just cache the source
      this.cachedImages.set(cacheKey, source);
      resolve();
    });

    this.preloadPromises.set(cacheKey, preloadPromise);
    
    try {
      await preloadPromise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  // Get cached image source
  getCachedImage(source: any, key?: string): any {
    const cacheKey = key || this.getImageKey(source);
    return this.cachedImages.get(cacheKey) || source;
  }

  // Check if image is cached
  isCached(source: any, key?: string): boolean {
    const cacheKey = key || this.getImageKey(source);
    return this.cachedImages.has(cacheKey);
  }

  // Preload multiple images in batch
  async preloadBatch(sources: Array<{ source: any, key?: string }>): Promise<void> {
    const promises = sources.map(({ source, key }) => 
      this.preloadImage(source, key).catch(() => {
        // Continue even if one fails
      })
    );
    
    await Promise.all(promises);
  }

  // Generate cache key from source
  private getImageKey(source: any): string {
    if (typeof source === 'number') {
      return `require_${source}`;
    }
    if (source?.uri) {
      return `uri_${source.uri}`;
    }
    return `source_${JSON.stringify(source)}`;
  }

  // Clear cache if needed (for memory management)
  clearCache(): void {
    this.cachedImages.clear();
    this.preloadPromises.clear();
  }

  // Get cache size for debugging
  getCacheSize(): number {
    return this.cachedImages.size;
  }
}

export const ImageCache = ImageCacheManager.getInstance();