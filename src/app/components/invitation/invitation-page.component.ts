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
  readonly ceremonyPlace = '<NOMBRE LUGAR>';
  readonly ceremonyAddress = '<DIRECCION>';
  readonly ceremonyCity = '<CIUDAD>';
  readonly mapUrl = ''; // TODO: Agregar link real de Google Maps.
}
