import { createAudioPlayer, useAudioPlayer, AudioPlayer } from 'expo-audio';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

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

// Production-optimized loading with fallback
async function getLocalMusicUri(levelName: string): Promise<string | number | null> {
  try {
    let module;
    
    // Use a more efficient loading approach in production
    const musicModules: Record<string, any> = {
      farm: () => require('../assets/sounds/background_sounds/farm_bg.mp3'),
      forest: () => require('../assets/sounds/background_sounds/forest_bg.mp3'),
      jungle: () => require('../assets/sounds/background_sounds/jungle_bg.mp3'),
      desert: () => require('../assets/sounds/background_sounds/desert_bg.mp3'),
      ocean: () => require('../assets/sounds/background_sounds/ocean_bg.mp3'),
      savannah: () => require('../assets/sounds/background_sounds/savannah_bg.mp3'),
      arctic: () => require('../assets/sounds/background_sounds/arctic_bg.mp3'),
      birds: () => require('../assets/sounds/background_sounds/birds_bg.mp3'),
      insects: () => require('../assets/sounds/background_sounds/insects_bg.mp3'),
    };
    
    const loader = musicModules[levelName];
    if (loader) {
      module = loader();
    }
    
    if (!module) {
      return null;
    }
    
    // For production, ensure the asset is properly resolved
    if (typeof module === 'number') {
      // This is an asset ID from Metro bundler
      return module;
    } else if (typeof module === 'string') {
      // This is a URI string
      return module;
    } else if (module && module.uri) {
      // This is an asset object
      return module.uri;
    }
    
    return module;
  } catch (e) {
    console.warn(`Failed to load local music for ${levelName}:`, e);
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
    this.configureAudioSession();
  }

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
  }

  /**
   * Configure audio session for reliable playback in production
   */
  private async configureAudioSession() {
    if (this.audioSessionConfigured) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1, // Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
        interruptionModeAndroid: 1, // Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
      });
      
      this.audioSessionConfigured = true;
      console.log('🎵 Audio session configured successfully');
    } catch (error) {
      console.warn('Failed to configure audio session:', error);
    }
  }

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

  async playBackgroundMusic(levelName: string, forceRestart: boolean = false) {
    console.log(`🎵 playBackgroundMusic called for ${levelName}, muted: ${this.isMuted}, hasUserInteracted: ${this.hasUserInteracted}`);
    const key = levelName.trim().toLowerCase();
    
    // Ensure audio session is configured
    await this.configureAudioSession();
    
    // If no user interaction yet on web/Android, save the request for later
    // iOS typically allows audio without user interaction in apps
    const isWeb = Platform.OS === 'web';
    const requiresUserInteraction = isWeb || (Platform.OS === 'android' && !this.audioSessionConfigured);
    
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

    // Stop current music if different
    if (this.currentPlayer && this.currentLevelKey !== key) {
      try {
        console.log(`🎵 Stopping previous music for ${this.currentLevelKey}`);
        // Store position for potential resume
        if (this.currentPlayer.getPosition) {
          this.lastPositionMs = await this.currentPlayer.getPosition();
        }
        
        // Ensure the player is fully stopped
        this.currentPlayer.pause();
        this.currentPlayer.stop && this.currentPlayer.stop();
        
        // Reset volume to 0 to ensure no audio leaks
        this.currentPlayer.volume = 0;
        
        // Always remove the player to prevent multiple tracks playing
        if (this.currentPlayer.remove) {
          this.currentPlayer.remove();
        }
        
        // Clear the reference to help garbage collection
        this.currentPlayer = null;
      } catch (e) {
        console.warn('Error stopping previous background music:', e);
        // Even if there's an error, clear the reference
        this.currentPlayer = null;
      }
    }

    // Small delay to ensure previous player is fully cleaned up
    if (this.currentLevelKey && this.currentLevelKey !== key) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create new player
    try {
      console.log(`🎵 Creating new audio player for ${key}`);
      if (key === 'farm') {
        console.log(`🚜 FARM BACKGROUND MUSIC - Starting to load farm_bg.mp3 asset...`);
      }
      
      const player = createAudioPlayer(musicUri as any);
      
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
      
      if (key === 'farm') {
        console.log(`🚜 FARM BACKGROUND MUSIC - Player created successfully`);
      }

      // Play the music with retry logic
      if (!this.isMuted) {
        await this.playWithRetry(player, key);
      } else {
        console.log(`🎵 Created player for ${key} but not playing because muted`);
      }
    } catch (e) {
      console.warn('Error creating background music player:', e);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Play audio with retry logic for production reliability
   */
  private async playWithRetry(player: any, key: string, retryCount: number = 0): Promise<void> {
    try {
      console.log(`🎵 Attempting to play ${key} (attempt ${retryCount + 1}/${this.maxRetries})`);
      
      // Wait for player to be ready
      if (player.getStatus) {
        const status = await player.getStatus();
        if (!status.isLoaded) {
          console.log(`🎵 Waiting for ${key} to load...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Try to play
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
      
      // Retry if we haven't exceeded max retries
      if (retryCount < this.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        await this.playWithRetry(player, key, retryCount + 1);
      } else {
        console.error(`Failed to play ${key} after ${this.maxRetries} attempts`);
        // Try to recover by recreating the player
        this.scheduleRecovery(key);
      }
    }
  }

  /**
   * Schedule a recovery attempt for failed playback
   */
  private scheduleRecovery(key: string) {
    setTimeout(() => {
      if (this.currentLevelKey === key && !this.isMuted) {
        console.log(`🎵 Attempting recovery for ${key}`);
        this.playBackgroundMusic(key, true);
      }
    }, 5000);
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
        
        // In production, also create a test player to ensure the asset is fully loaded
        if (__DEV__ === false) {
          try {
            const testPlayer = createAudioPlayer(musicUri as any);
            testPlayer.volume = 0;
            // Don't play, just load
            if (testPlayer.remove) {
              setTimeout(() => testPlayer.remove(), 100);
            }
          } catch (e) {
            console.warn(`Preload test player failed for ${key}:`, e);
          }
        }
      } else {
        console.warn(`No background music found for preload: ${levelName}`);
      }
    } catch (e) {
      console.warn(`Error preloading background music for ${key}:`, e);
    }
  }

  /**
   * Preload commonly used music on app startup
   */
  async preloadCommonMusic() {
    const commonLevels = ['menu', 'farm', 'forest']; // Add your most common levels
    for (const level of commonLevels) {
      await this.preloadMusic(level);
    }
  }

  cleanup() {
    if (this.currentPlayer) {
      try {
        console.log('🧹 Cleaning up background music');
        this.currentPlayer.pause();
        this.currentPlayer.stop && this.currentPlayer.stop();
        this.currentPlayer.volume = 0;
        
        // Always remove the player to prevent lingering audio
        if (this.currentPlayer.remove) {
          this.currentPlayer.remove();
        }
      } catch (e) {
        console.warn('Error cleaning up background music:', e);
      }
      this.currentPlayer = null;
      this.currentLevelKey = null;
    }
  }

  getCurrentLevel(): string | null {
    return this.currentLevelKey;
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

export default BackgroundMusicManager.getInstance();
