import { Asset } from 'expo-asset';
import { Image } from 'react-native';

export interface AssetPreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
  isComplete: boolean;
}

// All critical game assets that should be preloaded
const CRITICAL_IMAGES = [
  // UI Images
  require('../assets/images/game-logo.png'),
  require('../assets/images/menu-screen.png'),
  require('../assets/images/settings.png'),
  require('../assets/images/congrats.png'),
  require('../assets/images/congrats-bg.png'),
  require('../assets/images/mission-completed.png'),
  require('../assets/images/discovered_number.png'),
  require('../assets/images/tap.png'),
  require('../assets/images/hand.png'),
  require('../assets/images/icon.png'),
  
  // Level backgrounds
  require('../assets/images/level-backgrounds/farm.png'),
  require('../assets/images/level-backgrounds/forest.png'),
  require('../assets/images/level-backgrounds/jungle.png'),
  require('../assets/images/level-backgrounds/ocean.png'),
  require('../assets/images/level-backgrounds/arctic.png'),
  require('../assets/images/level-backgrounds/desert.png'),
  require('../assets/images/level-backgrounds/savannah.png'),
  require('../assets/images/level-backgrounds/birds.png'),
  require('../assets/images/level-backgrounds/insect.png'),

  // Discover screen images
  require('../assets/images/discover/discover_bg.png'),
  
  // Background elements
  require('../assets/images/level-backgrounds/leaves/leaf1.png'),
  require('../assets/images/level-backgrounds/leaves/leaf2.png'),
  require('../assets/images/level-backgrounds/leaves/leaf3.png'),
  
  // Balloons
  require('../assets/balloons/blue_balloon.png'),
  require('../assets/balloons/green_balloon.png'),
  require('../assets/balloons/orange_balloon.png'),
  require('../assets/balloons/pink_balloon.png'),
  
  // Elements
  require('../assets/elements/bubble.png'),
];

// Key animal silhouettes (most commonly used)
const CRITICAL_SILHOUETTES = [
  require('../assets/images/silhouettes/cat_silhouette.png'),
  require('../assets/images/silhouettes/dog_silhouette.png'),
  require('../assets/images/silhouettes/cow_silhouette.png'),
  require('../assets/images/silhouettes/chicken_silhouette.png'),
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

// Preload all critical assets with progress tracking
export async function preloadAllAssets(onProgress?: (progress: AssetPreloadProgress) => void): Promise<void> {
  const allAssets = [...CRITICAL_IMAGES, ...CRITICAL_SILHOUETTES];
  const total = allAssets.length;
  let loaded = 0;

  console.log(`🎨 Starting to preload ${total} critical assets...`);

  const preloadPromises = allAssets.map(async (asset, index) => {
    try {
      const assetModule = Asset.fromModule(asset);
      const assetName = assetModule.name || `asset-${index}`;
      
      console.log(`📥 Loading asset: ${assetName}`);
      
      await assetModule.downloadAsync();
      loaded++;
      
      const progress: AssetPreloadProgress = {
        loaded,
        total,
        percentage: Math.round((loaded / total) * 100),
        currentAsset: assetName,
        isComplete: loaded === total
      };
      
      onProgress?.(progress);
      console.log(`✅ Loaded ${assetName} (${loaded}/${total})`);
    } catch (error) {
      console.warn(`⚠️ Failed to load asset ${index}:`, error);
      loaded++; // Still count as processed to avoid hanging
      
      const progress: AssetPreloadProgress = {
        loaded,
        total,
        percentage: Math.round((loaded / total) * 100),
        currentAsset: `asset-${index} (failed)`,
        isComplete: loaded === total
      };
      
      onProgress?.(progress);
    }
  });

  await Promise.all(preloadPromises);
  console.log(`🎉 Preloaded ${loaded}/${total} assets successfully!`);
}

// Legacy functions for backwards compatibility
export async function preloadImages(images: number[]) {
  const cacheImages = images.map(image => {
    const asset = Asset.fromModule(image);
    return asset.downloadAsync();
  });
  
  return Promise.all(cacheImages);
}

export async function prefetchImages(uris: string[]) {
  const prefetchPromises = uris.map(uri => Image.prefetch(uri));
  return Promise.all(prefetchPromises);
}
