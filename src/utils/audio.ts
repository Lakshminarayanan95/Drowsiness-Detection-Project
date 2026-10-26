// Web Audio API Sound Synthesizer for Drowsiness Alarm

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private sirenInterval: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public startAlarm(type: 'siren' | 'beep' | 'chime' | 'chime-continuous' = 'siren', volume = 0.8) {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;

    if (type === 'siren') {
      this.playSiren(volume);
    } else if (type === 'beep') {
      this.playBeep(volume);
    } else {
      this.playChime(volume);
    }
  }

  private playSiren(volume: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(volume * 0.3, this.audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    this.oscillator = osc;
    this.gainNode = gain;

    // Siren frequency modulation
    let high = false;
    this.sirenInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.oscillator) return;
      const freq = high ? 600 : 950;
      this.oscillator.frequency.exponentialRampToValueAtTime(freq, this.audioCtx.currentTime + 0.15);
      high = !high;
    }, 200);
  }

  private playBeep(volume: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5

    gain.gain.setValueAtTime(volume * 0.4, this.audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    this.oscillator = osc;
    this.gainNode = gain;

    let on = true;
    this.sirenInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.gainNode) return;
      this.gainNode.gain.setValueAtTime(on ? volume * 0.4 : 0, this.audioCtx.currentTime);
      on = !on;
    }, 150);
  }

  private playChime(volume: number) {
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

    gain.gain.setValueAtTime(volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
    this.isPlaying = false;
  }

  public stopAlarm() {
    if (this.sirenInterval !== null) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // ignore if already stopped
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.gainNode = null;
    }

    this.isPlaying = false;
  }

  public playSingleBeep(volume = 0.5) {
    this.initContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);

    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const soundManager = new SoundManager();
