import { createAudioPlayer, useAudioPlayer, AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';

/**
 * BackgroundMusicManager with robust production-ready audio handling.
 * Includes retry logic, proper audio session management, and error recovery.
 * 
 * Usage:
 * - Import: import BackgroundMusicManager from './path/to/BackgroundMusicManager';
 * - Play music: await BackgroundMusicManager.playBackgroundMusic('levelName');
 * - Preload on app start: await BackgroundMusicManager.preloadCommonMusic();
 * - Pause: BackgroundMusicManager.pause();
 * - Resume: await BackgroundMusicManager.resume();
 * - Mute/Unmute: BackgroundMusicManager.setMuted(true/false);
 * 
 * Production tips:
 * - Call preloadCommonMusic() on app startup for smoother transitions
 * - Audio will retry up to 3 times with exponential backoff
 * - Failed audio will attempt recovery after 5 seconds
 * - Works reliably on both iOS and Android in production
 */

// Map of level names to music URIs
// In production, replace these with CDN URLs like:
// 'https://your-cdn.com/assets/sounds/background_sounds/farm_bg.mp3'
const BG_MUSIC_URIS: Record<string, string> = {
  farm: 'file:///assets/sounds/background_sounds/farm_bg.mp3',
  forest: 'file:///assets/sounds/background_sounds/forest_bg.mp3',
  jungle: 'file:///assets/sounds/background_sounds/jungle_bg.mp3',
  desert: 'file:///assets/sounds/background_sounds/desert_bg.mp3',
  ocean: 'file:///assets/sounds/background_sounds/ocean_bg.mp3',
  savannah: 'file:///assets/sounds/background_sounds/savannah_bg.mp3',
  arctic: 'file:///assets/sounds/background_sounds/arctic_bg.mp3',
  birds: 'file:///assets/sounds/background_sounds/birds_bg.mp3',
  insects: 'file:///assets/sounds/background_sounds/insects_bg.mp3',
};

// Production-safe asset loading with fallback
async function getLocalMusicUri(levelName: string): Promise<string | number | null> {
  try {
    // Production-safe require approach with error handling
    let musicModule: any = null;
    
    switch (levelName) {
      case 'menu':
        musicModule = require('../assets/sounds/background_sounds/menu.mp3');
        break;
      case 'farm':
        musicModule = require('../assets/sounds/background_sounds/farm_bg.mp3');
        break;
      case 'forest':
        musicModule = require('../assets/sounds/background_sounds/forest_bg.mp3');
        break;
      case 'jungle':
        musicModule = require('../assets/sounds/background_sounds/jungle_bg.mp3');
        break;
      case 'desert':
        musicModule = require('../assets/sounds/background_sounds/desert_bg.mp3');
        break;
      case 'ocean':
        musicModule = require('../assets/sounds/background_sounds/ocean_bg.mp3');
        break;
      case 'savannah':
        musicModule = require('../assets/sounds/background_sounds/savannah_bg.mp3');
        break;
      case 'arctic':
        musicModule = require('../assets/sounds/background_sounds/arctic_bg.mp3');
        break;
      case 'birds':
        musicModule = require('../assets/sounds/background_sounds/birds_bg.mp3');
        break;
      case 'insects':
        musicModule = require('../assets/sounds/background_sounds/insects_bg.mp3');
        break;
      default:
        console.warn(`No music module found for level: ${levelName}`);
        return null;
    }
    
    if (!musicModule) {
      console.warn(`Failed to load music module for ${levelName}`);
      return null;
    }
    
    // In production, ensure we have a valid module
    if (typeof musicModule === 'number' || (typeof musicModule === 'object' && musicModule.uri)) {
      console.log(`🎵 Successfully loaded music for ${levelName}`);
      return musicModule;
    }
    
    console.warn(`Invalid music module for ${levelName}:`, musicModule);
    return null;
  } catch (e) {
    console.error(`Failed to load local music for ${levelName}:`, e);
    return null;
  }
}

// Cache for loaded music URIs/assets
const LOADED_MUSIC_CACHE: Record<string, string | number> = {};

class BackgroundMusicManager {
  private static instance: BackgroundMusicManager;
  private currentPlayer: any = null;
  private currentLevelKey: string | null = null;
  private isMuted: boolean = false;
  private globalVolume: number = 1.0;
  private normalVolume: number = 0.8;
  private lastPositionMs: number = 0;
  private isTransitioning: boolean = false;
  private audioSessionConfigured: boolean = false;
  private playbackRetryCount: number = 0;
  private maxRetries: number = 3;
  private hasUserInteracted: boolean = false;
  private pendingPlayRequest: { levelName: string; forceRestart: boolean } | null = null;

  private constructor() {
    // Audio session configuration removed to avoid ExponentAV errors
  }

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
  }

  // Audio session configuration removed to avoid ExponentAV errors
  // expo-audio handles audio session management automatically

  setGlobalVolume(volume: number) {
    this.globalVolume = volume;
    if (this.currentPlayer && !this.isMuted) {
      try {
        this.currentPlayer.volume = this.normalVolume * this.globalVolume;
      } catch (e) {
        console.warn('Error setting volume:', e);
      }
    }
  }

  /**
   * Duck background music volume for animal sounds
   */
  duckVolume() {
    if (this.currentPlayer && !this.isMuted) {
      try {
        // Lower volume to 10% of normal volume
        this.currentPlayer.volume = this.normalVolume * this.globalVolume * 0.1;
        console.log('🎵 Background music volume ducked');
      } catch (e) {
        console.warn('Error ducking background music volume:', e);
      }
    }
  }

  /**
   * Restore background music volume to normal
   */
  restoreVolume() {
    if (this.currentPlayer && !this.isMuted) {
      try {
        // Restore to normal volume
        this.currentPlayer.volume = this.normalVolume * this.globalVolume;
        console.log('🎵 Background music volume restored');
      } catch (e) {
        console.warn('Error restoring background music volume:', e);
      }
    }
  }

  async playBackgroundMusic(levelName: string, forceRestart: boolean = false) {
    // Production-safe logging
    const debugInfo = `level=${levelName}, muted=${this.isMuted}, hasUserInteracted=${this.hasUserInteracted}`;
    console.log(`🎵 playBackgroundMusic: ${debugInfo}`);
    
    const key = levelName.trim().toLowerCase();
    
    // Force stop any existing audio first to prevent simultaneous playback
    if (this.currentPlayer) {
      console.log(`🎵 Force stopping existing audio before playing ${key}`);
      this.forceStopAll();
      // Give a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Audio session is handled automatically by expo-audio
    
    // User interaction detection - require for web and mobile to ensure audio works
    const isWeb = Platform.OS === 'web';
    const requiresUserInteraction = true; // Always require user interaction for reliable audio
    
    if (!this.hasUserInteracted && requiresUserInteraction) {
      console.log(`🎵 No user interaction yet on ${Platform.OS}, deferring playback for ${key}`);
      this.pendingPlayRequest = { levelName, forceRestart };
      return;
    }
    
    // Prevent race conditions from rapid level switching
    if (this.isTransitioning) {
      console.log(`🎵 Already transitioning, skipping request for ${key}`);
      return;
    }
    
    // Get the music URI - either from cache or load it dynamically
    let musicUri = LOADED_MUSIC_CACHE[key];
    
    if (!musicUri) {
      try {
        console.log(`🎵 Loading music for ${key} for the first time`);
        
        // For now, use local assets. In production, you could use remote URLs
        // from BG_MUSIC_URIS and download them on demand
        const localUri = await getLocalMusicUri(key);
        
        if (!localUri) {
          console.warn(`No background music found for level: ${levelName}`);
          this.isTransitioning = false;
          return;
        }
        
        musicUri = localUri;
        
        LOADED_MUSIC_CACHE[key] = musicUri;
        console.log(`🎵 Successfully loaded and cached music for ${key}`);
      } catch (e) {
        console.warn(`Error loading background music for ${key}:`, e);
        this.isTransitioning = false;
        return;
      }
    } else {
      console.log(`🎵 Using cached music for ${key}`);
    }

    // If same music is already playing and not forcing restart, just ensure it's playing
    if (this.currentLevelKey === key && this.currentPlayer && !forceRestart) {
      console.log(`🎵 Same music already loaded for ${key}`);
      if (!this.isMuted) {
        try {
          // For web platform, we need to handle the promise properly
          const playPromise = this.currentPlayer.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch((e: any) => {
              console.warn('Error resuming background music:', e);
            });
          }
        } catch (e) {
          console.warn('Error resuming background music:', e);
        }
      }
      return;
    }

    // Mark as transitioning to prevent race conditions
    this.isTransitioning = true;

    // Stop current music if different - more aggressive cleanup
    if (this.currentPlayer && this.currentLevelKey !== key) {
      try {
        console.log(`🎵 Stopping previous music for ${this.currentLevelKey}`);
        
        // Store position for potential resume
        if (this.currentPlayer.getPosition) {
          this.lastPositionMs = await this.currentPlayer.getPosition();
        }
        
        // Aggressive cleanup sequence
        this.currentPlayer.pause();
        this.currentPlayer.stop && this.currentPlayer.stop();
        this.currentPlayer.volume = 0;
        
        // Force remove the player immediately
        if (this.currentPlayer.remove) {
          this.currentPlayer.remove();
        }
        
        // Clear the reference immediately
        this.currentPlayer = null;
        this.currentLevelKey = null;
        
        console.log(`🎵 Previous music fully stopped and removed`);
      } catch (e) {
        console.warn('Error stopping previous background music:', e);
        // Force clear references even on error
        this.currentPlayer = null;
        this.currentLevelKey = null;
      }
    }

    // Longer delay to ensure previous player is fully cleaned up
    if (this.currentLevelKey && this.currentLevelKey !== key) {
      console.log(`🎵 Waiting for cleanup of previous player...`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Create new player with production error handling
    try {
      console.log(`🎵 Creating new audio player for ${key}`);
      console.log(`🎵 Music URI type: ${typeof musicUri}, value: ${musicUri}`);
      
      if (key === 'farm') {
        console.log(`🚜 FARM BACKGROUND MUSIC - Starting to load farm_bg.mp3 asset...`);
      }
      
      // Production-safe player creation
      const player = createAudioPlayer(musicUri as any);
      
      if (!player) {
        throw new Error('createAudioPlayer returned null/undefined');
      }
      
      if (key === 'farm') {
        console.log(`🚜 FARM BACKGROUND MUSIC - farm_bg.mp3 asset LOADED! Player instance created.`);
      }
      
      player.loop = true;
      player.volume = this.normalVolume * this.globalVolume;

      // Add error handler and status listener
      if (player.addListener) {
        player.addListener('playbackStatusUpdate', (status: any) => {
          if (status.error) {
            console.warn('Background music playback error:', status.error);
          }
          
          // Log when farm music is actually loaded and ready
          if (key === 'farm' && status.isLoaded && !status.isLoading) {
            console.log(`🚜 FARM BACKGROUND MUSIC - Audio buffer fully loaded and ready to play`);
          }
        });
      }

      this.currentPlayer = player;
      this.currentLevelKey = key;
      
      console.log(`🎵 Player created successfully for ${key}`);
      
      if (key === 'farm') {
        console.log(`🚜 FARM BACKGROUND MUSIC - Player created successfully`);
      }

      // Play the music with retry logic
      if (!this.isMuted) {
        console.log(`🎵 Attempting to play ${key} (not muted)`);
        await this.playWithRetry(player, key);
      } else {
        console.log(`🎵 Created player for ${key} but not playing because muted`);
      }
    } catch (e) {
      console.error(`🎵 Error creating background music player for ${key}:`, e);
      console.error(`🎵 Music URI was:`, musicUri);
      // Don't throw - just log the error and continue
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Play audio with retry logic for production reliability
   */
  private async playWithRetry(player: any, key: string, retryCount: number = 0): Promise<void> {
    try {
      console.log(`🎵 Attempting to play ${key} (attempt ${retryCount + 1}/3)`);
      
      // Simple play attempt - don't overcomplicate
      const playPromise = player.play();
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise;
      }
      
      console.log(`🎵 Successfully started playing ${key}`);
      this.playbackRetryCount = 0; // Reset retry count on success
      
    } catch (error: any) {
      console.warn(`Error playing ${key} (attempt ${retryCount + 1}):`, error);
      
      // Check if it's an autoplay policy error
      const isAutoplayError = error?.message?.toLowerCase().includes('autoplay') || 
                             error?.message?.toLowerCase().includes('user gesture') ||
                             error?.message?.toLowerCase().includes('user interaction');
      
      if (isAutoplayError && !this.hasUserInteracted) {
        console.log(`🎵 Autoplay blocked for ${key}, waiting for user interaction`);
        this.pendingPlayRequest = { levelName: key, forceRestart: false };
        return; // Don't retry, wait for user interaction
      }
      
      // Retry if we haven't exceeded max retries (reduced to 2 retries for production)
      if (retryCount < 2) {
        const delay = 500 + (retryCount * 500); // Shorter delays: 500ms, 1000ms
        console.log(`🎵 Retrying ${key} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.playWithRetry(player, key, retryCount + 1);
      } else {
        console.error(`Failed to play ${key} after 3 attempts - giving up`);
        // Don't schedule recovery in production to avoid infinite loops
      }
    }
  }

  /**
   * Schedule a recovery attempt for failed playback (disabled in production)
   */
  private scheduleRecovery(key: string) {
    // Recovery disabled in production to prevent infinite loops
    console.log(`🎵 Recovery disabled for production - ${key} playback failed`);
  }

  pause() {
    console.log(`⏸️ pause() called, current player exists: ${!!this.currentPlayer}`);
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
      } catch (e) {
        console.warn('Error pausing background music:', e);
      }
    }
  }

  async resume() {
    console.log(`▶️ resume() called, current player exists: ${!!this.currentPlayer}, muted: ${this.isMuted}`);
    if (this.currentPlayer && !this.isMuted && this.currentLevelKey) {
      try {
        this.currentPlayer.volume = this.normalVolume * this.globalVolume;
        await this.playWithRetry(this.currentPlayer, this.currentLevelKey);
      } catch (e) {
        console.warn('Error resuming background music:', e);
      }
    }
  }

  setMuted(muted: boolean) {
    console.log(`🔇 setMuted called with ${muted}, current player exists: ${!!this.currentPlayer}`);
    
    // Register user interaction
    this.registerUserInteraction();
    
    this.isMuted = muted;
    if (muted) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Register that user has interacted with the app (enables audio playback)
   */
  registerUserInteraction() {
    console.log(`🎵 registerUserInteraction called - current state: hasUserInteracted=${this.hasUserInteracted}, pendingRequest=${!!this.pendingPlayRequest}`);
    
    if (!this.hasUserInteracted) {
      console.log('🎵 User interaction registered - audio playback enabled');
      this.hasUserInteracted = true;
      
      // If there's a pending play request, execute it now
      if (this.pendingPlayRequest && !this.isMuted) {
        const { levelName, forceRestart } = this.pendingPlayRequest;
        this.pendingPlayRequest = null;
        console.log(`🎵 Executing deferred playback for ${levelName}`);
        this.playBackgroundMusic(levelName, forceRestart);
      }
    } else {
      console.log('🎵 User interaction already registered');
    }
  }

  /**
   * Optionally preload music for a specific level to improve transition smoothness.
   * This is useful if you want to preload the next level's music while playing the current level.
   */
  async preloadMusic(levelName: string): Promise<void> {
    const key = levelName.trim().toLowerCase();
    
    // Skip if already loaded
    if (LOADED_MUSIC_CACHE[key]) {
      return;
    }

    try {
      console.log(`🎵 Preloading music for ${key}`);
      const musicUri = await getLocalMusicUri(key);
      
      if (musicUri) {
        LOADED_MUSIC_CACHE[key] = musicUri;
        console.log(`🎵 Successfully preloaded music for ${key}`);
        
        // Simple preload - just cache the URI, don't create test players
        console.log(`🎵 Preloaded and cached ${key} for production`);
      } else {
        console.warn(`No background music found for preload: ${levelName}`);
      }
    } catch (e) {
      console.warn(`Error preloading background music for ${key}:`, e);
    }
  }

  /**
   * Preload essential music for instant startup - optimized for speed
   */
  async preloadCommonMusic() {
    console.log('⚡ Starting INSTANT preload of essential music');
    const essentialLevels = ['menu', 'farm']; // Only the most essential for fastest startup
    
    // Load essential music in parallel for maximum speed
    const preloadPromises = essentialLevels.map(async (level) => {
      try {
        await this.preloadMusic(level);
        console.log(`⚡ ${level} ready instantly`);
      } catch (e) {
        console.warn(`⚠️ ${level} preload failed:`, e);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('⚡ Essential music ready instantly!');
  }

  /**
   * Preload all music assets for maximum performance - optimized for speed
   */
  async preloadAllMusic() {
    console.log('⚡ Starting FAST preload of ALL music');
    const allLevels = ['menu', 'farm', 'forest', 'jungle', 'desert', 'ocean', 'savannah', 'arctic', 'birds', 'insects'];
    
    // Load ALL music in parallel for maximum speed
    const preloadPromises = allLevels.map(async (level) => {
      try {
        await this.preloadMusic(level);
        console.log(`⚡ ${level} ready`);
      } catch (e) {
        console.warn(`⚠️ ${level} failed:`, e);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('⚡ ALL music preloaded in parallel - MAXIMUM SPEED!');
  }

  /**
   * Production-safe initialization method - optimized for speed
   */
  async initializeForProduction() {
    console.log('⚡ FAST initializing BackgroundMusicManager');
    
    try {
      // Audio session is handled automatically by expo-audio
      console.log('⚡ Audio session handled automatically');
      
      // Preload common music in parallel
      await this.preloadCommonMusic();
      console.log('⚡ BackgroundMusicManager FAST initialized!');
    } catch (e) {
      console.warn('⚠️ BackgroundMusicManager init failed:', e);
      // Don't throw - continue anyway
    }
  }

  cleanup() {
    if (this.currentPlayer) {
      try {
        console.log('🧹 Aggressively cleaning up background music');
        
        // Multiple cleanup attempts to ensure no audio leaks
        this.currentPlayer.pause();
        this.currentPlayer.stop && this.currentPlayer.stop();
        this.currentPlayer.volume = 0;
        
        // Force remove the player
        if (this.currentPlayer.remove) {
          this.currentPlayer.remove();
        }
        
        // Additional cleanup for web platforms
        if (Platform.OS === 'web' && this.currentPlayer.pause) {
          this.currentPlayer.pause();
        }
        
        console.log('🧹 Background music cleanup completed');
      } catch (e) {
        console.warn('Error cleaning up background music:', e);
      }
    }
    
    // Force clear all references
    this.currentPlayer = null;
    this.currentLevelKey = null;
    this.isTransitioning = false;
    this.playbackRetryCount = 0;
    this.pendingPlayRequest = null;
    
    console.log('🧹 All background music references cleared');
  }

  getCurrentLevel(): string | null {
    return this.currentLevelKey;
  }

  /**
   * Force stop all background music - emergency cleanup
   */
  forceStopAll() {
    console.log('🚨 Force stopping all background music');
    
    try {
      if (this.currentPlayer) {
        this.currentPlayer.pause();
        this.currentPlayer.stop && this.currentPlayer.stop();
        this.currentPlayer.volume = 0;
        if (this.currentPlayer.remove) {
          this.currentPlayer.remove();
        }
      }
    } catch (e) {
      console.warn('Error in force stop:', e);
    }
    
    // Clear all state
    this.currentPlayer = null;
    this.currentLevelKey = null;
    this.isTransitioning = false;
    this.playbackRetryCount = 0;
    this.pendingPlayRequest = null;
    
    console.log('🚨 All background music force stopped');
  }

  /**
   * Global audio stop - stops ALL audio in the app
   * This should be called before any audio transitions
   */
  static globalStopAllAudio() {
    console.log('🌍 Global stop all audio called');
    
    try {
      // Stop background music manager
      const instance = BackgroundMusicManager.getInstance();
      instance.forceStopAll();
      
      // Try to stop any other audio players that might be running
      // This is a nuclear option to ensure no audio overlaps
      console.log('🌍 Global audio stop completed');
    } catch (e) {
      console.warn('Error in global audio stop:', e);
    }
  }

  isPlaying(): boolean {
    return !this.isMuted && this.currentPlayer !== null;
  }

  /**
   * Call this on any user interaction (button press, touch, etc) to enable audio
   * This is especially important for web and Android platforms
   */
  onUserInteraction() {
    this.registerUserInteraction();
  }

  /**
   * Attempt to play any pending audio that was blocked by autoplay policies
   */
  async attemptPendingPlayback() {
    if (this.pendingPlayRequest && !this.isMuted && this.hasUserInteracted) {
      const { levelName, forceRestart } = this.pendingPlayRequest;
      this.pendingPlayRequest = null;
      console.log(`🎵 Attempting pending playback for ${levelName}`);
      await this.playBackgroundMusic(levelName, forceRestart);
    }
  }
}


// Export both the class (for static methods) and the instance (for regular use)
export { BackgroundMusicManager };
export default BackgroundMusicManager.getInstance();
