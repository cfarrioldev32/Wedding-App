import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CountdownComponent } from './invitation-countdown.component';
import { MusicService } from '../../services/music.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-invitation-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink, CountdownComponent, RevealOnScrollDirective],
  templateUrl: './invitation-page.component.html',
  styleUrls: ['./invitation-page.component.scss']
})
export class InvitationPageComponent implements OnInit, AfterViewInit, OnDestroy {
  // TODO: Ajustar fecha real si es necesario.
  readonly targetDate = new Date('2026-10-17T00:00:00');

  readonly CEREMONY_NAME = 'Complejo "El Olivar"';
  readonly CEREMONY_CITY = 'Alcalá de Henares, Madrid';
  readonly ceremonyAddress = 'Cam. el Olivar, 9, 28806 Alcalá de Henares, Madrid'; // TODO: completar dirección exacta.

  readonly GOOGLE_MAPS_URL = 'https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=es&sa=X&geocode=Kcc9HdaHSUINMVWNKrJE-Z1y&daddr=Cam.+el+Olivar,+9,+28806+Alcal%C3%A1+de+Henares,+Madrid'; // TODO: pegar link exacto de Google Maps.

  // TODO: Ejemplo de URL valida: https://www.google.com/maps/place/El+Olivar/@... (usar el link exacto).
  buildGoogleMapsSearchUrl(): string {
    const query = `${this.CEREMONY_NAME} ${this.CEREMONY_CITY}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  get mapsUrl(): string {
    return this.GOOGLE_MAPS_URL || '';
  }

  readonly MAP_WATERMARK_PATH = '/assets/images/mapa-vintage.jpg';
  readonly POSTAL_STAMP_PATH = '/assets/invitation/postal-stamp.svg';

  readonly itinerary = [
    { time: '18:00', label: 'Llegada', icon: 'arrival' },
    { time: '18:30', label: 'Ceremonia', icon: 'rings' },
    { time: '20:00', label: 'Fiesta', icon: 'music' }
  ];

  readonly giftInfo = {
    title: 'Regalo',
    text: 'Vení, festejá y disfrutá. Lo más importante es que nos acompañes en este día tan especial y pasarlo piola. Si además querés ayudarnos en esta aventura ❤️',
    iban: 'ES49 1465 0100 95 1745599215',
  };

  readonly polaroidImages = [
    { file: 'gatitos_1.jpg', alt: 'Recuerdo 1', tilt: '-2deg' },
    { file: 'gatitos_2.jpg', alt: 'Recuerdo 2', tilt: '1.2deg' },
    { file: 'gatitos_3.jpg', alt: 'Recuerdo 3', tilt: '-1.4deg' },
    { file: 'gatitos_4.jpg', alt: 'Recuerdo 4', tilt: '2.1deg' }
  ];

  ibanCopied = false;

  readonly MUSIC_SRC = '/assets/music/invitacion.mp3';
  readonly INTERACTION_KEY = 'hasUserInteracted';
  showMusicButton = false;

  @ViewChild('polaroidTrack') polaroidTrack?: ElementRef<HTMLElement>;
  private autoplayId: number | null = null;
  private autoplayPaused = false;

  constructor(
    private readonly musicService: MusicService,
    private readonly hostRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly documentRef: Document
  ) {}

  ngOnInit(): void {
    this.musicService.init(this.MUSIC_SRC, 0.3);
    this.showMusicButton = true;
    const tryPlay = () => {
      void this.musicService.play();
    };
    void this.musicService.play().catch(() => {
      // Some browsers block autoplay; retry on first user interaction.
      const resume = () => {
        this.documentRef.removeEventListener('pointerdown', resume);
        this.documentRef.removeEventListener('touchstart', resume);
        this.documentRef.removeEventListener('keydown', resume);
        this.documentRef.removeEventListener('scroll', resume);
        this.documentRef.removeEventListener('wheel', resume);
        tryPlay();
      };
      this.documentRef.addEventListener('pointerdown', resume, { once: true });
      this.documentRef.addEventListener('touchstart', resume, { once: true });
      this.documentRef.addEventListener('keydown', resume, { once: true });
      this.documentRef.addEventListener('scroll', resume, { once: true, passive: true });
      this.documentRef.addEventListener('wheel', resume, { once: true, passive: true });
    });
  }
  ngAfterViewInit(): void {
    this.scrollToTop();
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => this.scrollToTop());
    }
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.startPolaroidAutoplay(), 0);
    }
  }
  
  ngOnDestroy(): void {
    this.stopPolaroidAutoplay();
  }

  private scrollToTop(): void {
    const container = this.getScrollContainer();
    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }

  private getScrollContainer(): HTMLElement | null {
    let node: HTMLElement | null = this.hostRef.nativeElement;
    while (node) {
      const styles = getComputedStyle(node);
      const overflowY = styles.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }

    return this.documentRef.scrollingElement instanceof HTMLElement
      ? this.documentRef.scrollingElement
      : null;
  }
  toggleMusic(): void {
    this.musicService.toggle();
  }

  get isMusicPlaying(): boolean {
    return this.musicService.isPlaying();
  }

  get googleCalendarLink(): string {
    const title = 'Boda Cristian & Carmen';
    const location = `${this.CEREMONY_NAME}, ${this.CEREMONY_CITY}`;
    const details = 'Ceremonia y celebraci�n';
    const start = '20261017T180000';
    const end = '20261017T230000';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details,
      location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  scrollPolaroids(direction: -1 | 1): void {
    const track = this.polaroidTrack?.nativeElement;
    if (!track) {
      return;
    }
    const card = track.querySelector<HTMLElement>('.polaroid-card');
    const cardWidth = card ? card.offsetWidth : 260;
    const gap = 16;
    const step = (cardWidth + gap) * direction;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const next = track.scrollLeft + step;
    if (direction > 0 && next > maxScroll + 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    if (direction < 0 && next < -4) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return;
    }
    track.scrollBy({ left: step, behavior: 'smooth' });
  }

  onPolaroidKeydown(event: KeyboardEvent): void {
    this.pausePolaroidAutoplay();
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.scrollPolaroids(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollPolaroids(-1);
    }
  }

  pausePolaroidAutoplay(): void {
    this.autoplayPaused = true;
  }

  resumePolaroidAutoplay(): void {
    this.autoplayPaused = false;
  }

  private startPolaroidAutoplay(): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!this.polaroidTrack?.nativeElement) {
      return;
    }
    if (this.autoplayId !== null) {
      return;
    }
    this.autoplayId = window.setInterval(() => {
      if (this.autoplayPaused) {
        return;
      }
      this.scrollPolaroids(1);
    }, 4500);
  }

  private stopPolaroidAutoplay(): void {
    if (this.autoplayId !== null) {
      window.clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  copyIban(): void {
    const iban = this.giftInfo.iban;
    if (!iban || typeof window === 'undefined') {
      return;
    }

    const finalizeCopy = () => {
      this.ibanCopied = true;
      setTimeout(() => {
        this.ibanCopied = false;
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(iban)
        .then(() => finalizeCopy())
        .catch(() => {
          this.fallbackCopy(iban);
          finalizeCopy();
        });
      return;
    }

    this.fallbackCopy(iban);
    finalizeCopy();
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      // ignore
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
