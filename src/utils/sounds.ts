/**
 * Sound Manager for thematic wasteland UI sounds
 * Uses AudioContext to generate retro-futuristic synth sounds without external assets
 */

class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // UI Interaction: Short, sharp "click"
  playClick() {
    this.playTone(800, 0.05, 'square', 0.05);
  }

  // Correct Answer: Upward "blip-blip"
  playCorrect() {
    this.playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(900, 0.15, 'sine', 0.1), 50);
  }

  // Incorrect Answer: Downward "buzz"
  playIncorrect() {
    this.playTone(200, 0.3, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.1), 100);
  }

  // Level Up: Fanfare-like sequence
  playLevelUp() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.1), i * 150);
    });
  }

  // Perk/Skill Toggle: Mechanical "clink"
  playToggle() {
    this.playTone(1200, 0.03, 'square', 0.03);
  }
}

export const sounds = new SoundManager();
