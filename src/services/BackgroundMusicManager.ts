import { createAudioPlayer } from 'expo-audio';

// Map levelName to bg music asset/uri
const BG_MUSIC_MAP: Record<string, any> = {
  farm: require('../assets/sounds/background_sounds/farm_bg.mp3'),
  forest: require('../assets/sounds/background_sounds/forest_bg.mp3'),
  jungle: require('../assets/sounds/background_sounds/jungle_bg.mp3'),
  desert: require('../assets/sounds/background_sounds/desert_bg.mp3'),
  ocean: require('../assets/sounds/background_sounds/ocean_bg.mp3'),
  savannah: require('../assets/sounds/background_sounds/savannah_bg.mp3'),
  arctic: require('../assets/sounds/background_sounds/arctic_bg.mp3'),
  birds: require('../assets/sounds/background_sounds/birds_bg.mp3'),
  insects: require('../assets/sounds/background_sounds/insects_bg.mp3'),
};

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
    const key = levelName.trim().toLowerCase();
    const source = BG_MUSIC_MAP[key];

    if (!source) {
      console.warn(`No background music found for level: ${levelName}`);
      return;
    }

    // If same music is already playing and not forcing restart, just ensure it's playing
    if (this.currentLevelKey === key && this.currentPlayer && !forceRestart) {
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
        // Store position for potential resume
        if (this.currentPlayer.getPosition) {
          this.lastPositionMs = await this.currentPlayer.getPosition();
        }
        this.currentPlayer.pause();
        
        // On web, we might need to keep the player alive instead of removing it
        // to avoid audio context issues
        if (typeof window === 'undefined') {
          // Native platforms - safe to remove
          this.currentPlayer.remove();
        }
      } catch (e) {
        console.warn('Error stopping previous background music:', e);
      }
    }

    // Create new player
    try {
      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = this.normalVolume * this.globalVolume;

      // Add error handler for web platform
      if (player.addListener) {
        player.addListener('playbackStatusUpdate', (status: any) => {
          if (status.error) {
            console.warn('Background music playback error:', status.error);
          }
        });
      }

      this.currentPlayer = player;
      this.currentLevelKey = key;

      if (!this.isMuted) {
        // For web platform, handle autoplay policies
        try {
          const playPromise = player.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch((e: any) => {
              console.warn('Error playing background music:', e);
              // On web, user interaction might be required
              // Store the player to retry on next user interaction
            });
          }
        } catch (e) {
          console.warn('Error playing background music:', e);
        }
      }
    } catch (e) {
      console.warn('Error creating background music player:', e);
    } finally {
      this.isTransitioning = false;
    }
  }

  pause() {
    this.isMuted = true;
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
      } catch (e) {
        console.warn('Error pausing background music:', e);
      }
    }
  }

  resume() {
    this.isMuted = false;
    if (this.currentPlayer) {
      try {
        this.currentPlayer.volume = this.normalVolume * this.globalVolume;
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
  }

  setMuted(muted: boolean) {
    if (muted) {
      this.pause();
    } else {
      this.resume();
    }
  }

  cleanup() {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
        // Only remove on native platforms
        if (typeof window === 'undefined') {
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
