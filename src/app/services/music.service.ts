import { Injectable } from '@angular/core';

const MUSIC_ENABLED_KEY = 'music_enabled';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement | null = null;
  private playing = false;

  init(src: string, volume = 0.3): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.audio) {
      this.audio = new Audio(src);
      this.audio.preload = 'auto';
      this.audio.loop = true;
      this.audio.volume = volume;
      this.audio.addEventListener('play', () => {
        this.playing = true;
        this.saveEnabled(true);
      });
      this.audio.addEventListener('pause', () => {
        this.playing = false;
        this.saveEnabled(false);
      });
    }
  }

  play(): Promise<boolean> {
    if (!this.audio) {
      return Promise.resolve(false);
    }

    return this.audio
      .play()
      .then(() => {
        this.playing = true;
        this.saveEnabled(true);
        return true;
      })
      .catch(() => {
        this.playing = false;
        return false;
      });
  }

  pause(): void {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this.playing = false;
    this.saveEnabled(false);
  }

  toggle(): void {
    if (this.playing) {
      this.pause();
    } else {
      void this.play();
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getEnabledPreference(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    const stored = localStorage.getItem(MUSIC_ENABLED_KEY);
    if (stored === null) {
      return true;
    }

    return stored === 'true';
  }

  private saveEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled));
  }
}
