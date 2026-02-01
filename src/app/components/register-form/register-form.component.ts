import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { TravelHeroAnimationComponent } from './travel-hero-animation/travel-hero-animation.component';
import { RegistrationServiceFacade } from '../../services/registration/registration-service.facade';
import { getGuestEmail, setGuestSession } from '../../services/session/session-storage';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, RouterModule, TravelHeroAnimationComponent],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {
  registroForm: FormGroup;
  sellando: boolean = false;
  sellado: boolean = false;
  debugAnchors = false;
  isOpening = false;
  isStamping = false;
  private readonly openDurationMs = 950;
  private readonly stampDurationMs = 850;
  private readonly stampReducedMs = 150;
  private readonly reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly existingSessionEmail = getGuestEmail();
  readonly hasExistingSession = Boolean(this.existingSessionEmail);
  existingScoreText = '';
  existingRankingText = '';

  @ViewChild('anchorAr', { static: true }) anchorArRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('anchorEs', { static: true }) anchorEsRef!: ElementRef<HTMLSpanElement>;

  constructor(
    private fb: FormBuilder,
    private readonly router: Router,
    private readonly registrationService: RegistrationServiceFacade
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pais: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.reduceMotion) {
      return;
    }
    this.isOpening = true;
    setTimeout(() => {
      this.isOpening = false;
    }, this.openDurationMs);

    this.loadExistingQuizResult();
  }

  registrar(): void {
    if (this.hasExistingSession) {
      return;
    }
    if (this.registroForm.valid) {
      const formValue = this.registroForm.getRawValue() as {
        nombre: string;
        apellido: string;
        email: string;
        pais: string;
      };

      setGuestSession({
        email: formValue.email.trim(),
        name: `${formValue.nombre.trim()} ${formValue.apellido.trim()}`.trim()
      });

      this.registrationService
        .submitRegistration({
          email: formValue.email.trim(),
          firstName: formValue.nombre.trim(),
          lastName: formValue.apellido.trim(),
          country: formValue.pais.trim()
        })
        .subscribe({
          error: (error) => {
            console.error('Error guardando registro', error);
          }
        });

      if (this.reduceMotion) {
        this.isStamping = true;
        setTimeout(() => {
          this.router.navigateByUrl('/stepper').catch((error) => {
            console.error('Navigation failed', error);
          });
        }, this.stampReducedMs);
        return;
      }

      if (this.isStamping) {
        return;
      }

      this.isStamping = true;
      setTimeout(() => {
        this.router.navigateByUrl('/stepper').catch((error) => {
          console.error('Navigation failed', error);
        });
      }, this.stampDurationMs);
    }
  }

  private loadExistingQuizResult(): void {
    if (!this.hasExistingSession || typeof window === 'undefined') {
      return;
    }

    const stored = localStorage.getItem('wedding-quiz-result');
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        result?: { total: number; max: number; percent: number };
      };
      if (!parsed.result) {
        return;
      }
      const { total, max, percent } = parsed.result;
      this.existingScoreText = `${total} / ${max}`;
      this.existingRankingText = this.getRankingText(percent);
    } catch {
      // ignore invalid storage
    }
  }

  private getRankingText(percent: number): string {
    if (percent < 40) {
      return 'Bien ahí, nos conocés bien 😎';
    }

    if (percent <= 70) {
      return 'Buen nivel';
    }

    return 'Creo que nos conoce más el carnicero de nuestro barrio que vos, pero no importa, te queremos';
  }
}
