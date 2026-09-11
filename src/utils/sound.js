// Dynamic Audio Ringtone & Notification Chime Synthesizer
// Uses the Web Audio API for zero-latency, cross-browser, failure-proof chime playback.

class NotificationAudio {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  /**
   * Play notification ringtone chime
   * @param {'crystal' | 'marimba' | 'urgent'} type
   */
  play(type = 'crystal') {
    // Check if user disabled sound in settings
    const soundEnabled = localStorage.getItem('notification_sound_enabled') !== 'false';
    if (!soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const volumeLevel = parseFloat(localStorage.getItem('notification_sound_volume') || '0.25');

      if (type === 'crystal') {
        // High-fidelity ascending dual bell (C6: 1046.5Hz -> G6: 1567.9Hz)
        this._synthesizeTone(ctx, 1046.5, now, 0.35, volumeLevel);
        this._synthesizeTone(ctx, 1567.9, now + 0.12, 0.45, volumeLevel * 1.1);
      } else if (type === 'marimba') {
        // Melodic triple chime (E5 -> G5 -> C6)
        this._synthesizeTone(ctx, 659.25, now, 0.2, volumeLevel * 0.9);
        this._synthesizeTone(ctx, 783.99, now + 0.1, 0.2, volumeLevel * 0.9);
        this._synthesizeTone(ctx, 1046.5, now + 0.2, 0.35, volumeLevel);
      } else if (type === 'urgent') {
        // Double alert ping (A5 -> A5)
        this._synthesizeTone(ctx, 880, now, 0.12, volumeLevel * 1.2);
        this._synthesizeTone(ctx, 880, now + 0.15, 0.22, volumeLevel * 1.2);
      } else {
        // Default dual tone
        this._synthesizeTone(ctx, 587.33, now, 0.3, volumeLevel);
        this._synthesizeTone(ctx, 880, now + 0.12, 0.4, volumeLevel);
      }
    } catch (err) {
      console.warn('Could not play notification sound:', err);
    }
  }

  _synthesizeTone(ctx, frequency, startTime, duration, maxVolume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Smooth ADSR envelope to avoid clicking sounds
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxVolume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export const notificationAudio = new NotificationAudio();

export function playNotificationSound(type = 'crystal') {
  notificationAudio.play(type);
}

export function isSoundEnabled() {
  return localStorage.getItem('notification_sound_enabled') !== 'false';
}

export function setSoundEnabled(enabled) {
  localStorage.setItem('notification_sound_enabled', enabled ? 'true' : 'false');
}

export default notificationAudio;
