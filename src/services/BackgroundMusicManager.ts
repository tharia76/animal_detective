import { createAudioPlayer } from 'expo-audio';

/**
 * BackgroundMusicManager uses lazy loading to reduce initial app load time.
 * Music files are only loaded when first requested, not all at once on app start.
 * This improves memory usage and startup performance.
 */

// Map levelName to bg music asset path - lazy loaded when needed
const BG_MUSIC_PATHS: Record<string, string> = {
  farm: '../assets/sounds/background_sounds/farm_bg.mp3',
  forest: '../assets/sounds/background_sounds/forest_bg.mp3',
  jungle: '../assets/sounds/background_sounds/jungle_bg.mp3',
  desert: '../assets/sounds/background_sounds/desert_bg.mp3',
  ocean: '../assets/sounds/background_sounds/ocean_bg.mp3',
  savannah: '../assets/sounds/background_sounds/savannah_bg.mp3',
  arctic: '../assets/sounds/background_sounds/arctic_bg.mp3',
  birds: '../assets/sounds/background_sounds/birds_bg.mp3',
  insects: '../assets/sounds/background_sounds/insects_bg.mp3',
};

// Cache for loaded music assets
const LOADED_MUSIC_CACHE: Record<string, any> = {};

class BackgroundMusicManager {
  private static instance: BackgroundMusicManager;
  private currentPlayer: any = null;
  private currentLevelKey: string | null = null;
  private isMuted: boolean = false;
  private globalVolume: number = 1.0;
  private normalVolume: number = 0.8;
  private lastPositionMs: number = 0;
  private isTransitioning: boolean = false;

  private constructor() {}

  static getInstance(): BackgroundMusicManager {
    if (!BackgroundMusicManager.instance) {
      BackgroundMusicManager.instance = new BackgroundMusicManager();
    }
    return BackgroundMusicManager.instance;
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
    console.log(`🎵 playBackgroundMusic called for ${levelName}, muted: ${this.isMuted}`);
    const key = levelName.trim().toLowerCase();
    
    // Prevent race conditions from rapid level switching
    if (this.isTransitioning) {
      console.log(`🎵 Already transitioning, skipping request for ${key}`);
      return;
    }
    
    // Check if we have a path for this level
    const musicPath = BG_MUSIC_PATHS[key];
    if (!musicPath) {
      console.warn(`No background music path found for level: ${levelName}`);
      return;
    }

    // Lazy load the music asset if not already cached
    let source = LOADED_MUSIC_CACHE[key];
    if (!source) {
      try {
        console.log(`🎵 Lazy loading music for ${key} for the first time`);
        // Use dynamic require to load only when needed
        switch (key) {
          case 'farm':
            source = require('../assets/sounds/background_sounds/farm_bg.mp3');
            break;
          case 'forest':
            source = require('../assets/sounds/background_sounds/forest_bg.mp3');
            break;
          case 'jungle':
            source = require('../assets/sounds/background_sounds/jungle_bg.mp3');
            break;
          case 'desert':
            source = require('../assets/sounds/background_sounds/desert_bg.mp3');
            break;
          case 'ocean':
            source = require('../assets/sounds/background_sounds/ocean_bg.mp3');
            break;
          case 'savannah':
            source = require('../assets/sounds/background_sounds/savannah_bg.mp3');
            break;
          case 'arctic':
            source = require('../assets/sounds/background_sounds/arctic_bg.mp3');
            break;
          case 'birds':
            source = require('../assets/sounds/background_sounds/birds_bg.mp3');
            break;
          case 'insects':
            source = require('../assets/sounds/background_sounds/insects_bg.mp3');
            break;
        }
        
        if (source) {
          LOADED_MUSIC_CACHE[key] = source;
          console.log(`🎵 Successfully cached music for ${key}`);
        }
      } catch (e) {
        console.warn(`Error loading background music for ${key}:`, e);
        return;
      }
    }

    if (!source) {
      console.warn(`Failed to load background music for level: ${levelName}`);
      return;
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
      
      const player = createAudioPlayer(source);
      
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

      // Always try to play if not muted (don't check internal state during creation)
      if (!this.isMuted) {
        // For web platform, handle autoplay policies
        try {
          console.log(`🎵 Starting playback for ${key}`);
          if (key === 'farm') {
            console.log(`🚜 FARM BACKGROUND MUSIC - Attempting to play farm_bg.mp3`);
          }
          player.play();
          console.log(`🎵 Successfully started playing ${key}`);
          if (key === 'farm') {
            console.log(`🚜 FARM BACKGROUND MUSIC - farm_bg.mp3 is now playing!`);
          }
        } catch (e) {
          console.warn('Error playing background music:', e);
        }
      } else {
        console.log(`🎵 Created player for ${key} but not playing because muted`);
      }
    } catch (e) {
      console.warn('Error creating background music player:', e);
    } finally {
      this.isTransitioning = false;
    }
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

  resume() {
    console.log(`▶️ resume() called, current player exists: ${!!this.currentPlayer}, muted: ${this.isMuted}`);
    if (this.currentPlayer && !this.isMuted) {
      try {
        this.currentPlayer.volume = this.normalVolume * this.globalVolume;
        const playPromise = this.currentPlayer.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              console.log(`▶️ Successfully resumed playback`);
            })
            .catch((e: any) => {
              console.warn('Error resuming background music:', e);
            });
        }
      } catch (e) {
        console.warn('Error resuming background music:', e);
      }
    }
  }

  setMuted(muted: boolean) {
    console.log(`🔇 setMuted called with ${muted}, current player exists: ${!!this.currentPlayer}`);
    this.isMuted = muted;
    if (muted) {
      this.pause();
    } else {
      this.resume();
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

    // Check if we have a path for this level
    if (!BG_MUSIC_PATHS[key]) {
      console.warn(`No background music path found for preload: ${levelName}`);
      return;
    }

    try {
      console.log(`🎵 Preloading music for ${key}`);
      let source;
      
      switch (key) {
        case 'farm':
          source = require('../assets/sounds/background_sounds/farm_bg.mp3');
          break;
        case 'forest':
          source = require('../assets/sounds/background_sounds/forest_bg.mp3');
          break;
        case 'jungle':
          source = require('../assets/sounds/background_sounds/jungle_bg.mp3');
          break;
        case 'desert':
          source = require('../assets/sounds/background_sounds/desert_bg.mp3');
          break;
        case 'ocean':
          source = require('../assets/sounds/background_sounds/ocean_bg.mp3');
          break;
        case 'savannah':
          source = require('../assets/sounds/background_sounds/savannah_bg.mp3');
          break;
        case 'arctic':
          source = require('../assets/sounds/background_sounds/arctic_bg.mp3');
          break;
        case 'birds':
          source = require('../assets/sounds/background_sounds/birds_bg.mp3');
          break;
        case 'insects':
          source = require('../assets/sounds/background_sounds/insects_bg.mp3');
          break;
      }
      
      if (source) {
        LOADED_MUSIC_CACHE[key] = source;
        console.log(`🎵 Successfully preloaded music for ${key}`);
      }
    } catch (e) {
      console.warn(`Error preloading background music for ${key}:`, e);
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
}

export default BackgroundMusicManager.getInstance();
