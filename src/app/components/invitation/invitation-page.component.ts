import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CountdownComponent } from './invitation-countdown.component';

@Component({
  selector: 'app-invitation-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink, CountdownComponent],
  templateUrl: './invitation-page.component.html',
  styleUrls: ['./invitation-page.component.scss']
})
export class InvitationPageComponent {
  // TODO: Ajustar fecha real si es necesario.
  readonly targetDate = new Date('2026-10-17T00:00:00');

  // TODO: Completar datos reales.
  readonly ceremonyPlace = 'Complejo "El olivar"';
  readonly ceremonyAddress = 'Cam. el Olivar, 9, 28806 Alcalá de Henares, Madrid';

  // TODO: reemplazar por foto real de Cristian y Carmen.
  readonly INVITATION_HERO_IMAGE_URL =
    'https://images.unsplash.com/photo-1719499683843-721331f2495f?auto=format&fit=crop&fm=jpg&q=80&w=1600';

  readonly CEREMONY_NAME = 'El Olivar';
  readonly CEREMONY_CITY = 'Alcalá de Henares, Madrid';
  readonly GOOGLE_MAPS_URL = 'https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg80gEIMTQ0NmowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=es&sa=X&geocode=Kcc9HdaHSUINMVWNKrJE-Z1y&daddr=Cam.+el+Olivar,+9,+28806+Alcal%C3%A1+de+Henares,+Madrid'; // TODO: pegar link exacto de Google Maps.

  // TODO: Ejemplo de URL valida: https://www.google.com/maps/place/El+Olivar/@... (usar el link exacto).
  buildGoogleMapsSearchUrl(): string {
    const query = `${this.CEREMONY_NAME} ${this.CEREMONY_CITY}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  get mapsUrl(): string {
    return this.GOOGLE_MAPS_URL || '';
  }

  heroImageFailed = false;
}
