/**
 * Lumina 24-Hour Cafe - Web Audio API Tactile Feedback Synthesizer
 * Safe, zero-crash luxury tactile audio synthesizer
 * Never throws, completely safe inside sandboxed iframes & restricted WebViews
 */

class AudioFeedbackService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isSupported: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined' || !this.isSupported) return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          this.isSupported = false;
          return null;
        }
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      return this.audioCtx;
    } catch {
      // If browser or iframe permissions disallow AudioContext, fail silently
      this.isSupported = false;
      return null;
    }
  }

  /**
   * Safe initialization - non-intrusive, no global event blocking
   */
  public initGlobalTactileListener(): void {
    // Non-blocking no-op to maintain API compatibility
  }

  /**
   * Plays a subtle, tactile mechanical switch click (simulating luxury haptic switch)
   */
  public playTactileClickSound(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Transient click osc
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.015);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);

      // 2. Micro body thump for tactile depth
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(160, now);
      thump.frequency.exponentialRampToValueAtTime(45, now + 0.025);

      thumpGain.gain.setValueAtTime(0.06, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      thump.start(now);
      thump.stop(now + 0.028);
    } catch {
      // Completely fail-safe
    }
  }

  /**
   * Ascending harmonic chime for 1 to 5 star rating taps
   */
  public playStarSelectSound(starLevel: number): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const pitches = [523.25, 587.33, 659.25, 783.99, 1046.5]; // C5, D5, E5, G5, C6
      const freq = pitches[Math.max(0, Math.min(starLevel - 1, 4))];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Completely fail-safe
    }
  }

  /**
   * Warm double chime on checkout completion and review submission
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // First note (G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Second note (C6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.09);
      gain2.gain.setValueAtTime(0.12, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.35);
    } catch {
      // Completely fail-safe
    }
  }

  /**
   * Subtle low pulse warning sound for errors or blocked actions
   */
  public playErrorSound(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Completely fail-safe
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioFeedbackService = new AudioFeedbackService();
