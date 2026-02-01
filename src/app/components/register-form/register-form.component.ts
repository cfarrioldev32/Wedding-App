import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TravelHeroAnimationComponent } from './travel-hero-animation/travel-hero-animation.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, TravelHeroAnimationComponent],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  registroForm: FormGroup;
  sellando: boolean = false;
  sellado: boolean = false;
  debugAnchors = false;

  @ViewChild('anchorAr', { static: true }) anchorArRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('anchorEs', { static: true }) anchorEsRef!: ElementRef<HTMLSpanElement>;

  constructor(private fb: FormBuilder, private readonly router: Router) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pais: ['', Validators.required]
    });
  }

  registrar(): void {
    if (this.registroForm.valid) {
      this.router.navigateByUrl('/stepper').catch((error) => {
        console.error('Navigation failed', error);
      });
    }
  }
}
