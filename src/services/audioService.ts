
export enum SoundEffect {
  CLICK = '/audio/sfx/ui_click.wav',
  SUCCESS = '/audio/sfx/ui_success.wav',
  LEVEL_UP = '/audio/sfx/ui_levelup.wav',
  XP_GAIN = '/audio/sfx/ui_xp.wav',
  CARD_FLIP = '/audio/sfx/ui_card_flip.wav',
  NOTIFICATION = '/audio/sfx/ui_notification.wav',
  ERROR = '/audio/sfx/ui_error.wav',
  STIMPAK = '/audio/sfx/ui_stimpak.wav',
  EAT = '/audio/sfx/ui_eat.wav',
  DRINK = '/audio/sfx/ui_drink.wav',
  HURT = '/audio/sfx/ui_hurt.wav',
  COLLECT = '/audio/sfx/ui_collect.wav',
  CHECK = '/audio/sfx/ui_success.wav',
  REMOVE = '/audio/sfx/ui_click.wav',
}

export enum AmbientSound {
  RAIN = 'https://assets.mixkit.co/active_storage/sfx/2507/2507-preview.mp3', // Soft rain
  WIND = 'https://assets.mixkit.co/active_storage/sfx/2513/2513-preview.mp3', // Blowy wind
  THUNDER = 'https://assets.mixkit.co/active_storage/sfx/2508/2508-preview.mp3',
  STORM = 'https://assets.mixkit.co/active_storage/sfx/2514/2514-preview.mp3',
}

class AudioService {
  private static instance: AudioService;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private ambientAudio: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private currentAmbient: AmbientSound | null = null;

  private constructor() {
    const soundEnabled = localStorage.getItem('soundEnabled');
    this.enabled = soundEnabled !== 'false';
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
    if (!enabled && this.ambientAudio) {
      this.ambientAudio.pause();
    } else if (enabled && this.ambientAudio && this.currentAmbient) {
      this.ambientAudio.play().catch(() => {});
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public play(effect: SoundEffect | string) {
    if (!this.enabled) return;

    try {
      let audio = this.audioCache.get(effect);
      if (!audio) {
        audio = new Audio(effect);
        audio.addEventListener('error', (e) => {
          console.warn('Audio file not found or unsupported:', effect);
        }, { once: true });
        this.audioCache.set(effect, audio);
      }
      
      audio.currentTime = 0;
      audio.play().catch(err => {
        if (err.name !== 'NotAllowedError') {
          console.warn('Audio playback failed:', err.name, effect);
        }
      });
    } catch (error) {
      console.warn('Error playing sound effect:', effect, error);
    }
  }

  public playAmbient(ambient: AmbientSound | null) {
    if (!this.enabled) {
      this.currentAmbient = ambient;
      return;
    }

    if (this.currentAmbient === ambient) return;

    if (this.ambientAudio) {
      const fadeOut = setInterval(() => {
        if (this.ambientAudio!.volume > 0.1) {
          this.ambientAudio!.volume -= 0.1;
        } else {
          clearInterval(fadeOut);
          this.ambientAudio!.pause();
          this.startNewAmbient(ambient);
        }
      }, 100);
    } else {
      this.startNewAmbient(ambient);
    }
  }

  private startNewAmbient(ambient: AmbientSound | null) {
    this.currentAmbient = ambient;
    if (!ambient) {
      this.ambientAudio = null;
      return;
    }

    try {
      this.ambientAudio = new Audio(ambient);
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = 0;
      this.ambientAudio.play().then(() => {
        const fadeIn = setInterval(() => {
          if (this.ambientAudio!.volume < 0.3) {
            this.ambientAudio!.volume += 0.05;
          } else {
            clearInterval(fadeIn);
          }
        }, 200);
      }).catch(err => {
        console.warn('Ambient playback failed. User interaction needed.', err);
      });
    } catch (error) {
      console.error('Error playing ambient sound:', error);
    }
  }
}

export const audioService = AudioService.getInstance();
