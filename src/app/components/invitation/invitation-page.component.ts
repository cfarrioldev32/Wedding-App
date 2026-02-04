import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CountdownComponent } from './invitation-countdown.component';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-invitation-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink, CountdownComponent],
  templateUrl: './invitation-page.component.html',
  styleUrls: ['./invitation-page.component.scss']
})
export class InvitationPageComponent implements OnInit {
  // TODO: Ajustar fecha real si es necesario.
  readonly targetDate = new Date('2026-10-17T00:00:00');

  readonly CEREMONY_NAME = 'El Olivar';
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

  readonly dressCode = 'Formal';

  readonly itinerary = [
    { time: '18:00', label: 'Llegada', icon: 'arrival' },
    { time: '18:30', label: 'Ceremonia', icon: 'rings' },
    { time: '20:00', label: 'Fiesta', icon: 'music' }
  ];

  readonly giftInfo = {
    title: 'Regalo',
    text: 'Tu presencia es lo más importante. Si deseas colaborar, aquí va la info:',
    iban: 'ES49 1465 0100 95 1745599215',
  };

  ibanCopied = false;

  readonly MUSIC_SRC = '/assets/music/invitation.mp3';
  readonly INTERACTION_KEY = 'hasUserInteracted';
  showMusicButton = false;

  constructor(private readonly musicService: MusicService) {}

  ngOnInit(): void {
    this.musicService.init(this.MUSIC_SRC, 0.3);
    void this.musicService.play().then(() => {
      this.showMusicButton = true;
    });
    this.showMusicButton = true;
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
    const details = 'Ceremonia y celebración';
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
